import React, { useMemo, useRef, useState } from 'react';
import { track, identify, startTimer } from '../analytics';
import './WebsitesScreen.css';
import FactoryFront, { Ledger, LedgerButton, SEAL_ICONS } from './FactoryFront';
import { generateWebsiteCategories } from '../utils/generateWebsites';
import { CATEGORIES, PICK_PER_CATEGORY } from '../data/websiteCategories';

export default function WebsitesScreen({ userData, onNext }) {
  // One list of selected sites per category, e.g. { work: ['github.com', ...], ... }
  const [selected, setSelected] = useState(() =>
    Object.fromEntries(CATEGORIES.map(c => [c.key, []]))
  );

  // Keyed on the answers themselves so the lists stay stable while the screen is open
  const answers = JSON.stringify(userData);
  const categories = useMemo(() => generateWebsiteCategories(JSON.parse(answers)), [answers]);

  const timer = useRef(startTimer());
  const toggles = useRef(0);

  const toggleWebsite = (categoryKey, site) => {
    const current = selected[categoryKey];
    const isSelected = current.includes(site);
    if (!isSelected && current.length >= PICK_PER_CATEGORY) return; // already picked 3 in this category
    toggles.current += 1;
    track('website_toggled', {
      category: categoryKey,
      site,
      selected: !isSelected,
      position: categories[categoryKey].indexOf(site), // where it sat in the offered list
      picked_in_category: isSelected ? current.length - 1 : current.length + 1,
    });
    setSelected(prev => ({
      ...prev,
      [categoryKey]: isSelected ? prev[categoryKey].filter(s => s !== site) : [...prev[categoryKey], site],
    }));
  };

  const completeCount = CATEGORIES.filter(c => selected[c.key].length === PICK_PER_CATEGORY).length;
  const canProceed = completeCount === CATEGORIES.length;

  const handleNext = () => {
    track('websites_submitted', {
      selected,
      offered: categories,
      toggle_count: toggles.current,
      decision_ms: timer.current(),
    });
    identify({ familiar_websites: selected });
    onNext();
  };

  return (
    <FactoryFront>
      <Ledger
        kicker="Every inspector knows their way around the web."
        size="lg"
        scroll
        icon={SEAL_ICONS.globe}
        title="Choose familiar websites"
        subtitle={`Pick ${PICK_PER_CATEGORY} websites from each category below that you find most familiar.`}
        footer={
          <div className="ff-websites-footer">
            <span className={`ff-websites-progress${canProceed ? ' done' : ''}`}>
              {completeCount}/{CATEGORIES.length} categories done
            </span>
            <LedgerButton onClick={handleNext} disabled={!canProceed}>Next</LedgerButton>
          </div>
        }
      >
        <div className="ff-websites">
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
                        type="button"
                        className={`website-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleWebsite(key, site)}
                        disabled={disabled}
                        data-sound="select"
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
      </Ledger>
    </FactoryFront>
  );
}
