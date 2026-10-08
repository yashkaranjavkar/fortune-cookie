import React from 'react';
import { StoryScreen, SEAL_ICONS } from './FactoryFront';
import { WorkstationScene, TrainingPath } from './WelcomeScreen';

// Shown right after the title screen in the "quickStart" flow: the player has been
// appointed as Fortunery's new Fortune Cookie Inspector, and is told that training
// comes first. Next goes straight to the Training section.
export default function AppointmentScreen({ onNext }) {
  return (
    <StoryScreen
      kicker="Congratulations!"
      centered
      icon={SEAL_ICONS.hat}
      title="You're Fortunery's new Fortune Cookie Inspector"
      subtitle="Training first, then your own workstation."
      onNext={onNext}
    >
      <div className="ff-scene">
        <WorkstationScene />
      </div>

      <p className="ff-text">
        You have been appointed as the new Fortune Cookie Inspector at Fortunery. Before
        you take your place at your own workstation, you'll go through your training.
      </p>

      <TrainingPath />
    </StoryScreen>
  );
}
