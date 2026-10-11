function mpUpdateRevive(dt){
  if(!MP.roomCode||!MP.playerId||gState!=='play')return;
  const remote=Object.values(MP.remotePlayers)[0];
  const REVIVE_TIME=2.0,REVIVE_KILLS=18,REVIVE_RADIUS=72;
  if(MP.mpLocalDead){
    if(remote&&remote.alive===false){
      mpCheckAllDead();
      const si=document.getElementById('spectator-indicator');
      if(si)si.style.display='none';
      return;
    }
    const si=document.getElementById('spectator-indicator');
    if(si)si.style.display='block';
    const rf=document.querySelector('#spectator-indicator .spc-revive');
    const rp=document.querySelector('#spectator-indicator .spc-revive-fill');
    if(remote&&remote.reviving){
      MP.mpReviveHold=Math.min(REVIVE_TIME, (MP.mpReviveHold||0)+dt);
      if(rf)rf.style.display='block';
      if(rp)rp.style.width=Math.min(100,(MP.mpReviveHold/REVIVE_TIME)*100)+'%';
      if(MP.mpReviveHold>=REVIVE_TIME){mpReviveLocal('REVIVED BY ALLY');return;}
    }else{
      MP.mpReviveHold=0;
      if(rf)rf.style.display='none';
    }
    if(remote){
      if(MP._downedKillBaseline===null)MP._downedKillBaseline=remote.kills||0;
      if((remote.kills||0)-MP._downedKillBaseline>=REVIVE_KILLS){mpReviveLocal('ALLY MILESTONE');return;}
    }
  }else{
    if(remote&&remote.alive===false){
      const rx=(remote._rx!==undefined?remote._rx:remote.x),ry=(remote._ry!==undefined?remote._ry:remote.y);
      const d=Math.hypot(P.x-rx,P.y-ry);
      MP._revivingAlly=d<REVIVE_RADIUS;
      if(MP._revivingAlly){
        MP.mpReviveHold=Math.min(REVIVE_TIME, (MP.mpReviveHold||0)+dt);
      }else{
        MP.mpReviveHold=0;
      }
    }else{
      MP._revivingAlly=false;MP.mpReviveHold=0;
    }
  }
}
