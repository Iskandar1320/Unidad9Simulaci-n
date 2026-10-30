// Vista conceptual SIN Three.js para revisar la dirección artística desde un archivo local.
const moments = [
 ['LA INVITACIÓN','¿VAS A JUGAR<br><em>A LA RULETA?</em>','Nueve momentos. Nueve preguntas. Ninguna respuesta que alguien pueda elegir por ti.','¿Para qué tomarte el trabajo?','01_Invitacion.png'],
 ['EL VASO','HACER LO MISMO<br><em>QUE LOS DEMÁS.</em>','Un vaso. Una botella. Una escena cotidiana que no parece necesitar explicación.','¿Hacer lo que hacen los demás te parece suficiente?','02_Vaso_y_botella.png'],
 ['SIN CUESTIONAR','ACEPTAR SIN<br><em>PREGUNTAR.</em>','Alguien levanta el vaso. No todo lo que aceptamos pasa primero por nuestra reflexión.','¿La muerte del pensamiento crítico fue culpa de la IA, o fuimos nosotros quienes dejamos de cuestionar?','03_Persona_bebe.png'],
 ['NUESTRO DESTINO','¿QUIÉN TIENE<br><em>EL CONTROL?</em>','Un objeto se vuelve símbolo. La decisión, sin embargo, siempre ha sido nuestra.','¿No somos nosotros quienes estamos a cargo de nuestro destino?','04_Decision.png'],
 ['EL MUNDO','TODO VA<br><em>MÁS RÁPIDO.</em>','La Tierra sigue girando. La tecnología avanza. Nosotros intentamos encontrar nuestro ritmo.','El mundo cambia, las personas siguen iguales, pero todo es más rápido.','05_Mundo.png'],
 ['AFUERA DEL BAR','¿POR QUÉ<br><em>SEGUIRLOS?</em>','En la calle todo continúa. Pero a veces hace falta detenerse para decidir hacia dónde.','Si todo va más rápido, ¿por qué dejamos nuestro destino en manos de lo que digan los demás?','06_Exterior_bar.png'],
 ['EL TAMBOR','¿PERDICIÓN O<br><em>POTENCIAL?</em>','La ruleta gira. La misma herramienta puede abrir posibilidades o convertirse en una excusa para no pensar.','¿La IA es tu perdición o la ayuda que necesitabas para explotar tu potencial?','07_Ruleta.png'],
 ['LA DECISIÓN','¿EL REBAÑO<br><em>O TU CAMINO?</em>','El movimiento se detiene. El siguiente paso ya no depende del ruido de los demás.','¿Vas a seguir al rebaño o vas a tomar las riendas de tu vida?','08_Decision_final.png'],
 ['DEPENDE DE TI','DEPENDE<br><em>DE TI.</em>','Tú tienes el poder de explorar más allá de lo que hace el rebaño. Explota tu creatividad y usa la ayuda de manera consciente.','¿Eres capaz de explotar tu potencial o te vas a dedicar a ser carne de subasta?','09_Reflexion.png']
];
const $=s=>document.querySelector(s);
const scene=$('#scene-container');
scene.style.backgroundSize='cover';scene.style.backgroundPosition='center';
let current=0, busy=false;
const chapters=$('#chapters');
moments.forEach((m,i)=>{
 const b=document.createElement('button');b.className='chapter';b.innerHTML=`<span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span class="chapter-name">${m[0]}</span><span class="chapter-mark">↗</span>`;
 b.addEventListener('click',()=>go(i));chapters.appendChild(b);
});
function apply(i) {
 const m=moments[i];current=i;
 scene.style.backgroundImage=`url("./public/referencias/${m[4]}")`;
 $('#scene-index').textContent=String(i+1).padStart(2,'0');
 $('#scene-label').textContent=`${String(i+1).padStart(2,'0')} / ${m[0]}`;
 $('#scene-title').innerHTML=m[1];$('#scene-description').textContent=m[2];$('#scene-quote').textContent=m[3];
 $('#scene-short-name').textContent=m[0];$('.button-text').textContent=i===0?'COMENZAR':i===8?'VOLVER A EMPEZAR':'CONTINUAR';
 $('#prev-button').disabled=i===0;$('#progress-fill').style.width=`${(i+1)/9*100}%`;
 chapters.querySelectorAll('button').forEach((b,j)=>{b.classList.toggle('is-active',i===j);b.classList.toggle('is-past',j<i);});
}
function go(i) {if(busy||!$('#reference-overlay').hidden)return;i=Math.max(0,Math.min(8,i));if(i===current)return;busy=true;$('#transition-layer').classList.add('is-on');setTimeout(()=>{apply(i);$('#transition-layer').classList.remove('is-on');setTimeout(()=>busy=false,330);},330);}
$('#next-button').addEventListener('click',()=>go(current===8?0:current+1));
$('#prev-button').addEventListener('click',()=>go(current-1));
$('.brand').addEventListener('click',e=>{e.preventDefault();go(0)});
$('#sound-toggle').style.display='none';
function close(){$('#reference-overlay').hidden=true}
$('#reference-button').addEventListener('click',()=>{
 const m=moments[current];$('#reference-image').src=`./public/referencias/${m[4]}`;
 $('#reference-title').textContent=`${String(current+1).padStart(2,'0')} / ${m[0]}`;
 $('#reference-technique').textContent='Imagen original del storyboard. La experiencia 3D se ejecuta desde Vite.';
 $('#reference-overlay').hidden=false;
});
$('#close-reference').addEventListener('click',close);$('#reference-overlay').addEventListener('click',e=>{if(e.target.id==='reference-overlay')close()});
window.addEventListener('keydown',e=>{if(!$('#reference-overlay').hidden){if(e.key==='Escape')close();return;}if(e.key==='ArrowRight')go(current+1);if(e.key==='ArrowLeft')go(current-1);if(/^[1-9]$/.test(e.key))go(Number(e.key)-1)});
apply(0);
