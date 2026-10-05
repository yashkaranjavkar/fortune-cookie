import React, { useRef } from 'react';
import OpeningScreen from '../components/OpeningScreen';
import { useScreen, track, startTimer } from '../analytics';

// The title screen, as its own section so it can be switched on/off in GAME_FLOW.
export default function OpeningSection({ onComplete }) {
  useScreen('title');
  const timer = useRef(startTimer());
  const done = useRef(false);

  const handleStart = (e) => {
    if (done.current) return;
    done.current = true;
    track('opening_start_pressed', {
      time_on_title_ms: timer.current(),
      via: e && e.type === 'click' ? 'button' : 'enter_key',
    });
    onComplete();
  };

  return <OpeningScreen onStart={handleStart} />;
}
