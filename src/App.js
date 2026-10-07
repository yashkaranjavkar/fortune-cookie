import React, { useState, useEffect, useRef } from 'react';
//import './design-system/tokens.css';
import './assets/wisecrack-ui-kit/wisecrack-ui-kit/wisecrack-colors.css';
import './App.css';
import { CurrencyContext, currencyFor } from './utils/currency';
import { SECTIONS, GAME_FLOW } from './config/gameFlow';
import { preloadSounds, playSound } from './sounds';
import SoundToggle from './components/SoundToggle';
import { useMascot } from './components/mascot';
import StationTransitionScreen from './components/StationTransitionScreen';
import RoomIntroScreen from './components/RoomIntroScreen';
import { SECTION_STOPS } from './config/stations';
import { PlayerLookContext } from './utils/playerLook';
import { startAmbience, stopAmbience } from './ambience';
import { AMBIENCE } from './config/ambience';
import { initAnalytics, setContext, track, enterScreen } from './analytics';
import { useStageCursor } from './utils/cursor';

initAnalytics({ gameFlow: GAME_FLOW });

// Sections that come before the player has been trained (no chef's hat yet)
const PRE_TRAINING_SECTIONS = ['opening', 'job'];

// Runs whichever sections GAME_FLOW names, in that order (see src/config/gameFlow.js).
// Sections are self-contained - the only things that ever need to cross a section
// boundary are the chosen region (for currency, shown across many later screens) and
// whether the one-time inspection tutorial has already played.
//
// Between sections, the player walks across the factory floor plan from where the
// finished section ended to where the next one starts, then sees the "Now entering"
// card for that room - each switchable per section via walkIn / roomIntroIn in
// SECTION_STOPS (src/config/stations.js). GAME_FLOW can be reordered freely.
function App() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [phase, setPhase] = useState('section'); // 'section' | 'walk' | 'roomIntro'
  const [region, setRegion] = useState('');
  const [tutorialShown, setTutorialShown] = useState(false);

  const sectionKey = GAME_FLOW[sectionIndex];
  const Section = SECTIONS[sectionKey];
  const nextSectionKey = GAME_FLOW[sectionIndex + 1];
  const fromStops = SECTION_STOPS[sectionKey];
  const toStops = SECTION_STOPS[nextSectionKey];

  // The inspector earns their chef's hat once training is done - so it's on from the
  // walk out of the Training section onwards (but not during Training's own walks).
  // If this GAME_FLOW skips training, they get it once past the pre-training screens.
  const trainingIndex = GAME_FLOW.indexOf('training');
  const chefHat = trainingIndex === -1
    ? !PRE_TRAINING_SECTIONS.includes(sectionKey)
    : sectionIndex > trainingIndex || (sectionIndex === trainingIndex && phase !== 'section');

  const startNextSection = () => {
    setSectionIndex(i => i + 1);
    setPhase('section');
  };
  const showRoomIntroOrStart = () => {
    if (toStops && toStops.roomIntroIn) setPhase('roomIntro');
    else startNextSection();
  };
  // Analytics: every event is tagged with the current section + phase. Set during render
  // (not in an effect) so screens inside the section, whose effects run first, already
  // see the right section.
  setContext({ section: sectionKey || null, phase });
  const sectionStartRef = useRef(null);
  useEffect(() => {
    if (phase !== 'section' || !sectionKey) return;
    sectionStartRef.current = performance.now();
    track('section_start', { section: sectionKey, index: sectionIndex });
  }, [sectionKey, sectionIndex, phase]);
  // No cursor while the player walks across the factory map - there's nothing to click
  useStageCursor(phase === 'walk' ? 'hidden' : null);
  // The walk + "Now entering" card are screens of their own
  useEffect(() => {
    if (phase === 'walk') enterScreen(`walk_to_${toStops ? toStops.start : 'next'}`);
    if (phase === 'roomIntro') enterScreen(`room_intro_${toStops ? toStops.start : 'next'}`);
  }, [phase]); // eslint-disable-line

  const handleSectionComplete = () => {
    track('section_complete', {
      section: sectionKey,
      duration_ms: sectionStartRef.current ? Math.round(performance.now() - sectionStartRef.current) : null,
    });
    // Already standing where the next section starts (e.g. Training ends in the
    // Briefing Room, where Level 1's rules begin) - no walk, no "Now entering" card
    const alreadyThere = fromStops && toStops && fromStops.end === toStops.start;
    if (!nextSectionKey) setSectionIndex(i => i + 1); // past the end - renders nothing
    else if (alreadyThere) startNextSection();
    else if (toStops && toStops.walkIn) setPhase('walk');
    else showRoomIntroOrStart();
  };

  // Ambient bakery music + sounds play in the sections listed in src/config/ambience.js
  // (the opening and onboarding by default), carry on through the walk between two of
  // them, and fade out once the game moves on to any other section.
  const ambienceOn = AMBIENCE.sections.includes(sectionKey)
    && (phase === 'section' || AMBIENCE.sections.includes(nextSectionKey));
  useEffect(() => {
    if (ambienceOn) startAmbience();
    else stopAmbience();
  }, [ambienceOn]);
  useEffect(() => () => stopAmbience(), []);

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
     <PlayerLookContext.Provider value={{ chefHat }}>
      <div className="app">
        <SoundToggle />
        {phase === 'section' && Section && (
          <Section
            onComplete={handleSectionComplete}
            onRegionChange={setRegion}
            tutorialShown={tutorialShown}
            onTutorialShown={() => setTutorialShown(true)}
          />
        )}
        {phase === 'walk' && (
          <StationTransitionScreen
            fromKey={fromStops && fromStops.end}
            toKey={toStops && toStops.start}
            subtitle={toStops && toStops.title}
            onNext={showRoomIntroOrStart}
          />
        )}
        {phase === 'roomIntro' && (
          <RoomIntroScreen
            stopKey={toStops && toStops.start}
            subtitle={toStops && toStops.title}
            onDone={startNextSection}
          />
        )}
      </div>
     </PlayerLookContext.Provider>
    </CurrencyContext.Provider>
  );
}

export default App;
