import React, { useEffect, useState } from 'react';

// How the light through the door's narrow opening behaves each time it glows - one is
// picked at random per glow, and glows happen at random intervals (see useDoorGlow).
const DOOR_GLOWS = ['flicker', 'swell', 'flash'];
const DOOR_GLOW_GAP_MS = [2500, 8000]; // random wait between glows (min, max)

// Fires a randomly chosen door glow, waits a random while, and repeats. Returns the
// current glow ({ kind, id }); the id changes every time so the animation restarts.
function useDoorGlow() {
  const [glow, setGlow] = useState({ kind: null, id: 0 });
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let timer;
    const schedule = () => {
      const [min, max] = DOOR_GLOW_GAP_MS;
      timer = setTimeout(() => {
        const kind = DOOR_GLOWS[Math.floor(Math.random() * DOOR_GLOWS.length)];
        setGlow(g => ({ kind, id: g.id + 1 }));
        schedule();
      }, min + Math.random() * (max - min));
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return glow;
}
import openingArt from '../assets/Drawings/Opening screen.jpg';
import './OpeningScreen.css';

// The FORTUNERY logo, letter by letter: each one sits at its own slight tilt and
// height for a bouncy cartoon-game-title look. `kern` nudges the space before a letter
// (in em, negative = tighter) to even out the gaps the tilts would otherwise create.
const LOGO_LETTERS = [
  { char: 'F', tilt: -4, lift: 0.02, kern: 0 },
  { char: 'O', tilt: 3, lift: -0.04, kern: 0.01 },
  { char: 'R', tilt: -2, lift: 0.02, kern: 0.01 },
  { char: 'T', tilt: 3, lift: -0.03, kern: 0.03 },
  { char: 'U', tilt: -3, lift: 0.03, kern: 0.03 },
  { char: 'N', tilt: 2, lift: -0.03, kern: 0.03 },
  { char: 'E', tilt: -3, lift: 0.02, kern: 0.04 },
  { char: 'R', tilt: 4, lift: -0.04, kern: 0.03 },
  { char: 'Y', tilt: -3, lift: 0.02, kern: 0.03 },
];

// Everything below is positioned in % of the DRAWING (not the window), so it stays on
// the right spot of the art at any window size and through the slow zoom.

// Steam curling off the fresh cookie tray: [left %, top %, duration s, delay s]
const STEAM = [
  [11, 84, 5.5, 0], [21, 79, 6.5, 1.8], [30, 84, 5, 3.4],
  [40, 79, 6, 0.9], [49, 85, 5.8, 2.6],
];

// Light catching glass: [left %, top %, size % of drawing width, delay s]
const GLINTS = [
  [23.8, 53.5, 2.4, 1.2],  // magnifying glass, left inspector
  [25.2, 71.2, 2.0, 3.6],  // magnifying glass over the tray
  [63.3, 56.5, 1.6, 6.0],  // cloche in the picture pinned on the board
];

// Fortune slips drifting down the dark right side, right of the board. Each one falls
// its own way so no two look alike:
//   left % | fall s | delay s | width % of drawing | motion | motion s | start angle | mirrored | curl shape
// motion: 'tumble' (end over end), 'spin' (propeller), 'twist' (along its length),
//         'rock' (side-to-side like a leaf), 'flutter' (tipping and catching the air)
const SLIPS = [
  { left: 73, fall: 19, delay: 0,    size: 5.2, motion: 'tumble',  speed: 2.6, angle: -12, mirror: false, curl: 0 },
  { left: 80, fall: 23, delay: 6,    size: 4.4, motion: 'spin',    speed: 4.2, angle: 30,  mirror: true,  curl: 1 },
  { left: 87, fall: 21, delay: 2.5,  size: 5.6, motion: 'flutter', speed: 2.0, angle: -4,  mirror: false, curl: 2 },
  { left: 93, fall: 25, delay: 11,   size: 4.6, motion: 'twist',   speed: 3.0, angle: 60,  mirror: false, curl: 1 },
  { left: 76, fall: 22, delay: 14,   size: 4.0, motion: 'rock',    speed: 2.8, angle: -35, mirror: true,  curl: 2 },
  { left: 90, fall: 20, delay: 17.5, size: 5.0, motion: 'tumble',  speed: 3.4, angle: 80,  mirror: true,  curl: 0 },
];

// Three ways a strip of fortune paper curls: an S-curve, a single arc, and nearly flat
// with one curled-up end. `ink` is the printed line along the middle, `dots` the little
// red lucky number.
const CURLS = [
  {
    shape: 'M2 5 C36 0 70 10 104 4 C120 1 132 2 138 3 L138 20 C132 19 120 18 104 21 C70 27 36 17 2 22 Z',
    ink: 'M12 12.4 C38 7.6 70 17.8 104 11.6 C112 10.2 116 10 118 10',
    dots: [[124, 10.2], [128.5, 10.1], [133, 10]],
  },
  {
    shape: 'M2 10 C40 2 100 2 138 10 L138 25 C100 17 40 17 2 25 Z',
    ink: 'M12 15.5 C45 8.6 95 8.6 116 13.2',
    dots: [[123, 15], [127.5, 15.8], [132, 16.6]],
  },
  {
    shape: 'M2 6 C50 5 100 6 122 6 C131 6 136 9 138 13 L137 25 C134 22 129 21 122 21 C100 21 50 22 2 21 Z',
    ink: 'M12 13.5 C50 13 90 13.5 104 13.5',
    dots: [[110, 13.6], [114.5, 13.6], [119, 13.7]],
  },
];

// One side of a fortune slip: the printed front, or the plain, slightly darker back
// with the print only faintly showing through.
function PaperFace({ id, curl, back }) {
  const c = CURLS[curl];
  const gradId = `op-paper-${id}-${back ? 'b' : 'f'}`;
  const stops = back
    ? ['#DCCDAE', '#EDE2CB', '#E2D5B8', '#EFE5D0', '#D8C9A9']
    : ['#E8DCC2', '#FFFDF6', '#EFE4CC', '#FFFEF9', '#E4D7BB'];
  return (
    <svg className={`op-slip-face${back ? ' back' : ''}`} viewBox="0 0 140 27" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {stops.map((color, i) => <stop key={i} offset={`${i * 25}%`} stopColor={color} />)}
        </linearGradient>
      </defs>
      <path d={c.shape} fill={`url(#${gradId})`} stroke="#CDBD99" strokeWidth="0.6" />
      <g transform={back ? 'translate(140 0) scale(-1 1)' : undefined} opacity={back ? 0.18 : 1}>
        <path
          d={c.ink}
          fill="none"
          stroke="#8C877A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="9 3.5 14 3.5 6 3.5 11 3.5 8 3.5"
          opacity="0.7"
        />
        {c.dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.1" fill="#C14A70" />)}
      </g>
    </svg>
  );
}

// Dust motes floating through the window light: [left %, top %, size px, duration s, delay s]
const MOTES = [
  [8, 62, 3, 11, 0], [14, 48, 2, 13, 2.5], [21, 70, 4, 10, 1], [27, 40, 2, 14, 5],
  [33, 58, 3, 12, 3.5], [11, 30, 2, 15, 7], [24, 22, 3, 13, 4], [38, 36, 2, 11, 8],
  [17, 80, 3, 12, 6], [31, 74, 2, 14, 1.5], [6, 44, 2, 12, 9], [42, 52, 3, 15, 2],
  [19, 34, 2, 10, 10], [36, 18, 2, 13, 6.5], [29, 88, 3, 11, 3],
];

// The game's title screen: the full "SUS BATCH" inspection-room drawing, which slowly
// zooms in once, brought to life with steam off the cookies, glints on the glass,
// fortune slips drifting down, window light and dust - plus the poster-style
// "BATCH 26" logo and Start button, inset from the bottom-right edges.
export default function OpeningScreen({ onStart }) {
  // The drawing's own aspect ratio (read once it loads), so the picture layer below can
  // be sized exactly like the cropped image even if the artwork file changes shape.
  const [artRatio, setArtRatio] = useState(2100 / 1080);
  const doorGlow = useDoorGlow();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') onStart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  return (
    <div className="opening-screen" style={{ '--art-ratio': artRatio }}>
      <div className="op-stage">
        <div className="op-scene">
          <img
            className="op-art"
            src={openingArt}
            alt="Two fortune cookie inspectors examining a tray of cookies in front of a 'SUS BATCH' board"
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) setArtRatio(naturalWidth / naturalHeight);
            }}
          />

          {/* Light through the door's narrow opening (its left edge and top), glowing up
              at random intervals - remounted per glow (key) so the animation restarts */}
          {doorGlow.kind && (
            <div key={doorGlow.id} className={`op-door ${doorGlow.kind}`} aria-hidden="true">
              <span className="op-door-spill" />
              <span className="op-door-gap side" />
              <span className="op-door-gap top" />
            </div>
          )}

          <div className="op-steam" aria-hidden="true">
            {STEAM.map(([left, top, dur, delay], i) => (
              <span key={i} style={{ left: `${left}%`, top: `${top}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }} />
            ))}
          </div>

          <div className="op-glints" aria-hidden="true">
            {GLINTS.map(([left, top, size, delay], i) => (
              <span key={i} style={{ left: `${left}%`, top: `${top}%`, width: `${size}%`, animationDelay: `${delay}s` }} />
            ))}
          </div>

          <div className="op-slips" aria-hidden="true">
            {SLIPS.map((s, i) => (
              <span
                key={i}
                className={s.motion === 'rock' ? 'glide' : undefined}
                style={{ left: `${s.left}%`, width: `${s.size}%`, animationDuration: `${s.fall}s`, animationDelay: `${s.delay}s` }}
              >
                <span className="op-slip-base" style={{ transform: `rotate(${s.angle}deg)${s.mirror ? ' scaleX(-1)' : ''}` }}>
                  <span className={`op-slip-motion ${s.motion}`} style={{ animationDuration: `${s.speed}s` }}>
                    <PaperFace id={i} curl={s.curl} />
                    <PaperFace id={i} curl={s.curl} back />
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="op-light" aria-hidden="true" />
      <div className="op-motes" aria-hidden="true">
        {MOTES.map(([left, top, size, dur, delay], i) => (
          <span
            key={i}
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <div className="op-shade" aria-hidden="true" />

      <div className="op-corner">
        <h1 className="op-logo" aria-label="Fortunery">
          <span className="op-logo-kicker" aria-hidden="true">Fortune Co.</span>
          <span className="op-logo-main" aria-hidden="true">
            {LOGO_LETTERS.map(({ char, tilt, lift, kern }, i) => (
              <span
                key={i}
                className="op-logo-letter"
                style={{ '--tilt': `${tilt}deg`, '--lift': `${lift}em`, marginLeft: `${kern}em`, animationDelay: `${0.3 + i * 0.07}s` }}
              >
                {char}
              </span>
            ))}
          </span>
          <span className="op-logo-tag" aria-hidden="true">Spot the sus fortunes</span>
        </h1>
        <button className="next-btn op-start" onClick={onStart} data-sound="progress-munch">
          Start
        </button>
      </div>
    </div>
  );
}
