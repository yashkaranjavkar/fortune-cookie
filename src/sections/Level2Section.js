import React, { useState } from 'react';
import InspectionTutorialStep from './InspectionTutorialStep';
import Level2Game from '../components/Level2Game';
import MarkingScreen from '../components/MarkingScreen';
import LoaderScreen from '../components/LoaderScreen';
import { PaymentScreen } from '../components/LevelOneInstructions';
import {
  TorchInspectScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  ResultsScreen,
  WhoshhTwoScreen
} from '../components/Level2Instructions';
import {
  EventTwoScreen,
  FortuneElementsScreen,
  ContextValidFaultyScreen,
  InvalidURLSequenceTwo,
  ContextUnrelatedScreen,
  BalloonsTwoScreen
} from '../components/Level2GameInstructions';

// Level 2: rules -> 5-cookie sorting game -> mark -> inspect -> results.
export default function Level2Section({ onComplete, tutorialShown, onTutorialShown }) {
  const [step, setStep] = useState(38);
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [markedFortunes, setMarkedFortunes] = useState([]);

  return (
    <>
      {step === 38 && <EventTwoScreen onNext={() => setStep(39)} stepIndex={0} totalSteps={5} />}
      {step === 39 && <FortuneElementsScreen onBack={() => setStep(38)} onNext={() => setStep(40)} stepIndex={1} totalSteps={5} />}
      {step === 40 && <ContextValidFaultyScreen onBack={() => setStep(39)} onNext={() => setStep(41)} stepIndex={2} totalSteps={5} />}
      {step === 41 && <InvalidURLSequenceTwo onBack={() => setStep(40)} onNext={() => setStep(44)} stepIndex={3} totalSteps={5} />}
      {step === 44 && <ContextUnrelatedScreen onBack={() => setStep(41)} onNext={() => setStep(45)} stepIndex={4} totalSteps={5} />}
      {step === 45 && <BalloonsTwoScreen onReplay={() => setStep(38)} onNext={() => setStep(46)} />}

      {step === 46 && <PaymentScreen onBack={() => setStep(45)} onNext={() => setStep(47)} />}

      {step === 47 && (
        <Level2Game
          onComplete={(items, approved) => { setFaultyItems(items); setApprovedItems(approved); setStep(48); }}
          onSkip={(items, approved) => { setFaultyItems(items); setApprovedItems(approved); setStep(49); }}
        />
      )}

      {step === 48 && <StartMarkingScreen faultyCount={faultyItems.length} onNext={() => setStep(49)} />}
      {step === 49 && (
        <MarkingScreen faultyItems={faultyItems} onNext={(data) => { setMarkedFortunes(data); setStep(50); }} />
      )}

      {step === 50 && (
        <LoaderScreen faultyItems={faultyItems} onComplete={() => setStep(tutorialShown ? 52 : 51)} />
      )}
      {step === 51 && !tutorialShown && (
        <InspectionTutorialStep
          onBack={() => setStep(50)}
          onComplete={() => { onTutorialShown(); setStep(52); }}
        />
      )}

      {step === 52 && <TorchInspectScreen markedFortunes={markedFortunes} onNext={() => setStep(53)} />}
      {step === 53 && <CheckSamplesScreen onNext={() => setStep(54)} />}
      {step === 54 && (
        <ResultsScreen markedFortunes={markedFortunes} approvedItems={approvedItems} onNext={() => setStep(55)} />
      )}
      {step === 55 && <WhoshhTwoScreen onNext={onComplete} />}
    </>
  );
}
