/* ═══ NEW MULTIPLAYER SYSTEM ═══ */
const MP2={
  roomRef:null,
  roomCode:null,
  playerId:null,
  players:{},
  host:false,
  started:false,
  mode:'coop',
  diff:'normal',
  mySlot:null,
  remotePlayers:{},
  mpLocalDead:false,
  mpRevivedThisDeath:false,
  mpAliveCount:0,
  mpAllDeadTriggered:false,
  mpDeathScreenShown:false,
  mpMatchResult:null,
  mpEndTimer:null,
  _lastSyncX:0,
  _lastSyncY:0,
  _lastSyncScore:0,
  _lastSyncWave:0,
  _lastSyncKills:0,
  _lastSyncedWave:0,
  _remoteGoneTimer:null,
  mpStateInterval:null,
  _pvpDuelActive:false,
  _pvpKills:0,
  _pvpDeaths:0,
  mpPosSyncTimer:0,
  mpRemoteSyncTimer:0
};

function mp2GenerateCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';for(let i=0;i<4;i++)code+=chars[Math.floor(Math.random()*chars.length)];return code;}

function mp2CreateRoom(mode,diff){
  if(!db){alert('Firebase is not initialized. Please wait and try again.');return;}
  const name=Profile.getName();
  pName=name;
  const playerId='p_'+Math.random().toString(36).slice(2,9);
  const code=mp2GenerateCode();
  const roomRef=db.ref('rooms/'+code);
  roomRef.once('value').then(snap=>{
    const existing=snap.val();
    if(existing&&existing.status!=='ended'){alert('Room code collision. Try again.');return;}
    const roomData={
      code:code,
      host:playerId,
      status:'waiting',
      mode:mode,
      diff:diff,
      wave:1,
      players:{
        [playerId]:{name:name,slot:0,ready:true,char:selChar,score:0,alive:true}
      },
      createdAt:firebase.database.ServerValue.TIMESTAMP
    };
    return roomRef.set(roomData).then(()=>{
      MP2.players[playerId]={name:name,slot:0,ready:true,char:selChar,score:0,alive:true};
      MP2.playerId=playerId;
      MP2.roomCode=code;
      MP2.host=true;
      MP2.mySlot=0;
      MP2.mode=mode;
      MP2.diff=diff;
      MP2.roomRef=roomRef;
      MP2.roomRef.child('players/'+playerId).onDisconnect().remove();
      MP2.roomRef.child('states/'+playerId).onDisconnect().remove();
      showScr('s-mp2-room');
      document.getElementById('mp2-room-code').textContent=code;
      mp2ListenRoom();
    });
  }).catch(e=>{console.error('create room error',e);alert('Failed to create room');});
}

function mp2JoinRoom(code,mode,diff){
  if(!db){alert('Firebase is not initialized. Please wait and try again.');return;}
  const cleanCode=code.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  if(cleanCode.length!==4){alert('Enter a valid 4-character room code');return;}
  const name=Profile.getName();
  pName=name;
  const playerId='p_'+Math.random().toString(36).slice(2,9);
  const roomRef=db.ref('rooms/'+cleanCode);
  roomRef.once('value').then(snap=>{
    const room=snap.val();
    if(!room){alert('Room not found');return;}
    if(room.status!=='waiting'&&room.status!=='playing'){alert('Room not available');return;}
    const slots=[0,1,2,3];
    const taken=new Set(Object.values(room.players||{}).map(p=>p.slot));
    const mySlot=slots.find(s=>!taken.has(s));
    if(mySlot===undefined){alert('Room is full (4/4)');return;}
    MP2.playerId=playerId;
    MP2.roomCode=cleanCode;
    MP2.host=false;
    MP2.mySlot=mySlot;
    MP2.mode=room.mode||mode;
    MP2.diff=room.diff||diff;
    MP2.roomRef=roomRef;
    return MP2.roomRef.child('players/'+MP2.playerId).set({
      name:name,
      slot:mySlot,
      ready:false,
      char:selChar,
      score:0,
      alive:true
    }).then(()=>{
      MP2.players[MP2.playerId]={name:name,slot:mySlot,ready:false,char:selChar,score:0,alive:true};
      MP2.roomRef.child('players/'+MP2.playerId).onDisconnect().remove();
      showScr('s-mp2-room');
      mp2ListenRoom();
    });
  }).catch(e=>{console.error('join room error',e);alert('Failed to join room');});
}

function mp2ListenRoom(){
  if(!MP2.roomRef)return;
  MP2.roomRef.on('value',snap=>{
    const room=snap.val();
    if(!room){return;}
    MP2.players=room.players||{};
    MP2.mode=room.mode||MP2.mode||'coop';
    MP2.diff=room.diff||MP2.diff||'normal';
    const modeSelect=document.getElementById('mp2-mode-select');
    if(modeSelect){
      modeSelect.value=MP2.mode;
      modeSelect.disabled=!MP2.host;
    }
    document.querySelectorAll('#s-mp2-room .mp-diff-card').forEach(c=>{
      c.classList.toggle('selected',c.dataset.diff===MP2.diff);
      c.style.pointerEvents=MP2.host?'auto':'none';
      c.style.opacity=MP2.host?1:'.6';
    });
    const readyCount=Object.values(MP2.players).filter(p=>p.ready).length;
    const totalCount=Object.keys(MP2.players).length;
    const startBtn=document.getElementById('btn-mp2-start');
    if(startBtn){
      startBtn.disabled=!(MP2.host&&readyCount>=1);
      startBtn.textContent=MP2.host?(readyCount>=1?'START BATTLE':'WAITING FOR PLAYER'):'WAITING FOR HOST';
    }
    const readyBtn=document.getElementById('btn-mp2-ready');
    if(readyBtn){
      const myReady=MP2.players[MP2.playerId]?.ready;
      readyBtn.textContent=myReady?'✓ READY':'SET READY';
      readyBtn.style.borderColor=myReady?'rgba(76,175,80,.6)':'rgba(184,152,64,.3)';
      readyBtn.style.display=MP2.host?'none':'block';
    }
    const statusEl=document.getElementById('mp2-status');
    if(statusEl)statusEl.textContent=totalCount>=1?`${totalCount} player${totalCount>1?'s':''} in room`:'Waiting for players...';
    const slots=['mp2-p0','mp2-p1','mp2-p2','mp2-p3'];
    slots.forEach((id,i)=>{
      const el=document.getElementById(id);
      if(!el)return;
      const p=Object.values(MP2.players).find(p=>p.slot===i);
      const span=el.querySelector('span');
      if(span){
        span.textContent=p?p.name:(i===0?'Player 1':'Waiting...');
        el.classList.toggle('ready',!!p?.ready);
      }
    });
    if(room.status==='playing'&&!MP2.started){
      MP2.started=true;
      startMP2Game();
    }
  });
}

function mp2SetReady(){
  if(!MP2.roomRef)return;
  const currentReady=MP2.players[MP2.playerId]?.ready;
  const ready=!currentReady;
  MP2.roomRef.child('players/'+MP2.playerId).update({ready:ready,char:selChar});
  const readyBtn=document.getElementById('btn-mp2-ready');
  if(readyBtn){
    readyBtn.textContent=ready?'✓ READY':'SET READY';
    readyBtn.style.borderColor=ready?'rgba(76,175,80,.6)':'rgba(184,152,64,.3)';
  }
  if(MP2.host&&ready){
    const allReady=Object.values(MP2.players).every(p=>p.ready);
    if(allReady&&Object.keys(MP2.players).length>=1){
      MP2.roomRef.update({status:'playing'});
    }
  }
}

function mp2DiffChange(diff){
  if(!MP2.roomRef||!MP2.host)return;
  MP2.diff=diff;
  MP2.roomRef.child('diff').set(diff);
  document.querySelectorAll('#s-mp2-room .mp-diff-card').forEach(c=>{
    c.classList.toggle('selected',c.dataset.diff===diff);
  });
}

function mp2StartGame(){
  if(!MP2.roomRef)return;
  MP2.roomRef.update({status:'playing',startedAt:firebase.database.ServerValue.TIMESTAMP});
  startMP2Game();
}

function startMP2Game(){
  if(MP2.started)return;
  MP2.started=true;
  GameModes.current='campaign';
  showScr(null);
  document.getElementById('hud').classList.remove('off');
  if('ontouchstart' in window||window.innerWidth<=900)document.getElementById('mctrl').classList.remove('off');
  gState='play';
  initGame();
  lastTS=performance.now();
  showWaveAnnounce(1);
  sfxStartGame();
  animID=requestAnimationFrame(loop);
  MP2.mpAliveCount=Object.keys(MP2.players).length;
  MP2.mpLocalDead=false;
  MP2.mpAllDeadTriggered=false;
  MP2.mpDeathScreenShown=false;
  MP2.mpRevivedThisDeath=false;
  MP2._pvpDuelActive=(MP2.mode==='pvp');
  MP2._pvpKills=0;
  MP2._pvpDeaths=0;
  if(MP2.mode==='pvp'){
    Object.keys(MP2.players).forEach(pid=>{
      if(pid!==MP2.playerId){
        MP2.remotePlayers[pid]={x:cv.width/2,y:cv.height/2,alive:true,score:0,wave:1,kills:0,name:MP2.players[pid].name};
      }
    });
  }
}

function mp2LeaveRoom(){
  if(MP2.roomRef){
    MP2.roomRef.off();
    if(MP2.playerId){
      MP2.roomRef.child('players/'+MP2.playerId).onDisconnect().cancel();
      MP2.roomRef.child('players/'+MP2.playerId).remove();
    }
  }
  mp2Reset();
  showScr('s-mp2-lobby');
}

function mp2Reset(){
  MP2.roomRef=null;
  MP2.roomCode=null;
  MP2.playerId=null;
  MP2.players={};
  MP2.host=false;
  MP2.started=false;
  MP2.mySlot=null;
  MP2.remotePlayers={};
  MP2.mpLocalDead=false;
  MP2.mpRevivedThisDeath=false;
  MP2.mpAliveCount=0;
  MP2.mpAllDeadTriggered=false;
  MP2.mpDeathScreenShown=false;
  MP2.mpMatchResult=null;
  MP2.mpEndTimer=null;
  MP2._lastSyncX=0;
  MP2._lastSyncY=0;
  MP2._lastSyncScore=0;
  MP2._lastSyncWave=0;
  MP2._lastSyncKills=0;
  MP2._lastSyncedWave=0;
  MP2.mpStateInterval=null;
  MP2._pvpDuelActive=false;
  MP2._pvpKills=0;
  MP2._pvpDeaths=0;
  MP2.mpPosSyncTimer=0;
  MP2.mpRemoteSyncTimer=0;
}

function mp2SyncState(dt){
  if(!MP2.roomRef||!MP2.playerId||gState!=='play')return;
  MP2.mpPosSyncTimer-=dt;
  if(MP2.mpPosSyncTimer<=0){
    MP2.mpPosSyncTimer=0.05;
    const state={
      x:P.x,y:P.y,
      score:score,
      wave:wave,
      kills:totalKills,
      alive:!MP2.mpLocalDead,
      char:selChar
    };
    MP2.roomRef.child('states/'+MP2.playerId).set(state);
  }
}

function mp2UpdateRemotePlayers(dt){
  if(!MP2.roomRef)return;
  MP2.mpRemoteSyncTimer-=dt;
  if(MP2.mpRemoteSyncTimer>0)return;
  MP2.mpRemoteSyncTimer=0.1;
  Object.entries(MP2.players).forEach(([pid,p])=>{
    if(pid===MP2.playerId)return;
    if(!MP2.remotePlayers[pid]){MP2.remotePlayers[pid]={x:cv.width/2,y:cv.height/2,alive:true,score:0,wave:1,kills:0};}
    const stateRef=MP2.roomRef.child('states/'+pid);
    stateRef.once('value').then(snap=>{
      const s=snap.val();
      if(s){
        MP2.remotePlayers[pid].x=s.x||cv.width/2;
        MP2.remotePlayers[pid].y=s.y||cv.height/2;
        MP2.remotePlayers[pid].char=s.char;
        MP2.remotePlayers[pid].score=s.score||0;
        MP2.remotePlayers[pid].wave=s.wave||1;
        MP2.remotePlayers[pid].kills=s.kills||0;
        MP2.remotePlayers[pid].alive=s.alive!==false;
      }
    });
  });
}

function mp2GetEnemyTarget(e){
  if(MP2.mode==='coop'||MP2.mode==='survival'){
    const targets=Object.entries(MP2.remotePlayers).filter(([pid,rp])=>rp.alive&&pid!==MP2.playerId);
    if(targets.length===0)return P;
    let best=targets[0],bestD=Math.hypot(e.x-best[1].x,e.y-best[1].y);
    targets.forEach(([pid,rp])=>{const d=Math.hypot(e.x-rp.x,e.y-rp.y);if(d<bestD){bestD=d;best=[pid,rp];}});
    return{...best[1],x:best[1].x,y:best[1].y};
  }
  if(MP2.mode==='pvp'){
    const targets=Object.entries(MP2.remotePlayers).filter(([pid,rp])=>rp.alive);
    if(targets.length===0)return P;
    let best=targets[0],bestD=Math.hypot(e.x-best[1].x,e.y-best[1].y);
    targets.forEach(([pid,rp])=>{const d=Math.hypot(e.x-rp.x,e.y-rp.y);if(d<bestD){bestD=d;best=[pid,rp];}});
    return{...best[1],x:best[1].x,y:best[1].y};
  }
  return P;
}

function mp2SpawnAllyBullets(dt){
  if(!MP2.roomCode||!MP2.playerId||gState!=='play')return;
  if(MP2.mode==='pvp')return;
  Object.values(MP2.remotePlayers).forEach(rp=>{
    if(!rp.alive)return;
    rp._ghostT=(rp._ghostT||0)+dt;
    if(rp._ghostT<0.25)return;
    rp._ghostT=0;
    const rx=(rp._rx!==undefined?rp._rx:rp.x),ry=(rp._ry!==undefined?rp._ry:rp.y);
    let nearest=null,nd=1e9;
    for(const e of enemies){const d=Math.hypot(e.x-rx,e.y-ry);if(d<nd){nd=d;nearest=e;}}
    if(!nearest)return;
    const ang=Math.atan2(nearest.y-ry,nearest.x-rx),spd=600;
    bullets.push({x:rx,y:ry,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:5,dmg:5,color:'rgba(120,200,255,0.9)',pierce:false,hit:false,weaponId:'ally'});
  });
}

function drawRemotePlayers2(dt){
  if(!MP2.roomCode||!MP2.playerId)return;
  Object.values(MP2.remotePlayers).forEach(rp=>{
    const rc=CHARS[rp.char]||CHARS[selChar]||CHARS[0];
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
    const ringR=(rc.stats&&rc.stats.power?rc.stats.power:20)*0.35+4;
    const ringR2=(rc.stats&&rc.stats.power?rc.stats.power:20)*0.35+8;
    if(!dead){
      cx.shadowColor='rgba(76,175,80,0.9)';cx.shadowBlur=10;
      cx.strokeStyle='rgba(76,175,80,1)';cx.lineWidth=2;
      cx.beginPath();cx.arc(rp._rx,rp._ry,ringR,0,Math.PI*2);cx.stroke();
      cx.shadowBlur=0;
      cx.strokeStyle='rgba(200,230,201,0.7)';cx.lineWidth=1.5;
      cx.beginPath();cx.arc(rp._rx,rp._ry,ringR2,0,Math.PI*2);cx.stroke();
      cx.shadowColor='rgba(76,175,80,0.7)';cx.shadowBlur=6;
    }else{
      cx.shadowColor='rgba(120,120,120,0.4)';cx.shadowBlur=4;
      cx.fillStyle='rgba(80,80,80,0.5)';
      cx.beginPath();cx.arc(rp._rx,rp._ry,ringR,0,Math.PI*2);cx.fill();
    }
    const ang=Math.atan2((enemies[0]?enemies[0].y:rp._ry+10)-rp._ry,(enemies[0]?enemies[0].x:rp._rx+10)-rp._rx)+Math.PI/2;
    rc.draw(rp._rx,rp._ry,ang,cx);
    if(!dead&&rp.firing){
      const fx=rp._rx+Math.cos(ang-Math.PI/2)*ringR2;
      const fy=rp._ry+Math.sin(ang-Math.PI/2)*ringR2;
      cx.save();cx.globalAlpha=0.85;cx.shadowColor='#FFD54F';cx.shadowBlur=12;
      cx.fillStyle='rgba(255,213,79,0.9)';
      cx.beginPath();cx.arc(fx,fy,4+Math.random()*2,0,Math.PI*2);cx.fill();cx.restore();
    }
    cx.globalAlpha=1;cx.shadowBlur=0;
    cx.fillStyle='rgba(0,0,0,0.85)';cx.font="bold 11px 'Cinzel',serif";cx.textAlign='center';
    cx.fillText((dead?'☠ ':'')+(rp.name||'ALLY'),rp._rx,rp._ry-(ringR2+4));
    if(!dead){
      cx.fillStyle='rgba(76,175,80,1)';cx.font="bold 8px 'Cinzel',serif";
      cx.fillText(MP2.mode==='pvp'?'RIVAL':'ALLY',rp._rx,rp._ry+ringR2);
    }
    cx.restore();
  });
}

function mp2HandleDeath(){
  if(MP2.mpLocalDead)return;
  MP2.mpLocalDead=true;
  if(MP2.mode==='pvp'){
    MP2._pvpDeaths++;
    const killer=Object.entries(MP2.remotePlayers).find(([pid,rp])=>rp.alive);
    if(killer){
      showPowerAnnounce('☠ DEFEATED BY '+killer[1].name);
    }
    mp2RecordResult();
    Profile.setLastChar(selChar);
    Profile.setLastDiff(selDiff);
    setTimeout(()=>endGame(),2000);
  }
  if(MP2.mode==='coop'||MP2.mode==='survival'){
    MP2.mpAliveCount--;
    if(MP2.mpAliveCount<=0&&!MP2.mpAllDeadTriggered){
      MP2.mpAllDeadTriggered=true;
      mp2ShowTeamDown();
    }
  }
}

function mp2ShowTeamDown(){
  const si=document.getElementById('spectator-indicator');
  si.querySelector('.spc-text').textContent='ALL TITANS DOWN';
  si.querySelector('.spc-sub').textContent='BATTLE ENDED';
  si.style.display='block';
  mp2RecordResult();
  Profile.setLastChar(selChar);
  Profile.setLastDiff(selDiff);
  setTimeout(()=>{
    si.style.display='none';
    endGame();
  },2500);
}

function mp2RecordResult(){
  if(MP2.mode==='pvp'){
    if(MP2._pvpKills>MP2._pvpDeaths){
      Profile.recordMPWin();
    }else{
      Profile.recordMPLoss();
    }
  }else{
    Profile.recordMPWin();
  }
}

function mp2SubmitScore(score){
  if(!db||!MP2.roomCode||!MP2.playerId)return;
  db.ref('leaderboard_mp').push({
    name:pName,
    score:score,
    wave:wave,
    room:MP2.roomCode,
    mode:MP2.mode,
    timestamp:firebase.database.ServerValue.TIMESTAMP
  });
}
