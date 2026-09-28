import React, { useState, useEffect } from 'react';
import InvalidURLExplainer from './InvalidURLExplainer';
import NavRoundButton from './NavRoundButton';
import { useCurrency } from '../utils/currency';
import { playSound } from '../sounds';
import cookieIntact from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-whole.svg';
import cookieBroken from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-broken.svg';
import balloons3Left from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-3-left.svg';
import balloonsPopped from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-popped.svg';

// Shared Level 1 Layout - Back/Forward round-icon buttons flank the card
// (wisecrack kit style), instead of the old inline text links inside its footer.
// A blank spacer takes a missing button's place so the card never shifts sideways
// depending on whether that particular screen has a Back (or, in principle, a Next).
const LevelOneLayout = ({ title, onBack, onNext, children }) => (
  <div className="level-one-screen">
    <div className="level-one-card-row">
      {onBack
        ? <NavRoundButton direction="back" onClick={onBack} label="Back" />
        : <span className="nav-round-spacer" aria-hidden="true" />}

      <div className="level-one-card">
        <div className="level-one-title">{title}</div>
        <div className="level-one-content">
          {children}
        </div>
      </div>

      {onNext
        ? <NavRoundButton direction="forward" onClick={onNext} label="Forward" dataSound="progress-munch" />
        : <span className="nav-round-spacer" aria-hidden="true" />}
    </div>
  </div>
);

// Screen 1: Payment for sorting - rewards explainer
const REWARD_CASES = [
  {
    key: 'correct', kind: 'earn', amount: '+', value: 1000,
    title: 'Sorting out one faulty or valid fortune',
    note: 'Right tray, right call',
    icons: [cookieIntact, cookieBroken]
  },
  {
    key: 'faulty-as-valid', kind: 'lose', amount: '−', value: 800,
    title: 'Sorting out one faulty fortune as valid',
    note: 'A faulty one slipped through',
    icons: [cookieBroken]
  },
  {
    key: 'valid-as-faulty', kind: 'lose', amount: '−', value: 500,
    title: 'Sorting out one valid fortune as faulty',
    note: 'A good one was turned away',
    icons: [cookieIntact]
  }
];

export function PaymentScreen({ onBack, onNext }) {
  const currency = useCurrency();
  return (
    <LevelOneLayout title="Payment for sorting" onBack={onBack} onNext={onNext}>
      <div className="reward-screen">
        <div className="reward-hero">
          <div className={`reward-coin${currency.length > 1 ? ' wide' : ''}`} aria-hidden="true">{currency}</div>
          <div className="reward-hero-text">
            <div className="reward-headline">Every sort counts towards your incentive</div>
            <div className="reward-sub">Your running total changes with each fortune you place.</div>
          </div>
        </div>

        <div className="reward-list">
          {REWARD_CASES.map((c, i) => (
            <div key={c.key} className={`reward-card reward-${c.kind}`} style={{ animationDelay: `${0.12 + i * 0.1}s` }}>
              <div className="reward-icons">
                {c.icons.map((src, n) => <img key={n} src={src} alt="" />)}
              </div>
              <div className="reward-info">
                <div className="reward-title">{c.title}</div>
                <div className="reward-note">{c.note}</div>
              </div>
              <div className="reward-amount">{c.amount} {currency}{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </LevelOneLayout>
  );
}

// Screen 2: URLs are part of fortunes
export function URLsPartScreen({ onBack, onNext }) {
  return (
    <LevelOneLayout title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <div className="black-label">URLs are part of the fortunes</div>
        <div className="fortune-box">
          The brand new trailer of your favorite movie is soon going to stream on <span className="url-highlight">https://www.youtube.com/</span>
          <span className="url-arrow">← URL</span>
        </div>
      </div>
    </LevelOneLayout>
  );
}

// Screen 3: Valid URL Rule
export function ValidRuleScreen({ onBack, onNext }) {
  return (
    <LevelOneLayout title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <p className="rule-text">1. If the URL mentioned in the fortune is correct then the fortune is valid.</p>
        <div className="valid-box">
          <span className="valid-label">Valid</span>
          <div className="fortune-box">
            The brand new trailer of your favorite movie is soon going to stream on https://www.youtube.com/
          </div>
        </div>
      </div>
    </LevelOneLayout>
  );
}

// Screen 4: Invalid URL Initial
export function InvalidInitialScreen({ onBack, onNext }) {
  return (
    <LevelOneLayout title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <p className="large-url">https://gtms.ultimatix.net</p>
      </div>
    </LevelOneLayout>
  );
}

export function InvalidURLSequence({ onBack, onNext }) {
  const [stage, setStage] = useState(0); // 0: Initial, 1: Split, 2: Logic

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 700); // plain URL
    const timer2 = setTimeout(() => setStage(2), 1200); // split apart, then tiles

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <LevelOneLayout
      title="Identifying invalid URL"
      // Hide buttons until the last stage
      onBack={stage === 2 ? onBack : undefined}
      onNext={stage === 2 ? onNext : undefined}
    >
      {/* One persistent scene: the URL splits into its parts, which become the tiles below */}
      <div className="center-content ue-scene">
        <InvalidURLExplainer stage={stage} />
      </div>
    </LevelOneLayout>
  );
}
// Screen 7: Valid vs Faulty
export function ValidVsFaultyScreen({ onBack, onNext }) {
  return (
    <LevelOneLayout title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="center-content">
        <p className="rule-text">1. If the URL mentioned in the fortune is correct then the fortune is valid.</p>
        <p className="rule-text">2. And if the URL is invalid then the fortune is faulty.</p>
        
        <div className="valid-box">
          <span className="valid-label">Valid</span>
          <div className="fortune-box">
            The brand new trailer of your favorite movie is soon going to stream on https://www.youtube.com/
          </div>
        </div>
        
        <div className="faulty-box">
          <span className="faulty-label">Faulty</span>
          <div className="fortune-box">
            The brand new trailer of your favorite movie is soon going to stream on <span className="red-highlight">http://www.yourtube.com/</span>
          </div>
        </div>
      </div>
    </LevelOneLayout>
  );
}

// Screen 8: Balloons
export function BalloonScreen({ onReplay, onNext }) {
  const [popped, setPopped] = useState(false);

  const handlePop = () => {
    setPopped(true);
    playSound('balloon-pop');
    setTimeout(() => {
      onReplay();
    }, 500);
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