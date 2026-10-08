import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../utils/currency';
import { playSound } from '../sounds';
import { track } from '../analytics';
import { diffFortuneMarking, gradeFortuneMarking, gradeApprovedSort, gradeSort, REWARD_AMOUNT, SORT_REWARD_AMOUNT } from '../utils/fortuneGrading';
import SortTray from './SortTray';
import TimerDial from './TimerDial';
import torch from '../assets/instructions/torch.png';
import { StoryScreen, SEAL_ICONS } from './FactoryFront';
import './Level2Instructions.css';
import './SampleFortune.css';

// Info screens of the marking + inspection stage: the Fortunery storefront + ledger card
const LightLayout = ({ title, kicker = 'Marking', icon = SEAL_ICONS.marker, onBack, onNext, nextLabel, children }) => (
  <StoryScreen kicker={kicker} title={title} icon={icon} centered onBack={onBack} onNext={onNext} nextLabel={nextLabel}>
    <div className="story-content level2-content">{children}</div>
  </StoryScreen>
);

export function ThirtySecondsScreen({ onNext, onBack, faultyCount = 2 }) {
  const faultyPreview = Array.from({ length: faultyCount });
  return (
    <LightLayout title="You will get 30 seconds to mark all faulty fortunes" icon={SEAL_ICONS.clock} onNext={onNext} onBack={onBack}>
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
    <LightLayout kicker="Inspection" icon={SEAL_ICONS.torch} title="Your marked fortunes go to the inspection room" onBack={onBack}>
      <div className="inspection-machine">
        <button className="machine-button torch-button" onClick={onNext} aria-label="Press the red button">
          <img src={torch} alt="Torch" className="torch-asset-img" />
        </button>
        <span className="machine-arrow">←</span>
        <span className="machine-text">Press this <b>RED</b> button</span>
      </div>

      <div className="sample-fortune">
        Your favorite artist has uploaded their new album on <span className="invalid-url">http://www.youtube.com/</span>
      </div>
    </LightLayout>
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
  // Each slide of the torch (a new grab or press on the rail) makes one card-swipe sound
  const swipePlayed = useRef(false);
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
    swipePlayed.current = false;
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

  const setTorch = (value) => {
    if (value !== torchValue && !swipePlayed.current) {
      swipePlayed.current = true;
      playSound('torch-swipe');
    }
    setTorchValue(value);
  };

  // The torch itself can be grabbed anywhere and slid along the rail (closed-fist
  // cursor while held). The rail underneath still works too, including the keyboard.
  const railRef = useRef(null);
  const stopTorchDrag = useRef(null);
  useEffect(() => () => stopTorchDrag.current && stopTorchDrag.current(), []);
  const grabTorch = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    swipePlayed.current = false;
    const railWidth = railRef.current.getBoundingClientRect().width;
    const startX = e.clientX;
    const startValue = torchValue;
    const move = (ev) => {
      const value = startValue + ((ev.clientX - startX) / railWidth) * 100;
      setTorch(Math.round(Math.max(0, Math.min(100, value))));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      document.body.classList.remove('is-grabbing');
      stopTorchDrag.current = null;
    };
    document.body.classList.add('is-grabbing');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    stopTorchDrag.current = stop;
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
        <div className="torch-slider-wrapper" ref={railRef}>
          <input
            type="range"
            min="0"
            max="100"
            value={torchValue}
            onChange={(e) => setTorch(Number(e.target.value))}
            onPointerDown={() => { swipePlayed.current = false; }}
            className="torch-slider"
            aria-label="Slide the torch"
          />
          <div className="torch-handle-container" style={{ left: `${torchValue}%` }}>
            <img
              src={torch}
              alt="Torch"
              className="ti-torch-img"
              draggable={false}
              onPointerDown={grabTorch}
            />
            {/* "Slide me" hint - chevrons that light up one after another, left to right */}
            {!isRevealed && (
              <div className="ti-torch-arrows" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <svg key={i} viewBox="0 0 12 20" width="12" height="20" style={{ animationDelay: `${i * 0.18}s` }}>
                    <path d="M2 2l8 8-8 8" />
                  </svg>
                ))}
              </div>
            )}
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
    <LightLayout kicker="Inspection" icon={SEAL_ICONS.coin} title="Payment as per inspection" onNext={onNext} nextLabel="Let's start!">
      <div className="reward-screen">
        <div className="reward-hero">
          <div className={`reward-coin${currency.length > 1 ? ' wide' : ''}`} aria-hidden="true">{currency}</div>
          <div className="reward-hero-text">
            <div className="reward-headline">Your accuracy under the torch decides the payout</div>
            <div className="reward-sub">Each marked fortune is checked in the inspection room.</div>
          </div>
        </div>

        <div className="reward-list">
          {INSPECTION_REWARD_CASES.map((c, i) => (
            <div key={c.key} className={`reward-card reward-${c.kind} no-icons`} style={{ animationDelay: `${0.12 + i * 0.1}s` }}>
              <div className="reward-info">
                <div className="reward-title">{c.title}</div>
                <div className="reward-note">{c.note}</div>
              </div>
              <div className="reward-amount">{c.amount} {currency}{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </LightLayout>
  );
}

export function StartMarkingScreen({ onNext, faultyCount = 2 }) {
  const faultyPreview = Array.from({ length: faultyCount });
  return (
    <LightLayout title="Time to mark the faulty fortunes" onNext={onNext} nextLabel="Start marking">
      <div className="start-marking-tray-wrapper">
        <SortTray type="faulty" items={faultyPreview} />
      </div>
      <p className="ff-text">Highlight the part of each fortune in the Faulty tray that makes it faulty.</p>
    </LightLayout>
  );
}

export function CheckSamplesScreen({ onNext }) {
  return (
    <LightLayout kicker="Dispatch" icon={SEAL_ICONS.tray} title="The samples are back from delivery" onNext={onNext} nextLabel="Check the delivered samples">
      <p className="ff-text">See how your sorting and marking did, and what you earned for it.</p>
    </LightLayout>
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
    <StoryScreen kicker="Dispatch" icon={SEAL_ICONS.torch} title="Inspection results" onNext={onNext}>
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
    </StoryScreen>
  );
}

// "Your batch payout": the sorting and marking results for every fortune of the round,
// on one screen, kept deliberately simple - one line per fortune: which tray it went
// to, a tick or cross for how it was sorted and (Faulty tray only - the Approved tray
// isn't marked) how it was marked, and what it earned in total. The totals bar shows
// sorting + marking = the level's incentive. Calls onNext(sortingTotal); the marking
// total was already recorded by the torch inspection.
const RESULT_ICON = {
  correct: { mark: '✓', label: 'right', className: 'ok' },
  partial: { mark: '½', label: 'partly right', className: 'half' },
  wrong: { mark: '✗', label: 'wrong', className: 'bad' },
};

export function BatchResultsScreen({ markedFortunes, approvedItems, onNext }) {
  const currency = useCurrency();
  const faulty = (markedFortunes && markedFortunes.length > 0) ? markedFortunes : FALLBACK_FAULTY;
  const approved = (approvedItems && approvedItems.length > 0) ? approvedItems : FALLBACK_APPROVED;

  const rows = [
    ...faulty.map(f => {
      const sortTier = gradeSort(f, 'faulty');
      const markTier = gradeFortuneMarking(f.fullText, f, f.markedText);
      return {
        tray: 'faulty',
        text: f.fullText,
        sortTier,
        sorted: sortTier === 'correct' ? 'correct' : 'wrong',
        marked: markTier,
        sort: SORT_REWARD_AMOUNT[sortTier],
        mark: REWARD_AMOUNT[markTier],
      };
    }),
    ...approved.map(f => {
      const sortTier = gradeSort(f, 'approved');
      return {
        tray: 'approved',
        text: f.text,
        sortTier,
        sorted: sortTier === 'correct' ? 'correct' : 'wrong',
        marked: null, // the Approved tray isn't marked
        sort: SORT_REWARD_AMOUNT[sortTier],
        mark: 0,
      };
    }),
  ];
  const sortTotal = rows.reduce((n, r) => n + r.sort, 0);
  const markTotal = rows.reduce((n, r) => n + r.mark, 0);
  const total = sortTotal + markTotal;

  useEffect(() => {
    playSound('coin-gain');
  }, []);

  const money = (n) => (n === 0 ? `${currency}0` : `${n > 0 ? '+' : '−'} ${currency}${Math.abs(n)}`);
  const tone = (n) => (n > 0 ? 'gain' : n < 0 ? 'loss' : 'zero');
  const icon = (tier, what) => {
    if (!tier) return <span className="br-icon none" title={`Not ${what} - the Approved tray isn't marked`}>–</span>;
    const i = RESULT_ICON[tier];
    return <span className={`br-icon ${i.className}`} title={`${what}: ${i.label}`} aria-label={`${what} ${i.label}`}>{i.mark}</span>;
  };

  const handleNext = () => {
    const tiers = {};
    rows.forEach(r => { tiers[r.sortTier] = (tiers[r.sortTier] || 0) + 1; });
    track('sorting_scored', { total_points: sortTotal, tiers });
    onNext(sortTotal);
  };

  return (
    <StoryScreen
      kicker="Dispatch"
      icon={SEAL_ICONS.coin}
      title="Your batch payout"
      onNext={handleNext}
    >
      <div className="br-table" role="table" aria-label="Payout per fortune">
        <div className="br-row br-head" role="row">
          <span role="columnheader">Fortune</span>
          <span role="columnheader">Sorted</span>
          <span role="columnheader">Marked</span>
          <span role="columnheader">Earned</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="br-row" role="row">
            <span className="br-fortune" role="cell" title={r.text}>
              <span className={`br-dot ${r.tray}`} title={r.tray === 'faulty' ? 'Faulty tray' : 'Approved tray'} />
              <span className="br-text">{r.text}</span>
            </span>
            <span role="cell">{icon(r.sorted, 'Sorted')}</span>
            <span role="cell">{icon(r.marked, 'Marked')}</span>
            <span className={`br-amt ${tone(r.sort + r.mark)}`} role="cell">{money(r.sort + r.mark)}</span>
          </div>
        ))}
        <div className="br-key" aria-hidden="true">
          <span><i className="br-dot faulty" /> Faulty tray</span>
          <span><i className="br-dot approved" /> Approved tray</span>
        </div>
      </div>

      <div className="br-totals">
        <div className="br-total"><span>Sorting</span><b className={tone(sortTotal)}>{money(sortTotal)}</b></div>
        <span className="br-plus" aria-hidden="true">+</span>
        <div className="br-total"><span>Marking</span><b className={tone(markTotal)}>{money(markTotal)}</b></div>
        <span className="br-plus" aria-hidden="true">=</span>
        <div className="br-total br-grand"><span>Total payout</span><b className={tone(total)}>{money(total)}</b></div>
      </div>
    </StoryScreen>
  );
}

