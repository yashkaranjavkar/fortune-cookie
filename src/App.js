import React, { useState, useEffect, useRef, useMemo } from 'react';
//import './design-system/tokens.css';
import './assets/wisecrack-ui-kit/wisecrack-ui-kit/wisecrack-colors.css';
import './App.css';
import './theme.css'; // the Fortunery design language, shared by every screen
import { CurrencyContext, currencyFor } from './utils/currency';
import { SECTIONS, GAME_PARTS, PART_ORDER, GAME_FLOWS, ACTIVE_FLOW } from './config/gameFlow';
import { preloadSounds, playSound } from './sounds';
import SoundToggle from './components/SoundToggle';
import { useMascot } from './components/mascot';
import StationTransitionScreen from './components/StationTransitionScreen';
import RoomIntroScreen from './components/RoomIntroScreen';
import { SECTION_STOPS } from './config/stations';
import { PlayerLookContext } from './utils/playerLook';
import { startAmbience, stopAmbience } from './ambience';
import { AMBIENCE } from './config/ambience';
import { initAnalytics, setContext, track, enterScreen, startGameClock } from './analytics';
import { useCursorVeil } from './utils/cursor';
import { ScreenCoveredContext } from './utils/screenCover';
import { FortunePlanContext, buildPartPlan, planSummary } from './utils/fortunePlan';
import { loadProgress, markPartComplete, rememberRegion, rememberInterests } from './utils/progress';
import BackendStatusBanner from './components/BackendStatusBanner';
import { ANALYTICS } from './config/analytics';
import StagesScreen, { PartCompleteScreen } from './components/StagesScreen';

const USING_PARTS = ACTIVE_FLOW === 'parts';
const sectionsOf = (partKey) => (USING_PARTS ? (GAME_PARTS[partKey] || { sections: [] }).sections : GAME_FLOWS[ACTIVE_FLOW]);

initAnalytics({ gameFlow: USING_PARTS ? PART_ORDER : GAME_FLOWS[ACTIVE_FLOW] });

// Sections shown before the game itself: plain screens, with no sound button and no
// click sounds (no music either - see src/config/ambience.js)
const PLAIN_SECTIONS = ['playerDetails', 'brand'];

// Sections that come before the player has been trained (no chef's hat yet)
const PRE_TRAINING_SECTIONS = ['playerDetails', 'brand', 'opening', 'appointment', 'job'];

// Runs the game part by part (GAME_PARTS in src/config/gameFlow.js): each part is a
// list of sections played in order, and when a part ends the stage screen shows what's
// unlocked next. Sections are self-contained - the only things that cross a section
// boundary are the chosen region (for currency, shown across many later screens) and
// the part's fortune plan: when a part starts (in Part 1, once the player has picked
// their website categories), its pre-test, level and post-test fortunes are dealt once,
// balanced around those categories (src/utils/fortunePlan.js), and shared through context.
//
// Between sections, the player walks across the factory floor plan from where the
// finished section ended to where the next one starts, then sees the "Now entering"
// card for that room - each switchable per section via walkIn / roomIntroIn in
// SECTION_STOPS (src/config/stations.js). GAME_FLOW can be reordered freely.
function App() {
  const [progress, setProgress] = useState(loadProgress);
  // The part being played; null while the stage screen is up
  // The game opens on the stage screen (pick a part); a single flow starts straight away
  const [partKey, setPartKey] = useState(() => (USING_PARTS ? null : 'flow'));
  // The part just finished, while its "Part complete" card is up
  const [finishedPart, setFinishedPart] = useState(null);
  const [run, setRun] = useState(0); // counts part starts, so replaying a part starts it fresh
  const [sectionIndex, setSectionIndex] = useState(0);
  const [phase, setPhase] = useState('section'); // 'section' | 'walk' | 'roomIntro'
  const [region, setRegion] = useState(progress.region || '');

  const GAME_FLOW = partKey ? sectionsOf(partKey) : [];
  // The categories the player picked on "What do you use the internet for most?"
  // (kept between visits), and the part start they were last picked in
  const [interests, setInterests] = useState(progress.interests || []);
  const [picksRun, setPicksRun] = useState(-1);
  // A part that asks for them (Part 1) deals its fortunes once they're in
  const awaitingPicks = GAME_FLOW.includes('playerDetails') && picksRun !== run;
  // This part's fortunes, dealt once - balanced around those categories
  const plan = useMemo(
    () => (partKey && !awaitingPicks ? buildPartPlan(partKey === 'flow' ? 'part1' : partKey, { interests }) : null),
    [partKey, run, awaitingPicks, interests] // eslint-disable-line
  );
  useEffect(() => {
    if (plan) track('fortune_plan_built', planSummary(plan));
  }, [plan]);

  const startPart = (key) => {
    track('part_start', { part: key });
    setPartKey(key);
    setRun(r => r + 1);
    setSectionIndex(0);
    setPhase('section');
    // a part without the title screen starts the game clock here instead
    if (!sectionsOf(key).includes('opening')) startGameClock({ part: key });
  };

  const finishPart = () => {
    const post = plan && plan.results.posttest;
    const accuracy = post ? post.accuracy : 0;
    track('part_complete', {
      part: partKey,
      pretest_accuracy: plan && plan.results.pretest ? plan.results.pretest.accuracy : null,
      posttest_accuracy: post ? post.accuracy : null,
    });
    setProgress(p => markPartComplete(p, partKey, accuracy));
    setFinishedPart(partKey);
    setPartKey(null);
  };

  const handleRegionChange = (value) => {
    setRegion(value);
    setProgress(p => rememberRegion(p, value));
  };

  const handleInterestsChange = (picked) => {
    setInterests(picked);
    setPicksRun(run);
    setProgress(p => rememberInterests(p, picked));
  };

  const sectionKey = GAME_FLOW[sectionIndex];
  const nextSectionKey = GAME_FLOW[sectionIndex + 1];
  const fromStops = SECTION_STOPS[sectionKey];
  const toStops = SECTION_STOPS[nextSectionKey];
  const shownKey = phase === 'roomIntro' ? nextSectionKey : sectionKey;
  const ShownSection = SECTIONS[shownKey];

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
  setContext({ part: USING_PARTS ? partKey : null, section: sectionKey || null, phase });
  const sectionStartRef = useRef(null);
  useEffect(() => {
    if (phase !== 'section' || !sectionKey) return;
    sectionStartRef.current = performance.now();
    track('section_start', { section: sectionKey, index: sectionIndex });
  }, [sectionKey, sectionIndex, phase]);
  // No cursor while the player walks across the factory map or the "Now entering"
  // card plays - there's nothing to click on either
  useCursorVeil(phase === 'walk' || phase === 'roomIntro');
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
    if (!nextSectionKey) {
      if (USING_PARTS) finishPart(); // end of the part - on to the stage screen
      else setSectionIndex(i => i + 1); // end of a single flow - renders nothing
    }
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
      if (!button || document.body.dataset.cursor === 'plain') return;
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
        {/* development only: warns while the analytics backend can't be reached */}
        {ANALYTICS.warnWhenOffline && <BackendStatusBanner />}
        {/* no sound button on the plain screens - nor on the stage screen between parts */}
        {partKey && !PLAIN_SECTIONS.includes(sectionKey) && <SoundToggle />}
        {USING_PARTS && !partKey && !finishedPart && (
          <StagesScreen progress={progress} onPlay={startPart} />
        )}
        {USING_PARTS && !partKey && finishedPart && (
          <PartCompleteScreen partKey={finishedPart} progress={progress} onDone={() => setFinishedPart(null)} />
        )}
       <FortunePlanContext.Provider value={plan}>
        {/* While the "Now entering" card plays, the next section is already loaded
            underneath it - the card's window looks onto it, then opens up into it */}
        {ShownSection && (phase === 'section' || phase === 'roomIntro') && (
          <ScreenCoveredContext.Provider value={phase === 'roomIntro'}>
            <ShownSection
              key={`${run}-${shownKey}`}
              onComplete={handleSectionComplete}
              onRegionChange={handleRegionChange}
              onInterestsChange={handleInterestsChange}
            />
          </ScreenCoveredContext.Provider>
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
       </FortunePlanContext.Provider>
      </div>
     </PlayerLookContext.Provider>
    </CurrencyContext.Provider>
  );
}

export default App;
