// Generates some of the game's sound effects as WAV files in public/sounds/.
// They're built from filtered noise (no samples, no dependencies), so they can be
// tweaked and regenerated any time:
//
//   node scripts/make-sounds.js
//
//   cookie-crack.wav    a fortune cookie snapping in half - a crisp, brittle crack,
//                       a second smaller split, then a few crumbs (training trays)
//   highlight-stroke.wav  a broad felt-tip marker dragged across paper, as a seamless
//                       loop - played while the player drags to mark (marking)
//   torch-swipe.wav     a quick card-swipe "shhk" (sliding the inspection torch)
//   step-a/step-b.wav   cartoon woodblock "tik-tok" footsteps, left/right (map walks)
//
// The random generator is seeded, so the same settings always give the same file.
const fs = require('fs');
const path = require('path');

const SR = 44100;
const OUT = path.join(__dirname, '..', 'public', 'sounds');

/* ---------------- building blocks ---------------- */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const buffer = (seconds) => new Float32Array(Math.round(seconds * SR));

// RBJ biquad filter; coefficients can be changed per sample (for sweeps)
function biquad() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  return {
    set(type, freq, q) {
      const w = (2 * Math.PI * Math.min(freq, SR * 0.45)) / SR;
      const cos = Math.cos(w);
      const alpha = Math.sin(w) / (2 * q);
      let n0, n1, n2;
      if (type === 'lowpass') { n0 = (1 - cos) / 2; n1 = 1 - cos; n2 = (1 - cos) / 2; }
      else if (type === 'highpass') { n0 = (1 + cos) / 2; n1 = -(1 + cos); n2 = (1 + cos) / 2; }
      else { n0 = alpha; n1 = 0; n2 = -alpha; } // bandpass, 0 dB peak
      const a0 = 1 + alpha;
      b0 = n0 / a0; b1 = n1 / a0; b2 = n2 / a0;
      a1 = (-2 * cos) / a0; a2 = (1 - alpha) / a0;
      return this;
    },
    run(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    },
  };
}

// One sharp, short click of filtered noise - the basic unit of a crack or a crumb
function click(out, at, { amp, length, hp, bp, q = 1.2, decay, random }) {
  const start = Math.round(at * SR);
  const n = Math.round(length * SR);
  const high = biquad().set('highpass', hp, 0.7);
  const band = biquad().set('bandpass', bp, q);
  for (let i = 0; i < n && start + i < out.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t / decay) * Math.min(1, i / 12);
    const s = band.run(high.run(random() * 2 - 1));
    out[start + i] += s * env * amp * 3;
  }
}

// A soft low "thock" under a crack - the cookie's body giving way
function thump(out, at, { amp, length, lp, decay, random }) {
  const start = Math.round(at * SR);
  const n = Math.round(length * SR);
  const low = biquad().set('lowpass', lp, 0.9);
  for (let i = 0; i < n && start + i < out.length; i++) {
    const t = i / SR;
    out[start + i] += low.run(random() * 2 - 1) * Math.exp(-t / decay) * Math.min(1, i / 40) * amp * 4;
  }
}

function normalize(buf, peak) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < buf.length; i++) buf[i] = (buf[i] / max) * peak;
  // short fades so nothing starts or ends with a pop
  const fade = Math.round(0.004 * SR);
  for (let i = 0; i < fade; i++) { buf[i] *= i / fade; buf[buf.length - 1 - i] *= i / fade; }
  return buf;
}

function writeWav(name, buf) {
  const data = Buffer.alloc(buf.length * 2);
  buf.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const head = Buffer.alloc(44);
  head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8);
  head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22);
  head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34);
  head.write('data', 36); head.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, name), Buffer.concat([head, data]));
  console.log(`${name}  ${(buf.length / SR).toFixed(2)} s`);
}

/* ---------------- the sounds ---------------- */

// Fortune cookie snapping: a fortune cookie is a thin, dry, folded wafer, so the
// crack is a tight cluster of very bright micro-clicks rather than one bang - then
// the second half splits off, then a few crumbs.
function cookieCrack() {
  const random = rng(7);
  const out = buffer(0.42);
  // main crack: ~10 clicks within 35 ms, loudest first
  let t = 0.012;
  for (let i = 0; i < 10; i++) {
    click(out, t, { amp: 1 - i * 0.07, length: 0.012, hp: 1800, bp: 3200 + random() * 2600, q: 0.9, decay: 0.0018 + random() * 0.0015, random });
    t += 0.002 + random() * 0.005;
  }
  thump(out, 0.012, { amp: 0.35, length: 0.06, lp: 380, decay: 0.012, random });
  // the second half splitting off
  t = 0.105;
  for (let i = 0; i < 6; i++) {
    click(out, t, { amp: 0.62 - i * 0.07, length: 0.01, hp: 2200, bp: 3800 + random() * 2400, q: 1, decay: 0.0015 + random() * 0.0012, random });
    t += 0.003 + random() * 0.006;
  }
  thump(out, 0.105, { amp: 0.15, length: 0.04, lp: 450, decay: 0.01, random });
  // crumbs
  for (let i = 0; i < 9; i++) {
    const at = 0.16 + random() * 0.2;
    click(out, at, { amp: 0.12 + random() * 0.16, length: 0.006, hp: 4000, bp: 5500 + random() * 3000, q: 1.4, decay: 0.0009 + random() * 0.0008, random });
  }
  return normalize(out, 0.92);
}

// Broad felt-tip marker across paper, as a seamless loop: a breathy rasp whose
// loudness wobbles with hand pressure and the paper's grain. The game plays it on
// repeat while the player drags to mark, louder the faster they move (MarkingScreen).
function markerLoop() {
  const random = rng(21);
  const loop = 1.2;
  const overlap = 0.12; // the tail is crossfaded into the start so the loop has no seam
  const raw = buffer(loop + overlap);
  const body = biquad().set('bandpass', 1700, 0.75);
  const tone = biquad().set('bandpass', 2100, 1.1);
  const fibre = biquad().set('highpass', 5200, 0.7);
  const grain = biquad().set('lowpass', 45, 0.7);     // paper texture (rasp)
  const pressure = biquad().set('lowpass', 4, 0.7);   // hand pressure (slow)
  // let the filters settle first so the loop doesn't start with a swell
  for (let i = 0; i < SR * 0.3; i++) {
    const n = random() * 2 - 1;
    body.run(n); tone.run(n); fibre.run(n); grain.run(random() * 2 - 1); pressure.run(random() * 2 - 1);
  }
  for (let i = 0; i < raw.length; i++) {
    const g = 1 + 2.2 * grain.run(random() * 2 - 1);
    const p = 1 + 3 * pressure.run(random() * 2 - 1);
    const n = random() * 2 - 1;
    const s = 0.6 * body.run(n) + 0.45 * tone.run(n) + 0.22 * fibre.run(n);
    raw[i] = s * Math.max(0.3, g) * Math.max(0.6, p);
  }
  const out = buffer(loop);
  const fade = Math.round(overlap * SR);
  for (let i = 0; i < out.length; i++) {
    out[i] = raw[i];
    if (i < fade) {
      const x = i / fade; // equal-power crossfade from the tail into the start
      out[i] = raw[i] * Math.sin((x * Math.PI) / 2) + raw[out.length + i] * Math.cos((x * Math.PI) / 2);
    }
  }
  let max = 0;
  for (const v of out) max = Math.max(max, Math.abs(v));
  for (let i = 0; i < out.length; i++) out[i] = (out[i] / max) * 0.8; // no end fades - it loops
  return out;
}

// Card swipe: a fast swoosh of plastic on plastic - band of noise sweeping upward as
// the card speeds through, a faint edge rattle, and a tiny tick as it leaves.
function cardSwipe() {
  const random = rng(33);
  const out = buffer(0.32);
  const band = biquad();
  const air = biquad().set('highpass', 6000, 0.7);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const x = Math.min(1, t / 0.22);
    band.set('bandpass', 900 * Math.pow(4.5, x), 2.2);
    const env = t < 0.07 ? t / 0.07 : Math.max(0, 1 - (t - 0.07) / 0.17);
    const rattle = 1 + 0.25 * Math.sin(2 * Math.PI * 140 * t);
    const n = random() * 2 - 1;
    out[i] = (band.run(n) * 1.2 + air.run(n) * 0.25) * env * env * rattle;
  }
  click(out, 0.235, { amp: 0.35, length: 0.012, hp: 2500, bp: 4200, q: 1.5, decay: 0.002, random });
  return normalize(out, 0.85);
}

// Cartoon footstep: a hollow wooden "tok", like the woodblock that plays a cartoon
// character's walk - a short knock with the woodblock's ringing overtones - over a soft
// low thud of the foot landing. Two pitches, used left/right, give a "tik-tok" walk.
function cartoonStep(pitchHz, seed) {
  const random = rng(seed);
  const out = buffer(0.12);
  // a woodblock's partials sit at uneven ratios, which is what makes it sound hollow
  const partials = [[1, 1, 0.022], [2.32, 0.45, 0.012], [3.87, 0.22, 0.007]];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const attack = Math.min(1, t / 0.0015);
    let v = 0;
    partials.forEach(([ratio, amp, decay]) => {
      v += Math.sin(2 * Math.PI * pitchHz * ratio * t) * amp * Math.exp(-t / decay);
    });
    out[i] = v * attack * 0.8;
  }
  click(out, 0.0004, { amp: 0.25, length: 0.008, hp: 1500, bp: 3500, q: 0.8, decay: 0.0012, random }); // the knock
  thump(out, 0, { amp: 0.22, length: 0.06, lp: 260, decay: 0.014, random });                        // foot lands
  return normalize(out, 0.85);
}

fs.mkdirSync(OUT, { recursive: true });
writeWav('cookie-crack.wav', cookieCrack());
writeWav('highlight-stroke.wav', markerLoop());
writeWav('torch-swipe.wav', cardSwipe());
writeWav('step-a.wav', cartoonStep(1050, 41));
writeWav('step-b.wav', cartoonStep(820, 42));
