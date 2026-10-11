/* ═══ BOOT ═══ */
function boot(){
  detectLowMem();
  Profile.init();
  loadSettings();
  loadStats();
  loadAchievements();
  loadUpgrades();
  storeBaseStats();
  
  Mobile.init();
  CharProgression.init();
  DailyRewards.init();
  Social.init();
  ExpandedStats.load();
  Accessibility.init();
  Cosmetics.init();
  
  wireUI();

  const savedName=Profile.getName();
  if(savedName){
    document.getElementById('pname').value=savedName;
    pName=savedName;
  }
  const savedChar=Profile.getLastChar();
  if(savedChar!==null&&savedChar!==undefined){
    selChar=savedChar;
  }
  const savedDiff=Profile.getLastDiff();
  if(savedDiff){
    selDiff=savedDiff;
  }

  initStartCanvas();
  menuAnimActive=true;
  menuRAF=requestAnimationFrame(drawStartBG);
  startPerfMonitor();
}

/* ═══ CINEMATIC INTRO ═══ */
/* Cinematic intro dismiss is handled in src/ui/screens.js */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
