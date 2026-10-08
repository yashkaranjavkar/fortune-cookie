import React, { useState, useEffect } from 'react';
import InvalidURLExplainer from './InvalidURLExplainer';
import { RulesLayout, BalloonRefresherScreen } from './RulesScreens';
import './EventScreen.css';
import './Level2GameInstructions.css';

// Level 3 rules screens: the Fortunery storefront + ledger card (RulesScreens.js)
const L3Layout = ({ stepIndex, totalSteps, onBack, onNext, title, children }) => (
  <RulesLayout level={3} title={title} step={stepIndex} steps={totalSteps} onBack={stepIndex > 0 ? onBack : undefined} onNext={onNext}>
    {children}
  </RulesLayout>
);

// Same balloons-over-crates scene as Levels 1 and 2, with 6 crates for the 6-batch order.
const EVT3_BALLOONS = [
  { cx: 70, color: 'var(--pink-base)', delay: '0s' },
  { cx: 210, color: 'var(--yellow-base)', delay: '0.45s' },
  { cx: 350, color: 'var(--orange-base)', delay: '0.9s' }
];
const EVT3_CRATES = [16, 86, 156, 226, 296, 366];

function EventThreeScene() {
  return (
    <svg className="evt-svg" viewBox="0 0 420 150" role="img"
         aria-label="Balloons over six packed batches of fortune cookies, ready for a farewell party bulk order">
      {EVT3_BALLOONS.map(b => (
        <g key={b.cx} className="evt-balloon" style={{ animationDelay: b.delay }}>
          <path className="evt-balloon-string" d={`M${b.cx} 48 L${b.cx} 68`} />
          <ellipse className="evt-balloon-body" cx={b.cx} cy="26" rx="14" ry="18" style={{ fill: b.color }} />
          <path className="evt-balloon-shine" d={`M${b.cx - 6} 18 Q${b.cx - 8} 24 ${b.cx - 4} 28`} />
        </g>
      ))}

      <rect className="evt-shelf" x="10" y="122" width="400" height="8" rx="3" />

      {EVT3_CRATES.map((x, i) => (
        <g key={x}>
          <rect className="evt-crate-body" x={x} y="78" width="38" height="44" rx="4" />
          <rect className="evt-crate-lid" x={x - 3} y="78" width="44" height="9" rx="3" />
          <rect className="evt-crate-ribbon-v" x={x + 15} y="78" width="8" height="44" />
          <rect className="evt-crate-ribbon-h" x={x} y="96" width="38" height="8" />
          <circle className="evt-crate-tag" cx={x + 19} cy="100" r="8" />
          <text className="evt-crate-tag-text" x={x + 19} y="103" textAnchor="middle">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

// SCREEN 1: Event 3
export function EventThreeScreen({ onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Event 3 - Farewell Party" onNext={onNext}>
      <div className="evt-scene">
        <EventThreeScene />
      </div>

      <p className="evt-lead">A bulk order just came in for a farewell party.</p>

      <div className="evt-stats">
        <div className="evt-stat">
          <span className="evt-stat-num">600</span>
          <span className="evt-stat-label">Fortune cookies</span>
        </div>
        <span className="evt-divider" aria-hidden="true" />
        <div className="evt-stat">
          <span className="evt-stat-num">6</span>
          <span className="evt-stat-label">Batches</span>
        </div>
      </div>

      <p className="evt-task">At the start, 6 samples will be placed in front of you &mdash; spot the <strong>doped fortune(s)</strong>.</p>
    </L3Layout>
  );
}

// SCREEN 2: Context + URL
export function FortuneElementsThreeScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <div className="black-label">A fortune has 2 parts: context and URL</div>
        <div className="fortune-box">
          <span className="context-highlight">The brand new trailer of your favorite movie is soon going to stream on</span>
          {' '}
          <span className="url-highlight">https://www.youtube.com/</span>
        </div>
        <div className="l2-legend">
          <span className="l2-legend-item"><span className="l2-legend-swatch context" /> Context</span>
          <span className="l2-legend-item"><span className="l2-legend-swatch url" /> URL</span>
        </div>
      </div>
    </L3Layout>
  );
}

// SCREEN 3: Valid vs Faulty
export function ValidFaultyThreeScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <p className="rule-text">1. Valid URL + context that matches it = valid fortune.</p>

        <div className="valid-box">
          <span className="valid-label">Valid</span>
          <div className="fortune-box">
            The brand new trailer of your favorite movie is soon going to stream on https://www.youtube.com/
          </div>
        </div>

        <div className="faulty-box">
          <span className="faulty-label">Faulty</span>
          <div className="fortune-box">
            Your favorite artist has uploaded their new album on <span className="red-highlight">http://www.youtude.com/</span>
          </div>
        </div>
      </div>
    </L3Layout>
  );
}

// SCREEN 4: Invalid URL, but context matters - a warning about a fake link is still valid
export function ContextMatchesInvalidScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <p className="rule-text">2. Even an invalid URL is fine if the fortune is warning you about it.</p>

        <div className="faulty-box">
          <span className="faulty-label">Faulty</span>
          <div className="fortune-box">
            Your favorite artist has uploaded their new album on <span className="red-highlight">http://www.youtude.com/</span>
          </div>
        </div>

        <div className="valid-box">
          <span className="valid-label">Valid</span>
          <div className="fortune-box">
            Avoid clicking on links like <span className="red-highlight">http://www.youtude.com/</span> to watch a video
          </div>
        </div>

        <p className="l2-shared-note">Same fake URL both times &mdash; one promotes it, the other warns you away from it.</p>
      </div>
    </L3Layout>
  );
}

// One continuous morph (URL -> split -> tiles), same as Levels 1 and 2.
export function InvalidURLThreeSequence({ onBack, onNext, stepIndex, totalSteps }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 700);
    const timer2 = setTimeout(() => setStage(2), 1200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <L3Layout
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Identifying invalid URL"
      onBack={stage === 2 ? onBack : undefined}
      onNext={stage === 2 ? onNext : undefined}
    >
      <div className="center-content ue-scene">
        <InvalidURLExplainer stage={stage} />
      </div>
    </L3Layout>
  );
}

// SCREEN 8: Balloons
export function BalloonsThreeScreen({ onReplay, onNext }) {
  return <BalloonRefresherScreen level={3} onReplay={onReplay} onNext={onNext} />;
}
