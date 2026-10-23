/* ═══ CHAR SELECT UI ═══ */
(function buildCharGrid(){
  const grid=document.getElementById('char-grid');
  CHARS.forEach((c,i)=>{
    const card=document.createElement('div');card.className='char-card'+(i===0?' selected':'');card.id='ccard-'+i;
    const mc=document.createElement('canvas');mc.className='char-canvas';mc.width=70;mc.height=86;
    const mctx=mc.getContext('2d');mctx.clearRect(0,0,70,86);
    c.draw(35,46,-Math.PI/2,mctx);
    const nm=document.createElement('div');nm.className='char-name';nm.textContent=c.name;
    const rl=document.createElement('div');rl.className='char-role';rl.textContent=c.role;
    const pw=document.createElement('div');pw.className='char-power-badge';pw.textContent='✦ '+c.powerName;
    const ab=document.createElement('div');ab.style.cssText='font-size:.48rem;letter-spacing:2px;color:var(--ammo-col);text-transform:uppercase;margin-top:1px;';ab.textContent=`${c.maxAmmo} rounds`;
    const st=document.createElement('div');st.className='char-stats';
    [['SPD',c.stats.speed],['FIRE',c.stats.fire],['PWR',c.stats.power]].forEach(([k,v])=>{const row=document.createElement('div');row.className='stat-row';row.innerHTML=`<span class="stat-key">${k}</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${v}%"></div></div>`;st.appendChild(row);});
    card.appendChild(mc);card.appendChild(nm);card.appendChild(rl);card.appendChild(pw);card.appendChild(ab);card.appendChild(st);
    card.addEventListener('click',()=>{document.querySelectorAll('.char-card').forEach(cc=>cc.classList.remove('selected'));card.classList.add('selected');selChar=i;});
    grid.appendChild(card);
  });
})();

/* ═══ START SCREEN PARTICLES ═══ */
const startCv=document.getElementById('start-canvas');const startCtx=startCv.getContext('2d');
let startParts=[],menuAnimActive=false,menuRAF=null;
function initStartCanvas(){startCv.width=window.innerWidth;startCv.height=window.innerHeight;startParts=[];const count=Math.floor((window.innerWidth*window.innerHeight)/6000);for(let i=0;i<count;i++){startParts.push({x:Math.random()*startCv.width,y:Math.random()*startCv.height,vx:(Math.random()-.5)*.4,vy:-.3-Math.random()*.5,r:Math.random()*1.5+.2,col:Math.random()<.7?`rgba(200,168,75,${Math.random()*.25+.05})`:`rgba(192,0,26,${Math.random()*.15+.03})`,life:Math.random(),dec:.002+Math.random()*.003});}for(let i=0;i<12;i++){startParts.push({x:Math.random()*startCv.width,y:Math.random()*startCv.height,vx:(Math.random()-.5)*.2,vy:-.15-Math.random()*.25,r:2.5+Math.random()*2,col:`rgba(200,168,75,${Math.random()*.4+.1})`,life:Math.random(),dec:.001+Math.random()*.002,ember:true});}}
function drawStartBG(){if(!menuAnimActive)return;startCtx.clearRect(0,0,startCv.width,startCv.height);const grad=startCtx.createRadialGradient(startCv.width/2,startCv.height*.4,0,startCv.width/2,startCv.height*.4,startCv.width*.8);grad.addColorStop(0,'rgba(20,8,6,1)');grad.addColorStop(.5,'rgba(10,4,4,1)');grad.addColorStop(1,'rgba(4,4,10,1)');startCtx.fillStyle=grad;startCtx.fillRect(0,0,startCv.width,startCv.height);startParts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=p.dec;if(p.life<=0||p.y<-10){p.x=Math.random()*startCv.width;p.y=startCv.height+5;p.life=Math.random()*.5+.2;}startCtx.save();startCtx.globalAlpha=p.life;if(p.ember){startCtx.shadowColor='rgba(200,168,75,0.8)';startCtx.shadowBlur=8;}startCtx.beginPath();startCtx.arc(p.x,p.y,p.r,0,Math.PI*2);startCtx.fillStyle=p.col;startCtx.fill();startCtx.restore();});menuRAF=requestAnimationFrame(drawStartBG);}

/* ═══ SCREEN MANAGEMENT ═══ */
let previousScreen='s-start';
let screenFrom=null;
function getPreviousScreen(){return previousScreen;}
function setPreviousScreen(screen){previousScreen=screen;}
function setScreenFrom(from,to){screenFrom=from;showScr(to);}
function getScreenFrom(){return screenFrom;}
function showScr(id){
  if(id){
    setPreviousScreen(id);
  }
  document.querySelectorAll('.scr').forEach(s=>s.classList.add('off'));
  if(id){
    const el=document.getElementById(id);
    if(el)el.classList.remove('off');
  }
}

/* ═══ CINEMATIC INTRO ═══ */
(function(){
  const ci = document.getElementById('cinematic-intro');
  if(!ci) return;
  function dismissIntro(){
    if(!ci.classList.contains('active')) return;
    ci.classList.remove('active');
    try{
      if(typeof showScr==='function') showScr('s-start');
      menuAnimActive=true;
      if(typeof initStartCanvas==='function') initStartCanvas();
      if(typeof drawStartBG==='function') menuRAF=requestAnimationFrame(drawStartBG);
    }catch(e){}
    window.removeEventListener('keydown',dismissIntro);
    window.removeEventListener('touchstart',dismissIntro);
    window.removeEventListener('pointerdown',dismissIntro);
    window.removeEventListener('click',dismissIntro);
  }
  window.addEventListener('keydown',dismissIntro);
  window.addEventListener('touchstart',dismissIntro,{passive:true});
  window.addEventListener('pointerdown',dismissIntro);
  window.addEventListener('click',dismissIntro);
  setTimeout(dismissIntro, 6000);
})();
