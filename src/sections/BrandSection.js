import React from 'react';
import BrandVideoScreen from '../components/BrandVideoScreen';
import { useScreen } from '../analytics';
import { useStageCursor } from '../utils/cursor';

// The TCS Research intro video, shown on its own between the player details and the
// game's title screen. Moves on when the video ends (or straight away if there's no
// video file yet - see BrandVideoScreen.js).
export default function BrandSection({ onComplete }) {
  useScreen('tcs_research_video');
  useStageCursor('plain');
  return <BrandVideoScreen onDone={onComplete} />;
}
