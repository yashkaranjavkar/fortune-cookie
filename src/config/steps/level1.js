import React from 'react';
import InspectionTutorialStep from '../../sections/InspectionTutorialStep';
import Level1Game from '../../components/Level1Game';
import MarkingScreen from '../../components/MarkingScreen';
import LoaderScreen from '../../components/LoaderScreen';
import LevelDoneScreen from '../../components/LevelDoneScreen';
import {
  PaymentScreen,
  URLsPartScreen,
  ValidRuleScreen,
  InvalidURLSequence,
  ValidVsFaultyScreen,
  BalloonScreen
} from '../../components/LevelOneInstructions';
import {
  ThirtySecondsScreen,
  TorchInspectScreen,
  PaymentInspectionScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  ResultsScreen,
  SortingResultsScreen
} from '../../components/Level2Instructions';
import { walkStep, roomIntroStep } from './transitionSteps';

// Level 1's screen order: rules -> 4-cookie sorting game -> mark -> inspect -> results.
// Reorder, insert, or remove entries here to change the flow - nothing else references
// a step by position, only by its `key`.
//
// 'tutorial' is skipped once the one-time inspection walkthrough has already played in
// an earlier level this run (see ctx.tutorialShown, set from src/sections/App-level state).
export const LEVEL1_STEPS = [
  { key: 'urlsPart', render: (ctx, nav) => <URLsPartScreen onNext={nav.next} /> },
  { key: 'validRule', render: (ctx, nav) => <ValidRuleScreen onBack={nav.back} onNext={nav.next} /> },
  { key: 'invalidSeq', render: (ctx, nav) => <InvalidURLSequence onBack={nav.back} onNext={nav.next} /> },
  { key: 'validVsFaulty', render: (ctx, nav) => <ValidVsFaultyScreen onBack={nav.back} onNext={nav.next} /> },
  { key: 'balloon', render: (ctx, nav) => <BalloonScreen onReplay={() => nav.goto('urlsPart')} onNext={nav.next} /> },

  { key: 'payment', render: (ctx, nav) => <PaymentScreen onBack={nav.back} onNext={nav.next} /> },

  walkStep('walkToLine', 'briefing', 'line1', 'Level 1'),
  roomIntroStep('enterLine', 'line1', 'Level 1'),

  {
    key: 'game',
    cursor: 'glove',
    render: (ctx, nav) => (
      <Level1Game
        onComplete={(items, approved) => { ctx.setFaultyItems(items); ctx.setApprovedItems(approved); nav.next(); }}
      />
    )
  },

  walkStep('walkToMarking', 'line1', 'marking', 'Level 1'),
  roomIntroStep('enterMarking', 'marking', 'Level 1'),

  {
    key: 'thirtySeconds',
    render: (ctx, nav) => (
      <ThirtySecondsScreen faultyCount={ctx.faultyItems.length} onNext={nav.next} onBack={nav.back} />
    )
  },
  /*{
    key: 'tutorial',
    skip: (ctx) => ctx.tutorialShown,
    render: (ctx, nav) => (
      <InspectionTutorialStep onBack={nav.back} onComplete={() => { ctx.onTutorialShown(); nav.next(); }} />
    )
  },*/

  { key: 'paymentInspection', render: (ctx, nav) => <PaymentInspectionScreen onNext={nav.next} /> },
  //{ key: 'startMarking', render: (ctx, nav) => <StartMarkingScreen faultyCount={ctx.faultyItems.length} onNext={nav.next} /> },

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
  walkStep('walkToInspection', 'marking', 'inspection', 'Level 1'),
  roomIntroStep('enterInspection', 'inspection', 'Level 1'),

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
  walkStep('walkToDispatch', 'inspection', 'results', 'Level 1'),
  roomIntroStep('enterDispatch', 'results', 'Level 1'),
  { key: 'checkSamples', render: (ctx, nav) => <CheckSamplesScreen onNext={nav.next} /> },
  {
    key: 'results',
    render: (ctx, nav) => (
      <ResultsScreen markedFortunes={ctx.markedFortunes} approvedItems={ctx.approvedItems} onNext={nav.next} />
    )
  },
  {
    key: 'sortingResults',
    render: (ctx, nav) => (
      <SortingResultsScreen
        faultyItems={ctx.faultyItems}
        approvedItems={ctx.approvedItems}
        onNext={(finalSortingScore) => { ctx.setSortingScore(finalSortingScore); nav.next(); }}
      />
    )
  },

  {
    key: 'levelDone',
    render: (ctx, nav) => (
      <LevelDoneScreen
        batchName="Birthday Party batch"
        sorted={ctx.faultyItems.length + ctx.approvedItems.length}
        total={ctx.faultyItems.length + ctx.approvedItems.length}
        incentive={ctx.sortingScore + ctx.inspectionScore}
        onReplay={() => nav.goto('urlsPart')}
        onNext={ctx.onComplete}
      />
    )
  },
];
