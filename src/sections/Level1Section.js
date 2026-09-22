import React, { useState } from 'react';
import InspectionTutorialStep from './InspectionTutorialStep';
import Level1Game from '../components/Level1Game';
import MarkingScreen from '../components/MarkingScreen';
import LoaderScreen from '../components/LoaderScreen';
import {
  PaymentScreen,
  URLsPartScreen,
  ValidRuleScreen,
  InvalidURLSequence,
  ValidVsFaultyScreen,
  BalloonScreen
} from '../components/LevelOneInstructions';
import {
  ThirtySecondsScreen,
  TorchInspectScreen,
  PaymentInspectionScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  ResultsScreen,
  WhoshhScreen
} from '../components/Level2Instructions';

// Level 1: rules -> 4-cookie sorting game -> mark -> inspect -> results.
// tutorialShown/onTutorialShown: the one-time inspection walkthrough shows here only if
// no earlier section in this run has already shown it (see InspectionTutorialStep).
export default function Level1Section({ onComplete, tutorialShown, onTutorialShown }) {
  const [step, setStep] = useState(19);
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [markedFortunes, setMarkedFortunes] = useState([]);

  return (
    <>
      {step === 19 && <URLsPartScreen onNext={() => setStep(20)} />}
      {step === 20 && <ValidRuleScreen onBack={() => setStep(19)} onNext={() => setStep(21)} />}
      {step === 21 && <InvalidURLSequence onBack={() => setStep(20)} onNext={() => setStep(22)} />}
      {step === 22 && <ValidVsFaultyScreen onBack={() => setStep(21)} onNext={() => setStep(23)} />}
      {step === 23 && <BalloonScreen onReplay={() => setStep(19)} onNext={() => setStep(24)} />}

      {step === 24 && <PaymentScreen onBack={() => setStep(23)} onNext={() => setStep(25)} />}

      {step === 25 && (
        <Level1Game onComplete={(items, approved) => { setFaultyItems(items); setApprovedItems(approved); setStep(26); }} />
      )}

      {step === 26 && (
        <ThirtySecondsScreen
          faultyCount={faultyItems.length}
          onNext={() => setStep(tutorialShown ? 29 : 27)}
          onBack={() => setStep(25)}
        />
      )}
      {step === 27 && !tutorialShown && (
        <InspectionTutorialStep
          onBack={() => setStep(26)}
          onComplete={() => { onTutorialShown(); setStep(29); }}
        />
      )}

      {step === 29 && <PaymentInspectionScreen onNext={() => setStep(30)} />}
      {step === 30 && <StartMarkingScreen faultyCount={faultyItems.length} onNext={() => setStep(31)} />}

      {step === 31 && (
        <MarkingScreen faultyItems={faultyItems} onNext={(data) => { setMarkedFortunes(data); setStep(32); }} />
      )}

      {step === 32 && <LoaderScreen faultyItems={faultyItems} onComplete={() => setStep(34)} />}

      {step === 34 && <TorchInspectScreen markedFortunes={markedFortunes} onNext={() => setStep(35)} />}
      {step === 35 && <CheckSamplesScreen onNext={() => setStep(36)} />}
      {step === 36 && (
        <ResultsScreen markedFortunes={markedFortunes} approvedItems={approvedItems} onNext={() => setStep(37)} />
      )}
      {step === 37 && <WhoshhScreen onNext={onComplete} />}
    </>
  );
}
