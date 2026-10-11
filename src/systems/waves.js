/* ═══ AMMO PACK ═══ */
function spawnAmmoPack(){const margin=60;ammoPacks.push({x:margin+Math.random()*(cv.width-margin*2),y:80+Math.random()*(cv.height*.6),r:14,pulse:0,age:0,maxAge:18,club:Math.random()<.2});}
function drawAmmoPackGlyph(ctx,x,y,r,pulse,isClub){ctx.save();ctx.translate(x,y);const glow=ctx.createRadialGradient(0,0,r*.3,0,0,r*2.2);glow.addColorStop(0,isClub?'rgba(212,175,55,0.35)':'rgba(0,200,168,0.22)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,r*2.2,0,Math.PI*2);ctx.fill();const pr=r*(1+pulse*.4);ctx.strokeStyle=isClub?`rgba(212,175,55,${.8-pulse*.4})`:`rgba(0,200,168,${.6-pulse*.4})`;ctx.lineWidth=isClub?2.5:1.5;ctx.beginPath();ctx.arc(0,0,pr,0,Math.PI*2);ctx.stroke();if(isClub){ctx.fillStyle='rgba(212,175,55,0.15)';ctx.beginPath();ctx.arc(0,0,r*1.3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='rgba(0,30,26,0.85)';ctx.strokeStyle=isClub?'rgba(212,175,55,0.85)':'rgba(0,200,168,0.85)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=isClub?'rgba(212,175,55,0.95)':'rgba(0,200,168,0.95)';ctx.fillRect(-3,-7,6,10);ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(3,3);ctx.lineTo(0,8);ctx.closePath();ctx.fill();ctx.fillStyle=isClub?'rgba(245,228,168,0.5)':'rgba(0,200,168,0.5)';ctx.fillRect(-3,-9,6,3);ctx.restore();}

/* ═══ GATE SYSTEM ═══ */
function openGate(){
  const margin=90,hudH=60;let gx,gy,tries=0;
  do{gx=margin+Math.random()*(cv.width-margin*2);gy=hudH+margin+Math.random()*(cv.height-hudH-margin*2);tries++;}
  while(Math.hypot(gx-P.x,gy-P.y)<160&&tries<20);
  const col=WAVE_GATE_COLS[Math.min(wave-1,WAVE_GATE_COLS.length-1)];
  gate={x:gx,y:gy,r:36,spin:0,pulse:0,col,age:0};
  const el=document.getElementById('gate-prompt');el.classList.add('visible');el.style.opacity='1';sfxCombo();spawnParts(gx,gy,col,20);
}
function enterGate(){
  if(waveAdvancing)return;waveAdvancing=true;gate=null;gateOpen=false;
  const gp=document.getElementById('gate-prompt');gp.style.opacity='0';gp.classList.remove('visible');
  const col=WAVE_GATE_COLS[Math.min(wave-1,WAVE_GATE_COLS.length-1)];
  const fl=document.getElementById('flash');const r2=parseInt(col.slice(1,3),16),g2=parseInt(col.slice(3,5),16),b2=parseInt(col.slice(5,7),16);
  fl.style.background=`rgba(${r2},${g2},${b2},0.38)`;fl.style.opacity='1';setTimeout(()=>{fl.style.opacity='0';fl.style.background='rgba(200,0,26,0.35)';},200);
  sfxGateEnter();
  const timeBonus=Math.floor(timeLeft*10);score+=timeBonus;if(timeBonus>0)spawnPop(cv.width/2,cv.height/2-40,`+${timeBonus} WAVE BONUS`,'boss');
  if(wave>=10){endGame();return;}
  gateOpen=true;openGate();
  wave++;
  waveModifier=null;document.getElementById('wave-modifier').style.display='none';
  bgColTarget={...WAVE_BGS[Math.min(wave-1,WAVE_BGS.length-1)]};showWaveAnnounce(wave);sfxCombo();haptic('success');
  document.getElementById('hwave').textContent=toRoman(wave);spawnParts(cv.width/2,cv.height/2,WAVE_GATE_COLS[Math.min(wave-2,WAVE_GATE_COLS.length-1)],22);
  bgTransition(wave);waveKills=0;setTimeout(()=>{waveAdvancing=false;spawnT=1.8;},1400);
}
function drawGate(ctx,g){
  ctx.save();ctx.translate(g.x,g.y);const t=Date.now()*.001;
  const glow=ctx.createRadialGradient(0,0,g.r*.4,0,0,g.r*2.6);glow.addColorStop(0,g.col+'44');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,g.r*2.6,0,Math.PI*2);ctx.fill();
  [1.0,0.78,0.56].forEach((scale,i)=>{ctx.save();ctx.rotate(g.spin*(i%2===0?1:-1)+(i*Math.PI/3));const r2=g.r*scale;ctx.strokeStyle=g.col;ctx.lineWidth=i===0?3:2;ctx.globalAlpha=0.6+i*0.15;if(shouldDrawShadow()){ctx.shadowColor=g.col;ctx.shadowBlur=14;}ctx.setLineDash([r2*.35,r2*.2]);ctx.beginPath();ctx.arc(0,0,r2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();});
  const inner=ctx.createRadialGradient(0,0,2,0,0,g.r*.52);inner.addColorStop(0,'rgba(255,255,255,0.18)');inner.addColorStop(0.4,g.col+'99');inner.addColorStop(1,'rgba(0,0,0,0.9)');ctx.globalAlpha=1;ctx.fillStyle=inner;ctx.beginPath();ctx.arc(0,0,g.r*.52,0,Math.PI*2);ctx.fill();
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+g.spin;const rx=Math.cos(a)*g.r,ry=Math.sin(a)*g.r;ctx.fillStyle=g.col;ctx.globalAlpha=0.85;ctx.shadowColor=g.col;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(rx,ry,3,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=0.7+Math.sin(t*3)*0.3;ctx.fillStyle=g.col;ctx.font="bold 11px 'Cinzel', serif";ctx.textAlign='center';ctx.shadowColor=g.col;ctx.shadowBlur=10;ctx.fillText('ENTER',0,-g.r-14);ctx.restore();
}
