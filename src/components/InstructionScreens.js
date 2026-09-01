import React from 'react';

// Import ONLY your 3 combined images
import step1 from '../assets/instructions/1.png';
import step2 from '../assets/instructions/2.png';
import step3 from '../assets/instructions/3.png';

// Shared Layout Component
const InstructionLayout = ({ stepIndex, totalSteps, onBack, onNext, children }) => (
  <div className="instruction-screen">
    {/* UPDATED: Show back button only if stepIndex > 0 (2nd screen onwards) */}
    {onBack && stepIndex > 0 && <button className="back-btn" onClick={onBack}>←</button>}
    
    <div className="instruction-card">
      {children}
      <button className="instruction-next-btn" onClick={onNext}>Next</button>
    </div>

    {/* Functionable Progress Bar */}
    <div className="instruction-progress-bar">
      <div className="progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}></div>
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
        {/* Use your combined images directly in each column */}
        <div className="instruction-step">
          <img src={step1} alt="Food Dome" />
          <p>(i) Food Dome covers the food and helps it to keep hot</p>
        </div>
        
        <div className="instruction-step">
          <img src={step2} alt="Dome Lifting" />
          <p>(ii) Food Dome lifts as you hover over it. There is a fortune cookie under it.</p>
        </div>
        
        <div className="instruction-step">
          <img src={step3} alt="Fortune Open" />
          <p>(iii) Hovering over it will open the fortune cookie with a fortune inside.</p>
        </div>
      </div>
    </InstructionLayout>
  );
}

export function SortingIntroScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>
      <p><strong>10 sec timer to verify and sort.</strong></p>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '30px' }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <p>Drag and drop to Faulty Tray if you don't want that batch to deliver.</p>
          <div style={{ border: '2px solid red', padding: '20px', borderRadius: '10px' }}>Drag & Drop</div>
          <button style={{background:'red', color:'white', padding:'5px 20px', marginTop:'10px', border:'none'}}>Faulty Tray</button>
        </div>
        <span>OR</span>
        <div style={{ textAlign: 'center', color: 'green' }}>
          <p>Drag and drop to Approved Tray if you want that batch to deliver.</p>
          <div style={{ border: '2px solid green', padding: '20px', borderRadius: '10px' }}>Drag & Drop</div>
          <button style={{background:'green', color:'white', padding:'5px 20px', marginTop:'10px', border:'none'}}>Approved Tray</button>
        </div>
      </div>
    </InstructionLayout>
  );
}

export function FaultyTrayScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>
      <p>10 sec timer to verify and sort</p>
      <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed red', borderRadius: '10px', width: '300px' }}>
        <p style={{ color: 'red' }}>Suspicious Fortunes are collected for inspection</p>
        <div style={{ background: 'pink', padding: '10px', borderRadius: '5px' }}>🍪 <span style={{color:'#ccc'}}>__________</span></div>
        <button style={{background:'#a33', color:'white', padding:'5px 20px', marginTop:'10px', border:'none'}}>Faulty Tray</button>
      </div>
    </InstructionLayout>
  );
}

export function ApprovedTrayScreen({ onNext, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Sorting Fortunes</div>
      <p>10 sec timer to verify and sort</p>
      <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed green', borderRadius: '10px', width: '300px' }}>
        <p style={{ color: 'green' }}>Approved Fortune Cookies batches are dispatched</p>
        <div style={{ background: 'lightgreen', padding: '10px', borderRadius: '5px' }}>🍪 <span style={{color:'#ccc'}}>__________</span></div>
        <button style={{background:'green', color:'white', padding:'5px 20px', marginTop:'10px', border:'none'}}>Approved Tray</button>
      </div>
    </InstructionLayout>
  );
}

export function TimerEndsScreen({ onNext, onReplay, onBack, stepIndex, totalSteps }) {
  return (
    <InstructionLayout stepIndex={stepIndex} totalSteps={totalSteps} onBack={onBack} onNext={onNext}>
      <div className="title">Timer Ends</div>
      <p>What if the timer ends before sorting? <span style={{color:'red'}}>00</span></p>
      <div style={{ marginTop: '30px' }}>
        <div style={{ fontSize: '50px' }}>⏱️ 00 🔻</div>
        <p>If you did not sort before the timer ends, that sample is spoilt and the batch won't go out for delivery. <span style={{ color: 'red' }}>This will cost in loss of ₹800 per fortune cookie left without sorting.</span></p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        <button className="instruction-next-btn" onClick={onReplay} style={{ background: '#444' }}>Replay</button>
      </div>
    </InstructionLayout>
  );
}