function mpSyncRoomWave(){
  if(!MP.host||!MP.roomRef||gState!=='play')return;
  if(MP._lastSyncedWave!==wave){
    MP._lastSyncedWave=wave;
    MP.roomRef.child('wave').set(wave);
  }
}
function mpSyncState(dt){
  if(!MP.roomRef||!MP.playerId||gState!=='play')return;
  mpCheckAllDead();
  MP.mpPosSyncTimer=(MP.mpPosSyncTimer||0)+dt;
  const lastX=MP._lastSyncX||0,lastY=MP._lastSyncY||0;
  const aliveNow=!MP.mpLocalDead;
  const firingNow=(shooting&&aliveNow)?1:0;
  const revivingNow=(MP._revivingAlly&&aliveNow)?1:0;
  const pingTypeNow=MP._lastPingType||0;
  const waveModNow=waveModifier||'';
  const changed=Math.hypot(P.x-lastX,P.y-lastY)>=6||score!==MP._lastSyncScore||wave!==MP._lastSyncWave||aliveNow!==MP._lastSyncAlive||lives!==MP._lastSyncLives||firingNow!==MP._lastSyncFiring||revivingNow!==MP._lastSyncReviving||pingTypeNow!==MP._lastSyncPing||waveModNow!==MP._lastSyncWaveMod;
  const sendInterval=changed?0.2:1;
  if(MP.mpPosSyncTimer<sendInterval)return;
  MP.mpPosSyncTimer=0;
  MP._lastSyncX=P.x;MP._lastSyncY=P.y;MP._lastSyncScore=score;MP._lastSyncWave=wave;MP._lastSyncAlive=aliveNow;MP._lastSyncLives=lives;MP._lastSyncFiring=firingNow;MP._lastSyncReviving=revivingNow;MP._lastSyncPing=pingTypeNow;MP._lastSyncWaveMod=waveModNow;
  MP.roomRef.child('states/'+MP.playerId).update({
    x:P.x,y:P.y,
    alive:aliveNow,
    firing:firingNow,
    reviving:revivingNow,
    ping:pingTypeNow,
    pingT:MP._lastPingTime||0,
    titanKill:MP._lastTitanKillSent||0,
    lives:lives,
    score:score,
    wave:wave,
    waveMod:waveModNow,
    kills:totalKills,
    ts:Date.now()
  });
}
function mpListenStates(){
  if(!MP.roomRef)return;
  MP.roomRef.child('states').off();
  const statesRef=MP.roomRef.child('states');
  statesRef.on('child_added',snap=>{
    const pid=snap.key;if(pid===MP.playerId)return;
    const s=snap.val();
    if(!s)return;
    s._seen=s.ts||Date.now();
    if(!s._rx)s._rx=s.x;if(!s._ry)s._ry=s.y;
    MP.remotePlayers[pid]=s;
    if(MP._remoteGoneTimer){clearTimeout(MP._remoteGoneTimer);MP._remoteGoneTimer=null;}
    mpCheckAllDead();
  });
  statesRef.on('child_changed',snap=>{
    const pid=snap.key;if(pid===MP.playerId)return;
    const s=snap.val();
    if(!s)return;
    s._seen=s.ts||Date.now();
    const prev=MP.remotePlayers[pid];
    if(prev){s._rx=prev._rx;s._ry=prev._ry;}
    else{if(!s._rx)s._rx=s.x;if(!s._ry)s._ry=s.y;}
    MP.remotePlayers[pid]=s;
    if(MP._remoteGoneTimer){clearTimeout(MP._remoteGoneTimer);MP._remoteGoneTimer=null;}
    mpCheckAllDead();
  });
  statesRef.on('child_removed',snap=>{
    const pid=snap.key;if(pid===MP.playerId)return;
    const prev=MP.remotePlayers[pid];
    delete MP.remotePlayers[pid];
    if(gState==='play'&&!MP.mpAllDeadTriggered){
      if(MP._remoteGoneTimer){clearTimeout(MP._remoteGoneTimer);MP._remoteGoneTimer=null;}
      if(!MP.mpLocalDead){
        MP._remoteGoneTimer=setTimeout(()=>{
          MP._remoteGoneTimer=null;
          if(gState==='play'&&!MP.mpAllDeadTriggered){
            mpShowMatchEnd('win');
          }
        },4000);
      }else{
        if(prev&&prev.alive===false){
          mpShowMatchEnd('draw');
        }else{
          mpShowMatchEnd('lose');
        }
      }
    }
  });
  MP.mpStateInterval=setInterval(()=>{
    if(gState!=='play'||MP.mpAllDeadTriggered)return;
    mpCheckAllDead();
  },1000);
}
function mpSendPing(type){
  if(!MP.roomCode||!MP.playerId||gState!=='play')return;
  MP._lastPingType=type;MP._lastPingTime=Date.now();
  spawnPop(P.x,P.y-34,MP_PING_TXT[type]||'!','power');
  if(MP.roomRef)MP.roomRef.child('states/'+MP.playerId).update({ping:type,pingT:MP._lastPingTime,ts:Date.now()});
}
function mpNotifyTitanKill(){
  if(!MP.roomRef||!MP.playerId)return;
  MP._lastTitanKillSent=Date.now();
  MP.roomRef.child('states/'+MP.playerId).update({titanKill:MP._lastTitanKillSent,ts:Date.now()});
}
