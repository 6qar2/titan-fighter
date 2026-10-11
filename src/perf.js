/* ═══ PERFORMANCE / ADAPTIVE QUALITY ═══ */
const Perf={
  isMobile:/Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent),
  lowMem:false,
  quality:'high',
  fps:60,
  frameTimes:[],
  adaptive:true,
  particleMult:1,
  maxEnemies:14,
  trailAlpha:1,
  shadowBlur:true
};
function detectLowMem(){
  if(navigator.deviceMemory&&navigator.deviceMemory<4)Perf.lowMem=true;
  if(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)Perf.lowMem=true;
  if(window.innerWidth<=360||window.innerHeight<=640)Perf.lowMem=true;
  if(Perf.isMobile&&navigator.connection&&navigator.connection.saveData)Perf.lowMem=true;
}
function measureFPS(now){
  Perf.frameTimes.push(now);
  while(Perf.frameTimes.length>0&&Perf.frameTimes[0]<now-1000)Perf.frameTimes.shift();
  Perf.fps=Perf.frameTimes.length;
}
function applyAdaptiveQuality(){
  if(!Perf.adaptive)return;
  if(Perf.fps<30&&Perf.quality!=='low'){
    Perf.quality='low';Perf.particleMult=0.4;Perf.maxEnemies=8;Perf.trailAlpha=0.5;Perf.shadowBlur=false;
    document.querySelectorAll('#gc').forEach(c=>c.style.filter='none');
  }else if(Perf.fps<45&&Perf.quality!=='medium'){
    Perf.quality='medium';Perf.particleMult=0.7;Perf.maxEnemies=10;Perf.trailAlpha=0.75;Perf.shadowBlur=true;
  }else if(Perf.fps>=50&&Perf.quality!=='high'){
    Perf.quality='high';Perf.particleMult=1;Perf.maxEnemies=14;Perf.trailAlpha=1;Perf.shadowBlur=true;
  }
}
let perfInterval=null;
function startPerfMonitor(){
  if(perfInterval)clearInterval(perfInterval);
  perfInterval=setInterval(()=>{measureFPS(performance.now());applyAdaptiveQuality();},2000);
}
function getSpawnCap(){return Perf.maxEnemies;}
function getParticleCount(base){return Math.floor(base*Perf.particleMult);}
function shouldDrawTrail(){return Perf.trailAlpha>0.5;}
function shouldDrawShadow(){return Perf.shadowBlur;}
