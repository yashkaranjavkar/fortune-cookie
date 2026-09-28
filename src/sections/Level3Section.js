import React, { useState } from 'react';
import InspectionTutorialStep from './InspectionTutorialStep';
import Level3Game from '../components/Level3Game';
import MarkingScreen from '../components/MarkingScreen';
import LoaderScreen from '../components/LoaderScreen';
import LevelDoneScreen from '../components/LevelDoneScreen';
import { PaymentScreen } from '../components/LevelOneInstructions';
import {
  TorchInspectScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  ResultsScreen
} from '../components/Level2Instructions';
import {
  EventThreeScreen,
  FortuneElementsThreeScreen,
  ValidFaultyThreeScreen,
  ContextMatchesInvalidScreen,
  InvalidURLThreeSequence,
  BalloonsThreeScreen
} from '../components/Level3GameInstructions';

// Level 3: rules -> 6-cookie sorting game -> mark -> inspect -> results.
export default function Level3Section({ onComplete, tutorialShown, onTutorialShown }) {
  const [step, setStep] = useState(56);
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [markedFortunes, setMarkedFortunes] = useState([]);

  return (
    <>
      {step === 56 && <EventThreeScreen onNext={() => setStep(57)} stepIndex={0} totalSteps={5} />}
      {step === 57 && <FortuneElementsThreeScreen onBack={() => setStep(56)} onNext={() => setStep(58)} stepIndex={1} totalSteps={5} />}
      {step === 58 && <ValidFaultyThreeScreen onBack={() => setStep(57)} onNext={() => setStep(59)} stepIndex={2} totalSteps={5} />}
      {step === 59 && <InvalidURLThreeSequence onBack={() => setStep(58)} onNext={() => setStep(62)} stepIndex={3} totalSteps={5} />}
      {step === 62 && <ContextMatchesInvalidScreen onBack={() => setStep(59)} onNext={() => setStep(63)} stepIndex={4} totalSteps={5} />}
      {step === 63 && <BalloonsThreeScreen onReplay={() => setStep(56)} onNext={() => setStep(64)} />}

      {step === 64 && <PaymentScreen onBack={() => setStep(63)} onNext={() => setStep(65)} />}

      {step === 65 && (
        <Level3Game
          onComplete={(items, approved) => { setFaultyItems(items); setApprovedItems(approved); setStep(66); }}
          onSkip={(items, approved) => { setFaultyItems(items); setApprovedItems(approved); setStep(67); }}
        />
      )}

      {step === 66 && <StartMarkingScreen faultyCount={faultyItems.length} onNext={() => setStep(67)} />}
      {step === 67 && (
        <MarkingScreen faultyItems={faultyItems} onNext={(data) => { setMarkedFortunes(data); setStep(68); }} />
      )}

      {step === 68 && (
        <LoaderScreen faultyItems={faultyItems} onComplete={() => setStep(tutorialShown ? 70 : 69)} />
      )}
      {step === 69 && !tutorialShown && (
        <InspectionTutorialStep
          onBack={() => setStep(68)}
          onComplete={() => { onTutorialShown(); setStep(70); }}
        />
      )}

      {step === 70 && <TorchInspectScreen markedFortunes={markedFortunes} onNext={() => setStep(71)} />}
      {step === 71 && <CheckSamplesScreen onNext={() => setStep(72)} />}
      {step === 72 && (
        <ResultsScreen markedFortunes={markedFortunes} approvedItems={approvedItems} onNext={() => setStep(73)} />
      )}
      {step === 73 && (
        <LevelDoneScreen
          batchName="Farewell Party batch"
          sorted={faultyItems.length + approvedItems.length}
          total={faultyItems.length + approvedItems.length}
          incentive={(faultyItems.length + approvedItems.length) * 1000}
          onReplay={() => setStep(56)}
          onNext={onComplete}
        />
      )}
    </>
  );
}
