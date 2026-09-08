import React, { useState, useEffect, useRef } from 'react';

// Import your exact single assets
import domeClosed from '../assets/demo/dome-closed.png';
import domeLifted from '../assets/demo/dome-lifted.png';
import fortune from '../assets/demo/fortune.png';
import approvedBox from '../assets/demo/approved-box.png';
import faultyBox from '../assets/demo/faulty-box.png';
import brokenCookie from '../assets/demo/broken-cookie.png';

export default function DemoGameScreen({ onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle, revealed, approved, wasted
  const [timer, setTimer] = useState(10);
  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);

  // Handle the 300ms hover delay
  const handleMouseEnter = () => {
    if (phase === 'idle') {
      hoverTimeout.current = setTimeout(() => {
        setPhase('revealed');
        setTimer(10);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (phase === 'idle') {
      clearTimeout(hoverTimeout.current);
    }
  };

  // Handle the 10 second countdown
  useEffect(() => {
    if (phase === 'revealed') {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setPhase('wasted'); // Timer ran out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  // Handle Drag and Drop
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', 'fortune');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    clearInterval(intervalRef.current);
    
    if (type === 'faulty') {
      setPhase('wasted'); // Dropped in Red Box
    } else {
      setPhase('approved'); // Dropped in Green Box - SUCCESS!
      setTimeout(onComplete, 1500); // Show success briefly, then move on
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetDemo = () => {
    clearInterval(intervalRef.current);
    clearTimeout(hoverTimeout.current);
    setTimer(10);
    setPhase('idle');
  };

  return (
    <div className="demo-fullscreen">
      <div className="demo-title">Demonstration</div>
      
      {/* THE CENTER STAGE */}
      <div 
        className="demo-stage"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Idle State */}
        {phase === 'idle' && (
          <>
            <img src={domeClosed} alt="Closed Dome" className="dome-img" />
            <div className="demo-hover-text">Hover over the food dome</div>
          </>
        )}

        {/* Revealed State */}
        {phase === 'revealed' && (
          <div className="demo-lifted-stage">
            <img src={domeLifted} alt="Lifted Dome" className="dome-img" />
            <div className="timer-overlay">{timer < 10 ? `0${timer}` : timer}</div>
            <img 
              src={fortune} 
              alt="Fortune" 
              className="fortune-img"
              draggable="true"
              onDragStart={handleDragStart}
            />
          </div>
        )}

        {/* Approved State (Success) */}
        {phase === 'approved' && (
          <div className="demo-approved-stage">
            <div className="approved-text">Approved!</div>
            <img src={domeLifted} alt="Success" className="dome-img" />
          </div>
        )}

        {/* Wasted State (Time out or dropped in Red) */}
        {phase === 'wasted' && (
          <div className="demo-wasted-stage">
            <div className="wasted-text">You wasted time</div>
            <img src={brokenCookie} alt="Broken Cookie" className="dome-img" />
          </div>
        )}
      </div>

      {/* DROP ZONES (Only show when revealed) */}
      {phase === 'revealed' && (
        <div className="demo-drop-zones">
          <div 
            className="demo-drop-zone approved-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'approved')}
          >
            <img src={approvedBox} alt="Approved Tray" />
          </div>
          <div 
            className="demo-drop-zone faulty-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'faulty')}
          >
            <img src={faultyBox} alt="Faulty Tray" />
          </div>
        </div>
      )}

      {/* Replay Button (Only in wasted state) */}
      {phase === 'wasted' && (
        <button className="demo-replay-btn" onClick={resetDemo}>Replay</button>
      )}
    </div>
  );
}