import React, { useEffect, useState } from 'react';
import { ANALYTICS } from '../config/analytics';
import { onBackendStatus, waitingEvents } from '../analytics';
import './BackendStatusBanner.css';

// Development only (ANALYTICS.warnWhenOffline): a bar across the top of the game while
// the analytics backend can't be reached, so a play-through is never quietly left
// unrecorded. The events wait in the browser meanwhile; the bar goes away by itself once
// the backend answers again and they've been sent.
export default function BackendStatusBanner() {
  const [down, setDown] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => onBackendStatus((status) => {
    setDown(status === 'down');
    if (status !== 'down') setHidden(false); // show again next time it goes down
  }), []);

  // keep the "waiting" count current while the bar is up
  useEffect(() => {
    if (!down) return undefined;
    setWaiting(waitingEvents());
    const t = setInterval(() => setWaiting(waitingEvents()), 2000);
    return () => clearInterval(t);
  }, [down]);

  if (!down || hidden) return null;
  return (
    <div className="backend-banner" role="alert">
      <span className="backend-banner-dot" aria-hidden="true" />
      <span>
        <b>Analytics backend not reachable</b> at {ANALYTICS.apiUrl} - this play-through isn't being recorded yet
        {waiting > 0 && ` (${waiting} event${waiting === 1 ? '' : 's'} waiting in this browser)`}.
        {' '}Start it with <code>npm start</code> in the main folder, or <code>npm run backend</code>. Keep this tab open - they'll be sent once it's up.
      </span>
      <button type="button" className="backend-banner-close" onClick={() => setHidden(true)} aria-label="Hide" data-sound="none">×</button>
    </div>
  );
}
