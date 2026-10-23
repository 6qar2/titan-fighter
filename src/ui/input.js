/* ═══ MOBILE GESTURES ═══ */
let touchStartX=0,touchStartY=0,touchStartTime=0;
let lastTapTime=0;
const SWIPE_THRESHOLD=50,TAP_MAX_DIST=15,JOYSTICK_DEADZONE=0.15;
let aimTouchX=0,aimTouchY=0,aimTouchActive=false;
document.addEventListener('touchstart',e=>{
  if(e.target.closest('#joystick-zone')||e.target.closest('#fire-btn')||e.target.closest('#power-btn')||e.target.closest('button')||e.target.closest('input'))return;
  if(e.touches.length===1){
    touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;touchStartTime=Date.now();
    if(Mobile.autoAim){aimTouchX=e.touches[0].clientX;aimTouchY=e.touches[0].clientY;aimTouchActive=true;}
  }
},{passive:false});
document.addEventListener('touchmove',e=>{
  if(aimTouchActive&&e.touches.length===1){
    aimTouchX=e.touches[0].clientX;aimTouchY=e.touches[0].clientY;
  }
},{passive:true});
document.addEventListener('touchend',e=>{
  aimTouchActive=false;
  if(touchStartX===0&&touchStartY===0)return;
  const dx=e.changedTouches[0].clientX-touchStartX;
  const dy=e.changedTouches[0].clientY-touchStartY;
  const dist=Math.hypot(dx,dy);
  const dt=Date.now()-touchStartTime;
  if(dist<TAP_MAX_DIST&&dt<300){
    const now=Date.now();
    if(now-lastTapTime<300&&gState==='play'){
      activatePower();wake();
    }
    lastTapTime=now;
  }
  else if(dist>SWIPE_THRESHOLD&&dt<500&&gState==='play'){
    if(Math.abs(dx)>Math.abs(dy)){
      if(dx>0){switchWeapon();wake();}
    }else{
      if(dy<0){activatePower();wake();}
    }
  }
  touchStartX=0;touchStartY=0;touchStartTime=0;
},{passive:false});

/* ═══ INPUT ═══ */
function isInputFocused(){const t=document.activeElement;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);}
document.addEventListener('keydown',e=>{if(isInputFocused())return;keys[e.code]=true;if(e.code==='Space'){e.preventDefault();shooting=true;wake();}});
document.addEventListener('keyup',e=>{if(isInputFocused())return;keys[e.code]=false;if(e.code==='Space')shooting=false;});
const IS_TOUCH='ontouchstart' in window;
cv.addEventListener('mousemove',e=>{if(IS_TOUCH)return;mxP=e.clientX;myP=e.clientY;const xh=document.getElementById('xhair');xh.style.left=e.clientX+'px';xh.style.top=e.clientY+'px';},{passive:true});
cv.addEventListener('mousedown',e=>{if(IS_TOUCH)return;if(e.button===0){shooting=true;wake();}});
cv.addEventListener('mouseup',e=>{if(IS_TOUCH)return;if(e.button===0)shooting=false;});
cv.style.cursor='none';
if('ontouchstart' in window)document.getElementById('xhair').style.display='none';

const jz=document.getElementById('joystick-zone'),jk=document.getElementById('joystick-knob'),JR=50;
let joyTouchId=null;
joystick.multiplier=1;
function jMove(cx2,cy2){const r=jz.getBoundingClientRect();const ox=cx2-r.left-r.width/2,oy=cy2-r.top-r.height/2;const dist=Math.hypot(ox,oy),cap=Math.min(dist,JR);const nx=dist>0?ox/dist:0,ny=dist>0?oy/dist:0;jk.style.left=(50+nx*cap/r.width*100)+'%';jk.style.top=(50+ny*cap/r.height*100)+'%';const normDist=dist/JR;const effectiveMax=normDist>0.3?1-(1-normDist)/0.7:0;const fd=Math.max(0,effectiveMax-JOYSTICK_DEADZONE)/(1-JOYSTICK_DEADZONE);joystick.dx=nx*fd*joystick.multiplier;joystick.dy=ny*fd*joystick.multiplier;}
function jReset(){joystick.active=false;joystick.dx=0;joystick.dy=0;jk.style.left='50%';jk.style.top='50%';joyTouchId=null;}
function resetJoystick(){if(joystick.active||joyTouchId!==null){joystick.active=false;joystick.dx=0;joystick.dy=0;jk.style.left='50%';jk.style.top='50%';joyTouchId=null;}}
jz.addEventListener('touchstart',e=>{e.preventDefault();wake();if(joyTouchId!==null)return;joystick.active=true;joyTouchId=e.touches[0].identifier;jMove(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
document.addEventListener('touchmove',e=>{if(!joystick.active||joyTouchId===null)return;for(let i=0;i<e.touches.length;i++){if(e.touches[i].identifier===joyTouchId){jMove(e.touches[i].clientX,e.touches[i].clientY);break;}}},{passive:false});
document.addEventListener('touchend',e=>{if(joyTouchId===null)return;for(let i=0;i<e.touches.length;i++){if(e.touches[i].identifier===joyTouchId)return;}jReset();},{passive:false});
document.addEventListener('touchcancel',e=>{jReset();},{passive:false});
jz.addEventListener('mousedown',e=>{if(IS_TOUCH)return;joystick.active=true;jMove(e.clientX,e.clientY);});
document.addEventListener('mousemove',e=>{if(IS_TOUCH)return;if(joystick.active)jMove(e.clientX,e.clientY);});
document.addEventListener('mouseup',()=>{if(IS_TOUCH)return;if(joystick.active){joystick.active=false;joystick.dx=0;joystick.dy=0;jk.style.left='50%';jk.style.top='50%';}});
const fb=document.getElementById('fire-btn');
fb.addEventListener('touchstart',e=>{e.preventDefault();shooting=true;wake();},{passive:false});
fb.addEventListener('touchend',e=>{e.preventDefault();shooting=false;},{passive:false});
fb.addEventListener('mousedown',()=>{if(IS_TOUCH)return;shooting=true;wake();});
fb.addEventListener('mouseup',()=>{if(IS_TOUCH)return;shooting=false;});
const pb2=document.getElementById('power-btn');
pb2.addEventListener('touchstart',e=>{e.preventDefault();activatePower();wake();},{passive:false});
pb2.addEventListener('mousedown',()=>{if(IS_TOUCH)return;activatePower();wake();});
const wb=document.getElementById('weapon-btn');
  if(wb){
    wb.addEventListener('touchstart',e=>{e.preventDefault();wake();},{passive:false});
    wb.addEventListener('mousedown',()=>{if(IS_TOUCH)return;wake();});
  }
if(ab){ab.addEventListener('touchstart',e=>{e.preventDefault();Mobile.toggleAutoFire();ab.classList.toggle('active');},{passive:false});ab.addEventListener('mousedown',()=>{if(IS_TOUCH)return;Mobile.toggleAutoFire();ab.classList.toggle('active');});}

