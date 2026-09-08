import React, { useState, useEffect, useRef } from 'react';
import faultyCookie from '../assets/demo/faulty-cookie.png'; // Use the golden broken cookie

// Helper function to highlight the selected text within the string
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
  
  // Store the selected highlight text for each fortune index (or null)
  const [highlights, setHighlights] = useState(new Array(itemCount).fill(null));

  const cardRefs = useRef([]);

  // 30-second timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle text selection
  const handleMouseUp = (index) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString();
    if (!text) return;

    // Check if the selection is inside the specific fortune card
    const cardRef = cardRefs.current[index];
    if (!cardRef) return;

    const range = selection.getRangeAt(0);
    if (cardRef.contains(range.commonAncestorContainer)) {
      // Save this text as the highlight for this card
      setHighlights(prev => {
        const newHighlights = [...prev];
        newHighlights[index] = text;
        return newHighlights;
      });
      
      // Clear the browser selection so it doesn't lose focus
      selection.removeAllRanges();
    }
  };

  // Handle double-click to remove the highlight
  const handleDoubleClick = (index) => {
    setHighlights(prev => {
      const newHighlights = [...prev];
      newHighlights[index] = null;
      return newHighlights;
    });
  };

  // All cards are marked if they all have a highlight (non-null)
  const allMarked = highlights.every(h => h !== null && h.length > 0);

  return (
    <div className="marking-screen">
      <div className="marking-header">
        <div className="tray-label faulty-label">Faulty Tray</div>
        <div className="timer-circle">{timer}</div>
      </div>

      <div className="marking-list">
        {Array.from({ length: itemCount }).map((_, index) => {
          const fullText = 
            index === 0 ? "Your path to success is beautifully customized, matching the perfect recommendations found on free-amazon.com. 🎀⭐" :
            index === 1 ? "A meaningful connection made today on linkedin.com will open doors to unexpected opportunities tomorrow. 💼✨" :
            index === 2 ? "Your creative spark will lead to a unique project, celebrated on deviantart.org. 🎨🚀" :
            "An upcoming payment is waiting for you at paypa1-secure.com. 💰🔒";

          return (
            <div key={index} className="marking-row">
              <img src={faultyCookie} alt="Broken Cookie" className="marking-cookie" />
              
              <div 
                className="fortune-paper" 
                ref={el => cardRefs.current[index] = el}
                onMouseUp={() => handleMouseUp(index)}
              >
                <HighlightedText text={fullText} selectedText={highlights[index]} />
                
                {/* If highlighted, allow double-click to remove */}
                {highlights[index] && (
                  <span 
                    className="remove-highlight-btn" 
                    onDoubleClick={() => handleDoubleClick(index)}
                  >
                    (Double-click to remove)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        className={`next-btn ${allMarked ? 'enabled' : ''}`} 
        disabled={!allMarked} 
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}