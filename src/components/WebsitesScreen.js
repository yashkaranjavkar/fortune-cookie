import React, { useMemo, useState } from 'react';
import { generateWebsites } from '../utils/generateWebsites';

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
    <div className="screen websites-screen">
      <div className="card two-col">
        <div className="left-col">
          <div className="title">Choose familiar websites</div>
          <p className="subtitle">Choose at least 5 from the available options which you find most familiar</p>
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
        <div className="right-col">
          <img src="https://via.placeholder.com/300x300?text=F.C.I." alt="FCI Logo" className="logo-placeholder" />
        </div>
      </div>
      <button className="next-btn" onClick={onNext} disabled={!canProceed}>Next</button>
    </div>
  );
}