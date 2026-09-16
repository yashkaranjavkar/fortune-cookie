import React, { useState } from 'react';
import './App.css';

import {
  SupervisionIntroScreen,
  SupervisionInstructionsScreen,
  SupervisionChecklistScreen
} from './components/SupervisionPhase';

import StartScreen from './components/StartScreen';
import IntroScreen from './components/IntroScreen';
import JobApplication from './components/JobApplication';
import WebsitesScreen from './components/WebsitesScreen';
import ThankYouScreen from './components/ThankYouScreen';
import CongratulationsScreen from './components/CongratulationsScreen';
import WelcomeScreen from './components/WelcomeScreen';
import TraySelectionScreen from './components/TraySelectionScreen';
import FortuneSelectionScreen from './components/FortuneSelectionScreen';
import Level1Game from './components/Level1Game';
import Level2Game from './components/Level2Game';
import MarkingScreen from './components/MarkingScreen';
import LoaderScreen from './components/LoaderScreen';
import DemoGameScreen from './components/DemoGameScreen';

import Level3Game from './components/Level3Game';



import { 
  ThirtySecondsScreen,
  InspectionIntroScreen,
  TorchInspectScreen,
  PaymentInspectionScreen,
  StartMarkingScreen,
  CheckSamplesScreen,
  ResultsScreen,
  WhoshhScreen,
  WhoshhTwoScreen,
  WhoshhThreeScreen        // <-- Make sure this is here
} from './components/Level2Instructions';


import { 
  PaymentScreen, 
  URLsPartScreen, 
  ValidRuleScreen, 
  InvalidURLSequence, 
  ValidVsFaultyScreen, 
  BalloonScreen 
} from './components/LevelOneInstructions';

import { 
  ObjectiveScreen, 
  EventScreen, 
  HowToInteractScreen, 
  SortingIntroScreen, 
  FaultyTrayScreen, 
  ApprovedTrayScreen, 
  TimerQuestionScreen,  
  TimerEndScreen        
} from './components/InstructionScreens';

import {
  EventTwoScreen,
  FortuneElementsScreen,
  ContextValidFaultyScreen,
  InvalidURLIntroScreen,
  InvalidURLSplitScreen,
  InvalidURLFullScreen,
  ContextUnrelatedScreen,
  BalloonsTwoScreen
} from './components/Level2GameInstructions';

import {
  EventThreeScreen,
  FortuneElementsThreeScreen,
  ValidFaultyThreeScreen,
  ContextMatchesInvalidScreen,
  InvalidURLThreeIntroScreen,
  InvalidURLThreeSplitScreen,
  InvalidURLThreeFullScreen,
  BalloonsThreeScreen
} from './components/Level3GameInstructions';


function App() {
  const [gameFaultyItems, setGameFaultyItems] = useState([]);
  const [markedFortunes, setMarkedFortunes] = useState([]);
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');
  const [interests, setInterests] = useState([]);

  const handleSortingNext = () => {
  setPhase('transition');
  setTimeout(() => setPhase('instruction'), 2000);
};
  

  const [gamePhase, setGamePhase] = useState('selection'); 
  const [trayIndex, setTrayIndex] = useState(0);
  const [bunchIndex, setBunchIndex] = useState(0);
  const [brokenBunches, setBrokenBunches] = useState([]);
  const [allSelections, setAllSelections] = useState([]); 

  const handleConfirm = () => setStep(2);
  const handleIntroNext = () => setStep(3);
  const handleJobNext = () => setStep(4);
  const handleWebsitesNext = () => setStep(5);
  const handleThankYouNext = () => setStep(6); 
  const handleAccept = () => setStep(7); 

  const [level2FaultyItems, setLevel2FaultyItems] = useState([]);



  const handleReady = () => {
  setTrayIndex(0);
  setBunchIndex(0);
  setBrokenBunches([]);       // <-- Changed
  setGamePhase('selection');
  setStep(8);
  };

  const handleSelectBunch = (bunch) => {
  setBunchIndex(bunch);
  setBrokenBunches(prev => [...prev, bunch]);   // <-- Accumulate
  setGamePhase('fortune');
  }; 

  const handleSubmitFortunes = (selectedIndexes) => {
  const selection = { tray: trayIndex, bunch: bunchIndex, selected: selectedIndexes };
  setAllSelections(prev => [...prev, selection]);

  // If both bunches in this tray are broken, advance. Otherwise, return to pick the other bunch.
  if (brokenBunches.length < 2) {
    setGamePhase('selection');
  } else {
    if (trayIndex < 2) {
      setTrayIndex(trayIndex + 1);
      setBunchIndex(0);
      setBrokenBunches([]);
      setGamePhase('selection');
    } else {
      setStep(9);
    }
  }
};

  const userData = { designation, age, region, interests };
  const fortunesPool = [
    [
      "Your talents will soon catch the eye of a top recruiter who discovers you on naukri.com. ✨💼",
      "A meaningful connection made today on linkedin.com will open doors to unexpected opportunities tomorrow. 💼✨",
      "An exciting new role is waiting for you; let naukri.com help you make your next bold career move. 🚀👔",
      "Keep your professional path secure by choosing to avoid uploading your resume or sharing personal details on nauktri.com. 🛡️⚠️"
    ],
    [
      "A journey of a thousand miles begins with a single step. Make sure to book your flights on makemytrip.com. ✈️🌍",
      "The best way to predict the future is to create it. Check out airbnb.com for your next adventure. 🏠✨",
      "Your bank account will thank you for using icicibank.com to track your investments. 💰📈",
      "Beware of phishing scams; never share your OTP with anyone on gmail.com. 🔐⚠️"
    ],
    [
      "A new hobby will bring you immense joy. Try learning a new skill on coursera.com. 📚🎓",
      "Your curiosity will lead you to discover hidden gems on youtube.com. 🎥✨",
      "Stay connected with the world through the latest updates on x.com. 🐦🌐",
      "Unsafe downloads can harm your device; always verify sources on netflix.com. 🛡️⚠️"
    ]
  ];

  return (
    <div className="app">
      {/* ONBOARDING FLOW */}
      {step === 1 && <StartScreen employeeId={employeeId} setEmployeeId={setEmployeeId} designation={designation} setDesignation={setDesignation} onConfirm={handleConfirm} />}
      {step === 2 && <IntroScreen onNext={handleIntroNext} />}
      {step === 3 && <JobApplication age={age} setAge={setAge} region={region} setRegion={setRegion} interests={interests} setInterests={setInterests} onNext={handleJobNext} />}
      {step === 4 && <WebsitesScreen userData={userData} onNext={handleWebsitesNext} />}
      {step === 5 && <ThankYouScreen onNext={handleThankYouNext} />}
      {step === 6 && <CongratulationsScreen onAccept={handleAccept} />}
      {step === 7 && <WelcomeScreen onReady={handleReady} />}

      {/* TRAY GAME */}
      {step === 8 && (
     <>
     {gamePhase === 'selection' && (
      <TraySelectionScreen 
        trayNumber={trayIndex} 
        brokenBunches={brokenBunches}      // <-- Pass array
        onSelectBunch={handleSelectBunch} 
      />
      )}
     {gamePhase === 'fortune' && (
      <FortuneSelectionScreen
        trayNumber={trayIndex}
        bunchNumber={bunchIndex}
        fortunes={fortunesPool[trayIndex]}
        onSubmit={handleSubmitFortunes}
       />
      )}
      </>
      )}

      {/* INSTRUCTIONS */}
      {step === 9 && <ObjectiveScreen onNext={() => setStep(10)} onBack={() => setStep(8)} stepIndex={0} totalSteps={8} />}
      {step === 10 && <EventScreen onNext={() => setStep(11)} onBack={() => setStep(9)} stepIndex={1} totalSteps={8} />}
      {step === 11 && <HowToInteractScreen onNext={() => setStep(12)} onBack={() => setStep(10)} stepIndex={2} totalSteps={8} />}
      {step === 12 && <SortingIntroScreen onNext={() => setStep(13)} onBack={() => setStep(11)} stepIndex={3} totalSteps={8} />}
      {step === 13 && <FaultyTrayScreen onNext={() => setStep(14)} onBack={() => setStep(12)} stepIndex={4} totalSteps={8} />}
      {step === 14 && <ApprovedTrayScreen onNext={() => setStep(15)} onBack={() => setStep(13)} stepIndex={5} totalSteps={8} />}
      {step === 15 && <TimerQuestionScreen onNext={() => setStep(16)} onBack={() => setStep(14)} stepIndex={6} totalSteps={8} />}
      {step === 16 && <TimerEndScreen onReplay={() => setStep(9)} onNext={() => setStep(17)} onBack={() => setStep(15)} stepIndex={7} totalSteps={8} />}

      {/* DEMO */}
      {step === 17 && <DemoGameScreen onComplete={() => setStep(18)} />} 

      {/* LEVEL 1 INSTRUCTIONS */}
      {step === 18 && <URLsPartScreen onNext={() => setStep(19)} />}
      {step === 19 && <ValidRuleScreen onBack={() => setStep(18)} onNext={() => setStep(20)} />}
      {step === 20 && <InvalidURLSequence onNext={() => setStep(21)} />}
      {step === 21 && <ValidVsFaultyScreen onBack={() => setStep(20)} onNext={() => setStep(22)} />}
      {step === 22 && <BalloonScreen onReplay={() => setStep(18)} onNext={() => setStep(23)} />}
      
      {/* PAYMENT COMES AFTER BALLOONS */}
      {step === 23 && <PaymentScreen onBack={() => setStep(22)} onNext={() => setStep(24)} />}

      {/* LEVEL 1 GAME */}
      {step === 24 && <Level1Game onComplete={(items) => { setGameFaultyItems(items); setStep(25); }} />}

            {/* LEVEL 2 INSTRUCTIONS */}
      {step === 25 && <ThirtySecondsScreen onNext={() => setStep(26)} onBack={() => setStep(24)} />}
      {step === 26 && <InspectionIntroScreen onNext={() => setStep(27)} onBack={() => setStep(25)} />}
      
      {/* TUTORIAL TORCH - Uses sample data */}
      {step === 27 && <TorchInspectScreen 
        markedFortunes={[
          { fullText: "Your favorite artist has uploaded their new album on http://www.youtube.com/ 🎵", markedText: "http://" }
        ]} 
        onNext={() => setStep(28)} 
      />}
      
      {step === 28 && <PaymentInspectionScreen onNext={() => setStep(29)} />}
      {step === 29 && <StartMarkingScreen onNext={() => setStep(30)} />}

      {/* MARKING SCREEN - User highlights fortunes */}
      {step === 30 && <MarkingScreen faultyItems={gameFaultyItems} onNext={(data) => { setMarkedFortunes(data); setStep(31); }} />}

      {/* LOADER */}
      {step === 31 && <LoaderScreen faultyItems={gameFaultyItems} onComplete={() => setStep(32)} />}

       
      {/* ACTUAL INSPECTION - Uses real marked fortunes */}
      {step === 32 && <InspectionIntroScreen onNext={() => setStep(33)} onBack={() => setStep(30)} />}
      {step === 33 && <TorchInspectScreen markedFortunes={markedFortunes} onNext={() => setStep(34)} />}

      {/* CHECK DELIVERED SAMPLES */}
      {step === 34 && <CheckSamplesScreen onNext={() => setStep(35)} />}

      {/* RESULTS SCREEN (Fortunes with +₹1000 each) */}
      {step === 35 && <ResultsScreen markedFortunes={markedFortunes} onNext={() => setStep(36)} />}

      
      {/* WHOSHH CELEBRATION */}
      {step === 36 && <WhoshhScreen onNext={() => setStep(37)} />}

      {/* LEVEL 2 GAME INSTRUCTIONS */}
      {step === 37 && <EventTwoScreen onNext={() => setStep(38)} stepIndex={0} totalSteps={8} />}
      {step === 38 && <FortuneElementsScreen onBack={() => setStep(37)} onNext={() => setStep(39)} stepIndex={1} totalSteps={8} />}
      {step === 39 && <ContextValidFaultyScreen onBack={() => setStep(38)} onNext={() => setStep(40)} stepIndex={2} totalSteps={8} />}
      {step === 40 && <InvalidURLIntroScreen onBack={() => setStep(39)} onNext={() => setStep(41)} stepIndex={3} totalSteps={8} />}
      {step === 41 && <InvalidURLSplitScreen onBack={() => setStep(40)} onNext={() => setStep(42)} stepIndex={4} totalSteps={8} />}
      {step === 42 && <InvalidURLFullScreen onBack={() => setStep(41)} onNext={() => setStep(43)} stepIndex={5} totalSteps={8} />}
      {step === 43 && <ContextUnrelatedScreen onBack={() => setStep(42)} onNext={() => setStep(44)} stepIndex={6} totalSteps={8} />}
      {step === 44 && <BalloonsTwoScreen onReplay={() => setStep(37)} onNext={() => setStep(45)} />}

      {/* LEVEL 2 PAYMENT (After balloons) */}
            {/* LEVEL 2 PAYMENT */}
      {step === 45 && <PaymentScreen onBack={() => setStep(44)} onNext={() => setStep(46)} />}

            {/* LEVEL 2 GAME - 5 Domes */}
      {step === 46 && (
        <Level2Game
          onComplete={(items) => { setLevel2FaultyItems(items); setStep(47); }}
          onSkip={(items) => { setLevel2FaultyItems(items); setStep(48); }}
        />
      )}

      {/* STEP 47: START MARKING (after Next on the instruction) */}
      {step === 47 && <StartMarkingScreen onNext={() => setStep(48)} />}

      {/* STEP 48: LEVEL 2 MARKING SCREEN */}
      {step === 48 && (
        <MarkingScreen
          faultyItems={level2FaultyItems}
          onNext={(data) => { setMarkedFortunes(data); setStep(49); }}
        />
      )}

      {/* STEP 49: LOADER */}
      {step === 49 && <LoaderScreen faultyItems={level2FaultyItems} onComplete={() => setStep(50)} />}

      {/* STEP 50: INSPECTION INTRO */}
      {step === 50 && <InspectionIntroScreen onNext={() => setStep(51)} onBack={() => setStep(48)} />}

      {/* STEP 51: TORCH */}
      {step === 51 && <TorchInspectScreen markedFortunes={markedFortunes} onNext={() => setStep(52)} />}

      {/* STEP 52: CHECK SAMPLES */}
      {step === 52 && <CheckSamplesScreen onNext={() => setStep(53)} />}

            {/* STEP 53: RESULTS */}
      {step === 53 && <ResultsScreen markedFortunes={markedFortunes} onNext={() => setStep(54)} />}

      {/* STEP 54: WHOSHH - LEVEL 2 VERSION */}
      {step === 54 && <WhoshhTwoScreen onNext={() => setStep(55)} />}

            {/* LEVEL 3 INSTRUCTIONS */}
      {step === 55 && <EventThreeScreen onNext={() => setStep(56)} stepIndex={0} totalSteps={8} />}
      {step === 56 && <FortuneElementsThreeScreen onBack={() => setStep(55)} onNext={() => setStep(57)} stepIndex={1} totalSteps={8} />}
      {step === 57 && <ValidFaultyThreeScreen onBack={() => setStep(56)} onNext={() => setStep(58)} stepIndex={2} totalSteps={8} />}
      {step === 58 && <ContextMatchesInvalidScreen onBack={() => setStep(57)} onNext={() => setStep(59)} stepIndex={3} totalSteps={8} />}
      {step === 59 && <InvalidURLThreeIntroScreen onBack={() => setStep(58)} onNext={() => setStep(60)} stepIndex={4} totalSteps={8} />}
      {step === 60 && <InvalidURLThreeSplitScreen onBack={() => setStep(59)} onNext={() => setStep(61)} stepIndex={5} totalSteps={8} />}
      {step === 61 && <InvalidURLThreeFullScreen onBack={() => setStep(60)} onNext={() => setStep(62)} stepIndex={6} totalSteps={8} />}
      {step === 62 && <BalloonsThreeScreen onReplay={() => setStep(55)} onNext={() => setStep(63)} />}

            {/* LEVEL 3 PAYMENT */}
      {step === 63 && <PaymentScreen onBack={() => setStep(62)} onNext={() => setStep(64)} />}

      {/* LEVEL 3 GAME - 6 Domes */}
      {step === 64 && (
        <Level3Game
          onComplete={(items) => { setLevel2FaultyItems(items); setStep(65); }}
          onSkip={(items) => { setLevel2FaultyItems(items); setStep(66); }}
        />
      )}

      {/* STEP 65: START MARKING */}
      {step === 65 && <StartMarkingScreen onNext={() => setStep(66)} />}

      {/* STEP 66: MARKING SCREEN */}
      {step === 66 && (
        <MarkingScreen
          faultyItems={level2FaultyItems}
          onNext={(data) => { setMarkedFortunes(data); setStep(67); }}
        />
      )}

      {/* STEP 67: LOADER */}
      {step === 67 && <LoaderScreen faultyItems={level2FaultyItems} onComplete={() => setStep(68)} />}

      {/* STEP 68: INSPECTION INTRO */}
      {step === 68 && <InspectionIntroScreen onNext={() => setStep(69)} onBack={() => setStep(66)} />}

      {/* STEP 69: TORCH */}
      {step === 69 && <TorchInspectScreen markedFortunes={markedFortunes} onNext={() => setStep(70)} />}

      {/* STEP 70: CHECK SAMPLES */}
      {step === 70 && <CheckSamplesScreen onNext={() => setStep(71)} />}

      {/* STEP 71: RESULTS */}
      {step === 71 && <ResultsScreen markedFortunes={markedFortunes} onNext={() => setStep(72)} />}

            {/* STEP 72: WHOSHH - LEVEL 3 VERSION */}
      {step === 72 && <WhoshhThreeScreen onNext={() => setStep(73)} />}

      {/* SUPERVISION PHASE */}
      {step === 73 && <SupervisionIntroScreen onNext={() => setStep(74)} />}
      {step === 74 && <SupervisionInstructionsScreen onNext={() => setStep(75)} />}
      {step === 75 && (
      <SupervisionChecklistScreen 
       onNext={(data) => { 
        console.log('Decisions:', data.decisions); 
        console.log('Revoke reasons:', data.revokeReasons);
       setStep(76); 
       }} 
      />
       )}

      {step === 76 && (
        <div className="screen thank-you">
          <div className="card">
            <h1>All Phases Complete!</h1>
            <p>Final results coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;