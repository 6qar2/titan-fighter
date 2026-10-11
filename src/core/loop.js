/* ═══ ENHANCED LOOP ═══ */
function loop(ts){
  if(gState!=='play'||isPaused)return;
  measureFPS(ts);
  const dt=Math.min((ts-lastTS)/1000,.05);lastTS=ts;
  try{update(dt);if(MP.roomCode){mpSyncState(dt);mpUpdateRevive(dt)}if(MP2.roomCode){mp2SyncState(dt);mp2UpdateRemotePlayers(dt);}}catch(e){console.error('Game loop error:',e);}
  try{draw(dt);}catch(e){console.error('Game draw error:',e);}
  animID=requestAnimationFrame(loop);
}

/* ═══ ENHANCED UPDATE LOOP ═══ */
function update(dt){
  const ch=CHARS[selChar];
  if(MP.mpLocalDead&&MP.roomCode&&MP.playerId){
    keys['Space']=false;keys['KeyE']=false;keys['KeyQ']=false;keys['KeyR']=false;
    joystick.active=false;joystick.dx=0;joystick.dy=0;shooting=false;
  }
  if(MP2.mpLocalDead&&MP2.roomCode&&MP2.playerId){
    keys['Space']=false;keys['KeyE']=false;keys['KeyQ']=false;keys['KeyR']=false;
    joystick.active=false;joystick.dx=0;joystick.dy=0;shooting=false;
  }
  if(MP.roomCode&&MP.playerId)mpUpdateRevive(dt);
  if(MP.roomCode&&MP.playerId)mpSpawnAllyBullets(dt);
  if(MP2.roomCode&&MP2.playerId)mp2SpawnAllyBullets(dt);
  if(slowMoTimer>0){slowMoTimer-=dt;if(slowMoTimer<=0){slowMo=1;}else{dt*=slowMo;}}
  if(powerCooldownTimer>0){powerCooldownTimer-=dt;}
  if(keys['KeyE']){keys['KeyE']=false;activatePower();}
  if(weaponSwitchCD>0)weaponSwitchCD-=dt;
  if(gameState2.powerBuff){
    gameState2.powerBuff.timer-=dt;
    if(gameState2.powerBuff.timer<=0){
      if(gameState2.powerBuff.type==='battlecry'){enemies.forEach(e=>{e.spdMod=1;});}
      gameState2.powerBuff=null;
    }
  }
  let mvx=0,mvy=0;
  if(!(MP.mpLocalDead&&MP.roomCode&&MP.playerId)){
    if(keys['ArrowUp']||keys['KeyW'])mvy-=1;if(keys['ArrowDown']||keys['KeyS'])mvy+=1;
    if(keys['ArrowLeft']||keys['KeyA'])mvx-=1;if(keys['ArrowRight']||keys['KeyD'])mvx+=1;
    if(joystick.active){mvx+=joystick.dx;mvy+=joystick.dy;}
    const ml=Math.hypot(mvx,mvy);if(ml>0){mvx/=ml;mvy/=ml;}
    if(gameState2.powerBuff&&gameState2.powerBuff.type==='impenetrable'){mvx=0;mvy=0;}
    let pspd=ch.spd*(P.spdBuff||1);
    P.x+=mvx*pspd*dt;P.y+=mvy*pspd*dt;
  }
  const pad=P.w/2+2,hudH=48;
  P.x=Math.max(pad,Math.min(cv.width-pad,P.x));P.y=Math.max(hudH+pad,Math.min(cv.height-pad,P.y));
  if(P.invinc>0)P.invinc=Math.max(0,P.invinc-dt);
  const vig=DOM.vignette||document.getElementById('vignette');
  if(lives<=1&&gState==='play'){
    if(!vig.classList.contains('near-death')){vig.classList.add('near-death');if(lives===1)sfxBossWarning();}
  }else{
    vig.classList.remove('near-death');
  }
  if(gameState2.shockwave){gameState2.shockwave.r+=dt*480;gameState2.shockwave.alpha-=dt*1.1;if(gameState2.shockwave.alpha<=0)gameState2.shockwave=null;}
  if(shakeIntensity>0){shakeIntensity*=0.92;if(shakeIntensity<0.3)shakeIntensity=0;}
  shakeX=(Math.random()-.5)*shakeIntensity*2;shakeY=(Math.random()-.5)*shakeIntensity*2;
  if(gameState2.meteorCount>0){
    gameState2.meteorTimer-=dt;
    if(gameState2.meteorTimer<=0){
      gameState2.meteorCount--;gameState2.meteorTimer=0.12;
      let mx2,my2;
      if(enemies.length>0){const te=enemies[Math.floor(Math.random()*enemies.length)];mx2=te.x+(Math.random()-0.5)*50;my2=te.y+(Math.random()-0.5)*50;}
      else{mx2=Math.random()*cv.width;my2=80+Math.random()*cv.height*.6;}
      for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(Math.hypot(e.x-mx2,e.y-my2)<55){e.hp-=4;spawnParts(mx2,my2,'#FF6D00',3);}}
      spawnParts(mx2,my2,'#FFD54F',6);
      eBullets.push({x:mx2,y:my2-300,vx:0,vy:800,r:10,col:'#FF6D00',isMeteor:true});
    }
  }
  if(enemies.length>0){
    let near=enemies[0],best=Infinity;
    enemies.forEach(e=>{const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<best){best=d;near=e;}});
    if(aimTouchActive&&Mobile.autoAim&&gState==='play'){
      const rect=cv.getBoundingClientRect();
      const touchRelX=aimTouchX-rect.left,touchRelY=aimTouchY-rect.top;
      const enemyDist=Math.hypot(touchRelX-near.x,touchRelY-near.y);
      if(enemyDist<120){mxP=aimTouchX;myP=aimTouchY;}else{mxP=near.x;myP=near.y;}
    }else{mxP=near.x;myP=near.y;}
  }
  if(Mobile.autoFire&&!shooting){shooting=true;}
  if(Mobile.isMobile)updateFireButtonState();
  const fireInterval=ch.fire/(window.fireRateBuff||1);
  shootCD-=dt;if(shooting&&shootCD<=0){fireBullet();shootCD=fireInterval;}
  if(ammo<maxAmmo){ammoRegenAccum+=dt*diffCfg.ammoRegenRate;if(ammoRegenAccum>=1){const g=Math.floor(ammoRegenAccum);ammo=Math.min(maxAmmo,ammo+g);ammoRegenAccum-=g;updateAmmoHUD();}}
  if(comboT>0){
    comboT-=dt;
    const comboEl=DOM.combo||document.getElementById('combo');
    if(comboT<=0){combo=0;comboEl.classList.remove('decay');comboEl.style.opacity='0';}
    else if(comboT<1&&combo>=3){comboEl.classList.add('decay');}
  }
  const spawnBase=diffCfg.spawnRateBase;const mpSpdMult=MP.roomCode?0.5:1;const sr=Math.max(.25,(spawnBase-wave*.12)*mpSpdMult);
  let waveQuota=6+wave*3;
  if(GameModes.current==='endless')waveQuota=8+wave*4;
  else if(GameModes.current==='bossrush')waveQuota=1;
  else if(GameModes.current==='daily')waveQuota=6+wave*3;
  spawnT-=dt;
  if(spawnT<=0&&!gateOpen&&!waveAdvancing&&waveKills<waveQuota){
    const spawnCount=waveModifier==='hordes'?3:GameModes.current==='endless'?2:1;
    for(let s=0;s<spawnCount;s++){if(enemies.length<getSpawnCap()){
      if(GameModes.current==='bossrush'){
        const bossType=GameModes.getBossRushEnemy();
        if(bossType){const bossDef=EDEFS.find(d=>d.type===bossType);if(bossDef)spawnEnemy(bossDef);}
      }else{
        spawnEnemy();spawnEnemyVariant();
      }
    }}
    spawnT=sr;
  }
  if(!waveAdvancing&&!gateOpen&&gate===null&&waveKills>=waveQuota&&enemies.length===0){
    if(GameModes.current==='endless'){
      wave++;waveKills=0;GameModes.onWaveComplete();
      showWaveAnnounce(wave);
      if(wave%5===0){const mods=['hordes','fast','armored','slow','burning'];waveModifier=mods[Math.floor(Math.random()*mods.length)];applyWaveModifier();showPowerAnnounce('⚠ WAVE '+wave+' · '+waveModifier.toUpperCase());}
      else{waveModifier=null;(DOM.waveMod||document.getElementById('wave-modifier')).style.display='none';}
    }else if(GameModes.current==='bossrush'){
      GameModes.onWaveComplete();
      if(GameModes.bossRushIndex>=5){endGame();return;}
      wave++;waveKills=0;showWaveAnnounce(wave);
    }else if(GameModes.current==='daily'){
      wave++;waveKills=0;showWaveAnnounce(wave);
      if(wave>=GameModes.dailyChallenge.targetWave){endGame();return;}
    }else{
      if(wave>=10){if(MP.roomCode&&MP.playerId){mpShowMatchEnd(mpDetermineResult());}else{endGame();}return;}gateOpen=true;openGate();
    }
  }
  if(gate&&!waveAdvancing&&Math.hypot(P.x-gate.x,P.y-gate.y)<gate.r+P.w*.5)enterGate();
  if(MP.host&&MP.roomRef)mpSyncRoomWave();
  bgCol.r+=(bgColTarget.r-bgCol.r)*.018;bgCol.g+=(bgColTarget.g-bgCol.g)*.018;bgCol.b+=(bgColTarget.b-bgCol.b)*.018;
  if(gate){gate.spin+=dt*1.4;gate.pulse+=dt*2.2;if(gate.pulse>1)gate.pulse=0;}
  poisonTrails=poisonTrails.filter(t=>{t.life-=dt*.4;return t.life>0;});
  updateMagnet();
  ammoPacks=ammoPacks.filter(pk=>{
    pk.pulse+=dt*2.5;if(pk.pulse>1)pk.pulse=0;pk.age+=dt;
    if(Math.hypot(pk.x-P.x,pk.y-P.y)<pk.r+P.w*.45){
      const gained=Math.min(diffCfg.ammoRefill,maxAmmo-ammo);ammo=Math.min(maxAmmo,ammo+diffCfg.ammoRefill);
      sfxAmmoPickup();const af=DOM.ammoFlash||document.getElementById('ammo-flash');af.style.opacity='1';setTimeout(()=>{af.style.opacity='0';},150);
      spawnParts(pk.x,pk.y,pk.club?'#D4AF37':'#00C8A8',pk.club?15:10);
      if(pk.isCorrupt){const scoutDef=EDEFS.find(d=>d.type==='scout');spawnEnemy(scoutDef,pk.x+30,pk.y-20);spawnParts(pk.x,pk.y,'#FF1744',8);triggerShake(3,150);}
      else{spawnPop(pk.x,pk.y,pk.club?`+${gained} ♛ TITANS CLUB`:`+${gained} AMMO`,pk.club?'power':'ammo');}
      if(pk.club){showPowerAnnounce('♛ TITANS CLUB AMMO');triggerShake(3,150);haptic('success');}
      updateAmmoHUD();return false;
    }
    return pk.age<pk.maxAge;
  });
  poisonTrails.forEach(t=>{if(mpIsLocalAlive()&&P.invinc<=0&&Math.hypot(P.x-t.x,P.y-t.y)<18)takeDmg();});
  spawnPowerup();updatePowerups(dt);updateActivePowerups(dt);
  updateDmgNums(dt);updateKillFeed(dt);
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='heal'){gameState2.healAccum=(gameState2.healAccum||0)+dt*2;const gained=Math.floor(gameState2.healAccum);if(gained>0){lives=Math.min(lives+gained,diffCfg.lives);gameState2.healAccum-=gained;}}
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='smoke'&&P.invinc>0){P.invinc=Math.max(P.invinc,4);}
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='nano_speed'){P.spdBuff=Math.max(P.spdBuff||1,2.2);}
  if(waveModifier==='burning'&&mpIsLocalAlive()&&P.invinc<=0){takeDmg(dt*2);spawnParts(P.x,P.y,'#FF6D00',1);}
    if(waveModifierTimer>0){waveModifierTimer-=dt;if(waveModifierTimer<=0){waveModifier=null;(DOM.waveMod||document.getElementById('wave-modifier')).style.display='none';}}

  /* ─── ENEMY UPDATE ─── */
  const deadEnemies=[];
  enemies.forEach(e=>{
    e.wob+=dt*2.2;
    if(e.stunT>0){e.stunT-=dt;return;}
    const target=(MP2.roomCode&&MP2.playerId)?mp2GetEnemyTarget(e):mpGetEnemyTarget(e);
    if(!target)target=P;
    const dx=target.x-e.x,dy=target.y-e.y,dist=Math.hypot(dx,dy)||1;
    let spdMult=(e.spdMod||1);
    if(waveModifier==='fast')spdMult*=1.6;
    if(waveModifier==='slow')spdMult*=.6;
    const wm=1+(wave-1)*.15;
    const baseSpd=e.spd*spdMult*wm*90;
    if(e.ability==='regen'){e.regenT-=dt;if(e.regenT<=0){e.hp=Math.min(e.maxHp,e.hp+1);e.regenT=2;spawnParts(e.x,e.y,'#4CAF50',2);}}
    if(e.ability==='phase'){e.teleportCD-=dt;if(e.teleportCD<=0){e.visible=!e.visible;e.teleportCD=1.5+Math.random()*2;}}
    if(e.ability==='zigzag'){e.zigT-=dt;if(e.zigT<=0){e.zigDir*=-1;e.zigT=.8+Math.random()*.5;}const perp={x:-dy/dist,y:dx/dist};e.vx+=(dx/dist*baseSpd+perp.x*baseSpd*e.zigDir*1.5)*dt*3;e.vy+=(dy/dist*baseSpd+perp.y*baseSpd*e.zigDir*1.5)*dt*3;}
    else if(e.ability==='strafe'){e.strafeT+=dt;const targetDist=220;const distErr=dist-targetDist;const tx2=dx/dist*distErr*.8;const ty2=dy/dist*distErr*.8;const perp={x:-dy/dist*e.strafeDir,y:dx/dist*e.strafeDir};e.vx+=(tx2+perp.x*baseSpd)*dt*2.5;e.vy+=(ty2+perp.y*baseSpd)*dt*2.5;if(e.strafeT>3+Math.random()){e.strafeDir*=-1;e.strafeT=0;}}
    else     if(e.ability==='charge'||e.ability==='explode'){e.chargeCD-=dt;e.chargeT-=dt;if(e.chargeCD<=0){const sp2=baseSpd*(e.ability==='explode'?3.0:2.2);e.chargeVx=(dx/dist)*sp2;e.chargeVy=(dy/dist)*sp2;e.chargeT=.5;e.chargeCD=(e.ability==='explode'?2:2.5)+Math.random()*1.5;}if(e.chargeT>0){e.vx=e.chargeVx;e.vy=e.chargeVy;if(e.ability==='explode'&&Math.hypot(e.x-target.x,e.y-target.y)<30){if(mpIsLocalAlive())takeDmg();e.hp=0;spawnParts(e.x,e.y,e.col,12);deadEnemies.push(e);}}else{e.vx+=(dx/dist)*baseSpd*dt*2;e.vy+=(dy/dist)*baseSpd*dt*2;}}
    else if(e.ability==='teleport'){e.vx+=(dx/dist)*baseSpd*dt*3;e.vy+=(dy/dist)*baseSpd*dt*3;e.teleportCD-=dt;if(e.teleportCD<=0){sfxTeleport();spawnParts(e.x,e.y,'#9B59B6',4);const a2=Math.random()*Math.PI*2,r2=120+Math.random()*120;e.x=Math.max(40,Math.min(cv.width-40,target.x+Math.cos(a2)*r2));e.y=Math.max(80,Math.min(cv.height-40,target.y+Math.sin(a2)*r2));e.vx=0;e.vy=0;spawnParts(e.x,e.y,'#CE9EF5',4);e.teleportCD=2.5+Math.random()*2;}}
    else if(e.ability==='snipe'){const targetDist=e.preferDist;const distErr=dist-targetDist;e.vx+=(dx/dist)*distErr*.5*dt*3;e.vy+=(dy/dist)*distErr*.5*dt*3;}
    else if(e.ability==='dive'){e.diveCD-=dt;if(!e.diveMode&&e.diveCD<=0){e.diveMode=true;e.chargeVx=(dx/dist)*baseSpd*2.8;e.chargeVy=(dy/dist)*baseSpd*2.8;e.chargeT=.7;e.diveCD=2+Math.random()*2;}if(e.diveMode&&e.chargeT>0){e.vx=e.chargeVx;e.vy=e.chargeVy;e.chargeT-=dt;}else{e.diveMode=false;e.vx+=(dx/dist)*baseSpd*dt*2;e.vy+=(dy/dist)*baseSpd*dt*2;}}
    else{e.vx+=(dx/dist)*baseSpd*dt*3;e.vy+=(dy/dist)*baseSpd*dt*3;}
    if(e.ability==='shield')e.shieldAngle=(e.shieldAngle||0)+dt*0.9;
    if(e.ability==='reflect')e.reflectAngle=(e.reflectAngle||0)+dt*1.2;
    if(e.ability==='smoke'){e.smokeT-=dt;if(e.smokeT<=0){smokeClods.push({x:e.x,y:e.y,r:8,maxR:55,alpha:.45,t:0});e.smokeT=3+Math.random();}}
    if(e.ability==='poison'){e.trail.push({x:e.x,y:e.y,t:0});if(e.trail.length>80)e.trail.shift();if(Math.floor(Date.now()/200)%3===0)poisonTrails.push({x:e.x,y:e.y,life:1});}
    if(e.ability==='fortify'){e.fortifyT-=dt;if(e.fortifyT<=0){e.fortified=!e.fortified;e.fortifyT=4+Math.random()*2;if(e.fortified)spawnParts(e.x,e.y,'#5C6BC0',5);}}
    if(e.ability==='summon'){e.summonT-=dt;if(e.summonT<=0){const minorDef=EDEFS.find(d=>d.type==='scout');for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;spawnEnemy(minorDef,e.x+Math.cos(a)*60,e.y+Math.sin(a)*60);}spawnParts(e.x,e.y,e.col,8);e.summonT=8+Math.random()*4;}}
    if(e.ability==='godmode'){e.godT-=dt;const hpPct=e.hp/e.maxHp;if(hpPct<0.33&&e.godPhase<2){e.godPhase=2;e.godShield=false;spawnParts(e.x,e.y,'#FFD700',15);}else if(hpPct<0.66&&e.godPhase<1){e.godPhase=1;}}
    if(e.ability==='turret'){e.turretT-=dt;if(e.turretT<=0){e.hp=0;}else{e.turretCD-=dt;if(e.turretCD<=0){fireAt(e,target.x,target.y,350,4);e.turretCD=.35;}}}
    if(e.ability==='rock_throw'){e.rockCD-=dt;if(e.rockCD<=0){eBullets.push({x:e.x,y:e.y,vx:(target.x-e.x)*.6,vy:(target.y-e.y)*.6-40,r:10,col:'#795548',gravity:280});e.rockCD=2+Math.random()*1.5;}}
    if(e.ability==='soul_steal'){e.soulCD-=dt;if(e.soulCD<=0){if(Math.hypot(e.x-target.x,e.y-target.y)<60){if(mpIsLocalAlive())takeDmg(2);}e.soulCD=3+Math.random()*2;spawnParts(e.x,e.y,'#212121',6);}}
    if(e.ability==='berserk'){const hpPct=e.hp/e.maxHp;if(hpPct<.5){e.spdMod=2.2;e.dmgMult=2;}spawnParts(e.x,e.y,'#D81B60',2);}
    if(e.ability==='fire_aura'){e.fireAuraCD-=dt;if(e.fireAuraCD<=0){if(mpIsLocalAlive()&&Math.hypot(e.x-P.x,e.y-P.y)<100)takeDmg(1);spawnParts(e.x,e.y,'#FF6D00',4);e.fireAuraCD=.5;}}
    if(e.ability==='ice_blast'){e.iceCD-=dt;if(e.iceCD<=0){eBullets.push({x:e.x,y:e.y,vx:(target.x-e.x)*1.2,vy:(target.y-e.y)*1.2,r:8,col:'#00B0FF',ice:true});e.iceCD=2.5+Math.random()*2;}}
    if(e.ability==='plague'){e.plagueCD-=dt;if(e.plagueCD<=0){ammoPacks.push({x:e.x+Math.cos(Date.now()*.01)*40,y:e.y+Math.sin(Date.now()*.01)*40,r:12,pulse:0,age:0,maxAge:2.5,club:false,isPlague:true});e.plagueCD=2+Math.random()*1.5;}}
    if(e.ability==='void_rift'){e.voidCD-=dt;if(e.voidCD<=0){for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;eBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:6,col:'#4A148C'});}e.voidCD=3+Math.random()*2;spawnParts(e.x,e.y,'#4A148C',12);}}
    if(e.ability==='lightning_storm'){e.lightStormCD-=dt;if(e.lightStormCD<=0){for(let i=0;i<4;i++){setTimeout(()=>{if(mpIsLocalAlive()){const rx=P.x+(Math.random()-.5)*200,ry=P.y+(Math.random()-.5)*200;if(Math.hypot(rx-P.x,ry-P.y)<40)takeDmg(2);spawnParts(rx,ry,'#FF8F00',8);}},i*150);}e.lightStormCD=5+Math.random()*2;}}
    if(e.ability==='overlord'){e.overlordCD-=dt;if(e.overlordCD<=0){enemies.forEach(ex=>{ex.spdMod=Math.min(ex.spdMod||1,2.5);ex.dmgMult=(ex.dmgMult||1)*1.3;});spawnParts(e.x,e.y,'#B71C1C',20);e.overlordCD=6+Math.random()*2;}if(e.hp<e.maxHp*.3){e.overlordHealCD-=dt;if(e.overlordHealCD<=0){e.hp=Math.min(e.maxHp,e.hp+2);e.overlordHealCD=1.5;spawnParts(e.x,e.y,'#B71C1C',3);}}}
    const mv=Math.hypot(e.vx,e.vy);const maxV=((e.ability==='charge'||e.ability==='dive')&&e.chargeT>0)?baseSpd*3:baseSpd;
    if(mv>maxV){e.vx=e.vx/mv*maxV;e.vy=e.vy/mv*maxV;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.ang=Math.atan2(dy,dx);
    if(e.sRate>0&&(e.ability!=='phase'||e.visible)){
      e.st-=dt;const fireCD=1/e.sRate;
      if(e.st<=0){
        if(e.ability==='spread'||e.ability==='chaos'){[-0.28,0,0.28].forEach(off=>{fireAngle(e,Math.atan2(target.y-e.y,target.x-e.x)+off,200,5);});}
        if(e.ability==='chaos'){e.spiralAng+=0.33;fireAngle(e,e.spiralAng,175,5);fireAngle(e,e.spiralAng+Math.PI,175,5);}
        else if(e.ability==='burst'){if(!e.burstMode){e.burstMode=true;e.burstCount=0;e.burstCD=0;}e.burstCD-=dt;if(e.burstCD<=0&&e.burstCount<3){fireAt(e,target.x,target.y,225,5);e.burstCount++;e.burstCD=.12;}if(e.burstCount>=3){e.burstMode=false;e.st=fireCD*1.2;}}
        else if(e.ability==='spiral'){e.spiralAng+=0.44;fireAngle(e,e.spiralAng,185,5);fireAngle(e,e.spiralAng+Math.PI,185,5);e.st=fireCD;}
        else if(e.ability==='nova'||e.ability==='godmode'){e.novaCD-=dt;if(e.novaCD<=0){const count2=e.ability==='godmode'?(e.godPhase>=1?12:8):8;for(let i=0;i<count2;i++)fireAngle(e,(i/count2)*Math.PI*2,e.ability==='godmode'?200:170,6);e.novaCD=(e.ability==='godmode'?2:4)+Math.random();spawnParts(e.x,e.y,'#D4AF37',8);}e.st=.1;}
        else if(e.ability==='snipe'){e.snipeT-=dt;if(e.snipeT<=0){fireAt(e,target.x,target.y,380,7);e.snipeT=2.5+Math.random()*2;}e.st=.1;}
        else if(e.ability==='lob'){e.lobT-=dt;if(e.lobT<=0){eBullets.push({x:e.x,y:e.y,vx:(target.x-e.x)*.8,vy:(target.y-e.y)*.8-80,r:7,col:e.col,gravity:320,lob:true});e.lobT=2+Math.random()*1.5;}e.st=.1;}
        else if(e.ability==='lightning'){e.lightT-=dt;if(e.lightT<=0){eBullets.push({x:target.x+(Math.random()-0.5)*40,y:-20,vx:0,vy:600,r:6,col:'#FFF176',lightning:true});e.lightT=2+Math.random()*1.5;spawnParts(target.x,target.y,'#FFF176',3);}e.st=.1;}
        else if(e.ability==='corrupt'){e.corruptT-=dt;if(e.corruptT<=0){const ca=Math.random()*Math.PI*2,cd2=80+Math.random()*80;ammoPacks.push({x:e.x+Math.cos(ca)*cd2,y:e.y+Math.sin(ca)*cd2,r:14,pulse:0,age:0,maxAge:3,club:false,isCorrupt:true});e.corruptT=3+Math.random()*2;}}
        else if(e.ability==='fortify'){if(!e.fortified)fireAt(e,target.x,target.y,200,5);e.st=fireCD;}
        else if(e.ability==='revive'){fireAt(e,target.x,target.y,180,5);e.st=fireCD;}
        else if(e.ability==='summon'){fireAt(e,target.x,target.y,190,5);e.st=fireCD;}
        else if(e.ability==='godmode'){if(e.godPhase>=1){[-0.2,0,0.2].forEach(off=>{fireAngle(e,Math.atan2(target.y-e.y,target.x-e.x)+off,220,6);});}else fireAt(e,target.x,target.y,200,5);e.st=fireCD;}
        else if(e.ability==='rock_throw'){e.rockCD-=dt;if(e.rockCD<=0){eBullets.push({x:e.x,y:e.y,vx:(target.x-e.x)*.6,vy:(target.y-e.y)*.6-40,r:10,col:'#795548',gravity:280});e.rockCD=2+Math.random()*1.5;}e.st=fireCD;}
        else if(e.ability==='ice_blast'){e.iceCD-=dt;if(e.iceCD<=0){eBullets.push({x:e.x,y:e.y,vx:(target.x-e.x)*1.2,vy:(target.y-e.y)*1.2,r:8,col:'#00B0FF',ice:true});e.iceCD=2.5+Math.random()*2;}e.st=fireCD;}
        else{fireAt(e,target.x,target.y,200,5);e.st=fireCD;}
      }
    }
    if(mpIsLocalAlive()&&P.invinc<=0&&Math.hypot(e.x-P.x,e.y-P.y)<e.sz+(e.ability==='phase'&&!e.visible?-100:0)+P.w*.38)takeDmg();
  });
  smokeClods=smokeClods.filter(s=>{s.t+=dt;s.r=s.maxR*(s.t/2);s.alpha=.45*(1-s.t/4);return s.t<4;});

  // Player bullets
  bullets=bullets.filter(b=>{
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<-20||b.x>cv.width+20||b.y<-20||b.y>cv.height+20)return false;
    const toKill=[];
    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];if(deadEnemies.includes(e))continue;
      if(b.pierce){if(Math.hypot(b.x-e.x,b.y-e.y)<e.sz+b.r){e.hp-=b.dmg;spawnParts(b.x,b.y,e.col,3);if(!b.hit){stats.accuracy.hits++;b.hit=true;}if(e.hp<=0){toKill.push({enemy:e,idx:i});}continue;}}
      else{if(Math.hypot(b.x-e.x,b.y-e.y)<e.sz+b.r){checkBulletCollision(b,e,i);return false;}}
    }
    for(const k of toKill)killEnemy(k.enemy,k.idx);
    return true;
  });
  deadEnemies.forEach(e=>{const idx=enemies.indexOf(e);if(idx>=0)killEnemy(e,idx);});
  eBullets=eBullets.filter(b=>{
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.gravity)b.vy+=b.gravity*dt;
    if(b.x<-20||b.x>cv.width+20||b.y<-300||b.y>cv.height+20)return false;
    if(gameState2.powerBuff&&gameState2.powerBuff.type==='aegis'&&gameState2.powerBuff.reflect){if(Math.hypot(b.x-P.x,b.y-P.y)<P.w*.7+b.r){b.vx=-b.vx;b.vy=-b.vy;return true;}}
    if(mpIsLocalAlive()&&P.invinc<=0&&Math.hypot(b.x-P.x,b.y-P.y)<P.w*.38+b.r){takeDmg();return false;}
    return true;
  });
  parts=parts.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=65*dt;p.life-=p.dec;return p.life>0;});
  stars.forEach(s=>{s.y+=s.spd*dt;if(s.y>cv.height){s.y=0;s.x=Math.random()*cv.width;}});
  muzzleFlashes=muzzleFlashes.filter(f=>{f.life-=dt;return f.life>0;});
  bulletTrails=bulletTrails.filter(t=>{t.age+=dt;return t.age<t.maxAge;});
  hitSparks=hitSparks.filter(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=120*dt;s.life-=dt*2;return s.life>0;});
  activeTurrets=activeTurrets.filter(t=>{t.timer-=dt;t.cd-=dt;if(t.cd<=0){const nearest=enemies.reduce((best,e)=>{const d=Math.hypot(e.x-t.x,e.y-t.y);return d<best.d?{e,d}:best;},{e:null,d:Infinity}).e;if(nearest){const a=Math.atan2(nearest.y-t.y,nearest.x-t.x);eBullets.push({x:t.x,y:t.y,vx:Math.cos(a)*350,vy:Math.sin(a)*350,r:3,col:'#4AFFFF'});t.cd=.35;}}return t.timer>0;});
}

/* ═══ DRAW ═══ */
function draw(dt){
  cx.save();
  cx.translate(shakeX,shakeY);
  cx.fillStyle=`rgb(${Math.round(bgCol.r)},${Math.round(bgCol.g)},${Math.round(bgCol.b)})`;cx.fillRect(-10,-10,cv.width+20,cv.height+20);
  const combatIntensity=enemies.length>0?Math.min(1,enemies.length/10):0;
  const vg=cx.createRadialGradient(cv.width/2,cv.height/2,0,cv.width/2,cv.height/2,cv.width*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${.5+combatIntensity*.3})`);cx.fillStyle=vg;cx.fillRect(0,0,cv.width,cv.height);
  cx.strokeStyle='rgba(200,168,75,.018)';cx.lineWidth=1;for(let x=0;x<cv.width;x+=70){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,cv.height);cx.stroke();}for(let y=0;y<cv.height;y+=70){cx.beginPath();cx.moveTo(0,y);cx.lineTo(cv.width,y);cx.stroke();}
  stars.forEach(s=>{cx.beginPath();cx.arc(s.x,s.y,s.r,0,Math.PI*2);cx.fillStyle=`rgba(237,229,204,${s.a})`;cx.fill();});
  bulletTrails.forEach(t=>{if(!shouldDrawTrail())return;cx.globalAlpha=(1-t.age/t.maxAge)*Perf.trailAlpha;cx.strokeStyle=t.color;cx.lineWidth=2;cx.beginPath();cx.moveTo(t.x,t.y);cx.lineTo(t.x-t.vx*.04,t.y-t.vy*.04);cx.stroke();cx.globalAlpha=1;});
  poisonTrails.forEach(t=>{cx.globalAlpha=t.life*.4;cx.fillStyle='rgba(174,213,129,.5)';cx.beginPath();cx.arc(t.x,t.y,6,0,Math.PI*2);cx.fill();});
  smokeClods.forEach(s=>{cx.globalAlpha=s.alpha;cx.fillStyle='rgba(120,144,156,.35)';cx.beginPath();cx.arc(s.x,s.y,s.r,0,Math.PI*2);cx.fill();});
  parts.forEach(p=>{cx.globalAlpha=p.life;cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);cx.fill();});
  ammoPacks.forEach(pk=>drawAmmoPackGlyph(cx,pk.x,pk.y,pk.r,pk.pulse,pk.club));
  drawPowerups();
  if(gameState2.shockwave){const sw=gameState2.shockwave;cx.globalAlpha=sw.alpha*.5;cx.strokeStyle='#FFCC80';cx.lineWidth=4;cx.beginPath();cx.arc(sw.x,sw.y,sw.r,0,Math.PI*2);cx.stroke();}
  if(gameState2.powerBuff){
    const pb=gameState2.powerBuff;
    if(pb.type==='aegis'){cx.strokeStyle='rgba(130,177,255,.6)';cx.lineWidth=2;cx.beginPath();cx.arc(P.x,P.y,P.w+10+Math.sin(Date.now()*.01)*4,0,Math.PI*2);cx.stroke();}
    if(pb.type==='battlecry'){cx.strokeStyle='rgba(255,68,34,.4)';cx.lineWidth=2;cx.beginPath();cx.arc(P.x,P.y,P.w+8+Math.sin(Date.now()*.015)*3,0,Math.PI*2);cx.stroke();}
    if(pb.type==='heal'){cx.strokeStyle='rgba(76,175,80,.3)';cx.lineWidth=2;cx.beginPath();cx.arc(P.x,P.y,P.w+12+Math.sin(Date.now()*.02)*5,0,Math.PI*2);cx.stroke();}
    if(pb.type==='smoke'){cx.globalAlpha=.5+Math.sin(Date.now()*.02)*.3;cx.fillStyle='rgba(74,74,106,.3)';cx.beginPath();cx.arc(P.x,P.y,P.w+20,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
  }
  muzzleFlashes.forEach(f=>{cx.globalAlpha=f.life/f.maxLife;cx.fillStyle=f.color;cx.beginPath();cx.arc(f.x,f.y,f.size,0,Math.PI*2);cx.fill();cx.globalAlpha=1;});
  hitSparks.forEach(s=>{cx.globalAlpha=s.life;cx.fillStyle=s.color;cx.beginPath();cx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);cx.fill();cx.globalAlpha=1;});
  eBullets.forEach(b=>{cx.fillStyle=b.col;cx.beginPath();cx.arc(b.x,b.y,b.r,0,Math.PI*2);cx.fill();});
  bullets.forEach(b=>{cx.save();cx.translate(b.x,b.y);cx.rotate(Math.atan2(b.vy,b.vx));cx.fillStyle=b.color||'#E2C06A';cx.beginPath();cx.ellipse(0,0,12,b.r,0,0,Math.PI*2);cx.fill();cx.restore();});
  activeTurrets.forEach(t=>{cx.fillStyle='#4AFFFF';cx.beginPath();cx.arc(t.x,t.y,6,0,Math.PI*2);cx.fill();cx.strokeStyle='rgba(74,255,255,.6)';cx.lineWidth=2;cx.beginPath();cx.arc(t.x,t.y,10+Math.sin(Date.now()*.01)*3,0,Math.PI*2);cx.stroke();});
  enemies.forEach(drawEnemy);
  if(gate)drawGate(cx,gate);
  if(aimTouchActive&&Mobile.autoAim&&enemies.length>0&&gState==='play'){
    let near=enemies[0],best=Infinity;
    enemies.forEach(e=>{const d=Math.hypot(e.x-aimTouchX/(window.devicePixelRatio||1),e.y-aimTouchY/(window.devicePixelRatio||1));if(d<best){best=d;near=e;}});
    if(best<140){
      cx.strokeStyle='rgba(212,175,55,0.6)';cx.lineWidth=2;cx.setLineDash([5,5]);
      cx.beginPath();cx.arc(near.x,near.y,near.sz+6,0,Math.PI*2);cx.stroke();
      cx.setLineDash([]);
      const xh=DOM.xhair||document.getElementById('xhair');
      if(xh&&best<80)xh.classList.add('lockon');else{if(xh)xh.classList.remove('lockon');}
    }else{
      const xh=document.getElementById('xhair');xh&&xh.classList.remove('lockon');
    }
  }
  drawRemotePlayers(dt);
  drawRemotePlayers2(dt);
  const ch=CHARS[selChar];
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='smoke'){cx.globalAlpha=.5+Math.sin(Date.now()*.015)*.3;cx.fillStyle='rgba(74,74,106,.3)';cx.beginPath();cx.arc(P.x,P.y,P.w+30,0,Math.PI*2);cx.fill();cx.globalAlpha=1;}
  if(!(P.invinc>0&&Math.floor(P.invinc*10)%2===0)){cx.save();cx.shadowColor=ch.color;cx.shadowBlur=10;const ang=Math.atan2(myP-P.y,mxP-P.x)+Math.PI/2;ch.draw(P.x,P.y,ang,cx);cx.restore();}
  drawDmgNums();drawKillFeed();
  const sl=(Date.now()*.03)%cv.height;cx.fillStyle='rgba(200,168,75,.01)';cx.fillRect(0,sl,cv.width,2);
  cx.restore();
  drawMinimap();
}
