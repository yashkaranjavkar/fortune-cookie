import React from 'react';
import TraySortingSection from './TraySortingSection';
import { useScreen } from '../analytics';
import { useStageCursor } from '../utils/cursor';

// The final trays - the same tray-sorting minigame as Training, run standalone with no
// surrounding instructions. It's the part's POST-TEST: same layout and mix of fortunes
// as Training's trays (the pre-test), different fortunes.
export default function FinalTraysSection({ onComplete }) {
  useScreen('final_trays');
  useStageCursor('glove');
  return <TraySortingSection test="posttest" onComplete={onComplete} />;
}
