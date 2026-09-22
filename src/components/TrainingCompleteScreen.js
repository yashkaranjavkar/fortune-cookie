import React from 'react';
import './TrainingCompleteScreen.css';

// Shown right after the tray/fortune training zone, before the sorting instructions begin.

const SPARKLES = [
  { x: 300, y: 40, d: 0 }, { x: 326, y: 96, d: 0.9 }, { x: 44, y: 36, d: 0.5 }, { x: 24, y: 92, d: 1.4 }
];

const TRAY_COOKIES = [148, 176, 204, 232];

function CompleteScene() {
  return (
    <svg className="tc-svg" viewBox="0 0 360 200" role="img"
         aria-label="A tray of fortune cookies with a ribbon banner reading training complete">
      <circle className="tc-glow" cx="180" cy="100" r="92" />

      {SPARKLES.map(s => (
        <path key={`${s.x}-${s.y}`} className="tc-sparkle" style={{ animationDelay: `${s.d}s` }}
              d={`M${s.x} ${s.y - 9} Q${s.x} ${s.y} ${s.x + 9} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y + 9} Q${s.x} ${s.y} ${s.x - 9} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y - 9} Z`} />
      ))}

      {/* ribbon banner */}
      <g className="tc-ribbon">
        <polygon className="tc-ribbon-tail" points="112,30 128,30 118,52 104,52" />
        <polygon className="tc-ribbon-tail" points="232,30 248,30 256,52 242,52" />
        <rect className="tc-ribbon-band" x="96" y="16" width="168" height="30" rx="6" />
        <text className="tc-ribbon-text" x="180" y="36" textAnchor="middle">TRAINING COMPLETE</text>
      </g>

      {/* bench + tray of cookies */}
      <rect className="tc-bench" x="60" y="150" width="240" height="16" rx="6" />
      <rect className="tc-bench-leg" x="80" y="166" width="10" height="26" />
      <rect className="tc-bench-leg" x="270" y="166" width="10" height="26" />

      <rect className="tc-tray" x="130" y="136" width="120" height="14" rx="4" />
      {TRAY_COOKIES.map(cx => (
        <g key={cx}>
          <path className="tc-cookie" d={`M${cx - 12} 136 Q${cx - 12} 116 ${cx} 116 Q${cx + 12} 116 ${cx + 12} 136 Z`} />
          <path className="tc-cookie-shade" d={`M${cx - 4} 136 L${cx} 127 L${cx + 4} 136 Z`} />
        </g>
      ))}

      {/* rolling pin propped beside the tray, training tools set down */}
      <g className="tc-pin">
        <rect className="tc-pin-body" x="44" y="144" width="56" height="12" rx="6" transform="rotate(-18 72 150)" />
        <circle className="tc-pin-handle" cx="40" cy="130" r="6" />
        <circle className="tc-pin-handle" cx="98" cy="163" r="6" />
      </g>
    </svg>
  );
}

export default function TrainingCompleteScreen({ onNext }) {
  return (
    <div className="flow-screen">
      <div className="flow-card tc-card">
        <div className="flow-body centered tc-body">
          <div className="tc-scene">
            <CompleteScene />
          </div>

          <div className="title">Good job!</div>
          <p>
            You have completed your training at the Fortune Cookie Bakery.<br />
            You&rsquo;re now ready to move to the sorting floor for your first shift.
          </p>
        </div>

        <button className="next-btn" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}
