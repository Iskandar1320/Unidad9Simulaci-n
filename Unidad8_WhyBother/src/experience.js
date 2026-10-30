import * as THREE from 'three';

// An original, intentionally simplified set of 3D scenes. No external 3D assets.
const TAU = Math.PI * 2;
const ease = (a,b,t) => a + (b-a)*t;
const rnd = (a,b) => a + Math.random()*(b-a);
const gray = 0x161b21;
const amber = 0xe6a260;
const blue = 0x638c9b;

export class Experience {
  constructor(container, onError) {
    this.container = container;
    this.onError = onError;
    this.sceneIndex = 0;
    this.elapsed = 0;
    this.sceneTime = 0;
    this.transitioning = false;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.pointer = new THREE.Vector2(0,0);
    this.camera = new THREE.PerspectiveCamera(42, 1, .1, 250);
    this.camera.position.set(6, 2.5, 9);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d131b);
    this.scene.fog = new THREE.FogExp2(0x0a0f15, .019);
    this.renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.42;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.bar = new THREE.Group();
    this.street = new THREE.Group();
    this.cosmos = new THREE.Group();
    this.ending = new THREE.Group();
    this.scene.add(this.bar, this.street, this.cosmos, this.ending);
    this.scene.add(new THREE.AmbientLight(0x62788d, .52));
    const hemi = new THREE.HemisphereLight(0xa9bfdf, 0x1e140e, .95);
    this.scene.add(hemi);
    this.fillLight = new THREE.DirectionalLight(0xb7cae1, .72);
    this.fillLight.position.set(5,8,6);
    this.scene.add(this.fillLight);
    this.makeBar();
    this.makeEarth();
    this.makeStreet();
    this.makeEnding();
    this.cameras = [
      {p:[5.9,2.9,7.7],t:[0,.05,-.3]},
      {p:[3.8,1.55,4.5],t:[.4,-.1,.0]},
      {p:[3.7,1.9,4.55],t:[.15,.6,-1.45]},
      {p:[.85,1.1,3.75],t:[-1.4,-.08,.45]},
      {p:[0,.45,8.5],t:[0,.02,0]},
      {p:[5.6,2.2,9.3],t:[.15,.35,-1.2]},
      {p:[3.5,1.0,3.4],t:[-.65,-.15,.75]},
      {p:[3.9,1.75,4.9],t:[.15,.85,-1.65]},
      {p:[0,.55,8.8],t:[0,0,0]},
    ];
    this.lookAt = new THREE.Vector3(0,0,0);
    this.setScene(0,true);
    this.resize = this.resize.bind(this);
    this.movePointer = e => {
      this.pointer.x = (e.clientX/window.innerWidth)*2-1;
      this.pointer.y = (e.clientY/window.innerHeight)*2-1;
    };
    window.addEventListener('resize',this.resize);
    window.addEventListener('pointermove',this.movePointer, {passive:true});
    this.resize();
    this.run = this.run.bind(this);
    this.raf = requestAnimationFrame(this.run);
  }

  mat(color, roughness=.62, metalness=.12) {
    return new THREE.MeshStandardMaterial({color,roughness,metalness});
  }
  mesh(geo, material, parent, position=[0,0,0], cast=true) {
    const m = new THREE.Mesh(geo,material);
    m.position.set(...position);
    m.castShadow=cast;
    m.receiveShadow=true;
    parent.add(m);
    return m;
  }
  box(parent, width,height,depth,material,pos) {
    return this.mesh(new THREE.BoxGeometry(width,height,depth),material,parent,pos);
  }
  cyl(parent,rt,rb,h,material,pos,edges=24) {
    return this.mesh(new THREE.CylinderGeometry(rt,rb,h,edges),material,parent,pos);
  }
  ball(parent,r,material,pos,ws=24,hs=16) {
    return this.mesh(new THREE.SphereGeometry(r,ws,hs),material,parent,pos);
  }
  light(parent,color,intensity,distance,pos) {
    const light = new THREE.PointLight(color,intensity,distance,2);
    light.position.set(...pos); parent.add(light); return light;
  }
  lamp(parent,pos) {
    const [x,y,z]=pos;
    const metal=this.mat(0x222229,.5,.78);
    const glow=new THREE.MeshStandardMaterial({color:0xffbf80, emissive:0xf58c38, emissiveIntensity:2.3});
    this.cyl(parent,.035,.035,.85,metal,[x,y+.6,z]);
    this.cyl(parent,.55,.26,.23,metal,[x,y+.13,z]);
    this.cyl(parent,.26,.24,.02,glow,[x,y+.015,z]);
    this.light(parent,0xffa458,5,10,[x,y-.12,z]);
  }
  makeGlass(parent, pos, scale=1) {
    const g=new THREE.Group(); g.position.set(...pos); g.scale.setScalar(scale); parent.add(g);
    const glass = new THREE.MeshPhysicalMaterial({color:0xe8f2f6, transparent:true, opacity:.22, metalness:.02, roughness:.04, side:THREE.DoubleSide, depthWrite:false, transmission:.76, thickness:.42, ior:1.38, clearcoat:1, clearcoatRoughness:.08});
    const drink=new THREE.MeshPhysicalMaterial({color:0xc57a2f, transparent:true,opacity:.84,roughness:.12,metalness:.08, transmission:.26, thickness:.3, clearcoat:.45});
    this.mesh(new THREE.CylinderGeometry(.26,.205,.56,32,1,true),glass,g,[0,.32,0],false);
    this.cyl(g,.235,.2,.03,glass,[0,.055,0]);
    this.cyl(g,.222,.199,.265,drink,[0,.202,0]);
    const rim=this.mesh(new THREE.TorusGeometry(.26,.013,8,32),glass,g,[0,.6,0],false); rim.rotation.x=Math.PI/2;
    this.cyl(g,.225,.225,.01,this.mat(0xf6c170,.22,.2),[0,.333,0]);
    return g;
  }
  makeBottle(parent,pos) {
    const g=new THREE.Group(); g.position.set(...pos); parent.add(g);
    const glass = new THREE.MeshPhysicalMaterial({color:0xd18a3f, transparent:true,opacity:.88,roughness:.14,metalness:.02,transmission:.34, thickness:.38, ior:1.35, clearcoat:.7, clearcoatRoughness:.12});
    const label=this.mat(0xc5ac80,.9,0);
    this.cyl(g,.32,.35,1.13,glass,[0,.63,0],12);
    this.cyl(g,.14,.14,.56,glass,[0,1.42,0],16);
    this.cyl(g,.17,.17,.19,this.mat(0x534331,.9,0),[0,1.8,0]);
    this.box(g,.51,.39,.008,label,[0,.58,.319]);
    const seal=this.mat(0x4b3020,.9,.15);
    this.box(g,.39,.025,.012,seal,[0,.75,.327]);
    this.box(g,.31,.025,.012,seal,[0,.48,.327]);
    return g;
  }
  makeGun(parent) {
    // Stylized geometric silhouette, used purely as a narrative symbol.
    const g=new THREE.Group(); parent.add(g);
    const metal=this.mat(0x363b41,.34,.92);
    const edge=this.mat(0x5d6267,.32,.88);
    const dark=this.mat(0x16191d,.66,.48);
    this.box(g,.9,.23,.32,metal,[-.28,.15,0]);
    this.box(g,.65,.17,.22,edge,[.28,.27,0]);
    const barrel=this.cyl(g,.102,.102,1.23,metal,[.94,.27,0],14); barrel.rotation.z=Math.PI/2;
    const bore=this.cyl(g,.076,.076,.015,dark,[1.555,.27,0],14);bore.rotation.z=Math.PI/2;
    const grip=this.box(g,.32,.76,.27,dark,[-.76,-.31,0]); grip.rotation.z=-.22;
    this.box(g,.28,.13,.35,edge,[-.65,-.05,0]);
    const trigger=this.mesh(new THREE.TorusGeometry(.22,.034,7,19,Math.PI*1.15),metal,g,[-.22,-.12,0]);
    trigger.rotation.y = .08; trigger.rotation.z=.1;
    const drum=new THREE.Group();drum.position.set(0,.2,0); g.add(drum);
    const chamber=this.cyl(drum,.32,.32,.43,edge,[0,0,0],12); chamber.rotation.z=Math.PI/2;
    const ringMat=this.mat(0x131518,.52,.55);
    for(let i=0;i<6;i++) {
      const a=TAU*i/6;
      const y=Math.cos(a)*.207,z=Math.sin(a)*.207;
      const hole=this.cyl(drum,.068,.068,.012,ringMat,[.225,y,z],12); hole.rotation.z=Math.PI/2;
    }
    const highlight=this.cyl(drum,.085,.085,.03,this.mat(0x88724c,.32,.65),[.242,.207,0],12);
    highlight.rotation.z=Math.PI/2;
    g.userData.drum=drum;
    return g;
  }
  makePerson(parent,pos,scale=1) {
    const person=new THREE.Group();person.position.set(...pos);person.scale.setScalar(scale);parent.add(person);
    const shirt=this.mat(0x1d2b39,.94,.02);
    const skin=this.mat(0x797d80,.86,.04);
    const pants=this.mat(0x131921,.94,0);
    const torso=this.ball(person,.64,shirt,[0,.02,0],20,16); torso.scale.set(.96,1.3,.68);
    this.cyl(person,.19,.18,.3,skin,[0,.9,0]);
    this.ball(person,.43,skin,[0,1.42,0],28,20);
    // Slight facial planes, avoiding identifiable features.
    this.box(person,.105,.13,.12,skin,[0,1.38,.434]);
    this.box(person,.3,.04,.1,shirt,[0,1.87,-.02]);
    this.cyl(person,.34,.29,.83,pants,[-.25,-1.05,0],12);
    this.cyl(person,.34,.29,.83,pants,[.25,-1.05,0],12);
    this.cyl(person,.145,.13,1.05,shirt,[.69,-.20,0]);
    const arm = new THREE.Group(); arm.position.set(-.52,.41,.15); person.add(arm);
    const armUpper=this.cyl(arm,.17,.15,.76,shirt,[-.12,-.27,.04],12); armUpper.rotation.z=-.43;
    const forearm=this.cyl(arm,.14,.12,.6,skin,[-.33,-.73,.18],12); forearm.rotation.z=-.4;
    const held=this.makeGlass(arm,[-.43,-.98,.38],.62);
    person.userData.arm=arm;
    person.userData.glass=held;
    return person;
  }
  makeBar() {
    const g=this.bar;
    const wall=this.mat(0x1c222b,.86,.02),floor=this.mat(0x161d26,.78,.08);
    const wood=this.mat(0x5a382d,.58,.18), woodSide=this.mat(0x2d2320,.78,.10);
    const brass=this.mat(0x765540,.31,.83);
    this.box(g,90,.1,90,floor,[0,-2.33,0]);
    this.box(g,24,10,.22,wall,[0,2.14,-6]);
    this.box(g,.2,10,20,wall,[-11,2,0]);
    for(let i=0;i<9;i++) {
      this.box(g,.08,4,.12,woodSide,[-8.2+i*2.05,.1,-5.78]);
      this.box(g,.08,4,.12,woodSide,[-8.2+i*2.05,.1,-5.63]);
    }
    for(let y=-.2;y<3.6;y+=1.05) {
      this.box(g,12,.1,.62,wood,[0,y,-5.45]);
      for(let i=0;i<12;i++) {
        const bottle=this.cyl(g,.09,.13,.5,this.mat(i%3===0?0x74513c:0x344852,.29,.34),[-5.25+i*.94,y+.32,-5.42],8);
        bottle.castShadow=false;
        this.cyl(g,.045,.045,.13,brass,[-5.25+i*.94,y+.64,-5.42],8);
      }
    }
    this.box(g,6.8,.14,3.25,wood,[0,-.5,.2]);
    this.box(g,6.4,1.65,2.8,woodSide,[0,-1.42,.2]);
    this.box(g,6.8,.025,3.25,brass,[0,-.417,.2]);
    for(let k=0;k<3;k++) this.lamp(g,[-3+k*3,3.45,-.7]);
    this.light(g,0x5b87b4,3.8,16,[5.5,2.3,-3]);
    this.light(g,0xf18a52,4.0,14,[-4,1.8,1]);
    this.light(g,0xffc27a,2.2,10,[.4,1.1,2.1]);
    this.bottle=this.makeBottle(g,[1.15,-.41,.4]);
    this.glass=this.makeGlass(g,[.04,-.43,1.15],1);
    this.gun=this.makeGun(g);
    this.gun.position.set(-1.5,-.24,.85);
    this.gun.rotation.y=-.3;
    this.gun.scale.setScalar(.8);
    this.person=this.makePerson(g,[1.4,-.66,-2.7],1.13);
    // A luminous haze made of points.
    const geo=new THREE.BufferGeometry(), arr=[];
    for(let i=0;i<340;i++) arr.push(rnd(-9,9),rnd(-1.7,4),rnd(-5.4,3));
    geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
    this.barDust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffcf98,size:.022,transparent:true,opacity:.38,depthWrite:false}));
    g.add(this.barDust);
  }
  makeEarthTexture() {
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
    const c=canvas.getContext('2d');
    const gradient=c.createLinearGradient(0,0,0,512);
    gradient.addColorStop(0,'#142d42');gradient.addColorStop(.5,'#0b273e');gradient.addColorStop(1,'#081629');
    c.fillStyle=gradient;c.fillRect(0,0,1024,512);
    const continents=[
      [[.06,.24],[.1,.17],[.16,.18],[.19,.26],[.23,.27],[.27,.35],[.24,.43],[.2,.43],[.17,.55],[.12,.47],[.1,.36]],
      [[.23,.49],[.28,.51],[.3,.62],[.28,.77],[.25,.9],[.23,.81],[.21,.63]],
      [[.46,.2],[.55,.17],[.59,.24],[.64,.19],[.73,.22],[.8,.29],[.88,.28],[.91,.42],[.86,.5],[.77,.43],[.69,.5],[.65,.4],[.57,.36],[.54,.48],[.49,.45]],
      [[.48,.46],[.55,.45],[.59,.53],[.57,.7],[.53,.83],[.5,.73],[.47,.57]],
      [[.78,.65],[.84,.63],[.88,.72],[.86,.83],[.81,.83]],
      [[.36,.7],[.4,.72],[.41,.78],[.38,.81]]
    ];
    for(let k=0;k<continents.length;k++) {
      const poly=continents[k];
      c.beginPath(); poly.forEach(([x,y],i)=>i?c.lineTo(x*1024,y*512):c.moveTo(x*1024,y*512));
      c.closePath();c.fillStyle=k%2?'#426960':'#355958';c.fill();
      c.strokeStyle='#5b8a83';c.lineWidth=2;c.stroke();
    }
    for(let i=0;i<1600;i++) {
      const x=rnd(0,1024),y=rnd(40,465);
      const p=c.getImageData(Math.round(x),Math.round(y),1,1).data;
      if(p[1]>p[2]*.75 && p[1]>60 && Math.random()>.32) {
        c.fillStyle=Math.random()>.45?'rgba(245,194,115,.5)':'rgba(160,220,205,.38)';
        c.fillRect(x,y,rnd(.6,2.2),rnd(.6,2.2));
      }
    }
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  }
  makeEarth() {
    const g=this.cosmos;
    const starArr=[];
    for(let i=0;i<2800;i++) {
      const d=rnd(28,105),a=rnd(0,TAU),v=rnd(-1,1);
      const r=Math.sqrt(1-v*v);
      starArr.push(d*r*Math.cos(a),d*v,d*r*Math.sin(a));
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(starArr,3));
    this.stars=new THREE.Points(geo,new THREE.PointsMaterial({color:0xd7eaf4,size:.095,sizeAttenuation:true,transparent:true,opacity:.86,depthWrite:false}));g.add(this.stars);
    this.globe=new THREE.Group();g.add(this.globe);
    const surface=this.mesh(new THREE.SphereGeometry(2.45,64,40),new THREE.MeshStandardMaterial({map:this.makeEarthTexture(),roughness:.89,metalness:0}),this.globe);surface.castShadow=false;
    const atm=new THREE.Mesh(new THREE.SphereGeometry(2.54,48,32),new THREE.MeshBasicMaterial({color:0x3e91d5,transparent:true,opacity:.09,side:THREE.BackSide,depthWrite:false}));this.globe.add(atm);
    const rim=new THREE.Mesh(new THREE.SphereGeometry(2.62,48,32),new THREE.MeshBasicMaterial({color:0x427ab0,transparent:true,opacity:.035,side:THREE.BackSide,depthWrite:false}));this.globe.add(rim);
    this.globe.rotation.z=.16;
    this.light(g,0xbbe1ff,6.5,34,[6,2,7]);
    this.light(g,0x5b7fd1,2.2,28,[-6,1,-2]);
    const ringM=new THREE.MeshBasicMaterial({color:0x7ba6b8,opacity:.1,transparent:true,side:THREE.DoubleSide});
    const ring=this.mesh(new THREE.TorusGeometry(3.0,.007,6,160),ringM,g);ring.rotation.set(.25,.15,.1);
  }
  makeStreet() {
    const g=this.street;
    const concrete=this.mat(0x171c23,.78,.10),brick=this.mat(0x2b2932,.82,.06),windowMat=new THREE.MeshBasicMaterial({color:0xc16a37});
    this.box(g,80,.1,80,concrete,[0,-2.4,0]);
    const facade=this.box(g,11,8,1.7,brick,[-.65,2,-3.8]);
    facade.castShadow=false;
    for(let level=0;level<3;level++) for(let col=0;col<5;col++) {
      const x=-5+col*2.12,y=.45+level*1.78;
      this.box(g,1.26,1.14,.06,this.mat(0x0a1017,.82),[x,y,-2.88]);
      this.box(g,.96,.88,.065,new THREE.MeshStandardMaterial({color:0x714322,emissive:0x864224,emissiveIntensity:rnd(.1,.75)}),[x,y,-2.827]);
      this.box(g,.07,1.12,.1,concrete,[x,y,-2.75]);
    }
    const door=this.box(g,2.4,2.85,.12,this.mat(0x171a20,.7,.12),[.25,-.95,-2.76]);
    door.castShadow=false;
    for(let j=0;j<2;j++) this.box(g,.07,2.8,.11,this.mat(0x725747,.6,.1),[-.2+j*.94,-.9,-2.61]);
    const sign=this.makeTextTexture('BAR','#ff5e42',128,256,256);
    const signM=new THREE.MeshBasicMaterial({map:sign,transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
    this.mesh(new THREE.PlaneGeometry(3.0,1.25),signM,g,[-.8,2.15,-2.76],false);
    this.light(g,0xff714f,7.5,14,[-1.2,1.8,-1.7]);
    this.light(g,0x5290c4,6.4,19,[5.5,3,1]);
    this.light(g,0xf4bf7f,3.2,15,[-6,3.2,3]);
    for(let i=0;i<7;i++) {
      const b=this.box(g,rnd(1.7,3.2),rnd(4,12),rnd(2.5,4),this.mat(0x111b24,.92),[-16+i*5,-.1,-10-rnd(0,4)]);
      b.castShadow=false;
    }
    const pole=this.cyl(g,.07,.07,6.3,this.mat(0x37424b,.5,.8),[4.9,.85,1.9]);
    this.box(g,1.1,.12,.12,this.mat(0x37424b,.5,.8),[4.42,4.0,1.9]);
    this.ball(g,.24,new THREE.MeshBasicMaterial({color:0xffc37f}),[3.91,3.92,1.9]);
    const figure=this.makePerson(g,[3.4,-.85,-.5],.85);
    figure.rotation.y=2.2;
    figure.userData.arm.rotation.z=-.1;
    // A small, low-cost rain simulation.
    const arr=[];
    for(let i=0;i<420;i++) arr.push(rnd(-12,12),rnd(-2,9),rnd(-8,10));
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
    this.rain=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc8e0fb,size:.03,transparent:true,opacity:.34,depthWrite:false}));g.add(this.rain);
  }
  makeTextTexture(text,color='#fff',size=80,width=512,height=256) {
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,width,height);ctx.font=`900 ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowBlur=38;ctx.shadowColor=color;ctx.fillStyle=color;
    ctx.fillText(text,width/2,height/2);
    ctx.shadowBlur=0;ctx.fillText(text,width/2,height/2);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  }
  makeEnding() {
    const g=this.ending;
    const N=2000,points=[],targets=[],motions=[],seeds=[];
    const pos=new Float32Array(N*3);
    const target=new Float32Array(N*3);
    for(let i=0;i<N;i++) {
      let x=0,y=0,z=0;
      if(i<N*.38) {
        // Head and neck of a deliberately anonymous silhouette.
        const a=rnd(0,TAU),v=rnd(-1,1),r=Math.sqrt(1-v*v);
        x=r*Math.cos(a)*.85;y=1.15+v*1.04;z=r*Math.sin(a)*.79;
      } else {
        const a=rnd(0,TAU),yy=rnd(-2.25,.25),ww=1.4-yy*.15;
        x=Math.cos(a)*ww;y=yy;z=Math.sin(a)*.56;
      }
      const p=i*3;pos[p]=x;pos[p+1]=y;pos[p+2]=z;
      target[p]=x;target[p+1]=y;target[p+2]=z;
      motions.push(new THREE.Vector3(0,0,0));
      seeds.push(rnd(0,TAU));
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
    const mat=new THREE.PointsMaterial({color:0xffb784,size:.054,transparent:true,opacity:.94,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
    this.finalPoints=new THREE.Points(geo,mat);g.add(this.finalPoints);
    this.finalOrigin=target;
    this.finalVel=motions;
    this.finalSeed=seeds;
    this.finalState=0;
    this.light(g,0xef7548,7.5,19,[-3,2,3]);
    this.light(g,0x5b8bc0,5.2,17,[3,-1,1]);
    this.finalHalo=new THREE.Mesh(new THREE.TorusGeometry(3.1,.022,10,160),new THREE.MeshBasicMaterial({color:0xf3a37d,transparent:true,opacity:.20}));g.add(this.finalHalo);
  }
  resetFinale() {
    this.finalState=0;
    const pos=this.finalPoints.geometry.attributes.position.array;
    pos.set(this.finalOrigin);
    for(const vel of this.finalVel) vel.set(0,0,0);
    this.finalPoints.geometry.attributes.position.needsUpdate=true;
  }
  getCamera(i) {return this.cameras[i];}
  setScene(index, first=false) {
    this.sceneIndex=index;
    this.sceneTime=0;
    this.bar.visible=[0,1,2,3,6,7].includes(index);
    this.cosmos.visible=index===4;
    this.street.visible=index===5;
    this.ending.visible=index===8;
    if (index===8) this.resetFinale();
    if(index===6) {
      this.gun.position.set(-.95,-.18,.85);this.gun.scale.setScalar(1.45);this.gun.rotation.set(.02,.25,-.06);
    } else if(index===7) {
      this.gun.position.set(-.45,1.04,-1.6);this.gun.scale.setScalar(.62);this.gun.rotation.set(0,-.15,.1);
    } else {
      this.gun.position.set(-1.5,-.24,.85);this.gun.scale.setScalar(.8);this.gun.rotation.set(0,-.30,-.02);
    }
    this.person.visible=index===2||index===7;
    this.bottle.visible=index<4;
    this.glass.visible=index!==3 && index!==7;
    this.gun.visible=index===0||index===3||index===6||index===7;
    const cam=this.getCamera(index),v=new THREE.Vector3(...cam.p),t=new THREE.Vector3(...cam.t);
    if(first||!this.camera.isPerspectiveCamera) {
      this.camera.position.copy(v);this.lookAt.copy(t);this.camera.lookAt(t);
    } else {
      // Fade hides the viewpoint jump, then the camera resumes breathing.
      this.camera.position.copy(v);this.lookAt.copy(t);this.camera.lookAt(t);
    }
  }
  updateFinale(dt) {
    const t=this.sceneTime, position=this.finalPoints.geometry.attributes.position;
    const arr=position.array, N=position.count;
    for(let i=0;i<N;i++) {
      const p=i*3,angle=this.finalSeed[i],velocity=this.finalVel[i];
      let goalX=this.finalOrigin[p],goalY=this.finalOrigin[p+1],goalZ=this.finalOrigin[p+2];
      if(t>1.0 && t<4.3) {
        const radius=3.2+Math.sin(i*2.29)*.6;
        goalX=Math.cos(angle+i*.003)*radius;
        goalY=Math.sin(angle+i*.003)*radius*.8;
        goalZ=Math.sin(angle*3+i*.03)*1.9;
      } else if(t>=4.3) {
        // The pieces do not reform the former person: they form an open, expanding loop.
        const a=(i/N)*TAU*4+angle*.08;
        const rr=1.7+.65*Math.sin(a*2);
        goalX=Math.cos(a)*rr;
        goalY=Math.sin(a)*rr;
        goalZ=.5*Math.sin(a*3+t*.3);
      }
      const k=t>1 && t<4.3 ? 1.8 : 2.1;
      velocity.x+=(goalX-arr[p])*k*dt;
      velocity.y+=(goalY-arr[p+1])*k*dt;
      velocity.z+=(goalZ-arr[p+2])*k*dt;
      velocity.multiplyScalar(Math.pow(.83,dt*60));
      arr[p]+=velocity.x*dt*25;
      arr[p+1]+=velocity.y*dt*25;
      arr[p+2]+=velocity.z*dt*25;
    }
    position.needsUpdate=true;
    this.finalHalo.rotation.z+=dt*.08;
    this.finalHalo.material.opacity=t>1 ? Math.min(.2,.05+(t-1)*.015) : .05;
    this.finalPoints.material.opacity=t<1.12 ? 1 : .92;
  }
  run() {
    try {
      const dt=Math.min(this.clock.getDelta(),.045);
      this.elapsed+=dt;this.sceneTime+=dt;
      if(this.bar.visible) {
        this.barDust.rotation.y+=dt*.0007;
        this.glass.rotation.z=this.sceneIndex===1?Math.sin(this.elapsed*1.7)*.015:0;
        if(this.sceneIndex===2) {
          const t=Math.min(this.sceneTime/2.6,1),raised=(1-Math.cos(t*Math.PI))*.5;
          this.person.userData.arm.rotation.z=-raised*2.1;
        } else this.person.userData.arm.rotation.z=0;
        if(this.sceneIndex===6) this.gun.userData.drum.rotation.x+=dt*4.7;
        else this.gun.userData.drum.rotation.x*=Math.pow(.65,dt*60);
      }
      if(this.cosmos.visible) {
        this.globe.rotation.y+=dt*.13;
        this.stars.rotation.y+=dt*.0018;
      }
      if(this.street.visible) {
        const p=this.rain.geometry.attributes.position;
        for(let i=0;i<p.count;i++) {
          let y=p.getY(i)-dt*4.0;
          if(y<-2.3)y+=11;
          p.setY(i,y);
        }
        p.needsUpdate=true;
      }
      if(this.ending.visible) this.updateFinale(dt);
      if(!this.reduceMotion) {
        const base=this.cameras[this.sceneIndex];
        const px=this.pointer.x*.075,py=this.pointer.y*.045;
        const target=new THREE.Vector3(...base.p).add(new THREE.Vector3(px,py,0));
        this.camera.position.lerp(target,Math.min(1,dt*2.2));
        const l=new THREE.Vector3(...base.t);
        l.x+=this.pointer.x*.05;
        this.lookAt.lerp(l,Math.min(1,dt*2));
        this.camera.lookAt(this.lookAt);
      }
      this.renderer.render(this.scene,this.camera);
      this.raf=requestAnimationFrame(this.run);
    } catch(err) {this.onError?.(err);console.error(err);cancelAnimationFrame(this.raf);}
  }
  resize() {
    const width=this.container.clientWidth || window.innerWidth;
    const height=this.container.clientHeight || window.innerHeight;
    this.camera.aspect=width/height;
    this.camera.fov=height<600 ? 53 : (width<760?51:42);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width,height,false);
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize',this.resize);
    window.removeEventListener('pointermove',this.movePointer);
    this.renderer.dispose();
  }
}
