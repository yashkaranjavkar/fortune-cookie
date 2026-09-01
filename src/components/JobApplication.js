import React, { useState, useEffect } from 'react';
import MultiSelect from './MultiSelect';
import SearchableDropdown from './SearchableDropdown';
import { regions, ageGroups, baseInterests, relatedInterestsMap } from '../data/constants';

// ADD THIS LINE! It looks for the image inside your src/assets folder
import fciLogo from '../assets/fci-logo.png'; 

export default function JobApplication({ age, setAge, region, setRegion, interests, setInterests, onNext }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const relatedSet = new Set();
    interests.forEach(interest => {
      if (relatedInterestsMap[interest]) {
        relatedInterestsMap[interest].forEach(r => relatedSet.add(r));
      }
    });
    setRelated(Array.from(relatedSet).filter(r => !interests.includes(r)));
  }, [interests]);

  const addRelated = (r) => {
    if (!interests.includes(r)) {
      setInterests([...interests, r]);
    }
  };

  const isValid = age && region && interests.length > 0;

  return (
    <div className="screen">
      <div className="card">
        <div className="title">Job Application</div>
        <p className="subtitle">Kindly fill your details to proceed with the application</p>

        <div className="two-col">
          <div className="left-col">
            <div className="form-group">
              <label>Age*</label>
              <div className="radio-group">
                {ageGroups.map(g => (
                  <label key={g} className="radio-label">
                    <input
                      type="radio"
                      name="age"
                      value={g}
                      checked={age === g}
                      onChange={() => setAge(g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Region*</label>
              <SearchableDropdown
                options={regions}
                value={region}
                onSelect={setRegion}
                placeholder="Choose from options"
              />
            </div>

            <div className="form-group">
              <label>Interests*</label>
              <MultiSelect
                options={baseInterests}
                selected={interests}
                onToggle={(interest) => {
                  if (interests.includes(interest)) {
                    setInterests(interests.filter(i => i !== interest));
                  } else {
                    setInterests([...interests, interest]);
                  }
                }}
                placeholder="Choose from options"
                allowAdd={true}
              />
            </div>

            {related.length > 0 && (
              <div className="related-section">
                <label>Related</label>
                <div className="related-chips">
                  {related.map(r => (
                    <button key={r} className="related-chip" onClick={() => addRelated(r)}>
                      {r} +
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="right-col">
            {/* CHANGE THIS LINE: Use the imported variable instead of the string path */}
            <img src={fciLogo} alt="FCI Logo" className="fci-logo" />
          </div>
        </div>

        <button className="next-btn" onClick={onNext} disabled={!isValid}>Next</button>
      </div>
    </div>
  );
}