import React, { useState, useEffect, useRef } from 'react';

import domeClosed from '../assets/demo/dome-closed.png';
import domeLifted from '../assets/demo/dome-lifted.png';
import fortune from '../assets/demo/fortune.png';
import approvedBox from '../assets/demo/approved-box.png';
import faultyBox from '../assets/demo/faulty-box.png';
import brokenCookie from '../assets/demo/broken-cookie.png';
import faultyCookie from '../assets/demo/faulty-cookie.png';
import approvedCookie from '../assets/demo/approved-cookie.png';

export default function Level2Game({ onComplete, onSkip }) {
  const TOTAL = 5;

  const [domes, setDomes] = useState(
    Array.from({ length: TOTAL }, () => ({ status: 'closed' }))
  );
  const [activeDome, setActiveDome] = useState(null);
  const [timer, setTimer] = useState(10);
  const [sortedCount, setSortedCount] = useState(0);
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [phase, setPhase] = useState('sorting'); // sorting | transition | instruction

  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (activeDome !== null && domes[activeDome].status === 'open') {
      setTimer(10);
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleWaste(activeDome);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeDome]);

  const handleMouseEnter = (index) => {
    if (domes[index].status === 'closed') {
      hoverTimeout.current = setTimeout(() => {
        setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: 'open' } : d));
        setActiveDome(index);
      }, 300);
    }
  };

  const handleMouseLeave = () => clearTimeout(hoverTimeout.current);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('domeIndex', activeDome);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, trayType) => {
    e.preventDefault();
    const index = Number(e.dataTransfer.getData('domeIndex'));
    clearInterval(intervalRef.current);

    if (trayType === 'faulty') {
      setFaultyItems(prev => [...prev, index]);
    } else {
      setApprovedItems(prev => [...prev, index]);
    }

    setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: trayType } : d));
    setActiveDome(null);

    const newCount = sortedCount + 1;
    setSortedCount(newCount);

    if (newCount === TOTAL) {
      setTimeout(() => {
        setDomes(prev => prev.map(d => ({ ...d, status: 'complete' })));
      }, 600);
    }
  };

  const handleWaste = (index) => {
    clearInterval(intervalRef.current);
    setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: 'wasted' } : d));
    setActiveDome(null);

    const newCount = sortedCount + 1;
    setSortedCount(newCount);

    if (newCount === TOTAL) {
      setTimeout(() => {
        setDomes(prev => prev.map(d => ({ ...d, status: 'complete' })));
      }, 600);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDragEnd = () => {
    if (activeDome !== null && domes[activeDome].status === 'open') {
      handleWaste(activeDome);
    }
  };

  // Trigger truck + instruction
  const handleSortingNext = () => {
    setPhase('transition');
    setTimeout(() => setPhase('instruction'), 2000);
  };

  const isComplete = sortedCount === TOTAL;
  const counterText = `${sortedCount}/${TOTAL}`;

  return (
    <div className="level1-game-screen">

      {/* ---------- PHASE 1: SORTING ---------- */}
      {phase === 'sorting' && (
        <>
          <div className="level1-game-layout">
            {/* Faulty Tray */}
            <div className="drop-zone faulty-zone" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'faulty')}>
              <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
              <div className="tray-contents">
                {faultyItems.map((_, i) => (
                  <img key={i} src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
                ))}
              </div>
              <div className="tray-label faulty-label">Faulty Tray</div>
            </div>

            {/* 5 Domes Tray */}
            <div className="domes-tray domes-tray-5">
              {domes.map((dome, index) => (
                <div
                  key={index}
                  className={`dome-slot ${dome.status}`}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  {dome.status === 'closed' && <img src={domeClosed} alt="Dome" className="dome-img" />}

                  {dome.status === 'open' && (
                    <>
                      <div className="timer-display">{timer < 10 ? `0${timer}` : timer}</div>
                      <img src={domeLifted} alt="Dome Lifted" className="dome-img" />
                      <img
                        src={fortune}
                        alt="Fortune"
                        className="fortune-drag"
                        draggable={true}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </>
                  )}

                  {(dome.status === 'faulty' || dome.status === 'approved') && (
                    <img src={domeLifted} alt="Emptied" className="dome-img emptied" />
                  )}

                  {dome.status === 'wasted' && (
                    <>
                      <div className="wasted-text">You wasted time</div>
                      <img src={brokenCookie} alt="Wasted" className="dome-img" />
                    </>
                  )}

                  {dome.status === 'complete' && <div className="completed-mark">✓</div>}
                </div>
              ))}
            </div>

            {/* Approved Tray */}
            <div className="drop-zone approved-zone" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'approved')}>
              <img src={approvedBox} alt="Approved Tray" className="tray-bg" />
              <div className="tray-contents">
                {approvedItems.map((_, i) => (
                  <img key={i} src={approvedCookie} alt="Approved Cookie" className="tray-cookie-img" />
                ))}
              </div>
              <div className="tray-label approved-label">Approved Tray</div>
            </div>
          </div>

          <div className="level1-footer">
            {!isComplete && <div className="counter-pill">{counterText}</div>}
            {isComplete && <button className="next-btn" onClick={handleSortingNext}>Next</button>}
          </div>
        </>
      )}

      {/* ---------- PHASE 2: TRANSITION (Truck drives away, faulty tray centers) ---------- */}
      {phase === 'transition' && (
        <div className="level1-transition-layout">
          {/* Faulty tray moves to center */}
          <div className="drop-zone faulty-zone moving-center">
            <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
            <div className="tray-contents">
              {faultyItems.map((_, i) => (
                <img key={i} src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
              ))}
            </div>
            <div className="tray-label faulty-label">Faulty Tray</div>
          </div>

          {/* Approved tray turns into a truck and drives off */}
          <div className="truck-shipping">
            <div className="truck-box">Out for Delivery</div>
            <div className="truck-wheels">
              <div className="wheel"></div>
              <div className="wheel"></div>
              <div className="wheel"></div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PHASE 3: INSTRUCTION (Faulty tray + Skip) ---------- */}
      {phase === 'instruction' && (
        <div className="level1-instruction-layout">
          <div className="instruction-card">
            <div className="drop-zone faulty-zone centered">
              <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
              <div className="tray-contents">
                {faultyItems.map((_, i) => (
                  <img key={i} src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
                ))}
              </div>
              <div className="tray-label faulty-label">Faulty Tray</div>
            </div>

            <p className="instruction-text">
              You have to mark the invalid part in the URL of the fortune before sending for inspection
            </p>

            <div className="sample-fortune">
              Your favorite artist has uploaded their new album on{' '}
              <span className="invalid-url">http://www.youtube.com/</span> 🖊️
            </div>

            <button className="next-btn" onClick={() => onComplete(faultyItems)}>
              Next
            </button>
          </div>

          {/* Skip button in bottom-right corner */}
          <button className="instruction-skip-btn" onClick={() => onSkip(faultyItems)}>
            Skip &gt;&gt;&gt;
          </button>
        </div>
      )}

    </div>
  );
}