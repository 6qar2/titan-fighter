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

/* ═══ ACHIEVEMENTS ═══ */
const ACHIEVEMENTS=[
  {id:'first_blood',name:'FIRST BLOOD',desc:'Kill your first enemy',icon:'⚔',check:s=>s.totalKills>=1},
  {id:'combo_5',name:'CLUB STRIKE',desc:'Reach a 5× combo',icon:'✦',check:s=>s.bestCombo>=5},
  {id:'combo_10',name:'LEGIONARY',desc:'Reach a 10× combo',icon:'♛',check:s=>s.bestCombo>=10},
  {id:'combo_20',name:'IMMORTAL',desc:'Reach a 20× combo',icon:'☀',check:s=>s.bestCombo>=20},
  {id:'wave_5',name:'ADVANCE',desc:'Reach Wave 5',icon:'⚔',check:s=>s.bestWave>=5},
  {id:'wave_10',name:'FINAL STAND',desc:'Reach Wave 10',icon:'♛',check:s=>s.bestWave>=10},
  {id:'score_5k',name:'RISING STAR',desc:'Score 5,000 points',icon:'⭐',check:s=>s.bestScore>=5000},
  {id:'score_20k',name:'TITAN PRIME',desc:'Score 20,000 points',icon:'☀',check:s=>s.bestScore>=20000},
  {id:'games_10',name:'VETERAN',desc:'Play 10 games',icon:'🏆',check:s=>s.gamesPlayed>=10},
  {id:'games_50',name:'LEGEND',desc:'Play 50 games',icon:'♛',check:s=>s.gamesPlayed>=50},
  {id:'accuracy',name:'SHARPSHOOTER',desc:'90%+ accuracy',icon:'🎯',check:s=>s.accuracy.shots>10&&s.accuracy.hits/s.accuracy.shots>=0.9},
  {id:'titan_hunter',name:'TITAN HUNTER',desc:'Defeat 50 Titan Club enemies',icon:'⚔',check:s=>s.headshots>=50}
];
let unlockedAchievements=new Set();
function loadAchievements(){try{const a=JSON.parse(localStorage.getItem('titans_achievements'));if(a)unlockedAchievements=new Set(a);}catch(e){unlockedAchievements=new Set();}}
function saveAchievements(){localStorage.setItem('titans_achievements',JSON.stringify([...unlockedAchievements]));}
function checkAchievements(){ACHIEVEMENTS.forEach(ach=>{if(!unlockedAchievements.has(ach.id)&&ach.check(stats)){unlockedAchievements.add(ach.id);saveAchievements();showPowerAnnounce('🏆 '+ach.name);spawnParts(cv.width/2,cv.height/2,'#FFD700',30);triggerShake(5,200);sfxComboMilestone();}});}
function renderAchievements(){const list=document.getElementById('achievements-list');list.innerHTML='';ACHIEVEMENTS.forEach(ach=>{const unlocked=unlockedAchievements.has(ach.id);const card=document.createElement('div');card.className='achievement-card'+(unlocked?' unlocked':'');card.innerHTML=`<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-name">${ach.name}</div><div class="ach-desc">${ach.desc}</div></div>`;list.appendChild(card);});}

/* ═══ UPGRADES ═══ */
let _CHARS_BASE=[];
let _diffBase=null;
const UPGRADES=[
  {id:'ammo_cap',name:'AMMO CAPACITY',desc:'+5 max ammo',icon:'📦',cost:100,type:'ammo',maxLevel:5,current:0,apply:(lvl=1)=>{maxAmmo+=5*lvl;}},
  {id:'fire_rate',name:'RAPID FIRE',desc:'15% faster fire rate',icon:'⚡',cost:150,type:'fire',maxLevel:5,current:0,apply:(lvl=1)=>{CHARS.forEach(c=>{c.fire*=Math.pow(0.85,lvl);});}},
  {id:'damage',name:'HEAVY ROUNDS',desc:'+20% bullet damage',icon:'💥',cost:200,type:'dmg',maxLevel:5,current:0,apply:(lvl=1)=>{CHARS.forEach(c=>{c.dmg*=Math.pow(1.2,lvl);});}},
  {id:'speed',name:'AGILITY',desc:'+10% movement speed',icon:'👟',cost:120,type:'spd',maxLevel:5,current:0,apply:(lvl=1)=>{CHARS.forEach(c=>{c.spd*=Math.pow(1.1,lvl);});}},
  {id:'regen',name:'AMMO REGEN',desc:'Faster ammo regeneration',icon:'🔄',cost:180,type:'regen',maxLevel:3,current:0,apply:(lvl=1)=>{if(_diffBase)diffCfg.ammoRegenRate*=_diffBase.ammoRegenRate?Math.pow(1.4,lvl):1.4;}},
  {id:'shield',name:'EXTRA LIFE',desc:'+1 maximum life',icon:'🛡️',cost:250,type:'life',maxLevel:3,current:0,apply:(lvl=1)=>{if(_diffBase)diffCfg.lives+=lvl;}},
  {id:'crit',name:'CRITICAL STRIKE',desc:'10% chance for 2× damage',icon:'🎯',cost:300,type:'crit',maxLevel:3,current:0,apply:(lvl=1)=>{window.critChance=(window.critChance||0)+0.1*lvl;}}
];
let credits=0;
let upgrades={};
function loadUpgrades(){try{const u=JSON.parse(localStorage.getItem('titans_upgrades'));if(u){upgrades=u;credits=u.credits||0;}const u2=JSON.parse(localStorage.getItem('titans_upgrade_levels'));if(u2)UPGRADES.forEach(ug=>{if(u2[ug.id]!==undefined)ug.current=u2[ug.id];});}catch(e){}}
function saveUpgrades(){localStorage.setItem('titans_upgrades',JSON.stringify({...upgrades,credits}));localStorage.setItem('titans_upgrade_levels',JSON.stringify(UPGRADES.reduce((a,u)=>(a[u.id]=u.current,a),{})));}
function earnCredits(amount){credits+=amount;const creditsEl=document.getElementById('credits-count');if(creditsEl)creditsEl.textContent=credits;saveUpgrades();}
function storeBaseStats(){_CHARS_BASE=CHARS.map(c=>({fire:c.fire,dmg:c.dmg,spd:c.spd}));_diffBase=null;}
function reapplyUpgrades(){if(_CHARS_BASE.length===0){storeBaseStats();}CHARS.forEach((c,i)=>{c.fire=_CHARS_BASE[i].fire;c.dmg=_CHARS_BASE[i].dmg;c.spd=_CHARS_BASE[i].spd;});if(_diffBase){diffCfg={..._diffBase};}window.critChance=0;if(typeof CharProgression!=='undefined'&&CharProgression._baseStats)CharProgression.reapplyAllBonuses();maxAmmo=CHARS[selChar].maxAmmo;UPGRADES.forEach(ug=>{if(ug.current>0)ug.apply(ug.current);});}
function renderUpgrades(){document.getElementById('credits-count').textContent=credits;const list=document.getElementById('upgrades-list');list.innerHTML='';UPGRADES.forEach(upg=>{const owned=upg.current>=upg.maxLevel;const canAfford=credits>=upg.cost;const card=document.createElement('div');card.className='upgrade-card'+(owned?' owned':'');card.innerHTML=`<div class="upg-icon">${upg.icon}</div><div class="upg-info"><div class="upg-name">${upg.name} ${owned?'[MAX]':`[${upg.current}/${upg.maxLevel}]`}</div><div class="upg-desc">${upg.desc}</div></div><div class="upg-cost">${owned?'MAXED':upg.cost+' CREDITS'}</div>`;if(!owned&&canAfford){card.addEventListener('click',()=>{if(credits>=upg.cost&&upg.current<upg.maxLevel){credits-=upg.cost;upg.current++;saveUpgrades();reapplyUpgrades();renderUpgrades();showPowerAnnounce('⬆ '+upg.name+' UPGRADED');sfxCombo();}});}list.appendChild(card);});}

/* ═══ SHOP ═══ */
function renderShop(){
  const grid=document.getElementById('shop-grid');
  const creditsEl=document.getElementById('shop-credits');
  if(creditsEl)creditsEl.textContent=credits;
  grid.innerHTML='';
  const items=[
    {id:'plasma_gun',name:'PLASMA GUN',icon:'🔮',cost:500,type:'weapon',desc:'High damage piercing energy weapon'},
    {id:'flamethrower',name:'FLAMETHROWER',icon:'🔥',cost:400,type:'weapon',desc:'Close range area damage'},
    {id:'crossbow',name:'CROSSBOW',icon:'🏹',cost:600,type:'weapon',desc:'Extreme damage, slow fire rate'},
    {id:'skin_gold',name:'GOLD SKIN',icon:'🎨',cost:300,type:'skin',desc:'Legendary golden appearance'},
    {id:'ammo_pack',name:'AMMO PACK',icon:'📦',cost:50,type:'consumable',desc:'Refill all ammo'},
    {id:'extra_life',name:'EXTRA LIFE',icon:'❤️',cost:150,type:'consumable',desc:'+1 life for next game'}
  ];
  items.forEach(item=>{
    const card=document.createElement('div');
    card.className='shop-card';
    card.innerHTML=`<div class="shop-icon">${item.icon}</div><div class="shop-name">${item.name}</div><div class="shop-cost">${item.cost} CREDITS</div>`;
    card.addEventListener('click',()=>{
      if(credits>=item.cost){
        credits-=item.cost;
        saveUpgrades();
        if(item.type==='weapon'){
          if(!ExpandedStats.weaponsUnlocked.includes(item.id)){ExpandedStats.weaponsUnlocked.push(item.id);ExpandedStats.save();}
          showPowerAnnounce('🎯 '+item.name+' UNLOCKED');
        }else if(item.type==='skin'){
          Cosmetics.ownedSkins.push(item.id);
          Cosmetics.save();
          showPowerAnnounce('🎨 '+item.name+' UNLOCKED');
        }else{
          showPowerAnnounce('✨ '+item.name+' PURCHASED');
        }
        renderShop();
      }else{
        showPowerAnnounce('⚠ NOT ENOUGH CREDITS');
      }
    });
    grid.appendChild(card);
  });
}

/* ═══ EVENTS ═══ */
function renderEvents(){
  const container=document.getElementById('events-container');
  container.innerHTML='';
  const events=Social.getActiveEvents();
  if(events.length===0){
    container.innerHTML='<div style="text-align:center;padding:2rem;color:var(--ash);font-family:\'Cinzel\',serif;font-size:.7rem;letter-spacing:2px;">NO ACTIVE EVENTS</div>';
    return;
  }
  events.forEach(evt=>{
    const card=document.createElement('div');
    card.className='event-card';
    card.innerHTML=`<div class="event-icon">🏆</div><div class="event-info"><div class="event-name">${evt.name}</div><div class="event-desc">${evt.desc}</div></div><div class="event-status">ACTIVE</div>`;
    container.appendChild(card);
  });
}

/* ═══ PROGRESSION ═══ */
function renderProgression(){
  const container=document.getElementById('progression-content');
  container.innerHTML='';
  CHARS.forEach(ch=>{
    const level=CharProgression.getLevel(ch.id);
    const xp=CharProgression.getXp(ch.id);
    const xpNeeded=CharProgression.getXpNeeded(ch.id);
    const xpPct=Math.min(100,(xp/xpNeeded)*100);
    const card=document.createElement('div');
    card.className='stat-section';
    card.style.position='relative';
    card.innerHTML=`
      <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;">
        <div style="font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:2px;color:var(--gold-lit);">${ch.name}</div>
        <div style="font-family:'Cinzel',serif;font-size:.62rem;letter-spacing:1px;color:var(--ash);">${ch.role}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem;">
        <span style="font-family:'Cinzel',serif;font-size:.58rem;letter-spacing:1px;color:var(--gold-dim);">LEVEL ${level}</span>
        <span style="font-family:'Cinzel',serif;font-size:.52rem;letter-spacing:1px;color:var(--ash);">${xp.toLocaleString()} / ${xpNeeded.toLocaleString()} XP</span>
      </div>
      <div class="char-xp-bar"><div class="char-xp-fill" style="width:${xpPct}%"></div></div>
    `;
    container.appendChild(card);
  });
}

/* ═══ DAILY REWARDS ═══ */
function renderDailyRewards(){
  const container=document.getElementById('daily-rewards-content');
  container.innerHTML='';
  const streak=DailyRewards.getStreak();
  const canClaim=DailyRewards.canClaim();
  const header=document.createElement('div');
  header.style.cssText='font-family:\'Cinzel\',serif;font-size:.65rem;letter-spacing:2px;color:var(--gold-lit);margin-bottom:.5rem;text-align:center;';
  header.textContent=`STREAK: ${streak} DAYS`;
  container.appendChild(header);
  DailyRewards.rewards.forEach((reward,i)=>{
    const card=document.createElement('div');
    card.className='stat-section';
    card.style.display='flex';
    card.style.alignItems='center';
    card.style.justifyContent='space-between';
    const typeColor=reward.type==='legendary'?'#FFD700':reward.type==='epic'?'#E040FB':'#C8A84B';
    card.innerHTML=`
      <div style="display:flex;align-items:center;gap:.6rem;">
        <div style="width:36px;height:36px;border-radius:50%;background:${typeColor}20;border:1px solid ${typeColor};display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🎁</div>
        <div>
          <div style="font-family:'Cinzel\',serif;font-size:.62rem;letter-spacing:1px;color:var(--gold-lit);">DAY ${reward.day}</div>
          <div style="font-size:.5rem;color:var(--ash);">${reward.type.toUpperCase()}</div>
        </div>
      </div>
      <div style="font-family:'Cinzel\',serif;font-size:.58rem;letter-spacing:1px;color:${reward.claimed?'#4CAF50':canClaim?'var(--red-hot)':'var(--ash)'};">${reward.claimed?'CLAIMED':canClaim?'CLAIM':'LOCKED'}</div>
    `;
    if(!reward.claimed&&canClaim){
      card.style.cursor='pointer';
      card.addEventListener('click',()=>{
        const rewardData=DailyRewards.claim();
        if(rewardData){
          earnCredits(rewardData.credits);
          showPowerAnnounce('🎁 DAILY REWARD CLAIMED');
          renderDailyRewards();
        }
      });
    }
    container.appendChild(card);
  });
}

/* ═══ MOBILE SETTINGS ═══ */
function renderMobileSettings(){
  const container=document.getElementById('mobile-settings-container');
  if(!container)return;
  container.innerHTML='';
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
  document.getElementById('btn-diff-next').addEventListener('click',()=>{showScr('s-game-modes');});
  document.getElementById('btn-diff-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF&&cancelAnimationFrame(menuRAF);menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-enter-arena').addEventListener('click',()=>{
    wake();showScr(null);document.getElementById('hud').classList.remove('off');
    if('ontouchstart' in window||window.innerWidth<=900)document.getElementById('mctrl').classList.remove('off');
    gState='play';menuAnimActive=false;initGame();lastTS=performance.now();showWaveAnnounce(1);sfxStartGame();animID=requestAnimationFrame(loop);
  });
  document.getElementById('btn-back-diff').addEventListener('click',()=>{showScr('s-diff');});
  document.getElementById('btn-mode-next').addEventListener('click',()=>{showScr('s-chars');});
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
  document.getElementById('btn-start-settings').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;showScr('s-settings');});
  document.getElementById('btn-start-stats').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderStats();showScr('s-stats');});
  document.getElementById('btn-start-upgrades').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderUpgrades();showScr('s-upgrades');});
  document.getElementById('btn-start-achievements').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderAchievements();showScr('s-achievements');});
  document.getElementById('btn-start-shop').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderShop();showScr('s-shop');});
  document.getElementById('btn-start-events').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderEvents();showScr('s-events');});
  document.getElementById('btn-start-progression').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderProgression();showScr('s-progression');});
  document.getElementById('btn-start-daily').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderDailyRewards();showScr('s-daily-rewards');});
  document.getElementById('btn-start-mobile').addEventListener('click',()=>{wake();menuAnimActive=false;cancelAnimationFrame(menuRAF);menuRAF=null;renderMobileSettings();showScr('s-mobile-settings');});
  document.getElementById('btn-shop-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-events-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-progression-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-daily-rewards-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-mobile-settings-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-mode-next').addEventListener('click',()=>{showScr('s-chars');});
  document.getElementById('btn-mode-back').addEventListener('click',()=>{showScr('s-diff');});
  document.querySelectorAll('.mode-card').forEach(card=>{
    card.addEventListener('click',()=>{document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');GameModes.current=card.dataset.mode;});
  });
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
  document.getElementById('btn-pause-settings').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');showScr('s-settings');});
  document.getElementById('btn-pause-mobile').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');showScr('s-mobile-settings');renderMobileSettings();});
  document.getElementById('btn-pause-stats').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');showScr('s-stats');renderStats();});
  document.getElementById('btn-pause-upgrades').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');showScr('s-upgrades');renderUpgrades();});
  document.getElementById('btn-settings-back').addEventListener('click',()=>{
    const prev=getPreviousScreen();
    if(prev&&prev!=='s-settings'&&prev!=='s-mobile-settings'){showScr(prev);}
    else if(gState==='play'){isPaused=false;showScr(null);pauseOverlay.classList.add('visible');lastTS=performance.now();animID=requestAnimationFrame(loop);}
    else{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);}
  });
  document.getElementById('btn-mobile-settings').addEventListener('click',()=>{showScr('s-mobile-settings');renderMobileSettings();});
  document.getElementById('btn-stats-back').addEventListener('click',()=>{
    const prev=getPreviousScreen();
    if(prev&&prev!=='s-stats'){showScr(prev);}
    else if(gState==='play'){isPaused=false;showScr(null);pauseOverlay.classList.add('visible');lastTS=performance.now();animID=requestAnimationFrame(loop);}
    else{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);}
  });
  document.getElementById('btn-upgrades-back').addEventListener('click',()=>{
    const prev=getPreviousScreen();
    if(prev&&prev!=='s-upgrades'){showScr(prev);}
    else if(gState==='play'){isPaused=false;showScr(null);pauseOverlay.classList.add('visible');lastTS=performance.now();animID=requestAnimationFrame(loop);}
    else{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);}
  });
  document.getElementById('btn-achievements-back').addEventListener('click',()=>{
    const prev=getPreviousScreen();
    if(prev&&prev!=='s-achievements'){showScr(prev);}
    else if(gState==='play'){isPaused=false;showScr(null);pauseOverlay.classList.add('visible');lastTS=performance.now();animID=requestAnimationFrame(loop);}
    else{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);}
  });
  document.getElementById('btn-shop-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-events-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-progression-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-daily-rewards-back').addEventListener('click',()=>{showScr('s-start');menuAnimActive=true;initStartCanvas();menuRAF=requestAnimationFrame(drawStartBG);});
  document.getElementById('btn-pause-achievements').addEventListener('click',()=>{pauseOverlay.classList.remove('visible');showScr('s-achievements');renderAchievements();});

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
