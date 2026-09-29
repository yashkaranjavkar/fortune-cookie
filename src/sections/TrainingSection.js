import React from 'react';
import SectionRunner from './SectionRunner';
import { TRAINING_STEPS } from '../config/steps/training';

// Tray/fortune training minigame -> "training complete" -> sorting rules -> interactive
// demo. The actual screen order lives in src/config/steps/training.js.
export default function TrainingSection({ onComplete }) {
  const context = { onComplete };
  return <SectionRunner steps={TRAINING_STEPS} context={context} />;
}
