import React from 'react';
import { useCurrency } from '../utils/currency';
import NavRoundButton from './NavRoundButton';
import './ObjectiveScreen.css';
import './EventScreen.css';
import './TimerEndScreen.css';
import './SortingFortunesScreen.css';

// How-to Interact Assets - the same covered/hover/lifted dome states used in the games
import step1 from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-covered.svg';
import step2 from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-hover.svg';
import step3 from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-lifted.svg';
import domeSpent from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-spent.svg';
import cookieBroken from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-broken.svg';

// Countdown illustration shared by the three timer-explainer screens below: the same
// dome art used everywhere else in the game, with a live LED-style readout, instead of
// one flat baked-together image per screen.
function TimerDomeScene({ label, value, wasted }) {
  return (
    <div className="tds-scene">
      <div className="tds-caption">
        {wasted && (
          <svg className="tds-hand" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="9" fill="var(--pink-light)" stroke="var(--error)" strokeWidth="1.2" />
            <path d="M10 5.5v6M7 9l3 3 3-3" fill="none" stroke="var(--maroon-deep)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="tds-caption-text">{label}</span>
      </div>

      <div className="tds-dome-col">
        <img src={wasted ? domeSpent : step1} alt="" className="tds-dome-img" />
        <div className="tds-led">{value}</div>
        {wasted && (
          <div className="tds-shelf">
            <img src={cookieBroken} alt="" className="tds-shelf-cookie" />
            <img src={cookieBroken} alt="" className="tds-shelf-cookie" />
          </div>
        )}
      </div>
    </div>
  );
}

// Shared Layout Component (Supports Green Bar & Left Replay Button)
// - First screen (stepIndex 0): a single Next button, nothing else.
// - Middle screens: the top-left back arrow is dropped in favour of a
//   Back/Forward round-icon pair (wisecrack kit style) at the bottom right.
// - Final screen (isFinal): unchanged - Next + Replay, top-left back arrow kept.
const InstructionLayout = ({ stepIndex, totalSteps, onBack, onNext, onReplay, children, isFinal }) => {
  const isFirst = stepIndex === 0;
  const showNavPair = !isFirst && !isFinal;

  return (
  <div className="instruction-screen">
    {!showNavPair && onBack && stepIndex > 0 && <button className="back-btn" onClick={onBack}>←</button>}

    <div className="instruction-card-row">
      {showNavPair && <NavRoundButton direction="back" onClick={onBack} label="Back" />}

      <div className="instruction-card">
        {children}
      </div>

      {showNavPair && <NavRoundButton direction="forward" onClick={onNext} label="Forward" dataSound="progress-munch" />}
    </div>

    {!showNavPair && (
      <button className="instruction-next-btn" onClick={onNext} data-sound="progress-munch">Next</button>
    )}

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
};

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
        <TimerDomeScene label={<>10 sec timer<br />to verify and sort</>} value="10" />

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
        <TimerDomeScene label={<>What if the timer<br />ends before sorting?</>} value="00" />
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
        <TimerDomeScene label="Timer ends" value="00" wasted />

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