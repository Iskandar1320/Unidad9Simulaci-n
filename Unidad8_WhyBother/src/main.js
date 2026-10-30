import './style.css';
import { Experience } from './experience.js';

// Each moment comes straight from the approved storyboard, with minor edits for screen readability.
const moments = [
  {
    eyebrow:'01 / LA INVITACIÓN', short:'LA INVITACIÓN', title:'¿VAS A JUGAR<br><em>A LA RULETA?</em>',
    description:'Nueve momentos. Nueve preguntas. Ninguna respuesta que alguien pueda elegir por ti.',
    quote:'¿Para qué tomarte el trabajo?', technique:'Cámara interpolada, luz puntual, bar low-poly.',
    image:'01_Invitacion.png', accent:'#e6a260', button:'COMENZAR'
  },
  {
    eyebrow:'02 / LA COSTUMBRE', short:'EL VASO', title:'HACER LO MISMO<br><em>QUE LOS DEMÁS.</em>',
    description:'Un vaso. Una botella. Una escena cotidiana que no parece necesitar explicación.',
    quote:'¿Hacer lo que hacen los demás te parece suficiente?', technique:'Materiales translúcidos, leve oscilación, acercamiento de cámara.',
    image:'02_Vaso_y_botella.png', accent:'#eaa46a', button:'CONTINUAR'
  },
  {
    eyebrow:'03 / LA CONFORMIDAD', short:'SIN CUESTIONAR', title:'ACEPTAR SIN<br><em>PREGUNTAR.</em>',
    description:'Alguien levanta el vaso. No todo lo que aceptamos pasa primero por nuestra reflexión.',
    quote:'¿La muerte del pensamiento crítico fue culpa de la IA, o fuimos nosotros quienes dejamos de cuestionar?', technique:'Figura 3D estilizada; rotación del brazo y del vaso.',
    image:'03_Persona_bebe.png', accent:'#d7a078', button:'CONTINUAR'
  },
  {
    eyebrow:'04 / EL CONTROL', short:'NUESTRO DESTINO', title:'¿QUIÉN TIENE<br><em>EL CONTROL?</em>',
    description:'Un objeto se vuelve símbolo. La decisión, sin embargo, siempre ha sido nuestra.',
    quote:'¿No somos nosotros quienes estamos a cargo de nuestro destino?', technique:'Travelling de cámara, profundidad, contraste en la iluminación.',
    image:'04_Decision.png', accent:'#d4a072', button:'CONTINUAR'
  },
  {
    eyebrow:'05 / LA ACELERACIÓN', short:'EL MUNDO', title:'TODO VA<br><em>MÁS RÁPIDO.</em>',
    description:'La Tierra sigue girando. La tecnología avanza. Nosotros intentamos encontrar nuestro ritmo.',
    quote:'El mundo cambia, las personas siguen iguales, pero todo es más rápido.', technique:'Esfera texturizada, rotación, partículas de estrellas.',
    image:'05_Mundo.png', accent:'#82b9d8', button:'CONTINUAR'
  },
  {
    eyebrow:'06 / LA INFLUENCIA', short:'AFUERA DEL BAR', title:'¿POR QUÉ<br><em>SEGUIRLOS?</em>',
    description:'En la calle todo continúa. Pero a veces hace falta detenerse para decidir hacia dónde.',
    quote:'Si todo va más rápido, ¿por qué dejamos nuestro destino en manos de lo que digan los demás?',
    technique:'Ciudad low-poly, letrero luminoso, partículas de lluvia.',
    image:'06_Exterior_bar.png', accent:'#f07b68', button:'CONTINUAR'
  },
  {
    eyebrow:'07 / LA RULETA', short:'EL TAMBOR', title:'¿PERDICIÓN O<br><em>POTENCIAL?</em>',
    description:'La ruleta gira. La misma herramienta puede abrir posibilidades o convertirse en una excusa para no pensar.',
    quote:'¿La IA es tu perdición o la ayuda que necesitabas para explotar tu potencial?',
    technique:'Geometría estilizada, rotación del tambor, luz focal.',
    image:'07_Ruleta.png', accent:'#ffa47b', button:'CONTINUAR'
  },
  {
    eyebrow:'08 / LA ELECCIÓN', short:'LA DECISIÓN', title:'¿EL REBAÑO<br><em>O TU CAMINO?</em>',
    description:'El movimiento se detiene. El siguiente paso ya no depende del ruido de los demás.',
    quote:'¿Vas a seguir al rebaño o vas a tomar las riendas de tu vida?',
    technique:'Siluetas, pausa dramática, luces cálidas y frías.',
    image:'08_Decision_final.png', accent:'#f08071', button:'VER EL FINAL'
  },
  {
    eyebrow:'09 / LA PREGUNTA ABIERTA', short:'DEPENDE DE TI', title:'DEPENDE<br><em>DE TI.</em>',
    description:'Tú tienes el poder de explorar más allá de lo que hace el rebaño. Explota tu creatividad y usa la ayuda de manera consciente.',
    quote:'¿Eres capaz de explotar tu potencial o te vas a dedicar a ser carne de subasta?',
    technique:'Sistema de partículas con steering; dispersión y reorganización.',
    image:'09_Reflexion.png', accent:'#ffae82', button:'VOLVER A EMPEZAR'
  }
];
const $=selector=>document.querySelector(selector);
const chapters=$('#chapters');
let active=0,changing=false,experience=null,sound=false,audioCtx=null;
const BASE=import.meta.env.BASE_URL;

moments.forEach((m,i)=>{
  const button=document.createElement('button');
  button.type='button';button.className='chapter';button.dataset.index=String(i);
  button.setAttribute('aria-label',`Ir a escena ${i+1}: ${m.short}`);
  button.innerHTML=`<span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span class="chapter-name">${m.short}</span><span class="chapter-mark">↗</span>`;
  button.addEventListener('click',()=>navigate(i));
  chapters.append(button);
});

function playTone(finale=false) {
  if(!sound)return;
  try {
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
    const now=audioCtx.currentTime;
    const osc=audioCtx.createOscillator(),g=audioCtx.createGain();
    osc.type=finale?'sine':'triangle';
    osc.frequency.setValueAtTime(finale?110:220,now);
    osc.frequency.exponentialRampToValueAtTime(finale?48:170,now+.44);
    g.gain.setValueAtTime(.001,now);
    g.gain.exponentialRampToValueAtTime(finale?.14:.038,now+.025);
    g.gain.exponentialRampToValueAtTime(.001,now+.48);
    osc.connect(g);g.connect(audioCtx.destination);osc.start(now);osc.stop(now+.51);
  } catch(err) {console.warn('Audio opcional no disponible',err);}
}
function apply(i) {
  active=i;const m=moments[i];
  $('#scene-index').textContent=String(i+1).padStart(2,'0');
  $('#scene-label').textContent=m.eyebrow;
  $('#scene-title').innerHTML=m.title;
  $('#scene-description').textContent=m.description;
  $('#scene-quote').textContent=m.quote;
  $('#scene-short-name').textContent=m.short;
  $('.button-text').textContent=m.button;
  $('#prev-button').disabled=i===0;
  $('#progress-fill').style.width=`${((i+1)/moments.length)*100}%`;
  document.documentElement.style.setProperty('--accent',m.accent);
  chapters.querySelectorAll('button').forEach((b,j)=>{
    b.classList.toggle('is-active',j===i);
    b.classList.toggle('is-past',j<i);
    if(j===i) b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
  });
  experience?.setScene(i);
  if(i===8) setTimeout(()=>{if(active===8){const flash=$('#ending-flash');flash.classList.remove('burst');void flash.offsetWidth;flash.classList.add('burst');}},1150);
  playTone(i===8);
}
function navigate(to) {
  if(changing || !$('#reference-overlay').hidden)return;
  const next=Math.max(0,Math.min(8,to));
  if(next===active)return;
  changing=true;
  const curtain=$('#transition-layer');
  curtain.classList.add('is-on');
  setTimeout(()=>{
    apply(next);
    setTimeout(()=>{
      curtain.classList.remove('is-on');
      setTimeout(()=>changing=false,380);
    },100);
  },330);
}
$('#next-button').addEventListener('click',()=>navigate(active===8?0:active+1));
$('#prev-button').addEventListener('click',()=>navigate(active-1));
$('.brand').addEventListener('click',e=>{e.preventDefault();navigate(0);});
$('#sound-toggle').addEventListener('click',()=>{
  sound=!sound;$('.sound-label').textContent=`SONIDO: ${sound?'SÍ':'NO'}`;
  $('.sound-icon').textContent=sound?'◖':'◌';
  $('#sound-toggle').setAttribute('aria-pressed',String(sound));
  if(sound)playTone();
});
function openReference() {
  const m=moments[active];
  $('#reference-image').src=`${BASE}referencias/${m.image}`;
  $('#reference-image').alt=`Storyboard de la escena ${active+1}: ${m.short}`;
  $('#reference-title').textContent=`${String(active+1).padStart(2,'0')} / ${m.short}`;
  $('#reference-technique').textContent=m.technique;
  $('#reference-overlay').hidden=false;
  $('#close-reference').focus();
}
function closeReference() {$('#reference-overlay').hidden=true;$('#reference-button').focus();}
$('#reference-button').addEventListener('click',openReference);
$('#close-reference').addEventListener('click',closeReference);
$('#reference-overlay').addEventListener('click',e=>{if(e.target.id==='reference-overlay')closeReference();});
window.addEventListener('keydown',e=>{
  if(!$('#reference-overlay').hidden) {if(e.key==='Escape')closeReference();return;}
  if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)||/^[1-9]$/.test(e.key)) e.preventDefault();
  if(e.key==='ArrowRight')navigate(Math.min(8,active+1));
  if(e.key==='ArrowLeft')navigate(Math.max(0,active-1));
  if(e.key==='Home')navigate(0);
  if(e.key==='End')navigate(8);
  if(/^[1-9]$/.test(e.key))navigate(Number(e.key)-1);
});
try {
  experience=new Experience($('#scene-container'),err=>{
    $('#error-view').hidden=false;
    console.error('Render detenido:',err);
  });
} catch(err) {
  console.error('WebGL no disponible:',err);
  $('#error-view').hidden=false;
}
apply(0);
