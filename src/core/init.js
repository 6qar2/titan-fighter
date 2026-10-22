/* ═══ GAME INITIALIZATION ═══ */
function initGame(){
  diffCfg=DIFFICULTIES[selDiff]||DIFFICULTIES.normal;
  
  _diffBase={...diffCfg};
  reapplyUpgrades();
  cacheDOM();
  
  const ch=CHARS[selChar];
  score=0;lives=diffCfg.lives;wave=1;timeLeft=DURATION;
  combo=0;comboT=0;shootCD=0;spawnT=0;waveAdvancing=false;waveKills=0;
  gate=null;gateOpen=false;
  document.getElementById('gate-prompt').style.opacity='0';document.getElementById('gate-prompt').classList.remove('visible');
  bgCol={r:4,g:4,b:10};bgColTarget={r:4,g:4,b:10};
  totalKills=0;bestCombo=0;
  ammo=ch.maxAmmo;maxAmmo=ch.maxAmmo;ammoRegenAccum=0;
  powerCharge=0;powerCooldownTimer=0;
  gameState2={powerBuff:null,shockwave:null,meteorCount:0,meteorTimer:0,healAccum:0};
  bullets=[];eBullets=[];enemies=[];parts=[];ammoPacks=[];poisonTrails=[];smokeClods=[];powerups=[];dmgNums=[];killFeed=[];
  muzzleFlashes=[];bulletTrails=[];hitSparks=[];activeTurrets=[];
  curWeapon=WEAPONS.findIndex(w=>w.id===ch.weapon);weaponSwitchCD=0;killstreakBonus=0;
  window.shieldHits=0;window.doubleShot=false;window.dmgBuff=1;window.fireRateBuff=null;window.magnetRange=null;window.critChance=0;
  P.x=cv.width/2;P.y=cv.height-100;P.invinc=0;P.spdBuff=null;
  lowAmmoWarnShown=false;slowMo=1;slowMoTimer=0;shakeIntensity=0;shakeX=0;shakeY=0;activePowerups=[];
  const [mn,mx]=diffCfg.ammoPackInterval;nextAmmoPackTime=timeLeft-(mn+Math.random()*(mx-mn));
  mxP=cv.width/2;myP=cv.height/2;
  const badge=document.getElementById('diff-badge-hud');badge.textContent=diffCfg.label;badge.className='';badge.classList.add(selDiff);
  document.getElementById('club-hud').style.display='flex';
  document.getElementById('pname-hud').style.display='flex';
  document.getElementById('credits-hud').style.display='block';
  const ab=document.getElementById('autofire-btn');if(ab){ab.style.display=Mobile.isMobile?'flex':'none';ab.classList.toggle('active',Mobile.autoFire);}
  document.getElementById('hname').textContent=pName;
  document.getElementById('credits-count').textContent=credits;
  initStars();buildDots();updateHUD();updateAmmoHUD();updatePowerHUD();updateWeaponHUD();
  document.getElementById('minimap').style.display='block';
  bgStart(1);startTimer();gameStartTime=Date.now();
}
/* ═══ END GAME ═══ */
function endGame(){
  if(gState==='over')return;
  gState='over';clearInterval(timerID);bgStop();cancelAnimationFrame(animID);
  document.getElementById('minimap').style.display='none';
  
  document.getElementById('f-score').textContent=score.toLocaleString();
  document.getElementById('f-rank').textContent=rankMsg(score);
  document.getElementById('f-club-rank').textContent=clubRank(score);
  document.getElementById('fstat-wave').textContent=toRoman(wave);
  document.getElementById('fstat-kills').textContent=totalKills;
  document.getElementById('fstat-combo').textContent=bestCombo+'×';
  showScr('s-over');document.getElementById('hud').classList.add('off');document.getElementById('mctrl').classList.add('off');
  document.getElementById('club-hud').style.display='none';document.getElementById('pname-hud').style.display='none';document.getElementById('credits-hud').style.display='none';
  ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
  document.getElementById('kills-left').style.display='none';
  menuAnimActive=true;if(!menuRAF)menuRAF=requestAnimationFrame(drawStartBG);
  updateStats();checkAchievements();sfxVictory();
  
  CharProgression.addXp(CHARS[selChar].id,score);
  Profile.setLastChar(selChar);
  Profile.setLastDiff(selDiff);
}
