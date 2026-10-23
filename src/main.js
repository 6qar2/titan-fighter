/* ═══ BOOT ═══ */
function boot(){
  detectLowMem();
  Profile.init();
  loadSettings();
  loadStats();
  
  Mobile.init();
  Accessibility.init();
  
  wireUI();

  const savedName=Profile.getName();
  if(savedName){
    document.getElementById('pname').value=savedName;
    pName=savedName;
  }
  const savedChar=Profile.getLastChar();
  if(savedChar!==null&&savedChar!==undefined&&savedChar<CHARS.length){
    selChar=savedChar;
  }else{
    selChar=0;
  }
  const savedDiff=Profile.getLastDiff();
  if(savedDiff){
    selDiff=savedDiff;
  }

  initStartCanvas();
  menuAnimActive=true;
  menuRAF=requestAnimationFrame(drawStartBG);
  startPerfMonitor();
  
  document.addEventListener('visibilitychange',()=>{
    if(gState==='play'){
      if(document.hidden){isPaused=true;pauseOverlay&&pauseOverlay.classList.add('visible');bgStop();}
      else{
        if(!isPaused)return;
        isPaused=false;pauseOverlay&&pauseOverlay.classList.remove('visible');bgStart(wave);
        lastTS=performance.now();animID=requestAnimationFrame(loop);
      }
    }
  });
}

/* ═══ CINEMATIC INTRO ═══ */
/* Cinematic intro dismiss is handled in src/ui/screens.js */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
