import React from 'react';

// Close-up, front-view illustrations of each factory room, shown on the "Now entering"
// card (RoomIntroScreen) after each walk. Flat 2D, same palette as the floor plan.
// Keyed by stop key from STOPS in src/config/stations.js.

const VIEW = '0 0 600 340';

function Room({ wall, floor, floorLine, children }) {
  return (
    <svg viewBox={VIEW} className="rv-svg" aria-hidden="true">
      <rect width="600" height="340" fill={wall} />
      <rect y="262" width="600" height="78" fill={floor} />
      <rect y="258" width="600" height="8" fill={floorLine} />
      {children}
    </svg>
  );
}

function Plant({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="-14" cy="-18" rx="16" ry="26" fill="#4F7A3F" transform="rotate(-25 -14 -18)" />
      <ellipse cx="14" cy="-18" rx="16" ry="26" fill="#5E8C4B" transform="rotate(25 14 -18)" />
      <ellipse cx="0" cy="-30" rx="14" ry="28" fill="#6E9C58" />
      <path d="M-22 0 H22 L16 40 H-16 Z" fill="#C97A25" stroke="#7A3E12" strokeWidth="3" />
    </g>
  );
}

function Cookie({ x, y, r = 16 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#DE8F33" stroke="#7A3E12" strokeWidth="2.5" />
      <circle cx={x - r * 0.35} cy={y - r * 0.2} r={r * 0.14} fill="#5A2C0C" />
      <circle cx={x + r * 0.3} cy={y - r * 0.35} r={r * 0.12} fill="#5A2C0C" />
      <circle cx={x + r * 0.1} cy={y + r * 0.35} r={r * 0.13} fill="#5A2C0C" />
    </g>
  );
}

function Dome({ cx, base, w = 30, h = 32 }) {
  return (
    <g>
      <path d={`M${cx - w} ${base} A${w} ${h} 0 0 1 ${cx + w} ${base} Z`} fill="#D9D3C4" stroke="#8C877A" strokeWidth="3" />
      <ellipse cx={cx - w * 0.35} cy={base - h * 0.55} rx={w * 0.22} ry={h * 0.16} fill="#FFFFFF" opacity="0.75" />
      <circle cx={cx} cy={base - h - 4} r="6" fill="#8C877A" />
      <rect x={cx - w - 4} y={base - 2} width={w * 2 + 8} height="7" rx="3" fill="#8C877A" />
    </g>
  );
}

function Plaque({ x, y, text, w = 200 }) {
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height="46" rx="12" fill="#3E0A12" stroke="#8A5228" strokeWidth="4" />
      <text className="rv-plaque" x={x} y={y + 31} textAnchor="middle">{text}</text>
    </g>
  );
}

function Reception() {
  return (
    <Room wall="#F6E3BE" floor="#F3DEB6" floorLine="#D3A96E">
      <Plaque x={300} y={26} text="WELCOME" />
      <Plant x={70} y={222} s={1.1} />
      <Plant x={530} y={222} s={1.1} />
      <rect x={258} y={102} width={92} height={64} rx="8" fill="#3A2A1C" />
      <rect x={267} y={111} width={74} height={46} rx="3" fill="#FFF1DC" />
      <rect x={276} y={120} width={44} height="6" rx="3" fill="#E4CFA6" />
      <rect x={276} y={132} width={56} height="6" rx="3" fill="#E4CFA6" />
      <rect x={295} y={166} width={18} height={14} fill="#3A2A1C" />
      <rect x={160} y={150} width={46} height={34} rx="4" fill="#FFFEFA" stroke="#8C877A" strokeWidth="2" transform="rotate(-8 183 167)" />
      <path d="M392 182 A18 18 0 0 1 428 182 Z" fill="#F7C948" stroke="#C4930A" strokeWidth="3" />
      <circle cx={410} cy={161} r="4" fill="#C4930A" />
      <rect x={120} y={182} width={360} height={20} rx="8" fill="#F8CF86" stroke="#C97A25" strokeWidth="4" />
      <rect x={132} y={200} width={336} height={84} rx="6" fill="#EDAA52" stroke="#C97A25" strokeWidth="4" />
      <rect x={250} y={222} width={100} height={40} rx="6" fill="#C97A25" />
      <Cookie x={300} y={242} r={14} />
    </Room>
  );
}

function TrainingFloor() {
  return (
    <Room wall="#FBF0DA" floor="#E8C38F" floorLine="#CFA46B">
      <Plaque x={300} y={26} text="PRACTICE TRAYS" w={260} />
      {[50, 225, 400].map(x => (
        <g key={x}>
          <rect x={x + 14} y={216} width={10} height={60} fill="#8A5228" />
          <rect x={x + 126} y={216} width={10} height={60} fill="#8A5228" />
          <rect x={x} y={206} width={150} height={16} rx="5" fill="#C98B4E" stroke="#8A5228" strokeWidth="3" />
          <rect x={x + 12} y={182} width={126} height={26} rx="6" fill="#F8CF86" stroke="#C97A25" strokeWidth="3" />
          {[32, 60, 88, 116].map(dx => <Cookie key={dx} x={x + dx} y={182} r={13} />)}
        </g>
      ))}
      <g className="rv-bob">
        <rect x={250} y={96} width={100} height={48} rx="6" fill="#FFFEFA" stroke="#E4CFA6" strokeWidth="3" />
        <rect x={262} y={110} width={60} height="6" rx="3" fill="#E4CFA6" />
        <rect x={262} y={122} width={40} height="6" rx="3" fill="#F4A9C0" />
      </g>
    </Room>
  );
}

function Briefing() {
  return (
    <Room wall="#EDE7D6" floor="#A7BE93" floorLine="#90A97C">
      <rect x={100} y={24} width={400} height={182} rx="10" fill="#FFFFFF" stroke="#8C877A" strokeWidth="7" />
      <text className="rv-board" x={300} y={66} textAnchor="middle">TODAY'S RULES</text>
      <rect x={130} y={84} width={340} height={40} rx="4" fill="#FFFEFA" stroke="#E4CFA6" strokeWidth="3" />
      <rect x={144} y={100} width={150} height="8" rx="4" fill="#E4CFA6" />
      <rect x={304} y={95} width={150} height="18" rx="4" fill="#F4A9C0" />
      <circle cx={170} cy={160} r="16" fill="#4F7A3F" />
      <path d="M162 160 l6 6 l11 -12" stroke="#FFF" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x={196} y={154} width={90} height="10" rx="5" fill="#C9C4B5" />
      <circle cx={330} cy={160} r="16" fill="#8E2A37" />
      <path d="M323 153 l14 14 M337 153 l-14 14" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
      <rect x={356} y={154} width={90} height="10" rx="5" fill="#C9C4B5" />
      <line x1={470} y1={250} x2={420} y2={110} stroke="#5A2C0C" strokeWidth="6" strokeLinecap="round" className="rv-pointer" />
      {[90, 200, 310, 420].map(x => (
        <g key={x}>
          <rect x={x} y={250} width={90} height={56} rx="14" fill="#8E2A37" stroke="#3E0A12" strokeWidth="3" />
          <rect x={x + 8} y={300} width={74} height={16} rx="6" fill="#6E1A26" />
        </g>
      ))}
    </Room>
  );
}

function makeLine(domes, label) {
  return function Line() {
    const xs = Array.from({ length: domes }, (_, k) => 70 + (460 / (domes - 1)) * k);
    return (
      <Room wall="#D3CDBE" floor="#BDB6A6" floorLine="#8C877A">
        <Plaque x={300} y={22} text={label} w={170} />
        <rect x={0} y={300} width={600} height={40} fill="#F7C948" />
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d={`M${i * 40 - 10} 340 L${i * 40 + 10} 300 H${i * 40 + 30} L${i * 40 + 10} 340 Z`} fill="#3A1A08" />
        ))}
        {xs.map(cx => <Dome key={cx} cx={cx} base={190} w={domes > 5 ? 32 : 36} h={40} />)}
        <rect x={20} y={192} width={560} height={40} rx="12" fill="#3A2A1C" />
        <line className="rv-belt" x1={34} y1={212} x2={566} y2={212} />
        <circle cx={40} cy={212} r="14" fill="#5A4632" stroke="#8C877A" strokeWidth="3" />
        <circle cx={560} cy={212} r="14" fill="#5A4632" stroke="#8C877A" strokeWidth="3" />
        <rect x={60} y={232} width={14} height={68} fill="#58544A" />
        <rect x={526} y={232} width={14} height={68} fill="#58544A" />
        <rect x={150} y={250} width={110} height={34} rx="6" fill="#8E2A37" stroke="#3E0A12" strokeWidth="3" />
        <text className="rv-tray" x={205} y={273} textAnchor="middle">FAULTY</text>
        <rect x={340} y={250} width={110} height={34} rx="6" fill="#4F7A3F" stroke="#2F4A25" strokeWidth="3" />
        <text className="rv-tray" x={395} y={273} textAnchor="middle">APPROVED</text>
      </Room>
    );
  };
}

function Marking() {
  return (
    <Room wall="#FBF0DA" floor="#F3DEB6" floorLine="#C9A36A">
      <circle cx={518} cy={64} r="34" fill="#FFF1DC" stroke="#8E2A37" strokeWidth="6" />
      <text className="rv-timer" x={518} y={76} textAnchor="middle">30</text>
      <rect x={62} y={124} width={476} height={96} rx="4" fill="#5A2C0C" opacity="0.15" transform="translate(6 8)" />
      <rect x={62} y={124} width={476} height={96} rx="4" fill="#FFFEFA" stroke="#E4CFA6" strokeWidth="3" />
      <rect x={86} y={148} width={300} height="12" rx="6" fill="#E4CFA6" />
      <rect x={86} y={176} width={110} height="12" rx="6" fill="#E4CFA6" />
      <rect x={208} y={168} width={170} height="28" rx="4" fill="#F7C948" opacity="0.85" className="rv-highlight" />
      <rect x={214} y={176} width={158} height="12" rx="6" fill="#C4930A" opacity="0.6" />
      <g transform="rotate(-35 410 150)">
        <rect x={384} y={128} width={92} height={30} rx="8" fill="#F7C948" stroke="#C4930A" strokeWidth="3" />
        <rect x={462} y={128} width={30} height={30} rx="6" fill="#3A1A08" />
        <path d="M384 134 L366 143 L384 152 Z" fill="#C4930A" />
      </g>
      <rect x={30} y={238} width={540} height={24} rx="8" fill="#F3DEB6" stroke="#C9A36A" strokeWidth="4" />
    </Room>
  );
}

function Inspection() {
  return (
    <Room wall="#1a140c" floor="#2A2116" floorLine="#3A2A1C">
      <polygon className="rv-beam" points="150,160 560,90 560,250" fill="#F7C948" opacity="0.28" />
      <rect x={60} y={150} width={92} height={28} rx="8" fill="#8C877A" stroke="#58544A" strokeWidth="3" />
      <rect x={146} y={144} width={20} height={40} rx="6" fill="#C9C4B5" />
      <circle cx={166} cy={164} r="10" fill="#F7C948" />
      <rect x={300} y={136} width={240} height={60} rx="4" fill="#FFFEFA" stroke="#E4CFA6" strokeWidth="3" />
      <rect x={318} y={152} width={110} height="10" rx="5" fill="#E4CFA6" />
      <rect x={318} y={170} width={60} height="14" rx="3" fill="#7FB069" />
      <rect x={384} y={170} width={56} height="14" rx="3" fill="#E86A92" />
      <rect x={446} y={170} width={70} height="10" rx="5" fill="#E4CFA6" />
      <rect x={260} y={206} width={320} height={18} rx="6" fill="#5A3A22" />
      <rect x={280} y={222} width={14} height={50} fill="#3A1A08" />
      <rect x={546} y={222} width={14} height={50} fill="#3A1A08" />
      <text className="rv-dark" x={300} y={60} textAnchor="middle">INSPECTION ROOM</text>
    </Room>
  );
}

function Dispatch() {
  return (
    <Room wall="#FBF0DA" floor="#C98B4E" floorLine="#A86E38">
      {[[40, 150], [120, 150], [80, 82]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={76} height={68} rx="4" fill="#C99A5B" stroke="#8A6334" strokeWidth="3" />
          <rect x={x + 30} y={y} width={16} height={68} fill="#E8C38F" />
        </g>
      ))}
      <rect x={230} y={36} width={130} height={170} rx="8" fill="#8A5228" />
      <rect x={242} y={52} width={106} height={146} rx="3" fill="#FFFEFA" />
      <rect x={272} y={28} width={46} height={20} rx="5" fill="#8C877A" />
      {[80, 112, 144, 176].map((y, i) => (
        <g key={y}>
          <circle cx={262} cy={y} r="8" fill={i === 2 ? '#8E2A37' : '#4F7A3F'} />
          <rect x={278} y={y - 4} width={56} height="8" rx="4" fill="#E4CFA6" />
        </g>
      ))}
      <g className="rv-bob">
        <circle cx={470} cy={120} r="54" fill="#F7C948" stroke="#C4930A" strokeWidth="6" />
        <circle cx={470} cy={120} r="38" fill="none" stroke="#C4930A" strokeWidth="3" />
        <path d="M470 94 l7 15 l16 2 l-12 11 l3 16 l-14 -8 l-14 8 l3 -16 l-12 -11 l16 -2 Z" fill="#FFF1DC" />
      </g>
      <rect x={30} y={218} width={540} height={22} rx="8" fill="#F8CF86" stroke="#C97A25" strokeWidth="4" />
      <rect x={40} y={238} width={520} height={30} rx="4" fill="#EDAA52" stroke="#C97A25" strokeWidth="4" />
    </Room>
  );
}

function Supervisor() {
  return (
    <Room wall="#F3DEB6" floor="#C98B4E" floorLine="#A86E38">
      <rect x={60} y={34} width={150} height={110} rx="6" fill="#CDE6F0" stroke="#8A5228" strokeWidth="8" />
      <line x1={135} y1={34} x2={135} y2={144} stroke="#8A5228" strokeWidth="5" />
      <line x1={60} y1={89} x2={210} y2={89} stroke="#8A5228" strokeWidth="5" />
      <rect x={420} y={40} width={110} height={92} rx="4" fill="#FFF1DC" stroke="#C97A25" strokeWidth="6" />
      <Cookie x={475} y={84} r={26} />
      <rect x={248} y={190} width={48} height={10} rx="4" fill="#3E0A12" />
      <polyline points="272,192 258,148 288,122" fill="none" stroke="#3E0A12" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={300} cy={140} rx={30} ry={14} fill="#F7C948" opacity="0.35" />
      <path d="M270 128 A30 26 0 0 1 330 128 Z" fill="#8E2A37" stroke="#3E0A12" strokeWidth="3" transform="rotate(18 300 120)" />
      <circle cx={302} cy={134} r="6" fill="#F7C948" />
      <rect x={330} y={150} width={80} height={52} rx="4" fill="#FFFEFA" stroke="#8C877A" strokeWidth="3" transform="rotate(6 370 176)" />
      <g className="rv-stamp">
        <rect x={340} y={160} width={60} height={26} rx="4" fill="none" stroke="#4F7A3F" strokeWidth="3" transform="rotate(-8 370 173)" />
        <text className="rv-stamp-text" x={370} y={178} textAnchor="middle" transform="rotate(-8 370 173)">OK</text>
      </g>
      <rect x={444} y={170} width={30} height={30} rx="6" fill="#FFF1DC" stroke="#8C877A" strokeWidth="3" />
      <rect x={60} y={200} width={480} height={22} rx="8" fill="#8A5228" stroke="#5A2C0C" strokeWidth="4" />
      <rect x={80} y={220} width={440} height={56} rx="4" fill="#6E4422" />
      <rect x={110} y={232} width={160} height={14} rx="5" fill="#8A5228" />
      <rect x={330} y={232} width={160} height={14} rx="5" fill="#8A5228" />
    </Room>
  );
}

function LoadingBay() {
  return (
    <Room wall="#BDB6A6" floor="#A9A292" floorLine="#8C877A">
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={20} y={20 + i * 22} width={250} height={14} rx="3" fill="#ACA595" />
      ))}
      <rect x={0} y={300} width={600} height={40} fill="#F7C948" />
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d={`M${i * 40 - 10} 340 L${i * 40 + 10} 300 H${i * 40 + 30} L${i * 40 + 10} 340 Z`} fill="#3A1A08" />
      ))}
      <g className="rv-truck">
        <rect x={250} y={110} width={230} height={140} rx="8" fill="#F3EADB" stroke="#8C877A" strokeWidth="4" />
        <text className="rv-truck-text" x={365} y={188} textAnchor="middle">FORTUNE CO.</text>
        <path d="M480 150 H540 L572 196 V250 H480 Z" fill="#8E2A37" stroke="#3E0A12" strokeWidth="4" />
        <path d="M492 162 H534 L556 196 H492 Z" fill="#CDE6F0" />
        <circle cx={310} cy={256} r="24" fill="#2A2116" />
        <circle cx={310} cy={256} r="9" fill="#8C877A" />
        <circle cx={520} cy={256} r="24" fill="#2A2116" />
        <circle cx={520} cy={256} r="9" fill="#8C877A" />
      </g>
      {[[40, 222], [116, 222], [78, 156]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={72} height={64} rx="4" fill="#C99A5B" stroke="#8A6334" strokeWidth="3" />
          <rect x={x} y={y + 26} width={72} height={12} fill="#E8C38F" />
        </g>
      ))}
    </Room>
  );
}

function Fallback({ icon }) {
  return (
    <Room wall="#FBF0DA" floor="#E8C38F" floorLine="#CFA46B">
      <text x={300} y={190} textAnchor="middle" fontSize="110">{icon}</text>
    </Room>
  );
}

const VIGNETTES = {
  reception: Reception,
  trainingFloor: TrainingFloor,
  briefing: Briefing,
  line1: makeLine(4, 'LINE 1'),
  line2: makeLine(5, 'LINE 2'),
  line3: makeLine(6, 'LINE 3'),
  marking: Marking,
  inspection: Inspection,
  results: Dispatch,
  supervisor: Supervisor,
  loadingBay: LoadingBay,
};

export default function RoomVignette({ stopKey, icon }) {
  const Vignette = VIGNETTES[stopKey];
  return Vignette ? <Vignette /> : <Fallback icon={icon || '📍'} />;
}
