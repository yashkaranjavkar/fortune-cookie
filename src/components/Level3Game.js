import React, { useState, useEffect, useRef } from 'react';
import SortTray from './SortTray';
import BalloonCluster from './BalloonCluster';
import RulesOverlay from './RulesOverlay';
import InvalidURLExplainer from './InvalidURLExplainer';
import { pickFortune } from '../utils/fortunePool';
import { playSound } from '../sounds';
import { useMascotTrigger } from '../config/mascotTriggers';
import useSortingTracker from '../analytics/useSortingTracker';
import './DomeFocus.css';
import './SampleFortune.css';

import domeClosed from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-covered.svg';
import domeLifted from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-lifted.svg';
import domeSpent from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-spent.svg';
import brokenCookie from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-broken.svg';

// The rules taught in this level's own instructions, revisitable mid-game.
const RULE_SLIDES = [
  {
    title: 'Identifying Faulty Fortune',
    content: (
      <>
        <p className="l1-rules-text">1. Valid URL + matching context = valid.</p>
        <p className="l1-rules-text">2. Even an invalid URL is fine if the fortune is warning you about it.</p>

        <div className="l1-rules-box faulty">
          <span className="l1-rules-box-label faulty">Faulty</span>
          <div className="l1-rules-fortune-box">
            Your favorite artist has uploaded their new album on <span className="l1-rules-highlight">http://www.youtude.com/</span>
          </div>
        </div>

        <div className="l1-rules-box valid">
          <span className="l1-rules-box-label valid">Valid</span>
          <div className="l1-rules-fortune-box">
            Avoid clicking on links like <span className="l1-rules-highlight">http://www.youtude.com/</span> to watch a video
          </div>
        </div>
      </>
    )
  },
  {
    title: 'Identifying invalid URL',
    content: <InvalidURLExplainer stage={2} />
  }
];

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

  const [poppedBalloons, setPoppedBalloons] = useState({ orange: false, pink: false, green: false });
  const [rulesOpen, setRulesOpen] = useState(false);
  const [ruleSlide, setRuleSlide] = useState(0);

  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);
  const fireMascot = useMascotTrigger();
  const stats = useSortingTracker('level3');

  // Analytics: a dome just opened
  useEffect(() => {
    if (activeDome !== null && domes[activeDome].status === 'open') stats.revealed(activeDome, (domes[activeDome].text ? { text: domes[activeDome].text } : null));
  }, [activeDome]); // eslint-disable-line

  // Countdown timer - paused (not reset) while the rules overlay is open
  useEffect(() => {
    if (activeDome !== null && domes[activeDome].status === 'open' && !rulesOpen) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleWaste(activeDome);
            return 0;
          }
          if (prev - 1 <= 3) playSound('timer-tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeDome, rulesOpen]);

  const handleMouseEnter = (index) => {
    // Only one dome may be mid-hover or open at a time - guard both against another
    // dome already being open (activeDome) and against a different dome's own 300ms
    // hover timer still pending (hoverTimeout.current).
    if (domes[index].status === 'closed' && activeDome === null && !hoverTimeout.current) {
      hoverTimeout.current = setTimeout(() => {
        hoverTimeout.current = null;
        setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: 'open', text: pickFortune(prev.map(x => x.text)) } : d));
        setTimer(10);
        setActiveDome(index);
        playSound('dome-lift');
        fireMascot('domeRevealed');
      }, 300);
    }
  };

  const handlePopBalloon = (key) => {
    stats.help(key, usesLeft - 1);
    setPoppedBalloons(prev => ({ ...prev, [key]: true }));
    setRuleSlide(0);
    setRulesOpen(true);
    playSound('balloon-pop');
    playSound('popup-open');
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = null;
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('domeIndex', activeDome);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
    playSound('slip-pickup');
  };

  const handleDrop = (e, trayType) => {
    e.preventDefault();
    setDragging(false);
    const index = Number(e.dataTransfer.getData('domeIndex'));
    clearInterval(intervalRef.current);
    stats.sorted(index, { text: domes[index].text }, trayType, timer);

    if (trayType === 'faulty') {
      setFaultyItems(prev => [...prev, { text: domes[index].text }]);
    } else {
      setApprovedItems(prev => [...prev, { text: domes[index].text }]);
    }

    setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: trayType } : d));
    setActiveDome(null);
    playSound('drop-approved');
    fireMascot('fortuneSorted');

    const newCount = sortedCount + 1;
    setSortedCount(newCount);

    if (newCount === TOTAL) {
      setTimeout(() => {
        setDomes(prev => prev.map(d => ({ ...d, status: 'complete' })));
      }, 600);
    }
  };

  const handleWaste = (index, reason = 'timer') => {
    clearInterval(intervalRef.current);
    stats.timedOut(index, { text: domes[index].text }, reason);
    setDragging(false);
    setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: 'wasted' } : d));
    setActiveDome(null);
    playSound('time-up');
    playSound('cookie-break');
    fireMascot('fortuneWasted');

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
      handleWaste(activeDome, 'dropped_outside_tray');
    }
  };

  const handleSortingNext = () => {
    stats.roundComplete(faultyItems, approvedItems);
    setPhase('transition');
    setTimeout(() => setPhase('instruction'), 2000);
  };

  const isComplete = sortedCount === TOTAL;
  const counterText = `${sortedCount}/${TOTAL}`;
  const usesLeft = Object.values(poppedBalloons).filter(Boolean).length < 3
    ? 3 - Object.values(poppedBalloons).filter(Boolean).length
    : 0;

  return (
    <div className="level1-game-screen">
      {activeDome !== null && <div className="dome-focus-backdrop" />}

      {!isComplete && (
        <BalloonCluster popped={poppedBalloons} onPop={handlePopBalloon} usesLeft={usesLeft} />
      )}

      {rulesOpen && (
        <RulesOverlay
          slides={RULE_SLIDES}
          slide={ruleSlide}
          onBack={() => setRuleSlide(s => Math.max(0, s - 1))}
          onNext={() => setRuleSlide(s => Math.min(RULE_SLIDES.length - 1, s + 1))}
          onClose={() => { setRulesOpen(false); playSound('popup-close'); }}
        />
      )}

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
                    <img src={domeSpent} alt="Emptied" className="dome-img emptied" />
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

            <div className="instruction-card-actions">
              <button className="instruction-skip-btn" onClick={() => { stats.skippedMarkingIntro(); onSkip(faultyItems, approvedItems); }}>
                Skip &gt;&gt;&gt;
              </button>
              <button className="next-btn" onClick={() => onComplete(faultyItems, approvedItems)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}