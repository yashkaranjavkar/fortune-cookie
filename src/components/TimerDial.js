import React from 'react';
import './TimerDial.css';

// A stopwatch face (ring + tick marks + knob) around the countdown number,
// instead of a plain circle with a number in it. Shared across timed screens.
// urgent: pops the dial red and pulses it, for the last few seconds of a countdown.
export default function TimerDial({ value, urgent = false }) {
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className={`timer-dial${urgent ? ' urgent' : ''}`}>
      <svg className="timer-dial-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="timer-dial-ring" cx="50" cy="50" r="42" />
        {ticks.map(i => {
          const angle = (i * 30 * Math.PI) / 180;
          const big = i % 3 === 0;
          const r1 = big ? 33 : 36;
          const r2 = 40;
          const x1 = 50 + r1 * Math.sin(angle);
          const y1 = 50 - r1 * Math.cos(angle);
          const x2 = 50 + r2 * Math.sin(angle);
          const y2 = 50 - r2 * Math.cos(angle);
          return <line key={i} className={`timer-dial-tick${big ? ' big' : ''}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        <rect className="timer-dial-knob" x="46" y="2" width="8" height="8" rx="2" />
      </svg>
      <div className="timer-dial-value">{value}</div>
    </div>
  );
}
