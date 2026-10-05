import { useRef } from 'react';
import { track } from './index';

// Analytics for the dome-sorting minigame shared by Level 1/2/3. Remembers when each
// dome was revealed so every sort comes with how long the player took to decide, and
// tallies the round for a single summary event at the end.
//   fortune: the dome's fortune - { text, isPhishy } (isPhishy is undefined in levels
//            without ground truth, so "correct" is then unknown/null)
export default function useSortingTracker(level) {
  const revealedAt = useRef({});
  const tally = useRef({ correct: 0, wrong: 0, timed_out: 0, help_used: 0 });

  const base = (dome, fortune) => ({
    level,
    dome,
    fortune: fortune ? fortune.text : null,
    is_phishy: fortune && typeof fortune.isPhishy === 'boolean' ? fortune.isPhishy : null,
  });

  return {
    revealed(dome, fortune) {
      revealedAt.current[dome] = performance.now();
      track('fortune_revealed', base(dome, fortune));
    },
    sorted(dome, fortune, tray, timeLeft) {
      const info = base(dome, fortune);
      const correct = info.is_phishy === null ? null : (tray === 'faulty') === info.is_phishy;
      if (correct === true) tally.current.correct += 1;
      if (correct === false) tally.current.wrong += 1;
      const t0 = revealedAt.current[dome];
      track('fortune_sorted', {
        ...info,
        tray,
        correct,
        decision_ms: t0 ? Math.round(performance.now() - t0) : null,
        time_left_s: timeLeft,
      });
    },
    timedOut(dome, fortune, reason) {
      tally.current.timed_out += 1;
      track('fortune_timed_out', { ...base(dome, fortune), reason });
    },
    help(balloon, usesLeft) {
      tally.current.help_used += 1;
      track('rules_help_opened', { level, balloon, uses_left: usesLeft });
    },
    roundComplete(faulty, approved) {
      track('sorting_round_complete', { level, faulty: faulty.length, approved: approved.length, ...tally.current });
    },
    skippedMarkingIntro() {
      track('marking_intro_skipped', { level });
    },
  };
}
