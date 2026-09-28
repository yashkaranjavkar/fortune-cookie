import React, { useState, useEffect } from 'react';
import InvalidURLExplainer from './InvalidURLExplainer';
import NavRoundButton from './NavRoundButton';
import { playSound } from '../sounds';
import balloons3Left from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-3-left.svg';
import balloonsPopped from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-popped.svg';
import './EventScreen.css';
import './Level2GameInstructions.css';

// Back/Forward round-icon buttons flank the card (same pattern as LevelOneInstructions.js's
// LevelOneLayout) instead of a top-left back arrow + a Next button inside the card - kept
// consistent across every level's rules flow. A spacer takes a missing button's place so
// the card never shifts sideways depending on whether that screen has a Back.
const L2Layout = ({ stepIndex, totalSteps, onBack, onNext, title, children }) => (
  <div className="instruction-screen">
    <div className="level-card-row">
      {onBack && stepIndex > 0
        ? <NavRoundButton direction="back" onClick={onBack} label="Back" />
        : <span className="nav-round-spacer" aria-hidden="true" />}

      <div className="instruction-card">
        {title && <div className="title">{title}</div>}
        <div className="l2-content-area">
          {children}
        </div>
      </div>

      {onNext
        ? <NavRoundButton direction="forward" onClick={onNext} label="Forward" dataSound="progress-munch" />
        : <span className="nav-round-spacer" aria-hidden="true" />}
    </div>
    <div className="instruction-progress-bar">
      <div className="progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}></div>
    </div>
  </div>
);

// Same balloons-over-crates scene as Level 1's Event screen, just with 5 crates for
// the 5-batch farewell order instead of 4.
const EVT2_BALLOONS = [
  { cx: 60, color: 'var(--pink-base)', delay: '0s' },
  { cx: 200, color: 'var(--yellow-base)', delay: '0.45s' },
  { cx: 340, color: 'var(--orange-base)', delay: '0.9s' }
];
const EVT2_CRATES = [20, 88, 156, 224, 292];

function EventTwoScene() {
  return (
    <svg className="evt-svg" viewBox="0 0 400 150" role="img"
         aria-label="Balloons over five packed batches of fortune cookies, ready for a farewell party bulk order">
      {EVT2_BALLOONS.map(b => (
        <g key={b.cx} className="evt-balloon" style={{ animationDelay: b.delay }}>
          <path className="evt-balloon-string" d={`M${b.cx} 48 L${b.cx} 68`} />
          <ellipse className="evt-balloon-body" cx={b.cx} cy="26" rx="14" ry="18" style={{ fill: b.color }} />
          <path className="evt-balloon-shine" d={`M${b.cx - 6} 18 Q${b.cx - 8} 24 ${b.cx - 4} 28`} />
        </g>
      ))}

      <rect className="evt-shelf" x="14" y="122" width="372" height="8" rx="3" />

      {EVT2_CRATES.map((x, i) => (
        <g key={x}>
          <rect className="evt-crate-body" x={x} y="78" width="48" height="44" rx="4" />
          <rect className="evt-crate-lid" x={x - 3} y="78" width="54" height="9" rx="3" />
          <rect className="evt-crate-ribbon-v" x={x + 20} y="78" width="8" height="44" />
          <rect className="evt-crate-ribbon-h" x={x} y="96" width="48" height="8" />
          <circle className="evt-crate-tag" cx={x + 24} cy="100" r="8" />
          <text className="evt-crate-tag-text" x={x + 24} y="103" textAnchor="middle">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

export function EventTwoScreen({ onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Event 2 - Farewell Party" onNext={onNext}>
      <div className="evt-scene">
        <EventTwoScene />
      </div>

      <p className="evt-lead">A bulk order just came in for a farewell party.</p>

      <div className="evt-stats">
        <div className="evt-stat">
          <span className="evt-stat-num">500</span>
          <span className="evt-stat-label">Fortune cookies</span>
        </div>
        <span className="evt-divider" aria-hidden="true" />
        <div className="evt-stat">
          <span className="evt-stat-num">5</span>
          <span className="evt-stat-label">Batches</span>
        </div>
      </div>

      <p className="evt-task">At the start, 5 samples will be placed in front of you &mdash; spot the <strong>doped fortune(s)</strong>.</p>
    </L2Layout>
  );
}

export function FortuneElementsScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
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
    </L2Layout>
  );
}

export function ContextValidFaultyScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
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
    </L2Layout>
  );
}

// One continuous morph (URL -> split -> tiles), same as Level 1's InvalidURLSequence,
// instead of three separate screens the player has to click through.
export function InvalidURLSequenceTwo({ onBack, onNext, stepIndex, totalSteps }) {
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
    <L2Layout
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Identifying invalid URL"
      onBack={stage === 2 ? onBack : undefined}
      onNext={stage === 2 ? onNext : undefined}
    >
      <div className="center-content ue-scene">
        <InvalidURLExplainer stage={stage} />
      </div>
    </L2Layout>
  );
}

export function ContextUnrelatedScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <p className="rule-text">2. Context unrelated to the URL &mdash; even a real one &mdash; is still faulty.</p>

        <div className="faulty-box">
          <span className="faulty-label">Faulty</span>
          <div className="fortune-box">
            You will make your payments safer with the help of <span className="red-highlight">https://www.youttube.com/</span>
          </div>
        </div>

        <div className="faulty-box">
          <span className="faulty-label">Faulty</span>
          <div className="fortune-box">
            You have saved enough money to buy your shoes from <span className="red-highlight">http://www.youttube.com/</span>
          </div>
        </div>

        <p className="l2-shared-note">Both URLs belong to a real streaming site &mdash; but neither fortune is actually about streaming.</p>
      </div>
    </L2Layout>
  );
}

export function BalloonsTwoScreen({ onReplay, onNext }) {
  const [popped, setPopped] = useState(false);

  const handlePop = () => {
    setPopped(true);
    playSound('balloon-pop');
    setTimeout(() => onReplay(), 500);
  };

  return (
    <div className="balloon-full-screen">
      <button
        type="button"
        className="balloon-container"
        onClick={handlePop}
        aria-label="Pop the balloons"
        data-sound="none"
      >
        <img src={popped ? balloonsPopped : balloons3Left} alt="" className="balloon-cluster-img" />
      </button>
      <p className="balloon-text">
        You will get <strong>three chances</strong> to go through these instructions<br/>
        again if you need, by popping these three balloons
      </p>
      <button className="orange-btn" onClick={onNext}>Next</button>
    </div>
  );
}
