/* ═══ HAPTIC FEEDBACK ═══ */
let _lastHaptic=0;
function haptic(type){
  if(!navigator.vibrate)return;
  const now=performance.now();
  if(now-_lastHaptic<150)return;
  const patterns={
    light:[10],
    medium:[20],
    heavy:[30],
    success:[10,30,10],
    error:[30,10,30],
    power:[20,50,20]
  };
  const p=patterns[type]||patterns.light;
  _lastHaptic=now;
  try{navigator.vibrate(p);}catch(e){}
}

/* ═══ SETTINGS ═══ */
let settings={musicVol:0.8,sfxVol:1.0,particleDensity:3};
function loadSettings(){try{const s=JSON.parse(localStorage.getItem('titans_settings'));if(s)settings={...settings,...s};}catch(e){}document.getElementById('music-vol').value=settings.musicVol*100;document.getElementById('sfx-vol').value=settings.sfxVol*100;document.getElementById('particle-density').value=settings.particleDensity;updateSettingsLabels();}
function saveSettings(){localStorage.setItem('titans_settings',JSON.stringify(settings));}
function updateSettingsLabels(){document.getElementById('music-vol-lbl').textContent=Math.round(settings.musicVol*100)+'%';document.getElementById('sfx-vol-lbl').textContent=Math.round(settings.sfxVol*100)+'%';const pLbl={1:'LOW',2:'MED',3:'HIGH'};document.getElementById('particle-lbl').textContent=pLbl[settings.particleDensity]||'HIGH';}

/* ═══ STATISTICS ═══ */
let stats={totalKills:0,gamesPlayed:0,bestScore:0,bestWave:1,bestCombo:0,headshots:0,playTime:0,accuracy:{shots:0,hits:0}};
function loadStats(){try{const s=JSON.parse(localStorage.getItem('titans_stats'));if(s)stats={...stats,...s};}catch(e){}}
function saveStats(){localStorage.setItem('titans_stats',JSON.stringify(stats));}
function updateStats(){stats.totalKills+=totalKills;stats.gamesPlayed++;stats.bestScore=Math.max(stats.bestScore,score);stats.bestWave=Math.max(stats.bestWave,wave);stats.bestCombo=Math.max(stats.bestCombo,bestCombo);stats.playTime+=Math.floor((Date.now()-gameStartTime)/1000);saveStats();}
function renderStats(){document.getElementById('st-total-kills').textContent=stats.totalKills.toLocaleString();document.getElementById('st-games').textContent=stats.gamesPlayed;document.getElementById('st-best-score').textContent=stats.bestScore.toLocaleString();document.getElementById('st-best-wave').textContent=toRoman(stats.bestWave);document.getElementById('st-best-combo').textContent=stats.bestCombo+'×';const acc=stats.accuracy.shots>0?Math.round(stats.accuracy.hits/stats.accuracy.shots*100):0;document.getElementById('st-accuracy').textContent=acc+'%';document.getElementById('st-headshots').textContent=stats.headshots;const hrs=Math.floor(stats.playTime/3600);const mins=Math.floor((stats.playTime%3600)/60);document.getElementById('st-time').textContent=hrs>0?`${hrs}h ${mins}m`:`${mins}m`;}

/* ═══ MOBILE SETTINGS ═══ */
function renderMobileSettings(){
  const container=document.getElementById('mobile-settings-container');
  if(!container)return;
  container.innerHTML='';
  const header=document.createElement('div');
  header.style.cssText="font-family:'Cinzel Decorative',serif;font-size:.55rem;letter-spacing:2px;color:var(--gold-dim);margin:.3rem 0 .15rem;text-transform:uppercase;";
  header.textContent='Mobile & Display';
  container.appendChild(header);
  const settings=[
    {label:'ONE-HANDED MODE',desc:'Adjust HUD for one-handed play',active:Mobile.oneHanded,action:()=>{Mobile.toggleOneHanded();renderMobileSettings();}},
    {label:'AUTO FIRE',desc:'Automatically fire weapons',active:Mobile.autoFire,action:()=>{Mobile.toggleAutoFire();renderMobileSettings();}},
    {label:'AUTO AIM',desc:'Auto-target nearest enemy when aiming',active:Mobile.autoAim,action:()=>{Mobile.toggleAutoAim();renderMobileSettings();}},
    {label:'SCREEN SHAKE',desc:'Screen shake effects',active:Mobile.screenShake,action:()=>{Mobile.toggleScreenShake();renderMobileSettings();}},
    {label:'COLORBLIND MODE',desc:'Enhanced colors for colorblind players',active:Accessibility.colorblindMode,action:()=>{Accessibility.toggleColorblind();renderMobileSettings();}},
    {label:'HIGH CONTRAST',desc:'Increase contrast for better visibility',active:Accessibility.highContrast,action:()=>{Accessibility.toggleHighContrast();renderMobileSettings();}},
    {label:'REDUCED MOTION',desc:'Minimize animations',active:Accessibility.reduceMotion,action:()=>{Accessibility.toggleReduceMotion();renderMobileSettings();}}
  ];
  settings.forEach(s=>{
    const item=document.createElement('div');
    item.className='setting-item';
    item.innerHTML=`<div class="setting-label">${s.label}</div><div class="toggle-btn ${s.active?'active':''}"><div class="toggle-knob"></div></div>`;
    item.addEventListener('click',s.action);
    container.appendChild(item);
  });
}

/* ═══ BUTTON WIRING ═══ */
function wireUI(){
  document.getElementById('btn-start').addEventListener('click',()=>{wake();const raw=document.getElementById('pname').value.trim();const clean=raw.replace(/[<>]/g,'');if(!clean){alert('Enter your name, Warrior');return;}pName=clean.toUpperCase();Profile.setName(pName);showScr('s-diff');menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;});
  document.getElementById('btn-diff-next').addEventListener('click',()=>{showScr('s-chars');});
  document.getElementById('btn-diff-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF&&cancelAnimationFrame(menuRAF);menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-enter-arena').addEventListener('click',()=>{
    wake();showScr(null);document.getElementById('hud').classList.remove('off');
    if('ontouchstart' in window||window.innerWidth<=900)document.getElementById('mctrl').classList.remove('off');
    gState='play';menuAnimActive=false;initGame();lastTS=performance.now();showWaveAnnounce(1);sfxStartGame();animID=requestAnimationFrame(loop);
  });
  document.getElementById('btn-back-diff').addEventListener('click',()=>{showScr('s-diff');});
  document.getElementById('btn-replay').addEventListener('click',()=>{
    wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;showScr(null);
    document.getElementById('hud').classList.remove('off');
    if('ontouchstart' in window||window.innerWidth<=900)document.getElementById('mctrl').classList.remove('off');
    ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
    document.getElementById('kills-left').style.display='none';
    gState='play';initGame();lastTS=performance.now();showWaveAnnounce(1);sfxStartGame();animID=requestAnimationFrame(loop);
  });
  document.getElementById('btn-menu').addEventListener('click',()=>{
    bgStop();gState='menu';menuAnimActive=true;showScr('s-start');
    document.getElementById('hud').classList.add('off');document.getElementById('mctrl').classList.add('off');
    document.getElementById('club-hud').style.display='none';document.getElementById('pname-hud').style.display='none';
    document.getElementById('htimer').classList.remove('warn');
    ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
    document.getElementById('kills-left').style.display='none';initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);
  });
  document.getElementById('btn-start-settings').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderMobileSettings();setScreenFrom('s-start','s-settings');});
  document.getElementById('btn-start-stats').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderStats();setScreenFrom('s-start','s-stats');});
  document.getElementById('pname').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('btn-start').click();});
  /* ═══ PAUSE MENU ═══ */
  const pauseOverlay=document.getElementById('pause-overlay');
  function togglePause(){
    if(gState!=='play')return;
    isPaused=!isPaused;
    if(isPaused){pauseOverlay.classList.add('visible');bgStop();}
    else{pauseOverlay.classList.remove('visible');bgStart(wave);}
  }
  document.addEventListener('keydown',e=>{
    if(isInputFocused())return;
    if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();togglePause();}
  });
  document.getElementById('btn-resume').addEventListener('click',()=>{isPaused=false;pauseOverlay.classList.remove('visible');bgStart(wave);lastTS=performance.now();animID=requestAnimationFrame(loop);});
  document.getElementById('btn-quit').addEventListener('click',()=>{document.getElementById('quit-confirm').classList.add('visible');});
  document.getElementById('btn-quit-no').addEventListener('click',()=>{document.getElementById('quit-confirm').classList.remove('visible');});
  document.getElementById('btn-quit-yes').addEventListener('click',()=>{document.getElementById('quit-confirm').classList.remove('visible');isPaused=false;pauseOverlay.classList.remove('visible');endGame();showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
   document.getElementById('btn-pause-settings').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');setScreenFrom('s-pause','s-settings');renderMobileSettings();});
   document.getElementById('btn-pause-stats').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');setScreenFrom('s-pause','s-stats');renderStats();});
   document.getElementById('btn-settings-back').addEventListener('click',()=>{
      const from=getScreenFrom();
      if(from==='s-pause'){isPaused=false;showScr(null);pauseOverlay.classList.add('visible');lastTS=performance.now();animID=requestAnimationFrame(loop);}
      else{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);}
   });
   document.getElementById('btn-stats-back').addEventListener('click',()=>{
      const from=getScreenFrom();
      if(from==='s-pause'){isPaused=false;showScr(null);pauseOverlay.classList.add('visible');lastTS=performance.now();animID=requestAnimationFrame(loop);}
      else{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);}
   });

  document.getElementById('music-vol').addEventListener('input',e=>{settings.musicVol=e.target.value/100;updateSettingsLabels();saveSettings();if(bgGain)bgGain.gain.value=.7*settings.musicVol;});
  document.getElementById('sfx-vol').addEventListener('input',e=>{settings.sfxVol=e.target.value/100;updateSettingsLabels();saveSettings();});
  document.getElementById('particle-density').addEventListener('input',e=>{settings.particleDensity=parseInt(e.target.value);updateSettingsLabels();saveSettings();});
  
  /* ═══ PROFILE ═══ */
  function updateProfileNameField(){const el=document.getElementById('profile-name');if(el)el.value=Profile.getName();}
  const profileNameInput=document.getElementById('profile-name');
  if(profileNameInput){
    updateProfileNameField();
    profileNameInput.addEventListener('change',()=>{
      const name=profileNameInput.value.trim().replace(/[<>]/g,'');
      if(name){Profile.setName(name);pName=Profile.getName();showPowerAnnounce('NAME UPDATED');}
    });
  }
  const btnResetProfile=document.getElementById('btn-reset-profile');
  if(btnResetProfile){
    btnResetProfile.addEventListener('click',()=>{
      if(confirm('Reset all profile data? This cannot be undone.')){Profile.reset();updateProfileNameField();pName=Profile.getName();showPowerAnnounce('PROFILE RESET');}
    });
  }
}
