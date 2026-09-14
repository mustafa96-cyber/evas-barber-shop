/* Hiro's Auto Repair — shared behavior + cinematic scroll engine */
(function(){ /* theme */
  var root=document.documentElement, btn=document.getElementById('themeTgl');
  var moon=document.getElementById('icMoon'), sun=document.getElementById('icSun');
  var saved=null; try{saved=localStorage.getItem('hiros-theme')}catch(e){}
  function apply(night){root.setAttribute('data-theme',night?'night':'day');if(moon)moon.style.display=night?'none':'block';if(sun)sun.style.display=night?'block':'none';if(btn)btn.setAttribute('aria-pressed',night?'true':'false');if(window.__setSceneTheme)window.__setSceneTheme(night);}
  apply(saved==='night');
  if(btn)btn.addEventListener('click',function(){var night=root.getAttribute('data-theme')!=='night';apply(night);try{localStorage.setItem('hiros-theme',night?'night':'day')}catch(e){}});
})();
(function(){ /* mobile menu */
  var burger=document.getElementById('burger'), menu=document.getElementById('mmenu'), close=document.getElementById('mclose');
  if(!burger||!menu)return;
  function open(){menu.classList.add('open');document.body.style.overflow='hidden';}
  function shut(){menu.classList.remove('open');document.body.style.overflow='';}
  burger.addEventListener('click',open); if(close)close.addEventListener('click',shut);
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',shut);});
  addEventListener('keydown',function(e){if(e.key==='Escape')shut();});
})();
var REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
(function(){ /* staggered reveals */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;var d=el.getAttribute('data-delay')||0;el.style.transitionDelay=d+'ms';el.classList.add('in');io.unobserve(el);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.up,.rv').forEach(function(el){io.observe(el);});
  /* auto-stagger groups: any [data-stagger] children get incremental delay */
  document.querySelectorAll('[data-stagger]').forEach(function(g){Array.prototype.forEach.call(g.children,function(c,i){c.classList.add('rv');c.setAttribute('data-delay',(i*90));io.observe(c);});});
})();
(function(){ /* count-up */
  if(REDUCE)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;io.unobserve(el);var to=parseFloat(el.getAttribute('data-count'));var dec=(el.getAttribute('data-dec')|0);var suf=el.getAttribute('data-suf')||'';var t0=performance.now(),dur=1400;
    function tick(now){var p=Math.min(1,(now-t0)/dur);var e=1-Math.pow(1-p,3);var v=(to*e).toFixed(dec);el.textContent=v+suf;if(p<1)requestAnimationFrame(tick);}
    requestAnimationFrame(tick);});},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){io.observe(el);});
})();
(function(){ /* parallax + scrub (rAF-batched scroll) */
  var px=document.querySelectorAll('[data-parallax]');
  var scrubs=document.querySelectorAll('[data-scrub]');
  if(!px.length&&!scrubs.length)return;
  var ticking=false;
  function frame(){
    ticking=false;var vh=innerHeight;
    if(!REDUCE)px.forEach(function(el){var r=el.getBoundingClientRect();var mid=r.top+r.height/2;var d=(mid-vh/2)/vh;var sp=parseFloat(el.getAttribute('data-parallax'))||0.15;el.style.transform='translate3d(0,'+(-d*sp*100).toFixed(1)+'px,0)';});
    scrubs.forEach(function(el){var r=el.getBoundingClientRect();var total=r.height-vh;var p=total>0?Math.min(1,Math.max(0,-r.top/total)):0;el.style.setProperty('--p',p.toFixed(4));if(el.__onscrub)el.__onscrub(p);});
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame);}}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);frame();
})();
(function(){ /* cinematic garage scene (scroll-scrubbed) */
  var scene=document.getElementById('garage'); if(!scene)return;
  var gsvg=scene.querySelector('.gsvg');
  function setPAR(){if(gsvg)gsvg.setAttribute('preserveAspectRatio', matchMedia('(max-width:820px)').matches?'xMidYMid meet':'xMidYMax slice');}
  setPAR(); addEventListener('resize',setPAR);
  var car=document.getElementById('g-car'), lift=document.getElementById('g-lift'), pts=document.querySelectorAll('#garage .g-pt'), steps=document.querySelectorAll('#garage .g-step');
  scene.__onscrub=function(p){
    // 0-.30 car drives in; .30-.55 lift raises; .55-1 inspection points ping
    var drive=Math.min(1,p/0.30);
    var raise=Math.min(1,Math.max(0,(p-0.30)/0.25));
    var insp=Math.min(1,Math.max(0,(p-0.55)/0.45));
    if(car)car.setAttribute('transform','translate('+(( -520)*(1-drive)).toFixed(1)+' 0)');
    if(lift)lift.setAttribute('transform','translate(0 '+(( -70)*raise).toFixed(1)+')');
    pts.forEach(function(pt,i){var on=insp>(i/pts.length);pt.style.opacity=on?1:0;pt.style.transform='scale('+(on?1:0.3)+')';});
    steps.forEach(function(s,i){var seg=i/steps.length, seg2=(i+1)/steps.length;var a=(p>=seg-0.02&&p<seg2+0.05)?1:(p<seg?0:0);s.style.opacity=(p>=seg&&p<seg2+0.08)?1:0.18;});
  };
  if(REDUCE){scene.__onscrub(1);}
})();
(function(){ /* header tightens on scroll */
  var h=document.getElementById('sitehead'); if(!h)return;
  function on(){h.classList.toggle('scrolled',(window.scrollY||0)>44);}
  addEventListener('scroll',on,{passive:true}); on();
})();
(function(){ /* back to top */
  var b=document.getElementById('backtop'); if(!b)return;
  b.addEventListener('click',function(){window.scrollTo({top:0,behavior:REDUCE?'auto':'smooth'});});
})();
(function(){ /* appointment form (truthful preview state) */
  var f=document.getElementById('bookform'); if(!f)return;
  f.addEventListener('submit',function(e){e.preventDefault();if(f.querySelector('#f-web')&&f.querySelector('#f-web').value)return;
    var req=['#f-name','#f-phone','#f-car'].map(function(s){return f.querySelector(s);}).filter(Boolean);
    for(var i=0;i<req.length;i++){var el=req[i];if(!el.value.trim()){el.focus();el.style.borderColor='var(--shu)';return;}el.style.borderColor='';}
    f.parentElement.innerHTML='<div class="form-done"><div class="ok">✓</div><h3>Request received</h3><p>Thank you. In the live version this goes straight to the shop and they confirm your time by phone. For anything urgent, call (714) 545 5090.</p></div>';});
})();
