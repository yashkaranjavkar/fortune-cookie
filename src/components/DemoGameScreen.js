import React, { useState, useEffect, useRef } from 'react';

export default function DemoGameScreen({ onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle, hovering, revealed, wasted, done
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
    if (phase === 'idle' || phase === 'hovering') {
      clearTimeout(hoverTimeout.current);
      setPhase('idle');
    }
  };

  // Handle the 10 second countdown
  useEffect(() => {
    if (phase === 'revealed') {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setPhase('wasted'); // Trigger wasted time UI
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
    // In real game, check if fortune is faulty or approved here
    // For demo, just complete it
    setPhase('done');
    setTimeout(onComplete, 500);
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
    <div className="demo-screen">
      <div className="demo-title">Demonstration</div>
      
      {phase !== 'done' && (
        <div 
          className={`demo-dome-container ${phase === 'revealed' || phase === 'wasted' ? 'lifted' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`demo-dome ${phase === 'wasted' ? 'broken' : ''}`}>
            <div className="knob"></div>
          </div>
          
          {(phase === 'revealed' || phase === 'wasted') && (
            <>
              <div className="demo-timer">{timer < 10 ? `0${timer}` : timer}</div>
              
              <div 
                className={`demo-fortune ${phase === 'wasted' ? 'broken-cookie' : ''}`}
                draggable={phase === 'revealed'}
                onDragStart={handleDragStart}
              >
                <div className="fortune-text">
                  You are soon going to recieve your Mac mini delivery on https://aribba.corn.tcs-support
                </div>
              </div>

              {phase === 'wasted' && (
                <div className="wasted-message">You wasted time</div>
              )}
            </>
          )}
          
          {phase === 'idle' && <div className="demo-instruction">Hover over the food dome</div>}
        </div>
      )}

      {/* Drop Zones */}
      {(phase === 'revealed' || phase === 'wasted') && (
        <div className="demo-drop-zones">
          <div 
            className="drop-zone approved"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'approved')}
          >
            Approved Tray
          </div>
          <div 
            className="drop-zone faulty"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'faulty')}
          >
            Faulty Tray
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="demo-success">
          <h2>Demo Complete!</h2>
          <button className="next-btn" onClick={onComplete}>Start Actual Game</button>
        </div>
      )}
    </div>
  );
}