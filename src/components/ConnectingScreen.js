import React, { useEffect, useRef } from 'react';
import cookie from '../assets/Drawings/fortune cookie.png';
import './ConnectingScreen.css';

// "Connecting you to the game..." - a short loader between the player's details and
// the title screen. Moves on by itself after `durationMs`.
export default function ConnectingScreen({ onDone, durationMs = 2400 }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return (
    <div className="connecting-screen" role="status" aria-live="polite">
      <div className="connecting-orbit" aria-hidden="true">
        <img src={cookie} alt="" className="connecting-cookie" />
        <span className="connecting-dot d1" />
        <span className="connecting-dot d2" />
        <span className="connecting-dot d3" />
      </div>
      <p className="connecting-text">Connecting you to the game<span className="connecting-ellipsis" aria-hidden="true" /></p>
      <div className="connecting-bar" aria-hidden="true">
        <span style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </div>
  );
}
