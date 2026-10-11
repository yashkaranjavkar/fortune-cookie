import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import FactoryFloorPlan, { Doors, MAP_VIEWBOX, ROOMS, routeBetween, stopRoom } from './FactoryFloorPlan';
import { STOPS } from '../config/stations';
import { PlayerLookContext } from '../utils/playerLook';
import { playSound } from '../sounds';
import { leaveRoomHandoff, introLayout, INTRO_CARD } from '../utils/roomHandoff';
import './StationTransitionScreen.css';

const SPEED = 190;        // map units per second
const INTRO_MS = 700;     // beat at the start so the player can find themselves on the map
// The camera starts zooming into the destination room while the player is still on
// the way (from ZOOM_FROM of the walk), following them in, and settles on the room
// just after they arrive. Meanwhile everything around the room sinks into the dark,
// leaving just the room on screen - the "Now entering" card takes it from there.
const ZOOM_FROM = 0.45;   // fraction of the walk at which the zoom begins
const SETTLE_MS = 450;    // the zoom finishes this long after the player arrives
const HOLD_MS = SETTLE_MS + 150; // everything after the walk, before the next screen
const REDUCED_HOLD_MS = 1300;    // reduced motion: no zoom, just a beat and a fade
const FADE_OUT_MS = 450;  // reduced motion: the map fades out over the end of the beat
const PAGE_BG = '#1a1a1a'; // the dark page behind every screen (App.css)
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

const MAP_BOX = MAP_VIEWBOX.split(' ').map(Number); // [x, y, w, h]

// The part of the room the "Now entering" card's window will show: the window's shape
// (16:9), as big as fits inside the room, centred between the room's middle and where
// the player stands - and always with the player in it.
function windowRegion(room, spot) {
  const aspect = INTRO_CARD.aspect;
  const w = Math.min(room.w, room.h * aspect);
  const h = w / aspect;
  let cx = (room.x + room.w / 2 + spot[0]) / 2;
  let cy = (room.y + room.h / 2 + spot[1]) / 2;
  cy = Math.min(Math.max(cy, spot[1] - h / 2 + 14), spot[1] + h / 2 - 54); // feet .. head
  cx = Math.min(Math.max(cx, room.x + w / 2), room.x + room.w - w / 2);
  cy = Math.min(Math.max(cy, room.y + h / 2), room.y + room.h - h / 2);
  return [cx - w / 2, cy - h / 2, w, h];
}

// The viewBox that puts `region` (map units) exactly on `win` (screen pixels), given
// where the map's svg sits on screen
function viewBoxOnto(region, win, box) {
  const scale = win.width / region[2];
  return [
    region[0] - (win.left - box.left) / scale,
    region[1] - (win.top - box.top) / scale,
    box.width / scale,
    box.height / scale,
  ];
}

const roundedRect = ([x, y, w, h], r) => {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + rr} ${y} H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h - rr} `
    + `A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} `
    + `V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`;
};
const lerp = (a, b, k) => a + (b - a) * k;

const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Top-down factory inspector: plum coat, white cap, gold ring underfoot (the "this is
// you" marker, same idea as the colored rings under each chef in the references).
export function Player({ x, y, phase, walking, facing, chefHat }) {
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

  const svgRef = useRef(null);
  const handoffRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const totalMs = INTRO_MS + walkMs + (reduceMotion ? REDUCED_HOLD_MS : HOLD_MS);
    const tick = (now) => {
      const e = now - start;
      setElapsed(e);
      if (e >= totalMs) {
        if (handoffRef.current) handoffRef.current();
        onNextRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [walkMs, reduceMotion]);

  const leaving = reduceMotion && elapsed >= INTRO_MS + walkMs + REDUCED_HOLD_MS - FADE_OUT_MS;

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

  // The camera zooms from the whole map into the room, starting part-way through the
  // walk and keeping the player in shot until they're inside
  const destRoom = ROOMS[stopRoom(toKey)];
  const zoomStart = INTRO_MS + walkMs * ZOOM_FROM;
  const zoomEnd = INTRO_MS + walkMs + SETTLE_MS;
  const zoomT = reduceMotion || !destRoom
    ? 0
    : Math.min(1, Math.max(0, (elapsed - zoomStart) / (zoomEnd - zoomStart)));
  // It ends with the room exactly where the "Now entering" card's window will be
  // (centred on screen), so the card can take it over without moving it at all.
  let vb = MAP_BOX;
  let zoomK = 0;
  let region = null;
  let win = null;
  let cutout = null;
  if (zoomT > 0 && svgRef.current) {
    zoomK = easeInOut(zoomT);
    const box = svgRef.current.getBoundingClientRect();
    win = introLayout().win;
    region = windowRegion(destRoom, route[route.length - 1]);
    const target = viewBoxOnto(region, win, box);
    const w = lerp(MAP_BOX[2], target[2], zoomK);
    const h = w * MAP_BOX[3] / MAP_BOX[2];
    const tx = target[0] + target[2] / 2;
    const ty = target[1] + target[3] / 2;
    let cx = lerp(MAP_BOX[0] + MAP_BOX[2] / 2, tx, zoomK);
    let cy = lerp(MAP_BOX[1] + MAP_BOX[3] / 2, ty, zoomK);
    // keep the player in shot (with room for their head) while they walk in, easing
    // off so the very end lands exactly on target
    const mx = Math.min(70, w * 0.15);
    const my = Math.min(90, h * 0.2);
    const fx = Math.min(Math.max(cx, pos.x - w / 2 + mx), pos.x + w / 2 - mx);
    const fy = Math.min(Math.max(cy, pos.y - h / 2 + my), pos.y + h / 2 - my);
    const hold = 1 - zoomK * zoomK;
    cx = lerp(cx, fx, hold);
    cy = lerp(cy, fy, hold);
    vb = [cx - w / 2, cy - h / 2, w, h];
    // the lit area closes in from the whole room to the window's own rounded shape
    const roomRect = [destRoom.x, destRoom.y, destRoom.w, destRoom.h];
    const lit = roomRect.map((v, i) => lerp(v, region[i], zoomK));
    cutout = roundedRect(lit, (14 * region[2] / win.width) * zoomK);
  }
  const viewBox = vb.join(' ');

  // At the very end, hand the room over to the "Now entering" card: it's sitting
  // exactly on the card's window, showing `region` of the map
  handoffRef.current = (reduceMotion || !destRoom || !region) ? null : () => {
    leaveRoomHandoff({
      stopKey: toKey,
      rect: { left: win.left, top: win.top, width: win.width, height: win.height },
      viewBox: region,
      player: { x: pos.x, y: pos.y, facing: facingRef.current },
      chefHat,
    });
  };
  const from = STOPS[fromKey] || { icon: '📍', label: 'Corridor' };
  const to = STOPS[toKey] || { icon: '📍', label: 'Corridor' };
  const dest = route[route.length - 1];
  const routePoints = route.map(p => p.join(',')).join(' ');

  return (
    <div className={`station-transition-screen${leaving ? ' st-leaving' : ''}${zoomK > 0 ? ' st-zooming' : ''}`}>
      <div className="st-hud" style={zoomK > 0 ? { opacity: 1 - zoomK } : undefined}>
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
          ref={svgRef}
          className="st-map-svg"
          viewBox={viewBox}
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

          {/* Everything outside the room sinks into the dark page as the camera moves
              in, until only the window-shaped part of the room is left */}
          <Doors player={pos} />

          {cutout && (
            <path
              d={`M-3000 -3000 h7000 v7000 h-7000 Z ${cutout}`}
              fillRule="evenodd"
              fill={PAGE_BG}
              opacity={zoomK}
            />
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
