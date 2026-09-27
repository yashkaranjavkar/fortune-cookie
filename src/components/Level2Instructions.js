import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../utils/currency';
import { playSound } from '../sounds';
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

export function TorchInspectScreen({ markedFortunes, onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [torchValue, setTorchValue] = useState(0);
  const isRevealed = torchValue >= 95;
  const torchStarted = useRef(false);

  const fortunes = (markedFortunes && markedFortunes.length > 0)
    ? markedFortunes
    : [
        {
          fullText: "Your favorite artist has uploaded their new album on http://www.youtube.com/ 🎵",
          markedText: "http://"
        }
      ];

  useEffect(() => {
    setTorchValue(0);
    torchStarted.current = false;
  }, [currentIndex]);

  const currentFortune = fortunes[currentIndex];
  const isLast = currentIndex === fortunes.length - 1;

  const handleNext = () => {
    if (isLast) {
      onNext();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  let beforeText = currentFortune.fullText;
  let highlightedText = '';
  let afterText = '';

  if (currentFortune.markedText && currentFortune.fullText.includes(currentFortune.markedText)) {
    const parts = currentFortune.fullText.split(currentFortune.markedText);
    beforeText = parts[0];
    highlightedText = currentFortune.markedText;
    afterText = parts.slice(1).join(currentFortune.markedText);
  }

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
              {beforeText}{highlightedText}{afterText}
            </div>
          </div>
          {/* Bright paper + text, masked so only the torch-swept portion is legible */}
          <div
            className="ti-strip-lit fortune-paper"
            style={{ WebkitMaskImage: revealMask, maskImage: revealMask }}
          >
            <div className="fortune-text-content">
              {beforeText}
              {highlightedText && <span className="highlighted-correct">{highlightedText}</span>}
              {afterText}
            </div>
          </div>
        </div>
      </div>

      <div className="inspection-main-content ti-main-content">
        <div className="inspection-fortune-area">
          {isRevealed && (
            <div className="inspection-legend-area">
              <div className="legend-text">Correct identification</div>
              <div className="legend-subtext">Only this part is invalid<br/>& you marked it</div>
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
  { fullText: "The perfect balance of code and creativity awaits you as you build your next masterpiece with auth-webflow.com. 🎨🛠️", markedText: "auth-webflow.com" },
  { fullText: "Your patience will soon bloom like a rare flower on x-secure.net in the spring rain. 🌸", markedText: "x-secure.net" }
];
const FALLBACK_APPROVED = [
  { text: "Do not fear the complex equations of life; master the mechanics of airbnb.com to find your balance. ⚖️" },
  { text: "An exciting new role is waiting for you; let naukri.com help you make your next bold career move. 🚀💼" }
];

// The invalid part of a faulty fortune, shown highlighted exactly as it was revealed under the torch.
const RevealedFortune = ({ text, marked }) => {
  if (!marked || !text.includes(marked)) return text;
  const parts = text.split(marked);
  return (
    <>
      {parts[0]}
      <span className="highlighted-correct">{marked}</span>
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
            {faulty.map((fortune, index) => (
              <div key={index} className="sr-strip fortune-paper">
                <div className="fortune-text-content">
                  <RevealedFortune text={fortune.fullText} marked={fortune.markedText} />
                </div>
                <div className="sr-strip-amount">+ {currency}1000</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sr-tray-col">
          <div className="sr-tray-label approved">Approved Tray</div>
          <div className="sr-strip-list">
            {approved.map((fortune, index) => (
              <div key={index} className="sr-strip fortune-paper">
                <div className="fortune-text-content">{fortune.text}</div>
                <div className="sr-strip-amount">+ {currency}1000</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="results-next-btn" onClick={onNext}>
        Next &gt;&gt;&gt;
      </button>
    </div>
  );
}

// Achievement medal (rays + ribbon + star) shared by all three level-end screens
const WHOSHH_RAYS = Array.from({ length: 10 }, (_, i) => i * 36);
function WhoshhMedal() {
  return (
    <svg className="whoshh-medal-svg" viewBox="0 0 200 160" role="img" aria-hidden="true">
      <g className="whoshh-rays">
        {WHOSHH_RAYS.map(angle => (
          <line key={angle} x1="100" y1="70" x2="100" y2="30" transform={`rotate(${angle} 100 70)`} />
        ))}
      </g>

      <polygon className="whoshh-ribbon" points="90,92 100,88 96,150 84,142" />
      <polygon className="whoshh-ribbon" points="110,92 100,88 104,150 116,132" />

      <circle className="whoshh-medal-ring" cx="100" cy="70" r="34" />
      <circle className="whoshh-medal-face" cx="100" cy="70" r="26" />
      <path className="whoshh-star" d="M100,56 L103.5,65.1 L113.3,65.7 L105.7,71.9 L108.2,81.3 L100,76 L91.8,81.3 L94.3,71.9 L86.7,65.7 L96.5,65.1 Z" />
    </svg>
  );
}

const CONFETTI_PIECES = Array.from({ length: 16 }, (_, i) => ({
  key: i,
  left: (i * 6.4) % 100,
  delay: (i % 8) * 0.35,
  duration: 3 + (i % 5) * 0.4,
  tone: ['pink', 'yellow', 'orange', 'green'][i % 4],
  round: i % 3 === 0
}));
function WhoshhConfetti() {
  return (
    <div className="whoshh-confetti" aria-hidden="true">
      {CONFETTI_PIECES.map(p => (
        <span
          key={p.key}
          className={`whoshh-confetti-piece whoshh-confetti-${p.tone}${p.round ? ' round' : ''}`}
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
        />
      ))}
    </div>
  );
}

const WhoshhLayout = ({ title, children, onNext, btnLabel }) => {
  useEffect(() => {
    playSound('star-earn');
    playSound('level-done');
  }, []);

  return (
    <div className="whoshh-screen">
      <div className="whoshh-card">
        <WhoshhConfetti />
        <WhoshhMedal />
        <div className="whoshh-title">{title}</div>
        <p className="whoshh-text">{children}</p>
        <button className="whoshh-btn" onClick={onNext}>{btnLabel}</button>
      </div>
    </div>
  );
};

// LEVEL 1 ENDING (Great Job Inspector)
export function WhoshhScreen({ onNext }) {
  return (
    <WhoshhLayout title="Great Job Inspector!" onNext={onNext} btnLabel="I am Ready">
      It was great as a new joiner. Keep it up!<br/>
      More challenges ahead.
    </WhoshhLayout>
  );
}

// LEVEL 2 ENDING (Whossh - Big reward)
export function WhoshhTwoScreen({ onNext }) {
  return (
    <WhoshhLayout title="Whossh!" onNext={onNext} btnLabel="I am Ready">
      That was tough it seems. You did good. You are soon going to<br/>
      get a big reward inspector
    </WhoshhLayout>
  );
}

// LEVEL 3 ENDING (Well Done - See reward)
export function WhoshhThreeScreen({ onNext }) {
  return (
    <WhoshhLayout title="Well Done!" onNext={onNext} btnLabel="See reward">
      You deserve the reward after that tiring work
    </WhoshhLayout>
  );
}