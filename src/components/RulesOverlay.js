import React from 'react';
import './RulesOverlay.css';

// Generic rules-recap overlay shell: a card with a close button, one slide of content
// at a time, and Back/Next paging. Each sorting game supplies its own slides (an array
// of { title, content }) with the rules it actually taught, reusing the l1-rules-* look.
export default function RulesOverlay({ slides, slide, onBack, onNext, onClose }) {
  const current = slides[slide];
  return (
    <div className="l1-rules-overlay">
      <div className="l1-rules-card">
        <button className="l1-rules-close" onClick={onClose} aria-label="Close">&times;</button>

        <div className="l1-rules-title">{current.title}</div>
        <div className="l1-rules-content">{current.content}</div>

        <div className="l1-rules-footer">
          <button className="l1-rules-back" onClick={onBack} style={{ visibility: slide === 0 ? 'hidden' : 'visible' }}>
            &lt;&lt;&lt; Back
          </button>
          {slide < slides.length - 1 ? (
            <button className="l1-rules-next" onClick={onNext}>Next &gt;&gt;&gt;</button>
          ) : (
            <button className="l1-rules-next" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}
