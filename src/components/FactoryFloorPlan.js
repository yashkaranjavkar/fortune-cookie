import React from 'react';

// The one fixed floor plan of the fortune-cookie factory, seen from above. Every
// station-to-station walk (StationTransitionScreen) happens on this same map, so over
// the course of the game the player learns where everything is.
//
// Layout: a corridor runs across the middle; rooms sit above and below it, each with
// a single door onto the corridor. Walks always go spot -> own door -> corridor ->
// destination door -> destination spot, so the character never walks through a wall.

export const MAP_VIEWBOX = '-30 -30 1260 760';
const CORRIDOR_Y = 355;
const DOOR_HALF = 32;

export const ROOMS = {
  reception:  { x: 20,  y: 20,  w: 210, h: 300, side: 'top',    doorX: 125,  floor: 'url(#fp-checker)',      name: 'Reception' },
  training:   { x: 230, y: 20,  w: 290, h: 300, side: 'top',    doorX: 375,  floor: 'url(#fp-planks-light)', name: 'Training Floor' },
  briefing:   { x: 520, y: 20,  w: 200, h: 300, side: 'top',    doorX: 620,  floor: 'url(#fp-carpet)',       name: 'Briefing Room' },
  production: { x: 720, y: 20,  w: 460, h: 300, side: 'top',    doorX: 790,  floor: 'url(#fp-steel)',        name: 'Production Hall' },
  supervisor: { x: 20,  y: 390, w: 220, h: 290, side: 'bottom', doorX: 130,  floor: 'url(#fp-planks)',       name: "Supervisor's Office" },
  marking:    { x: 240, y: 390, w: 280, h: 290, side: 'bottom', doorX: 380,  floor: 'url(#fp-tiles)',        name: 'Marking Bench' },
  inspection: { x: 520, y: 390, w: 240, h: 290, side: 'bottom', doorX: 640,  floor: '#2A2116',               name: 'Inspection Room' },
  dispatch:   { x: 760, y: 390, w: 200, h: 290, side: 'bottom', doorX: 860,  floor: 'url(#fp-planks)',       name: 'Dispatch' },
  loadingBay: { x: 960, y: 390, w: 220, h: 290, side: 'bottom', doorX: 1070, floor: 'url(#fp-concrete)',     name: 'Loading Bay' },
};

// Where the character stands for each stop (keys match STOPS in config/stations.js).
const STOP_SPOTS = {
  reception:     { room: 'reception',  spot: [125, 225] },
  trainingFloor: { room: 'training',   spot: [300, 215] },
  demo:          { room: 'training',   spot: [455, 212] },
  briefing:      { room: 'briefing',   spot: [620, 228] },
  line1:         { room: 'production', spot: [815, 85] },
  line2:         { room: 'production', spot: [815, 165] },
  line3:         { room: 'production', spot: [815, 245] },
  marking:       { room: 'marking',    spot: [380, 535] },
  inspection:    { room: 'inspection', spot: [640, 510] },
  results:       { room: 'dispatch',   spot: [860, 540] },
  supervisor:    { room: 'supervisor', spot: [130, 515] },
  loadingBay:    { room: 'loadingBay', spot: [1070, 505] },
};

const PRODUCTION_LINES = [
  { label: 'LINE 1', y: 85, domes: 4 },
  { label: 'LINE 2', y: 165, domes: 5 },
  { label: 'LINE 3', y: 245, domes: 6 },
];

const CORRIDOR_CENTER = [600, CORRIDOR_Y];

export function stopRoom(key) {
  return STOP_SPOTS[key] ? STOP_SPOTS[key].room : null;
}

// spot -> just inside the door -> out into the corridor
function pathToCorridor(key) {
  const { room, spot } = STOP_SPOTS[key];
  const r = ROOMS[room];
  const insideY = r.side === 'top' ? r.y + r.h - 34 : r.y + 34;
  return [spot, [r.doorX, insideY], [r.doorX, CORRIDOR_Y]];
}

// The polyline the character walks between two stops. Unknown keys start/end in the
// middle of the corridor rather than failing, so a typo just looks like a short walk.
export function routeBetween(fromKey, toKey) {
  const a = STOP_SPOTS[fromKey];
  const b = STOP_SPOTS[toKey];
  let points;
  if (a && b && a.room === b.room) {
    points = [a.spot, b.spot];
  } else {
    const out = a ? pathToCorridor(fromKey) : [CORRIDOR_CENTER];
    const into = b ? pathToCorridor(toKey).reverse() : [CORRIDOR_CENTER];
    points = [...out, ...into];
  }
  return points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
}

function wallSegments(r) {
  const { x, y, w, h, side, doorX } = r;
  const doorY = side === 'top' ? y + h : y;
  const farY = side === 'top' ? y : y + h;
  return [
    [x, farY, x + w, farY],
    [x, y, x, y + h],
    [x + w, y, x + w, y + h],
    [x, doorY, doorX - DOOR_HALF, doorY],
    [doorX + DOOR_HALF, doorY, x + w, doorY],
  ];
}

function Counter({ x, y, w, h, fill = '#EDAA52', lip = '#C97A25' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={fill} stroke={lip} strokeWidth="2" />
      <rect x={x} y={y + h - 2} width={w} height="7" rx="3" fill={lip} />
    </g>
  );
}

function Plant({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y + 4} r="11" fill="#C97A25" />
      <circle cx={x - 6} cy={y - 3} r="9" fill="#4F7A3F" />
      <circle cx={x + 6} cy={y - 4} r="9" fill="#5E8C4B" />
      <circle cx={x} cy={y - 10} r="8" fill="#6E9C58" />
    </g>
  );
}

function Crate({ x, y, s = 32 }) {
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx="3" fill="#C99A5B" stroke="#8A6334" strokeWidth="2" />
      <line x1={x} y1={y + s / 2} x2={x + s} y2={y + s / 2} stroke="#E8C38F" strokeWidth="4" />
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <pattern id="fp-checker" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="#FFF6E6" />
        <rect width="14" height="14" fill="#F3DEB6" />
        <rect x="14" y="14" width="14" height="14" fill="#F3DEB6" />
      </pattern>
      <pattern id="fp-planks" width="96" height="36" patternUnits="userSpaceOnUse">
        <rect width="96" height="36" fill="#C98B4E" />
        <rect y="17" width="96" height="1.5" fill="#A86E38" />
        <rect y="35" width="96" height="1.5" fill="#A86E38" />
        <rect x="30" width="1.5" height="18" fill="#A86E38" />
        <rect x="78" y="18" width="1.5" height="18" fill="#A86E38" />
      </pattern>
      <pattern id="fp-planks-light" width="96" height="36" patternUnits="userSpaceOnUse">
        <rect width="96" height="36" fill="#E8C38F" />
        <rect y="17" width="96" height="1.5" fill="#CFA46B" />
        <rect y="35" width="96" height="1.5" fill="#CFA46B" />
        <rect x="30" width="1.5" height="18" fill="#CFA46B" />
        <rect x="78" y="18" width="1.5" height="18" fill="#CFA46B" />
      </pattern>
      <pattern id="fp-carpet" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#A7BE93" />
        <circle cx="9" cy="9" r="1.6" fill="#90A97C" />
      </pattern>
      <pattern id="fp-steel" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#D3CDBE" />
        <path d="M0 0 H40 M0 0 V40" stroke="#B9B2A2" strokeWidth="2" fill="none" />
        <circle cx="6" cy="6" r="1.4" fill="#A9A292" />
      </pattern>
      <pattern id="fp-tiles" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="#FBF0DA" />
        <path d="M0 0 H32 M0 0 V32" stroke="#E4CFA6" strokeWidth="2" fill="none" />
      </pattern>
      <pattern id="fp-concrete" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#BDB6A6" />
        <circle cx="12" cy="18" r="1.5" fill="#A9A292" />
        <circle cx="41" cy="9" r="1.2" fill="#A9A292" />
        <circle cx="33" cy="44" r="1.6" fill="#A9A292" />
        <path d="M0 0 H60 M0 0 V60" stroke="#ACA595" strokeWidth="1.5" fill="none" />
      </pattern>
      <pattern id="fp-hazard" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="22" height="22" fill="#F7C948" />
        <rect width="11" height="22" fill="#3A1A08" />
      </pattern>
      <radialGradient id="fp-lamp">
        <stop offset="0%" stopColor="#F7C948" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#F7C948" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Grounds() {
  const flowers = [];
  for (let i = 0; i < 42; i++) {
    const colors = ['#F4A9C0', '#F7C948', '#FFFFFF', '#E86A92'];
    flowers.push(<circle key={`b${i}`} cx={-14 + i * 30} cy={i % 2 ? 704 : 712} r="4" fill={colors[i % 4]} />);
    flowers.push(<circle key={`t${i}`} cx={-2 + i * 30} cy={i % 2 ? -10 : -18} r="3.5" fill={colors[(i + 2) % 4]} />);
  }
  return (
    <g>
      <rect x="-30" y="-30" width="1260" height="760" fill="#B9D3A0" />
      <rect x="28" y="30" width="1160" height="660" rx="6" fill="rgba(40, 30, 10, 0.22)" />
      {flowers}
    </g>
  );
}

// Room-specific furniture, drawn on top of each room's floor and under the walls.
function Furnishings() {
  return (
    <g>
      {/* Reception */}
      <Counter x={48} y={108} w={164} h={40} />
      <rect x={116} y={112} width={32} height={20} rx="3" fill="#3A2A1C" />
      <Plant x={50} y={52} />
      <rect x={46} y={262} width={26} height={22} rx="5" fill="#8E2A37" />
      <rect x={80} y={262} width={26} height={22} rx="5" fill="#8E2A37" />

      {/* Training floor: three tray tables + the demo table */}
      {[258, 343, 428].map(x => (
        <g key={x}>
          <Counter x={x} y={62} w={70} h={44} />
          {[16, 35, 54].map(dx => <circle key={dx} cx={x + dx} cy={82} r="7" fill="#DE8F33" stroke="#7A3E12" strokeWidth="1.5" />)}
        </g>
      ))}
      <Counter x={412} y={240} w={86} h={46} fill="#8A5228" lip="#5A2C0C" />
      <rect x={428} y={247} width={54} height={24} rx="3" fill="#2A2116" />
      <ellipse cx={455} cy={260} rx={10} ry={7} fill="#D9D3C4" />

      {/* Briefing room: whiteboard + rows of chairs */}
      <rect x={560} y={34} width={120} height={18} rx="3" fill="#FFFFFF" stroke="#8C877A" strokeWidth="2" />
      <path d="M572 43 q10 -6 20 0 t20 0 M630 40 h30" stroke="#C14A70" strokeWidth="2" fill="none" />
      {[110, 145, 180].map(y => [578, 612, 646].map(x => (
        <rect key={`${x}-${y}`} x={x} y={y} width={22} height={16} rx="4" fill="#8E2A37" />
      )))}

      {/* Production hall: three conveyor lines, 4/5/6 domes - one per level */}
      <line x1={835} y1={40} x2={835} y2={300} stroke="#F7C948" strokeWidth="4" strokeDasharray="10 8" />
      {PRODUCTION_LINES.map(line => (
        <g key={line.label}>
          <rect x={850} y={line.y - 38} width={54} height={16} rx="8" fill="#3E0A12" />
          <text className="fp-line-label" x={877} y={line.y - 26.5} textAnchor="middle">{line.label}</text>
          <rect x={850} y={line.y - 17} width={262} height={34} rx="6" fill="#3A2A1C" />
          <line className="fp-belt" x1={856} y1={line.y} x2={1106} y2={line.y} />
          <line x1={850} y1={line.y - 17} x2={1112} y2={line.y - 17} stroke="#8C877A" strokeWidth="3" />
          <line x1={850} y1={line.y + 17} x2={1112} y2={line.y + 17} stroke="#8C877A" strokeWidth="3" />
          {Array.from({ length: line.domes }).map((_, k) => {
            const cx = 850 + (262 / (line.domes + 1)) * (k + 1);
            return (
              <g key={k}>
                <ellipse cx={cx} cy={line.y - 1} rx={14} ry={11} fill="#D9D3C4" stroke="#8C877A" strokeWidth="1.5" />
                <ellipse cx={cx - 4} cy={line.y - 5} rx={5} ry={3} fill="#FFFFFF" opacity="0.7" />
                <circle cx={cx} cy={line.y - 11} r={2.5} fill="#8C877A" />
              </g>
            );
          })}
          <rect x={1122} y={line.y - 16} width={42} height={14} rx="3" fill="#8E2A37" />
          <rect x={1122} y={line.y + 2} width={42} height={14} rx="3" fill="#4F7A3F" />
        </g>
      ))}

      {/* Supervisor's office */}
      <ellipse cx={130} cy={505} rx={72} ry={36} fill="#B8475A" opacity="0.4" />
      <Counter x={66} y={560} w={128} h={44} fill="#8A5228" lip="#5A2C0C" />
      <rect x={84} y={568} width={22} height={16} fill="#FFF1DC" />
      <rect x={150} y={570} width={30} height={12} fill="#FFF1DC" />
      <circle cx={130} cy={628} r={14} fill="#3E0A12" />
      <rect x={192} y={414} width={34} height={58} rx="3" fill="#8C877A" stroke="#58544A" strokeWidth="2" />
      <line x1={192} y1={433} x2={226} y2={433} stroke="#58544A" strokeWidth="2" />
      <line x1={192} y1={452} x2={226} y2={452} stroke="#58544A" strokeWidth="2" />
      <Plant x={44} y={652} />

      {/* Marking bench: strips of paper being highlighted */}
      <Counter x={268} y={575} w={224} h={40} fill="#F3DEB6" lip="#C9A36A" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={280 + i * 52} y={583} width={42} height={13} rx="1.5" fill="#FFFEFA" stroke="#E4CFA6" />
          <rect x={290 + i * 52} y={586} width={16} height={7} fill="#F7C948" opacity="0.85" />
        </g>
      ))}
      <rect x={466} y={414} width={42} height={26} rx="3" fill="#8E2A37" />

      {/* Inspection room: dark, lit only by the torch on its table */}
      <ellipse cx={640} cy={575} rx={115} ry={85} fill="url(#fp-lamp)" />
      <Counter x={590} y={560} w={100} h={44} fill="#5A3A22" lip="#3A1A08" />
      <polygon points="662,578 724,552 724,604" fill="#F7C948" opacity="0.25" />
      <rect x={626} y={573} width={30} height={10} rx="3" fill="#8C877A" />
      <circle cx={658} cy={578} r={6} fill="#F7C948" />

      {/* Dispatch desk */}
      <Counter x={790} y={600} w={140} h={36} />
      <rect x={820} y={604} width={18} height={24} rx="2" fill="#FFF1DC" stroke="#8C877A" />
      <Crate x={888} y={412} />
      <Crate x={922} y={412} />
      <Crate x={905} y={446} />

      {/* Loading bay: hazard strip + the delivery truck */}
      <rect x={962} y={640} width={216} height={38} fill="url(#fp-hazard)" opacity="0.85" />
      <Crate x={978} y={410} s={34} />
      <Crate x={1016} y={410} s={34} />
      {[[995, 562], [1075, 562], [995, 626], [1075, 626]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={20} height={7} rx="2" fill="#2A2116" />
      ))}
      <rect x={985} y={566} width={118} height={62} rx="4" fill="#F3EADB" stroke="#8C877A" strokeWidth="2" />
      <text className="fp-truck-label" x={1044} y={601} textAnchor="middle">FORTUNE CO.</text>
      <rect x={1103} y={572} width={48} height={50} rx="8" fill="#8E2A37" stroke="#3E0A12" strokeWidth="2" />
      <rect x={1138} y={580} width={9} height={34} rx="2" fill="#E8F1F2" />
    </g>
  );
}

function Walls() {
  const segments = [
    [20, 320, 20, 390],
    [1180, 320, 1180, 390],
    ...Object.values(ROOMS).flatMap(wallSegments),
  ];
  const posts = Object.values(ROOMS).flatMap(r => {
    const y = r.side === 'top' ? r.y + r.h : r.y;
    return [r.doorX - DOOR_HALF, r.doorX + DOOR_HALF].map(x => [x, y]);
  });
  return (
    <g>
      {segments.map(([x1, y1, x2, y2], i) => (
        <line key={`w${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5A2C0C" strokeWidth="14" strokeLinecap="square" />
      ))}
      {segments.map(([x1, y1, x2, y2], i) => (
        <line key={`c${i}`} x1={x1} y1={y1 - 3} x2={x2} y2={y2 - 3} stroke="#8A5228" strokeWidth="6" strokeLinecap="square" />
      ))}
      {posts.map(([x, y], i) => (
        <rect key={`p${i}`} x={x - 6} y={y - 9} width={12} height={18} rx="2" fill="#3A1A08" />
      ))}
    </g>
  );
}

function RoomSign({ room, active }) {
  const width = room.name.length * 7 + 24;
  const cx = room.x + room.w / 2;
  const cy = room.side === 'top' ? room.y + 2 : room.y + room.h - 2;
  return (
    <g className={`fp-sign${active ? ' active' : ''}`}>
      <rect x={cx - width / 2} y={cy - 11} width={width} height={22} rx="7" />
      <text x={cx} y={cy + 4} textAnchor="middle">{room.name}</text>
    </g>
  );
}

// Static layer of the map. Memoized: it never changes while a walk is playing, so the
// per-frame character animation only re-renders the small dynamic layer on top.
function FactoryFloorPlan({ destRoom }) {
  return (
    <g>
      <Defs />
      <Grounds />

      <rect x={20} y={320} width={1160} height={70} fill="url(#fp-planks)" />
      <line x1={20} y1={333} x2={1180} y2={333} stroke="#F7C948" strokeWidth="2.5" strokeDasharray="14 10" opacity="0.7" />
      <line x1={20} y1={377} x2={1180} y2={377} stroke="#F7C948" strokeWidth="2.5" strokeDasharray="14 10" opacity="0.7" />

      {Object.entries(ROOMS).map(([key, r]) => (
        <rect key={key} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.floor} />
      ))}
      {destRoom && ROOMS[destRoom] && (
        <rect
          className="fp-dest-glow"
          x={ROOMS[destRoom].x + 8}
          y={ROOMS[destRoom].y + 8}
          width={ROOMS[destRoom].w - 16}
          height={ROOMS[destRoom].h - 16}
          rx="6"
        />
      )}

      {Object.values(ROOMS).map(r => (
        <rect
          key={`mat-${r.doorX}`}
          x={r.doorX - 24}
          y={r.side === 'top' ? r.y + r.h + 8 : r.y - 22}
          width={48}
          height={14}
          rx="3"
          fill="#8E2A37"
          opacity="0.55"
        />
      ))}

      <Furnishings />
      <Walls />

      {Object.entries(ROOMS).map(([key, r]) => (
        <RoomSign key={key} room={r} active={key === destRoom} />
      ))}
    </g>
  );
}

export default React.memo(FactoryFloorPlan);
