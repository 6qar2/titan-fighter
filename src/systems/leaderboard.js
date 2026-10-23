/* ═══ LEADERBOARD ═══ */
const Leaderboard={
  KEY:'ts_leaderboard',
  MAX:10,
  _load(){
    try{const r=localStorage.getItem(this.KEY);return r?JSON.parse(r):[];}catch{return [];}
  },
  _save(list){
    try{localStorage.setItem(this.KEY,JSON.stringify(list));}catch{}
  },
  add(score,combo){
    const list=this._load();
    const entry={
      name:Profile.getName()||'ANON',
      score:score,
      combo:combo||0,
      date:new Date().toISOString()
    };
    list.push(entry);
    list.sort((a,b)=>b.score-a.score);
    if(list.length>this.MAX)list.splice(this.MAX);
    this._save(list);
    return list;
  },
  getAll(){return this._load();},
  fmtDate(iso){
    const d=new Date(iso);
    const opts={year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'};
    return d.toLocaleDateString(navigator.language||'en-US',opts);
  }
};
