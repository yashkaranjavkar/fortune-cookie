import React, { useState, useEffect, useRef } from 'react';
import SortTray from './SortTray';
import DeliveryTransition, { DELIVERY_MS } from './DeliveryTransition';
import usePointerDrag from '../utils/usePointerDrag';
import FortuneFocus from './FortuneFocus';
import BalloonCluster from './BalloonCluster';
import RulesOverlay from './RulesOverlay';
import InvalidURLExplainer from './InvalidURLExplainer';
import { pickLevel2Fortune } from '../utils/level2Fortunes';
import { playSound } from '../sounds';
import { useMascotTrigger } from '../config/mascotTriggers';
import useSortingTracker from '../analytics/useSortingTracker';
import './DomeFocus.css';
import './SampleFortune.css';
import './Level2GameInstructions.css';

import domeClosed from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-covered.svg';
import domeLifted from '../assets/dome-lifted-cookie.svg';
import domeSpent from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/dome-spent.svg';
import brokenCookie from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-broken.svg';

// The rules taught in this level's own instructions, revisitable mid-game.
const RULE_SLIDES = [
  {
    title: 'Identifying Faulty Fortune',
    content: (
      <>
        <p className="l1-rules-text">1. If the URL is correct and the context is related to the category of the URL, the fortune is valid.</p>
        <p className="l1-rules-text">2. If the URL is invalid, check the overall meaning &mdash; a fortune warning you away from a bad link is still valid.</p>

        <div className="l1-rules-box valid">
          <span className="l1-rules-box-label valid">Valid</span>
          <div className="l1-rules-fortune-box">
            <span className="context-highlight">The brand new trailer of your favorite movie is soon going to stream on</span> https://www.youtube.com/
          </div>
        </div>

        <div className="l1-rules-box faulty">
          <span className="l1-rules-box-label faulty">Faulty</span>
          <div className="l1-rules-fortune-box">
            Your favorite artist has uploaded their new album on <span className="l1-rules-highlight">http://www.youtube.corn/</span>
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

export default function Level2Game({ onComplete }) {
  const TOTAL = 5;

  const [domes, setDomes] = useState(
    Array.from({ length: TOTAL }, () => ({ status: 'closed' }))
  );
  const [activeDome, setActiveDome] = useState(null);
  // Fortune strips are carried with the pointer (closed-fist cursor) - see usePointerDrag
  const drag = usePointerDrag({
    onStart: () => playSound('slip-pickup'),
    onDrop: (tray) => handleDrop(tray),
    onMiss: () => handleDragEnd(),
  });
  const dragging = drag.dragging;
  const [timer, setTimer] = useState(10);
  const [sortedCount, setSortedCount] = useState(0);
  const [faultyItems, setFaultyItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [phase, setPhase] = useState('sorting'); // sorting, then transition (the delivery truck)

  const [poppedBalloons, setPoppedBalloons] = useState({ orange: false, pink: false, green: false });
  const [rulesOpen, setRulesOpen] = useState(false);
  const [ruleSlide, setRuleSlide] = useState(0);

  const hoverTimeout = useRef(null);
  const intervalRef = useRef(null);
  const fireMascot = useMascotTrigger();
  const stats = useSortingTracker('level2');

  // Analytics: a dome just opened
  useEffect(() => {
    if (activeDome !== null && domes[activeDome].status === 'open') stats.revealed(activeDome, domes[activeDome].fortune);
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
        setDomes(prev => prev.map((d, i) => i === index ? { ...d, status: 'open', fortune: pickLevel2Fortune(prev.filter(x => x.fortune).map(x => x.fortune.text)) } : d));
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

  const handleDrop = (trayType) => {
    const index = activeDome;
    if (index === null) return;
    clearInterval(intervalRef.current);
    stats.sorted(index, domes[index].fortune, trayType, timer);

    if (trayType === 'faulty') {
      setFaultyItems(prev => [...prev, domes[index].fortune]);
    } else {
      // Kept as the full fortune object (not just text) so a genuinely phishy
      // fortune that slipped through into Approved can still be graded wrong later.
      setApprovedItems(prev => [...prev, { ...domes[index].fortune }]);
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
    stats.timedOut(index, domes[index].fortune, reason);
    drag.cancel();
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

  const handleDragEnd = () => {
    if (activeDome !== null && domes[activeDome].status === 'open') {
      handleWaste(activeDome, 'dropped_outside_tray');
    }
  };

  // The delivery truck drives off, then the level moves on to marking
  const handleSortingNext = () => {
    stats.roundComplete(faultyItems, approvedItems);
    setPhase('transition');
    setTimeout(() => onComplete(faultyItems, approvedItems), DELIVERY_MS); // the truck drives off, then on to marking
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

      {/* ---------- PHASE 1: SORTING ---------- */}
      {phase === 'sorting' && (
        <>
          <div className="level1-game-layout">
            {/* Faulty Tray */}
            <SortTray type="faulty" items={faultyItems} dragging={dragging}
              over={drag.over === 'faulty'} />

            {/* 5 Domes Tray */}
            <div className="domes-tray domes-tray-5" data-drop-center>
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
                      <img src={domeLifted} alt="Dome Lifted" className="dome-img" draggable={false} {...drag.proxyProps('.fortune-focus-slip')} />
                      {/* the fortune itself is shown big in the middle of the screen */}
                      <FortuneFocus text={dome.fortune.text} timer={timer} dragging={dragging} handleProps={drag.handleProps} />
                      {drag.ghost(<div className="fortune-drag fortune-slip fortune-focus-slip">{dome.fortune.text}</div>, 'compact')}
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
              over={drag.over === 'approved'} />
          </div>

          <div className="level1-footer">
            {!isComplete && <div className="counter-pill">{counterText}</div>}
            {isComplete && <button className="next-btn" onClick={handleSortingNext}>Next</button>}
          </div>
        </>
      )}

      {/* ---------- PHASE 2: TRANSITION (Truck drives away, faulty tray centers) ---------- */}
      {phase === 'transition' && (
        <DeliveryTransition faultyItems={faultyItems} approvedItems={approvedItems} domes={5} boardClass="domes-tray-5" />
      )}


    </div>
  );
}