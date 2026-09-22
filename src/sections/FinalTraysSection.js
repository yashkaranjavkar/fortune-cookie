import React from 'react';
import TraySortingSection from './TraySortingSection';

// "Last three trays sorting again" - the same tray-sorting minigame as Training,
// run standalone with no surrounding instructions.
export default function FinalTraysSection({ onComplete }) {
  return <TraySortingSection onComplete={onComplete} />;
}
