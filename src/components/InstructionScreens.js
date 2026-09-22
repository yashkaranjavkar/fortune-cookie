import React from 'react';
import { useCurrency } from '../utils/currency';
import './ObjectiveScreen.css';
import './EventScreen.css';
import './TimerEndScreen.css';
import './SortingFortunesScreen.css';

// How-to Interact Assets
import step1 from '../assets/instructions/1.png';
import step2 from '../assets/instructions/2.png';
import step3 from '../assets/instructions/3.png';

// Sorting Assets - the dome/timer illustration is kept; the tray mock-images
// are replaced below with real markup so both trays' info fits on one screen.
import domeTimer from '../assets/instructions/dome-timer.png';

// New Timer Assets
import timerQuestion from '../assets/instructions/timer-question.png';
import timerEnd from '../assets/instructions/timer-end.png';

// Shared Layout Component (Supports Green Bar & Left Replay Button)
const InstructionLayout = ({ stepIndex, totalSteps, onBack, onNext, onReplay, children, isFinal }) => (
  <div className="instruction-screen">
    {onBack && stepIndex > 0 && <button className="back-btn" onClick={onBack}>←</button>}
    
    <div className="instruction-card">
      {children}
    </div>

    {/* Next Button (Bottom Right) */}
    <button className="instruction-next-btn" onClick={onNext}>Next</button>

    {/* Replay Button (Bottom Left - Outside the card) */}
    {onReplay && (
      <button className="instruction-replay-btn" onClick={onReplay}>Replay</button>
    )}

    {/* Progress Bar */}
    <div className="instruction-progress-bar">
      <div className={`progress-fill ${isFinal ? 'green' : ''}`} style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}></div>
    </div>
  </div>
);

export function ObjectiveScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Objective</div>
      <p className="obj-lead">
        Your factory has been sabotaged &mdash; some fortune cookies were doped with <strong>malicious fortunes</strong>.
      </p>

      <ol className="obj-steps">
        <li className="obj-step">
          <span className="obj-step-marker">
            <span className="obj-step-num">1</span>
            <span className="obj-step-line" aria-hidden="true" />
          </span>
          <span className="obj-step-text">
            <span className="obj-step-title">Inspect</span>
            <span className="obj-step-desc">Check today's samples for doped fortunes</span>
          </span>
        </li>
        <li className="obj-step">
          <span className="obj-step-marker">
            <span className="obj-step-num">2</span>
          </span>
          <span className="obj-step-text">
            <span className="obj-step-title">Approve</span>
            <span className="obj-step-desc">Clear the clean batches for delivery</span>
          </span>
        </li>
      </ol>
    </InstructionLayout>
  );
}

const EVT_BALLOONS = [
  { cx: 76, color: 'var(--pink-base)', delay: '0s' },
  { cx: 180, color: 'var(--yellow-base)', delay: '0.45s' },
  { cx: 284, color: 'var(--orange-base)', delay: '0.9s' }
];
const EVT_CRATES = [34, 122, 210, 298];

function EventScene() {
  return (
    <svg className="evt-svg" viewBox="0 0 360 150" role="img"
         aria-label="Balloons over four packed batches of fortune cookies, ready for a birthday party bulk order">
      {EVT_BALLOONS.map(b => (
        <g key={b.cx} className="evt-balloon" style={{ animationDelay: b.delay }}>
          <path className="evt-balloon-string" d={`M${b.cx} 48 L${b.cx} 68`} />
          <ellipse className="evt-balloon-body" cx={b.cx} cy="26" rx="15" ry="19" style={{ fill: b.color }} />
          <path className="evt-balloon-shine" d={`M${b.cx - 6} 18 Q${b.cx - 8} 24 ${b.cx - 4} 28`} />
        </g>
      ))}

      <rect className="evt-shelf" x="16" y="122" width="328" height="8" rx="3" />

      {EVT_CRATES.map((x, i) => (
        <g key={x}>
          <rect className="evt-crate-body" x={x} y="76" width="56" height="46" rx="4" />
          <rect className="evt-crate-lid" x={x - 3} y="76" width="62" height="10" rx="3" />
          <rect className="evt-crate-ribbon-v" x={x + 24} y="76" width="8" height="46" />
          <rect className="evt-crate-ribbon-h" x={x} y="95" width="56" height="8" />
          <circle className="evt-crate-tag" cx={x + 28} cy="99" r="9" />
          <text className="evt-crate-tag-text" x={x + 28} y="102.5" textAnchor="middle">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

export function EventScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Event - Office Birthday Party</div>

      <div className="evt-scene">
        <EventScene />
      </div>

      <p className="evt-lead">A bulk order just came in for a birthday party.</p>

      <div className="evt-stats">
        <div className="evt-stat">
          <span className="evt-stat-num">400</span>
          <span className="evt-stat-label">Fortune cookies</span>
        </div>
        <span className="evt-divider" aria-hidden="true" />
        <div className="evt-stat">
          <span className="evt-stat-num">4</span>
          <span className="evt-stat-label">Batches</span>
        </div>
      </div>

      <p className="evt-task">At the start, 4 samples will be placed in front of you &mdash; spot the <strong>doped fortune(s)</strong>.</p>
    </InstructionLayout>
  );
}

export function HowToInteractScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">How to interact with the cookie?</div>
      
      <div className="how-to-grid">
        <div className="instruction-step">
          <img src={step1} alt="Food Dome" />
          <p>Food Dome covers the food and helps it to keep hot</p>
          <span className="step-num">(i)</span>
        </div>
        
        <div className="instruction-step">
          <img src={step2} alt="Dome Lifting" />
          <p>Food Dome lifts as you hover over it. There is a fortune cookie under it.</p>
          <span className="step-num">(ii)</span>
        </div>
        
        <div className="instruction-step">
          <img src={step3} alt="Fortune Open" />
          <p>Hovering over it will open the fortune cookie with a fortune inside.</p>
          <span className="step-num">(iii)</span>
        </div>
      </div>
    </InstructionLayout>
  );
}

// Sorting Fortunes: what used to be spread across 3 near-identical screens
// (plain trays, then faulty highlighted, then approved highlighted) collapsed into one -
// both trays' rules and outcomes are shown together since they're really one idea.
export function SortingIntroScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>

      <div className="sorting-content">
        <img src={domeTimer} alt="10 sec timer" className="dome-timer-img" />

        <p className="sf-lead">Drag each fortune into the tray that matches your decision.</p>

        <div className="sf-trays">
          <div className="sf-tray-col">
            <div className="sf-tray-label faulty">Faulty Tray</div>
            <div className="sf-tray-box faulty">
              <div className="sf-tray-caption">Sent for inspection</div>
              <div className="sf-tray-dropzone">Drag &amp; Drop</div>
            </div>
          </div>

          <span className="sf-or">OR</span>

          <div className="sf-tray-col">
            <div className="sf-tray-label approved">Approved Tray</div>
            <div className="sf-tray-box approved">
              <div className="sf-tray-caption">Dispatched for delivery</div>
              <div className="sf-tray-dropzone">Drag &amp; Drop</div>
            </div>
          </div>
        </div>
      </div>
    </InstructionLayout>
  );
}

/* NEW: First Timer Screen */
export function TimerQuestionScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Timer Ends</div>
      
      <div className="sorting-content">
        <img src={timerQuestion} alt="Timer ends before sorting" className="dome-timer-img" />
      </div>
    </InstructionLayout>
  );
}

/* NEW: Final Timer Screen (with Green Bar and Replay) */
export function TimerEndScreen({ onNext, onReplay, onBack, stepIndex, totalSteps }) {
  const currency = useCurrency();
  return (
    <InstructionLayout 
      stepIndex={stepIndex} 
      totalSteps={totalSteps} 
      onBack={onBack} 
      onNext={onNext} 
      onReplay={onReplay} // Passed here now
      isFinal={true}
    >
      <div className="title">Timer Ends</div>
      
      <div className="sorting-content">
        <img src={timerEnd} alt="Timer ends with broken cookie" className="dome-timer-img" />

        <p className="tme-lead">
          If a sample isn&rsquo;t sorted before the timer runs out, it&rsquo;s spoilt &mdash; that batch won&rsquo;t go out for delivery.
        </p>

        <div className="tme-cost">
          <span className="tme-cost-num">{currency}800</span>
          <span className="tme-cost-label">Lost per unsorted cookie</span>
        </div>
      </div>
    </InstructionLayout>
  );
}