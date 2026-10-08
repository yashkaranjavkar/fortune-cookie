import React, { useEffect } from 'react';
import { useCurrency } from '../utils/currency';
import { playSound } from '../sounds';
import { track } from '../analytics';
import { useMascotTrigger } from '../config/mascotTriggers';
import { StoryScreen, SEAL_ICONS } from './FactoryFront';
import './LevelDoneScreen.css';

const StarIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--star-gold, #F7C948)" stroke="var(--biscuit-rim, #7A3E12)" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" />
  </svg>
);

// The wisecrack kit's "Level done" panel (preview/Panels.html): a plum name plaque on a
// golden biscuit frame, a star row, the batch just finished, and how it went - shown
// once per level instead of the old generic medal screen.
export default function LevelDoneScreen({ batchName, sorted, total, incentive, onReplay, onNext }) {
  const currency = useCurrency();
  const fireMascot = useMascotTrigger();

  useEffect(() => {
    playSound('star-earn');
    playSound('level-done');
    fireMascot('levelComplete');
    track('level_complete', { batch: batchName, sorted, total, incentive });
  }, []);

  return (
    <StoryScreen
      kicker="Level done"
      title={batchName}
      subtitle="Great job, Inspector!"
      icon={SEAL_ICONS.star}
      centered
      onReplay={() => { track('level_replay', { batch: batchName }); onReplay(); }}
      onNext={onNext}
      nextLabel="Next level"
    >
      <div className="ld-stars">
        <StarIcon size={44} />
        <StarIcon size={58} />
        <StarIcon size={44} />
      </div>

      <div className="ld-stats">
        <div className="ld-stat">
          <span className="ld-stat-label">Samples sorted</span>
          <span className="ld-stat-value">{sorted} / {total}</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-label">Incentive earned</span>
          <span className={`ld-stat-value ${incentive < 0 ? 'lost' : 'earned'}`}>
            {incentive < 0 ? '−' : '+'} {currency}{Math.abs(incentive)}
          </span>
        </div>
      </div>
    </StoryScreen>
  );
}
