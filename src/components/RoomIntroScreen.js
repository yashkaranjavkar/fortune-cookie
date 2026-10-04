import React, { useEffect, useRef } from 'react';
import RoomVignette from './RoomVignettes';
import { STOPS } from '../config/stations';
import './RoomIntroScreen.css';

// "Now entering ..." card that fades in after a walk on the factory map, shows a
// close-up illustration of the room the player just arrived at, then fades out and
// hands off to whatever screen comes next.
export default function RoomIntroScreen({ stopKey, subtitle, onDone, duration = 3400 }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), duration);
    return () => clearTimeout(t);
  }, [duration]);

  const stop = STOPS[stopKey] || { icon: '📍', label: 'Corridor', blurb: '' };

  return (
    <div className="room-intro-screen" style={{ '--ri-duration': `${duration}ms` }}>
      <div className="ri-card">
        <div className="ri-kicker">
          Now entering{subtitle ? <span className="ri-tag">{subtitle}</span> : null}
        </div>
        <h2 className="ri-title">
          <span className="ri-title-icon" aria-hidden="true">{stop.icon}</span>
          {stop.label}
        </h2>
        <div className="ri-art">
          <RoomVignette stopKey={stopKey} icon={stop.icon} />
        </div>
        {stop.blurb && <p className="ri-blurb">{stop.blurb}</p>}
      </div>
    </div>
  );
}
