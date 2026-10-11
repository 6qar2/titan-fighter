/* ═══ CANVAS ═══ */
const cv=document.getElementById('gc');
const cx=cv.getContext('2d');
function resize(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
resize();
window.addEventListener('resize',()=>{resize();if(gState==='play')initStars();});
