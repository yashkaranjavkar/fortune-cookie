import React, { useState, useEffect, useRef } from 'react';
import TimerDial from './TimerDial';
import { playSound, startLoop, preloadLoop } from '../sounds';
import { useMascotTrigger } from '../config/mascotTriggers';
import { track, startTimer } from '../analytics';
import './MarkingScreen.css';

// Hand-drawn highlighter icon, matching the line-icon style used elsewhere in the app
const HighlighterIcon = () => (
  <svg className="marking-instruction-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13.5 3.5 L20.5 10.5 L11 20 L4 20 L4 13 Z" />
    <path d="M11 20 L4 13" />
    <path d="M9 6 L18 15" />
  </svg>
);

const HighlightedText = ({ text, selectedText }) => {
  if (!selectedText || !text.includes(selectedText)) return text;
  const parts = text.split(selectedText);
  return (
    <>
      {parts[0]}
      <mark className="permanent-highlight">{selectedText}</mark>
      {parts[1]}
    </>
  );
};

export default function MarkingScreen({ faultyItems, onNext }) {
  const itemCount = faultyItems.length;
  const [timer, setTimer] = useState(30);
  const [highlights, setHighlights] = useState(new Array(itemCount).fill(null));
  const cardRefs = useRef([]);
  const fireMascot = useMascotTrigger();
  const markTimer = useRef(startTimer());
  const timeLeftRef = useRef(30);
  timeLeftRef.current = timer;

  // The interval below is set up once on mount, so it closes over whatever
  // handleSubmit/highlights looked like at that moment - this ref always points at
  // the latest handleSubmit so the auto-submit-at-zero below never fires with stale
  // (empty) marking data.
  const handleSubmitRef = useRef(() => {});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          playSound('time-up');
          playSound('toast');
          fireMascot('markingTimeUp');
          handleSubmitRef.current(true);
          return 0;
        }
        if (prev - 1 <= 5) playSound('timer-tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Marker sound while the player drags across a fortune: a looping felt-tip-on-paper
  // rasp that gets louder the faster they move and fades when they hold still, so it
  // sounds like the stroke itself. It stops when they let go.
  const stroke = useRef(null);
  useEffect(() => {
    preloadLoop('highlight-stroke');
    return () => stopStroke();
  }, []); // eslint-disable-line

  const stopStroke = () => {
    const s = stroke.current;
    if (!s) return;
    clearTimeout(s.idle);
    window.removeEventListener('pointermove', s.move);
    window.removeEventListener('pointerup', stopStroke);
    window.removeEventListener('pointercancel', stopStroke);
    s.loop.stop();
    stroke.current = null;
  };

  const startStroke = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopStroke();
    const s = { loop: startLoop('highlight-stroke'), x: e.clientX, y: e.clientY, t: performance.now(), idle: null };
    s.move = (ev) => {
      const now = performance.now();
      const dt = Math.max(1, now - s.t);
      const speed = Math.hypot(ev.clientX - s.x, ev.clientY - s.y) / dt; // px per ms
      s.x = ev.clientX; s.y = ev.clientY; s.t = now;
      s.loop.setLevel(0.35 + Math.min(0.65, speed / 0.8)); // any movement is audible; faster is louder
      clearTimeout(s.idle);
      s.idle = setTimeout(() => s.loop.setLevel(0), 90); // holding still: the marker goes quiet
    };
    window.addEventListener('pointermove', s.move);
    window.addEventListener('pointerup', stopStroke);
    window.addEventListener('pointercancel', stopStroke);
    stroke.current = s;
  };

  const handleMouseUp = (index) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString();
    if (!text) return;
    const cardRef = cardRefs.current[index];
    if (!cardRef) return;
    const range = selection.getRangeAt(0);
    if (cardRef.contains(range.commonAncestorContainer)) {
      track('fortune_marked', {
        index,
        fortune: faultyItems[index].text,
        marked_text: text,
        replaced: highlights[index] || null,
        time_into_marking_ms: markTimer.current(),
      });
      setHighlights(prev => {
        const newHighlights = [...prev];
        newHighlights[index] = text;
        return newHighlights;
      });
      selection.removeAllRanges();
    }
  };

  const handleDoubleClick = (index) => {
    track('fortune_mark_removed', { index, fortune: faultyItems[index].text, removed_text: highlights[index] });
    setHighlights(prev => {
      const newHighlights = [...prev];
      newHighlights[index] = null;
      return newHighlights;
    });
    playSound('highlight-remove');
  };

  // Next stays locked until every fortune has a mark. If the timer runs out first,
  // whatever is marked (or not) is sent through as-is for inspection.
  const markedCount = highlights.filter(Boolean).length;
  const allMarked = markedCount === itemCount;
  const handleSubmit = (autoSubmitted = false) => {
    const data = faultyItems.map((fortune, i) => ({
      fullText: fortune.text,
      markedText: highlights[i],
      isPhishy: fortune.isPhishy,
      invalidPart: fortune.invalidPart
    }));
    track('marking_submitted', {
      items: data.map(d => ({ fortune: d.fullText, marked_text: d.markedText || null, is_phishy: typeof d.isPhishy === 'boolean' ? d.isPhishy : null, invalid_part: d.invalidPart || null })),
      marked_count: data.filter(d => d.markedText).length,
      item_count: data.length,
      auto_submitted: autoSubmitted === true,
      time_left_s: timeLeftRef.current,
      decision_ms: markTimer.current(),
    });
    onNext(data);
  };
  handleSubmitRef.current = handleSubmit;

  return (
    <div className="marking-screen">
      <div className="marking-header">
        <div className="tray-label faulty-label">Faulty Tray</div>
        <TimerDial value={timer} urgent={timer <= 5 && timer > 0} />
      </div>

      <div className="marking-instruction">
        <HighlighterIcon />
        Select the part of each fortune that looks suspicious to mark it
      </div>

      <div className="marking-list">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="marking-row">
            <div
              className="fortune-paper"
              ref={el => cardRefs.current[index] = el}
              onPointerDown={startStroke}
              onMouseUp={() => handleMouseUp(index)}
            >
              <HighlightedText text={faultyItems[index].text} selectedText={highlights[index]} />
              {highlights[index] && (
                <span className="remove-highlight-btn" onDoubleClick={() => handleDoubleClick(index)}>
                  (Double-click to remove)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!allMarked && (
        <p className="marking-progress" aria-live="polite">
          Mark every fortune to continue &middot; {markedCount} of {itemCount} marked
        </p>
      )}
      <button className={`next-btn${allMarked ? ' enabled' : ''}`} onClick={handleSubmit} disabled={!allMarked}>
        Next
      </button>

    </div>
  );
}