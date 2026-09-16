import React from 'react';
import trayBg from '../assets/cookies/tray.png';
import bunch from '../assets/cookies/bunch.png';
import bunchBroken from '../assets/cookies/bunch-broken.png';

// Small preview tray thumbnail
const TrayPreview = ({ broken = false }) => (
  <div className="tray-preview-thumb">
    <img src={trayBg} alt="Tray preview" className="tray-preview-bg" />
    <div className="tray-preview-bunches">
      <img src={broken ? bunchBroken : bunch} alt="bunch" className="tray-preview-bunch" />
      <img src={broken ? bunchBroken : bunch} alt="bunch" className="tray-preview-bunch" />
    </div>
  </div>
);

export default function TraySelectionScreen({ trayNumber, brokenBunches, onSelectBunch }) {
  const totalTrays = 3;
  const completedTrays = trayNumber;                      // Trays to the left
  const upcomingTrays = totalTrays - trayNumber - 1;      // Trays to the right

  const isBunch0Broken = brokenBunches.includes(0);
  const isBunch1Broken = brokenBunches.includes(1);

  return (
    <div className="tray-selection-screen carousel-mode">
      <div className="instruction-bar">
        Select any bunch from this tray to break through and see the fortunes inside.
      </div>

      <div className="tray-carousel">
        {/* LEFT: Completed trays */}
        <div className="carousel-side left-side">
          {Array.from({ length: completedTrays }).map((_, i) => (
            <div key={i} className="carousel-preview completed">
              <TrayPreview broken={true} />
            </div>
          ))}
        </div>

        {/* CENTER: Active tray */}
        <div className="carousel-center">
          <div className="tray-container active-tray">
            {/* Left bunch */}
            <div
              className="bunch"
              onClick={() => !isBunch0Broken && onSelectBunch(0)}
              style={{
                cursor: isBunch0Broken ? 'default' : 'pointer',
                opacity: isBunch0Broken ? 0.35 : 1
              }}
            >
              <img 
                src={isBunch0Broken ? bunchBroken : bunch} 
                alt="Bunch Left" 
                className="bunch-img" 
              />
            </div>

            {/* Right bunch */}
            <div
              className="bunch"
              onClick={() => !isBunch1Broken && onSelectBunch(1)}
              style={{
                cursor: isBunch1Broken ? 'default' : 'pointer',
                opacity: isBunch1Broken ? 0.35 : 1
              }}
            >
              <img 
                src={isBunch1Broken ? bunchBroken : bunch} 
                alt="Bunch Right" 
                className="bunch-img" 
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Upcoming trays */}
        <div className="carousel-side right-side">
          {Array.from({ length: upcomingTrays }).map((_, i) => (
            <div key={i} className="carousel-preview upcoming">
              <TrayPreview broken={false} />
            </div>
          ))}
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