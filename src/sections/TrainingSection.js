import React, { useState } from 'react';
import TraySortingSection from './TraySortingSection';
import TrainingCompleteScreen from '../components/TrainingCompleteScreen';
import DemoGameScreen from '../components/DemoGameScreen';
import { TRAY_COUNT } from '../config/gameFlow';
import {
  ObjectiveScreen,
  EventScreen,
  HowToInteractScreen,
  SortingIntroScreen,
  TimerQuestionScreen,
  TimerEndScreen
} from '../components/InstructionScreens';

// Tray/fortune training minigame -> "training complete" -> sorting rules -> interactive demo.
export default function TrainingSection({ onComplete }) {
  const [step, setStep] = useState(8);

  return (
    <>
      {step === 8 && <TraySortingSection trayCount={TRAY_COUNT} onComplete={() => setStep(9)} />}

      {step === 9 && <TrainingCompleteScreen onNext={() => setStep(10)} />}

      {step === 10 && <ObjectiveScreen onNext={() => setStep(11)} onBack={() => setStep(8)} stepIndex={0} totalSteps={6} />}
      {step === 11 && <EventScreen onNext={() => setStep(12)} onBack={() => setStep(10)} stepIndex={1} totalSteps={6} />}
      {step === 12 && <HowToInteractScreen onNext={() => setStep(13)} onBack={() => setStep(11)} stepIndex={2} totalSteps={6} />}
      {step === 13 && <SortingIntroScreen onNext={() => setStep(16)} onBack={() => setStep(12)} stepIndex={3} totalSteps={6} />}
      {step === 16 && <TimerQuestionScreen onNext={() => setStep(17)} onBack={() => setStep(13)} stepIndex={4} totalSteps={6} />}
      {step === 17 && <TimerEndScreen onReplay={() => setStep(10)} onNext={() => setStep(18)} onBack={() => setStep(16)} stepIndex={5} totalSteps={6} />}

      {step === 18 && <DemoGameScreen onComplete={onComplete} />}
    </>
  );
}
