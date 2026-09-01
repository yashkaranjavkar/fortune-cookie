import React, { useState, useEffect } from 'react';
import cookieIntact from '../assets/cookies/cookie-intact.png';
import cookieBroken from '../assets/cookies/broken-cookie.png';

export default function FortuneSelectionScreen({ trayNumber, bunchNumber, fortunes, onSubmit }) {
  const [phase, setPhase] = useState('breaking'); // breaking -> cracked -> fortunes
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('cracked');
    }, 800);

    const timer2 = setTimeout(() => {
      setPhase('fortunes');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const toggleSelection = (index) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  const handleNext = () => {
    onSubmit(selected);
    setSelected([]);
  };

  return (
    <div className="fortune-selection-screen">
      <div className="fortune-header">
        <div className="tray-label">TRAY NO.<br/><span className="tray-num">one</span></div>
        <div className="instruction">
          Identify which is(are) the Faulty Fortune(s) among the following. There can be multiple correct answers
        </div>
      </div>

      <div className="fortune-list">
        {fortunes.map((fortune, index) => (
          <div 
            key={index} 
            className={`fortune-row ${selected.includes(index) ? 'selected' : ''}`}
            onClick={() => phase === 'fortunes' && toggleSelection(index)}
          >
            {/* The cookie stays in the exact same spot for breaking and fortunes */}
            <div className="fortune-cookie">
              <img 
                src={phase === 'breaking' ? cookieIntact : cookieBroken} 
                className={`breaking-cookie-img ${phase === 'cracked' ? 'cracked' : ''}`} 
                alt="Broken Cookie" 
              />
            </div>
            
            {/* The paper strip is hidden (opacity: 0) during breaking, then slides in */}
            <div className={`fortune-paper ${phase !== 'fortunes' ? 'hidden' : ''}`}>
              {phase === 'fortunes' ? fortune : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Button only appears when fortunes are ready */}
      {phase === 'fortunes' && (
        <button className="next-btn" onClick={handleNext} disabled={selected.length === 0}>
          Next
        </button>
      )}
    </div>
  );
}