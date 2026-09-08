import React, { useState } from 'react';
import './App.css';
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
import MarkingScreen from './components/MarkingScreen';
import LoaderScreen from './components/LoaderScreen';
import { 
  PaymentScreen, 
  URLsPartScreen, 
  ValidRuleScreen, 
  InvalidURLSequence, 
  ValidVsFaultyScreen, 
  BalloonScreen 
} from './components/LevelOneInstructions';

import { 
  ThirtySecondsScreen,
  InspectionIntroScreen,
  TorchInspectScreen,
  PaymentInspectionScreen,
  StartMarkingScreen
} from './components/Level2Instructions';

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
import DemoGameScreen from './components/DemoGameScreen';

function App() {
  const [gameFaultyItems, setGameFaultyItems] = useState([]);
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');
  const [interests, setInterests] = useState([]);

  const [gamePhase, setGamePhase] = useState('selection'); 
  const [trayIndex, setTrayIndex] = useState(0);
  const [bunchIndex, setBunchIndex] = useState(0);
  const [brokenBunch, setBrokenBunch] = useState(null);
  const [allSelections, setAllSelections] = useState([]); 

  const handleConfirm = () => setStep(2);
  const handleIntroNext = () => setStep(3);
  const handleJobNext = () => setStep(4);
  const handleWebsitesNext = () => setStep(5);
  const handleThankYouNext = () => setStep(6); 
  const handleAccept = () => setStep(7); 

  const handleReady = () => {
    setTrayIndex(0); setBunchIndex(0); setBrokenBunch(null);
    setGamePhase('selection'); setStep(8); 
  };

  const handleSelectBunch = (bunch) => {
    setBunchIndex(bunch); setBrokenBunch(bunch); setGamePhase('fortune');
  };

  const handleSubmitFortunes = (selectedIndexes) => {
    const selection = { tray: trayIndex, bunch: bunchIndex, selected: selectedIndexes };
    setAllSelections(prev => [...prev, selection]);

    if (bunchIndex === 0) {
      setBunchIndex(1); setGamePhase('selection');
    } else {
      if (trayIndex < 2) {
        setTrayIndex(trayIndex + 1); setBunchIndex(0); setBrokenBunch(null); setGamePhase('selection');
      } else {
        setStep(9); // Move to instructions after game ends
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
          {gamePhase === 'selection' && <TraySelectionScreen trayNumber={trayIndex} brokenBunch={brokenBunch} onSelectBunch={handleSelectBunch} />}
          {gamePhase === 'fortune' && <FortuneSelectionScreen trayNumber={trayIndex} bunchNumber={bunchIndex} fortunes={fortunesPool[trayIndex]} onSubmit={handleSubmitFortunes} />}
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
      {step === 27 && <TorchInspectScreen onNext={() => setStep(28)} />}
      {step === 28 && <PaymentInspectionScreen onNext={() => setStep(29)} />}
      {step === 29 && <StartMarkingScreen onNext={() => setStep(30)} />}

      {/* MARKING SCREEN */}
            {/* MARKING SCREEN */}
      {step === 30 && <MarkingScreen faultyItems={gameFaultyItems} onNext={() => setStep(31)} />}

      {/* LOADER SCREEN */}
      {step === 31 && <LoaderScreen faultyItems={gameFaultyItems} onComplete={() => setStep(32)} />}

      {/* INSPECTION ROOM INTRO (Press Red Button) */}
      {step === 32 && <InspectionIntroScreen markedFortunes={gameFaultyItems} onNext={() => setStep(33)} onBack={() => setStep(30)} />}
      
      {/* TORCH SCREEN */}
      {step === 33 && <TorchInspectScreen onNext={() => setStep(34)} />}
      
      {/* PAYMENT SCREEN */}
      {step === 34 && <PaymentInspectionScreen onNext={() => setStep(35)} />}
      
      {/* START MARKING SCREEN (Final button) */}
      {step === 35 && <StartMarkingScreen onNext={() => alert("Level 2 Started!")} />}
    </div>
  );
}

export default App;