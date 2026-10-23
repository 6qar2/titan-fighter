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
