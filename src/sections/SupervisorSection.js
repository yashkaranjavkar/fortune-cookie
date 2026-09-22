import React, { useState } from 'react';
import {
  SupervisionIntroScreen,
  SupervisionInstructionsScreen,
  SupervisionChecklistScreen,
  SupervisionGreatWorkScreen,
  SupervisionLastBatchScreen
} from '../components/SupervisionPhase';

// Supervisor checklist: intro -> instructions -> the checklist -> praise -> one last
// batch to sort (leads into the next section) -> done.
export default function SupervisorSection({ onComplete }) {
  const [step, setStep] = useState(1);

  return (
    <>
      {step === 1 && <SupervisionIntroScreen onNext={() => setStep(2)} stepIndex={0} totalSteps={2} />}
      {step === 2 && <SupervisionInstructionsScreen onNext={() => setStep(3)} stepIndex={1} totalSteps={2} />}
      {step === 3 && (
        <SupervisionChecklistScreen
          onNext={(data) => {
            console.log('Decisions:', data.decisions);
            console.log('Revoke reasons:', data.revokeReasons);
            setStep(4);
          }}
        />
      )}
      {step === 4 && <SupervisionGreatWorkScreen onNext={() => setStep(5)} />}
      {step === 5 && <SupervisionLastBatchScreen onNext={onComplete} />}
    </>
  );
}
