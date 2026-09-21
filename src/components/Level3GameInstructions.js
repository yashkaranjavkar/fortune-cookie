import React, { useState } from 'react';
import InvalidURLExplainer from './InvalidURLExplainer';

const L3Layout = ({ stepIndex, totalSteps, onBack, onNext, title, children }) => (
  <div className="instruction-screen">
    {onBack && stepIndex > 0 && <button className="back-btn" onClick={onBack}>←</button>}
    <div className="instruction-card">
      {title && <div className="job-title" style={{ marginBottom: '30px' }}>{title}</div>}
      <div className="l2-content-area">
        {children}
      </div>
      {onNext && <button className="instruction-next-btn" onClick={onNext}>Next &gt;&gt;&gt;</button>}
    </div>
    <div className="instruction-progress-bar">
      <div className="progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}></div>
    </div>
  </div>
);

// SCREEN 1: Event 3
export function EventThreeScreen({ onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Event 3 - Farewell Party" onNext={onNext}>
      <p className="l2-para">
        Today you have to deliver a bulk order at a Farewell Party. The order consists of 600 fortune cookies which will be packed and sent in 6 different batches.
      </p>
      <p className="l2-para">
        There will be 6 samples of these batches in front of you. From which you need to identify the doped fortune(s).
      </p>
    </L3Layout>
  );
}

// SCREEN 2: Context + URL
export function FortuneElementsThreeScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <div className="l2-black-banner">Fortune is made up of 2 elements - Context and URL</div>

      <div className="l2-context-url-row">
        <div className="l2-tag-with-arrow">
          <span className="l2-tag l2-context-tag">Context</span>
          <span className="l2-arrow">→</span>
        </div>
        <div className="l2-fortune-box">
          <span className="l2-context-highlight">The brand new trailer of your favorite movie is soon going to stream on</span>{' '}
          <span className="l2-url-highlight-orange">https://www.youtube.com/</span>
        </div>
        <div className="l2-tag-with-arrow">
          <span className="l2-arrow">←</span>
          <span className="l2-tag l2-url-tag">URL</span>
        </div>
      </div>
    </L3Layout>
  );
}

// SCREEN 3: Valid vs Faulty (with side notes)
export function ValidFaultyThreeScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <p className="l2-rule">1. If the URL is correct and the context is related to the category of the URL, then the fortune is valid.</p>

      <div className="l2-example-row">
        <div className="l2-example-label l2-valid-label">Valid</div>
        <div className="l2-example-box l2-valid-border">
          The brand new trailer of your favorite movie is soon going to stream on https://www.youtube.com/
        </div>
        <div className="l2-note">
          <b>Note:</b> Here, the valid URL belongs to Youtube, which is a media streaming platform. And the context of the Fortune is related to media streaming
        </div>
      </div>

      <div className="l2-example-row">
        <div className="l2-example-label l2-faulty-label">Faulty</div>
        <div className="l2-example-box l2-faulty-border">
          Your favorite artist has uploaded their new album on <span className="l2-url-invalid-highlight">http://www.youtude.com/</span>
        </div>
        <div className="l2-note">
          <b>Note:</b> Here, the context of the Fortune is related to media streaming but the URL is invalid.
        </div>
      </div>
    </L3Layout>
  );
}

// SCREEN 4: Invalid URL but context matches / Avoid clicking
export function ContextMatchesInvalidScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <p className="l2-rule">1. If the URL is correct and the context is related to the category of the URL, then the fortune is valid.</p>
      <p className="l2-rule">2. If the URL is invalid, then you have to check the overall meaning of the fortune.</p>

      <div className="l2-example-row">
        <div className="l2-example-label l2-faulty-label">Faulty</div>
        <div className="l2-example-box l2-faulty-border">
          Your favorite artist has uploaded their new album on <span className="l2-url-invalid-highlight">http://www.youtude.com/</span>
        </div>
        <div className="l2-note">
          Here, both the URLs are invalid. And the contexts are related to video streaming.
        </div>
      </div>

      <div className="l2-example-row">
        <div className="l2-example-label l2-valid-label">Valid</div>
        <div className="l2-example-box l2-valid-border">
          Avoid clicking on the links like <span className="l2-url-invalid-highlight">http://www.youtude.com/</span> to watch a video
        </div>
        <div className="l2-note">
          But the valid Fortune is the one which is warning you not to access the invalid URL.
        </div>
      </div>
    </L3Layout>
  );
}

// SCREEN 5: Invalid URL Intro
export function InvalidURLThreeIntroScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <div className="l2-center-url">https://gtms.ultimatix.net</div>
    </L3Layout>
  );
}

// SCREEN 6: Invalid URL Split
export function InvalidURLThreeSplitScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <div className="l2-split-url">
        <span>https://</span>
        <span>gtms</span>
        <span>.</span>
        <span>ultimatix.net</span>
      </div>
    </L3Layout>
  );
}

// SCREEN 7: Full URL Logic
export function InvalidURLThreeFullScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L3Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <InvalidURLExplainer />
    </L3Layout>
  );
}

// SCREEN 8: Balloons
export function BalloonsThreeScreen({ onReplay, onNext }) {
  const [popped, setPopped] = useState({ orange: false, blue: false, green: false });

  const handlePop = (color) => {
    setPopped(prev => ({ ...prev, [color]: true }));
    setTimeout(() => onReplay(), 500);
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