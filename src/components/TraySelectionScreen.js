import React from 'react';
import TrayFrame from './TrayFrame';
import cookieWhole from '../assets/Drawings/fortune cookie.png';
// an opened bunch shows broken-open fortune cookies with their slips showing
import cookieBroken from '../assets/Drawings/fortune break.png';

// A "bunch" is 4 individual cookies clustered together, not one big cookie
const CookieBunch = ({ broken, className = '' }) => (
  <div className={`cookie-bunch ${className}`}>
    {Array.from({ length: 4 }).map((_, i) => (
      <img key={i} src={broken ? cookieBroken : cookieWhole} alt="" className="cookie-bunch-item" aria-hidden="true" />
    ))}
  </div>
);

// Small preview tray thumbnail
// scale = size relative to the active tray; it shrinks with distance from it
const SCALE_BY_DISTANCE = { 1: 0.42, 2: 0.28 };

const TrayPreview = ({ broken = false, distance = 1 }) => (
  <div className="tray-preview-thumb" style={{ '--scale': SCALE_BY_DISTANCE[distance] || 0.22 }}>
    <TrayFrame type="baking" className="tray-preview-bg" />
    <div className="tray-preview-bunches">
      <CookieBunch broken={broken} className="tray-preview-bunch" />
      <CookieBunch broken={broken} className="tray-preview-bunch" />
    </div>
  </div>
);

export default function TraySelectionScreen({ trayNumber, totalTrays = 3, brokenBunches, onSelectBunch }) {
  const completedTrays = trayNumber;                      // Trays to the left
  const upcomingTrays = totalTrays - trayNumber - 1;      // Trays to the right

  const isBunch0Broken = brokenBunches.includes(0);
  const isBunch1Broken = brokenBunches.includes(1);

  return (
    <div className="tray-selection-screen carousel-mode training-zone">
      <div className="tz-title">Training Zone</div>

      <div className="tray-carousel">
        {/* LEFT: Completed trays */}
        <div className="carousel-side left-side">
          {Array.from({ length: completedTrays }).map((_, i) => (
            <div key={i} className="carousel-preview completed">
              <TrayPreview broken={true} distance={completedTrays - i} />
            </div>
          ))}
        </div>

        {/* CENTER: Active tray */}
        <div className="carousel-center">
          {/* Guide rail the trays slide along, and the active placement zone */}
          <div className="tz-rail" aria-hidden="true" />
          <div className="tz-zone" aria-hidden="true" />

          <div className="instruction-bar">
            Select any bunch from this tray to break through and see the fortunes inside.
          </div>
          <div className="tray-container active-tray">
            <TrayFrame type="baking" />
            {/* Left bunch */}
            <div
              className={'bunch' + (isBunch0Broken ? ' opened' : '')}
              onClick={() => { if (!isBunch0Broken) onSelectBunch(0); }}
              style={{ opacity: isBunch0Broken ? 0.35 : 1 }}
            >
              <CookieBunch broken={isBunch0Broken} />
            </div>

            {/* Right bunch */}
            <div
              className={'bunch' + (isBunch1Broken ? ' opened' : '')}
              onClick={() => { if (!isBunch1Broken) onSelectBunch(1); }}
              style={{ opacity: isBunch1Broken ? 0.35 : 1 }}
            >
              <CookieBunch broken={isBunch1Broken} />
            </div>
          </div>
          <div className="tz-plaque">TRAY {trayNumber + 1} OF {totalTrays}</div>
        </div>

        {/* RIGHT: Upcoming trays */}
        <div className="carousel-side right-side">
          {Array.from({ length: upcomingTrays }).map((_, i) => (
            <div key={i} className="carousel-preview upcoming">
              <TrayPreview broken={false} distance={i + 1} />
            </div>
          ))}
        </div>
      </div>

      <div className="tray-dots">
        {Array.from({ length: totalTrays }).map((_, i) => (
          <span key={i} className={`dot ${trayNumber === i ? 'active' : ''}`}></span>
        ))}
      </div>
    </div>
  );
}
