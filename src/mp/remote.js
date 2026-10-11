function mpGetEnemyTarget(enemy){
  if(MP.mpLocalDead&&MP.roomCode&&MP.playerId)return{x:cv.width/2,y:cv.height/2,name:'center',alive:false};
  return P;
}
function mpIsLocalAlive(){return!(MP.mpLocalDead&&MP.roomCode&&MP.playerId)&&!(MP2.mpLocalDead&&MP2.roomCode&&MP2.playerId);}
function drawRemotePlayers(dt){
  Object.values(MP.remotePlayers).forEach(rp=>{
    if(rp.titanKill&&rp.titanKill!==MP._lastTitanKillSeen){
      MP._lastTitanKillSeen=rp.titanKill;
      const titans=enemies.filter(x=>x.isTitan);
      for(const t of titans){
        enemies.splice(enemies.indexOf(t),1);
        spawnParts(t.x,t.y,'#C77DFF',16);
        addKillFeed('☄ SHARED TITAN SLAIN','#C77DFF');
      }
    }
    const rc=CHARS[rp.char]||CHARS[0];
    const dead=rp.alive===false;
    if(rp._rx===undefined){rp._rx=rp.x;rp._ry=rp.y;}
    const dx=rp.x-rp._rx;
    const dy=rp.y-rp._ry;
    const dist=Math.hypot(dx,dy);
    if(dist>1){
      const speed=dead?120:220;
      const step=Math.min(speed*dt,dist);
      rp._rx+=dx/dist*step;
      rp._ry+=dy/dist*step;
    }
    cx.save();
    cx.globalAlpha=dead?0.5:1;
    if(!dead){
      cx.shadowColor='rgba(76,175,80,0.9)';cx.shadowBlur=10;
      cx.strokeStyle='rgba(76,175,80,1)';cx.lineWidth=2;
      cx.beginPath();cx.arc(rp._rx,rp._ry,(rc.stats?.power||20)*0.35+4,0,Math.PI*2);cx.stroke();
      cx.shadowBlur=0;
      cx.strokeStyle='rgba(200,230,201,0.7)';cx.lineWidth=1.5;
      cx.beginPath();cx.arc(rp._rx,rp._ry,(rc.stats?.power||20)*0.35+8,0,Math.PI*2);cx.stroke();
      cx.shadowColor='rgba(76,175,80,0.7)';cx.shadowBlur=6;
    }else{
      cx.shadowColor='rgba(120,120,120,0.4)';cx.shadowBlur=4;
      cx.fillStyle='rgba(80,80,80,0.5)';
      cx.beginPath();cx.arc(rp._rx,rp._ry,(rc.stats?.power||20)*0.35+4,0,Math.PI*2);cx.fill();
    }
    const ang=Math.atan2((enemies[0]?.y||rp._ry+10)-rp._ry,(enemies[0]?.x||rp._rx+10)-rp._rx)+Math.PI/2;
    rc.draw(rp._rx,rp._ry,ang,cx);
    if(!dead&&rp.firing){
      const fx=rp._rx+Math.cos(ang-Math.PI/2)*((rc.stats?.power||20)*0.35+8);
      const fy=rp._ry+Math.sin(ang-Math.PI/2)*((rc.stats?.power||20)*0.35+8);
      cx.save();cx.globalAlpha=0.85;cx.shadowColor='#FFD54F';cx.shadowBlur=12;
      cx.fillStyle='rgba(255,213,79,0.9)';
      cx.beginPath();cx.arc(fx,fy,4+Math.random()*2,0,Math.PI*2);cx.fill();cx.restore();
    }
    cx.globalAlpha=1;cx.shadowBlur=0;
    cx.fillStyle='rgba(0,0,0,0.85)';cx.font="bold 11px 'Cinzel',serif";cx.textAlign='center';
    cx.fillText((dead?'\u{1F480} ':'')+(rp.name||'ALLY'),rp._rx,rp._ry-((rc.stats?.power||20)*0.35+12));
    if(!dead){
      cx.fillStyle='rgba(76,175,80,1)';cx.font="bold 8px 'Cinzel',serif";
      cx.fillText('ALLY',rp._rx,rp._ry+((rc.stats?.power||20)*0.35+8));
    }
    if(rp.pingT&&Date.now()-rp.pingT<2500){
      cx.globalAlpha=Math.max(0.15,1-(Date.now()-rp.pingT)/2500);
      cx.fillStyle='#E2C06A';cx.font="bold 14px 'Cinzel',serif";
      cx.fillText(MP_PING_TXT[rp.ping]||'!',rp._rx,rp._ry-((rc.stats?.power||20)*0.35+26));cx.globalAlpha=1;
    }
    cx.restore();
  });
}
function mpSpawnAllyBullets(dt){
  if(!MP.roomCode||!MP.playerId||gState!=='play')return;
  Object.values(MP.remotePlayers).forEach(rp=>{
    if(rp.alive===false||!rp.firing)return;
    rp._ghostT=(rp._ghostT||0)+dt;
    if(rp._ghostT<0.25)return;
    rp._ghostT=0;
    const rx=(rp._rx!==undefined?rp._rx:rp.x),ry=(rp._ry!==undefined?rp._ry:rp.y);
    let nearest=null,nd=1e9;
    for(const e of enemies){const d=Math.hypot(e.x-rx,e.y-ry);if(d<nd){nd=d;nearest=e;}}
    if(!nearest)return;
    const ang=Math.atan2(nearest.y-ry,nearest.x-rx),spd=600;
    bullets.push({x:rx,y:ry,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:5,dmg:5,color:'rgba(120,200,255,0.9)',pierce:false,hit:false,weaponId:'ally'});
    bulletTrails.push({x:rx,y:ry,age:0,maxAge:.1,color:'rgba(120,200,255,0.7)',vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd});
  });
}
