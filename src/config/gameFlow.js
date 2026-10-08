import OpeningSection from '../sections/OpeningSection';
import JobApplicationSection from '../sections/JobApplicationSection';
import TrainingSection from '../sections/TrainingSection';
import Level1Section from '../sections/Level1Section';
import Level2Section from '../sections/Level2Section';
import Level3Section from '../sections/Level3Section';
import SupervisorSection from '../sections/SupervisorSection';
import FinalTraysSection from '../sections/FinalTraysSection';
import PlayerDetailsSection from '../sections/PlayerDetailsSection';
import AppointmentSection from '../sections/AppointmentSection';

// Every section the game can be built from. Each one is fully self-contained - it owns
// all of its own internal screens/state and only ever calls onComplete() when it's done.
export const SECTIONS = {
  playerDetails: PlayerDetailsSection, // Employee ID, designation, region -> "Connecting you to the game..."
  opening: OpeningSection,             // Title screen (assets/Drawings/Opening screen.jpg) - the game clock starts on its Start button
  appointment: AppointmentSection,     // "You're the new Fortune Cookie Inspector - training comes first"
  job: JobApplicationSection,          // Job application and offer acceptance
  training: TrainingSection,           // Training
  level1: Level1Section,               // Level one (rules, 4-cookie gameplay, inspection)
  level2: Level2Section,               // Level two (rules, 5-cookie gameplay, inspection)
  level3: Level3Section,               // Level three (rules, 6-cookie gameplay, inspection)
  supervisor: SupervisorSection,       // Supervisor (checklist)
  finalTrays: FinalTraysSection        // Last three trays sorting again
};

// THIS is the game's configuration: which sections run, and in what order.
// Each entry below is one complete version of the game; ACTIVE_FLOW picks which one
// runs. Edit the arrays to change a version - there is no in-game UI for it.
//
// Example: to run just Job application -> Training -> Level one -> the final tray
// sorting round, set:
//   standard: ['job', 'training', 'level1', 'finalTrays'],
export const GAME_FLOWS = {
  // The full story: the job application and offer narrative, then training.
  standard: [
    //'opening',
    'job',
    'training',
    'level1',
    //'level2',
    //'level3',
    //'supervisor',
    'finalTrays'
  ],

  // Straight in: the player gives their Employee ID, designation and region first, a
  // "connecting" loader plays, the title screen fades in, and the game clock starts
  // when they press Start. Then a single "you've been appointed - training comes
  // first" screen replaces the job-application story, and training continues as usual.
  quickStart: [
    //'playerDetails',
    //'opening',
    //'appointment',
    //'training',
    'level1',
    //'level2',
    //'level3',
    //'supervisor',
    'finalTrays'
  ],
};

// Which version of the game runs: 'standard' or 'quickStart'
export const ACTIVE_FLOW = 'quickStart';

export const GAME_FLOW = GAME_FLOWS[ACTIVE_FLOW];

// How many trays the tray-sorting minigame runs through - shared by Training's own
// round and the standalone "final trays" round, since they're the same minigame.
export const TRAY_COUNT = 1;
