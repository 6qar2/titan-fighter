/* ═══════════════════════════════════════════
   30 ENEMY TYPES (10 original + 20 new)
   Each with: minWave, hp, spd, sz, pts, col, ability, weight(w)
   ═══════════════════════════════════════════ */
const EDEFS=[
  {type:'scout',label:'SCOUT',minWave:1,hp:1,spd:1.1,sz:14,pts:80,col:'#C8A84B',sRate:0,ability:'none',weight(w){return w<=3?40:w<=5?20:8;}},
  {type:'skirmisher',label:'SKIRMISHER',minWave:2,hp:1,spd:0.65,sz:16,pts:120,col:'#8BA86A',sRate:0.55,ability:'strafe',weight(w){return w<2?0:w<=4?25:10;}},
  {type:'soldier',label:'SOLDIER',minWave:2,hp:2,spd:0.8,sz:20,pts:180,col:'#E25822',sRate:0.8,ability:'none',weight(w){return w<2?0:w<=4?35:12;}},
  {type:'runner',label:'RUNNER',minWave:1,hp:1,spd:2.0,sz:12,pts:100,col:'#FFB300',sRate:0,ability:'charge',weight(w){return w<=3?20:w<=6?12:5;}},
  {type:'crawler',label:'CRAWLER',minWave:1,hp:1,spd:0.9,sz:11,pts:90,col:'#66BB6A',sRate:0,ability:'zigzag',weight(w){return w<=2?35:w<=5?15:5;}},
  {type:'spitter',label:'SPITTER',minWave:2,hp:2,spd:0.5,sz:18,pts:200,col:'#26C6DA',sRate:1.0,ability:'lob',weight(w){return w<2?0:w<=4?22:10;}},
  {type:'twin',label:'TWIN',minWave:2,hp:2,spd:0.95,sz:16,pts:250,col:'#EF9A9A',sRate:0.5,ability:'split',weight(w){return w<2?0:w<=5?18:8;}},
  {type:'shielder',label:'SHIELDER',minWave:2,hp:3,spd:0.55,sz:24,pts:260,col:'#4A7EC7',sRate:0,ability:'shield',weight(w){return w<2?0:w<=5?14:8;}},
  {type:'elite',label:'ELITE',minWave:4,hp:2,spd:1.2,sz:19,pts:320,col:'#C0001A',sRate:1.6,ability:'burst',weight(w){return w<4?0:w<=6?12:8;}},
  {type:'berserker',label:'BERSERKER',minWave:4,hp:2,spd:2.0,sz:17,pts:280,col:'#FF4422',sRate:0,ability:'charge',weight(w){return w<4?0:w<=6?10:7;}},
  {type:'juggernaut',label:'JUGGERNAUT',minWave:4,hp:5,spd:0.4,sz:32,pts:500,col:'#546E7A',sRate:0.4,ability:'none',weight(w){return w<4?0:w<=7?8:6;}},
  {type:'sniper',label:'SNIPER',minWave:4,hp:2,spd:0.6,sz:15,pts:280,col:'#00ACC1',sRate:0.7,ability:'snipe',weight(w){return w<4?0:w<=7?8:6;}},
  {type:'smoker',label:'SMOKER',minWave:4,hp:2,spd:0.7,sz:17,pts:230,col:'#78909C',sRate:0,ability:'smoke',weight(w){return w<4?0:w<=7?8:5;}},
  {type:'leech',label:'LEECH',minWave:5,hp:3,spd:0.75,sz:19,pts:350,col:'#4CAF50',sRate:0.6,ability:'regen',weight(w){return w<5?0:w<=8?16:10;}},
  {type:'tribune',label:'TRIBUNE',minWave:5,hp:4,spd:0.65,sz:28,pts:550,col:'#8B0015',sRate:2.0,ability:'spread',weight(w){return w<5?0:w<=8?18:12;}},
  {type:'phantom',label:'PHANTOM',minWave:5,hp:2,spd:1.4,sz:18,pts:420,col:'#9B59B6',sRate:1.0,ability:'teleport',weight(w){return w<5?0:w<=8?14:10;}},
  {type:'bomber',label:'BOMBER',minWave:5,hp:3,spd:1.3,sz:20,pts:450,col:'#FF7043',sRate:0,ability:'explode',weight(w){return w<5?0:w<=8?16:10;}},
  {type:'necromancer',label:'NECROMANCER',minWave:6,hp:4,spd:0.55,sz:26,pts:600,col:'#CE93D8',sRate:1.2,ability:'revive',weight(w){return w<6?0:w<=9?12:8;}},
  {type:'viper',label:'VIPER',minWave:5,hp:3,spd:1.5,sz:16,pts:380,col:'#AED581',sRate:0.8,ability:'poison',weight(w){return w<5?0:w<=8?14:9;}},
  {type:'irontitan',label:'IRON TITAN',minWave:6,hp:8,spd:0.55,sz:36,pts:1200,col:'#607D8B',sRate:1.5,ability:'armored',weight(w){return w<6?0:w<=9?10:7;}},
  {type:'thunderer',label:'THUNDERER',minWave:7,hp:5,spd:0.7,sz:28,pts:750,col:'#FFF176',sRate:1.8,ability:'lightning',weight(w){return w<7?0:w<=9?12:8;}},
  {type:'corruptor',label:'CORRUPTOR',minWave:6,hp:4,spd:0.85,sz:22,pts:520,col:'#F06292',sRate:1.0,ability:'corrupt',weight(w){return w<6?0:w<=9?10:7;}},
  {type:'warlord',label:'WARLORD',minWave:7,hp:6,spd:0.9,sz:34,pts:900,col:'#FF8C00',sRate:2.5,ability:'spiral',weight(w){return w<7?0:w<=9?12:16;}},
  {type:'colossusg',label:'TITAN GUARD',minWave:7,hp:7,spd:0.7,sz:38,pts:1000,col:'#5C6BC0',sRate:2.0,ability:'fortify',weight(w){return w<7?0:w<=9?12:8;}},
  {type:'stormeagle',label:'STORM EAGLE',minWave:7,hp:5,spd:2.2,sz:22,pts:680,col:'#80CBC4',sRate:2.2,ability:'dive',weight(w){return w<7?0:w<=10?16:12;}},
  {type:'voidwalker',label:'VOID WALKER',minWave:8,hp:5,spd:1.6,sz:24,pts:850,col:'#37474F',sRate:1.8,ability:'phase',weight(w){return w<8?0:w<=10?14:10;}},
  {type:'chaoslord',label:'CHAOS LORD',minWave:8,hp:10,spd:0.8,sz:40,pts:1800,col:'#E040FB',sRate:2.8,ability:'chaos',weight(w){return w<8?0:w<=10?8:8;}},
  {type:'herald',label:'TITAN HERALD',minWave:9,hp:12,spd:0.5,sz:46,pts:2200,col:'#FF8F00',sRate:3.0,ability:'summon',weight(w){return w<9?0:w<=10?8:6;}},
  {type:'caesar',label:'CAESAR',minWave:6,hp:12,spd:0.4,sz:44,pts:2500,col:'#D4AF37',sRate:3.2,ability:'nova',weight(w){return w<6?0:Math.min(6,(w-5)*2);}},
  {type:'titangod',label:'TITAN GOD',minWave:10,hp:22,spd:0.6,sz:54,pts:5000,col:'#FFD700',sRate:4.0,ability:'godmode',weight(w){return w<10?0:10;}},
  {type:'goliath',label:'GOLIATH',minWave:8,hp:14,spd:0.5,sz:42,pts:1600,col:'#795548',sRate:2.2,ability:'rock_throw',weight(w){return w<8?0:w<=10?8:6;}},
  {type:'reaper',label:'REAPER',minWave:7,hp:6,spd:1.8,sz:24,pts:900,col:'#212121',sRate:2.0,ability:'soul_steal',weight(w){return w<7?0:w<=10?10:8;}},
  {type:'zealot',label:'ZEALOT',minWave:6,hp:5,spd:1.2,sz:22,pts:650,col:'#D81B60',sRate:1.8,ability:'berserk',weight(w){return w<6?0:w<=9?10:7;}},
  {type:'inferno',label:'INFERNO',minWave:8,hp:8,spd:0.7,sz:30,pts:1100,col:'#FF6D00',sRate:2.4,ability:'fire_aura',weight(w){return w<8?0:w<=10?8:6;}},
  {type:'frostgiant',label:'FROST GIANT',minWave:7,hp:10,spd:0.55,sz:40,pts:1300,col:'#00B0FF',sRate:1.8,ability:'ice_blast',weight(w){return w<7?0:w<=10?8:6;}},
  {type:'plaguebringer',label:'PLAGUE BRINGER',minWave:8,hp:7,spd:0.8,sz:26,pts:1000,col:'#33691E',sRate:2.2,ability:'plague',weight(w){return w<8?0:w<=10?10:7;}},
  {type:'voidreaver',label:'VOID REAVER',minWave:9,hp:9,spd:1.4,sz:28,pts:1400,col:'#4A148C',sRate:2.6,ability:'void_rift',weight(w){return w<9?0:w<=10?6:4;}},
  {type:'stormlord',label:'STORM LORD',minWave:9,hp:12,spd:0.65,sz:44,pts:1700,col:'#FF8F00',sRate:3.2,ability:'lightning_storm',weight(w){return w<9?0:w<=10?6:5;}},
  {type:'titanoverlord',label:'TITAN OVERLORD',minWave:10,hp:30,spd:0.45,sz:60,pts:8000,col:'#B71C1C',sRate:4.5,ability:'overlord',weight(w){return w<10?0:8;}}
];

function pickEnemyDef(wave){const pool=[];EDEFS.forEach(d=>{const w=d.weight(wave);if(w>0)for(let i=0;i<w;i++)pool.push(d);});return pool[Math.floor(Math.random()*pool.length)]||EDEFS[0];}
