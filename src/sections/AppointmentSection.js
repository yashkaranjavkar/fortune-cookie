import React from 'react';
import AppointmentScreen from '../components/AppointmentScreen';
import { useScreen } from '../analytics';

// "You've been appointed as the new Fortune Cookie Inspector - training comes first."
// One screen, used by the quickStart flow in place of the job-application story.
export default function AppointmentSection({ onComplete }) {
  useScreen('appointment');
  return <AppointmentScreen onNext={onComplete} />;
}
