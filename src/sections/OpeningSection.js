import React from 'react';
import OpeningScreen from '../components/OpeningScreen';

// The title screen, as its own section so it can be switched on/off in GAME_FLOW.
export default function OpeningSection({ onComplete }) {
  return <OpeningScreen onStart={onComplete} />;
}
