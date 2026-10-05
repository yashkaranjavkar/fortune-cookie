import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../utils/currency';
import { playSound } from '../sounds';
import { track } from '../analytics';
import { diffFortuneMarking, gradeFortuneMarking, gradeApprovedSort, gradeSort, REWARD_AMOUNT, SORT_REWARD_AMOUNT } from '../utils/fortuneGrading';
import SortTray from './SortTray';
import TimerDial from './TimerDial';
import torch from '../assets/instructions/torch.png';
import './Level2Instructions.css';
import './SampleFortune.css';

// Shared layout for light background screens
const LightLayout = ({ title, onBack, onNext, children }) => (
  <div className="instruction-screen">
    {onBack && <button className="back-btn" onClick={onBack}>←</button>}
    
    <div className="instruction-card">
      <div className="title">{title}</div>
      <div className="level2-content">
        {children}
      </div>
    </div>

    {onNext && <button className="instruction-next-btn" onClick={onNext}>Next &gt;&gt;&gt;</button>}
  </div>
);

const DarkLayout = ({ children }) => (
  <div className="inspection-room-screen">
    <div className="inspection-title">INSPECTION ROOM</div>
    {children}
  </div>
);

export function ThirtySecondsScreen({ onNext, onBack, faultyCount = 2 }) {
  const faultyPreview = Array.from({ length: faultyCount });
  return (
    <LightLayout title="You will get 30 seconds to mark all faulty fortunes" onNext={onNext} onBack={onBack}>
      <div className="timer-thirty-layout">
        <SortTray type="faulty" items={faultyPreview} />
        <TimerDial value={30} />
      </div>
      
      <div className="sample-fortune">
        Your favorite artist has uploaded their new album on <span className="invalid-url">http://www.youtube.com/</span> 🖊️
      </div>
    </LightLayout>
  );
}

export function InspectionIntroScreen({ onNext, onBack, markedFortunes }) {
  return (
    <div className="instruction-screen">
      {onBack && <button className="back-btn" onClick={onBack}>←</button>}
      
      <div className="instruction-card">
        <div className="title" style={{ textAlign: 'center' }}>
          Once you send your marked fortunes, it goes in the inspection room
        </div>
        
        <div className="level2-content">
          <div className="inspection-machine" style={{ marginTop: '20px' }}>
            <button className="machine-button torch-button" onClick={onNext} aria-label="Press the red button">
              <img src={torch} alt="Torch" className="torch-asset-img" />
            </button>
            <span className="machine-arrow">←</span>
            <span className="machine-text">Press this <b>RED</b> button</span>
          </div>

          <div className="sample-fortune" style={{ marginTop: '30px' }}>
            Your favorite artist has uploaded their new album on <span className="invalid-url">http://www.youtube.com/</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Legend copy per segment kind, matching the reference reveal screen.
const SEGMENT_LEGEND = {
  correct: { label: 'Correct identification', note: 'This part is invalid & you marked it', className: 'correct' },
  wrong: { label: 'Wrong identification', note: 'This part is not invalid but you marked it', className: 'wrong' },
  missed: { label: 'Missed', note: "This part is invalid but you didn't mark it", className: 'missed' },
};

export function TorchInspectScreen({ markedFortunes, onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [torchValue, setTorchValue] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const isRevealed = torchValue >= 95;
  const torchStarted = useRef(false);
  const currency = useCurrency();

  const fortunes = (markedFortunes && markedFortunes.length > 0)
    ? markedFortunes
    : [
        {
          fullText: "Your favorite artist has uploaded their new album on http://www.youtube.com/ 🎵",
          markedText: "http://",
          isPhishy: false,
          invalidPart: null
        }
      ];

  useEffect(() => {
    setTorchValue(0);
    torchStarted.current = false;
  }, [currentIndex]);

  const currentFortune = fortunes[currentIndex];
  const isLast = currentIndex === fortunes.length - 1;

  // Real correct/wrong/missed reveal: compares what was marked against the fortune's
  // actual invalid part (if it has one) - nothing about this is known until the torch
  // sweeps over it here.
  const segments = diffFortuneMarking(currentFortune.fullText, currentFortune, currentFortune.markedText);
  const tier = gradeFortuneMarking(currentFortune.fullText, currentFortune, currentFortune.markedText);
  const kindsShown = Array.from(new Set(segments.map(s => s.kind).filter(k => k !== 'plain')));

  const tierCounts = useRef({ correct: 0, partial: 0, wrong: 0 });
  const handleNext = () => {
    const runningTotal = totalScore + REWARD_AMOUNT[tier];
    tierCounts.current[tier] = (tierCounts.current[tier] || 0) + 1;
    track('inspection_revealed', {
      index: currentIndex,
      fortune: currentFortune.fullText,
      marked_text: currentFortune.markedText || null,
      invalid_part: currentFortune.invalidPart || null,
      tier,
      points: REWARD_AMOUNT[tier],
    });
    if (isLast) track('inspection_complete', { total_points: runningTotal, tiers: { ...tierCounts.current } });
    if (isLast) {
      onNext(runningTotal);
    } else {
      setTotalScore(runningTotal);
      setCurrentIndex(prev => prev + 1);
    }
  };

  // The strip is only lit up to where the torch has swept, with a soft glow at the leading edge.
  const litTo = Math.min(torchValue + 6, 100);
  const revealMask = `linear-gradient(to right, #000 0%, #000 ${torchValue}%, transparent ${litTo}%)`;

  return (
    <div className="inspection-room-screen ti-room">
      <div className="inspection-title">INSPECTION ROOM</div>

      <div className="torch-slide-instruction">
        <div className="torch-text"> Slide the torch light to inspect the fortune</div>
      </div>

      <div className="ti-scene">
        <div className="torch-slider-wrapper">
          <input
            type="range"
            min="0"
            max="100"
            value={torchValue}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 0 && !torchStarted.current) {
                torchStarted.current = true;
                playSound('torch-on');
              }
              setTorchValue(value);
            }}
            className="torch-slider"
          />
          <div className="torch-handle-container" style={{ left: `${torchValue}%` }}>
            <img src={torch} alt="Torch" className="ti-torch-img" />
          </div>
        </div>

        <div className="ti-strip">
          {/* Dim paper, always visible - the strip's shape/edges read in the dark, just unreadable */}
          <div className="ti-strip-dim" aria-hidden="true">
            <div className="fortune-text-content" style={{ visibility: 'hidden' }}>
              {currentFortune.fullText}
            </div>
          </div>
          {/* Bright paper + text, masked so only the torch-swept portion is legible */}
          <div
            className="ti-strip-lit fortune-paper"
            style={{ WebkitMaskImage: revealMask, maskImage: revealMask }}
          >
            <div className="fortune-text-content">
              {segments.map((seg, i) => (
                seg.kind === 'plain'
                  ? <React.Fragment key={i}>{seg.text}</React.Fragment>
                  : <span key={i} className={`highlighted-${seg.kind}`}>{seg.text}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="inspection-main-content ti-main-content">
        <div className="inspection-fortune-area">
          {isRevealed && (
            <div className="inspection-legend-row">
              {kindsShown.length === 0 ? (
                <div className="inspection-legend-area">
                  <div className="legend-text correct">Correct identification</div>
                  <div className="legend-subtext">Nothing was invalid here &amp; you left it unmarked</div>
                </div>
              ) : kindsShown.map(kind => (
                <div className="inspection-legend-area" key={kind}>
                  <div className={`legend-text ${SEGMENT_LEGEND[kind].className}`}>{SEGMENT_LEGEND[kind].label}</div>
                  <div className="legend-subtext">{SEGMENT_LEGEND[kind].note}</div>
                </div>
              ))}
              <div className={`legend-amount legend-amount-${tier}`}>
                {tier === 'correct' ? '+' : tier === 'wrong' ? '−' : ''} {currency}{REWARD_AMOUNT[tier] === 0 ? 0 : Math.abs(REWARD_AMOUNT[tier])}
              </div>
            </div>
          )}
        </div>

        {isRevealed && (
          <button className="next-btn inspection-next-btn" onClick={handleNext}>
            {isLast ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}

const INSPECTION_REWARD_CASES = [
  { key: 'correct', kind: 'earn', amount: '+', value: 1000, title: 'Correct inspection', note: 'You found exactly what was wrong' },
  { key: 'partial', kind: 'neutral', amount: '', value: 0, title: 'Partially correct inspection', note: 'Close, but not the full picture' },
  { key: 'wrong', kind: 'lose', amount: '−', value: 800, title: 'Wrong inspection', note: 'The wrong call costs the batch' }
];

export function PaymentInspectionScreen({ onNext }) {
  const currency = useCurrency();
  return (
    <div className="payment-dark-screen ti-reward-screen">
      <div className="ti-reward-hero">
        <div className={`reward-coin${currency.length > 1 ? ' wide' : ''}`} aria-hidden="true">{currency}</div>
        <div className="reward-hero-text">
          <div className="reward-headline">Payment as per inspection</div>
          <div className="reward-sub">Your accuracy under the torch decides the payout.</div>
        </div>
      </div>

      <div className="ti-reward-list">
        {INSPECTION_REWARD_CASES.map((c, i) => (
          <div key={c.key} className={`ti-reward-card ti-reward-${c.kind}`} style={{ animationDelay: `${0.12 + i * 0.1}s` }}>
            <div className="ti-reward-info">
              <div className="ti-reward-title">{c.title}</div>
              <div className="ti-reward-note">{c.note}</div>
            </div>
            <div className="ti-reward-amount">{c.amount} {currency}{c.value}</div>
          </div>
        ))}
      </div>

      <button className="let-start-btn" onClick={onNext}>Let's Start !</button>
    </div>
  );
}

export function StartMarkingScreen({ onNext, faultyCount = 2 }) {
  const faultyPreview = Array.from({ length: faultyCount });
  return (
    <div className="start-marking-screen">
      <div className="start-marking-tray-wrapper">
        <SortTray type="faulty" items={faultyPreview} />
      </div>
      <button className="let-start-btn" onClick={onNext}>Start Marking</button>
    </div>
  );
}

export function CheckSamplesScreen({ onNext }) {
  return (
    <div className="inspection-room-screen">
      <div className="inspection-title">INSPECTION ROOM</div>

      <button className="check-samples-btn" onClick={onNext}>
        Check the Delivered Samples
      </button>
    </div>
  );
}

const FALLBACK_FAULTY = [
  { fullText: "The perfect balance of code and creativity awaits you as you build your next masterpiece with auth-webflow.com. 🎨🛠️", markedText: "auth-webflow.com", isPhishy: true, invalidPart: "auth-webflow.com" },
  { fullText: "Your patience will soon bloom like a rare flower on x-secure.net in the spring rain. 🌸", markedText: "x-secure.net", isPhishy: true, invalidPart: "x-secure.net" }
];
const FALLBACK_APPROVED = [
  { text: "Do not fear the complex equations of life; master the mechanics of airbnb.com to find your balance. ⚖️", isPhishy: false },
  { text: "An exciting new role is waiting for you; let naukri.com help you make your next bold career move. 🚀💼", isPhishy: false }
];

// The invalid part of a fortune, shown highlighted - green for what the player
// correctly caught in the faulty tray, or the "missed" style for a phishy fortune
// that slipped through into Approved and was never marked at all.
const RevealedFortune = ({ text, marked, className = 'highlighted-correct' }) => {
  if (!marked || !text.includes(marked)) return text;
  const parts = text.split(marked);
  return (
    <>
      {parts[0]}
      <span className={className}>{marked}</span>
      {parts.slice(1).join(marked)}
    </>
  );
};

export function ResultsScreen({ markedFortunes, approvedItems, onNext }) {
  const currency = useCurrency();
  const faulty = (markedFortunes && markedFortunes.length > 0) ? markedFortunes : FALLBACK_FAULTY;
  const approved = (approvedItems && approvedItems.length > 0) ? approvedItems : FALLBACK_APPROVED;

  useEffect(() => {
    playSound('coin-gain');
  }, []);

  return (
    <div className="inspection-room-screen sr-screen">
      <div className="inspection-title">INSPECTION ROOM</div>

      <div className="sr-trays">
        <div className="sr-tray-col">
          <div className="sr-tray-label faulty">Faulty Tray</div>
          <div className="sr-strip-list">
            {faulty.map((fortune, index) => {
              const tier = gradeFortuneMarking(fortune.fullText, fortune, fortune.markedText);
              const amount = REWARD_AMOUNT[tier];
              // Same correct/wrong/missed segment coloring as the torch reveal, so a
              // wrongly-marked span still reads red here instead of flattening back to
              // a single green highlight regardless of whether the mark was right.
              const segments = diffFortuneMarking(fortune.fullText, fortune, fortune.markedText);
              return (
                <div key={index} className="sr-strip fortune-paper">
                  <div className="fortune-text-content">
                    {segments.map((seg, i) => (
                      seg.kind === 'plain'
                        ? <React.Fragment key={i}>{seg.text}</React.Fragment>
                        : <span key={i} className={`highlighted-${seg.kind}`}>{seg.text}</span>
                    ))}
                  </div>
                  <div className={`sr-strip-amount sr-strip-amount-${tier}`}>
                    {amount === 0 ? `${currency}0` : `${amount > 0 ? '+' : '−'} ${currency}${Math.abs(amount)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sr-tray-col">
          <div className="sr-tray-label approved">Approved Tray</div>
          <div className="sr-strip-list">
            {approved.map((fortune, index) => {
              const tier = gradeApprovedSort(fortune);
              const amount = REWARD_AMOUNT[tier];
              return (
                <div key={index} className="sr-strip fortune-paper">
                  <div className="fortune-text-content">
                    {tier === 'wrong'
                      ? <RevealedFortune text={fortune.text} marked={fortune.invalidPart} className="highlighted-missed" />
                      : fortune.text}
                  </div>
                  <div className={`sr-strip-amount sr-strip-amount-${tier}`}>
                    {amount > 0 ? `+ ${currency}${amount}` : `− ${currency}${Math.abs(amount)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button className="results-next-btn" onClick={onNext}>
        Next &gt;&gt;&gt;
      </button>
    </div>
  );
}

// Tallies the separate "Payment for sorting" score (see PaymentScreen) across every
// fortune from this round - reward purely for landing in the right tray, independent
// of the marking-accuracy score already totaled on the inspection screen. Shown right
// after the results reveal so the player sees where this number comes from before it's
// added into the level's final incentive.
export function SortingResultsScreen({ faultyItems, approvedItems, onNext }) {
  const currency = useCurrency();
  const faulty = faultyItems || [];
  const approved = approvedItems || [];

  const rows = [
    ...faulty.map(f => ({ text: f.text, tier: gradeSort(f, 'faulty') })),
    ...approved.map(f => ({ text: f.text, tier: gradeSort(f, 'approved') })),
  ];
  const total = rows.reduce((sum, r) => sum + SORT_REWARD_AMOUNT[r.tier], 0);

  useEffect(() => {
    playSound('coin-gain');
  }, []);

  return (
    <div className="inspection-room-screen sr-screen">
      <div className="inspection-title">Payment for sorting</div>

      <div className="sr-strip-list sorting-totals-list">
        {rows.map((row, index) => {
          const amount = SORT_REWARD_AMOUNT[row.tier];
          const cssTier = row.tier === 'correct' ? 'correct' : 'wrong';
          return (
            <div key={index} className="sr-strip fortune-paper">
              <div className="fortune-text-content">{row.text}</div>
              <div className={`sr-strip-amount sr-strip-amount-${cssTier}`}>
                {amount > 0 ? `+ ${currency}${amount}` : `− ${currency}${Math.abs(amount)}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sorting-total-row">
        <span className="sorting-total-label">Total</span>
        <span className={`sorting-total-amount ${total >= 0 ? 'positive' : 'negative'}`}>
          {total >= 0 ? '+' : '−'} {currency}{Math.abs(total)}
        </span>
      </div>

      <button className="results-next-btn" onClick={() => {
        const tiers = {};
        rows.forEach(r => { tiers[r.tier] = (tiers[r.tier] || 0) + 1; });
        track('sorting_scored', { total_points: total, tiers });
        onNext(total);
      }}>
        Next &gt;&gt;&gt;
      </button>
    </div>
  );
}

