import React from 'react';
import { GAME_PARTS, PART_ORDER } from '../config/gameFlow';
import { isPartUnlocked } from '../utils/progress';
import { useStageCursor } from '../utils/cursor';
import './StagesScreen.css';

// The stage screen: just the parts of the game, each with Play (or Locked until its
// unlock rule is met - see src/utils/progress.js). Plain, like the player details
// form - no game branding. It's the first thing a player sees, on every visit.
export default function StagesScreen({ progress, onPlay }) {
  useStageCursor('plain');
  return (
    <div className="stages-screen">
      <div className="stages-card">
        {PART_ORDER.map((key) => {
          const open = isPartUnlocked(key, progress);
          return (
            <div key={key} className="stages-row">
              <span className="stages-name">{GAME_PARTS[key].title}</span>
              <button type="button" className="stages-btn" disabled={!open} onClick={() => onPlay(key)} data-sound="none">
                {open ? 'Play' : 'Locked'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Shown when a part ends, in place of the stage screen: the part is done, and whether
// the next part has opened. "Back to the start" goes to the stage screen.
export function PartCompleteScreen({ partKey, progress, onDone }) {
  useStageCursor('plain');
  const part = GAME_PARTS[partKey] || { title: 'This part' };
  const next = PART_ORDER[PART_ORDER.indexOf(partKey) + 1];
  const nextOpen = next && isPartUnlocked(next, progress);
  return (
    <div className="stages-screen">
      <div className="stages-card stages-done">
        <h1 className="stages-done-title">{part.title} complete</h1>
        <p className="stages-done-text">
          {!next && 'You have finished the game. Thank you for playing!'}
          {next && nextOpen && `${GAME_PARTS[next].title} is now open - play it any time from the start.`}
          {next && !nextOpen && `${GAME_PARTS[next].title} is still locked - replay ${part.title} to open it.`}
        </p>
        <button type="button" className="stages-btn" onClick={onDone} data-sound="none">Back to the start</button>
      </div>
    </div>
  );
}
