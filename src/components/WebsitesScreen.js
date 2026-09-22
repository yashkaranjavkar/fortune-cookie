import React, { useMemo, useState } from 'react';
import './WebsitesScreen.css';
import { generateWebsiteCategories } from '../utils/generateWebsites';
import { CATEGORIES, PICK_PER_CATEGORY } from '../data/websiteCategories';
import fciLogo from '../assets/fci-logo.png';

export default function WebsitesScreen({ userData, onNext }) {
  // One list of selected sites per category, e.g. { work: ['github.com', ...], ... }
  const [selected, setSelected] = useState(() =>
    Object.fromEntries(CATEGORIES.map(c => [c.key, []]))
  );

  // Keyed on the answers themselves so the lists stay stable while the screen is open
  const answers = JSON.stringify(userData);
  const categories = useMemo(() => generateWebsiteCategories(JSON.parse(answers)), [answers]);

  const toggleWebsite = (categoryKey, site) => {
    setSelected(prev => {
      const current = prev[categoryKey];
      if (current.includes(site)) {
        return { ...prev, [categoryKey]: current.filter(s => s !== site) };
      }
      if (current.length >= PICK_PER_CATEGORY) return prev; // already picked 3 in this category
      return { ...prev, [categoryKey]: [...current, site] };
    });
  };

  const canProceed = CATEGORIES.every(c => selected[c.key].length === PICK_PER_CATEGORY);

  return (
    <div className="flow-screen">
      <div className="flow-card websites-card">
        <div className="title">Choose familiar websites</div>
        <p className="subtitle">
          Pick {PICK_PER_CATEGORY} websites from each category below that you find most familiar
        </p>

        <div className="websites-content">
          {/* LEFT: One section per category */}
          <div className="websites-left">
            {CATEGORIES.map(({ key, label }) => {
              const count = selected[key].length;
              const full = count === PICK_PER_CATEGORY;
              return (
                <div className={`website-category${full ? ' complete' : ''}`} key={key}>
                  <div className="website-category-head">
                    <span className="website-category-label">{label}</span>
                    <span className={`website-category-count${full ? ' complete' : ''}`}>
                      {count}/{PICK_PER_CATEGORY}
                    </span>
                  </div>
                  <div className="website-grid">
                    {categories[key].map(site => {
                      const isSelected = selected[key].includes(site);
                      const disabled = !isSelected && full;
                      return (
                        <button
                          key={site}
                          className={`website-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleWebsite(key, site)}
                          disabled={disabled}
                        >
                          {site}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
