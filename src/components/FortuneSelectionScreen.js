import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../sounds';
import { track } from '../analytics';
import cookieIntact from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-whole.svg';
import cookieBroken from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-cracked.svg';

export default function FortuneSelectionScreen({ trayNumber, bunchNumber, fortunes, onSubmit }) {
  const [phase, setPhase] = useState('breaking'); // breaking -> cracked -> fortunes
  const [selected, setSelected] = useState([]);
  const shownAt = useRef(null); // when the fortunes appeared, for decision time

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('cracked');
      playSound('cookie-crack');
    }, 800);

    const timer2 = setTimeout(() => {
      setPhase('fortunes');
      shownAt.current = performance.now();
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
    playSound('select');
  };

  const handleNext = () => {
    track('tray_fortunes_selected', {
      tray: trayNumber,
      bunch: bunchNumber,
      selected: selected.map(i => fortunes[i]),
      selected_count: selected.length,
      decision_ms: shownAt.current ? Math.round(performance.now() - shownAt.current) : null,
    });
    onSubmit(selected);
    setSelected([]);
    playSound('toast');
  };

  return (
    <div className="fortune-selection-screen">
      <div className="fortune-header">
       <div className="tray-label">
         TRAY NO.<br/>
         <span className="tray-num">
           {trayNumber === 0 ? 'one' : trayNumber === 1 ? 'two' : 'three'}
         </span>
      </div>
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

