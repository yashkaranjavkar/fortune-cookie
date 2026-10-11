import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Drag-and-drop for fortune strips, built on pointer events instead of the browser's
// native drag-and-drop - native dragging hides the page's cursor (so no closed-fist
// "holding it" cursor) and doesn't work on touch screens at all.
//
//   const drag = usePointerDrag({ onStart, onDrop: (targetId) => ..., onMiss });
//   <div {...drag.handleProps}>fortune</div>     the thing you pick up
//   <div data-drop="faulty">...</div>             somewhere it can be dropped
//   {drag.ghost(<div className="...">fortune</div>)}   the copy that follows the pointer
//
// drag.dragging - something is being carried; drag.over - id of the drop target under
// the pointer; drag.cancel() - drop it without a target (e.g. when the timer runs out).
// A press only becomes a drag once the pointer moves a few pixels, so a plain click
// never counts as dropping the strip somewhere.
//
// Side drops: if the screen marks its middle area with data-drop-center, letting go
// anywhere to the left or right of it counts as dropping into the tray on that side -
// over the tray or not - and letting go over the middle itself does nothing at all
// (no onDrop, no onMiss: the strip just goes back). data-drop-center="box" means only
// the element's own box is "the middle"; otherwise its whole column is (any height).
//
// drag.proxyProps('.selector') - handle props for something else that picks up the
// same thing (e.g. the lifted dome picks up its fortune); the ghost takes the size of
// the element the selector finds, centred under the pointer.
const START_DISTANCE = 5;
const CENTER = '__center__'; // dropTargetAt: let go over the middle area

function dropTargetAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const zone = el && el.closest('[data-drop]');
  if (zone) return zone.getAttribute('data-drop');

  const center = document.querySelector('[data-drop-center]');
  if (!center) return null;
  const c = center.getBoundingClientRect();
  const boxOnly = center.getAttribute('data-drop-center') === 'box';
  const inMiddle = x >= c.left && x <= c.right && (!boxOnly || (y >= c.top && y <= c.bottom));
  if (inMiddle) return CENTER;
  const trays = Array.from(document.querySelectorAll('[data-drop]'))
    .map(t => ({ id: t.getAttribute('data-drop'), x: t.getBoundingClientRect().left + t.getBoundingClientRect().width / 2 }));
  if (!trays.length) return null;
  trays.sort((a, b) => a.x - b.x);
  const midX = c.left + c.width / 2;
  return (x < midX ? trays[0] : trays[trays.length - 1]).id;
}

export default function usePointerDrag({ onStart, onDrop, onMiss } = {}) {
  const [drag, setDrag] = useState(null); // { left, top, width, over }
  const session = useRef(null);
  const callbacks = useRef({});
  callbacks.current = { onStart, onDrop, onMiss };

  const cancel = useCallback(() => {
    const s = session.current;
    if (!s) return;
    window.removeEventListener('pointermove', s.move);
    window.removeEventListener('pointerup', s.up);
    window.removeEventListener('pointercancel', s.abort);
    session.current = null;
    document.body.classList.remove('is-grabbing');
    setDrag(null);
  }, []);

  useEffect(() => cancel, [cancel]);

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); // no text selection while dragging
    cancel();

    const proxy = e.currentTarget.getAttribute('data-grab-proxy');
    const proxyEl = proxy && document.querySelector(proxy);
    const rect = (proxyEl || e.currentTarget).getBoundingClientRect();
    const grab = proxyEl
      ? { x: rect.width / 2, y: rect.height / 2 }
      : { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const startX = e.clientX;
    const startY = e.clientY;
    const s = { started: false };

    s.move = (ev) => {
      if (!s.started) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < START_DISTANCE) return;
        s.started = true;
        document.body.classList.add('is-grabbing');
        if (callbacks.current.onStart) callbacks.current.onStart();
      }
      setDrag({
        left: ev.clientX - grab.x,
        top: ev.clientY - grab.y,
        width: rect.width,
        grabX: grab.x,
        grabY: grab.y,
        over: (t => (t === CENTER ? null : t))(dropTargetAt(ev.clientX, ev.clientY)),
      });
    };
    s.up = (ev) => {
      const started = s.started;
      const target = started ? dropTargetAt(ev.clientX, ev.clientY) : null;
      cancel();
      if (!started || target === CENTER) return;
      if (target) callbacks.current.onDrop && callbacks.current.onDrop(target);
      else callbacks.current.onMiss && callbacks.current.onMiss();
    };
    // The browser took the pointer away (e.g. a system gesture) - put it back, no penalty
    s.abort = () => cancel();

    session.current = s;
    window.addEventListener('pointermove', s.move);
    window.addEventListener('pointerup', s.up);
    window.addEventListener('pointercancel', s.abort);
  }, [cancel]);

  // The floating copy, rendered into the game's root so it keeps the game's fonts.
  // className: an extra class for it, e.g. 'compact' to shrink a big card while it's
  // carried - scaled around the point that was grabbed, so it stays under the fist.
  const ghost = (element, className = '') => {
    if (!drag) return null;
    const host = document.querySelector('.app') || document.body;
    return createPortal(
      <div
        className={`drag-ghost ${className}`}
        style={{ left: drag.left, top: drag.top, width: drag.width, transformOrigin: `${drag.grabX}px ${drag.grabY}px` }}
        aria-hidden="true"
      >
        {element}
      </div>,
      host
    );
  };

  const handleProps = { onPointerDown, 'data-grab': '', style: { touchAction: 'none' } };
  return {
    dragging: Boolean(drag),
    over: drag ? drag.over : null,
    cancel,
    ghost,
    handleProps,
    proxyProps: (selector) => ({ ...handleProps, 'data-grab-proxy': selector }),
  };
}
