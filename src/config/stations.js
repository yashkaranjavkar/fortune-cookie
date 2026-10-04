// Configuration for the "walking through the factory" transition screens
// (src/components/StationTransitionScreen.js). The factory is one fixed floor plan
// (drawn in src/components/FactoryFloorPlan.js) so the player gets to know the place;
// every transition is just a walk from one named stop on that map to another.

// Every spot on the map the player can walk to. icon/label are what the screen shows
// while heading there; blurb is the one-liner on the "Now entering" room card that
// fades in after the walk (illustrations live in src/components/RoomVignettes.js).
// Rename, re-icon or reword freely - map positions live in FactoryFloorPlan.js.
export const STOPS = {
  reception: { icon: '💼', label: 'Reception', blurb: 'Where every new inspector checks in.' },
  trainingFloor: { icon: '🧺', label: 'Training Floor', blurb: 'Practice trays - get a feel for the fortunes before the real batches.' },
  demo: { icon: '🎮', label: 'Demo Table', blurb: 'Try the sorting controls once before you go live.' },
  briefing: { icon: '📋', label: 'Briefing Room', blurb: 'Learn the rules for this batch before you touch a single cookie.' },
  line1: { icon: '🍪', label: 'Production Line 1', blurb: 'Four domes. Sort each fortune before its timer runs out.' },
  line2: { icon: '🍪', label: 'Production Line 2', blurb: 'Five domes, and now the context matters too.' },
  line3: { icon: '🍪', label: 'Production Line 3', blurb: 'Six domes - the trickiest fortunes in the factory.' },
  marking: { icon: '🖊️', label: 'Marking Bench', blurb: 'Highlight exactly what makes each faulty fortune faulty.' },
  inspection: { icon: '🔦', label: 'Inspection Room', blurb: 'The torch reveals how well you marked.' },
  results: { icon: '📦', label: 'Dispatch Desk', blurb: 'Check the delivered samples and see what you earned.' },
  supervisor: { icon: '🗂️', label: "Supervisor's Office", blurb: "Review the team's calls before anything ships." },
  loadingBay: { icon: '🚚', label: 'Loading Bay', blurb: 'The last trays to sort before the trucks roll out.' },
};

// Where each top-level section (the keys of GAME_FLOW in gameFlow.js) starts and ends
// on the map, and which transition screens play when the game ARRIVES at it from the
// previous section (App.js runs these):
//   walkIn      - map walk from where the previous section ended to `start`
//   roomIntroIn - "Now entering" card for the `start` room
// Comment either line out (or set it to false) to skip that screen for that section.
// The first section in GAME_FLOW never plays them - there's nothing to arrive from.
// A section with no entry here (like 'opening', the title screen) isn't on the map, so
// a walk leaving it starts from the middle of the corridor - i.e. walking in.
// (Transitions INSIDE a section are steps in src/config/steps/*.js instead.)
export const SECTION_STOPS = {
  job: {
    start: 'reception', end: 'reception', title: 'Job Application',
    walkIn: true,
    roomIntroIn: true,
  },
  training: {
    start: 'trainingFloor', end: 'demo', title: 'Training',
    walkIn: true,
    roomIntroIn: true,
  },
  level1: {
    start: 'briefing', end: 'results', title: 'Level 1',
    walkIn: true,
    roomIntroIn: true,
  },
  level2: {
    start: 'briefing', end: 'results', title: 'Level 2',
    walkIn: true,
    roomIntroIn: true,
  },
  level3: {
    start: 'briefing', end: 'results', title: 'Level 3',
    walkIn: true,
    roomIntroIn: true,
  },
  supervisor: {
    start: 'supervisor', end: 'supervisor', title: 'Supervisor',
    walkIn: true,
    roomIntroIn: true,
  },
  finalTrays: {
    start: 'loadingBay', end: 'loadingBay', title: 'Final Trays',
    walkIn: true,
    roomIntroIn: true,
  },
};
