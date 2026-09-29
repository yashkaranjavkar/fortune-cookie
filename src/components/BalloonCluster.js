import React from 'react';
import './BalloonCluster.css';
import balloons3Left from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-3-left.svg';
import balloonsDocked from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-docked.svg';
import balloonsNoneLeft from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/balloons-none-left.svg';

// The kit only ships 3-left/docked(2)/none-left art, with no "1 left" asset - so this
// draws the last balloon itself, reusing the exact balloon body/knot shape and string
// styling from balloons-docked.svg, just with one balloon instead of two.
const SingleBalloon = () => (
  <svg className="l1-balloons-img" viewBox="0 0 160 170" role="img" aria-hidden="true">
    <path d="M80 73 C76 100 84 130 80 160" fill="none" stroke="#C9B28E" strokeWidth="3" strokeLinecap="round" />
    <g transform="translate(50 4)">
      <path d="M30 2 C47 2 58 16 58 32 C58 49 44 61 30 63 C16 61 2 49 2 32 C2 16 13 2 30 2 Z" fill="#E7A63F" stroke="#A8671A" strokeWidth="4" />
      <path d="M25 63 L35 63 L30 69 Z" fill="#E7A63F" />
    </g>
  </svg>
);

// Three chances to replay the sorting rules, shown as the wisecrack kit's balloon
// cluster: all three intact, the docked pair once one's been used, one left, or the
// dashed "none left" outlines once they're gone. Which exact balloon (orange/pink/green)
// is "popped" only ever mattered for counting how many are left, never which
// specific one - so a single click pops the next available one.
export default function BalloonCluster({ popped, onPop, usesLeft }) {
  const nextKey = Object.keys(popped).find(key => !popped[key]);

  const art = usesLeft === 3
    ? <img src={balloons3Left} alt="" className="l1-balloons-img" />
    : usesLeft === 2
      ? <img src={balloonsDocked} alt="" className="l1-balloons-img" />
      : usesLeft === 1
        ? <SingleBalloon />
        : <img src={balloonsNoneLeft} alt={usesLeft === 0 ? 'No replays left' : ''} className="l1-balloons-img" />;

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
          {art}
        </button>
      ) : (
        art
      )}
      {usesLeft > 0 && <div className="l1-balloons-count">{usesLeft} left</div>}
    </div>
  );
}
