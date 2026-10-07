import { createPortal } from 'react-dom';

// The open fortune in the Level 1-3 sorting games, shown big in the middle of the
// screen (over the dimmed backdrop, between the two trays) so it's easy to read, with
// its countdown just above it. It's the thing you drag into a tray: pass the
// usePointerDrag handleProps in. Styles: DomeFocus.css.
export default function FortuneFocus({ text, timer, dragging, handleProps }) {
  // Rendered into the level screen itself: it's a layer of its own (z-index 100), so
  // the card has to be inside it to sit above the backdrop and the trays
  const host = document.querySelector('.level1-game-screen') || document.querySelector('.app') || document.body;
  return createPortal(
    <div className="fortune-focus">
      <div className={`fortune-focus-timer${timer <= 3 ? ' urgent' : ''}`}>{timer < 10 ? `0${timer}` : timer}</div>
      <div className={`fortune-drag fortune-slip fortune-focus-slip${dragging ? ' dragging' : ''}`} {...handleProps}>
        {text}
      </div>
      <div className="fortune-focus-hint" aria-hidden="true">Drag it into the right tray</div>
    </div>,
    host
  );
}
