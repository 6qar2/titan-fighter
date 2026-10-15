/* ═══ CANVAS ═══ */
const cv=document.getElementById('gc');
const cx=cv.getContext('2d');
let DPR=Math.min(window.devicePixelRatio||1,2);
function resize(){cv.width=window.innerWidth*DPR;cv.height=window.innerHeight*DPR;cx.scale(DPR,DPR);}
resize();
window.addEventListener('resize',()=>{DPR=Math.min(window.devicePixelRatio||1,2);resize();if(gState==='play')initStars();});
