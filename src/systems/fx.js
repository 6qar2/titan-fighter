/* ═══ PARTICLES / POPS ═══ */
function spawnParts(x,y,col,n){
  const density=settings.particleDensity||3;
  const mult=Perf.particleMult||1;
  const max= density===1?80:density===2?150:220;
  const adjMax=Math.floor(max*mult);
  if(parts.length>adjMax)return;
  const count=density===1?Math.ceil(n/3):density===2?Math.ceil(n/1.5):n;
  const adjCount=Math.max(1,Math.floor(count*mult));
  for(let i=0;i<adjCount;i++){const a=Math.random()*Math.PI*2,sp=35+Math.random()*110;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,dec:.05+Math.random()*.07,r:1.2+Math.random()*2.8,col});}
}
function spawnPop(x,y,txt,cls){const el=document.createElement('div');el.className='spop'+(cls?' '+cls:'');el.textContent=txt;el.style.left=(x-30)+'px';el.style.top=(y-15)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),750);}

/* ═══ DAMAGE NUMBERS ═══ */
function spawnDmgNum(x,y,amount,color){if(dmgNums.length<20)dmgNums.push({x,y,amount:Math.round(amount),color:color||'#E2C06A',life:1,vy:-60});}
function updateDmgNums(dt){dmgNums=dmgNums.filter(d=>{d.y+=d.vy*dt;d.life-=dt*1.1;return d.life>0;});}
function drawDmgNums(){dmgNums.forEach(d=>{cx.save();cx.globalAlpha=Math.max(0,d.life);cx.font="bold 14px 'Cinzel',serif";cx.textAlign='center';cx.fillStyle=d.color;cx.shadowColor='rgba(0,0,0,0.8)';cx.shadowBlur=4;cx.fillText(d.amount,d.x,d.y);cx.restore();});}

/* ═══ KILL FEED ═══ */
function addKillFeed(msg,col){killFeed.unshift({msg,col,time:2.5});if(killFeed.length>5)killFeed.pop();}
function updateKillFeed(dt){killFeed=killFeed.filter(k=>{k.time-=dt;return k.time>0;});}
function drawKillFeed(){killFeed.forEach((k,i)=>{cx.save();cx.globalAlpha=Math.min(1,k.time*.5);cx.font="9px 'Cinzel',serif";cx.textAlign='right';cx.fillStyle=k.col;cx.shadowColor='rgba(0,0,0,0.8)';cx.shadowBlur=3;cx.fillText(k.msg,cv.width-10,70+i*18);cx.restore();});}

/* ═══ MINIMAP ═══ */
function drawMinimap(){
  const mc=document.getElementById('minimap');
  if(!mc)return;
  const mctx=mc.getContext('2d');
  const mw=mc.width,mh=mc.height;
  mctx.clearRect(0,0,mw,mh);
  mctx.fillStyle='rgba(6,6,14,0.85)';mctx.fillRect(0,0,mw,mh);
  const sx=mw/cv.width,sy=mh/cv.height;
  mctx.fillStyle='#4CAF50';mctx.beginPath();mctx.arc(P.x*sx,P.y*sy,2,0,Math.PI*2);mctx.fill();
  enemies.forEach(e=>{mctx.fillStyle=e.col;mctx.globalAlpha=.8;mctx.beginPath();mctx.arc(e.x*sx,e.y*sy,1.2,0,Math.PI*2);mctx.fill();});
  ammoPacks.forEach(pk=>{mctx.fillStyle=pk.club?'#D4AF37':'#00C8A8';mctx.beginPath();mctx.arc(pk.x*sx,pk.y*sy,1.5,0,Math.PI*2);mctx.fill();});
  if(gate){mctx.strokeStyle=gate.col;mctx.lineWidth=1;mctx.beginPath();mctx.arc(gate.x*sx,gate.y*sy,4,0,Math.PI*2);mctx.stroke();}
  activeTurrets.forEach(t=>{mctx.fillStyle='#4AFFFF';mctx.beginPath();mctx.arc(t.x*sx,t.y*sy,2,0,Math.PI*2);mctx.fill();});
}
