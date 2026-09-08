import React, { useState, useEffect } from 'react';

// Shared Level 1 Layout
const LevelOneLayout = ({ title, onBack, onNext, children }) => (
  <div className="level-one-screen">
    <div className="level-one-card">
      <div className="level-one-title">{title}</div>
      <div className="level-one-content">
        {children}
      </div>
      <div className="level-one-footer">
        {onBack && <button className="level-one-back" onClick={onBack}>&lt;&lt;&lt; Back</button>}
        {onNext && <button className="level-one-next" onClick={onNext}>Next &gt;&gt;&gt;</button>}
      </div>
    </div>
  </div>
);

// Screen 1: Payment for sorting
export function PaymentScreen({ onBack, onNext }) {
  return (
    <LevelOneLayout title="Payment for sorting" onBack={onBack} onNext={onNext}>
      <div className="payment-table">
        <div className="payment-header"><span>Cases</span><span>Incentive</span></div>
        <div className="payment-row"><span>Sorting out one<br/>faulty or valid fortune</span><span className="green-incentive">......... + ₹1000</span></div>
        <div className="payment-row"><span>Sorting out one faulty fortune<br/>as valid</span><span className="red-incentive">......... - ₹800</span></div>
        <div className="payment-row"><span>Sorting out one valid fortune<br/>as faulty</span><span className="red-incentive">......... - ₹500</span></div>
      </div>
      {/* Removed the middle 'Next' button */}
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
          The brand new trailer of your favorite movie is soon going to stream on <span className="highlight-grey">https://www.youtube.com/</span>
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

export function InvalidURLSequence({ onNext }) {
  const [stage, setStage] = useState(0); // 0: Initial, 1: Split, 2: Logic

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1500); // 1.5s on Initial
    const timer2 = setTimeout(() => setStage(2), 3500); // 2s on Split

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <LevelOneLayout
      title="Identifying invalid URL"
      // Hide buttons until the last stage
      onBack={undefined}
      onNext={stage === 2 ? onNext : undefined} 
    >
      {/* STAGE 0: Initial URL */}
      {stage === 0 && (
        <div className="center-content">
          <p className="large-url">https://gtms.ultimatix.net</p>
        </div>
      )}

      {/* STAGE 1: Split URL */}
      {stage === 1 && (
        <div className="center-content">
          <div className="split-url">
            <span>https://</span>
            <span>gtms</span>
            <span>.</span>
            <span>ultimatix.net</span>
          </div>
        </div>
      )}

      {/* STAGE 2: Full Logic */}
      {stage === 2 && (
        <div className="center-content">
          <div className="color-coded-url">
            <div className="url-part blue"><span>https://</span><small>Protocol</small></div>
            <div className="url-part yellow"><span>gtms</span><small>Sub-domain</small></div>
            <div className="url-part grey"><span>.</span><small>Dot</small></div>
            <div className="url-part green"><span>ultimatix.net</span><small>Domain</small></div>
          </div>
          <p>Sub-domains does not necessarily need to have "www". Here, "gtms" is a valid sub-domain.</p>
          
          <div className="domain-info-box">
            <div className="info-title">🔴 Pay attention to the domain</div>
            <div className="domain-row"><span>🔒 https://www.tcs.com</span> <span className="check-icon">✅</span> <span>This site belongs to TCS</span></div>
            <div className="domain-row"><span>🔒 https://www.tcs.random.com</span> <span className="warn-icon">❗</span> <span>This belongs to "random" and not TCS</span></div>
            <div className="domain-row"><span>🔒 https://www.tcs-login.com</span> <span className="cross-icon">❌</span> <span>This belongs to "tcs-login", Which is a fake.</span></div>
          </div>

          <div className="ip-address-row">
            <span>🔒 https://<span className="red-box">102.345.524.23</span>login.com</span>
            <span>Generally, URLs with IP addresses are invalid</span>
          </div>
        </div>
      )}
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
  const [popped, setPopped] = useState({ orange: false, blue: false, green: false });

  const handlePop = (color) => {
    setPopped(prev => ({ ...prev, [color]: true }));
    setTimeout(() => {
      onReplay();
    }, 500);
  };

  return (
    <div className="balloon-full-screen">
      <div className="balloon-container">
        <div className={`balloon orange ${popped.orange ? 'popped' : ''}`} onClick={() => handlePop('orange')}></div>
        <div className={`balloon blue ${popped.blue ? 'popped' : ''}`} onClick={() => handlePop('blue')}></div>
        <div className={`balloon green ${popped.green ? 'popped' : ''}`} onClick={() => handlePop('green')}></div>
      </div>
      
      <p className="balloon-text">
        You will get <strong>three chances</strong> to go through these instructions<br/>
        again if you need, by popping these three balloons
      </p>

      <button className="orange-btn" onClick={onNext}>Next</button>
    </div>
  );
}