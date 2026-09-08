import React from 'react';

// How-to Interact Assets
import step1 from '../assets/instructions/1.png';
import step2 from '../assets/instructions/2.png';
import step3 from '../assets/instructions/3.png';

// Sorting Assets
import domeTimer from '../assets/instructions/dome-timer.png';
import faultyTray from '../assets/instructions/faulty-tray.png';
import approvedTray from '../assets/instructions/approved-tray.png';
import faultyBox from '../assets/instructions/faulty-box.png';
import approvedBox from '../assets/instructions/approved-box.png';

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
      <p>Your factory of <span style={{ color: '#e6a817', fontWeight: 'bold' }}>fortune cookies</span> has been sabotaged. The fortunes in the fortune cookies have been compromised and doped with malicious text. It may affect in the reputation of your factory if the batches with these malicious fortune are sent out for delivery.</p>
      <p>So, for today's orders, you have to identity these dopped batches from the samples provided and then give an approval for delivery of those batches.</p>
    </InstructionLayout>
  );
}

export function EventScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Event - Office Birthday Party</div>
      <p>Today you have to deliver a bulk order at a Birthday Party. The order consists of 400 fortune cookies which will be packed and sent in 4 different batches.</p>
      <p>There will be 4 samples of these batches in front of you. From which you need to identify the doped fortune(s).</p>
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

export function SortingIntroScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>
      
      <div className="sorting-content">
        <img src={domeTimer} alt="10 sec timer" className="dome-timer-img" />

        <div className="sorting-options">
          <img src={faultyTray} alt="Faulty Tray" className="tray-option-img" />
          <span className="or-text">OR</span>
          <img src={approvedTray} alt="Approved Tray" className="tray-option-img" />
        </div>
      </div>
    </InstructionLayout>
  );
}

export function FaultyTrayScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>
      
      <div className="sorting-content">
        <img src={domeTimer} alt="10 sec timer" className="dome-timer-img" />
        <div className="sorting-options">
          <img src={faultyBox} alt="Faulty Box" className="tray-option-img" />
          <img src={approvedTray} alt="Approved Tray" className="tray-option-img" />
        </div>
      </div>
    </InstructionLayout>
  );
}

export function ApprovedTrayScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>
      
      <div className="sorting-content">
        <img src={domeTimer} alt="10 sec timer" className="dome-timer-img" />
        <div className="sorting-options">
          <img src={faultyTray} alt="Faulty Tray" className="tray-option-img" />
          <img src={approvedBox} alt="Approved Box" className="tray-option-img" />
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
        <p>
          If you did not sort before the timer ends, that sample is spoilt and the batch won't go out for delivery. 
          <span style={{ color: 'red' }}> This will cost in loss of ₹800 per fortune cookie left without sorting.</span>
        </p>
      </div>
    </InstructionLayout>
  );
}