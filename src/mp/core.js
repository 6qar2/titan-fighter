/* ═══ MULTIPLAYER SYSTEM ═══ */
const MP={
  roomRef:null,
  roomCode:null,
  playerId:null,
  players:{},
  host:false,
  started:false,
  mySlot:null,
  roomDiff:'normal',
  mpChar:selChar,
  lbRef:null,
  lbMode:'sp',
  remotePlayers:{},
  mpPosSyncTimer:0,
  mpLocalDead:false,
  mpRevivedThisDeath:false,
  _remoteGoneTimer:null,
  mpAliveCount:0,
  mpAllDeadTriggered:false,
  mpDeathScreenShown:false,
  mpStateInterval:null,
  _lastSyncX:0,
  _lastSyncY:0,
  _lastSyncScore:0,
  _lastSyncWave:0,
  _lastSyncKills:0,
  _lastSyncedWave:0,
  mpMatchResult:null,
  mpEndTimer:null
};
function mpGenerateCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';for(let i=0;i<4;i++)code+=chars[Math.floor(Math.random()*chars.length)];return code;}
function mpCreateRoom(){
  if(!db){alert('Firebase is not initialized yet. Please wait a moment and try again, or check your Firebase config and Realtime Database setup.');return;}
  const rawName=document.getElementById('pname').value.trim();
  const cleanName=rawName.replace(/[<>]/g,'');
  if(!cleanName){alert('Enter your name before creating a room');return;}
  pName=cleanName.toUpperCase();
  const playerId='p_'+Math.random().toString(36).slice(2,9);
  const code=mpGenerateCode();
  const roomRef=db.ref('rooms/'+code);
  roomRef.once('value').then(snap=>{
    const existing=snap.val();
    if(existing&&existing.status!=='ended'){alert('Room code collision. Please try again.');return;}
    const roomData={
      code:code,
      host:playerId,
      status:'waiting',
      diff:selDiff,
      wave:1,
      players:{
        [playerId]:{name:pName,slot:0,ready:true,char:MP.mpChar,diff:selDiff,score:0}
      },
      createdAt:firebase.database.ServerValue.TIMESTAMP
    };
    return roomRef.set(roomData).then(()=>{
      MP.playerId=playerId;
      MP.roomCode=code;
      MP.host=true;
      MP.mySlot=0;
      MP.roomRef=roomRef;
      MP.roomRef.child('players/'+playerId).onDisconnect().remove();
      MP.roomRef.child('states/'+playerId).onDisconnect().remove();
      showScr('s-mp-room');
      document.getElementById('mp-room-code').textContent=code;
      mpBuildCharGrid();
      mpListenRoom();
    });
  }).catch(e=>{console.error('create room error',e);alert('Failed to create room');});
}
function mpJoinRoom(){
  if(!db){alert('Firebase is not initialized yet. Please wait a moment and try again, or check your Firebase config and Realtime Database setup.');return;}
  const rawCode=document.getElementById('room-code-input').value.trim();
  const code=rawCode.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  if(code.length!==4){alert('Please enter a valid 4-character room code');return;}
  const rawName=document.getElementById('pname').value.trim();
  const cleanName=rawName.replace(/[<>]/g,'');
  if(!cleanName){alert('Enter your name before joining a room');return;}
  pName=cleanName.toUpperCase();
  const playerId='p_'+Math.random().toString(36).slice(2,9);
  const roomRef=db.ref('rooms/'+code);
  roomRef.once('value').then(snap=>{
    const room=snap.val();
    if(!room){alert('Room not found');return;}
    if(room.status!=='waiting'&&room.status!=='playing'){alert('Room is not available');return;}
    const slots=[0,1];
    const taken=new Set(Object.values(room.players||{}).map(p=>p.slot));
    const mySlot=slots.find(s=>!taken.has(s));
    if(mySlot===undefined){alert('Room is full (2/2)');return;}
    MP.playerId=playerId;
    MP.roomCode=code;
    MP.host=false;
    MP.roomRef=roomRef;
    MP.mySlot=mySlot;
    return MP.roomRef.child('players/'+MP.playerId).set({
      name:pName,
      slot:mySlot,
      ready:false,
      char:MP.mpChar,
      diff:selDiff,
      score:0
    }).then(()=>{
      MP.roomRef.child('players/'+MP.playerId).onDisconnect().remove();
      MP.roomRef.child('states/'+MP.playerId).onDisconnect().remove();
    });
  }).then(()=>{
    showScr('s-mp-room');
    document.getElementById('mp-room-code').textContent=code;
    mpBuildCharGrid();
    mpListenRoom();
    if(MP.roomRef){
      MP.roomRef.once('value').then(snap=>{
        const room=snap.val();
        if(room&&room.status==='playing'&&room.wave){
          mpStartGame();
          wave=room.wave||1;
          waveKills=0;enemies.length=0;
          lives=Math.max(1,Math.ceil(diffCfg.lives/2));
          score=(wave-1)*350;totalKills=Math.floor((wave-1)*4);
          showWaveAnnounce(wave);
          document.getElementById('hwave').textContent=toRoman(wave);
          bgTransition(wave);
        }
      });
    }
  }).catch(e=>{console.error('join room error',e);alert('Failed to join room');});
}
function mpListenRoom(){
  if(!MP.roomRef)return;
  MP.roomRef.off();
  MP.roomRef.on('value',snap=>{
    const room=snap.val();
    if(!room){showScr('s-mp-lobby');return;}
    MP.players=room.players||{};
    MP.roomDiff=room.diff||'normal';
    mpRenderPlayers();
    const count=Object.keys(MP.players).length;
    const allReady=count>=2&&Object.values(MP.players).every(p=>p.ready);
    document.getElementById('mp-status').textContent=count>=2?(allReady?'Ready to start!':'Waiting for ready...'):'Waiting for players...';
    const startBtn=document.getElementById('btn-start-mp');
    const myEntry=MP.players[MP.playerId];
    if(myEntry){
      startBtn.textContent=MP.host?(allReady?'START BATTLE':'Waiting...'):(myEntry.ready?'READY ✓':'READY');
      startBtn.disabled=MP.host?!allReady:false;
    }else{
      startBtn.textContent='START BATTLE';
      startBtn.disabled=true;
    }
    const diffWrap=document.getElementById('mp-diff-wrap');
    if(diffWrap){
      diffWrap.style.display=MP.host?'block':'none';
      if(MP.host){
        diffWrap.querySelectorAll('.mp-diff-card').forEach(card=>{
          card.classList.toggle('selected',card.dataset.diff===MP.roomDiff);
        });
      }
    }
    if(room.matchOver&&gState==='play'){mpShowMatchEnd(room.matchOver.result||mpDetermineResult());return;}
    if(room.mpEndSignal&&gState==='play'&&MP.host){mpShowMatchEnd(room.mpEndSignal.result||mpDetermineResult());return;}
    if(room.status==='playing'){mpStartGame();}
    if(room.status==='ended'){if(gState==='play'){mpResetToLobby();}else if(!MP.mpAllDeadTriggered){showScr('s-mp-room');mpRenderPlayers();}}
    if(room.wave&&room.wave!==wave&&gState==='play'){
      mpResyncWave(room.wave);
    }
    if(MP.mySlot!==null&&MP.players[MP.playerId]&&MP.players[MP.playerId].char!==undefined){
      MP.mpChar=MP.players[MP.playerId].char;
      document.querySelectorAll('#mp-char-grid .mp-char-card').forEach(c=>{
        c.classList.toggle('selected',parseInt(c.dataset.idx)===MP.mpChar);
      });
    }
  });
}
function mpSyncRoomWave(){
  if(!MP.host||!MP.roomRef||gState!=='play')return;
  if(MP._lastSyncedWave!==wave){
    MP._lastSyncedWave=wave;
    MP.roomRef.child('wave').set(wave);
  }
}
function mpDiffChange(diff){
  if(!MP.host||!MP.roomRef)return;
  MP.roomDiff=diff;
  MP.roomRef.child('diff').set(diff);
  document.querySelectorAll('.mp-diff-card').forEach(card=>{
    card.classList.toggle('selected',card.dataset.diff===diff);
  });
}
function mpBuildCharGrid(){
  const grid=document.getElementById('mp-char-grid');
  if(!grid)return;
  grid.innerHTML='';
  CHARS.forEach((c,i)=>{
    const card=document.createElement('div');card.className='mp-char-card'+(i===MP.mpChar?' selected':'');card.dataset.idx=i;
    const mc=document.createElement('canvas');mc.width=64;mc.height=80;
    const mctx=mc.getContext('2d');mctx.clearRect(0,0,64,80);
    c.draw(32,40,-Math.PI/2,mctx);
    card.appendChild(mc);
    card.addEventListener('click',()=>{mpSelectChar(i);});
    grid.appendChild(card);
  });
}
function mpSelectChar(idx){
  if(!MP.roomRef||!MP.playerId)return;
  MP.mpChar=idx;
  document.querySelectorAll('#mp-char-grid .mp-char-card').forEach(c=>c.classList.toggle('selected',parseInt(c.dataset.idx)===idx));
  MP.roomRef.child('players/'+MP.playerId+'/char').set(idx);
}
function mpRenderPlayers(){
  for(let i=0;i<2;i++){
    const el=document.getElementById('mp-p'+i);
    const entry=Object.values(MP.players).find(p=>p.slot===i);
    if(entry){
      el.classList.add('ready');
      el.querySelector('span').textContent=entry.name+(i===0?' (Host)':'');
    }else{
      el.classList.remove('ready');
      el.querySelector('span').textContent='Waiting...';
    }
  }
}
function mpSetReady(){
  if(!MP.roomRef||!MP.playerId)return;
  MP.roomRef.child('players/'+MP.playerId+'/ready').set(true).then(()=>{
    if(MP.host){
      const players=MP.roomRef.child('players');
      players.once('value').then(snap=>{
        const all=snap.val()||{};
        const count=Object.keys(all).length;
        const allReady=count>=2&&Object.values(all).every(p=>p.ready);
        if(allReady){
          MP.roomRef.child('status').set('playing');
          MP.roomRef.child('wave').set(1);
          MP.roomRef.child('startedAt').set(firebase.database.ServerValue.TIMESTAMP);
        }
      });
    }
  });
}
function mpStartGame(){
  if(MP.started)return;
  MP.started=true;
  selChar=MP.mpChar;
  selDiff=MP.roomDiff||'normal';
  resetJoystick();
  showScr(null);
  document.getElementById('gc').classList.remove('off');
  document.getElementById('hud').classList.remove('off');
  if('ontouchstart' in window||window.innerWidth<=900)document.getElementById('mctrl').classList.remove('off');
  gState='play';menuAnimActive=false;initGame();lastTS=performance.now();showWaveAnnounce(1);sfxStartGame();animID=requestAnimationFrame(loop);
  mpListenStates();
  if(MP.roomRef&&MP.playerId){
    MP.roomRef.child('matchOver').remove();
    MP.roomRef.child('mpEndSignal').remove();
    MP.roomRef.child('states/'+MP.playerId).onDisconnect().remove();
  }
  MP._lastSyncX=0;MP._lastSyncY=0;MP._lastSyncScore=0;MP._lastSyncWave=0;MP._lastSyncedWave=0;MP._lastSyncKills=0;
  MP._lastSyncAlive=0;MP._lastSyncFiring=0;MP._lastSyncReviving=0;MP._lastSyncPing=0;MP._lastSyncWaveMod=0;MP._lastSyncLives=0;
  MP._lastSyncScore=0;MP._lastSyncKills=0;MP._lastSyncReviving=0;
  MP._lastTitanKillSent=0;MP._lastTitanKillSeen=0;
  MP._lastPingType=0;MP._lastPingTime=0;MP._lastSyncPing=0;MP._lastSyncWaveMod=0;
  MP._remoteGoneTimer=null;MP._downedKillBaseline=null;MP.mpReviveHold=0;MP._revivingAlly=false;
  MP.mpPosSyncTimer=0;MP.mpEndTimer=null;MP.mpStateInterval=null;MP.mpMatchResult=null;
  MP.mpAllDeadTriggered=false;MP.mpDeathScreenShown=false;MP.mpRevivedThisDeath=false;
  MP._lastTitanKillSent=0;MP._lastTitanKillSeen=0;
  MP._lastPingType=0;MP._lastPingTime=0;MP._lastSyncPing=0;MP._lastSyncWaveMod=0;
  MP._lastSyncFiring=0;MP._lastSyncReviving=0;MP._lastSyncPing=0;MP._lastSyncWaveMod=0;
}
function mpLeaveRoom(){
  resetJoystick();
  if(MP.roomRef&&MP.playerId){
    MP.roomRef.child('players/'+MP.playerId).remove();
    MP.roomRef.child('states/'+MP.playerId).remove();
    if(MP.host){
      MP.roomRef.remove();
    }
  }
  if(MP.roomRef){MP.roomRef.child('states').off();}
  mpStopLeaderboard();
  if(MP.mpStateInterval){clearInterval(MP.mpStateInterval);MP.mpStateInterval=null;}
  if(MP.mpEndTimer){clearTimeout(MP.mpEndTimer);MP.mpEndTimer=null;}
  gState='menu';clearInterval(timerID);bgStop();cancelAnimationFrame(animID);
  document.getElementById('gc').classList.add('off');
  document.getElementById('hud').classList.add('off');document.getElementById('mctrl').classList.add('off');
  document.getElementById('club-hud').style.display='none';document.getElementById('pname-hud').style.display='none';
  document.getElementById('minimap').style.display='none';
  document.getElementById('spectator-indicator').style.display='none';
  ['wave-announce','low-ammo-warn','enemy-warn','gate-prompt','power-announce'].forEach(id=>{const el2=document.getElementById(id);el2.style.opacity='0';el2.classList.remove('visible');});
  document.getElementById('kills-left').style.display='none';
  MP.roomRef=null;MP.roomCode=null;MP.players={};MP.host=false;MP.started=false;MP.mySlot=null;MP.remotePlayers={};MP.mpPosSyncTimer=0;MP.mpLocalDead=false;MP.mpAllDeadTriggered=false;MP.mpDeathScreenShown=false;MP.mpRevivedThisDeath=false;MP._lastSyncX=0;MP._lastSyncY=0;MP._lastSyncScore=0;MP._lastSyncWave=0;MP._lastSyncedWave=0;MP._lastSyncKills=0;
}
