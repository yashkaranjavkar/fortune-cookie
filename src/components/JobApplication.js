import React, { useMemo, useRef } from 'react';
import { track, identify, startTimer } from '../analytics';
import MultiSelect from './MultiSelect';
import SearchableDropdown from './SearchableDropdown';
import FactoryFront, { Ledger, LedgerButton, SEAL_ICONS } from './FactoryFront';
import { regions, ageGroups, baseInterests } from '../data/constants';
import { getRelatedInterests } from '../utils/relatedInterests';
import { playSound } from '../sounds';

export default function JobApplication({ age, setAge, region, setRegion, interests, setInterests, onNext }) {
  const related = useMemo(() => getRelatedInterests(interests), [interests]);

  const timer = useRef(startTimer());
  const suggestionsAdded = useRef(0);

  const addRelated = (r) => {
    if (!interests.includes(r)) {
      suggestionsAdded.current += 1;
      track('interest_suggestion_added', { interest: r, from_picks: interests });
      setInterests([...interests, r]);
    }
  };

  const isValid = age && region && interests.length > 0;

  const handleNext = () => {
    const custom = interests.filter(i => !baseInterests.includes(i));
    track('application_submitted', {
      age_group: age,
      region,
      interests,
      interest_count: interests.length,
      custom_interests: custom,
      suggestions_added: suggestionsAdded.current,
      decision_ms: timer.current(),
    });
    identify({ age_group: age, region, interests });
    onNext();
  };

  return (
    <FactoryFront>
      <Ledger
        kicker="Tell the factory a little about yourself."
        icon={SEAL_ICONS.form}
        title="Job Application"
        subtitle="Kindly fill your details to proceed with the application."
        footer={<LedgerButton onClick={handleNext} disabled={!isValid}>Next</LedgerButton>}
      >
        <div className="ff-field">
          <span className="ff-field-label">Age <span className="ff-req">*</span></span>
          <div className="ff-radios" role="radiogroup" aria-label="Age">
            {ageGroups.map(g => (
              <label key={g} className={`ff-radio${age === g ? ' checked' : ''}`}>
                <input
                  type="radio"
                  name="age"
                  value={g}
                  checked={age === g}
                  onChange={() => { setAge(g); playSound('select'); }}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div className="ff-field">
          <span className="ff-field-label">Region <span className="ff-req">*</span></span>
          <SearchableDropdown
            options={regions}
            value={region}
            onSelect={setRegion}
            placeholder="Choose from options"
          />
        </div>

        <div className="ff-field">
          <span className="ff-field-label">Interests <span className="ff-req">*</span></span>
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
            storageKey="interests"
            related={related}
            onAddRelated={addRelated}
          />
        </div>

        {related.length > 0 && (
          <div className="ff-field">
            <span className="ff-field-label ff-field-label-soft">You might also like</span>
            <div className="related-chips">
              {related.map(r => (
                <button key={r} type="button" className="related-chip" onClick={() => addRelated(r)}>
                  {r} +
                </button>
              ))}
            </div>
          </div>
        )}
      </Ledger>
    </FactoryFront>
  );
}
