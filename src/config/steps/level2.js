import React from 'react';
import InspectionTutorialStep from '../../sections/InspectionTutorialStep';
import Level2Game from '../../components/Level2Game';
import MarkingScreen from '../../components/MarkingScreen';
import LoaderScreen from '../../components/LoaderScreen';
import LevelDoneScreen from '../../components/LevelDoneScreen';
import { PaymentScreen } from '../../components/LevelOneInstructions';
import {
  ThirtySecondsScreen,
  TorchInspectScreen,
  PaymentInspectionScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  BatchResultsScreen
} from '../../components/Level2Instructions';
import {
  EventTwoScreen,
  FortuneElementsScreen,
  ContextValidFaultyScreen,
  InvalidURLSequenceTwo,
  InvalidUrlMeaningScreen,
  BalloonsTwoScreen
} from '../../components/Level2GameInstructions';
import { walkStep, roomIntroStep } from './transitionSteps';

// Level 2's screen order: rules -> 5-cookie sorting game -> mark -> inspect -> results.
// Reorder, insert, or remove entries here to change the flow - nothing else references
// a step by position, only by its `key`.
//
// 'tutorial' is skipped once the one-time inspection walkthrough has already played in
// an earlier level this run. The sorting game's "Skip" button jumps straight to
// 'marking', bypassing the timer/tutorial/payment-rules/start screens in between.
export const LEVEL2_STEPS = [
  { key: 'eventTwo', render: (ctx, nav) => <EventTwoScreen onNext={nav.next} stepIndex={0} totalSteps={5} /> },
  { key: 'fortuneElements', render: (ctx, nav) => <FortuneElementsScreen onBack={nav.back} onNext={nav.next} stepIndex={1} totalSteps={5} /> },
  { key: 'contextValidFaulty', render: (ctx, nav) => <ContextValidFaultyScreen onBack={nav.back} onNext={nav.next} stepIndex={2} totalSteps={5} /> },
  { key: 'invalidUrlSeq', render: (ctx, nav) => <InvalidURLSequenceTwo onBack={nav.back} onNext={nav.next} stepIndex={3} totalSteps={5} /> },
  { key: 'invalidUrlMeaning', render: (ctx, nav) => <InvalidUrlMeaningScreen onBack={nav.back} onNext={nav.next} stepIndex={4} totalSteps={5} /> },
  { key: 'balloonsTwo', render: (ctx, nav) => <BalloonsTwoScreen onReplay={() => nav.goto('eventTwo')} onNext={nav.next} /> },

  { key: 'payment', render: (ctx, nav) => <PaymentScreen onBack={nav.back} onNext={nav.next} /> },

  walkStep('walkToLine', 'briefing', 'line2', 'Level 2'),
  roomIntroStep('enterLine', 'line2', 'Level 2'),

  {
    key: 'game',
    cursor: 'glove',
    render: (ctx, nav) => (
      <Level2Game
        onComplete={(items, approved) => { ctx.setFaultyItems(items); ctx.setApprovedItems(approved); nav.next(); }}
        onSkip={(items, approved) => { ctx.setFaultyItems(items); ctx.setApprovedItems(approved); nav.goto('marking'); }}
      />
    )
  },

  walkStep('walkToMarking', 'line2', 'marking', 'Level 2'),
  roomIntroStep('enterMarking', 'marking', 'Level 2'),

  {
    key: 'thirtySeconds',
    render: (ctx, nav) => (
      <ThirtySecondsScreen faultyCount={ctx.faultyItems.length} onNext={nav.next} onBack={nav.back} />
    )
  },
  {
    key: 'tutorial',
    skip: (ctx) => ctx.tutorialShown,
    render: (ctx, nav) => (
      <InspectionTutorialStep onBack={nav.back} onComplete={() => { ctx.onTutorialShown(); nav.next(); }} />
    )
  },

  { key: 'paymentInspection', render: (ctx, nav) => <PaymentInspectionScreen onNext={nav.next} /> },
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
  walkStep('walkToInspection', 'marking', 'inspection', 'Level 2'),
  roomIntroStep('enterInspection', 'inspection', 'Level 2'),

  {
    key: 'torchInspect',
    cursor: 'glove',
    render: (ctx, nav) => (
      <TorchInspectScreen
        markedFortunes={ctx.markedFortunes}
        onNext={(finalScore) => { ctx.setInspectionScore(finalScore); nav.next(); }}
      />
    )
  },
  walkStep('walkToDispatch', 'inspection', 'results', 'Level 2'),
  roomIntroStep('enterDispatch', 'results', 'Level 2'),
  { key: 'checkSamples', render: (ctx, nav) => <CheckSamplesScreen onNext={nav.next} /> },
  // sorting + marking scores for the whole batch, on one screen
  {
    key: 'results',
    render: (ctx, nav) => (
      <BatchResultsScreen
        markedFortunes={ctx.markedFortunes}
        approvedItems={ctx.approvedItems}
        onNext={(finalSortingScore) => { ctx.setSortingScore(finalSortingScore); nav.next(); }}
      />
    )
  },

  {
    key: 'levelDone',
    render: (ctx, nav) => (
      <LevelDoneScreen
        batchName="Farewell Party batch"
        sorted={ctx.faultyItems.length + ctx.approvedItems.length}
        total={ctx.faultyItems.length + ctx.approvedItems.length}
        incentive={ctx.sortingScore + ctx.inspectionScore}
        onReplay={() => nav.goto('eventTwo')}
        onNext={ctx.onComplete}
      />
    )
  },
];
