import OpeningSection from '../sections/OpeningSection';
import JobApplicationSection from '../sections/JobApplicationSection';
import TrainingSection from '../sections/TrainingSection';
import Level1Section from '../sections/Level1Section';
import Level2Section from '../sections/Level2Section';
import Level3Section from '../sections/Level3Section';
import SupervisorSection from '../sections/SupervisorSection';
import FinalTraysSection from '../sections/FinalTraysSection';

// Every section the game can be built from. Each one is fully self-contained - it owns
// all of its own internal screens/state and only ever calls onComplete() when it's done.
export const SECTIONS = {
  opening: OpeningSection,             // Title screen (assets/Drawings/Opening screen.jpg)
  job: JobApplicationSection,          // Job application and offer acceptance
  training: TrainingSection,           // Training
  level1: Level1Section,               // Level one (rules, 4-cookie gameplay, inspection)
  level2: Level2Section,               // Level two (rules, 5-cookie gameplay, inspection)
  level3: Level3Section,               // Level three (rules, 6-cookie gameplay, inspection)
  supervisor: SupervisorSection,       // Supervisor (checklist)
  finalTrays: FinalTraysSection        // Last three trays sorting again
};

// THIS is the game's configuration: which sections run, and in what order.
// Edit this array to change the game - there is no in-game UI for it.
//
// Example: to run just Job application -> Training -> Level one -> the final tray
// sorting round, set:
//   export const GAME_FLOW = ['job', 'training', 'level1', 'finalTrays'];
export const GAME_FLOW = [
  //'opening',
  //'job',
  'training',
  'level1',
  //'level2',
  //'level3',
  //'supervisor',
  'finalTrays'
];

// How many trays the tray-sorting minigame runs through - shared by Training's own
// round and the standalone "final trays" round, since they're the same minigame.
export const TRAY_COUNT = 1;
