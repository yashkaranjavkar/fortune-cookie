import React, { useState } from 'react';
import { StoryScreen, SEAL_ICONS } from './FactoryFront';
import { playSound } from '../sounds';
import balloons3Left from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-3-left.svg';
import balloonsPopped from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-popped.svg';

// Shared pieces of every level's rules flow (Level 1-3 instruction screens).

// The seal icon for a rules screen, from its title
export function ruleIcon(title = '') {
  if (/event/i.test(title)) return SEAL_ICONS.party;
  if (/payment/i.test(title)) return SEAL_ICONS.coin;
  return SEAL_ICONS.link; // the URL rules
}

// A rules screen for level `level`: storefront + ledger card, step dots, Back / Next
export function RulesLayout({ level, title, step, steps, onBack, onNext, children }) {
  return (
    <StoryScreen
      kicker={`Level ${level} · Rules`}
      title={title}
      icon={ruleIcon(title)}
      centered
      step={step}
      steps={steps}
      onBack={onBack}
      onNext={onNext}
    >
      <div className="story-content">{children}</div>
    </StoryScreen>
  );
}

// "Need a refresher?" - the three balloons that let the player replay the rules later.
// Popping them here replays the rules straight away.
export function BalloonRefresherScreen({ level, onReplay, onNext }) {
  const [popped, setPopped] = useState(false);
  const handlePop = () => {
    setPopped(true);
    playSound('balloon-pop');
    setTimeout(() => onReplay(), 500);
  };
  return (
    <StoryScreen
      kicker={`Level ${level} · Rules`}
      title="Three chances to look again"
      icon={SEAL_ICONS.balloon}
      centered
      onNext={onNext}
    >
      <button
        type="button"
        className="balloon-container"
        onClick={handlePop}
        aria-label="Pop a balloon to go through the rules again"
        data-sound="none"
      >
        <img src={popped ? balloonsPopped : balloons3Left} alt="" className="balloon-cluster-img" />
      </button>
      <p className="ff-text">
        You get <strong>three chances</strong> to go through these rules again whenever you need
        them, by popping one of these balloons. Pop one now to see them again.
      </p>
    </StoryScreen>
  );
}
