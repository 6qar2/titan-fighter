/* ═══ LEADERBOARD ═══ */
const Leaderboard={
  KEY:'ts_leaderboard',
  MAX:10,
  SEED:[
    {name:'VALKAIR',score:98500,combo:42,date:'2026-10-20T14:32:00.000Z'},
    {name:'STRIX',score:87200,combo:38,date:'2026-10-19T09:15:00.000Z'},
    {name:'DRAVEN',score:73400,combo:27,date:'2026-10-18T22:45:00.000Z'},
    {name:'NYX',score:61800,combo:19,date:'2026-10-17T16:08:00.000Z'},
    {name:'BRANDEN',score:45200,combo:15,date:'2026-10-16T11:22:00.000Z'},
    {name:'KIRA',score:33600,combo:12,date:'2026-10-15T08:41:00.000Z'},
    {name:'JETT',score:22100,combo:8,date:'2026-10-14T19:33:00.000Z'}
  ],
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
  getAll(){
    const local=this._load();
    const merged=[...this.SEED,...local];
    merged.sort((a,b)=>b.score-a.score);
    return merged.slice(0,this.MAX);
  },
  fmtDate(iso){
    const d=new Date(iso);
    const opts={year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'};
    return d.toLocaleDateString(navigator.language||'en-US',opts);
  }
};
