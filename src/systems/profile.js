/* ═══ LOCAL PROFILE SYSTEM ═══ */
const Profile={
  key:'titans_profile_v1',
  data:{
    name:'',
    lastChar:0,
    lastDiff:'normal',
    stats:{totalKills:0,gamesPlayed:0,bestScore:0,bestWave:1,bestCombo:0,headshots:0,playTime:0,accuracy:{shots:0,hits:0}},
    settings:{musicVol:0.8,sfxVol:1.0,particleDensity:3}
  },
  init(){
    try{
      const saved=localStorage.getItem(this.key);
      if(saved){
        const parsed=JSON.parse(saved);
        this.data={...this.data,...parsed};
      }
    }catch(e){}
    if(!this.data.name){
      this.data.name='TITAN';
      this.save();
    }
  },
  save(){
    localStorage.setItem(this.key,JSON.stringify(this.data));
  },
  getName(){return this.data.name||'TITAN';},
  setName(n){this.data.name=n.toUpperCase();this.save();},
  getLastChar(){return this.data.lastChar||0;},
  setLastChar(i){this.data.lastChar=i;this.save();},
  getLastDiff(){return this.data.lastDiff||'normal';},
  setLastDiff(d){this.data.lastDiff=d;this.save();},
  getStats(){return this.data.stats||{};},
  updateStats(s){this.data.stats={...this.data.stats,...s};this.save();},
  getSettings(){return this.data.settings||{musicVol:0.8,sfxVol:1.0,particleDensity:3};},
  updateSettings(s){this.data.settings={...this.data.settings,...s};this.save();},
  reset(){
    this.data={name:'TITAN',lastChar:0,lastDiff:'normal',stats:{totalKills:0,gamesPlayed:0,bestScore:0,bestWave:1,bestCombo:0,headshots:0,playTime:0,accuracy:{shots:0,hits:0}},settings:{musicVol:0.8,sfxVol:1.0,particleDensity:3}};
    this.save();
  }
};
