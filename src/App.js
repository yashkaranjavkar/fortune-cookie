import React, { useState, useEffect } from 'react';
import './design-system/tokens.css';
import './assets/wisecrack-ui-kit/wisecrack-ui-kit/wisecrack-colors.css';
import './App.css';
import { CurrencyContext, currencyFor } from './utils/currency';
import { SECTIONS, GAME_FLOW } from './config/gameFlow';
import { preloadSounds, playSound } from './sounds';
import SoundToggle from './components/SoundToggle';

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

  useEffect(() => {
    preloadSounds();

    // Every button click in the game gets the same "button-press" sound, without
    // having to wire it into every single button individually. A button can opt into
    // a more specific sound instead (e.g. "progress-munch") via data-sound="...",
    // or opt out entirely with data-sound="none" (the sound toggle itself does this).
    const handleClick = (e) => {
      const button = e.target.closest('button');
      if (!button) return;
      const override = button.dataset.sound;
      if (override === 'none') return;
      playSound(override || 'button-press');
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <CurrencyContext.Provider value={currencyFor(region)}>
      <div className="app">
        <SoundToggle />
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
