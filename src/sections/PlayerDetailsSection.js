import React, { useState } from 'react';
import SectionRunner from './SectionRunner';
import { PLAYER_DETAILS_STEPS } from '../config/steps/playerDetails';

// Before the game starts (quickStart flow): Employee ID, designation and country, the
// kinds of websites they use most, then a short "connecting" loader. The chosen country
// is reported upward because the currency shown later in the game depends on it.
// The screen order lives in src/config/steps/playerDetails.js.
export default function PlayerDetailsSection({ onComplete, onRegionChange }) {
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [region, setRegion] = useState(''); // the country's name
  const [dailyCategories, setDailyCategories] = useState([]);

  const handleSetRegion = (value) => {
    if (value !== region) setDailyCategories([]); // the options depend on the country
    setRegion(value);
    if (onRegionChange) onRegionChange(value);
  };

  const context = {
    onComplete,
    employeeId, setEmployeeId,
    designation, setDesignation,
    region, setRegion: handleSetRegion,
    dailyCategories, setDailyCategories,
  };

  return <SectionRunner steps={PLAYER_DETAILS_STEPS} context={context} />;
}
