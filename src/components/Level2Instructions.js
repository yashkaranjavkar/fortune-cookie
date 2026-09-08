import React, { useState } from 'react';

// Import Level 1 assets for the 30 seconds screen
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
        
        {/* The Faulty Tray with the actual cookies inside */}
        <div className="drop-zone faulty-zone compact-tray">
          <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
          
          <div className="tray-contents">
            <img src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
            <img src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
          </div>
          
          <div className="tray-label faulty-label">Faulty Tray</div>
        </div>

        {/* The 30 Second Timer */}
        <div className="timer-circle">30</div>

      </div>
      
      <div className="sample-fortune">
        Your favorite artist has uploaded their new album on <span className="invalid-url">http://www.youtube.com/</span> 🖊️
      </div>

    </LightLayout>
  );
}

export function InspectionIntroScreen({ onNext, onBack, markedFortunes }) {
  const count = markedFortunes && markedFortunes.length > 0 ? markedFortunes.length : 2;

  return (
    <div className="instruction-screen">
      {onBack && <button className="back-btn" onClick={onBack}>←</button>}
      
      <div className="instruction-card">
        <div className="title">Once you send your marked fortunes, it goes in the inspection room</div>
        <div className="level2-content">
          
          <div className="inspection-machine">
            <button className="machine-button" onClick={onNext}>
              <div className="machine-body">
                 <div className="machine-red-btn"></div>
              </div>
            </button>
            <span className="machine-arrow">←</span>
            <span className="machine-text">Press this <b>RED</b> button</span>
          </div>

          {/* Shows the marked fortunes lined up with cookies */}
          <div className="inspection-fortunes-list">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="inspection-fortune-row">
                <img src={faultyCookie} alt="Broken Cookie" className="inspection-cookie-img" />
                <div className="sample-fortune">
                  {index === 0 ? "Your path to success is beautifully customized, matching the perfect recommendations found on free-amazon.com. 🎀⭐" :
                   index === 1 ? "A meaningful connection made today on linkedin.com will open doors to unexpected opportunities tomorrow. 💼✨" :
                   index === 2 ? "Your creative spark will lead to a unique project, celebrated on deviantart.org. 🎨🚀" :
                   "An upcoming payment is waiting for you at paypa1-secure.com. 💰🔒"}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export function TorchInspectScreen({ onNext }) {
  const [torchValue, setTorchValue] = useState(0);
  const isRevealed = torchValue > 50; // Reveal when slider passes 50%

  return (
    <DarkLayout>
      <div className="torch-text"> Slide the torch light to inspect the fortune</div>

      {/* Combined Wrapper for Slider, Torch Handle, and Glow */}
      <div className="torch-slider-wrapper">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={torchValue} 
          onChange={(e) => setTorchValue(e.target.value)}
          className="torch-slider"
        />
        
        {/* This moves with the slider and holds both the handle and the glow */}
        <div className="torch-handle-container" style={{ left: `${torchValue}%` }}>
          <div className="torch-handle"></div>
          <div className="torch-light"></div>
        </div>
      </div>

      {/* The Fortune Text */}
      <div className={`fortune-reveal ${isRevealed ? 'revealed' : ''}`}>
        <div className="sample-fortune-dark">
          Your favorite artist has uploaded their new album on <span className="url-correct">http://www.youtube.com/</span>
        </div>
      </div>

      {isRevealed && (
        <div className="legend-results">
          <div className="legend-item">
            <div className="legend-color correct">Correct identification</div>
            <p>This part is invalid<br/>& you marked it</p>
          </div>
          <div className="legend-item">
            <div className="legend-color wrong">Wrong identification</div>
            <p>This part is not invalid<br/>but you marked it</p>
          </div>
          <div className="legend-item">
            <div className="legend-color missed">Missed</div>
            <p>This part is invalid<br/>but you didn't mark it</p>
          </div>
        </div>
      )}

      {isRevealed && (
        <button className="next-btn" onClick={onNext}>Next</button>
      )}
    </DarkLayout>
  );
}

export function PaymentInspectionScreen({ onNext }) {
  return (
    <div className="payment-dark-screen">
      <div className="payment-title">Payment as per inspection</div>
      
      <div className="payment-table">
        <div className="payment-header"><span>Cases</span><span>Incentive</span></div>
        
        <div className="payment-row">
          <span>1. Correct inspection</span>
          <span className="green-incentive">......... ₹1000</span>
        </div>
        
        <div className="payment-row">
          <span>2. Partially correct inspection</span>
          <span className="grey-incentive">......... ₹0</span>
        </div>
        
        <div className="payment-row">
          <span>3. Wrong inspection</span>
          <span className="red-incentive">......... - ₹800</span>
        </div>
      </div>

      <button className="let-start-btn" onClick={onNext}>Let's Start !</button>
    </div>
  );
}

export function StartMarkingScreen({ onNext }) {
  return (
    <div className="start-marking-screen">
      {/* Faulty Tray with Label ABOVE it */}
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

      {/* Small, normal Start Marking Button */}
      <button className="let-start-btn" onClick={onNext}>Start Marking</button>
    </div>
  );
}