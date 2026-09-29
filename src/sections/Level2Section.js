import React, { useState } from 'react';
import SectionRunner from './SectionRunner';
import { LEVEL2_STEPS } from '../config/steps/level2';

// Level 2: rules -> 5-cookie sorting game -> mark -> inspect -> results. The actual
// screen order lives in src/config/steps/level2.js.
export default function Level2Section({ onComplete, tutorialShown, onTutorialShown }) {
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [markedFortunes, setMarkedFortunes] = useState([]);
  const [inspectionScore, setInspectionScore] = useState(0);
  const [sortingScore, setSortingScore] = useState(0);

  const context = {
    onComplete, tutorialShown, onTutorialShown,
    faultyItems, setFaultyItems,
    approvedItems, setApprovedItems,
    markedFortunes, setMarkedFortunes,
    inspectionScore, setInspectionScore,
    sortingScore, setSortingScore,
  };

  return <SectionRunner steps={LEVEL2_STEPS} context={context} />;
}
