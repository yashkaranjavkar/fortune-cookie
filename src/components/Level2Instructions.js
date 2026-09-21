import React, { useState, useEffect } from 'react';
import { useCurrency } from '../utils/currency';
import faultyBox from '../assets/demo/faulty-box.png';
import faultyCookie from '../assets/demo/faulty-cookie.png';

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

export function ThirtySecondsScreen({ onNext, onBack }) {
  return (
    <LightLayout title="You will get 30 seconds to mark all faulty fortunes" onNext={onNext} onBack={onBack}>
      <div className="timer-thirty-layout">
        <div className="drop-zone faulty-zone compact-tray">
          <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
          <div className="tray-contents">
            <img src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
            <img src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
          </div>
          <div className="tray-label faulty-label">Faulty Tray</div>
        </div>
        <div className="timer-circle">30</div>
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
            <button className="machine-button" onClick={onNext}>
              <div className="machine-body">
                 <div className="machine-red-btn"></div>
              </div>
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
  const isRevealed = torchValue > 50;

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

  return (
    <div className="inspection-room-screen">
      <div className="inspection-title">INSPECTION ROOM</div>
      
      <div className="torch-slide-instruction">
        <div className="torch-text"> Slide the torch light to inspect the fortune</div>
      </div>

      <div className="torch-slider-wrapper">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={torchValue} 
          onChange={(e) => setTorchValue(e.target.value)}
          className="torch-slider"
        />
        <div className="torch-handle-container" style={{ left: `${torchValue}%` }}>
          <div className="torch-handle"></div>
          <div className="torch-light"></div>
        </div>
      </div>

      <div className="inspection-main-content">
        <div className="inspection-cookie-area">
          <img src={faultyCookie} alt="Broken Cookie" className="inspection-cookie-img" />
        </div>
        
        <div className="inspection-fortune-area">
          <div className={`fortune-reveal-box ${isRevealed ? 'revealed' : ''}`}>
            <div className="fortune-text-content">
              {beforeText}
              {highlightedText && <span className="highlighted-correct">{highlightedText}</span>}
              {afterText}
            </div>
          </div>
          
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

export function PaymentInspectionScreen({ onNext }) {
  const currency = useCurrency();
  return (
    <div className="payment-dark-screen">
      <div className="payment-title">Payment as per inspection</div>
      
      <div className="payment-table">
        <div className="payment-header"><span>Cases</span><span>Incentive</span></div>
        
        <div className="payment-row">
          <span>1. Correct inspection</span>
          <span className="green-incentive">......... {currency}1000</span>
        </div>
        
        <div className="payment-row">
          <span>2. Partially correct inspection</span>
          <span className="grey-incentive">......... {currency}0</span>
        </div>
        
        <div className="payment-row">
          <span>3. Wrong inspection</span>
          <span className="red-incentive">......... - {currency}800</span>
        </div>
      </div>

      <button className="let-start-btn" onClick={onNext}>Let's Start !</button>
    </div>
  );
}

export function StartMarkingScreen({ onNext }) {
  return (
    <div className="start-marking-screen">
      <div className="start-marking-tray-wrapper">
        <div className="tray-label faulty-label">Faulty Tray</div>
        <div className="drop-zone faulty-zone">
          <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
          <div className="tray-contents">
            <img src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
            <img src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
          </div>
        </div>
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

      <div className="check-samples-list">
        {[0, 1, 2].map((i) => (
          <div key={i} className="check-sample-row">
            <img src={faultyCookie} alt="Cookie" className="check-sample-cookie" />
            <div className="check-sample-blank"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsScreen({ markedFortunes, onNext }) {
  const currency = useCurrency();
  const fortunes = (markedFortunes && markedFortunes.length > 0)
    ? markedFortunes
    : [
        { fullText: "The perfect balance of code and creativity awaits you as you build your next masterpiece with auth-webflow.com. 🎨🛠️" },
        { fullText: "Your patience will soon bloom like a rare x.net in the spring rain. 🌸" },
        { fullText: "Do not fear the complex equations of life; master the mechanics of airbnb.com to find your balance. ⚖️" },
        { fullText: "An exciting new role is waiting for you; let naukri.com help you make your next bold career move. 🚀💼" },
        { fullText: "Consistency in practicing algorithms on cdn-geekforgeeks.org will soon lead to your dream tech job. 💻🌐" }
      ];

  return (
    <div className="inspection-room-screen">
      <div className="inspection-title">INSPECTION ROOM</div>

      <div className="results-container">
        {fortunes.map((fortune, index) => (
          <div key={index} className="result-row">
            <div className="result-incentive">+ {currency}1000</div>
            <div className="result-fortune">{fortune.fullText}</div>
          </div>
        ))}
      </div>

      <button className="results-next-btn" onClick={onNext}>
        Next &gt;&gt;&gt;
      </button>
    </div>
  );
}

// LEVEL 1 ENDING (Great Job Inspector)
export function WhoshhScreen({ onNext }) {
  return (
    <div className="whoshh-screen">
      <div className="whoshh-card">
        <div className="whoshh-title">Great Job Inspector!</div>
        <p className="whoshh-text">
          It was great as a new joiner. Keep it up!<br/>
          More challenges ahead.
        </p>
        <button className="whoshh-btn" onClick={onNext}>I am Ready</button>
      </div>
    </div>
  );
}

// LEVEL 2 ENDING (Whossh - Big reward)
export function WhoshhTwoScreen({ onNext }) {
  return (
    <div className="whoshh-screen">
      <div className="whoshh-card">
        <div className="whoshh-title">Whossh!</div>
        <p className="whoshh-text">
          That was tough it seems. You did good. You are soon going to<br/>
          get a big reward inspector
        </p>
        <button className="whoshh-btn" onClick={onNext}>I am Ready</button>
      </div>
    </div>
  );
}

// LEVEL 3 ENDING (Well Done - See reward)
export function WhoshhThreeScreen({ onNext }) {
  return (
    <div className="whoshh-screen">
      <div className="whoshh-card">
        <div className="whoshh-title">Well Done!</div>
        <p className="whoshh-text">
          You deserve the reward after that tiring work
        </p>
        <button className="whoshh-btn" onClick={onNext}>See reward</button>
      </div>
    </div>
  );
}