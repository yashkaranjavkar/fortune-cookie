import React, { useMemo, useRef, useState } from 'react';
import { track, identify, startTimer } from '../analytics';
import { countryByName } from '../data/countries';
import { categoryOptions, MAX_PICKS } from '../data/dailyCategories';
import './PlayerDetailsScreen.css';

// Second player-details screen: which kinds of websites the player uses most day to
// day. The options are the categories of their country's most popular domains on
// Cloudflare Radar (src/data/dailyCategories.js). Plain, like the details form - no
// game branding or sound yet.
export default function DailyCategoriesScreen({ country, picked, setPicked, onConfirm, onBack }) {
  const place = countryByName(country);
  const { options, source } = useMemo(() => categoryOptions(place && place.code), [place]);
  const timer = useRef(startTimer());
  const [limitHit, setLimitHit] = useState(false);

  const toggle = (name) => {
    if (picked.includes(name)) {
      setPicked(picked.filter(p => p !== name));
      setLimitHit(false);
    } else if (picked.length < MAX_PICKS) {
      setPicked([...picked, name]);
    } else {
      setLimitHit(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!picked.length) return;
    track('daily_categories_submitted', {
      country,
      country_code: place ? place.code : null,
      selected: picked,
      offered: options.map(o => o.name),
      source,
      decision_ms: timer.current(),
    });
    identify({ daily_categories: picked });
    onConfirm();
  };

  return (
    <div className="pd-screen">
      <form className="pd-card pd-card-wide" onSubmit={handleSubmit}>
        <h1 className="pd-title">What do you use the internet for most?</h1>
        <p className="pd-sub">
          Pick the kinds of websites you visit most in daily life - up to {MAX_PICKS}.
          {source === 'country' && <> These are the most popular in {country}.</>}
        </p>

        <div className="pd-options" role="group" aria-label="Kinds of websites">
          {options.map(({ name, examples }) => {
            const on = picked.includes(name);
            return (
              <button
                key={name}
                type="button"
                className={`pd-option${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => toggle(name)}
                data-sound="none"
              >
                <span className="pd-option-name">{name}</span>
                {examples.length > 0 && <span className="pd-option-eg">{examples.join(', ')}</span>}
              </button>
            );
          })}
        </div>

        <p className={`pd-count${limitHit ? ' full' : ''}`} aria-live="polite">
          {limitHit ? `You can pick up to ${MAX_PICKS} - remove one to choose another.` : `${picked.length} of ${MAX_PICKS} picked`}
        </p>

        <div className="pd-actions">
          {onBack && <button type="button" className="pd-btn pd-btn-ghost" onClick={onBack} data-sound="none">Back</button>}
          <button type="submit" className="pd-btn" disabled={!picked.length} data-sound="none">Continue</button>
        </div>
      </form>
    </div>
  );
}
