import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('gl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEl=document.getElementById('top'), stageA=document.getElementById('stageA'), stageB=document.getElementById('stageB'), badge=document.getElementById('badge3d'), hprog=document.getElementById('hprog'), grab=document.querySelector('.grab');
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function narrow(){return matchMedia('(max-width:940px)').matches;}
function progress(){if(!heroEl)return 0;const r=heroEl.getBoundingClientRect();const total=r.height-innerHeight;if(total<=0)return 0;return Math.min(1,Math.max(0,-r.top/total));}
let renderer,scene,camera,scissors,bladeA,bladeB,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(38,1,0.1,100);camera.position.set(0,0,10.5);
  const steel=new THREE.MeshStandardMaterial({color:0xe0e4ea,metalness:1,roughness:0.14});
  const gold=new THREE.MeshStandardMaterial({color:0xc39b48,metalness:1,roughness:0.26});
  const screw=new THREE.MeshStandardMaterial({color:0xb08a3e,metalness:1,roughness:0.3});
  function makeBlade(){const g=new THREE.Group();
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.32,3.4,0.1),steel);blade.geometry.translate(0,1.7,0);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.17,0.8,4),steel);tip.position.y=3.8;tip.rotation.y=Math.PI/4;g.add(blade,tip);
    const shank=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.06),steel);shank.geometry.translate(0,-0.75,0);g.add(shank);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.12,20,40),gold);ring.position.y=-2.0;g.add(ring);return g;}
  scissors=new THREE.Group();bladeA=makeBlade();bladeB=makeBlade();bladeB.scale.x=-1;scissors.add(bladeA,bladeB);
  const pivot=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.3,24),screw);pivot.rotation.x=Math.PI/2;scissors.add(pivot);
  scissors.rotation.z=0.22;scissors.position.y=-0.8;scene.add(scissors);
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const rg=g.createRadialGradient(64,64,4,64,64,64);rg.addColorStop(0,'rgba(10,25,20,.5)');rg.addColorStop(1,'rgba(10,25,20,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5,2.4),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.5,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-3;scene.add(shadow);
  const key=new THREE.SpotLight(0xffffff,175,50,0.6,0.5);key.position.set(6,9,10);scene.add(key);
  const rim=new THREE.SpotLight(0x2c8a68,90,50,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x3a4640,1.1));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.2:1.0;if(rim)rim.intensity=night?100:80;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;const nw=narrow();const p=progress();
    const open=reduce?0.16:0.16+Math.sin(t*0.9)*0.12;bladeA.rotation.z=open;bladeB.rotation.z=-open;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.4-tx)*0.05;ty+=(my*0.3-ty)*0.05;
    scissors.rotation.y=Math.sin(t*0.35)*0.55+dragAz+tx*0.8;
    scissors.rotation.x=0.12-ty*0.4;
    const baseX=nw?0:2.5;scissors.position.x=baseX;
    scissors.position.y=(nw?-0.4:-0.8)+Math.sin(t*0.6)*0.08;
    scissors.scale.setScalar((nw?0.6:0.82)*(1-0.04*p));
    shadow.position.x=scissors.position.x;shadow.material.opacity=(nw?.35:.5)*(1-0.4*p);
    camera.position.z=10.5-0.8*ss(0,1,p);
    const aOp=1-ss(0.06,0.24,p);
    if(stageA){stageA.style.opacity=aOp;stageA.style.transform='translateY('+(-20*ss(0.05,0.26,p))+'px)';stageA.style.pointerEvents=aOp<0.15?'none':'auto';}
    if(badge)badge.style.opacity=aOp;
    if(stageB){stageB.style.opacity=ss(0.14,0.32,p)*(1-ss(0.92,1,p));stageB.style.transform='translateY(calc(-50% + '+(22*(1-ss(0.34,0.52,p)))+'px))';}
    if(hprog)hprog.style.width=(p*100).toFixed(1)+'%';
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('WebGL hero fallback',err);canvas.style.display='none';var fb=document.querySelector('.hero-fb');if(fb)fb.style.display='block';}
}
