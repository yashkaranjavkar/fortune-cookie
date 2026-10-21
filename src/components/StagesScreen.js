import React from 'react';
import { GAME_PARTS, PART_ORDER } from '../config/gameFlow';
import { isPartUnlocked } from '../utils/progress';
import { useStageCursor } from '../utils/cursor';
import './StagesScreen.css';

// The stage screen: just the parts of the game, each with Play (or Locked until its
// unlock rule is met - see src/utils/progress.js). Plain, like the player details
// form - no game branding. Shown when a part ends, and first on a visit when there's
// more than one part open.
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
