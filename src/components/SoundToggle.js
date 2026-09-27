import React, { useState } from 'react';
import { isMuted, setMuted, playSound } from '../sounds';
import './SoundToggle.css';

// The one persistent, always-on-screen control in the game: mute/unmute, remembered
// across sessions (sounds.js itself persists the choice to localStorage).
export default function SoundToggle() {
  const [muted, setMutedState] = useState(isMuted());

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('button-press');
  };

  return (
    <button
      className="sound-toggle-btn"
      onClick={toggle}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={!muted}
      data-sound="none"
    >
      {muted ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16.5 9.5l4 4M20.5 9.5l-4 4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16.5 9c1.2 1 1.2 5 0 6" />
          <path d="M19 7c2.2 2 2.2 8 0 10" />
        </svg>
      )}
    </button>
  );
}
