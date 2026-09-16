import React, { useMemo, useState } from 'react';
import { generateWebsites } from '../utils/generateWebsites';
import fciLogo from '../assets/fci-logo.png';

export default function WebsitesScreen({ userData, onNext }) {
  const [selected, setSelected] = useState([]);

  const websites = useMemo(() => generateWebsites(userData), [userData]);

  const toggleWebsite = (site) => {
    if (selected.includes(site)) {
      setSelected(selected.filter(s => s !== site));
    } else {
      setSelected([...selected, site]);
    }
  };

  const canProceed = selected.length >= 5;

  return (
    <div className="websites-screen">
      <div className="websites-card">
        <div className="websites-title">Choose familiar websites</div>

        <div className="websites-content">
          {/* LEFT: Instructions + Website Buttons */}
          <div className="websites-left">
            <p className="websites-subtitle">
              Choose at least 5 from the available options which you find most familiar
            </p>
            <div className="website-grid">
              {websites.map(site => (
                <button
                  key={site}
                  className={`website-btn ${selected.includes(site) ? 'selected' : ''}`}
                  onClick={() => toggleWebsite(site)}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: FCI Logo */}
          <div className="websites-right">
            <img src={fciLogo} alt="FCI Logo" className="websites-logo" />
          </div>
        </div>

        <button
          className="next-btn"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next
        </button>
      </div>
    </div>
  );
}