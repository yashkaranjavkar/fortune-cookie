import { useMascot } from '../components/mascot';

// THIS is the mascot's configuration: which reaction plays at which game moment, and
// what it says. Edit this map to change or move things - the moment keys themselves
// (the left-hand side) are wired into the game code and shouldn't be renamed without
// also updating the fire('...') call at that spot.
//
// Set a moment's value to null to silence it (no mascot reaction there).
//
// Available mascot events (see src/components/mascot/MascotProvider.jsx's
// MASCOT_REACTIONS for the emotion each one plays):
//   idle, correct, fastCorrect, combo, wrong, streakLost, unlock, sessionComplete, perfectSession
export const MASCOT_MOMENTS = {
  // A dome lifts, revealing the fortune inside (Demo/Level1/2/3 games)
  domeRevealed: { event: 'unlock', message: 'New fortune!' },

  // A fortune is dragged into a tray before its timer runs out - purely an
  // acknowledgement that it was sorted, NOT a verdict. Whether that tray choice was
  // actually right isn't revealed until the torch-inspection step, so this must stay
  // a neutral reaction (not 'correct'/'wrong').
  fortuneSorted: { event: 'idle', message: 'Sorted!' },

  // The timer runs out before the fortune is sorted
  fortuneWasted: { event: 'wrong', message: 'Not quite!' },

  // The 30-second marking timer runs out - whatever's marked (or not) gets sent for
  // inspection as-is, right away, instead of waiting on the player.
  markingTimeUp: { event: 'streakLost', message: "Time's up! Sending for inspection..." },

  // A level (or the practice demo round) is finished
  levelComplete: { event: 'sessionComplete', message: 'Session complete!' },
};

// Call fire('momentKey') from inside any component under <MascotProvider> - it looks
// up MASCOT_MOMENTS and plays the configured reaction, or does nothing if that moment
// is set to null or isn't listed.
export function useMascotTrigger() {
  const { trigger } = useMascot();

  return function fire(moment) {
    const config = MASCOT_MOMENTS[moment];
    if (!config) return;
    trigger(config.event, { message: config.message });
  };
}
