import React, { useState, useEffect, useRef } from 'react';

// Existing Demo assets
import domeClosed from '../assets/demo/dome-closed.png';
import domeLifted from '../assets/demo/dome-lifted.png';
import fortune from '../assets/demo/fortune.png';
import approvedBox from '../assets/demo/approved-box.png';
import faultyBox from '../assets/demo/faulty-box.png';
import brokenCookie from '../assets/demo/broken-cookie.png';

// NEW ASSETS FOR THE TRAYS
import faultyCookie from '../assets/demo/faulty-cookie.png';
import approvedCookie from '../assets/demo/approved-cookie.png';

export default function Level1Game({ onComplete }) {
  const [domes, setDomes] = useState([
    { status: 'closed' }, 
    { status: 'closed' },
    { status: 'closed' },
    { status: 'closed' },
  ]);
  const [activeDome, setActiveDome] = useState(null);
  const [timer, setTimer] = useState(10);
  const [sortedCount, setSortedCount] = useState(0);
  const [phase, setPhase] = useState('sorting'); // sorting, transition, instruction
  
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);

  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);

  // Timer Logic
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

    if (newCount === 4) {
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

    if (newCount === 4) {
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

  // Handle the "Next" button after sorting
  const handleSortingNext = () => {
    setPhase('transition');
    setTimeout(() => setPhase('instruction'), 2000); // Truck leaves in 2s, then show instruction
  };

  const isComplete = sortedCount === 4;
  const counterText = `${sortedCount}/4`;

  return (
    <div className="level1-game-screen">
      {/* REMOVED: <div className="balloon-cluster">🎈🎈🎈</div> */}

      {/* 1. SORTING PHASE */}
      {phase === 'sorting' && (
        <div className="level1-game-layout">
          {/* Faulty Tray (Left) */}
          <div className="drop-zone faulty-zone" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'faulty')}>
            <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
            <div className="tray-contents">
              {faultyItems.map((_, i) => (
                <img key={i} src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
              ))}
            </div>
            <div className="tray-label faulty-label">Faulty Tray</div>
          </div>

          <div className="domes-tray">
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
                {dome.status === 'faulty' && <img src={domeLifted} alt="Emptied" className="dome-img emptied" />}
                {dome.status === 'approved' && <img src={domeLifted} alt="Emptied" className="dome-img emptied" />}
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

          {/* Approved Tray (Right) */}
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
      )}

      {/* 2. TRANSITION PHASE (Approved turns into truck and leaves) */}
      {phase === 'transition' && (
        <div className="level1-transition-layout">
          {/* Faulty Tray moves to center, Approved becomes truck */}
          <div className="drop-zone faulty-zone moving-center">
            <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
            <div className="tray-contents">
              {faultyItems.map((_, i) => (
                <img key={i} src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
              ))}
            </div>
            <div className="tray-label faulty-label">Faulty Tray</div>
          </div>

          {/* CSS Truck Placeholder (Remove this and use <img src={truck} className="truck-img" /> if you have the truck.png) */}
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

      {/* 3. INSTRUCTION PHASE */}
      {phase === 'instruction' && (
        <div className="level1-instruction-layout">
          {/* Faulty tray now perfectly centered INSIDE the golden box */}
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
              Your favorite artist has uploaded their new album on <span className="invalid-url">https://www.youttube.com/</span> 🔒
            </div>
            <button className="next-btn" onClick={() => onComplete(faultyItems)}>Next</button>

          </div>
        </div>
      )}

      {/* Footer for Sorting Phase */}
      {phase === 'sorting' && (
        <div className="level1-footer">
          {!isComplete && <div className="counter-pill">{counterText}</div>}
          {isComplete && <button className="next-btn" onClick={handleSortingNext}>Next</button>}
        </div>
      )}
    </div>
  );
}