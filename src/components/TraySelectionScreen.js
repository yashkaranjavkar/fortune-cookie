import React from 'react';
// Import the images
import trayBg from '../assets/cookies/tray.png';
import bunch from '../assets/cookies/bunch.png';
import bunchBroken from '../assets/cookies/bunch-broken.png';

export default function TraySelectionScreen({ trayNumber, brokenBunch, onSelectBunch }) {
  return (
    <div className="tray-selection-screen">
      <div className="instruction-bar">
        Select any bunch from this tray to break through and see the fortunes inside.
      </div>
      
      {/* Horizontal Tray Container */}
      <div className="tray-container" style={{ backgroundImage: `url(${trayBg})`, backgroundSize: 'cover' }}>
        
        {/* Left Bunch - Uses the same image, swaps to broken if selected */}
        <div className="bunch" onClick={() => !brokenBunch && onSelectBunch(0)}>
          <img 
            src={brokenBunch === 0 ? bunchBroken : bunch} 
            alt="Bunch Left" 
            className="bunch-img"
          />
        </div>

        {/* Right Bunch - Uses the same image, swaps to broken if selected */}
        <div className="bunch" onClick={() => !brokenBunch && onSelectBunch(1)}>
          <img 
            src={brokenBunch === 1 ? bunchBroken : bunch} 
            alt="Bunch Right" 
            className="bunch-img"
          />
        </div>

      </div>

      <div className="tray-dots">
        <span className={`dot ${trayNumber === 0 ? 'active' : ''}`}></span>
        <span className={`dot ${trayNumber === 1 ? 'active' : ''}`}></span>
        <span className={`dot ${trayNumber === 2 ? 'active' : ''}`}></span>
      </div>
    </div>
  );
}