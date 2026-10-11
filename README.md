# Titans Strike · Galala

Mobile-first arena shooter with 10 characters, 30 enemy types, and 2-player real-time multiplayer.

## Structure

```
index.html          - Main shell (Firebase, screens, mobile controls)
css/style.css       - All styles + mobile-first responsive rules
src/config.js       - Characters, enemies, weapons, power-ups, wave data
src/audio.js        - WebAudio SFX + procedural music engine
src/perf.js         - Adaptive quality / FPS monitor
src/state.js        - Game state, HUD, settings, stats, achievements, upgrades
src/input.js        - Keyboard, mouse, joystick, gestures
src/ui.js           - Character select, start screen, button wiring, pause
src/game.js         - Core loop: spawn, update, draw, collision, kills
src/multiplayer.js  - Firebase RTDB rooms, state sync, revive, leaderboard
src/main.js         - Boot, cinematic intro, DOMContentLoaded
sw.js               - Service worker for offline caching
```

## Run

Open `index.html` in a modern browser (Chrome/Edge/Safari mobile or desktop).
For multiplayer, configure Firebase in the inline config block.

## Mobile

- Viewport locked, no zoom
- Virtual joystick + fire/power/weapon buttons
- Swipe to switch weapon, tap-to-power
- Adaptive quality reduces shadows/particles on low-FPS devices
- Haptics on supported devices

## Multiplayer

- Create/join 4-char room codes
- 2-player co-op vs waves
- Shared titan target, revive system, pings
- End-match score sync + leaderboard
