import React from 'react';
import TraySortingSection from './TraySortingSection';
import { TRAY_COUNT } from '../config/gameFlow';
import { useScreen } from '../analytics';

// "Last N trays sorting again" - the same tray-sorting minigame as Training,
// run standalone with no surrounding instructions.
export default function FinalTraysSection({ onComplete }) {
  useScreen('final_trays');
  return <TraySortingSection trayCount={TRAY_COUNT} onComplete={onComplete} />;
}
