import React from 'react';
import SearchableDropdown from './SearchableDropdown';
import { designations } from '../data/constants';

export default function StartScreen({ employeeId, setEmployeeId, designation, setDesignation, onConfirm }) {
  return (
    <div className="screen">
      <div className="card">
        <div className="title">START SCREEN</div>
        <div className="form-group">
          <label>TCS Emp. ID*</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="975211"
          />
        </div>
        <div className="form-group">
          <label>Designation*</label>
          <SearchableDropdown
            options={designations}
            value={designation}
            onSelect={setDesignation}
            placeholder="Choose from options"
            allowAdd={true}
          />
        </div>
        <button className="next-btn" onClick={onConfirm} disabled={!employeeId || !designation}>
          I Confirm
        </button>
      </div>
    </div>
  );
}