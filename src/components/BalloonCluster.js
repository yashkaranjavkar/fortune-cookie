import React from 'react';
import './BalloonCluster.css';
import balloons3Left from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-3-left.svg';
import balloonsDocked from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-docked.svg';
import balloonsNoneLeft from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-none-left.svg';

// Three chances to replay the sorting rules, shown as the wisecrack kit's balloon
// cluster: all three intact, the docked pair once one's been used, or the dashed
// "none left" outlines once they're gone. Which exact balloon (orange/pink/green)
// is "popped" only ever mattered for counting how many are left, never which
// specific one - so a single click pops the next available one.
export default function BalloonCluster({ popped, onPop, usesLeft }) {
  const art = usesLeft === 3 ? balloons3Left : usesLeft === 0 ? balloonsNoneLeft : balloonsDocked;
  const nextKey = Object.keys(popped).find(key => !popped[key]);

  return (
    <div className="l1-balloons-wrap">
      {usesLeft > 0 ? (
        <button
          type="button"
          className="l1-balloons-btn"
          onClick={() => onPop(nextKey)}
          aria-label="Pop a balloon to review the sorting rules"
          data-sound="none"
        >
          <img src={art} alt="" className="l1-balloons-img" />
        </button>
      ) : (
        <img src={art} alt="No replays left" className="l1-balloons-img" />
      )}
      {usesLeft > 0 && <div className="l1-balloons-count">{usesLeft} left</div>}
    </div>
  );
}
