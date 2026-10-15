const CACHE='titans-strike-v7';
const ASSETS=[
  '/',
  '/index.html',
  '/css/style.css',
  '/src/config/canvas.js',
  '/src/config/helpers.js',
  '/src/config/difficulty.js',
  '/src/data/chars.js',
  '/src/data/enemies.js',
  '/src/data/weapons.js',
  '/src/data/powerups.js',
  '/src/data/waves.js',
  '/src/core/state.js',
  '/src/core/loop.js',
  '/src/core/init.js',
  '/src/entities/player.js',
  '/src/entities/enemies.js',
  '/src/entities/projectiles.js',
  '/src/systems/waves.js',
  '/src/systems/combat.js',
  '/src/systems/fx.js',
  '/src/systems/profile.js',
  '/src/systems/mobile.js',
  '/src/ui/screens.js',
  '/src/ui/hud.js',
  '/src/ui/menus.js',
  '/src/ui/input.js',
  '/src/audio/sfx.js',
  '/src/audio/music.js',
  '/src/perf.js',
  '/src/main.js',
  '/sw.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>caches.open(CACHE))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  e.respondWith(
    caches.match(req).then(cached=>{
      const fetched=fetch(req).then(res=>{
        if(res&&res.status===200){const clone=res.clone();caches.open(CACHE).then(c=>c.put(req,clone));}
        return res;
      }).catch(()=>cached);
      return cached||fetched;
    })
  );
});
