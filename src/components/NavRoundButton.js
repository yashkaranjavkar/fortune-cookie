import React from 'react';

// Round Back/Forward icon button (wisecrack kit's Navigation pair, preview/Buttons.html) -
// shared by every instruction flow that flanks its card with these arrows.
export default function NavRoundButton({ direction, onClick, label, dataSound }) {
  return (
    <button className="nav-round-btn" onClick={onClick} aria-label={label} data-sound={dataSound}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === 'back'
          ? <path d="M14.5 5.5L8 12l6.5 6.5" />
          : <path d="M9.5 5.5L16 12l-6.5 6.5" />}
      </svg>
    </button>
  );
}
