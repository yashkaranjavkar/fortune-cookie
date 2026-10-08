import React, { useState } from 'react';
import SectionRunner from './SectionRunner';
import { PLAYER_DETAILS_STEPS } from '../config/steps/playerDetails';

// Before the game starts (quickStart flow): Employee ID, designation and region, then a
// short "connecting" loader. Like the job application, the chosen region is reported
// upward because the currency shown later in the game depends on it.
// The screen order lives in src/config/steps/playerDetails.js.
export default function PlayerDetailsSection({ onComplete, onRegionChange }) {
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [region, setRegion] = useState('');

  const handleSetRegion = (value) => {
    setRegion(value);
    if (onRegionChange) onRegionChange(value);
  };

  const context = {
    onComplete,
    employeeId, setEmployeeId,
    designation, setDesignation,
    region, setRegion: handleSetRegion,
  };

  return <SectionRunner steps={PLAYER_DETAILS_STEPS} context={context} />;
}
