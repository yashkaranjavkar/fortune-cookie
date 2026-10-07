import React from 'react';
import InspectionTutorialStep from '../../sections/InspectionTutorialStep';
import Level3Game from '../../components/Level3Game';
import MarkingScreen from '../../components/MarkingScreen';
import LoaderScreen from '../../components/LoaderScreen';
import LevelDoneScreen from '../../components/LevelDoneScreen';
import { PaymentScreen } from '../../components/LevelOneInstructions';
import {
  TorchInspectScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  ResultsScreen
} from '../../components/Level2Instructions';
import {
  EventThreeScreen,
  FortuneElementsThreeScreen,
  ValidFaultyThreeScreen,
  ContextMatchesInvalidScreen,
  InvalidURLThreeSequence,
  BalloonsThreeScreen
} from '../../components/Level3GameInstructions';
import { walkStep, roomIntroStep } from './transitionSteps';

// Level 3's screen order: rules -> 6-cookie sorting game -> mark -> inspect -> results.
// Reorder, insert, or remove entries here to change the flow - nothing else references
// a step by position, only by its `key`.
//
// Note: unlike Level 1/2, this level hasn't yet been brought up to the same scoring
// parity (no ThirtySecondsScreen/PaymentInspectionScreen/SortingResultsScreen, and
// LevelDoneScreen still uses the flat "count x 1000" incentive) - this config only
// reorganizes the existing flow, it doesn't change what it does.
export const LEVEL3_STEPS = [
  { key: 'eventThree', render: (ctx, nav) => <EventThreeScreen onNext={nav.next} stepIndex={0} totalSteps={5} /> },
  { key: 'fortuneElementsThree', render: (ctx, nav) => <FortuneElementsThreeScreen onBack={nav.back} onNext={nav.next} stepIndex={1} totalSteps={5} /> },
  { key: 'validFaultyThree', render: (ctx, nav) => <ValidFaultyThreeScreen onBack={nav.back} onNext={nav.next} stepIndex={2} totalSteps={5} /> },
  { key: 'invalidUrlSeqThree', render: (ctx, nav) => <InvalidURLThreeSequence onBack={nav.back} onNext={nav.next} stepIndex={3} totalSteps={5} /> },
  { key: 'contextMatchesInvalid', render: (ctx, nav) => <ContextMatchesInvalidScreen onBack={nav.back} onNext={nav.next} stepIndex={4} totalSteps={5} /> },
  { key: 'balloonsThree', render: (ctx, nav) => <BalloonsThreeScreen onReplay={() => nav.goto('eventThree')} onNext={nav.next} /> },

  { key: 'payment', render: (ctx, nav) => <PaymentScreen onBack={nav.back} onNext={nav.next} /> },

  walkStep('walkToLine', 'briefing', 'line3', 'Level 3'),
  roomIntroStep('enterLine', 'line3', 'Level 3'),

  {
    key: 'game',
    cursor: 'glove',
    render: (ctx, nav) => (
      <Level3Game
        onComplete={(items, approved) => { ctx.setFaultyItems(items); ctx.setApprovedItems(approved); nav.next(); }}
        onSkip={(items, approved) => { ctx.setFaultyItems(items); ctx.setApprovedItems(approved); nav.goto('marking'); }}
      />
    )
  },

  walkStep('walkToMarking', 'line3', 'marking', 'Level 3'),
  roomIntroStep('enterMarking', 'marking', 'Level 3'),

  { key: 'startMarking', render: (ctx, nav) => <StartMarkingScreen faultyCount={ctx.faultyItems.length} onNext={nav.next} /> },
  {
    key: 'marking',
    cursor: 'highlighter',
    render: (ctx, nav) => (
      <MarkingScreen faultyItems={ctx.faultyItems} onNext={(data) => { ctx.setMarkedFortunes(data); nav.next(); }} />
    )
  },

  // The walk to the Inspection Room below replaces the old "Going for inspection..."
  // loader - uncomment this line to bring it back.
  //{ key: 'loader', render: (ctx, nav) => <LoaderScreen faultyItems={ctx.faultyItems} onComplete={nav.next} /> },
  walkStep('walkToInspection', 'marking', 'inspection', 'Level 3'),
  roomIntroStep('enterInspection', 'inspection', 'Level 3'),
  {
    key: 'tutorial',
    skip: (ctx) => ctx.tutorialShown,
    render: (ctx, nav) => (
      <InspectionTutorialStep onBack={nav.back} onComplete={() => { ctx.onTutorialShown(); nav.next(); }} />
    )
  },

  { key: 'torchInspect', cursor: 'glove', render: (ctx, nav) => <TorchInspectScreen markedFortunes={ctx.markedFortunes} onNext={nav.next} /> },
  walkStep('walkToDispatch', 'inspection', 'results', 'Level 3'),
  roomIntroStep('enterDispatch', 'results', 'Level 3'),
  { key: 'checkSamples', render: (ctx, nav) => <CheckSamplesScreen onNext={nav.next} /> },
  {
    key: 'results',
    render: (ctx, nav) => (
      <ResultsScreen markedFortunes={ctx.markedFortunes} approvedItems={ctx.approvedItems} onNext={nav.next} />
    )
  },

  {
    key: 'levelDone',
    render: (ctx, nav) => (
      <LevelDoneScreen
        batchName="Farewell Party batch"
        sorted={ctx.faultyItems.length + ctx.approvedItems.length}
        total={ctx.faultyItems.length + ctx.approvedItems.length}
        incentive={(ctx.faultyItems.length + ctx.approvedItems.length) * 1000}
        onReplay={() => nav.goto('eventThree')}
        onNext={ctx.onComplete}
      />
    )
  },
];
