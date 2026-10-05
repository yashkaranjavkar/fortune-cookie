import React, { useRef } from 'react';
import SearchableDropdown from './SearchableDropdown';
import FactoryFront, { Ledger, SEAL_ICONS } from './FactoryFront';
import { designations } from '../data/constants';
import { track, identify, startTimer } from '../analytics';

// Clock in at the factory front: the inspector signs the ledger with their ID and
// designation before stepping onto the factory floor.
export default function StartScreen({ employeeId, setEmployeeId, designation, setDesignation, onConfirm }) {
  const canClockIn = Boolean(employeeId && designation);
  const timer = useRef(startTimer());

  return (
    <FactoryFront>
      <Ledger
        kicker="Welcome, Inspector. The night batch is waiting."
        as="form"
        icon={SEAL_ICONS.magnifier}
        title="Clock in for your shift"
        subtitle="Sign the inspector's ledger before you step onto the factory floor."
        onSubmit={(e) => {
          e.preventDefault();
          if (!canClockIn) return;
          const isCustom = !designations.includes(designation);
          track('player_clock_in', {
            employee_id: employeeId,
            designation,
            designation_is_custom: isCustom,
            decision_ms: timer.current(),
          });
          identify({ employee_id: employeeId, designation, designation_is_custom: isCustom });
          onConfirm();
        }}
        footer={
          <>
            <button type="submit" className="ff-btn" disabled={!canClockIn}>Clock in</button>
            <p className="ff-footnote">Your first batch is waiting in the Inspection Room.</p>
          </>
        }
      >
        <div className="ff-field">
          <label className="ff-field-label" htmlFor="ff-emp-id">TCS Emp. ID <span className="ff-req">*</span></label>
          <input
            id="ff-emp-id"
            className="ff-input"
            type="text"
            inputMode="numeric"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. 975211"
            autoComplete="off"
          />
        </div>

        <div className="ff-field">
          <label className="ff-field-label">Designation <span className="ff-req">*</span></label>
          <SearchableDropdown
            options={designations}
            value={designation}
            onSelect={setDesignation}
            placeholder="Choose from options"
            allowAdd={true}
            storageKey="designations"
          />
        </div>
      </Ledger>
    </FactoryFront>
  );
}
