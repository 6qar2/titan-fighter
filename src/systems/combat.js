/* ═══ ENHANCED KILL SYSTEM ═══ */
function killEnemy(e,idx){
  const isBoss=e.type==='caesar'||e.type==='warlord'||e.type==='titangod'||e.type==='herald'||e.type==='chaoslord';
  const isTitanClub=e.type==='irontitan'||e.type==='titangod'||e.type==='herald'||e.type==='chaoslord'||e.type==='colossusg';
  if(isBoss){sfxBigBoom();triggerSlowMo(0.5,0.35);triggerShake(14,400);earnCredits(e.pts);haptic('heavy');}
  else if(isTitanClub){sfxBigBoom();triggerSlowMo(0.35,0.3);triggerShake(8,250);earnCredits(Math.floor(e.pts/2));haptic('medium');}
  else{sfxExplode();haptic('light');}
  combo++;comboT=2.5;totalKills++;if(combo>bestCombo)bestCombo=combo;
  killstreakBonus=Math.min(5,Math.floor(combo/5));
  const mult=combo>=5?2:combo>=3?1.5:1;
  const killstreakMult=1+killstreakBonus*.25;
  const eliteMult=e.isElite?2:1;
  const pts=Math.round(e.pts*mult*diffCfg.scoreMult*killstreakMult*eliteMult);
  score+=pts;spawnParts(e.x,e.y,e.col,isBoss?12:isTitanClub?6:5);
  if(isTitanClub&&!isBoss)spawnPop(e.x,e.y,`+${pts} ♛ TITANS CLUB`,'boss');
  else spawnPop(e.x,e.y,combo>=3?`+${pts} ×${combo}`:`+${pts}`,isBoss||isTitanClub?'boss':'');
  if(combo>=3){
    const cd=document.getElementById('combo');
    const comboName=combo>=20?'☀ IMMORTAL':combo>=15?'⚔ TITAN WRATH':combo>=10?'♛ LEGIONARY':combo>=5?'✦ CLUB STRIKE':'';
    cd.textContent=comboName?`${combo}× ${comboName}`:`${combo}× COMBO`;
    cd.style.opacity='1';cd.classList.remove('milestone');void cd.offsetWidth;cd.classList.add('milestone');if(combo>=5)sfxCombo();
  }
  if(combo===5){showPowerAnnounce('✦ 5× COMBO · TITANS CLUB STRIKE');triggerShake(4,150);spawnParts(P.x,P.y,'#E2C06A',5);sfxComboMilestone();}
  if(combo===10){showPowerAnnounce('♛ 10× COMBO · LEGIONARY RAGE');triggerSlowMo(0.3,0.4);triggerShake(8,250);spawnParts(P.x,P.y,'#FF4422',8);sfxComboMilestone();}
  if(combo===15){showPowerAnnounce('⚔ 15× COMBO · TITAN WRATH');triggerSlowMo(0.5,0.3);triggerShake(12,350);spawnParts(P.x,P.y,'#D4AF37',10);sfxComboMilestone();}
  if(combo===20){showPowerAnnounce('☀ 20× COMBO · IMMORTAL LEGEND');triggerSlowMo(0.7,0.25);triggerShake(18,500);spawnParts(P.x,P.y,'#FFD700',12);sfxComboMilestone();}
  if(isBoss){addKillFeed('⚔ '+e.label+' DEFEATED','#FFD700');triggerSlowMo(0.6,0.3);triggerShake(12,350);spawnParts(cv.width/2,cv.height/2,'#FFD700',12);showPowerAnnounce('♛ '+e.label+' FALLEN');sfxBigBoom();}
  else if(isTitanClub){addKillFeed('♛ '+e.label+' SLAIN','#C8A84B');}
  else{addKillFeed('⚔ '+e.label+' KILLED','#E2C06A');}
  powerCharge=Math.min(1,powerCharge+0.18);updatePowerHUD();
  const xpGain=Math.round(e.pts*0.1);
  CharProgression.addXp(CHARS[selChar].id,xpGain);
  if(e.isElite)spawnPop(e.x,e.y-20,`+${Math.round(e.pts*.5)} ELITE`,'boss');
  if(e.ability==='split'&&!e.splitDone){const smallDef={...EDEFS.find(d=>d.type==='scout'),pts:40};for(let i=0;i<2;i++){const a=(i/2)*Math.PI*2+Math.random();spawnEnemy(smallDef,e.x+Math.cos(a)*30,e.y+Math.sin(a)*30);}}
  enemies.splice(idx,1);waveKills++;updateHUD();
}

/* ═══ POWER-UPS ═══ */
function spawnPowerup(){
  if(Math.random()>0.003)return;
  const type=POWERUP_TYPES[Math.floor(Math.random()*POWERUP_TYPES.length)];
  const margin=60;powerups.push({x:margin+Math.random()*(cv.width-margin*2),y:80+Math.random()*(cv.height*.6),r:16,type,...type,age:0,maxAge:20,pulse:0});
}
function updatePowerups(dt){
  powerups=powerups.filter(pu=>{
    pu.pulse+=dt*3;if(pu.pulse>1)pu.pulse=0;pu.age+=dt;
    if(Math.hypot(pu.x-P.x,pu.y-P.y)<pu.r+P.w*.5){
      activatePowerup(pu);return false;
    }
    return pu.age<pu.maxAge;
  });
}
function activatePowerup(pu){
  sfxPowerupPickup();spawnParts(pu.x,pu.y,pu.color,8);spawnPop(pu.x,pu.y,pu.name,'power');
  showPowerAnnounce(pu.icon+' '+pu.name);
  if(pu.effect==='nuke'){
    enemies.forEach(e=>{spawnParts(e.x,e.y,e.col,5);});
    enemies.length=0;waveKills=0;triggerShake(15,400);sfxBigBoom();
    return;
  }
  activePowerups.push({type:pu.effect,timer:pu.duration});
  if(pu.effect==='speed')P.spdBuff=1.5;
  if(pu.effect==='damage')window.dmgBuff=(window.dmgBuff||1)*2;
  if(pu.effect==='shield'){gameState2.powerBuff={type:'shield',hits:3,timer:pu.duration};}
  if(pu.effect==='rapid')window.fireRateBuff=0.5;
  if(pu.effect==='magnet')window.magnetRange=200;
  if(pu.effect==='timewarp'){enemies.forEach(e=>{e.spdMod=(e.spdMod||1)*.5;});}
  if(pu.effect==='shieldgen'){window.shieldHits=(window.shieldHits||0)+3;}
  if(pu.effect==='doubleshot'){window.doubleShot=true;}
  if(pu.effect==='invisibility'){P.invinc=pu.duration;}
  if(pu.effect==='ammo_rain'){ammo=Math.min(maxAmmo,ammo+30);spawnParts(cv.width/2,cv.height/2,'#00C8A8',15);showPowerAnnounce('🌧️ AMMO RAIN');}
  if(pu.effect==='shield_boost'){window.shieldHits=(window.shieldHits||0)+5;spawnParts(P.x,P.y,'#4A9EFF',12);showPowerAnnounce('🛡️ SHIELD BOOST');}
  if(pu.effect==='crit_boost'){window.critChance=(window.critChance||0)+0.3;spawnParts(P.x,P.y,'#FFD700',10);showPowerAnnounce('🎯 CRIT BOOST');}
  if(pu.effect==='nano_speed'){P.spdBuff=2.2;spawnParts(P.x,P.y,'#E8001F',10);showPowerAnnounce('⚡ NANO SPEED');}
  triggerShake(2,100);
}
function updateActivePowerups(dt){
  activePowerups=activePowerups.filter(pu=>{
    pu.timer-=dt;
    if(pu.timer<=0){
      const sameTypeCount=activePowerups.filter(p=>p.type===pu.type).length;
      if(sameTypeCount<=1){
        if(pu.type==='speed')P.spdBuff=null;
        if(pu.type==='damage')window.dmgBuff=1;
        if(pu.type==='rapid')window.fireRateBuff=null;
        if(pu.type==='magnet')window.magnetRange=null;
        if(pu.type==='timewarp'){enemies.forEach(e=>{e.spdMod=1;});}
        if(pu.type==='shieldgen'){window.shieldHits=Math.max(0,(window.shieldHits||0)-3);}
        if(pu.type==='doubleshot'){window.doubleShot=false;}
        if(pu.type==='crit_boost'){window.critChance=Math.max(0,(window.critChance||0)-0.3);}
      }
      return false;
    }
    return true;
  });
}
function drawPowerups(){
  powerups.forEach(pu=>{
    cx.save();cx.translate(pu.x,pu.y);
    const glow=cx.createRadialGradient(0,0,pu.r*.3,0,0,pu.r*2);glow.addColorStop(0,pu.color+'44');glow.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=glow;cx.beginPath();cx.arc(0,0,pu.r*2,0,Math.PI*2);cx.fill();
    const pr=pu.r*(1+pu.pulse*.3);cx.strokeStyle=pu.color+'88';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,pr,0,Math.PI*2);cx.stroke();
    cx.fillStyle=pu.color+'22';cx.beginPath();cx.arc(0,0,pu.r*1.2,0,Math.PI*2);cx.fill();
    cx.fillStyle=pu.color;cx.font="bold 14px sans-serif";cx.textAlign='center';cx.textBaseline='middle';cx.fillText(pu.icon,0,0);
    cx.restore();
  });
}
