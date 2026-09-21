import React from 'react';

// Phosphor-style line icons, drawn inline so no extra dependency is needed
const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);
const HourglassIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h12M6 21h12M7 3v3.5a5 5 0 0 0 2 4l3 1.5-3 1.5a5 5 0 0 0-2 4V21M17 3v3.5a5 5 0 0 1-2 4L12 12l3 1.5a5 5 0 0 1 2 4V21" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z" />
  </svg>
);

const TRACK = [
  { key: 'application', label: 'Application', state: 'done', Icon: FileIcon },
  { key: 'review', label: 'Review', state: 'active', Icon: HourglassIcon },
  { key: 'shortlisting', label: 'Shortlisting', state: 'pending', Icon: StarIcon }
];

const SPARKLES = [
  { x: 298, y: 44, d: 0 }, { x: 322, y: 100, d: 0.9 }, { x: 52, y: 40, d: 0.5 }, { x: 34, y: 96, d: 1.4 }
];

function ApplicationScene() {
  return (
    <svg className="thanks-svg" viewBox="0 0 360 200" role="img"
         aria-label="A completed application form for the Fortune Cookie Inspector role, stamped with a seal, beside a fortune cookie">
      <circle className="thanks-glow" cx="180" cy="100" r="92" />

      {SPARKLES.map(s => (
        <path key={`${s.x}-${s.y}`} className="thanks-sparkle" style={{ animationDelay: `${s.d}s` }}
              d={`M${s.x} ${s.y - 9} Q${s.x} ${s.y} ${s.x + 9} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y + 9} Q${s.x} ${s.y} ${s.x - 9} ${s.y} Q${s.x} ${s.y} ${s.x} ${s.y - 9} Z`} />
      ))}

      {/* fortune cookie with its paper strip */}
      <g className="thanks-cookie">
        <rect className="thanks-strip" x="34" y="120" width="60" height="14" rx="1.5" transform="rotate(-12 64 127)" />
        <path className="thanks-cookie-body" d="M22 160 Q20 132 56 130 Q92 130 92 158 Q80 178 56 176 Q34 176 22 160 Z" />
        <path className="thanks-cookie-inner" d="M34 158 Q36 142 56 142 Q76 142 80 158 Q70 168 56 167 Q44 167 34 158 Z" />
      </g>

      {/* application form */}
      <g className="thanks-paper">
        <rect className="thanks-sheet" x="100" y="12" width="164" height="176" rx="10" />
        <path className="thanks-head" d="M100 22 a10 10 0 0 1 10 -10 h144 a10 10 0 0 1 10 10 v20 h-164 Z" />
        <text className="thanks-head-text" x="182" y="31" textAnchor="middle">FCI APPLICATION</text>

        <circle className="thanks-avatar-bg" cx="128" cy="68" r="15" />
        <circle className="thanks-avatar" cx="128" cy="63" r="5.5" />
        <path className="thanks-avatar" d="M117 78 Q128 66 139 78 Z" />
        <rect className="thanks-line" x="152" y="58" width="88" height="7" rx="3.5" />
        <rect className="thanks-line" x="152" y="72" width="60" height="7" rx="3.5" />

        <rect className="thanks-line soft" x="116" y="100" width="132" height="6" rx="3" />
        <rect className="thanks-line soft" x="116" y="113" width="132" height="6" rx="3" />
        <rect className="thanks-line soft" x="116" y="126" width="104" height="6" rx="3" />

        <rect className="thanks-role" x="116" y="152" width="112" height="20" rx="10" />
        <text className="thanks-role-text" x="172" y="165.5" textAnchor="middle">Fortune Cookie Inspector</text>
      </g>

      {/* wax seal with a cookie mark - stamped on after the form arrives */}
      <g className="thanks-seal">
        <circle className="thanks-seal-pulse" cx="240" cy="150" r="28" />
        <path className="thanks-seal-edge"
              d="M240 120 l6 4 7-1 4 6 7 2 1 7 5 5-3 7 1 7-6 4-2 7-7 1-5 5-7-3-7 3-5-5-7-1-2-7-6-4 1-7-3-7 5-5 1-7 7-2 4-6 7 1 z" />
        <circle className="thanks-seal-ring" cx="240" cy="150" r="20" />
        <path className="thanks-seal-cookie" d="M228 152 Q228 140 240 140 Q252 140 252 152 Q246 160 240 159 Q233 159 228 152 Z" />
      </g>
    </svg>
  );
}

export default function ThankYouScreen({ onNext }) {
  return (
    <div className="flow-screen">
      <div className="flow-card thanks-card">
        <div className="flow-body centered thanks-body">
          <div className="thanks-scene">
            <ApplicationScene />
          </div>

          <div className="title">Thank you !</div>
          <p>
            You have successfully completed your application at The Fortune Cookie Bakery as a Fortune cookies Inspector.
            We will shortly get to know about your shortlisting for the role.
          </p>

          <ol className="thanks-track">
            {TRACK.map(({ key, label, state, Icon }) => (
              <li key={key} className={`thanks-step ${state}`}>
                <span className="thanks-step-icon"><Icon /></span>
                <span className="thanks-step-label">{label}</span>
              </li>
            ))}
          </ol>
        </div>

        <button className="next-btn" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}
