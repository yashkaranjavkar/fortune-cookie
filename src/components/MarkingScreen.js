import React, { useState, useEffect, useRef } from 'react';
import faultyCookie from '../assets/demo/faulty-cookie.png';

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
  const itemCount = faultyItems.length > 0 ? faultyItems.length : 2;
  const [timer, setTimer] = useState(30);
  const [highlights, setHighlights] = useState(new Array(itemCount).fill(null));
  const cardRefs = useRef([]);

  const fullTexts = [
    "Your path to success is beautifully customized, matching the perfect recommendations found on free-amazon.com. 🎀⭐",
    "A meaningful connection made today on linkedin.com will open doors to unexpected opportunities tomorrow. 💼✨",
    "Your creative spark will lead to a unique project, celebrated on deviantart.org. 🎨🚀",
    "An upcoming payment is waiting for you at paypa1-secure.com. 💰🔒"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
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
    }
  };

  const handleDoubleClick = (index) => {
    setHighlights(prev => {
      const newHighlights = [...prev];
      newHighlights[index] = null;
      return newHighlights;
    });
  };

  const allMarked = highlights.every(h => h !== null && h.length > 0);

  // This is the function that packages the data and moves to the next screen
  const handleSubmit = () => {
    const data = fullTexts.slice(0, itemCount).map((text, i) => ({
      fullText: text,
      markedText: highlights[i]
    }));
    onNext(data);
  };

  return (
    <div className="marking-screen">
      <div className="marking-header">
        <div className="tray-label faulty-label">Faulty Tray</div>
        <div className="timer-circle">{timer}</div>
      </div>

      <div className="marking-list">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="marking-row">
            <img src={faultyCookie} alt="Broken Cookie" className="marking-cookie" />
            <div 
              className="fortune-paper" 
              ref={el => cardRefs.current[index] = el}
              onMouseUp={() => handleMouseUp(index)}
            >
              <HighlightedText text={fullTexts[index]} selectedText={highlights[index]} />
              {highlights[index] && (
                <span className="remove-highlight-btn" onDoubleClick={() => handleDoubleClick(index)}>
                  (Double-click to remove)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ THE BUTTON GOES HERE */}
      <button 
        className={`next-btn ${allMarked ? 'enabled' : ''}`} 
        disabled={!allMarked} 
        onClick={handleSubmit}
      >
        Next
      </button>
      {/* ✅ END OF BUTTON */}

    </div>
  );
}