/* ═══ SPAWN ENEMY ═══ */
function spawnEnemy(forceDef,forceX,forceY){
  const def=forceDef||pickEnemyDef(wave);
  const mg=def.sz+20;const side=Math.floor(Math.random()*3);let x,y;
  if(forceX!==undefined){x=forceX;y=forceY;}
  else if(side===0){x=mg+Math.random()*(cv.width-mg*2);y=-def.sz;}
  else if(side===1){x=-def.sz;y=mg+Math.random()*cv.height*.5;}
  else{x=cv.width+def.sz;y=mg+Math.random()*cv.height*.5;}
  const wm=1+(wave-1)*.15;
  const scaledHp=Math.ceil(def.hp*diffCfg.enemyHpMult);
  const isElite=Math.random()<.08&&wave>=3;
  const e={...def,maxHp:scaledHp*(isElite?2.5:1),hp:scaledHp*(isElite?2.5:1),x,y,vx:0,vy:0,st:Math.random()*1.5,wob:Math.random()*Math.PI*2,wm,ang:0,spdMod:1,stunT:0,
    spd:def.spd*diffCfg.enemySpdMult,sRate:def.sRate*diffCfg.enemyFireMult,isElite
  };
  if(isElite){e.col='#FFD700';e.label='ELITE '+e.label;sfxBossWarning();}
  if(def.ability==='strafe'){e.strafeAngle=0;e.strafeDir=Math.random()<.5?1:-1;e.strafeT=0;}
  if(def.ability==='shield'){e.shieldAngle=0;}
  if(def.ability==='burst'||def.ability==='chaos'){e.burstCount=0;e.burstCD=0;e.burstMode=false;}
  if(def.ability==='charge'||def.ability==='explode'){e.chargeVx=0;e.chargeVy=0;e.chargeT=0;e.chargeCD=def.ability==='explode'?1.5:2+Math.random()*2;}
  if(def.ability==='teleport'||def.ability==='phase'){e.teleportT=0;e.teleportCD=3+Math.random()*2;e.visible=true;}
  if(def.ability==='spiral'||def.ability==='chaos'){e.spiralAng=Math.random()*Math.PI*2;}
  if(def.ability==='nova'||def.ability==='godmode'){e.novaT=0;e.novaCD=4+Math.random();}
  if(def.ability==='regen'){e.regenT=0;}
  if(def.ability==='split'){e.splitDone=false;}
  if(def.ability==='zigzag'){e.zigT=0;e.zigDir=Math.random()<.5?1:-1;}
  if(def.ability==='snipe'){e.snipeT=2+Math.random()*2;e.preferDist=280;}
  if(def.ability==='smoke'){e.smokeT=3+Math.random();}
  if(def.ability==='lob'){e.lobT=2+Math.random();}
  if(def.ability==='reflect'){e.reflectAngle=0;}
  if(def.ability==='fortify'){e.fortifyT=5+Math.random()*3;e.fortified=false;}
  if(def.ability==='dive'){e.diveT=0;e.diveMode=false;e.diveCD=2+Math.random();}
  if(def.ability==='chaos'){e.chaosPhase=0;e.chaosT=0;}
  if(def.ability==='summon'){e.summonT=6+Math.random()*3;}
  if(def.ability==='lightning'){e.lightT=2+Math.random()*2;}
  if(def.ability==='corrupt'){e.corruptT=3+Math.random()*2;}
  if(def.ability==='godmode'){e.godPhase=0;e.godT=0;e.godShield=true;}
  if(def.ability==='poison'){e.trail=[];}
  if(def.ability==='revive'){e.revived=false;e.revivedTarget=null;}
  if(def.ability==='armored'){e.armorMod=0.2;}
  if(def.ability==='rock_throw'){e.rockCD=2+Math.random()*2;}
  if(def.ability==='soul_steal'){e.soulCD=3+Math.random()*2;}
  if(def.ability==='berserk'){e.berserkActive=false;}
  if(def.ability==='fire_aura'){e.fireAuraCD=.5;}
  if(def.ability==='ice_blast'){e.iceCD=2+Math.random()*2;}
  if(def.ability==='plague'){e.plagueCD=2+Math.random()*2;}
  if(def.ability==='void_rift'){e.voidCD=3+Math.random()*2;}
  if(def.ability==='lightning_storm'){e.lightStormCD=5+Math.random()*2;}
  if(def.ability==='overlord'){e.overlordCD=6+Math.random()*2;e.overlordHealCD=1.5;}
  if(def.type==='caesar')showEnemyWarn('♛ CAESAR · TITANS CLUB LEGEND');
  if(def.type==='warlord')showEnemyWarn('⚔ WARLORD · TITANS CLUB ELITE');
  if(def.type==='titangod')showEnemyWarn('☀ TITAN GOD · TITANS CLUB PRIME');
  if(def.type==='herald')showEnemyWarn('⚑ TITAN HERALD · TITANS CLUB');
  if(def.type==='chaoslord')showEnemyWarn('✦ CHAOS LORD · TITANS CLUB');
  if(def.type==='irontitan')showEnemyWarn('♛ IRON TITAN · TITANS CLUB VANGUARD');
  if(def.type==='colossusg')showEnemyWarn('⚔ TITAN GUARD · TITANS CLUB');
  if(def.type==='goliath')showEnemyWarn('🌍 GOLIATH · EARTH SHAPER');
  if(def.type==='reaper')showEnemyWarn('💀 REAPER · SOUL STEALER');
  if(def.type==='zealot')showEnemyWarn('🔥 ZEALOT · BERSERKER');
  if(def.type==='inferno')showEnemyWarn('🔥 INFERNO · FIRE LORD');
  if(def.type==='frostgiant')showEnemyWarn('❄️ FROST GIANT · ICE LORD');
  if(def.type==='plaguebringer')showEnemyWarn('☠️ PLAGUE BRINGER · DEATH');
  if(def.type==='voidreaver')showEnemyWarn('👻 VOID REAVER · VOID');
  if(def.type==='stormlord')showEnemyWarn('⚡ STORM LORD · THUNDER');
  if(def.type==='titanoverlord')showEnemyWarn('♛ TITAN OVERLORD · FINAL');
  enemies.push(e);
}
function spawnTitan(wave){
  if(enemies.some(e=>e.isTitan))return;
  const hp=Math.ceil(140*diffCfg.enemyHpMult*(1+(wave-5)*0.4));
  const def={type:'mp_titan',label:'SHARED TITAN',hp:hp,sz:48,spd:0.42,sRate:0.7,pts:600};
  const e={...def,maxHp:hp,hp:hp,x:cv.width/2,y:-70,vx:0,vy:0,st:0,wob:0,wm:1,ang:0,spdMod:1,stunT:0,spd:def.spd*diffCfg.enemySpdMult,sRate:def.sRate*diffCfg.enemyFireMult,isElite:false,isTitan:true,col:'#C77DFF'};
  enemies.push(e);
  showEnemyWarn('☄ TITAN APPROACHING');
}
function spawnEnemyVariant(){
  if(Math.random()>0.08||enemies.length>=getSpawnCap())return;
  const pool=[];if(wave>=4){pool.push('elite','berserker');}if(wave>=5){pool.push('tribune','phantom','bomber','necromancer','viper','leech');}if(wave>=6){pool.push('irontitan','thunderer','corruptor','zealot');}if(wave>=7){pool.push('warlord','colossusg','stormeagle','inferno','frostgiant');}if(wave>=8){pool.push('voidwalker','chaoslord','goliath','reaper','plaguebringer');}if(wave>=9){pool.push('herald','voidreaver','stormlord');}if(wave>=10){pool.push('caesar','titangod','titanoverlord');}pool.push('skirmisher','soldier');
  const def=EDEFS.find(d=>d.type===pool[Math.floor(Math.random()*pool.length)]);
  if(def)spawnEnemy(def);
}
function drawEnemy(e){
  if(e.ability==='phase'&&!e.visible&&Math.floor(Date.now()/150)%3===0)return;
  cx.save();cx.translate(e.x,e.y);
  if(e.ability==='phase')cx.globalAlpha=e.visible?1:0.25;
  if(shouldDrawShadow()){cx.shadowColor=e.col;cx.shadowBlur=e.type==='titangod'||e.type==='caesar'||e.type==='chaoslord'?30:14;}
  cx.strokeStyle='rgba(255,60,60,0.7)';cx.lineWidth=2.5;
  cx.beginPath();cx.arc(0,0,e.sz+4,0,Math.PI*2);cx.stroke();
  if(e.isElite){cx.shadowColor='#FFD700';cx.shadowBlur=20;cx.strokeStyle='rgba(255,215,0,.9)';cx.lineWidth=2.5;cx.beginPath();cx.arc(0,0,e.sz+7,0,Math.PI*2);cx.stroke();}
  const s=e.sz;
  switch(e.type){
    case 'scout':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.6,s*.65);cx.lineTo(0,s*.25);cx.lineTo(s*.6,s*.65);cx.closePath();cx.fill();break;
    case 'runner':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s*1.2);cx.lineTo(-s*.4,s*.3);cx.lineTo(0,0);cx.lineTo(s*.4,s*.3);cx.closePath();cx.fill();cx.strokeStyle='rgba(255,200,0,.7)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(0,-s*.5);cx.lineTo(0,s*.8);cx.stroke();break;
    case 'crawler':cx.fillStyle=e.col;for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+e.wob*.5;cx.beginPath();cx.arc(Math.cos(a)*s*.7,Math.sin(a)*s*.7,s*.3,0,Math.PI*2);cx.fill();}cx.fillStyle='rgba(100,200,100,.8)';cx.beginPath();cx.arc(0,0,s*.4,0,Math.PI*2);cx.fill();break;
    case 'spitter':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,s*.85,0,Math.PI*2);cx.fill();cx.fillStyle='rgba(38,198,218,.9)';for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+e.wob;cx.beginPath();cx.arc(Math.cos(a)*s*.55,Math.sin(a)*s*.55,s*.22,0,Math.PI*2);cx.fill();}break;
    case 'twin':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;[-s*.45,s*.45].forEach(ox=>{cx.beginPath();cx.moveTo(ox,-s*.65);cx.lineTo(ox-s*.4,s*.45);cx.lineTo(ox,s*.2);cx.lineTo(ox+s*.4,s*.45);cx.closePath();cx.fill();});break;
    case 'skirmisher':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.55,s*.6);cx.lineTo(0,s*.25);cx.lineTo(s*.55,s*.6);cx.closePath();cx.fill();break;
    case 'soldier':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.6,s*.65);cx.lineTo(0,s*.25);cx.lineTo(s*.6,s*.65);cx.closePath();cx.fill();break;
    case 'juggernaut':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s,s*.6);cx.lineTo(-s*.4,s*.3);cx.lineTo(0,s*.7);cx.lineTo(s*.4,s*.3);cx.lineTo(s,s*.6);cx.closePath();cx.fill();cx.strokeStyle='rgba(200,230,240,.4)';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,s*.5,0,Math.PI*2);cx.stroke();break;
    case 'sniper':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s*1.3);cx.lineTo(-s*.3,s*.5);cx.lineTo(0,s*.1);cx.lineTo(s*.3,s*.5);cx.closePath();cx.fill();cx.strokeStyle='rgba(0,172,193,.8)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(0,-s*1.3);cx.lineTo(0,-s*2.2);cx.stroke();break;
    case 'smoker':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,s*.8,0,Math.PI*2);cx.fill();cx.fillStyle='rgba(120,144,156,.5)';for(let i=0;i<3;i++){const a=e.wob+i*1.2;cx.beginPath();cx.arc(Math.cos(a)*s*.4,Math.sin(a)*s*.4,s*.35,0,Math.PI*2);cx.fill();}break;
    case 'leech':cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2+e.wob*.3,r2=i%2===0?s:s*.55;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.fillStyle='rgba(76,175,80,.6)';cx.beginPath();cx.arc(0,0,s*.35,0,Math.PI*2);cx.fill();break;
    case 'mirror':cx.rotate(e.reflectAngle||0);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2,r2=i%2===0?s:s*.6;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(240,248,255,.8)';cx.lineWidth=2.5;cx.beginPath();cx.arc(0,0,s*.65,0,Math.PI*2);cx.stroke();break;
    case 'shielder':cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,s*.72,0,Math.PI*2);cx.fill();cx.save();cx.rotate(e.shieldAngle||0);cx.strokeStyle='rgba(120,190,255,0.92)';cx.lineWidth=6;cx.lineCap='round';cx.shadowColor='rgba(74,126,199,0.9)';cx.shadowBlur=10;cx.beginPath();cx.arc(0,0,s,-1.05,1.05);cx.stroke();cx.restore();break;
    case 'elite':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.6,s*.65);cx.lineTo(0,s*.25);cx.lineTo(s*.6,s*.65);cx.closePath();cx.fill();cx.fillStyle='rgba(255,50,0,.7)';cx.beginPath();cx.arc(0,0,s*.4,0,Math.PI*2);cx.fill();break;
    case 'berserker':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s*1.1);cx.lineTo(-s*.7,s*.4);cx.lineTo(0,0);cx.lineTo(s*.7,s*.4);cx.closePath();cx.fill();break;
    case 'bomber':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,s*.9,0,Math.PI*2);cx.fill();const pulseR=s*(1+Math.sin(Date.now()*.02)*.2);cx.strokeStyle='rgba(255,150,50,.6)';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,pulseR,0,Math.PI*2);cx.stroke();cx.fillStyle='rgba(255,80,0,.8)';cx.beginPath();cx.arc(0,0,s*.35,0,Math.PI*2);cx.fill();break;
    case 'necromancer':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.8,s*.5);cx.lineTo(-s*.2,s*.2);cx.lineTo(0,s*.6);cx.lineTo(s*.2,s*.2);cx.lineTo(s*.8,s*.5);cx.closePath();cx.fill();cx.strokeStyle='rgba(206,147,216,.7)';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,-s*.3,s*.25,0,Math.PI*2);cx.stroke();break;
    case 'viper':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s*1.1);cx.lineTo(-s*.35,s*.4);cx.lineTo(0,0);cx.lineTo(s*.35,s*.4);cx.closePath();cx.fill();cx.strokeStyle='rgba(174,213,129,.8)';cx.lineWidth=1;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(0,s*.8);cx.stroke();break;
    case 'tribune':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.8,s*.5);cx.lineTo(-s*.2,s*.2);cx.lineTo(0,s*.6);cx.lineTo(s*.2,s*.2);cx.lineTo(s*.8,s*.5);cx.closePath();cx.fill();break;
    case 'phantom':cx.rotate(e.ang+Math.PI/2);cx.globalAlpha*=0.7+Math.sin(Date.now()*.008)*0.3;cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.55,s*.6);cx.lineTo(0,s*.2);cx.lineTo(s*.55,s*.6);cx.closePath();cx.fill();break;
    case 'irontitan':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s,s*.5);cx.lineTo(-s*.3,s*.3);cx.lineTo(0,s*.7);cx.lineTo(s*.3,s*.3);cx.lineTo(s,s*.5);cx.closePath();cx.fill();cx.strokeStyle='rgba(200,240,255,.35)';cx.lineWidth=4;cx.stroke();break;
    case 'thunderer':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.7,s*.4);cx.lineTo(-s*.2,s*.2);cx.lineTo(s*.2,s*.2);cx.lineTo(s*.7,s*.4);cx.closePath();cx.fill();cx.fillStyle='rgba(255,240,100,.8)';cx.beginPath();cx.moveTo(0,-s*.3);cx.lineTo(-s*.15,s*.15);cx.lineTo(s*.05,s*.05);cx.lineTo(-s*.1,s*.5);cx.fill();cx.fill();break;
    case 'corruptor':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,s*.8,0,Math.PI*2);cx.fill();cx.fillStyle='rgba(240,98,146,.7)';cx.beginPath();for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2+e.wob;cx.lineTo(Math.cos(a)*s*.9,Math.sin(a)*s*.9);}cx.closePath();cx.stroke();break;
    case 'warlord':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2,r2=i%2===0?s:s*.5;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(255,200,50,.5)';cx.lineWidth=2;cx.stroke();break;
    case 'colossusg':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s,s*.5);cx.lineTo(-s*.4,s*.2);cx.lineTo(0,s*.7);cx.lineTo(s*.4,s*.2);cx.lineTo(s,s*.5);cx.closePath();cx.fill();if(e.fortified){cx.strokeStyle='rgba(100,140,240,.8)';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,s*1.1,0,Math.PI*2);cx.stroke();}break;
    case 'stormeagle':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s*1.2);cx.lineTo(-s*.9,0);cx.lineTo(-s*.2,s*.3);cx.lineTo(0,-s*.1);cx.lineTo(s*.2,s*.3);cx.lineTo(s*.9,0);cx.closePath();cx.fill();cx.strokeStyle='rgba(128,203,196,.7)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-s*.9,0);cx.lineTo(s*.9,0);cx.stroke();break;
    case 'voidwalker':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.globalAlpha*=e.visible?1:0.3;cx.beginPath();for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+e.wob*.2,r2=i%2===0?s:s*.55;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(55,71,79,.9)';cx.lineWidth=2;cx.stroke();break;
    case 'chaoslord':cx.rotate(e.wob*.05);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2,r2=i%2===0?s:s*.55;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(230,64,251,.5)';cx.lineWidth=3;cx.stroke();cx.fillStyle='rgba(230,64,251,.7)';cx.beginPath();cx.arc(0,0,s*.3,0,Math.PI*2);cx.fill();break;
    case 'herald':cx.rotate(e.wob*.05);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2,r2=i%2===0?s:s*.55;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(255,200,80,.5)';cx.lineWidth=3;cx.stroke();cx.fillStyle='rgba(255,160,0,.8)';cx.beginPath();cx.arc(0,0,s*.35,0,Math.PI*2);cx.fill();break;
    case 'caesar':cx.rotate(e.wob*.07);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2,r2=e.sz*(i%2===0?1:.55);cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(245,228,168,.4)';cx.lineWidth=2;cx.stroke();break;
    case 'titangod':
      cx.rotate(e.wob*.04);
      const tgg=cx.createRadialGradient(0,0,s*.3,0,0,s*1.8);tgg.addColorStop(0,'rgba(255,215,0,.3)');tgg.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=tgg;cx.beginPath();cx.arc(0,0,s*1.8,0,Math.PI*2);cx.fill();
      cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2,r2=i%2===0?s:s*.65;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();
      cx.strokeStyle='rgba(255,255,200,.5)';cx.lineWidth=3;cx.stroke();
      if(e.godPhase>=1){cx.strokeStyle='rgba(255,100,0,.7)';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,s*1.1,0,Math.PI*2);cx.stroke();}
      if(e.godPhase>=2){cx.strokeStyle='rgba(255,0,0,.9)';cx.lineWidth=5;cx.beginPath();cx.arc(0,0,s*1.25,0,Math.PI*2);cx.stroke();}
      cx.fillStyle='rgba(255,240,100,1)';cx.beginPath();cx.arc(0,0,s*.3,0,Math.PI*2);cx.fill();
      break;
    case 'goliath':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.9,s*.5);cx.lineTo(-s*.3,s*.3);cx.lineTo(0,s*.7);cx.lineTo(s*.3,s*.3);cx.lineTo(s*.9,s*.5);cx.closePath();cx.fill();cx.strokeStyle='rgba(255,200,150,.4)';cx.lineWidth=3;cx.stroke();break;
    case 'reaper':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+e.wob,r2=i%2===0?s:s*.5;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.fillStyle='rgba(50,50,50,.8)';cx.beginPath();cx.arc(0,0,s*.3,0,Math.PI*2);cx.fill();break;
    case 'zealot':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s*1.1);cx.lineTo(-s*.6,s*.4);cx.lineTo(0,0);cx.lineTo(s*.6,s*.4);cx.closePath();cx.fill();cx.fillStyle='rgba(255,50,100,.6)';cx.beginPath();cx.arc(0,0,s*.35,0,Math.PI*2);cx.fill();break;
    case 'inferno':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.8,s*.5);cx.lineTo(0,s*.2);cx.lineTo(s*.8,s*.5);cx.closePath();cx.fill();for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+Date.now()*.003;cx.strokeStyle='rgba(255,109,0,.7)';cx.lineWidth=2;cx.beginPath();cx.moveTo(Math.cos(a)*s*.5,Math.sin(a)*s*.5);cx.lineTo(Math.cos(a)*s*.9,Math.sin(a)*s*.9);cx.stroke();}break;
    case 'frostgiant':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s,s*.5);cx.lineTo(-s*.4,s*.2);cx.lineTo(0,s*.7);cx.lineTo(s*.4,s*.2);cx.lineTo(s,s*.5);cx.closePath();cx.fill();cx.strokeStyle='rgba(0,176,255,.6)';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,s*1.1,0,Math.PI*2);cx.stroke();break;
    case 'plaguebringer':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,s*.8,0,Math.PI*2);cx.fill();cx.fillStyle='rgba(51,105,30,.7)';for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2+e.wob;cx.beginPath();cx.arc(Math.cos(a)*s*.5,Math.sin(a)*s*.5,s*.2,0,Math.PI*2);cx.fill();}break;
    case 'voidreaver':cx.rotate(e.wob*.05);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2,r2=i%2===0?s:s*.6;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(74,20,140,.7)';cx.lineWidth=2;cx.stroke();break;
    case 'stormlord':cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2,r2=i%2===0?s:s*.6;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(255,143,0,.6)';cx.lineWidth=2;cx.stroke();break;
    case 'titanoverlord':cx.rotate(e.wob*.03);cx.fillStyle=e.col;cx.beginPath();for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2,r2=i%2===0?s:s*.7;cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}cx.closePath();cx.fill();cx.strokeStyle='rgba(183,28,28,.7)';cx.lineWidth=4;cx.stroke();cx.fillStyle='rgba(255,50,50,.5)';cx.beginPath();cx.arc(0,0,s*.4,0,Math.PI*2);cx.fill();break;
    default:cx.rotate(e.ang+Math.PI/2);cx.fillStyle=e.col;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(-s*.6,s*.65);cx.lineTo(0,s*.25);cx.lineTo(s*.6,s*.65);cx.closePath();cx.fill();
  }
  if(e.maxHp>1){cx.setTransform(1,0,0,1,e.x,e.y);const bw=e.sz*1.9,bh=3;cx.fillStyle='rgba(0,0,0,.7)';cx.fillRect(-bw/2,e.sz+5,bw,bh);const pct=e.hp/e.maxHp;cx.fillStyle=pct>.5?'#4CAF50':pct>.25?'#C8A84B':'#C0001A';cx.fillRect(-bw/2,e.sz+5,bw*pct,bh);}
  if(e.ability==='regen'){cx.setTransform(1,0,0,1,e.x,e.y);cx.strokeStyle='rgba(76,175,80,.5)';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,e.sz+8+Math.sin(Date.now()*.005)*3,0,Math.PI*2);cx.stroke();}
  cx.restore();
  if(e.ability==='poison'&&e.trail){
    e.trail.forEach((t,i)=>{cx.save();cx.globalAlpha=i/e.trail.length*.5;cx.fillStyle='rgba(174,213,129,.6)';cx.beginPath();cx.arc(t.x,t.y,4,0,Math.PI*2);cx.fill();cx.restore();});
  }
}
