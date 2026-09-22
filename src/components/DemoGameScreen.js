import React, { useState, useEffect, useRef } from 'react';
import SortTray from './SortTray';
import './DemoGameScreen.css';

import domeClosed from '../assets/demo/dome-closed.png';
import domeLifted from '../assets/demo/dome-lifted.png';
import brokenCookie from '../assets/demo/broken-cookie.png';

const DEMO_SECONDS = 10;
const MAX_ATTEMPTS = 3;

// Practice fortunes - a mix of good and faulty links. One is picked at random each round.
const DEMO_FORTUNES = [
  "You are soon going to recieve your Mac mini delivery on https://aribba.corn.tcs-support",
  "Your favourite artist has uploaded a new album on https://www.youtube.com/ 🎵",
  "A pleasant surprise awaits you when you track your parcel on https://www.amazon.com/orders",
  "Great news! Claim your free voucher at http://amazon.com.gift-rewards.co before it expires",
  "Consistency in practising algorithms on https://www.geeksforgeeks.org will lead to your dream job",
  "Your next holiday is one click away on https://www.makemytrip.com/holidays",
  "Your salary slip is ready to view at https://hr-portal.tcs.payslip-login.net",
  "Stay ahead of the news with today's headlines on https://www.bbc.com/news"
];

function pickFortune(previous) {
  let next;
  do {
    next = DEMO_FORTUNES[Math.floor(Math.random() * DEMO_FORTUNES.length)];
  } while (next === previous && DEMO_FORTUNES.length > 1);
  return next;
}

export default function DemoGameScreen({ onComplete }) {
  // idle -> revealed (cookie open, strip + timer) -> placed (strip dropped in a tray)
  //                                               -> wasted (timer ran out)
  const [phase, setPhase] = useState('idle');
  const [timer, setTimer] = useState(DEMO_SECONDS);
  const [fortuneText, setFortuneText] = useState('');
  const [placedIn, setPlacedIn] = useState(null); // 'approved' | 'faulty'
  const [dragging, setDragging] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);

  // Hovering the dome (short delay) lifts it: the cookie opens and a fortune strip appears
  const handleMouseEnter = () => {
    if (phase === 'idle') {
      hoverTimeout.current = setTimeout(() => {
        setFortuneText(prev => pickFortune(prev));
        setTimer(DEMO_SECONDS);
        setPhase('revealed');
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (phase === 'idle') clearTimeout(hoverTimeout.current);
  };

  // Countdown while the strip is waiting to be sorted
  useEffect(() => {
    if (phase !== 'revealed') return undefined;
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setPhase('wasted');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  useEffect(() => () => clearTimeout(hoverTimeout.current), []);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', 'fortune');
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  const handleDrop = (e, tray) => {
    e.preventDefault();
    clearInterval(intervalRef.current);
    setDragging(false);
    if (phase !== 'revealed') return;
    setPlacedIn(tray);
    setPhase('placed');
  };

  const resetDemo = () => {
    clearInterval(intervalRef.current);
    clearTimeout(hoverTimeout.current);
    setTimer(DEMO_SECONDS);
    setPlacedIn(null);
    setDragging(false);
    setAttempts(prev => prev + 1);
    setPhase('idle');
  };

  const showTrays = phase === 'revealed' || phase === 'placed';
  const strip = (
    <div className="demo-fortune-strip">{fortuneText}</div>
  );

  return (
    <div className="demo-fullscreen">
      <div className="demo-title">Demonstration</div>
      <div className="demo-attempts">Attempt {attempts} of {MAX_ATTEMPTS}</div>
      <button className="demo-skip-btn" onClick={onComplete}>Skip &gt;&gt;&gt;</button>

      <div
        className="demo-stage"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {phase === 'idle' && (
          <>
            <img src={domeClosed} alt="Closed Dome" className="dome-img" />
            <div className="demo-hover-text">Hover over the food dome</div>
          </>
        )}

        {/* Dome lifted, cookie open, fortune strip waiting to be dragged */}
        {phase === 'revealed' && (
          <div className="demo-lifted-stage">
            <div className={`timer-overlay${timer <= 3 ? ' urgent' : ''}`}>
              {timer < 10 ? `0${timer}` : timer}
            </div>
            <img src={domeLifted} alt="Lifted Dome" className="dome-img" />
            <div
              className={`demo-fortune-strip draggable${dragging ? ' dragging' : ''}`}
              draggable="true"
              onDragStart={handleDragStart}
              onDragEnd={() => setDragging(false)}
            >
              {fortuneText}
            </div>
          </div>
        )}

        {/* Strip has been sorted - the opened cookie stays on the plate */}
        {phase === 'placed' && (
          <div className="demo-lifted-stage">
            <img src={domeLifted} alt="Lifted Dome" className="dome-img" />
          </div>
        )}

        {phase === 'wasted' && (
          <div className="demo-wasted-stage">
            <div className="wasted-text">You wasted time</div>
            <img src={brokenCookie} alt="Broken Cookie" className="dome-img" />
          </div>
        )}
      </div>

      {showTrays && (
        <div className="demo-drop-zones">
          {['approved', 'faulty'].map(type => (
            <SortTray
              key={type}
              type={type}
              dragging={dragging}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, type)}
            >
              {placedIn === type && strip}
            </SortTray>
          ))}
        </div>
      )}

      {(phase === 'placed' || phase === 'wasted') && attempts < MAX_ATTEMPTS && (
        <button className="demo-replay-btn" onClick={resetDemo}>Replay</button>
      )}
      {phase === 'placed' && (
        <button className="demo-next-btn" onClick={onComplete}>Next</button>
      )}
    </div>
  );
}
