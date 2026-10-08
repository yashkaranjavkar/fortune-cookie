import React from 'react';
import FactoryFront, { Ledger, LedgerButton, SEAL_ICONS } from './FactoryFront';

// Bakery-themed line icons (in place of the generic office book/monitor icons),
// drawn inline so no extra dependency is needed
const ChefHatIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 15 Q6 10 9 9 Q9 5.5 12 5.5 Q15 5.5 15 9 Q18 10 18 15" />
    <rect x="5" y="15" width="14" height="5" rx="1.5" />
  </svg>
);
// A food dome, matching the domes used throughout the game (the workstation's own equipment)
const DomeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="6.3" r="1.3" />
    <path d="M5.5 18.5 Q5.5 8.5 12 8.5 Q18.5 8.5 18.5 18.5" />
    <path d="M4 18.5h16" />
  </svg>
);

// Pennants strung along a sagging line: quadratic curve from (10,18) via (200,64) to (390,18)
const PENNANT_COLORS = [
  'var(--pink-base)', 'var(--yellow-base)', 'var(--orange-base)',
  'var(--pink-light)', 'var(--yellow-light)', 'var(--orange-light)'
];
const PENNANTS = Array.from({ length: 9 }, (_, i) => {
  const t = 0.07 + i * (0.86 / 8);
  const x = (1 - t) ** 2 * 10 + 2 * (1 - t) * t * 200 + t ** 2 * 390;
  const y = (1 - t) ** 2 * 18 + 2 * (1 - t) * t * 64 + t ** 2 * 18;
  return { x: +x.toFixed(1), y: +y.toFixed(1), color: PENNANT_COLORS[i % PENNANT_COLORS.length], delay: `${(i * 0.31).toFixed(2)}s` };
});

const TRAY_COOKIES = [162, 190, 218, 246];

// Shared with the appointment screen (AppointmentScreen.js)
export function WorkstationScene() {
  return (
    <svg className="welcome-svg" viewBox="0 0 400 230" role="img"
         aria-label="A welcome banner over an inspector's workstation with a tray of cookies, a food dome and an inspection torch">
      <circle className="welcome-glow" cx="200" cy="130" r="96" />

      {/* bunting */}
      <path className="welcome-string" d="M10 18 Q200 64 390 18" />
      {PENNANTS.map(p => (
        <polygon key={p.x} className="welcome-pennant"
                 style={{ fill: p.color, transformOrigin: `${p.x}px ${p.y}px`, animationDelay: p.delay }}
                 points={`${p.x - 11},${p.y} ${p.x + 11},${p.y} ${p.x},${p.y + 26}`} />
      ))}

      {/* wall sign */}
      <rect className="welcome-sign" x="136" y="78" width="128" height="34" rx="7" />
      <text className="welcome-sign-text" x="200" y="100" textAnchor="middle">WORKSTATION</text>

      {/* bench */}
      <rect className="welcome-bench" x="34" y="160" width="332" height="18" rx="6" />
      <rect className="welcome-bench-leg" x="58" y="178" width="12" height="44" />
      <rect className="welcome-bench-leg" x="330" y="178" width="12" height="44" />
      <rect className="welcome-floor" x="0" y="222" width="400" height="8" />

      {/* tray of cookies */}
      <rect className="welcome-tray" x="146" y="146" width="122" height="14" rx="4" />
      {TRAY_COOKIES.map(cx => (
        <g key={cx}>
          <path className="welcome-cookie" d={`M${cx - 11} 146 Q${cx - 11} 128 ${cx} 128 Q${cx + 11} 128 ${cx + 11} 146 Z`} />
          <path className="welcome-cookie-shade" d={`M${cx - 4} 146 L${cx} 138 L${cx + 4} 146 Z`} />
        </g>
      ))}

      {/* inspection torch with its beam */}
      <polygon className="welcome-beam" points="102,128 74,84 132,84" />
      <rect className="welcome-torch-head" x="94" y="124" width="16" height="10" rx="3" />
      <rect className="welcome-torch" x="96" y="132" width="12" height="28" rx="4" />

      {/* food dome */}
      <g className="welcome-dome">
        <rect className="welcome-plate" x="290" y="152" width="66" height="8" rx="4" />
        <path className="welcome-dome-body" d="M294 152 Q294 116 323 116 Q352 116 352 152 Z" />
        <circle className="welcome-dome-knob" cx="323" cy="112" r="6" />
      </g>
    </svg>
  );
}

// Training -> Workstation, with Training highlighted (also used by AppointmentScreen.js)
export function TrainingPath() {
  return (
    <div className="welcome-path" aria-hidden="true">
      <div className="welcome-node active">
        <span className="welcome-node-icon"><ChefHatIcon /></span>
        <span className="welcome-node-label">Training</span>
      </div>
      <span className="welcome-path-line" />
      <div className="welcome-node">
        <span className="welcome-node-icon"><DomeIcon /></span>
        <span className="welcome-node-label">Workstation</span>
      </div>
    </div>
  );
}

export default function WelcomeScreen({ onReady }) {
  return (
    <FactoryFront>
      <Ledger
        kicker="Your apron's ready. Let's get you trained."
        centered
        icon={SEAL_ICONS.hat}
        title="Welcome to the Fortune Cookie Factory!"
        subtitle="Training first, then your own workstation."
        footer={<LedgerButton onClick={onReady}>I am Ready</LedgerButton>}
      >
        <div className="ff-scene">
          <WorkstationScene />
        </div>

        <p className="ff-text">
          You will be undergoing your training before moving on to your posting at your workstation.
        </p>

        <TrainingPath />
      </Ledger>
    </FactoryFront>
  );
}
