import React, { useState } from 'react';
import SectionRunner from './SectionRunner';
import { LEVEL3_STEPS } from '../config/steps/level3';

// Level 3: rules -> 6-cookie sorting game -> mark -> inspect -> results. The actual
// screen order lives in src/config/steps/level3.js.
export default function Level3Section({ onComplete, tutorialShown, onTutorialShown }) {
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [markedFortunes, setMarkedFortunes] = useState([]);

  const context = {
    onComplete, tutorialShown, onTutorialShown,
    faultyItems, setFaultyItems,
    approvedItems, setApprovedItems,
    markedFortunes, setMarkedFortunes,
  };

  return <SectionRunner steps={LEVEL3_STEPS} context={context} />;
}
