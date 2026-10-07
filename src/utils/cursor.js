import { useEffect } from 'react';

// Stage cursors (styles in src/cursors.css). Screens without one show the default
// hand; hands-on stages switch to a cursor that fits the job:
//   'glove'       gloved pointing hand - sorting, tray picking, the demo, inspection
//   'highlighter' marker - marking the faulty part of each fortune
//   'pen'         pen - the supervisor's checklist
//   'hidden'      no cursor at all - the factory-map walks between rooms
// Which step uses which is set by `cursor` on the steps in src/config/steps/*.js.
// Anything draggable (see usePointerDrag) shows an open glove, and anything being
// carried or slid (body.is-grabbing) a closed fist.
export const STAGE_CURSORS = ['glove', 'highlighter', 'pen', 'hidden'];

// Click feedback: while the mouse button is down, every clicking cursor swaps to a
// slightly tilted copy of itself (the "-press" images, styled by body.is-pressing in
// src/cursors.css), so a click feels like the hand actually pressed something. The
// highlighter doesn't tilt - it marks text rather than clicking. The tilt is held
// for at least PRESS_MIN_MS so even a very quick click shows it.
const PRESS_MIN_MS = 160;

export function installPressTilt() {
  const body = document.body;
  let pressedAt = 0;
  let timer = null;
  const press = (e) => {
    if (e.pointerType === 'touch') return; // no cursor on touch screens
    clearTimeout(timer);
    pressedAt = performance.now();
    body.classList.add('is-pressing');
  };
  const release = () => {
    clearTimeout(timer);
    const wait = Math.max(0, PRESS_MIN_MS - (performance.now() - pressedAt));
    timer = setTimeout(() => body.classList.remove('is-pressing'), wait);
  };
  window.addEventListener('pointerdown', press, true);
  window.addEventListener('pointerup', release, true);
  window.addEventListener('pointercancel', release, true);
  window.addEventListener('blur', release);
}

export function useStageCursor(mode) {
  useEffect(() => {
    const body = document.body;
    // No mode: leave it - whoever set the previous one removes it in their cleanup
    if (!STAGE_CURSORS.includes(mode)) return undefined;
    body.dataset.cursor = mode;
    return () => {
      if (body.dataset.cursor === mode) delete body.dataset.cursor;
    };
  }, [mode]);
}
