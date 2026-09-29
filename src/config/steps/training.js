import React from 'react';
import TraySortingSection from '../../sections/TraySortingSection';
import TrainingCompleteScreen from '../../components/TrainingCompleteScreen';
import DemoGameScreen from '../../components/DemoGameScreen';
import { TRAY_COUNT } from '../gameFlow';
import {
  ObjectiveScreen,
  EventScreen,
  HowToInteractScreen,
  SortingIntroScreen,
  TimerQuestionScreen,
  TimerEndScreen
} from '../../components/InstructionScreens';

// The Training section's screen order. Reorder, insert, or remove entries here to
// change the flow. Back/replay targets that skip past a screen (e.g. the rules'
// "Back" returning straight to the tray minigame, or "replay" restarting the rules
// from their first screen) use nav.goto('key') so they keep working no matter where
// those steps end up in the array.
export const TRAINING_STEPS = [
  { key: 'traySorting', render: (ctx, nav) => <TraySortingSection trayCount={TRAY_COUNT} onComplete={nav.next} /> },

  { key: 'trainingComplete', render: (ctx, nav) => <TrainingCompleteScreen onNext={nav.next} /> },

  { key: 'objective', render: (ctx, nav) => <ObjectiveScreen onNext={nav.next} onBack={() => nav.goto('traySorting')} stepIndex={0} totalSteps={6} /> },
  { key: 'event', render: (ctx, nav) => <EventScreen onNext={nav.next} onBack={nav.back} stepIndex={1} totalSteps={6} /> },
  { key: 'howToInteract', render: (ctx, nav) => <HowToInteractScreen onNext={nav.next} onBack={nav.back} stepIndex={2} totalSteps={6} /> },
  { key: 'sortingIntro', render: (ctx, nav) => <SortingIntroScreen onNext={nav.next} onBack={nav.back} stepIndex={3} totalSteps={6} /> },
  { key: 'timerQuestion', render: (ctx, nav) => <TimerQuestionScreen onNext={nav.next} onBack={nav.back} stepIndex={4} totalSteps={6} /> },
  { key: 'timerEnd', render: (ctx, nav) => <TimerEndScreen onReplay={() => nav.goto('objective')} onNext={nav.next} onBack={nav.back} stepIndex={5} totalSteps={6} /> },

  // Terminal step: hands off to the section's own onComplete instead of nav.next().
  { key: 'demoGame', render: (ctx) => <DemoGameScreen onComplete={ctx.onComplete} /> },
];
