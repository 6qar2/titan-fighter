function mpCheckAllDead(){
  if(gState!=='play'||MP.mpAllDeadTriggered)return;
  if(!MP.mpLocalDead)return;
  const playerCount=Object.keys(MP.players).length||0;
  const remoteCount=Object.keys(MP.remotePlayers).length||0;
  if((playerCount+remoteCount)<2)return;
  if(Object.keys(MP.remotePlayers).length===0)return;
  const allRemoteDead=Object.values(MP.remotePlayers).every(rp=>rp.alive===false);
  if(allRemoteDead){
    mpAllDead();
  }
}
function mpReviveLocal(msg){
  MP.mpLocalDead=false;MP.mpRevivedThisDeath=false;MP.mpDeathScreenShown=false;
  MP._downedKillBaseline=null;MP.mpReviveHold=0;MP._revivingAlly=false;
  lives=Math.max(1,Math.ceil(diffCfg.lives*0.5));refreshDots();
  P.invinc=3;resetJoystick();
  const si=document.getElementById('spectator-indicator');if(si)si.style.display='none';
  showPowerAnnounce('✚ '+(msg||'REVIVED BY ALLY'));
  spawnParts(P.x,P.y,'#4CAF50',24);sfxCombo();
  updateOpponentLivesHUD();
}
function mpAllDead(){
  resetJoystick();
  if(MP.mpAllDeadTriggered)return;
  MP.mpAllDeadTriggered=true;
  document.getElementById('spectator-indicator').style.display='none';
  mpShowMatchEnd(mpDetermineResult());
}
function mpShowMatchEnd(result){
  if(gState==='over')return;
  if(MP.mpEndTimer)clearTimeout(MP.mpEndTimer);
  if(MP.mpStateInterval){clearInterval(MP.mpStateInterval);MP.mpStateInterval=null;}
  MP.mpMatchResult=result;
  gState='over';clearInterval(timerID);bgStop();cancelAnimationFrame(animID);
  if(MP.roomRef){MP.roomRef.child('states').off();}
  if(MP.host&&MP.roomRef){MP.roomRef.child('matchOver').set({result:result,by:MP.playerId});}
  else if(MP.roomRef){MP.roomRef.child('mpEndSignal').set({result:result,by:MP.playerId});}
  document.getElementById('gc').classList.add('off');
  document.getElementById('hud').classList.add('off');document.getElementById('mctrl').classList.add('off');
  document.getElementById('club-hud').style.display='none';document.getElementById('pname-hud').style.display='none';
  document.getElementById('minimap').style.display='none';
  document.getElementById('spectator-indicator').style.display='none';
  ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
  document.getElementById('kills-left').style.display='none';
  updateStats();checkAchievements();
  if(MP.roomCode&&MP.playerId){mpSubmitScore(score);}
  const resultEl=document.getElementById('mp-end-result');
  const rankEl=document.getElementById('mp-end-rank');
  if(result==='win'){resultEl.textContent='VICTORY';resultEl.style.color='var(--gold-lit)';rankEl.textContent='♛ TITANS CLUB · TRIUMPH';rankEl.style.color='var(--gold-lit)';}
  else if(result==='lose'){resultEl.textContent='DEFEATED';resultEl.style.color='var(--red-hot)';rankEl.textContent='♛ TITANS CLUB · FALLEN';rankEl.style.color='var(--red-hot)';}
  else{resultEl.textContent='BATTLE ENDED';resultEl.style.color='var(--ash)';rankEl.textContent='DRAW';rankEl.style.color='var(--ash)';}
  document.getElementById('mp-end-p0-name').textContent=pName||'YOU';
  document.getElementById('mp-end-p0-wave').textContent=toRoman(wave);
  document.getElementById('mp-end-p0-kills').textContent=totalKills;
  document.getElementById('mp-end-p0-score').textContent=score.toLocaleString();
  const remote=Object.values(MP.remotePlayers)[0];
  if(remote){
    document.getElementById('mp-end-p1-name').textContent=(remote.name||'OPPONENT')+(MP.host?' (Host)':'');
    document.getElementById('mp-end-p1-wave').textContent=toRoman(remote.wave||wave);
    document.getElementById('mp-end-p1-kills').textContent=remote.kills||0;
    document.getElementById('mp-end-p1-score').textContent=(remote.score||0).toLocaleString();
  }else{
    document.getElementById('mp-end-p1-name').textContent='OPPONENT';
    document.getElementById('mp-end-p1-wave').textContent=toRoman(wave);
    document.getElementById('mp-end-p1-kills').textContent='0';
    document.getElementById('mp-end-p1-score').textContent='0';
  }
  showScr('s-mp-end');
  MP.mpEndTimer=setTimeout(()=>{
    mpResetToLobby();
  },8000);
}
function mpResetToLobby(){
  resetJoystick();
  if(MP.mpEndTimer){clearTimeout(MP.mpEndTimer);MP.mpEndTimer=null;}
  MP.mpMatchResult=null;
  gState='menu';clearInterval(timerID);bgStop();cancelAnimationFrame(animID);
  if(MP.roomRef){MP.roomRef.child('states').off();}
  if(MP.mpStateInterval){clearInterval(MP.mpStateInterval);MP.mpStateInterval=null;}
  document.getElementById('gc').classList.add('off');
  document.getElementById('hud').classList.add('off');document.getElementById('mctrl').classList.add('off');
  document.getElementById('club-hud').style.display='none';document.getElementById('pname-hud').style.display='none';
  document.getElementById('minimap').style.display='none';
  document.getElementById('spectator-indicator').style.display='none';
  ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
  document.getElementById('kills-left').style.display='none';
  if(MP.roomRef){
    MP.roomRef.child('status').set('waiting');
    MP.roomRef.child('wave').set(1);
    MP.roomRef.child('startedAt').remove();
    MP.roomRef.child('matchOver').remove();
    MP.roomRef.child('mpEndSignal').remove();
  }
  MP.started=false;MP.mpLocalDead=false;MP.mpAllDeadTriggered=false;MP.mpDeathScreenShown=false;MP.mpRevivedThisDeath=false;
  MP._lastSyncX=0;MP._lastSyncY=0;MP._lastSyncScore=0;MP._lastSyncWave=0;MP._lastSyncedWave=0;MP._lastSyncKills=0;
  MP._lastSyncAlive=0;MP._lastSyncFiring=0;MP._lastSyncReviving=0;MP._lastSyncPing=0;MP._lastSyncWaveMod=0;
  MP._lastTitanKillSent=0;MP._lastTitanKillSeen=0;
  MP._lastPingType=0;MP._lastPingTime=0;MP._lastSyncPing=0;MP._lastSyncWaveMod=0;
  MP._remoteGoneTimer=null;MP._downedKillBaseline=null;MP.mpReviveHold=0;MP._revivingAlly=false;
  showScr('s-mp-room');
  mpListenRoom();
  mpRenderPlayers();
}
function mpDetermineResult(){
  const myAlive=!MP.mpLocalDead;
  const remote=Object.values(MP.remotePlayers)[0];
  const remoteAlive=remote&&remote.alive!==false;
  if(!myAlive&&!remoteAlive)return 'draw';
  if(myAlive&&!remoteAlive)return 'win';
  if(!myAlive&&remoteAlive)return 'lose';
  const remoteScore=remote?remote.score||0:0;
  if(score>remoteScore)return 'win';
  if(score<remoteScore)return 'lose';
  return 'draw';
}
