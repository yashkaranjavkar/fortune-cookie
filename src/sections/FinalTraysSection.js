import React from 'react';
import TraySortingSection from './TraySortingSection';
import { TRAY_COUNT } from '../config/gameFlow';

// "Last N trays sorting again" - the same tray-sorting minigame as Training,
// run standalone with no surrounding instructions.
export default function FinalTraysSection({ onComplete }) {
  return <TraySortingSection trayCount={TRAY_COUNT} onComplete={onComplete} />;
}
