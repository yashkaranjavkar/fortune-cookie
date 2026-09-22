import React, { useState } from 'react';
import StartScreen from '../components/StartScreen';
import IntroScreen from '../components/IntroScreen';
import JobApplication from '../components/JobApplication';
import WebsitesScreen from '../components/WebsitesScreen';
import ThankYouScreen from '../components/ThankYouScreen';
import CongratulationsScreen from '../components/CongratulationsScreen';
import WelcomeScreen from '../components/WelcomeScreen';

// Job application through offer acceptance. Owns the applicant's own answers locally;
// only the chosen region is reported upward, since currency display needs it elsewhere.
export default function JobApplicationSection({ onComplete, onRegionChange }) {
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');
  const [interests, setInterests] = useState([]);

  const handleSetRegion = (value) => {
    setRegion(value);
    if (onRegionChange) onRegionChange(value);
  };

  const userData = { designation, age, region, interests };

  return (
    <>
      {step === 1 && (
        <StartScreen
          employeeId={employeeId} setEmployeeId={setEmployeeId}
          designation={designation} setDesignation={setDesignation}
          onConfirm={() => setStep(2)}
        />
      )}
      {step === 2 && <IntroScreen onNext={() => setStep(3)} />}
      {step === 3 && (
        <JobApplication
          age={age} setAge={setAge}
          region={region} setRegion={handleSetRegion}
          interests={interests} setInterests={setInterests}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && <WebsitesScreen userData={userData} onNext={() => setStep(5)} />}
      {step === 5 && <ThankYouScreen onNext={() => setStep(6)} />}
      {step === 6 && <CongratulationsScreen onAccept={() => setStep(7)} />}
      {step === 7 && <WelcomeScreen onReady={onComplete} />}
    </>
  );
}
