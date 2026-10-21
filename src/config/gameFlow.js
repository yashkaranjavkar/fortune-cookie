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
import BrandSection from '../sections/BrandSection';

// Every section the game can be built from. Each one is fully self-contained - it owns
// all of its own internal screens/state and only ever calls onComplete() when it's done.
export const SECTIONS = {
  playerDetails: PlayerDetailsSection, // Employee ID, designation, country, website categories -> "Connecting you to the game..."
  brand: BrandSection,                 // TCS Research intro video (public/brand/tcs-research.mp4)
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

// THE GAME'S CONFIGURATION: which sections run, and in what order.
//
// The game is played in PARTS, unlocked one after another like stages. Each part is a
// list of sections; when a part ends, the stage screen shows what's unlocked next.
// The Training trays and the Final trays of each part are its pre-test and post-test
// (disguised as practice and a last round): what fortunes they deal - and the level in
// between - is set per part in src/config/fortuneBlueprint.js.
export const GAME_PARTS = {
  part1: {
    title: 'Part 1',
    sections: ['playerDetails', 'brand', 'opening', 'appointment', 'training', 'level2', 'finalTrays'],
  },
  part2: {
    title: 'Part 2',
    sections: ['brand', 'appointment', 'training', 'level3', 'supervisor', 'finalTrays'],
    // Unlocked by finishing Part 1 with at least this share of its final trays (the
    // post-test) answered correctly
    unlock: { after: 'part1', minPosttestAccuracy: 0.7 },
  },
};
export const PART_ORDER = ['part1', 'part2'];

// FOR TESTING: true opens every part straight away, whatever the score - the stage
// screen then comes up first, so any part can be picked. Set to false for real players.
export const UNLOCK_ALL_PARTS = false;

// Older single-run versions of the game, kept for reference. To play one instead of
// the parts above, set ACTIVE_FLOW to its key. (Level 1 isn't in any part any more,
// but stays available here.)
export const GAME_FLOWS = {
  // The full story: the job application and offer narrative, then training.
  standard: [
    'job',
    'training',
    'level1',
    'finalTrays'
  ],
};

// 'parts' plays GAME_PARTS (the game); a key of GAME_FLOWS plays that flow instead
export const ACTIVE_FLOW = 'parts';
