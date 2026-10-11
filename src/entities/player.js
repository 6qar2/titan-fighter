/* ═══ ENHANCED WEAPON FIRE LOGIC ═══ */
function fireBullet(){
  if(ammo<=0){const now=Date.now();if(now-lastEmptyClick>350){sfxEmpty();lastEmptyClick=now;}return;}
  let wp={...WEAPONS[curWeapon]};
  const ch=CHARS[selChar];
  const ang=Math.atan2(myP-P.y,mxP-P.x),spd=wp.spd;
  let dmg=wp.dmg*(ch.dmg||1);
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='battlecry')dmg*=gameState2.powerBuff.dmgMult;
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='bloodlust')dmg*=gameState2.powerBuff.dmgMult;
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='deadeye'){dmg*=gameState2.powerBuff.dmgMult;wp.pierce=true;}
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='smoke')dmg*=gameState2.powerBuff.nextShotMult||1;
  const count=window.doubleShot?wp.count*2:wp.count;
  const spread=wp.spread;
  for(let i=0;i<count;i++){
    const a=ang+(i-Math.floor(count/2))*spread;
    let bdmg=dmg;
    if(window.critChance&&Math.random()<window.critChance){bdmg=Math.round(dmg*2);spawnPop(P.x,P.y,'CRIT!','#FFD700');sfxCombo();}
    const b={x:P.x,y:P.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:wp.r,dmg:bdmg,color:wp.color,pierce:wp.pierce||false,weaponId:wp.id,hit:false};
    if(wp.explosive)b.explosive=true;b.explR=wp.explR||120;
    bullets.push(b);
    bulletTrails.push({x:P.x,y:P.y,age:0,maxAge:.12,color:wp.color,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd});
    stats.accuracy.shots++;
  }
  ammo=Math.max(0,ammo-wp.ammoCost);
  sfxShoot();
  for(let i=0;i<(wp.id==='rocket'?8:wp.id==='shotgun'?4:2);i++){
    spawnParts(P.x,P.y,wp.color,.8);
  }
  muzzleFlashes.push({x:P.x,y:P.y,ang,life:.08,maxLife:.08,color:wp.color,size:wp.id==='rocket'?18:wp.id==='shotgun'?14:8});
  updateAmmoHUD();
}

/* ═══ DAMAGE ═══ */
function takeDmg(amount){
  amount=amount||1;
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='shield'){
    gameState2.powerBuff.hits-=amount;spawnParts(P.x,P.y,'#82B1FF',8);
    if(gameState2.powerBuff.hits<=0)gameState2.powerBuff=null;
    return;
  }
  if(P.invinc>0)return;
  if(window.shieldHits&&window.shieldHits>0){window.shieldHits--;spawnParts(P.x,P.y,'#00E5FF',8);return;}
  let dmgMult=1;
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='bloodlust')dmgMult=gameState2.powerBuff.dmgTakenMult||1;
  if(gameState2.powerBuff&&gameState2.powerBuff.type==='impenetrable')return;
  lives-=Math.ceil(amount*dmgMult);sfxDamage();const fl=document.getElementById('flash');fl.classList.add('damage');fl.style.opacity='1';setTimeout(()=>{fl.classList.remove('damage');fl.style.opacity='0';},250);document.body.style.animation='shake .32s ease';setTimeout(()=>document.body.style.animation='',320);P.invinc=2.5;refreshDots();spawnParts(P.x,P.y,'#C0001A',10);haptic('heavy');if(lives<=0){endGame();}
}
