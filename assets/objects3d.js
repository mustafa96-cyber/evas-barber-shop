// Saedi Tech — shared 3D object library. Mounts any object into <canvas class="obj3d" data-obj="NAME">.
// One lightweight WebGL context per canvas, drag to rotate, gentle float, pauses when offscreen.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;

const M={
  steel:()=>new THREE.MeshStandardMaterial({color:0xd7dbe1,metalness:1,roughness:0.16}),
  chrome:()=>new THREE.MeshStandardMaterial({color:0xdbe0e6,metalness:1,roughness:0.12}),
  dark:()=>new THREE.MeshStandardMaterial({color:0x2a2f36,metalness:.6,roughness:.5}),
  rubber:()=>new THREE.MeshStandardMaterial({color:0x0b0c10,metalness:.1,roughness:.88}),
  gold:()=>new THREE.MeshStandardMaterial({color:0xc39b48,metalness:1,roughness:0.28}),
  leather:(c)=>new THREE.MeshPhysicalMaterial({color:c||0x8a2f27,roughness:0.5,metalness:0.05,clearcoat:0.5,clearcoatRoughness:0.4}),
  enamel:()=>new THREE.MeshPhysicalMaterial({color:0xf3f5f8,roughness:0.25,metalness:0,clearcoat:0.8,clearcoatRoughness:0.2}),
};
function box(w,h,d,m,x,y,z){const e=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);e.position.set(x||0,y||0,z||0);return e;}
function cyl(rt,rb,h,m,seg){return new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||32),m);}

export const BUILD={
 wheel(o){const g=new THREE.Group();const steel=M.steel(),dark=M.dark(),rubber=M.rubber(),cal=M.leather(o.accent||0x1f4e8c);cal.metalness=.5;cal.roughness=.3;
   g.add(new THREE.Mesh(new THREE.TorusGeometry(2.15,0.55,26,64),rubber));
   const barrel=cyl(2.02,2.02,0.72,dark,56);barrel.rotation.x=Math.PI/2;g.add(barrel);
   const face=new THREE.Mesh(new THREE.CircleGeometry(2.02,56),steel);face.position.z=0.35;g.add(face);
   const hub=cyl(0.44,0.52,0.5,steel,32);hub.rotation.x=Math.PI/2;hub.position.z=0.44;g.add(hub);
   const spokeGeo=new THREE.BoxGeometry(0.3,1.55,0.17);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;for(const off of[-0.17,0.17]){const s=new THREE.Mesh(spokeGeo,steel);s.position.set(Math.cos(a)*0.92+Math.cos(a+Math.PI/2)*off,Math.sin(a)*0.92+Math.sin(a+Math.PI/2)*off,0.33);s.rotation.z=a-Math.PI/2;g.add(s);}}
   const disc=cyl(1.58,1.58,0.12,new THREE.MeshStandardMaterial({color:0x3a3f49,metalness:.95,roughness:.3}),48);disc.rotation.x=Math.PI/2;disc.position.z=-0.06;g.add(disc);
   g.rotation.x=-0.2;g.userData.spin='z';return g;},
 piston(o){const g=new THREE.Group();const steel=M.steel(),dark=M.dark();const rod=M.leather(o.accent||0x1f4e8c);rod.metalness=.6;rod.roughness=.3;
   const head=cyl(1.15,1.15,1.3,steel,40);head.position.y=1.5;g.add(head);
   for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.16,0.06,10,44),dark);ring.rotation.x=Math.PI/2;ring.position.y=1.9-i*0.26;g.add(ring);}
   const pin=cyl(0.22,0.22,2.5,dark,20);pin.rotation.z=Math.PI/2;pin.position.y=0.95;g.add(pin);
   const rodShape=new THREE.Mesh(new THREE.BoxGeometry(0.5,2.2,0.32),rod);rodShape.position.y=-0.4;g.add(rodShape);
   const bigEnd=cyl(0.62,0.62,0.7,rod,28);bigEnd.rotation.x=Math.PI/2;bigEnd.position.y=-1.6;g.add(bigEnd);
   const bearing=cyl(0.4,0.4,0.76,steel,24);bearing.rotation.x=Math.PI/2;bearing.position.y=-1.6;g.add(bearing);
   g.userData.spin='sway';g.userData.scale=0.95;return g;},
 gear(o){const g=new THREE.Group();const steel=new THREE.MeshStandardMaterial({color:0x9aa1ab,metalness:.95,roughness:.32});const acc=M.leather(o.accent||0x1f4e8c);acc.metalness=.5;acc.roughness=.3;
   const teeth=16,rO=2.0;const body=cyl(rO*0.82,rO*0.82,0.6,steel,teeth*3);body.rotation.x=Math.PI/2;g.add(body);
   for(let i=0;i<teeth;i++){const a=i/teeth*Math.PI*2;const t=box(0.42,0.5,0.62,steel,Math.cos(a)*rO,Math.sin(a)*rO,0);t.rotation.z=a;g.add(t);}
   const hub=cyl(0.75,0.75,0.72,acc,32);hub.rotation.x=Math.PI/2;g.add(hub);
   const bore=cyl(0.34,0.34,0.8,M.dark(),24);bore.rotation.x=Math.PI/2;g.add(bore);
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const hole=cyl(0.26,0.26,0.66,M.dark(),16);hole.rotation.x=Math.PI/2;hole.position.set(Math.cos(a)*1.15,Math.sin(a)*1.15,0);g.add(hole);}
   g.userData.spin='z';g.userData.scale=1.0;return g;},
 sparkplug(o){const g=new THREE.Group();const steel=M.steel(),cer=M.enamel();const hex=new THREE.MeshStandardMaterial({color:0x8b9099,metalness:.9,roughness:.34});const acc=M.leather(o.accent||0xc0392b);acc.metalness=.4;
   const ins=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.7,2.4,24),cer);ins.position.y=1.6;g.add(ins);
   const ribs=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.9,24),cer);ribs.position.y=2.9;g.add(ribs);
   const term=cyl(0.22,0.22,0.7,steel,20);term.position.y=3.6;g.add(term);
   const hexnut=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.7,6),hex);hexnut.position.y=0.2;g.add(hexnut);
   const thread=cyl(0.42,0.42,1.2,steel,20);thread.position.y=-0.7;g.add(thread);
   for(let i=0;i<6;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.05,8,24),steel);r.rotation.x=Math.PI/2;r.position.y=-0.2-i*0.18;g.add(r);}
   const el=cyl(0.09,0.09,0.5,steel,10);el.position.y=-1.45;g.add(el);
   const hook=box(0.12,0.12,0.5,steel,0,-1.6,0.2);g.add(hook);
   g.userData.spin='sway';g.userData.scale=0.9;return g;},
 battery(o){const g=new THREE.Group();const body=M.leather(o.accent||0x22303f);body.metalness=.2;body.roughness=.55;const cap=new THREE.MeshStandardMaterial({color:0x1a1d22,metalness:.3,roughness:.6});const red=new THREE.MeshStandardMaterial({color:0xb23b2e,metalness:.4,roughness:.4});const steel=M.steel();
   g.add(box(3.0,2.2,2.0,body,0,0,0));
   g.add(box(3.05,0.35,2.05,cap,0,1.2,0));
   // caps
   for(const x of[-0.9,-0.3,0.3,0.9]){const c=cyl(0.28,0.28,0.16,cap,16);c.position.set(x,1.45,0);g.add(c);}
   // terminals
   const pos=cyl(0.32,0.4,0.5,steel,20);pos.position.set(-1.0,1.6,0.6);g.add(pos);
   const neg=cyl(0.32,0.4,0.5,steel,20);neg.position.set(1.0,1.6,0.6);g.add(neg);
   g.add(box(0.7,0.5,0.14,red,-1.0,1.05,0.95));
   // label plate
   g.add(box(2.2,1.2,0.03,new THREE.MeshStandardMaterial({color:0xe8ded0,roughness:.7}),0,-0.1,1.02));
   g.rotation.y=0.4;g.userData.spin='y';g.userData.scale=0.92;return g;},
 comb(o){const g=new THREE.Group();const mat=M.leather(o.accent||0x1a1a1e);mat.metalness=.3;mat.roughness=.4;
   g.add(box(4.6,0.7,0.18,mat,0,0,0));
   for(let i=0;i<26;i++)g.add(box(0.1,1.5,0.16,mat,-2.1+i*0.168,-1.0,0));
   g.rotation.z=0.15;g.userData.spin='sway';g.userData.scale=0.95;return g;},
 rotor(o){const g=new THREE.Group();const rm=new THREE.MeshStandardMaterial({color:0x596069,metalness:.95,roughness:.32});const cal=M.leather(o.accent||0xc0392b);cal.metalness=.5;cal.roughness=.3;
   const disc=cyl(2,2,0.22,rm,60);disc.rotation.x=Math.PI/2;g.add(disc);
   for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const h=cyl(0.1,0.1,0.3,M.dark(),10);h.rotation.x=Math.PI/2;h.position.set(Math.cos(a)*1.45,Math.sin(a)*1.45,0);g.add(h);}
   const hat=cyl(0.7,0.7,0.5,M.chrome(),32);hat.rotation.x=Math.PI/2;hat.position.z=0.2;g.add(hat);
   g.add(box(0.7,1.7,0.7,cal,-2.05,0.2,0));
   g.rotation.x=-0.25;g.userData.spin='z';return g;},
 engine(o){const g=new THREE.Group();const block=M.leather(o.accent||0x1f4e8c);block.metalness=.4;block.roughness=.45;const chrome=M.chrome();
   g.add(box(2.4,2,1.8,block,0,0,0));
   for(let i=0;i<4;i++){const c=cyl(0.42,0.42,0.7,chrome,24);c.position.set(-0.9+i*0.6,1.3,0);g.add(c);}
   g.add(box(2.6,0.4,2,M.dark(),0,-1.1,0));
   const belt=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.12,16,40),M.dark());belt.position.set(1.4,0.2,0.9);g.add(belt);
   g.rotation.y=0.5;g.userData.spin='y';return g;},
 muffler(o){const g=new THREE.Group();const chrome=M.chrome();
   const can=cyl(0.95,0.95,2.4,chrome,40);can.rotation.z=Math.PI/2;g.add(can);
   const p1=cyl(0.28,0.28,1.4,chrome,24);p1.rotation.z=Math.PI/2;p1.position.x=-1.8;g.add(p1);
   const tip=cyl(0.42,0.34,0.7,chrome,24);tip.rotation.z=Math.PI/2;tip.position.x=1.75;g.add(tip);
   g.rotation.set(-0.2,0.4,0);g.userData.spin='y';return g;},
 chair(o){const g=new THREE.Group();const leather=M.leather(o.accent||0x8a2f27),chrome=M.chrome(),dark=M.dark();
   const base=cyl(1.5,1.75,0.3,chrome,40);base.position.y=-2.75;g.add(base);
   const col=cyl(0.38,0.55,1.7,chrome,28);col.position.y=-1.78;g.add(col);
   g.add(box(2.35,0.5,2.15,leather,0,-0.4,0));g.add(box(2.06,0.24,1.86,leather,0,-0.08,0));
   const backG=new THREE.Group();backG.add(box(2.2,2.5,0.44,leather,0,1.25,0));backG.add(box(1.05,0.62,0.42,leather,0,2.72,0));backG.position.set(0,-0.15,-0.98);backG.rotation.x=-0.14;g.add(backG);
   [-1.4,1.4].forEach(x=>{g.add(box(0.3,0.18,2.1,chrome,x,0.24,0.05));g.add(box(0.36,0.16,1.5,leather,x,0.38,0.12));});
   g.add(box(1.75,0.14,0.55,chrome,0,-1.55,1.55));
   g.rotation.y=0.5;g.userData.spin='y';g.userData.scale=0.82;return g;},
 scissors(o){const g=new THREE.Group();const steel=M.steel(),gold=M.gold();
   function blade(){const b=new THREE.Group();const bl=new THREE.Mesh(new THREE.BoxGeometry(0.32,3.4,0.1),steel);bl.geometry.translate(0,1.7,0);const tip=new THREE.Mesh(new THREE.ConeGeometry(0.17,0.8,4),steel);tip.position.y=3.8;tip.rotation.y=Math.PI/4;b.add(bl,tip);const sh=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.06),steel);sh.geometry.translate(0,-0.75,0);b.add(sh);const r=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.12,16,32),gold);r.position.y=-2;b.add(r);return b;}
   const a=blade(),b=blade();b.scale.x=-1;g.add(a,b);const pv=cyl(0.2,0.2,0.3,gold,20);pv.rotation.x=Math.PI/2;g.add(pv);
   g.rotation.z=0.22;g.userData.open=[a,b];g.userData.spin='sway';g.userData.scale=0.82;return g;},
 razor(o){const g=new THREE.Group();const steel=M.steel(),brass=M.gold(),horn=new THREE.MeshStandardMaterial({color:0x141418,metalness:.45,roughness:.32});
   // handle (scales) along -x
   const handle=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.52,0.34),horn);handle.geometry.translate(-1.55,0,0);g.add(handle);
   const capEnd=new THREE.Mesh(new THREE.CylinderGeometry(0.27,0.27,0.36,20),brass);capEnd.rotation.x=Math.PI/2;capEnd.position.x=-3.05;g.add(capEnd);
   // blade pivots OPEN, extending +x and angled slightly up so it clearly reads
   const bladeG=new THREE.Group();
   const blade=new THREE.Mesh(new THREE.BoxGeometry(3.0,0.82,0.06),steel);blade.geometry.translate(1.55,0,0);bladeG.add(blade);
   const spine=new THREE.Mesh(new THREE.BoxGeometry(3.0,0.16,0.12),brass);spine.geometry.translate(1.55,0.36,0);bladeG.add(spine);
   const nose=new THREE.Mesh(new THREE.CylinderGeometry(0.41,0.41,0.06,24,1,false,0,Math.PI),steel);nose.rotation.x=Math.PI/2;nose.position.x=3.05;nose.rotation.z=-Math.PI/2;bladeG.add(nose);
   const tang=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.24,0.1),steel);tang.position.set(0.2,-0.28,0);bladeG.add(tang);
   bladeG.rotation.z=0.28;g.add(bladeG);
   const pin=cyl(0.16,0.16,0.42,brass,16);pin.rotation.x=Math.PI/2;g.add(pin);
   g.rotation.z=0.06;g.userData.spin='sway';g.userData.scale=0.92;return g;},
 pole(o){const g=new THREE.Group();const brass=M.gold();
   const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#f4efe6';x.fillRect(0,0,256,256);x.save();x.translate(128,128);x.rotate(Math.PI/4);for(let i=-320;i<320;i+=96){x.fillStyle='#9e2b25';x.fillRect(i,-320,32,640);x.fillStyle='#243448';x.fillRect(i+48,-320,32,640);}x.restore();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,3);return t;})();
   const core=cyl(0.92,0.92,4.2,new THREE.MeshStandardMaterial({map:tex,roughness:.42}),48);g.add(core);g.userData.tex=tex;
   const glass=cyl(1.0,1.0,4.2,new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.06,transmission:1,thickness:.6,ior:1.45,transparent:true,opacity:.5,clearcoat:1,side:THREE.DoubleSide}),48);g.add(glass);
   [2.35,-2.35].forEach(y=>{const m=cyl(1.12,1.12,0.5,brass,48);m.position.y=y;g.add(m);});[2.85,-2.85].forEach(y=>{const s=new THREE.Mesh(new THREE.SphereGeometry(0.62,24,18),brass);s.position.y=y;g.add(s);});
   g.rotation.z=0.1;g.userData.spin='y';g.userData.scale=0.95;return g;},
 clippers(o){const g=new THREE.Group();const body=M.leather(o.accent||0x243448);body.metalness=.5;body.roughness=.35;const steel=M.steel();
   g.add(box(1.5,2.6,0.9,body,0,0,0));
   const blade=box(1.35,0.5,0.9,steel,0,1.55,0.05);g.add(blade);
   for(let i=0;i<9;i++)g.add(box(0.1,0.35,0.9,steel,-0.55+i*0.14,1.85,0.05));
   g.add(box(1.2,0.12,0.7,M.dark(),0,0.3,0.46));
   g.rotation.set(-0.1,0.5,0.1);g.userData.spin='y';g.userData.scale=0.95;return g;},
 tooth(o){const g=new THREE.Group();const en=M.enamel();
   const pts=[];for(let i=0;i<12;i++){const t=i/11;pts.push(new THREE.Vector2(Math.sin(t*Math.PI)*1.05+0.15,2-t*3.2));}
   const crown=new THREE.Mesh(new THREE.LatheGeometry(pts,48),en);g.add(crown);
   const r1=cyl(0.28,0.12,1.4,en,20);r1.position.set(-0.5,-2.2,0);r1.rotation.z=0.18;g.add(r1);
   const r2=cyl(0.28,0.12,1.4,en,20);r2.position.set(0.5,-2.2,0);r2.rotation.z=-0.18;g.add(r2);
   const spark=M.leather(o.accent||0x1f6f8b);spark.metalness=.3;
   g.userData.spin='sway';g.userData.scale=1.0;return g;},
 toothbrush(o){const g=new THREE.Group();const handle=M.leather(o.accent||0x1f6f8b);handle.metalness=.15;handle.roughness=.4;const white=new THREE.MeshStandardMaterial({color:0xf3f5f8,roughness:.5});const bristle=new THREE.MeshStandardMaterial({color:0xdfe7ee,roughness:.8});
   const h=new THREE.Mesh(new THREE.BoxGeometry(0.55,5.0,0.5),handle);h.geometry.translate(0,-0.6,0);
   // round the grip end a touch
   const gripEnd=new THREE.Mesh(new THREE.SphereGeometry(0.3,16,12),handle);gripEnd.position.y=-3.1;gripEnd.scale.set(0.9,1.2,0.9);g.add(gripEnd);
   g.add(h);
   const head=new THREE.Mesh(new THREE.BoxGeometry(0.7,1.5,0.35),white);head.position.y=2.55;g.add(head);
   for(let r=0;r<5;r++)for(let c=-1;c<=1;c++){const b=cyl(0.06,0.06,0.42,bristle,8);b.position.set(c*0.2,2.15+r*0.28,0.32);g.add(b);}
   g.rotation.z=0.5;g.rotation.x=0.1;g.userData.spin='sway';g.userData.scale=0.95;return g;},
 implant(o){const g=new THREE.Group();const en=M.enamel();const ti=new THREE.MeshStandardMaterial({color:0xc7ccd3,metalness:1,roughness:0.28});
   // crown on top
   const pts=[];for(let i=0;i<10;i++){const t=i/9;pts.push(new THREE.Vector2(Math.sin(t*Math.PI*0.9)*0.9+0.12,1.4-t*1.9));}
   const crown=new THREE.Mesh(new THREE.LatheGeometry(pts,40),en);crown.position.y=1.6;g.add(crown);
   const abut=cyl(0.34,0.5,0.7,ti,24);abut.position.y=0.55;g.add(abut);
   // threaded screw post
   const post=cyl(0.42,0.28,2.4,ti,24);post.position.y=-1;g.add(post);
   for(let i=0;i<9;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(0.37-i*0.017,0.05,8,24),ti);ring.rotation.x=Math.PI/2;ring.position.y=-0.1-i*0.24;g.add(ring);}
   g.userData.spin='sway';g.userData.scale=1.0;return g;},
 seat(o){const g=new THREE.Group();const leather=M.leather(o.accent||0xa45a2a);const stitch=new THREE.MeshStandardMaterial({color:0xe9d9be,roughness:.6});const chrome=M.chrome();
   // contoured bucket seat: centre cushion + raised side bolsters
   g.add(box(1.7,0.5,2.3,leather,0,-0.95,0.05));
   [-1.05,1.05].forEach(x=>g.add(box(0.55,0.72,2.3,leather,x,-0.85,0.05)));
   // seatback: centre panel + tall side bolsters, tilted back
   const backG=new THREE.Group();
   backG.add(box(1.7,3.0,0.55,leather,0,0,0));
   [-1.05,1.05].forEach(x=>{const b=box(0.55,3.0,0.85,leather,x,0,0.1);backG.add(b);});
   // stitched channels down the centre panel
   for(let i=-1;i<=1;i++)backG.add(box(0.04,2.7,0.02,stitch,i*0.5,0,0.3));
   backG.position.set(0,0.9,-0.95);backG.rotation.x=-0.16;g.add(backG);
   // headrest on twin posts
   [-0.42,0.42].forEach(x=>{const p=cyl(0.08,0.08,0.5,chrome,12);p.position.set(x,2.35,-1.05);p.rotation.x=-0.16;g.add(p);});
   const head=box(1.25,0.75,0.75,leather,0,2.75,-1.2);head.rotation.x=-0.16;g.add(head);
   g.rotation.y=0.5;g.userData.spin='y';g.userData.scale=0.8;return g;},
 bottle(o){const g=new THREE.Group();const glass=new THREE.MeshPhysicalMaterial({color:o.accent||0x2fae9e,roughness:.1,transmission:.6,thickness:.5,transparent:true,opacity:.85,clearcoat:1});
   g.add(cyl(0.9,0.9,2.4,glass,40));const neck=cyl(0.4,0.5,0.6,glass,24);neck.position.y=1.5;g.add(neck);const cap=cyl(0.45,0.45,0.5,M.chrome(),24);cap.position.y=2;g.add(cap);
   const pump=box(0.7,0.15,0.15,M.chrome(),0.5,2.1,0);g.add(pump);
   g.userData.spin='y';g.userData.scale=1.1;return g;},
 paw(o){const g=new THREE.Group();const pad=M.leather(o.accent||0x6d5a8f);pad.metalness=.05;pad.roughness=.62;const fur=new THREE.MeshStandardMaterial({color:0xf1ece6,roughness:.85});
   // face-on paw print: big heart-ish main pad low-centre, 4 toe beans arced above
   const main=new THREE.Mesh(new THREE.SphereGeometry(1.15,32,24),pad);main.scale.set(1.15,1.05,0.6);main.position.y=-0.7;g.add(main);
   const toes=[[-1.35,0.55,0.5],[-0.5,1.25,0.55],[0.5,1.25,0.55],[1.35,0.55,0.5]];
   toes.forEach(([x,y,s])=>{const t=new THREE.Mesh(new THREE.SphereGeometry(s,24,18),pad);t.scale.set(1,1.15,0.6);t.position.set(x,y,0);g.add(t);});
   g.rotation.x=-0.15;g.userData.spin='sway';g.userData.scale=1.05;return g;},
};

function mount(canvas){
  const name=canvas.dataset.obj; const build=BUILD[name]; if(!build)return;
  const accent=canvas.dataset.accent?parseInt(canvas.dataset.accent,16):null;
  let renderer,scene,camera,group,raf,active=false,t=0,mx=0,my=0,tx=0,ty=0,dragAz=0,dragVel=0,dragging=false,lastX=0;
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    scene=new THREE.Scene();const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
    camera=new THREE.PerspectiveCamera(40,1,0.1,100);camera.position.set(0,0,11);
    group=build({accent});const s=group.userData.scale||1;group.scale.setScalar(s);scene.add(group);
    const key=new THREE.SpotLight(0xffffff,160,60,0.6,0.5);key.position.set(6,9,10);scene.add(key);
    const rim=new THREE.SpotLight(0xffffff,70,60,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
    scene.add(new THREE.AmbientLight(0x404652,1.0));
    canvas.__theme=(night)=>{renderer.toneMappingExposure=night?1.2:1.03;};
    function resize(){const r=canvas.getBoundingClientRect();if(r.width<2){return;}renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
      const nw=matchMedia('(max-width:700px)').matches;group.scale.setScalar(s*(nw?0.86:1));}
    resize();addEventListener('resize',resize);
    addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-0.5;my=e.clientY/innerHeight-0.5;},{passive:true});
    canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
    addEventListener('pointerup',()=>{dragging=false;});
    canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;});
    const io=new IntersectionObserver(es=>es.forEach(e=>{active=e.isIntersecting;}),{threshold:.05});io.observe(canvas);
    const spin=group.userData.spin;
    function loop(){raf=requestAnimationFrame(loop);if(!active){return;}t+=0.016;
      if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
      tx+=(mx*0.35-tx)*0.05;ty+=(my*0.25-ty)*0.05;
      if(group.userData.tex&&!REDUCE)group.userData.tex.offset.y-=0.006;
      if(group.userData.open){const o=REDUCE?0.16:0.16+Math.sin(t*0.9)*0.12;group.userData.open[0].rotation.z=o;group.userData.open[1].rotation.z=-o;}
      if(spin==='sway'){group.rotation.y=Math.sin(t*0.35)*0.5+dragAz+tx;group.rotation.x=0.1-ty*0.3;}
      else if(spin==='z'){if(!REDUCE&&!dragging)group.rotation.z-=0.006;group.rotation.y=0.0+dragAz+tx;group.rotation.x=-0.2-ty*0.3;}
      else{group.rotation.y=(REDUCE?0.5:0.5+t*0.25)+dragAz+tx;group.rotation.x=(group.rotation.x||0);group.rotation.x=-ty*0.2;}
      group.position.y=Math.sin(t*0.6)*0.08;
      renderer.render(scene,camera);}
    loop();
  }catch(err){console.warn('obj3d fallback',name,err);canvas.style.display='none';}
}
document.querySelectorAll('canvas.obj3d').forEach(mount);
const _prev=window.__setSceneTheme;
window.__setSceneTheme=(night)=>{if(_prev)_prev(night);document.querySelectorAll('canvas.obj3d').forEach(c=>{if(c.__theme)c.__theme(night);});};
