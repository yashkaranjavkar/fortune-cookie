import React, { useState } from 'react';
import SectionRunner from './SectionRunner';
import { LEVEL1_STEPS } from '../config/steps/level1';

// Level 1: rules -> 4-cookie sorting game -> mark -> inspect -> results. The actual
// screen order lives in src/config/steps/level1.js.
// tutorialShown/onTutorialShown: the one-time inspection walkthrough shows here only if
// no earlier section in this run has already shown it (see InspectionTutorialStep).
export default function Level1Section({ onComplete, tutorialShown, onTutorialShown }) {
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

  return <SectionRunner steps={LEVEL1_STEPS} context={context} />;
}
