import React, { useState } from 'react';
import TraySelectionScreen from '../components/TraySelectionScreen';
import FortuneSelectionScreen from '../components/FortuneSelectionScreen';

// The tray / 2-bunch-per-tray fortune-picking minigame, extracted so it can be reused
// both inside Training and standalone (the "final trays" section). How many trays run
// is set by TRAY_COUNT in src/config/gameFlow.js, passed in as the trayCount prop.
const FORTUNES_POOL = [
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

export default function TraySortingSection({ onComplete, trayCount = 3 }) {
  const [gamePhase, setGamePhase] = useState('selection');
  const [trayIndex, setTrayIndex] = useState(0);
  const [bunchIndex, setBunchIndex] = useState(0);
  const [brokenBunches, setBrokenBunches] = useState([]);

  const handleSelectBunch = (bunch) => {
    setBunchIndex(bunch);
    setBrokenBunches(prev => [...prev, bunch]);
    setGamePhase('fortune');
  };

  const handleSubmitFortunes = () => {
    if (brokenBunches.length < 2) {
      setGamePhase('selection');
    } else if (trayIndex < trayCount - 1) {
      setTrayIndex(trayIndex + 1);
      setBunchIndex(0);
      setBrokenBunches([]);
      setGamePhase('selection');
    } else {
      onComplete();
    }
  };

  // Cycles back through the curated fortune sets if trayCount is configured
  // higher than the number of hand-written sets above.
  const fortunes = FORTUNES_POOL[trayIndex % FORTUNES_POOL.length];

  return (
    <>
      {gamePhase === 'selection' && (
        <TraySelectionScreen
          trayNumber={trayIndex}
          totalTrays={trayCount}
          brokenBunches={brokenBunches}
          onSelectBunch={handleSelectBunch}
        />
      )}
      {gamePhase === 'fortune' && (
        <FortuneSelectionScreen
          trayNumber={trayIndex}
          bunchNumber={bunchIndex}
          fortunes={fortunes}
          onSubmit={handleSubmitFortunes}
        />
      )}
    </>
  );
}
