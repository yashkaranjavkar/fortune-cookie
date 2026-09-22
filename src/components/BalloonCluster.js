import React from 'react';
import './BalloonCluster.css';

const BALLOONS = [
  { key: 'orange', cx: 22, cy: 52, rx: 22, ry: 27, fill: 'var(--orange-base)' },
  { key: 'pink', cx: 56, cy: 40, rx: 25, ry: 31, fill: 'var(--pink-base)' },
  { key: 'green', cx: 92, cy: 54, rx: 21, ry: 26, fill: 'var(--green-base)' }
];

// Three clickable balloons, top-left corner of a sorting game. Each pop opens the
// rules overlay and uses up one of a fixed number of chances (tracked by the caller).
export default function BalloonCluster({ popped, onPop, usesLeft }) {
  return (
    <div className="l1-balloons-wrap">
      <svg className="l1-balloons" viewBox="0 0 128 106" role="img" aria-label="Three balloons - pop one to review the sorting rules">
        <path className="l1-balloon-string" d="M22 78 Q38 92 56 98" />
        <path className="l1-balloon-string" d="M92 80 Q74 94 56 98" />
        <path className="l1-balloon-string" d="M56 70 L56 98" />
        {BALLOONS.map(b => (
          !popped[b.key] && (
            <g
              key={b.key}
              className="l1-balloon"
              onClick={() => onPop(b.key)}
              role="button"
              tabIndex={0}
              aria-label={`Pop the ${b.key} balloon to review the rules`}
            >
              <ellipse className="l1-balloon-body" cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} style={{ fill: b.fill }} />
              <path className="l1-balloon-shine" d={`M${b.cx - 7} ${b.cy - 14} Q${b.cx - 11} ${b.cy - 6} ${b.cx - 5} ${b.cy - 1}`} />
            </g>
          )
        ))}
      </svg>
      {usesLeft > 0 && <div className="l1-balloons-count">{usesLeft} left</div>}
    </div>
  );
}
