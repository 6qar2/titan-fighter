/* ═══ GAME INITIALIZATION ═══ */
function initGame(){
  const baseDiff=(MP2.roomCode&&MP2.playerId)?(MP2.diff||selDiff):(MP.roomCode&&MP.playerId?(MP.roomDiff||selDiff):selDiff);
  diffCfg=DIFFICULTIES[baseDiff]||DIFFICULTIES.normal;
  if(MP.roomCode&&MP.playerId){diffCfg={...diffCfg,enemyHpMult:diffCfg.enemyHpMult*1.3,enemyFireMult:diffCfg.enemyFireMult*1.15};}
  if(MP2.roomCode&&MP2.playerId){diffCfg={...diffCfg,enemyHpMult:diffCfg.enemyHpMult*1.2,enemyFireMult:diffCfg.enemyFireMult*1.1};}
  
  if(GameModes.current==='endless'){diffCfg={...diffCfg,lives:1,timeLimit:0};}
  else if(GameModes.current==='daily'){diffCfg={...diffCfg,lives:2,timeLimit:300};}
  else if(GameModes.current==='bossrush'){diffCfg={...diffCfg,lives:3,timeLimit:0};}
  
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
  curWeapon=0;weaponSwitchCD=0;waveModifier=null;waveModifierTimer=0;killstreakBonus=0;
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
  
  if(GameModes.current==='endless'){
    GameModes.startEndless();
  }else if(GameModes.current==='daily'){
    GameModes.startDaily();
  }else if(GameModes.current==='bossrush'){
    GameModes.startBossRush();
  }
  
  if(GameModes.current!=='campaign'){
    const modeBadge=document.getElementById('mode-badge');
    if(modeBadge){
      modeBadge.textContent=GameModes.getModeConfig().name;
      modeBadge.className='mode-badge '+GameModes.current;
      modeBadge.style.display='block';
    }
  }else{
    const modeBadge=document.getElementById('mode-badge');
    if(modeBadge)modeBadge.style.display='none';
  }
  
  applyWaveModifier();
}
/* ═══ END GAME ═══ */
function endGame(){
  if(gState==='over')return;
  gState='over';clearInterval(timerID);bgStop();cancelAnimationFrame(animID);
  document.getElementById('minimap').style.display='none';
  document.getElementById('mode-badge').style.display='none';
  
  const modeResult=GameModes.getResult();
  if(modeResult){
    document.getElementById('f-score').textContent=modeResult.score.toLocaleString();
    document.getElementById('f-rank').textContent=modeResult.title;
    document.getElementById('f-club-rank').textContent=modeResult.subtitle;
  }else{
    document.getElementById('f-score').textContent=score.toLocaleString();
    document.getElementById('f-rank').textContent=rankMsg(score);
    document.getElementById('f-club-rank').textContent=clubRank(score);
  }
  document.getElementById('fstat-wave').textContent=toRoman(wave);
  document.getElementById('fstat-kills').textContent=totalKills;
  document.getElementById('fstat-combo').textContent=bestCombo+'×';
  showScr('s-over');document.getElementById('hud').classList.add('off');document.getElementById('mctrl').classList.add('off');
  document.getElementById('club-hud').style.display='none';document.getElementById('pname-hud').style.display='none';document.getElementById('credits-hud').style.display='none';
  ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
  document.getElementById('kills-left').style.display='none';
  menuAnimActive=true;if(!menuRAF)menuRAF=requestAnimationFrame(drawStartBG);
  updateStats();checkAchievements();sfxVictory();
  
  if(GameModes.current==='endless'){
    ExpandedStats.recordEndlessWave(GameModes.endlessWave);
  }else if(GameModes.current==='daily'){
    ExpandedStats.recordDailyComplete();
  }else if(GameModes.current==='bossrush'){
    ExpandedStats.recordBossDefeated();
  }
  
  CharProgression.addXp(CHARS[selChar].id,score);
  
  if(MP.roomCode&&MP.playerId){
    mpSubmitScore(score);
    if(MP.host&&MP.roomRef){
      MP.roomRef.child('status').set('ended');
      MP.roomRef.child('endedAt').set(firebase.database.ServerValue.TIMESTAMP);
    }
  }else if(MP2.roomCode&&MP2.playerId){
    mp2SubmitScore(score);
    if(MP2.host&&MP2.roomRef){
      MP2.roomRef.child('status').set('ended');
      MP2.roomRef.child('endedAt').set(firebase.database.ServerValue.TIMESTAMP);
    }
  }else{
    spSubmitScore(score);
  }
  
  GameModes.reset();
  
  if(MP2.roomCode&&MP2.playerId){
    if(MP2.roomRef)MP2.roomRef.off();
    mp2Reset();
  }
  
  Profile.setLastChar(selChar);
  Profile.setLastDiff(selDiff);
}
