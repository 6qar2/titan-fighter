/* ═══ HELPERS ═══ */
function toRoman(n){const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const s=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let r='';v.forEach((val,i)=>{while(n>=val){r+=s[i];n-=val;}});return r||'I';}

/* ═══ RANKING HELPERS ═══ */
function rankMsg(sc){if(sc>=20000)return 'TITAN PRIME · IMMORTAL LEGEND';if(sc>=15000)return 'ALPHA TITAN · FIRST AMONG ALL';if(sc>=8000)return 'PRIMUS · ELITE OF THE LEGION';if(sc>=3000)return 'MILES · SENIOR WARRIOR';return 'TIRO · THE JOURNEY BEGINS';}
function rankDesc(sc){if(sc>=20000)return 'IMMORTAL LEGEND';if(sc>=15000)return 'ALPHA TITAN';if(sc>=8000)return 'ELITE OF THE LEGION';if(sc>=3000)return 'SENIOR WARRIOR';return 'FORGED IN GLORY';}
