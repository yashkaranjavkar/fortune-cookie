import React from 'react';
import cookie from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-whole.svg';
import FactoryFront, { Ledger, LedgerButton, SEAL_ICONS } from './FactoryFront';

// Storyboard: graduate -> applies to the factory -> the Inspector role
const STORY = [
  {
    title: 'Fresh out of bakery school',
    text: 'You have just graduated from your culinary bakery education.'
  },
  {
    title: 'A renowned factory',
    text: 'You are looking for a job and applied to a renowned Fortune Cookie Factory.'
  },
  {
    title: 'The role: Inspector',
    text: 'You are applying for a role of Fortune Cookie Inspector (FCI). FCI inspects the quality of the fortune cookie and the fortune inside it.'
  }
];

// Cookies riding the conveyor belt (negative delays so the belt is already full on arrival)
const BELT_DELAYS = [0, -2.5, -5, -7.5];

function FactoryScene() {
  return (
    <svg className="intro-svg" viewBox="0 0 800 230" role="img"
         aria-label="A graduate's cap and diploma, a fortune cookie factory, and an application letter">
      <defs>
        <linearGradient id="intro-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--yellow-light)' }} />
          <stop offset="1" style={{ stopColor: 'var(--beige-elevated)' }} />
        </linearGradient>
        <clipPath id="intro-clip"><rect width="800" height="230" rx="18" /></clipPath>
      </defs>

      <g clipPath="url(#intro-clip)">
        <rect width="800" height="230" fill="url(#intro-sky)" />
        <circle className="intro-sun" cx="400" cy="126" r="96" />

        {/* Dotted paths: graduate -> factory <- application */}
        <path className="intro-path" d="M182 112 Q 226 84 262 118" />
        <path className="intro-path" d="M646 128 Q 592 92 540 128" />

        {/* Factory */}
        <g>
          <rect className="intro-chimney" x="485" y="34" width="24" height="56" />
          <rect className="intro-chimney-cap" x="481" y="28" width="32" height="9" rx="3" />
          <circle className="intro-steam s1" cx="497" cy="22" r="8" />
          <circle className="intro-steam s2" cx="497" cy="22" r="8" />
          <circle className="intro-steam s3" cx="497" cy="22" r="8" />

          <polygon className="intro-roof" points="270,90 270,58 335,90 335,58 400,90 400,58 465,90 465,58 530,90" />
          <rect className="intro-wall" x="270" y="88" width="260" height="100" />

          <rect className="intro-sign" x="298" y="102" width="204" height="46" rx="9" />
          <text className="intro-sign-text small" x="400" y="121" textAnchor="middle">FORTUNE COOKIE</text>
          <text className="intro-sign-text" x="400" y="140" textAnchor="middle">FACTORY</text>

          <rect className="intro-window" x="286" y="158" width="30" height="20" rx="3" />
          <rect className="intro-window" x="326" y="158" width="30" height="20" rx="3" />
          <rect className="intro-window" x="444" y="158" width="30" height="20" rx="3" />
          <rect className="intro-window" x="484" y="158" width="30" height="20" rx="3" />
          <path className="intro-door" d="M384 188 V166 a16 16 0 0 1 32 0 V188 Z" />
        </g>

        {/* Ground + conveyor belt */}
        <rect className="intro-ground" x="0" y="188" width="800" height="42" />
        <rect className="intro-belt" x="0" y="184" width="800" height="10" />
        <line className="intro-belt-dash" x1="0" y1="189" x2="800" y2="189" />
        {BELT_DELAYS.map((d, i) => (
          <image key={i} className="intro-belt-cookie" href={cookie} x="-50" y="150" width="34" height="34"
                 style={{ animationDelay: `${d}s` }} />
        ))}

        {/* Graduate: cap + diploma */}
        <g className="intro-bob">
          <polygon className="intro-cap-top" points="68,84 122,64 176,84 122,104" />
          <path className="intro-cap-base" d="M92 94 V116 Q122 130 152 116 V94 L122 104 Z" />
          <line className="intro-tassel" x1="170" y1="86" x2="170" y2="116" />
          <circle className="intro-tassel-knob" cx="170" cy="120" r="5" />
          <rect className="intro-diploma" x="86" y="146" width="70" height="20" rx="10" />
          <rect className="intro-ribbon" x="115" y="146" width="9" height="20" />
        </g>

        {/* Application letter */}
        <g className="intro-bob late">
          <rect className="intro-envelope" x="650" y="96" width="92" height="64" rx="6" />
          <path className="intro-flap" d="M651 100 L696 136 L741 100" />
          <circle className="intro-seal" cx="696" cy="136" r="11" />
          <path className="intro-seal-mark" d="M691 136 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M696 136 l4 -3" />
        </g>
      </g>
    </svg>
  );
}

export default function IntroScreen({ onNext }) {
  return (
    <FactoryFront>
      <Ledger
        kicker="Every inspector starts somewhere."
        size="lg"
        icon={SEAL_ICONS.story}
        title="Fortune Cookie Inspector"
        subtitle="How you got here, in three steps."
        footer={<LedgerButton onClick={onNext}>Next</LedgerButton>}
      >
        <div className="ff-scene ff-scene-wide">
          <FactoryScene />
        </div>

        <div className="intro-steps">
          {STORY.map((s, i) => (
            <div className="intro-step" key={s.title} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
              <span className="intro-step-num">{i + 1}</span>
              <div className="intro-step-title">{s.title}</div>
              <p className="intro-step-text">{s.text}</p>
            </div>
          ))}
        </div>
      </Ledger>
    </FactoryFront>
  );
}
