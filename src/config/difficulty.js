/* ═══════════════════════════════════════════
   DIFFICULTY SETTINGS
   ═══════════════════════════════════════════ */
const DIFFICULTIES={
  easy:{label:'RECRUIT',badgeClass:'easy',enemyHpMult:0.65,enemySpdMult:0.70,enemyFireMult:0.60,spawnRateBase:2.8,ammoPackInterval:[8,12],ammoRefill:12,ammoRegenRate:1/3,scoreMult:0.8,lives:4},
  normal:{label:'LEGIONARY',badgeClass:'normal',enemyHpMult:1.0,enemySpdMult:1.0,enemyFireMult:1.0,spawnRateBase:2.2,ammoPackInterval:[10,14],ammoRefill:8,ammoRegenRate:1/5,scoreMult:1.0,lives:3},
  hard:{label:'TITAN',badgeClass:'hard',enemyHpMult:1.4,enemySpdMult:1.35,enemyFireMult:1.5,spawnRateBase:1.5,ammoPackInterval:[14,20],ammoRefill:5,ammoRegenRate:1/10,scoreMult:1.5,lives:2}
};
let selDiff='normal';
document.querySelectorAll('.diff-card').forEach(card=>{
  card.addEventListener('click',()=>{document.querySelectorAll('.diff-card').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');selDiff=card.dataset.diff;});
});
