/* ═══ FIRE HELPERS ═══ */
function fireAt(e,tx,ty,speed,r){const a=Math.atan2(ty-e.y,tx-e.x);eBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:r||5,col:e.col});}
function fireAngle(e,ang,speed,r){eBullets.push({x:e.x,y:e.y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,r:r||5,col:e.col});}

/* ═══ CRITICAL HIT SYSTEM ═══ */
function rollCrit(){return Math.random()<(window.critChance||0);}

/* ═══ ENHANCED BULLET COLLISION ═══ */
function checkBulletCollision(b,e,i){
  if(Math.hypot(b.x-e.x,b.y-e.y)<e.sz+b.r){
    if(e.ability==='reflect'&&e.visible!==false){spawnParts(b.x,b.y,'#B0BEC5',4);eBullets.push({x:b.x,y:b.y,vx:-b.vx*.8,vy:-b.vy*.8,r:b.r,col:'#B0BEC5'});stats.accuracy.hits++;return false;}
    if(e.ability==='shield'){const ba=Math.atan2(-b.vy,-b.vx);const ad=Math.abs(((ba-e.shieldAngle+Math.PI*3)%(Math.PI*2))-Math.PI);if(ad<1.05){spawnParts(b.x,b.y,'#4A7EC7',4);return false;}}
    if(e.ability==='fortify'&&e.fortified){const actualDmg=b.dmg*0.15;e.hp-=actualDmg;spawnParts(b.x,b.y,'#5C6BC0',3);return false;}
    let dmgMult=e.ability==='armored'?e.armorMod:1;
    if(waveModifier==='armored')dmgMult*=.5;
    if(e.ability==='phase'&&!e.visible){spawnParts(b.x,b.y,'#37474F',3);return false;}
    if(e.ability==='godmode'&&e.godShield&&e.hp/e.maxHp>0.66){spawnParts(b.x,b.y,'#FFD700',4);return false;}
    let finalDmg=b.dmg*dmgMult;
    if(rollCrit()){finalDmg*=2;spawnDmgNum(e.x,e.y,finalDmg,'#FFD700');stats.headshots++;}else{spawnDmgNum(e.x,e.y,finalDmg,'#E2C06A');}
    e.hp-=finalDmg;spawnParts(b.x,b.y,e.col,5);hitSparks.push({x:b.x,y:b.y,vx:(Math.random()-.5)*80,vy:(Math.random()-.5)*80-40,r:1.5+Math.random()*2,life:1,color:'#FFD700'});
    if(b.explosive){
      const toKill=[];
      for(let j=enemies.length-1;j>=0;j--){
        const other=enemies[j];
        if(other===e||deadEnemies.includes(other))continue;
        if(Math.hypot(other.x-b.x,other.y-b.y)<(b.explR||120)){
          other.hp-=finalDmg*.6;
          spawnParts(other.x,other.y,'#FF4422',4);
          if(other.hp<=0)toKill.push({enemy:other,idx:j});
        }
      }
      for(const k of toKill)killEnemy(k.enemy,k.idx);
      spawnParts(b.x,b.y,'#FF4422',12);triggerShake(6,200);
    }
    if(e.hp<=0){killEnemy(e,i);return false;}
    return false;
  }
}

/* ═══ MAGNET EFFECT ═══ */
function updateMagnet(){
  if(window.magnetRange&&ammoPacks.length>0){
    ammoPacks.forEach(pk=>{const d=Math.hypot(pk.x-P.x,pk.y-P.y);if(d<window.magnetRange){const force=(window.magnetRange-d)/window.magnetRange*8;pk.x+=(P.x-pk.x)/d*force;pk.y+=(P.y-pk.y)/d*force;}});
  }
}
