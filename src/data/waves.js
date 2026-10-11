/* ═══ WAVE BACKGROUNDS ═══ */
const WAVE_BGS=[
  {r:4,g:4,b:10},{r:4,g:10,b:18},{r:8,g:4,b:18},{r:14,g:4,b:22},{r:18,g:4,b:14},
  {r:22,g:6,b:4},{r:24,g:10,b:0},{r:20,g:4,b:4},{r:10,g:0,b:20},{r:28,g:2,b:2}
];
const WAVE_GATE_COLS=['#4A9EFF','#2ADAFF','#A855F7','#C026D3','#EF4444','#F97316','#FBBF24','#DC2626','#8B5CF6','#FF2020'];

/* ═══ WAVE MODIFIERS ═══ */
const WAVE_MODIFIERS=[
  {name:'⚡ HORDES',effect:'hordes',desc:'More enemies'},
  {name:'🚀 FAST',effect:'fast',desc:'Enemies move faster'},
  {name:'🛡️ ARMORED',effect:'armored',desc:'Enemies take reduced damage'},
  {name:'❄️ FROZEN',effect:'slow',desc:'Enemies move slower'},
  {name:'🔥 BURNING',effect:'burning',desc:'Player takes damage over time'}
];
function mpModifierForWave(w){
  if(w<3)return null;
  const r=((w*2654435761)%1000)/1000;
  if(r<0.35)return null;
  const idx=((w*40503)%WAVE_MODIFIERS.length+WAVE_MODIFIERS.length)%WAVE_MODIFIERS.length;
  return WAVE_MODIFIERS[idx].effect;
}

/* ═══ MUSIC ENGINE ═══ */
const WAVE_MUSIC=[
  {bpm:92,root:48,scale:[0,2,4,7,9],bassLine:[0,0,7,0,5,0,7,4],hatVol:.012,bassVol:.08,melVol:.03,leadVol:.018,melType:'triangle',bassType:'triangle',leadType:'sine',arpOn:false,padOn:false},
  {bpm:102,root:46,scale:[0,2,3,7,8],bassLine:[0,0,5,0,3,0,5,2],hatVol:.015,bassVol:.09,melVol:.032,leadVol:.02,melType:'triangle',bassType:'square',leadType:'triangle',arpOn:false,padOn:false},
  {bpm:112,root:44,scale:[0,2,3,5,7,8],bassLine:[0,0,3,5,0,0,5,3],hatVol:.018,bassVol:.1,melVol:.035,leadVol:.022,melType:'sawtooth',bassType:'square',leadType:'sawtooth',arpOn:false,padOn:false},
  {bpm:122,root:44,scale:[0,2,3,5,7,8],bassLine:[0,6,3,0,8,5,3,1],hatVol:.02,bassVol:.11,melVol:.038,leadVol:.025,melType:'sawtooth',bassType:'square',leadType:'sawtooth',arpOn:true,padOn:true},
  {bpm:132,root:41,scale:[0,1,3,5,6,8,10],bassLine:[0,0,8,4,0,3,6,0],hatVol:.025,bassVol:.12,melVol:.042,leadVol:.028,melType:'sawtooth',bassType:'sawtooth',leadType:'sawtooth',arpOn:true,padOn:true},
  {bpm:142,root:39,scale:[0,1,3,5,6,8,10,11],bassLine:[0,6,0,4,8,3,0,6],hatVol:.03,bassVol:.13,melVol:.045,leadVol:.03,melType:'sawtooth',bassType:'sawtooth',leadType:'sawtooth',arpOn:true,padOn:true}
];
function getWaveMusic(w){return WAVE_MUSIC[Math.min(w-1,WAVE_MUSIC.length-1)];}
