import React, { useState } from 'react';
import './design-system/tokens.css';
import './App.css';
import { CurrencyContext, currencyFor } from './utils/currency';
import { SECTIONS, GAME_FLOW } from './config/gameFlow';

// Runs whichever sections GAME_FLOW names, in that order (see src/config/gameFlow.js).
// Sections are self-contained - the only things that ever need to cross a section
// boundary are the chosen region (for currency, shown across many later screens) and
// whether the one-time inspection tutorial has already played.
function App() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [region, setRegion] = useState('');
  const [tutorialShown, setTutorialShown] = useState(false);

  const sectionKey = GAME_FLOW[sectionIndex];
  const Section = SECTIONS[sectionKey];

  return (
    <CurrencyContext.Provider value={currencyFor(region)}>
      <div className="app">
        {Section && (
          <Section
            onComplete={() => setSectionIndex(i => i + 1)}
            onRegionChange={setRegion}
            tutorialShown={tutorialShown}
            onTutorialShown={() => setTutorialShown(true)}
          />
        )}
      </div>
    </CurrencyContext.Provider>
  );
}

export default App;
