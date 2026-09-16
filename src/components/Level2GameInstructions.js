import React, { useState } from 'react';

const L2Layout = ({ stepIndex, totalSteps, onBack, onNext, title, children }) => (
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

export function EventTwoScreen({ onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Event 2 - Farewell Party" onNext={onNext}>
      <p className="l2-para">
        Today you have to deliver a bulk order at a Farewell Party. The order consists of 500 fortune cookies which will be packed and sent in 5 different batches.
      </p>
      <p className="l2-para">
        There will be 5 samples of these batches in front of you. From which you need to identify the doped fortune(s).
      </p>
    </L2Layout>
  );
}

export function FortuneElementsScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
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
    </L2Layout>
  );
}

export function ContextValidFaultyScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <p className="l2-rule">1. If the URL is correct and the context is related to the category of the URL, then the fortune is valid.</p>

      <div className="l2-example-row">
        <div className="l2-example-label l2-valid-label">Valid</div>
        <div className="l2-example-box l2-valid-border">
          The brand new trailer of your favorite movie is soon going to stream on <span className="l2-url-highlight">https://www.youtube.com/</span>
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
    </L2Layout>
  );
}

export function InvalidURLIntroScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <div className="l2-center-url">https://gtms.ultimatix.net</div>
    </L2Layout>
  );
}

export function InvalidURLSplitScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <div className="l2-split-url">
        <span>https://</span>
        <span>gtms</span>
        <span>.</span>
        <span>ultimatix.net</span>
      </div>
    </L2Layout>
  );
}

export function InvalidURLFullScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying invalid URL" onBack={onBack} onNext={onNext}>
      <div className="l2-url-parts">
        <div className="l2-url-part l2-part-blue"><span>https://</span><small>Protocol</small></div>
        <div className="l2-url-part l2-part-yellow"><span>gtms</span><small>Sub-domain</small></div>
        <div className="l2-url-part l2-part-grey"><span>.</span><small>Dot</small></div>
        <div className="l2-url-part l2-part-green"><span>ultimatix.net</span><small>Domain</small></div>
      </div>
      <p className="l2-para-center">Sub-domains does not necessarily need to have "www". Here, "gtms" is a valid sub-domain.</p>

      <div className="l2-domain-info">
        <div className="l2-info-title">🔴 Pay attention to the domain</div>
        <div className="l2-domain-row"><span>🔒 https://www.tcs.com</span><span className="l2-icon-check">✅</span><span>This site belongs to TCS</span></div>
        <div className="l2-domain-row"><span>🔒 https://www.tcs.random.com</span><span className="l2-icon-warn">❗</span><span>This belongs to "random" and not TCS</span></div>
        <div className="l2-domain-row"><span>🔒 https://www.tcs-login.com</span><span className="l2-icon-cross">❌</span><span>This belongs to "tcs-login", Which is a fake.</span></div>
      </div>

      <div className="l2-ip-row">
        <span>🔒 https://<span className="l2-red-box">102.345.524.23</span>login.com</span>
        <span className="l2-ip-note">Generally, URLs with IP addresses are invalid</span>
      </div>
    </L2Layout>
  );
}

export function ContextUnrelatedScreen({ onBack, onNext, stepIndex, totalSteps }) {
  return (
    <L2Layout stepIndex={stepIndex} totalSteps={totalSteps} title="Identifying Faulty Fortune" onBack={onBack} onNext={onNext}>
      <p className="l2-rule">1. If the URL is correct and the context is related to the category of the URL, then the fortune is valid.</p>
      <p className="l2-rule">2. If the context of the fortune is unrelated to the category of the URL, then it is faulty fortune</p>

      <div className="l2-example-row">
        <div className="l2-example-label l2-faulty-label">Faulty</div>
        <div className="l2-example-box l2-faulty-border">
          You will make your payments safer with the help of <span className="l2-url-highlight-blue">https://www.youttube.com/</span>
        </div>
        <div className="l2-note">
          Here, the URLs, either valid or invalid belong to Youtube, which is a media streaming platform. And the context of both Fortunes is <b>unrelated</b> to media streaming
        </div>
      </div>

      <div className="l2-example-row">
        <div className="l2-example-label l2-faulty-label">Faulty</div>
        <div className="l2-example-box l2-faulty-border">
          You have saved enough money to buy your shoes from <span className="l2-url-invalid-highlight">http://www.youttube.com/</span>
        </div>
      </div>
    </L2Layout>
  );
}

export function BalloonsTwoScreen({ onReplay, onNext }) {
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