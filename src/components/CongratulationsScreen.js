import React from 'react';

// Confetti in the celebration tones of the design system (pink, yellow, orange, green)
const CONFETTI_COLORS = [
  'var(--pink-base)', 'var(--yellow-base)', 'var(--orange-light)',
  'var(--pink-light)', 'var(--yellow-light)', 'var(--green-light)'
];
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37 + 8) % 100}%`,
  delay: `${((i * 0.83) % 6).toFixed(2)}s`,
  duration: `${(6.5 + (i % 5) * 0.9).toFixed(1)}s`,
  size: 7 + (i % 3) * 3,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
  spin: `${(i % 2 ? 1 : -1) * (240 + (i % 4) * 90)}deg`
}));

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

function OfferScene() {
  return (
    <svg className="cong-svg" viewBox="0 0 360 230" role="img"
         aria-label="An envelope opening to reveal an offer letter for the Fortune Cookie Inspector role, stamped with a seal">
      {/* slowly turning rays behind the envelope */}
      <g className="cong-rays">
        {RAYS.map(a => (
          <polygon key={a} points="180,120 170,10 190,10" transform={`rotate(${a} 180 120)`} />
        ))}
      </g>
      <circle className="cong-glow" cx="180" cy="120" r="84" />

      {/* envelope: inside, then letter, then front pocket, then flap */}
      <rect className="cong-env-back" x="70" y="110" width="220" height="100" rx="8" />
      <polygon className="cong-flap-back" points="70,110 290,110 180,48" />

      <g transform="translate(92 140)">
        <g className="cong-letter">
          <rect className="cong-sheet" x="0" y="0" width="176" height="150" rx="6" />
          <text className="cong-letter-head" x="88" y="19" textAnchor="middle">OFFER LETTER</text>
          <line className="cong-letter-rule" x1="14" y1="28" x2="162" y2="28" />
          <text className="cong-letter-role" x="14" y="50">Fortune Cookie</text>
          <text className="cong-letter-role" x="14" y="68">Inspector</text>
          <rect className="cong-letter-line" x="14" y="78" width="80" height="5" rx="2.5" />

          {/* wax seal stamped on last */}
          <g className="cong-seal">
            <circle className="cong-seal-body" cx="138" cy="56" r="19" />
            <circle className="cong-seal-ring" cx="138" cy="56" r="13" />
            <path className="cong-seal-cookie" d="M130 58 Q130 48 138 48 Q146 48 146 58 Q142 64 138 63 Q134 63 130 58 Z" />
          </g>
        </g>
      </g>

      <rect className="cong-env-front" x="70" y="128" width="220" height="82" rx="8" />
      <path className="cong-env-fold" d="M70 132 L180 186 L290 132" />
      <polygon className="cong-flap-front" points="70,110 290,110 180,176" />
    </svg>
  );
}

export default function CongratulationsScreen({ onAccept }) {
  return (
    <div className="flow-screen">
      <div className="flow-card cong-card">
        <div className="cong-confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className={c.round ? 'round' : ''}
              style={{
                left: c.left, width: c.size, height: c.round ? c.size : c.size * 1.6,
                background: c.color, animationDelay: c.delay, animationDuration: c.duration,
                '--spin': c.spin
              }}
            />
          ))}
        </div>

        <div className="flow-body centered cong-body">
          <div className="cong-scene">
            <OfferScene />
          </div>

          <div className="title">Congratulations !</div>
          <p>
            You have been selected as an Inspector in The Fortune Cookie Factory.<br/>
            Click on the Accept button to accept the this offer.
          </p>
        </div>

        <button className="next-btn cong-accept" onClick={onAccept}>Accept</button>
      </div>
    </div>
  );
}
