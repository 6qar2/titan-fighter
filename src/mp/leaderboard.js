const MP_PING_TXT={help:'⚠ HELP!',nice:'✦ NICE!',here:'📍 HERE!'};
function mpSubmitScore(score){
  if(!db||!MP.roomCode||!MP.playerId)return;
  db.ref('leaderboard_mp').push({
    name:pName,
    score:score,
    wave:wave,
    room:MP.roomCode,
    mode:'mp',
    timestamp:firebase.database.ServerValue.TIMESTAMP
  });
}
function spSubmitScore(score){
  if(!db)return;
  db.ref('leaderboard_sp').push({
    name:pName,
    score:score,
    wave:wave,
    mode:'sp',
    timestamp:firebase.database.ServerValue.TIMESTAMP
  });
}
function mpLoadLeaderboard(){
  if(!db){document.getElementById('lb-list').innerHTML='<div style="text-align:center;color:var(--ash);padding:1rem;">Firebase not initialized. Check your config and Realtime Database setup.</div>';return;}
  const list=document.getElementById('lb-list');
  list.innerHTML='<div style="text-align:center;color:var(--ash);padding:1rem;">Loading...</div>';
  if(MP.lbRef){MP.lbRef.off();}
  const node=MP.lbMode==='mp'?'leaderboard_mp':'leaderboard_sp';
  MP.lbRef=db.ref(node).orderByChild('score').limitToLast(50);
  MP.lbRef.on('value',snap=>{
    const items=[];
    snap.forEach(child=>{items.push({id:child.key,...child.val()});});
    items.sort((a,b)=>b.score-a.score);
    list.innerHTML='';
    if(items.length===0){list.innerHTML='<div style="text-align:center;color:var(--ash);padding:1rem;">No scores yet</div>';return;}
    items.slice(0,50).forEach((it,i)=>{
      const row=document.createElement('div');row.className='lb-row';
      const rank=document.createElement('div');rank.className='lb-rank';rank.textContent='#'+(i+1);
      const name=document.createElement('div');name.className='lb-name'+(it.name===pName?' lb-you':'');name.textContent=it.name;
      const score=document.createElement('div');score.className='lb-score';score.textContent=it.score.toLocaleString();
      row.appendChild(rank);row.appendChild(name);row.appendChild(score);
      list.appendChild(row);
    });
  });
}
function mpStopLeaderboard(){
  if(MP.lbRef){MP.lbRef.off();MP.lbRef=null;}
}
