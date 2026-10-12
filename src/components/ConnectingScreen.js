import React, { useEffect, useRef } from 'react';
import './ConnectingScreen.css';

// "Connecting you to the game..." - a short loader after the player's details. Plain,
// like the details form before it: no game branding, art or sound. Moves on by itself
// after `durationMs`.
export default function ConnectingScreen({ onDone, durationMs = 2400 }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return (
    <div className="connecting-screen" role="status" aria-live="polite">
      <span className="connecting-spinner" aria-hidden="true" />
      <p className="connecting-text">Connecting you to the game…</p>
      <div className="connecting-bar" aria-hidden="true">
        <span style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </div>
  );
}
