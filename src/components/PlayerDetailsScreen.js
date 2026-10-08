import React, { useRef } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { designations, regions } from '../data/constants';
import { track, identify, startTimer } from '../analytics';
import './PlayerDetailsScreen.css';

// The three details asked before the game starts (the "quickStart" flow, see
// src/config/gameFlow.js): Employee ID, designation and region. Deliberately plain -
// no game branding, art or sound - since the game itself hasn't started yet.
export default function PlayerDetailsScreen({
  employeeId, setEmployeeId, designation, setDesignation, region, setRegion, onConfirm,
}) {
  const canContinue = Boolean(employeeId.trim() && designation && region);
  const timer = useRef(startTimer());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canContinue) return;
    const isCustom = !designations.includes(designation);
    track('player_details_submitted', {
      employee_id: employeeId.trim(),
      designation,
      designation_is_custom: isCustom,
      region,
      decision_ms: timer.current(),
    });
    identify({ employee_id: employeeId.trim(), designation, designation_is_custom: isCustom, region });
    onConfirm();
  };

  return (
    <div className="pd-screen">
      <form className="pd-card" onSubmit={handleSubmit}>
        <h1 className="pd-title">Enter your details</h1>
        <p className="pd-sub">All three are required.</p>

        <div className="pd-field">
          <label className="pd-label" htmlFor="pd-emp-id">TCS Employee ID</label>
          <input
            id="pd-emp-id"
            className="pd-input"
            type="text"
            inputMode="numeric"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. 975211"
            autoComplete="off"
          />
        </div>

        <div className="pd-field">
          <span className="pd-label">Designation</span>
          <SearchableDropdown
            options={designations}
            value={designation}
            onSelect={setDesignation}
            placeholder="Choose from options"
            allowAdd={true}
            storageKey="designations"
            silent
          />
        </div>

        <div className="pd-field">
          <span className="pd-label">Region</span>
          <SearchableDropdown
            options={regions}
            value={region}
            onSelect={setRegion}
            placeholder="Choose from options"
            silent
          />
        </div>

        <button type="submit" className="pd-btn" disabled={!canContinue} data-sound="none">Continue</button>
      </form>
    </div>
  );
}
