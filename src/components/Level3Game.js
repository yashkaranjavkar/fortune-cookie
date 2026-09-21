import React, { useState, useEffect, useRef } from 'react';
import SortTray from './SortTray';
import { pickFortune } from '../utils/fortunePool';

import domeClosed from '../assets/demo/dome-closed.png';
import domeLifted from '../assets/demo/dome-lifted.png';
import brokenCookie from '../assets/demo/broken-cookie.png';

export default function Level3Game({ onComplete, onSkip }) {
  const TOTAL = 6;

  const [domes, setDomes] = useState(
    Array.from({ length: TOTAL }, () => ({ status: 'closed' }))
  );
  const [activeDome, setActiveDome] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [timer, setTimer] = useState(10);
  const [sortedCount, setSortedCount] = useState(0);
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [phase, setPhase] = useState('sorting'); // sorting | transition | instruction

  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);

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
        setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: 'open', text: pickFortune(prev.map(x => x.text)) } : d));
        setActiveDome(index);
      }, 300);
    }
  };

  const handleMouseLeave = () => clearTimeout(hoverTimeout.current);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('domeIndex', activeDome);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  const handleDrop = (e, trayType) => {
    e.preventDefault();
    setDragging(false);
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
    setDragging(false);
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
    setDragging(false);
    if (activeDome !== null && domes[activeDome].status === 'open') {
      handleWaste(activeDome);
    }
  };

  const handleSortingNext = () => {
    setPhase('transition');
    setTimeout(() => setPhase('instruction'), 2000);
  };

  const isComplete = sortedCount === TOTAL;
  const counterText = `${sortedCount}/${TOTAL}`;

  return (
    <div className="level1-game-screen">

      {/* PHASE 1: SORTING */}
      {phase === 'sorting' && (
        <>
          <div className="level1-game-layout">
            {/* Faulty Tray */}
            <SortTray type="faulty" items={faultyItems} dragging={dragging}
              onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'faulty')} />

            {/* 6 Domes Tray */}
            <div className="domes-tray domes-tray-6">
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
                      <div
                        className={`fortune-drag fortune-slip${dragging ? ' dragging' : ''}`}
                        draggable={true}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        {dome.text}
                      </div>
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
            <SortTray type="approved" items={approvedItems} dragging={dragging}
              onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'approved')} />
          </div>

          <div className="level1-footer">
            {!isComplete && <div className="counter-pill">{counterText}</div>}
            {isComplete && <button className="next-btn" onClick={handleSortingNext}>Next</button>}
          </div>
        </>
      )}

      {/* PHASE 2: TRANSITION (Truck drives off, faulty tray centers) */}
      {phase === 'transition' && (
        <div className="level1-transition-layout">
          <SortTray type="faulty" items={faultyItems} className="moving-center" />

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

      {/* PHASE 3: INSTRUCTION */}
      {phase === 'instruction' && (
        <div className="level1-instruction-layout">
          <div className="instruction-card">
            <SortTray type="faulty" items={faultyItems} className="centered" />

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

          <button className="instruction-skip-btn" onClick={() => onSkip(faultyItems)}>
            Skip &gt;&gt;&gt;
          </button>
        </div>
      )}

    </div>
  );
}