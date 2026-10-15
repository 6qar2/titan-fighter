/* ═══ MOBILE FIRST ENHANCEMENTS ═══ */
const Mobile={
  oneHanded:false,
  autoFire:false,
  autoAim:true,
  screenShake:true,
  isMobile:/Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent),
  portrait:window.innerHeight>window.innerWidth,
  safeArea:0,
  init(){
    if(this.isMobile){
      this.autoFire=true;
    }
    try{
      const s=JSON.parse(localStorage.getItem('titans_mobile_settings'));
      if(s){this.oneHanded=s.oneHanded||false;this.autoFire=s.autoFire!==undefined?s.autoFire:this.isMobile;this.autoAim=s.autoAim!==undefined?s.autoAim:true;this.screenShake=s.screenShake!==false;}
    }catch(e){}
    this.safeArea=window.innerWidth<=360?20:window.innerHeight<=640?20:0;
    if(this.isMobile){
      this.autoFire=true;
    }
    window.addEventListener('resize',()=>{
      this.portrait=window.innerHeight>window.innerWidth;
      this.safeArea=window.innerWidth<=360?20:window.innerHeight<=640?20:0;
      this.applyLayout();
    });
    this.applyLayout();
  },
  applyLayout(){
    const hud=document.getElementById('hud');
    if(!hud)return;
    if(this.portrait&&this.isMobile){
      hud.classList.add('mobile-portrait');
    }else{
      hud.classList.remove('mobile-portrait');
    }
    if(this.oneHanded){
      hud.classList.add('one-handed');
    }else{
      hud.classList.remove('one-handed');
    }
  },
  toggleOneHanded(){
    this.oneHanded=!this.oneHanded;
    this.applyLayout();
    showPowerAnnounce(this.oneHanded?'📱 ONE-HANDED MODE':'🖥️ NORMAL MODE');
    saveSettings();
  },
  toggleAutoFire(){
    this.autoFire=!this.autoFire;
    showPowerAnnounce(this.autoFire?'🔥 AUTO FIRE ON':'🔫 AUTO FIRE OFF');
    this.save();
    const ab=document.getElementById('autofire-btn');
    if(ab)ab.classList.toggle('active',this.autoFire);
  },
  toggleAutoAim(){
    this.autoAim=!this.autoAim;
    showPowerAnnounce(this.autoAim?'🎯 AUTO AIM ON':'🎯 AUTO AIM OFF');
    this.save();
  },
  toggleScreenShake(){
    this.screenShake=!this.screenShake;
    showPowerAnnounce(this.screenShake?'📳 SCREEN SHAKE ON':'🚫 SCREEN SHAKE OFF');
    this.save();
  },
  save(){
    try{localStorage.setItem('titans_mobile_settings',JSON.stringify({oneHanded:this.oneHanded,autoFire:this.autoFire,autoAim:this.autoAim,screenShake:this.screenShake}));}catch(e){}
  },
  getOptimalJoystickSize(){
    const w=window.innerWidth;
    if(w<=320)return 120;
    if(w<=375)return 140;
    if(w<=414)return 160;
    return 180;
  },
  getOptimalButtonSize(){
    const w=window.innerWidth;
    if(w<=320)return 48;
    if(w<=375)return 56;
    if(w<=414)return 64;
    return 72;
  }
};

/* ═══ GAME MODES ═══ */
const GameModes={
  current:'campaign',
  endless:false,
  endlessWave:0,
  getModeConfig(){
    switch(this.current){
      case 'endless':return{name:'ENDLESS',desc:'How long can you survive?',color:'#FF1744',icon:'♾️',lives:1,timeLimit:0};
      default:return{name:'CAMPAIGN',desc:'Survive 10 waves',color:'#C8A84B',icon:'⚔️',lives:diffCfg.lives,timeLimit:300};
    }
  },
  startEndless(){
    this.current='endless';
    this.endless=true;
    this.endlessWave=1;
    this.modifiers=[];
    const mCount=Math.floor(Math.random()*2)+1;
    const available=[...WAVE_MODIFIERS];
    for(let i=0;i<mCount&&available.length>0;i++){
      const idx=Math.floor(Math.random()*available.length);
      this.modifiers.push(available[idx].effect);
      available.splice(idx,1);
    }
    showPowerAnnounce('♾️ ENDLESS MODE');
  },
  onWaveComplete(){
    if(this.current==='endless'){
      this.endlessWave++;
      if(this.endlessWave%3===0){
        const mods=['hordes','fast','armored','slow','burning'];
        this.modifiers.push(mods[Math.floor(Math.random()*mods.length)]);
        showPowerAnnounce('⚠ MODIFIER ADDED');
      }
    }
  },
  getResult(){
    if(this.current==='endless'){
      return{title:'ENDLESS RUN',subtitle:'Wave '+this.endlessWave,score:score};
    }
    return null;
  },
  reset(){
    this.current='campaign';
    this.endless=false;
    this.endlessWave=0;
    this.modifiers=[];
  }
};

/* ═══ CHARACTER PROGRESSION ═══ */
const CharProgression={
  levels:{},
  xp:{},
  prestige:0,
  totalCharXp:0,
  _baseStats:{},
  init(){
    try{
      const saved=JSON.parse(localStorage.getItem('titans_char_progress'));
      if(saved){this.levels=saved.levels||{};this.xp=saved.xp||{};this.prestige=saved.prestige||0;this.totalCharXp=saved.totalCharXp||0;}
    }catch(e){}
    CHARS.forEach(c=>{
      if(!this.levels[c.id])this.levels[c.id]=1;
      if(!this.xp[c.id])this.xp[c.id]=0;
      this._baseStats[c.id]={spd:c.spd,dmg:c.dmg,fire:c.fire,shield:c.shield,maxAmmo:c.maxAmmo};
    });
    this.reapplyAllBonuses();
  },
  reapplyAllBonuses(){
    CHARS.forEach(c=>{
      const base=this._baseStats[c.id];
      if(!base){this._baseStats[c.id]={spd:c.spd,dmg:c.dmg,fire:c.fire,shield:c.shield,maxAmmo:c.maxAmmo};return;}
      c.spd=base.spd*(1+(this.levels[c.id]||1)*0.00);
      c.dmg=base.dmg*(1+(this.levels[c.id]||1)*0.00);
      c.fire=base.fire;
      c.shield=base.shield;
      c.maxAmmo=base.maxAmmo;
    });
    CHARS.forEach(c=>{
      this.applyLevelBonus(c.id,false);
    });
  },
  addXp(charId,amount){
    if(!this.xp[charId])this.xp[charId]=0;
    this.xp[charId]+=amount;
    this.totalCharXp+=amount;
    const currentLevel=this.levels[charId]||1;
    const xpNeeded=currentLevel*1000;
    if(this.xp[charId]>=xpNeeded){
      this.xp[charId]-=xpNeeded;
      this.levels[charId]=(this.levels[charId]||1)+1;
      showPowerAnnounce('⬆ '+CHARS.find(c=>c.id===charId)?.name+' LEVEL '+(this.levels[charId]));
      spawnParts(cv.width/2,cv.height/2,'#FFD700',30);
      triggerShake(5,200);
      this.applyLevelBonus(charId,true);
    }
    this.save();
  },
  applyLevelBonus(charId,announce=true){
    const level=this.levels[charId]||1;
    const ch=CHARS.find(c=>c.id===charId);
    if(!ch)return;
    const base=this._baseStats[charId];
    if(!base)return;
    ch.spd=base.spd*(1+level*0.02);
    ch.dmg=base.dmg*(1+level*0.02);
    ch.fire=base.fire*Math.max(0.5,1-(level-1)*0.02);
    ch.shield=base.shield+Math.floor(level/2);
    ch.maxAmmo=base.maxAmmo+Math.floor(level/3);
  },
  getLevel(charId){return this.levels[charId]||1;},
  getXp(charId){return this.xp[charId]||0;},
  getXpNeeded(charId){return(this.levels[charId]||1)*1000;},
  save(){
    localStorage.setItem('titans_char_progress',JSON.stringify({levels:this.levels,xp:this.xp,prestige:this.prestige,totalCharXp:this.totalCharXp}));
  },
  resetAll(){
    this.levels={};this.xp={};this.prestige=0;this.totalCharXp=0;
    CHARS.forEach(c=>{this.levels[c.id]=1;this.xp[c.id]=0;});
    this.save();
  }
};

/* ═══ DAILY REWARDS ═══ */
const DailyRewards={
  lastClaim:null,
  streak:0,
  rewards:[],
  init(){
    try{
      const saved=JSON.parse(localStorage.getItem('titans_daily_rewards'));
      if(saved){this.lastClaim=saved.lastClaim;this.streak=saved.streak||0;this.rewards=saved.rewards||[];}
    }catch(e){}
    this.generateRewards();
  },
  generateRewards(){
    const oldRewards=this.rewards||[];
    this.rewards=[];
    for(let i=0;i<7;i++){
      const isSpecial=(i===6);
      this.rewards.push({
        day:i+1,
        claimed:oldRewards[i]?.claimed||false,
        type:isSpecial?'legendary':i===3?'epic':'common',
        reward:isSpecial?{credits:500,type:'legendary_chest'}:i===3?{credits:200,type:'epic_chest'}:{credits:50,type:'common_chest'}
      });
    }
  },
  getDayNumber(){
    const now=new Date();
    const start=new Date(now.getFullYear(),0,0);
    const diff=now-start;
    const oneDay=1000*60*60*24;
    return Math.floor(diff/oneDay);
  },
  canClaim(){
    if(!this.lastClaim)return true;
    const last=new Date(this.lastClaim);
    const now=new Date();
    const diff=(now-last)/(1000*60*60*24);
    return diff>=1;
  },
  claim(){
    const today=new Date().toISOString().split('T')[0];
    if(!this.canClaim())return false;
    const dayIndex=Math.min(this.rewards.length-1,this.streak%7);
    this.rewards[dayIndex].claimed=true;
    this.streak++;
    this.lastClaim=today;
    this.save();
    return this.rewards[dayIndex].reward;
  },
  getStreak(){return this.streak;},
  save(){
    localStorage.setItem('titans_daily_rewards',JSON.stringify({lastClaim:this.lastClaim,streak:this.streak,rewards:this.rewards}));
  }
};

/* ═══ STATS EXPANSION ═══ */
const ExpandedStats={
  endlessBestWave:0,
  weaponsUnlocked:['pistol'],
  charactersUnlocked:['legionary','centurion','praetor','imperator','guardian','colossus','vortex','sunfire'],
  skinsOwned:[],
  load(){
    try{
      const s=JSON.parse(localStorage.getItem('titans_expanded_stats'));
      if(s){this.endlessBestWave=s.endlessBestWave||0;this.totalPlayTime=s.totalPlayTime||0;this.weaponsUnlocked=s.weaponsUnlocked||['pistol'];this.charactersUnlocked=s.charactersUnlocked||CHARS.map(c=>c.id);this.skinsOwned=s.skinsOwned||[];}
    }catch(e){}
  },
  save(){
    localStorage.setItem('titans_expanded_stats',JSON.stringify({endlessBestWave:this.endlessBestWave,totalPlayTime:this.totalPlayTime,weaponsUnlocked:this.weaponsUnlocked,charactersUnlocked:this.charactersUnlocked,skinsOwned:this.skinsOwned}));
  },
  recordEndlessWave(wave){
    if(wave>this.endlessBestWave){this.endlessBestWave=wave;this.save();}
  }
};

/* ═══ ACCESSIBILITY ═══ */
const Accessibility={
  colorblindMode:false,
  textSize:1,
  highContrast:false,
  reduceMotion:false,
  init(){
    try{
      const s=JSON.parse(localStorage.getItem('titans_accessibility'));
      if(s){this.colorblindMode=s.colorblindMode||false;this.textSize=s.textSize||1;this.highContrast=s.highContrast||false;this.reduceMotion=s.reduceMotion||false;}
    }catch(e){}
    this.apply();
  },
  toggleColorblind(){
    this.colorblindMode=!this.colorblindMode;
    this.apply();
    showPowerAnnounce(this.colorblindMode?'👁️ COLORBLIND MODE ON':'👁️ COLORBLIND MODE OFF');
    this.save();
  },
  toggleHighContrast(){
    this.highContrast=!this.highContrast;
    this.apply();
    showPowerAnnounce(this.highContrast?'◼ HIGH CONTRAST ON':'◼ HIGH CONTRAST OFF');
    this.save();
  },
  toggleReduceMotion(){
    this.reduceMotion=!this.reduceMotion;
    this.apply();
    showPowerAnnounce(this.reduceMotion?'✨ REDUCED MOTION ON':'✨ REDUCED MOTION OFF');
    this.save();
  },
  apply(){
    const body=document.body;
    if(this.colorblindMode){
      body.classList.add('colorblind-mode');
    }else{
      body.classList.remove('colorblind-mode');
    }
    if(this.highContrast){
      body.classList.add('high-contrast');
    }else{
      body.classList.remove('high-contrast');
    }
    if(this.reduceMotion){
      body.classList.add('reduce-motion');
    }else{
      body.classList.remove('reduce-motion');
    }
    document.documentElement.style.fontSize=(this.textSize*100)+'%';
  },
  save(){
    localStorage.setItem('titans_accessibility',JSON.stringify({colorblindMode:this.colorblindMode,textSize:this.textSize,highContrast:this.highContrast,reduceMotion:this.reduceMotion}));
  }
};

/* ═══ SOCIAL / EVENTS ═══ */
const Social={
  friends:[],
  clan:null,
  events:[],
  init(){
    try{
      const s=JSON.parse(localStorage.getItem('titans_social'));
      if(s){this.friends=s.friends||[];this.clan=s.clan||null;this.events=s.events||[];}
    }catch(e){}
    this.checkEvents();
  },
  checkEvents(){
    const now=new Date();
    const events=[
      {id:'weekend_warrior',name:'WEEKEND WARRIOR',desc:'2x credits on weekends',active:now.getDay()===0||now.getDay()===6},
      {id:'double_xp',name:'DOUBLE XP',desc:'2x character XP',active:false},
      {id:'club_event',name:'TITANS CLUB EVENT',desc:'Exclusive rewards',active:false}
    ];
    this.events=events.filter(e=>e.active);
  },
  getActiveEvents(){return this.events;},
  hasEvent(id){return this.events.some(e=>e.id===id);},
  save(){
    localStorage.setItem('titans_social',JSON.stringify({friends:this.friends,clan:this.clan,events:this.events}));
  }
};

/* ═══ COSMETICS / SHOP ═══ */
const Cosmetics={
  skins:{
    legionary:[
      {id:'legionary_gold',name:'GOLD LEGIONARY',color:'#FFD700',trim:'#FFA000',cost:500},
      {id:'legionary_dark',name:'DARK LEGIONARY',color:'#424242',trim:'#757575',cost:300}
    ],
    centurion:[
      {id:'centurion_fire',name:'FIRE CENTURION',color:'#FF5722',trim:'#FF9800',cost:500}
    ]
  },
  ownedSkins:[],
  equippedSkin:null,
  _originalSkins:{},
  init(){
    try{
      const s=JSON.parse(localStorage.getItem('titans_cosmetics'));
      if(s){this.ownedSkins=s.ownedSkins||[];this.equippedSkin=s.equippedSkin||null;}
    }catch(e){}
    CHARS.forEach(c=>{this._originalSkins[c.id]={color:c.color,trim:c.trim};});
  },
  buySkin(charId,skinId){
    const skin=this.skins[charId]?.find(s=>s.id===skinId);
    if(!skin)return false;
    if(this.ownedSkins.includes(skinId))return true;
    if(credits>=skin.cost){
      credits-=skin.cost;
      this.ownedSkins.push(skinId);
      this.save();
      showPowerAnnounce('🎨 '+skin.name+' UNLOCKED');
      return true;
    }
    return false;
  },
  equipSkin(charId,skinId){
    if(skinId===null){
      this.equippedSkin=null;
      const ch=CHARS.find(c=>c.id===charId);
      const orig=this._originalSkins[charId];
      if(ch&&orig){ch.color=orig.color;ch.trim=orig.trim;}
      this.save();
      showPowerAnnounce('🎨 SKIN RESET');
      return true;
    }
    if(!this.ownedSkins.includes(skinId))return false;
    this.equippedSkin=skinId;
    const ch=CHARS.find(c=>c.id===charId);
    const skin=this.skins[charId]?.find(s=>s.id===skinId);
    if(ch&&skin){ch.color=skin.color;ch.trim=skin.trim;}
    this.save();
    showPowerAnnounce('🎨 '+skin.name+' EQUIPPED');
    return true;
  },
  save(){
    localStorage.setItem('titans_cosmetics',JSON.stringify({ownedSkins:this.ownedSkins,equippedSkin:this.equippedSkin}));
  }
};
