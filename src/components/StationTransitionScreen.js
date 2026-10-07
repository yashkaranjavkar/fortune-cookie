import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import FactoryFloorPlan, { MAP_VIEWBOX, routeBetween, stopRoom } from './FactoryFloorPlan';
import { STOPS } from '../config/stations';
import { PlayerLookContext } from '../utils/playerLook';
import { playSound } from '../sounds';
import './StationTransitionScreen.css';

const SPEED = 190;        // map units per second
const INTRO_MS = 700;     // beat at the start so the player can find themselves on the map
const HOLD_MS = 1300;     // beat on arrival before the next screen
const FADE_OUT_MS = 450;  // map fades out over the end of the arrival beat
const MIN_WALK_MS = 2400;
const MAX_WALK_MS = 5000;
const STRIDE = 9;            // map units per radian of the leg swing (Player's `phase`)
const MIN_STEP_GAP_MS = 120; // footsteps never closer than this, even at full speed

function measure(points) {
  const segLens = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    segLens.push(len);
    total += len;
  }
  return { segLens, total };
}

function pointAt(points, segLens, dist) {
  let d = dist;
  for (let i = 0; i < segLens.length; i++) {
    if (d <= segLens[i] || i === segLens.length - 1) {
      const t = segLens[i] === 0 ? 1 : Math.min(d / segLens[i], 1);
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, dx: x2 - x1 };
    }
    d -= segLens[i];
  }
  return { x: points[0][0], y: points[0][1], dx: 0 };
}

const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Top-down factory inspector: plum coat, white cap, gold ring underfoot (the "this is
// you" marker, same idea as the colored rings under each chef in the references).
function Player({ x, y, phase, walking, facing, chefHat }) {
  const swing = walking ? Math.sin(phase) : 0;
  const bob = walking ? Math.abs(Math.sin(phase)) * 2.5 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(1.15)`}>
      <ellipse cy="4" rx="22" ry="9" fill="#000" opacity="0.22" />
      <ellipse className="st-player-ring" cy="4" rx="26" ry="11" />
      <ellipse cx="-6" cy={3 + swing * 4} rx="5" ry="4" fill="#3A1A08" />
      <ellipse cx="6" cy={3 - swing * 4} rx="5" ry="4" fill="#3A1A08" />
      <g transform={`translate(0,${-bob}) scale(${facing},1)`}>
        {/* Lab coat sleeves + hands, swinging with the walk */}
        <ellipse cx="-15" cy={-11 - swing * 3} rx="5" ry="7.5" fill="#FFFFFF" stroke="#8C877A" strokeWidth="1.6" />
        <circle cx="-15" cy={-4 - swing * 3} r="3.4" fill="#F8CF86" stroke="#7A3E12" strokeWidth="1.2" />
        <ellipse cx="15" cy={-11 + swing * 3} rx="5" ry="7.5" fill="#FFFFFF" stroke="#8C877A" strokeWidth="1.6" />
        <circle cx="15" cy={-4 + swing * 3} r="3.4" fill="#F8CF86" stroke="#7A3E12" strokeWidth="1.2" />

        {/* Lab coat: white, slightly flared at the hem */}
        <path d="M-13 -21 Q-17 -13 -18 3 L18 3 Q17 -13 13 -21 Q7 -24.5 0 -24.5 Q-7 -24.5 -13 -21 Z"
              fill="#FFFFFF" stroke="#8C877A" strokeWidth="2" />
        {/* Teal shirt showing at the neck, with the coat's lapels folded over it */}
        <path d="M-5.5 -24 L0 -13 L5.5 -24 Z" fill="#4F8FA0" />
        <path d="M-6.5 -24 L0 -13 L-3 -10.5 L-9.5 -19.5 Z" fill="#EEEBE4" stroke="#B9B4A6" strokeWidth="1" />
        <path d="M6.5 -24 L0 -13 L3 -10.5 L9.5 -19.5 Z" fill="#EEEBE4" stroke="#B9B4A6" strokeWidth="1" />
        {/* Front seam, buttons, and a breast pocket with a pen */}
        <line x1="0" y1="-12" x2="0" y2="3" stroke="#B9B4A6" strokeWidth="1.2" />
        <circle cx="-2.4" cy="-7" r="1" fill="#9C978A" />
        <circle cx="-2.4" cy="-1.5" r="1" fill="#9C978A" />
        <rect x="4.5" y="-9.5" width="7.5" height="6" rx="1.2" fill="none" stroke="#B9B4A6" strokeWidth="1.1" />
        <rect x="6.8" y="-13" width="1.7" height="5" rx="0.8" fill="#8E2A37" />
        <circle cy="-31" r="12" fill="#F8CF86" stroke="#7A3E12" strokeWidth="2" />
        {chefHat ? (
          // Tall, puffy chef's toque - earned once training is done
          <g>
            <path d="M-10 -38 Q-17 -42 -14 -50 Q-11 -57 -4 -55 Q0 -62 6 -57 Q14 -58 14 -50 Q16 -43 10 -38 Z"
                  fill="#FFFFFF" stroke="#B9B4A6" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M-4 -55 Q-2 -48 -3 -42 M6 -57 Q5 -49 5 -42" fill="none" stroke="#D8D4CA" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="-11" y="-40" width="22" height="7" rx="2" fill="#FFFFFF" stroke="#B9B4A6" strokeWidth="1.3" />
          </g>
        ) : (
          // Plain inspector's cap, before training
          <>
            <path d="M-12 -34 Q0 -52 12 -34 Z" fill="#FFFFFF" stroke="#C9C4B5" strokeWidth="1.5" />
            <rect x="-12" y="-36" width="24" height="5" rx="2" fill="#FFFFFF" stroke="#C9C4B5" strokeWidth="1" />
          </>
        )}
        <circle cx="4" cy="-29" r="1.8" fill="#3A1A08" />
        <circle cx="9" cy="-29" r="1.8" fill="#3A1A08" />
      </g>
    </g>
  );
}

// Flat 2D, top-down walk across the factory floor plan (FactoryFloorPlan) between two
// stops from config/stations.js. Auto-advances: a short beat to spot yourself, the walk
// (length-based), a beat on arrival while the map fades out, then onNext. The "Now
// entering" room card (RoomIntroScreen) is a separate screen, configured on its own.
export default function StationTransitionScreen({ fromKey, toKey, subtitle, onNext }) {
  const { chefHat } = useContext(PlayerLookContext);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;
  const facingRef = useRef(1);

  const route = useMemo(() => routeBetween(fromKey, toKey), [fromKey, toKey]);
  const { segLens, total } = useMemo(() => measure(route), [route]);

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const walkMs = reduceMotion || total === 0
    ? 0
    : Math.min(MAX_WALK_MS, Math.max(MIN_WALK_MS, (total / SPEED) * 1000));

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const totalMs = INTRO_MS + walkMs + HOLD_MS;
    const tick = (now) => {
      const e = now - start;
      setElapsed(e);
      if (e >= totalMs) {
        onNextRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [walkMs]);

  const leaving = elapsed >= INTRO_MS + walkMs + HOLD_MS - FADE_OUT_MS;

  const progress = walkMs === 0
    ? (elapsed >= INTRO_MS ? 1 : 0)
    : Math.min(1, Math.max(0, (elapsed - INTRO_MS) / walkMs));
  const dist = easeInOut(progress) * total;
  const pos = pointAt(route, segLens, dist);
  if (pos.dx > 0.5) facingRef.current = 1;
  else if (pos.dx < -0.5) facingRef.current = -1;

  const walking = progress > 0 && progress < 1;

  // Cartoon footsteps: a woodblock "tik"/"tok" each time a foot lands (every half
  // swing of the legs), alternating between the left and right foot's pitch
  const footRef = useRef({ step: 0, at: -Infinity });
  const step = Math.floor(dist / STRIDE / Math.PI);
  useEffect(() => {
    const foot = footRef.current;
    if (!walking || step <= foot.step) return;
    foot.step = step;
    const now = performance.now();
    if (now - foot.at < MIN_STEP_GAP_MS) return;
    foot.at = now;
    playSound(step % 2 ? 'step-a' : 'step-b');
  }, [step, walking]);
  const arrived = progress >= 1;
  const from = STOPS[fromKey] || { icon: '📍', label: 'Corridor' };
  const to = STOPS[toKey] || { icon: '📍', label: 'Corridor' };
  const dest = route[route.length - 1];
  const routePoints = route.map(p => p.join(',')).join(' ');

  return (
    <div className={`station-transition-screen${leaving ? ' st-leaving' : ''}`}>
      <div className="st-hud">
        <div className="st-hud-pill st-hud-dest">
          <span className="st-hud-icon" aria-hidden="true">{to.icon}</span>
          <span className="st-hud-text">
            <span className="st-hud-kicker">{arrived ? 'Arrived at' : 'Heading to'}</span>
            <span className="st-hud-label">{to.label}</span>
          </span>
        </div>
        {subtitle && <div className="st-hud-pill st-hud-sub">{subtitle}</div>}
      </div>

      <div className="st-map">
        <svg
          className="st-map-svg"
          viewBox={MAP_VIEWBOX}
          role="img"
          aria-label={`Factory floor plan: walking from ${from.label} to ${to.label}`}
        >
          <FactoryFloorPlan destRoom={stopRoom(toKey)} />

          {total > 0 && (
            <>
              <polyline className="st-route" points={routePoints} />
              <polyline
                className="st-route-walked"
                points={routePoints}
                strokeDasharray={`${dist} ${total + 20}`}
              />
            </>
          )}

          <g transform={`translate(${dest[0]},${dest[1]})`}>
            <ellipse className={`st-target${arrived ? ' arrived' : ''}`} cy="4" rx="30" ry="13" />
            {!arrived && (
              <g className="st-pin">
                <g transform="translate(0,-78)">
                  <circle r="19" className="st-pin-bubble" />
                  <text className="st-pin-icon" y="7" textAnchor="middle">{to.icon}</text>
                  <path d="M-8 16 L0 27 L8 16 Z" className="st-pin-tip" />
                </g>
              </g>
            )}
          </g>

          <Player x={pos.x} y={pos.y} phase={dist / STRIDE} walking={walking} facing={facingRef.current} chefHat={chefHat} />
        </svg>
      </div>
    </div>
  );
}
