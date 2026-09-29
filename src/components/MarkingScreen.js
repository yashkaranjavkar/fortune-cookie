import React, { useState, useEffect, useRef } from 'react';
import TimerDial from './TimerDial';
import { playSound } from '../sounds';
import { useMascotTrigger } from '../config/mascotTriggers';
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
          handleSubmitRef.current();
          return 0;
        }
        if (prev - 1 <= 5) playSound('timer-tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseUp = (index) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString();
    if (!text) return;
    const cardRef = cardRefs.current[index];
    if (!cardRef) return;
    const range = selection.getRangeAt(0);
    if (cardRef.contains(range.commonAncestorContainer)) {
      setHighlights(prev => {
        const newHighlights = [...prev];
        newHighlights[index] = text;
        return newHighlights;
      });
      selection.removeAllRanges();
      playSound('highlight-mark');
    }
  };

  const handleDoubleClick = (index) => {
    setHighlights(prev => {
      const newHighlights = [...prev];
      newHighlights[index] = null;
      return newHighlights;
    });
    playSound('highlight-remove');
  };

  // Marking is a judgement call, not a requirement - a fortune that isn't actually
  // phishy is correctly left unmarked, so submitting doesn't force every item to have
  // a highlight. Whatever's marked (or not) gets sent through as-is for inspection.
  const handleSubmit = () => {
    const data = faultyItems.map((fortune, i) => ({
      fullText: fortune.text,
      markedText: highlights[i],
      isPhishy: fortune.isPhishy,
      invalidPart: fortune.invalidPart
    }));
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

      <button className="next-btn enabled" onClick={handleSubmit}>
        Next
      </button>

    </div>
  );
}