// Wisecrack sound helper.
// Usage:  import { playSound, setMuted, setVolume } from './sounds.js';
//         playSound('dome-lift');
//
// Put the sounds/ folder somewhere your app serves as static files
// (in a Vite or Create React App project, that's the public/ folder),
// then set SOUND_FOLDER to match.

const SOUND_FOLDER = '/sounds/';

// Each sound's own loudness, so quiet ticks and big fanfares sit well together.
const SOUNDS = {
  'button-press': 0.7,
  'button-hover': 0.35,
  'select': 0.6,
  'popup-open': 0.6,
  'popup-close': 0.55,
  'toast': 0.5,
  'dome-lift': 0.6,
  'cookie-crack': 0.8,
  'cookie-break': 0.8,
  'progress-munch': 0.6,
  'slip-pickup': 0.6,
  'drop-approved': 0.7,
  'drop-faulty': 0.7,
  'timer-tick': 0.5,
  'time-up': 0.7,
  'coin-gain': 0.6,
  'coin-loss': 0.55,
  'star-earn': 0.65,
  'level-done': 0.75,
  'balloon-pop': 0.8,
  'highlight-mark': 0.5,
  'highlight-remove': 0.5,
  'torch-on': 0.5,
};

let muted = false;
let masterVolume = 1;
const cache = {};

try {
  muted = localStorage.getItem('wisecrack-muted') === 'true';
} catch (e) { /* storage unavailable: start unmuted */ }

function load(name) {
  if (!cache[name]) {
    const audio = new Audio(SOUND_FOLDER + name + '.mp3');
    audio.preload = 'auto';
    cache[name] = audio;
  }
  return cache[name];
}

// Load everything up front so the first play isn't delayed.
export function preloadSounds() {
  Object.keys(SOUNDS).forEach(load);
}

export function playSound(name) {
  if (muted || !(name in SOUNDS)) return;
  // Clone so the same sound can overlap itself (e.g. fast button taps).
  const audio = load(name).cloneNode();
  audio.volume = Math.min(1, SOUNDS[name] * masterVolume);
  audio.play().catch(() => { /* browser blocked audio before the first click: ignore */ });
}

const muteListeners = new Set();

export function setMuted(value) {
  muted = value;
  try { localStorage.setItem('wisecrack-muted', String(value)); } catch (e) { /* ignore */ }
  muteListeners.forEach(fn => fn(value));
}

// Lets long-running audio (the ambient music) follow the mute button too.
// Returns an unsubscribe function.
export function onMuteChange(fn) {
  muteListeners.add(fn);
  return () => muteListeners.delete(fn);
}

export function isMuted() {
  return muted;
}

export function setVolume(value) {
  masterVolume = Math.max(0, Math.min(1, value));
}
