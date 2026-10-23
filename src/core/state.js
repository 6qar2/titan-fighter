/* ═══ GAME STATE ═══ */
let selChar=0;
const DURATION=300;
let gState='menu';
let pName='TITAN';
let score,lives,wave,timeLeft,combo,comboT,shootCD,spawnT,waveAdvancing,waveKills;
let gate=null,gateOpen=false;
let bgCol={r:4,g:4,b:10},bgColTarget={r:4,g:4,b:10};
let ammo,maxAmmo,ammoRegenAccum;
let powerCharge=0,powerCooldownTimer=0;
let bullets=[],eBullets=[],enemies=[],parts=[],stars=[],ammoPacks=[];
let poisonTrails=[];
let smokeClods=[];
let powerups=[];
let keys={},mxP=0,myP=0;
let DOM={};
function cacheDOM(){DOM.vignette=document.getElementById('vignette');DOM.combo=document.getElementById('combo');DOM.ammoFlash=document.getElementById('ammo-flash');DOM.lowAmmo=document.getElementById('low-ammo-warn');DOM.killsLeft=document.getElementById('kills-left-num');DOM.xhair=document.getElementById('xhair');DOM.fireBtn=document.getElementById('fire-btn');}
let shooting=false;
let lastTS=0,timerID=null,animID=null;
let totalKills=0,bestCombo=0;
let nextAmmoPackTime=0;
let powerWasReady=false;
const P={x:0,y:0,w:32,h:32,invinc:0};
let joystick={active:false,dx:0,dy:0};
let lowAmmoWarnShown=false,lastEmptyClick=0;
let diffCfg=DIFFICULTIES.normal;
let gameState2={powerBuff:null,shockwave:null,meteorCount:0,meteorTimer:0,healAccum:0};
let slowMo=1,slowMoTimer=0;
let shakeX=0,shakeY=0,shakeIntensity=0;
let isPaused=false;
let killstreakBonus=0;
let curWeapon=0,weaponSwitchCD=0;
let activePowerups=[];
let dmgNums=[],killFeed=[];
let muzzleFlashes=[],bulletTrails=[],hitSparks=[],activeTurrets=[];
let deadEnemies=[];
let _lastCombatIntensity=-1;
let _combatGradient=null;
let _nearestEnemy=null;
let _frameNow=0;
let gameStartTime=0;
function initStars(){stars=[];for(let i=0;i<80;i++)stars.push({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.2+.2,spd:Math.random()*16+3,a:Math.random()*.35+.07});}
function buildDots(){const el=document.getElementById('ldots');el.innerHTML='';for(let i=0;i<lives;i++){const d=document.createElement('div');d.className='ldot';d.id='d'+i;el.appendChild(d);}}
function refreshDots(){document.querySelectorAll('.ldot').forEach((d,i)=>{d.className='ldot'+(i>=lives?' dead':'');});}
function startTimer(){
  clearInterval(timerID);
  timerID=setInterval(()=>{
    if(gState!=='play')return;timeLeft--;updateHUD();
    const t=document.getElementById('htimer');
    if(timeLeft<=30)t.classList.add('warn');else t.classList.remove('warn');
    if(timeLeft<=0){endGame();return;}
    const [mn,mx]=diffCfg.ammoPackInterval;
    if(timeLeft<=nextAmmoPackTime&&nextAmmoPackTime>0){spawnAmmoPack();nextAmmoPackTime-=(mn+Math.random()*(mx-mn));}
  },1000);
}
function updateHUD(){
  document.getElementById('hscore').textContent=score.toLocaleString();
  const m=Math.floor(timeLeft/60),s=timeLeft%60;
  document.getElementById('htimer').textContent=`${m}:${s.toString().padStart(2,'0')}`;
  document.getElementById('hwave').textContent=toRoman(wave);
  const quota=Math.min(60,6+wave*2),remaining=Math.max(0,quota-waveKills);
  const kl=document.getElementById('kills-left');
  if(!gateOpen&&!waveAdvancing&&gState==='play'){kl.style.display='block';document.getElementById('kills-left-num').textContent=remaining;}
  else kl.style.display='none';
}
function updateAmmoHUD(){
  const pct=ammo/maxAmmo;const bar=document.getElementById('ammo-bar'),count=document.getElementById('ammo-count');
  bar.style.width=(pct*100)+'%';count.textContent=ammo;
  if(pct<=.25){bar.classList.add('low');count.classList.add('low');}else{bar.classList.remove('low');count.classList.remove('low');}
  if(ammo===0)count.classList.add('empty');else count.classList.remove('empty');
  if(ammo<=Math.ceil(maxAmmo*.25)&&!lowAmmoWarnShown){lowAmmoWarnShown=true;(DOM.lowAmmo||document.getElementById('low-ammo-warn')).style.opacity='1';haptic('light');setTimeout(()=>{const el=DOM.lowAmmo||document.getElementById('low-ammo-warn');el.style.opacity='0';},2500);}
  if(ammo>Math.ceil(maxAmmo*.25))lowAmmoWarnShown=false;
}
function updatePowerHUD(){
  const ready=powerCharge>=1&&powerCooldownTimer<=0;
  const pbar=document.getElementById('power-bar'),pcount=document.getElementById('power-count');
  const pcool=document.getElementById('power-btn');
  const pct=Math.min(1,powerCharge);
  pbar.style.width=(pct*100)+'%';
  pcount.textContent=ready?'READY!':Math.round(pct*100)+'%';
  if(ready){pbar.classList.add('ready');pcount.classList.add('ready');pcool.classList.add('ready');}
  else{pbar.classList.remove('ready');pcount.classList.remove('ready');pcool.classList.remove('ready');}
}
function updateWeaponHUD(){
  const wp=WEAPONS[curWeapon];
  document.getElementById('weapon-name').textContent=wp.name;
  document.getElementById('weapon-icon').textContent=wp.icon;
  updateFireButtonState();
  const btnIcon=document.getElementById('weapon-btn-icon');
  const btnName=document.getElementById('weapon-btn-name');
  if(btnIcon)btnIcon.textContent=wp.icon;
  if(btnName)btnName.textContent=wp.name;
}
function updateFireButtonState(){
  if(!Mobile.isMobile)return;
  const fb=DOM.fireBtn||(DOM.fireBtn=document.getElementById('fire-btn'));
  if(!fb)return;
  if(ammo<=0){fb.classList.add('disabled');fb.style.opacity='0.4';}
  else{fb.classList.remove('disabled');fb.style.opacity='1';}
  const wp=WEAPONS[curWeapon];
  const fireInterval=CHARS[selChar].fire/(window.fireRateBuff||1);
  const pct=(fireInterval-shootCD)/fireInterval;
  let after=fb.querySelector('.cooldown-overlay');
  if(!after){after=document.createElement('div');after.className='cooldown-overlay';after.style.cssText='position:absolute;inset:0;background:linear-gradient(90,rgba(0,0,0,0.6),transparent);width:'+((1-pct)*100)+'%;transition:width .1s;z-index:1;';fb.appendChild(after);}
  else{after.style.width=((1-pct)*100)+'%';}
}
function showPowerAnnounce(txt,dur=2000){const el=document.getElementById('power-announce');el.textContent=txt;el.style.opacity='1';setTimeout(()=>{el.style.opacity='0';},dur);document.getElementById('power-flash').style.opacity='1';setTimeout(()=>{document.getElementById('power-flash').style.opacity='0';},200);}
function showWaveAnnounce(n){
  const el=document.getElementById('wave-announce');const prof=getWaveMusic(n);const moodLabel=n<=2?'MARCH':n<=4?'ADVANCE':n<=6?'ASSAULT':n<=10?'FURY':'TITAN';
  const clubMsg=n>=15?'♛ TITANS CLUB · TITAN ASCENDANT':n>=10?'♛ TITANS CLUB · FINAL STAND':n>=7?'✦ TITANS CLUB · ELITE ONSLAUGHT':n>=5?'⚔ TITANS CLUB · ADVANCE':n>=3?'✦ TITANS CLUB · MARCH':'♛ TITANS CLUB · RECRUIT TRIAL';
  const extraMsg=n>=15?'☀ ASCENDANT TITAN':n>=10?'☀ FACE THE TITAN GOD':n>=9?'⚑ TITAN HERALD APPROACHES':'';
  el.innerHTML=`WAVE ${toRoman(n)}<br><span style="font-family:'Barlow Condensed';font-size:.72rem;letter-spacing:4px;color:var(--ash);">${moodLabel} · ${prof.bpm} BPM</span><br><span style="font-family:'Cinzel';font-size:.55rem;letter-spacing:3px;color:var(--gold-dim);">${clubMsg}</span>${extraMsg?`<br><span style="font-family:'Cinzel Decorative';font-size:.6rem;letter-spacing:2px;color:var(--red-hot);">${extraMsg}</span>`:''}`;
  el.style.opacity='1';setTimeout(()=>{el.style.opacity='0';},2500);
  if(n>=5)triggerShake(3,200);
  if(n>=10){triggerSlowMo(0.6,0.3);triggerShake(10,400);spawnParts(cv.width/2,cv.height/2,'#FFD700',40);sfxBigBoom();}
  bgTransition(n);
}
function showEnemyWarn(msg){const el=document.getElementById('enemy-warn');el.textContent=msg;el.style.opacity='1';setTimeout(()=>{el.style.opacity='0';},2200);}
function triggerSlowMo(duration, intensity){slowMoTimer=duration;slowMo=intensity||0.25;}
function triggerShake(intensity, duration){if(!Mobile.screenShake)return;shakeIntensity=intensity||8;setTimeout(()=>{shakeIntensity=0;},duration||300);}
function activatePower(){
  const ch=CHARS[selChar];if(powerCharge<1||powerCooldownTimer>0)return;
  powerCharge=0;powerCooldownTimer=ch.powerCooldown;
  triggerSlowMo(0.4, 0.3);
  triggerShake(6, 250);
  sfxPower();spawnPop(P.x,P.y-30,'✦ '+ch.powerName,'power');
  ch.power(gameState2);updatePowerHUD();haptic('power');
}
function switchWeapon(){
  if(weaponSwitchCD>0)return;
  weaponSwitchCD=.3;
  const ch=CHARS[selChar];
  const wp=WEAPONS[curWeapon];
  showWeaponDetail(wp);
  updateWeaponHUD();
}

function showWeaponDetail(wp){
  const pop=document.createElement('div');
  pop.className='spop weapon-detail';
  pop.innerHTML=`<div style="font-family:'Cinzel',serif;font-size:.45rem;letter-spacing:2px;color:${wp.color};text-transform:uppercase;margin-bottom:2px;">${wp.name}</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:.35rem;letter-spacing:1px;color:var(--parchment);">DMG:${wp.dmg} · SPD:${wp.spd} · ${wp.pierce?'PIERCING':''}${wp.explosive?'EXPLOSIVE':''}</div>`;
  pop.style.left=(P.x-30)+'px';pop.style.top=(P.y-35)+'px';
  document.body.appendChild(pop);
  setTimeout(()=>pop.remove(),1000);
}