const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\HP\\Desktop\\titan-fighter\\index.html', 'utf8');
const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (matches.length > 0) {
  const lastScript = matches[matches.length - 1][1];
  try { new Function(lastScript); console.log('JS syntax OK'); }
  catch (e) { console.error('JS Error:', e.message); process.exit(1); }
} else { console.log('No script tags found'); }
const fs2=require('fs');
const h=fs2.readFileSync('C:\\Users\\HP\\Desktop\\titan-fighter\\index.html','utf8');
['showPowerAnnounce','mpUpdateRevive','mpReviveLocal','mpCheckAllDead'].forEach(fn=>{if(!h.includes('function '+fn))console.error('MISSING '+fn);});
console.log('checks done');
