// Ambient bakery soundscape, generated live with the Web Audio API (no audio files):
//   - music:  a slow, cosy lo-fi loop - warm chord pads, a soft bass, a music-box
//             melody that's re-composed every bar (so it never repeats exactly), and a
//             faint shaker
//   - bakery: a low oven/room hum, a soft warm crackle, distant clinks of trays and
//             utensils at random moments, and the occasional soft oven-timer ding
// Usage: startAmbience() / stopAmbience() (both safe to call repeatedly). Follows the
// game's mute button. Where it plays is configured in src/config/ambience.js.
import { isMuted, onMuteChange } from './sounds';
import { AMBIENCE } from './config/ambience';

const BPM = 70;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

// Fmaj7 -> Em7 -> Dm7 -> Cmaj7, one bar each (MIDI note numbers)
const CHORDS = [
  { root: 41, tones: [53, 57, 60, 64] },
  { root: 40, tones: [52, 55, 59, 62] },
  { root: 38, tones: [50, 53, 57, 60] },
  { root: 36, tones: [48, 52, 55, 59] },
];
// Melody notes: C major pentatonic, C5 - E6
const MELODY_SCALE = [72, 74, 76, 79, 81, 84, 86, 88];
// Which eighth-notes of the bar the melody plays on - one picked at random per bar
const RHYTHMS = [[0, 3, 5], [0, 2, 4, 7], [1, 3, 6], [0, 4, 5, 7], [0, 3, 6, 7], [2, 5]];

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rand = (min, max) => min + Math.random() * (max - min);

let ctx = null;
let master, musicBus, bakeryBus, padFilter, delaySend;
let noiseBuffer = null;
let bedStarted = false;
let playing = false;
let scheduling = false;
let barTimer = null, clinkTimer = null, dingTimer = null, stopTimer = null;
let nextBarTime = 0;
let barIndex = 0;
let melodyStep = 3;

function targetLevel() {
  return isMuted() ? 0 : AMBIENCE.masterVolume;
}

function fadeTo(value, seconds) {
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(value, t + seconds);
}

function makeNoise(seconds, fill) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  fill(buffer.getChannelData(0));
  return buffer;
}

function ensureContext() {
  if (ctx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  ctx = new AudioCtx();

  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  musicBus = ctx.createGain();
  musicBus.gain.value = AMBIENCE.musicVolume;
  musicBus.connect(master);

  bakeryBus = ctx.createGain();
  bakeryBus.gain.value = AMBIENCE.bakeryVolume;
  bakeryBus.connect(master);

  // Warm, slightly muffled pads
  padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 1100;
  padFilter.Q.value = 0.5;
  padFilter.connect(musicBus);

  // Soft dotted-eighth echo for the music-box melody
  delaySend = ctx.createGain();
  delaySend.gain.value = 0.35;
  const delay = ctx.createDelay(2);
  delay.delayTime.value = BEAT * 0.75;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = 'lowpass';
  echoTone.frequency.value = 2800;
  delaySend.connect(delay);
  delay.connect(echoTone);
  echoTone.connect(feedback);
  feedback.connect(delay);
  echoTone.connect(musicBus);

  noiseBuffer = makeNoise(1, (d) => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });

  // Browsers only allow audio after the player has interacted with the page - if it
  // starts out suspended, wake it up on the first click / key / touch.
  const unlock = () => {
    ctx.resume().then(() => { if (playing) beginScheduling(); });
    ['pointerdown', 'keydown', 'touchstart'].forEach(e => window.removeEventListener(e, unlock));
  };
  if (ctx.state !== 'running') {
    ['pointerdown', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, unlock));
  }

  onMuteChange(() => { if (playing) fadeTo(targetLevel(), 0.4); });
}

/* ---------------- Music ---------------- */

function pad(midi, start, dur) {
  const f = mtof(midi);
  [-5, 5].forEach(detune => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = f;
    osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.022, start + 0.9);
    g.gain.setValueAtTime(0.022, start + dur - 0.2);
    g.gain.linearRampToValueAtTime(0, start + dur + 1.2);
    osc.connect(g);
    g.connect(padFilter);
    osc.start(start);
    osc.stop(start + dur + 1.3);
  });
}

function bass(midi, start) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = mtof(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(0.075, start + 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, start + BEAT * 1.9);
  osc.connect(g);
  g.connect(musicBus);
  osc.start(start);
  osc.stop(start + BEAT * 2);
}

// Music-box pluck: a bell-ish blend of partials with a fast attack and long decay
function pluck(midi, start, velocity) {
  const f = mtof(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(0.055 * velocity, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0008, start + 1.7);
  g.connect(musicBus);
  g.connect(delaySend);
  [[1, 1], [2, 0.28], [3.01, 0.08]].forEach(([ratio, level]) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f * ratio;
    const pg = ctx.createGain();
    pg.gain.value = level;
    osc.connect(pg);
    pg.connect(g);
    osc.start(start);
    osc.stop(start + 1.8);
  });
}

function shaker(start) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(0.012, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0005, start + 0.09);
  src.connect(hp);
  hp.connect(g);
  g.connect(musicBus);
  src.start(start, Math.random() * 0.8, 0.12);
}

function scheduleBar() {
  if (!playing || !scheduling) return;
  if (nextBarTime < ctx.currentTime + 0.05) nextBarTime = ctx.currentTime + 0.1; // e.g. after a background tab

  const t = nextBarTime;
  const chord = CHORDS[barIndex % CHORDS.length];
  const eighth = BEAT / 2;

  chord.tones.forEach(m => pad(m, t, BAR));
  bass(chord.root, t);
  bass(chord.root + 7, t + BEAT * 2);

  // A new little melody every bar, wandering step-wise through the scale
  const rhythm = RHYTHMS[Math.floor(Math.random() * RHYTHMS.length)];
  rhythm.forEach(slot => {
    melodyStep = Math.max(0, Math.min(MELODY_SCALE.length - 1, melodyStep + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
    pluck(MELODY_SCALE[melodyStep], t + slot * eighth + rand(0, 0.015), rand(0.65, 1));
  });

  // Faint shaker on the off-beats, now and then
  for (let i = 1; i < 8; i += 2) {
    if (Math.random() < 0.7) shaker(t + i * eighth);
  }

  barIndex += 1;
  nextBarTime += BAR;
  barTimer = setTimeout(scheduleBar, Math.max(50, (nextBarTime - ctx.currentTime - 0.6) * 1000));
}

/* ---------------- Bakery sounds ---------------- */

function startBed() {
  if (bedStarted) return;
  bedStarted = true;

  // Low oven / room hum: brown noise through a gently wavering low-pass
  const brown = makeNoise(4, (d) => {
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
  });
  const hum = ctx.createBufferSource();
  hum.buffer = brown;
  hum.loop = true;
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 260;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 80;
  lfo.connect(lfoDepth);
  lfoDepth.connect(humFilter.frequency);
  const humGain = ctx.createGain();
  humGain.gain.value = 0.07;
  hum.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(bakeryBus);
  hum.start();
  lfo.start();

  // Soft, warm crackle (like a cosy old radio in the corner)
  const crackle = makeNoise(3, (d) => {
    for (let i = 0; i < d.length; i++) {
      if (Math.random() < 22 / ctx.sampleRate) {
        const amp = rand(0.2, 0.7) * (Math.random() < 0.5 ? -1 : 1);
        for (let k = 0; k < 40 && i + k < d.length; k++) d[i + k] += amp * Math.exp(-k / 6);
      }
    }
  });
  const crackleSrc = ctx.createBufferSource();
  crackleSrc.buffer = crackle;
  crackleSrc.loop = true;
  const crackleTone = ctx.createBiquadFilter();
  crackleTone.type = 'bandpass';
  crackleTone.frequency.value = 2500;
  crackleTone.Q.value = 0.7;
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.05;
  crackleSrc.connect(crackleTone);
  crackleTone.connect(crackleGain);
  crackleGain.connect(bakeryBus);
  crackleSrc.start();
}

// A distant metallic clink - trays, whisks, a spoon on a bowl
function clink(start) {
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const out = ctx.createGain();
  out.gain.value = 1;
  if (pan) { pan.pan.value = rand(-0.8, 0.8); out.connect(pan); pan.connect(bakeryBus); } else { out.connect(bakeryBus); }
  const base = rand(0.88, 1.12);
  [[2093, 0.012, 0.7], [3136, 0.008, 0.5], [4400, 0.005, 0.35]].forEach(([freq, level, decay]) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * base;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(level, start + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0002, start + decay);
    osc.connect(g);
    g.connect(out);
    osc.start(start);
    osc.stop(start + decay + 0.05);
  });
}

// Soft two-note oven-timer ding
function ding(start) {
  [[1318.5, 0], [1046.5, 0.38]].forEach(([freq, offset]) => {
    [[1, 0.02], [2.76, 0.004]].forEach(([ratio, level]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start + offset);
      g.gain.linearRampToValueAtTime(level, start + offset + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0002, start + offset + 2.2);
      osc.connect(g);
      g.connect(bakeryBus);
      osc.start(start + offset);
      osc.stop(start + offset + 2.3);
    });
  });
}

function scheduleClinks() {
  clinkTimer = setTimeout(() => {
    if (!playing) return;
    const t = ctx.currentTime + 0.05;
    clink(t);
    if (Math.random() < 0.35) clink(t + rand(0.12, 0.3)); // sometimes a little double clink
    scheduleClinks();
  }, rand(4000, 11000));
}

function scheduleDings() {
  dingTimer = setTimeout(() => {
    if (!playing) return;
    ding(ctx.currentTime + 0.05);
    scheduleDings();
  }, rand(35000, 70000));
}

/* ---------------- Start / stop ---------------- */

function beginScheduling() {
  if (scheduling || !playing || ctx.state !== 'running') return;
  scheduling = true;
  startBed();
  nextBarTime = ctx.currentTime + 0.2;
  scheduleBar();
  scheduleClinks();
  scheduleDings();
  fadeTo(targetLevel(), 3);
}

export function startAmbience() {
  ensureContext();
  if (!ctx) return;
  clearTimeout(stopTimer);
  if (playing) return;
  playing = true;
  if (ctx.state === 'running') beginScheduling();
  else ctx.resume().then(() => { if (playing) beginScheduling(); }).catch(() => { /* waits for a gesture */ });
}

export function stopAmbience() {
  if (!ctx || !playing) return;
  playing = false;
  scheduling = false;
  clearTimeout(barTimer);
  clearTimeout(clinkTimer);
  clearTimeout(dingTimer);
  fadeTo(0, 1.5);
  // Once faded out, pause the audio engine entirely (so the hum/crackle stop costing
  // anything); startAmbience() resumes it.
  stopTimer = setTimeout(() => { if (!playing) ctx.suspend(); }, 1700);
}
