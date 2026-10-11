/* ═══ AUDIO ═══ */
const AC=new(window.AudioContext||window.webkitAudioContext)();
function wake(){if(AC.state==='suspended')AC.resume();}
function sfxShoot(){wake();const b=AC.createBuffer(1,AC.sampleRate*.06,AC.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(AC.sampleRate*.01));const s=AC.createBufferSource();s.buffer=b;const g=AC.createGain();g.gain.setValueAtTime(.14,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.07);const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1600;f.Q.value=.5;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();}
function sfxEmpty(){wake();const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=90;g.gain.setValueAtTime(.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.12);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.12);}
function sfxAmmoPickup(){wake();[523,659,784,1047].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.06;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.14);});}
function sfxDamage(){wake();const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(220,AC.currentTime);o.frequency.exponentialRampToValueAtTime(55,AC.currentTime+.26);g.gain.setValueAtTime(.25,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.28);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.28);}
function sfxExplode(){wake();const b=AC.createBuffer(1,AC.sampleRate*.2,AC.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(AC.sampleRate*.05));const s=AC.createBufferSource();s.buffer=b;const g=AC.createGain();g.gain.setValueAtTime(.35,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.2);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=650;s.connect(lp);lp.connect(g);g.connect(AC.destination);s.start();}
function sfxBigBoom(){wake();const b=AC.createBuffer(1,AC.sampleRate*.45,AC.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(AC.sampleRate*.12));const s=AC.createBufferSource();s.buffer=b;const g=AC.createGain();g.gain.setValueAtTime(.7,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.45);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=300;s.connect(lp);lp.connect(g);g.connect(AC.destination);s.start();}
function sfxCombo(){wake();[440,554,660,880].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.065;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.16);});}
function sfxTeleport(){wake();const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(1200,AC.currentTime);o.frequency.exponentialRampToValueAtTime(200,AC.currentTime+.2);g.gain.setValueAtTime(.15,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.22);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.22);}
function sfxPower(){wake();[220,440,660,880,1100].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.04;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.25);});}
function sfxWeaponSwitch(){wake();const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(800,AC.currentTime);o.frequency.exponentialRampToValueAtTime(1200,AC.currentTime+.08);g.gain.setValueAtTime(.08,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.1);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.1);}
function sfxPowerupPickup(){wake();[660,880,1100,1320].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.04;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.2);});}
function sfxBossWarning(){wake();const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(180,AC.currentTime);o.frequency.linearRampToValueAtTime(360,AC.currentTime+.4);o.frequency.linearRampToValueAtTime(180,AC.currentTime+.8);g.gain.setValueAtTime(.2,AC.currentTime);g.gain.linearRampToValueAtTime(.001,AC.currentTime+.9);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.9);}
function sfxVictory(){wake();[523,659,784,1047,1319,1568,1976].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.1;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.12,t);g.gain.linearRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.35);});}
function sfxStartGame(){
  wake();
  [523,659,784,1047,1319].forEach((f,i)=>{
    const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.1;
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.25);
  });
}
function sfxGateEnter(){
  wake();
  [392,523,659,784,1047].forEach((f,i)=>{
    const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.08;
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.2);
  });
}
function sfxComboMilestone(){
  wake();
  [523,659,784,1047,1319,1568].forEach((f,i)=>{
    const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.06;
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.18);
  });
}
