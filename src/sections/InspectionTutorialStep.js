import React from 'react';
import { InspectionIntroScreen } from '../components/Level2Instructions';

// One-time "press the red button" beat, shown before the first real inspection round
// of whichever level happens to run first. Goes straight into that level's own real
// TorchInspectScreen (with its actual markedFortunes) - no sample/placeholder fortune
// is ever shown here, so the torch only ever displays what the player actually marked.
export default function InspectionTutorialStep({ onBack, onComplete }) {
  return <InspectionIntroScreen onNext={onComplete} onBack={onBack} />;
}
