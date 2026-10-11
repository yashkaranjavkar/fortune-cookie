import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FactoryFloorPlan, { Doors, stopRoom } from './FactoryFloorPlan';
import { Player } from './StationTransitionScreen';
import { STOPS } from '../config/stations';
import { takeRoomHandoff, introLayout, INTRO_CARD } from '../utils/roomHandoff';
import './RoomIntroScreen.css';

const FLY_MS = 450;    // the room arrives already on the window (the map zoom lands it
                       // there); this just lets the card build up around it...
const LAND_MS = 300;   // ...sits there a moment...
const SWIPE_MS = 600;  // ...then swipes away sideways, uncovering the next screen behind it
const EXPAND_MS = 700; // at the end the window opens up until it IS the next screen
const FADE_MS = 400;   // reduced motion: the card just fades off the next screen instead
const WINDOW_RADIUS = 14;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// A rounded-rectangle hole in a full-screen shape, as a clip-path - everything but
// the hole stays visible, so the screen behind shows through the hole.
function holePath(w, h, { left, top, right, bottom }, r) {
  const rr = Math.max(0, Math.min(r, (right - left) / 2, (bottom - top) / 2));
  return `path(evenodd, 'M0 0 H${w} V${h} H0 Z `
    + `M${left + rr} ${top} H${right - rr} A${rr} ${rr} 0 0 1 ${right} ${top + rr} `
    + `V${bottom - rr} A${rr} ${rr} 0 0 1 ${right - rr} ${bottom} `
    + `H${left + rr} A${rr} ${rr} 0 0 1 ${left} ${bottom - rr} `
    + `V${top + rr} A${rr} ${rr} 0 0 1 ${left + rr} ${top} Z')`;
}

// The zoomed-in room from the map walk, carried over (utils/roomHandoff.js): it starts
// exactly where the walk left it and flies into the card's window, then swipes away
// sideways inside the window, uncovering the next screen through it.
function RoomFromMap({ handoff, stopKey, windowRef }) {
  const [style, setStyle] = useState(() => ({ ...handoff.rect, borderRadius: WINDOW_RADIUS }));
  const [swiping, setSwiping] = useState(false);

  useLayoutEffect(() => {
    let raf2;
    // two frames: let the start position paint, then transition to the window
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!windowRef.current) return;
        const r = windowRef.current.getBoundingClientRect();
        setStyle({ left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: WINDOW_RADIUS });
      });
    });
    const t = setTimeout(() => setSwiping(true), FLY_MS + LAND_MS);
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(t); };
  }, [windowRef]);

  const { player } = handoff;
  return (
    <div
      className={`ri-from-map${swiping ? ' swiping' : ''}`}
      style={{ ...style, '--ri-fly': `${FLY_MS}ms`, '--ri-swipe': `${SWIPE_MS}ms` }}
      aria-hidden="true"
    >
      <svg viewBox={handoff.viewBox.join(' ')} preserveAspectRatio="xMidYMid slice">
        <FactoryFloorPlan destRoom={stopRoom(stopKey)} />
        <Doors player={player} />
        <Player x={player.x} y={player.y} phase={0} walking={false} facing={player.facing} chefHat={handoff.chefHat} />
      </svg>
    </div>
  );
}

// "Now entering ..." card. The screen that comes next is already loaded underneath it
// (App.js / SectionRunner's revealsNext), and the card's picture window is a hole
// looking onto it - so the window shows the actual task waiting in this room. At the
// end the window opens up until it fills the screen and the card is gone: the window
// has become the next screen.
//
// Straight after a map walk, the room the walk zoomed into flies into the window first
// (RoomFromMap) and fades to reveal the screen behind it.
export default function RoomIntroScreen({ stopKey, subtitle, onDone, duration = 3400 }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const stop = STOPS[stopKey] || { icon: '📍', label: 'Corridor', blurb: '' };
  const [handoff] = useState(() => takeRoomHandoff(stopKey));
  const [reduced] = useState(prefersReducedMotion);
  const [fading, setFading] = useState(false);
  const layerRef = useRef(null);
  const windowRef = useRef(null);
  // The window is always centred on the screen (utils/roomHandoff.js), with the card
  // built around it - the same spot the map walk's zoom lands the room on
  const [layout, setLayout] = useState(() => introLayout());
  useEffect(() => {
    const onResize = () => setLayout(introLayout());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const { win, card } = layout;
  const c = INTRO_CARD;

  // Every frame: cut the window out of the card (it moves while the card animates in),
  // and in the last EXPAND_MS grow the hole past the edges of the screen
  useEffect(() => {
    let raf;
    const start = performance.now();
    const openAt = handoff ? FLY_MS : 0; // until the room lands, the window stays shut
    const expandAt = duration - EXPAND_MS;
    const tick = (now) => {
      const e = now - start;
      const layer = layerRef.current;
      const win = windowRef.current;
      if (layer && win) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const r = win.getBoundingClientRect();
        let hole = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
        let radius = WINDOW_RADIUS;
        if (!reduced && e >= expandAt) {
          const k = easeInOut(Math.min(1, (e - expandAt) / EXPAND_MS));
          const pad = 40; // grow a little past the screen edges so nothing of the card is left
          hole = {
            left: hole.left + (-pad - hole.left) * k,
            top: hole.top + (-pad - hole.top) * k,
            right: hole.right + (vw + pad - hole.right) * k,
            bottom: hole.bottom + (vh + pad - hole.bottom) * k,
          };
          radius = WINDOW_RADIUS * (1 - k);
        }
        layer.style.clipPath = e >= openAt ? holePath(vw, vh, hole, radius) : 'none';
      }
      if (e >= duration) {
        onDoneRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const fade = reduced && setTimeout(() => setFading(true), duration - FADE_MS);
    return () => { cancelAnimationFrame(raf); clearTimeout(fade); };
  }, [duration, handoff, reduced]);

  return (
    <>
      {/* soaks up clicks meant for the screen underneath while the card is up */}
      <div className="ri-blocker" aria-hidden="true" />
      <div
        ref={layerRef}
        className={`room-intro-screen${handoff ? ' ri-handoff' : ''}${fading ? ' ri-fading' : ''}`}
        style={{ '--ri-fade': `${FADE_MS}ms` }}
        role="status"
      >
        <div
          className="ri-card"
          style={{
            left: card.left,
            top: card.top,
            width: card.width,
            height: card.height,
            padding: `${c.padTop}px ${c.padX}px ${c.padBottom}px`,
            borderWidth: c.border,
            gap: c.gap,
          }}
        >
          <div className="ri-head" style={{ height: c.headH }}>
            <div className="ri-kicker">
              Now entering{subtitle ? <span className="ri-tag">{subtitle}</span> : null}
            </div>
            <h2 className="ri-title">
              <span className="ri-title-icon" aria-hidden="true">{stop.icon}</span>
              {stop.label}
            </h2>
          </div>
          <div className="ri-art" style={{ width: win.width + 2 * c.frame, height: win.height + 2 * c.frame, borderWidth: c.frame }}>
            <div className="ri-window" ref={windowRef} />
          </div>
          <p className="ri-blurb" style={{ height: c.footH }}>{stop.blurb}</p>
        </div>
      </div>
      {handoff && <RoomFromMap handoff={handoff} stopKey={stopKey} windowRef={windowRef} />}
    </>
  );
}
