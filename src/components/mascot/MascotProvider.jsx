import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Mascot from './Mascot.jsx';

/** Game event -> emotion. Change these to fit your game. */
export const MASCOT_REACTIONS = {
  idle: 'cozy',
  correct: 'happy',
  fastCorrect: 'wink',
  combo: 'giggle',
  wrong: 'teary',
  streakLost: 'grumpy',
  unlock: 'surprised',
  sessionComplete: 'overjoyed',
  perfectSession: 'smitten',
};

const MascotContext = createContext(null);

/**
 * Wrap your app once:
 *   <MascotProvider position="bottom"><App /></MascotProvider>
 *
 * Then anywhere:
 *   const { show, trigger } = useMascot();
 *   show('happy', { message: 'Correct! +10' });
 *   trigger('sessionComplete', { message: 'Lesson complete!' });
 */
export function MascotProvider({ children, position = 'bottom', size = '120px', reactions = MASCOT_REACTIONS }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((emotion, { message = '', hold = 300 } = {}) => {
    setToast({ id: Date.now() + Math.random(), emotion, message, hold });
  }, []);

  const trigger = useCallback(
    (event, opts) => show(reactions[event] ?? event, opts),
    [show, reactions]
  );

  const hide = useCallback(() => setToast(null), []);
  const value = useMemo(() => ({ show, trigger, hide }), [show, trigger, hide]);

  return (
    <MascotContext.Provider value={value}>
      {children}
      {toast && (
        <MascotToast key={toast.id} toast={toast} position={position} size={size} onClose={hide} />
      )}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error('useMascot() must be used inside <MascotProvider>');
  return ctx;
}

/* ---------- the Duolingo-style pop-up ---------- */

// position="corner": the pop-up goes in the first screen corner (in this order) where it
// wouldn't cover anything the player uses - buttons, links, fields, drop targets, or
// anything marked data-mascot-avoid. Screens put things like Replay / Skip in corners,
// so the free corner is worked out each time it appears.
const CORNERS = ['bottom-left', 'bottom-right', 'top-right', 'top-left'];
const AVOID = 'button, a[href], input, select, textarea, [role="button"], [data-drop], [data-mascot-avoid]';
const EDGE = 24;
const CLEARANCE = 8;

function pickCorner(el) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const targets = Array.from(document.querySelectorAll(AVOID))
    .filter(t => !el.contains(t))
    .map(t => t.getBoundingClientRect())
    .filter(r => r.width > 0 && r.height > 0);
  let best = CORNERS[0];
  let bestOverlap = Infinity;
  for (const corner of CORNERS) {
    const left = corner.endsWith('left') ? EDGE : vw - EDGE - w;
    const top = corner.startsWith('top') ? EDGE : vh - EDGE - h;
    const overlap = targets.reduce((sum, r) => {
      const ox = Math.min(left + w, r.right + CLEARANCE) - Math.max(left, r.left - CLEARANCE);
      const oy = Math.min(top + h, r.bottom + CLEARANCE) - Math.max(top, r.top - CLEARANCE);
      return sum + (ox > 0 && oy > 0 ? ox * oy : 0);
    }, 0);
    if (overlap === 0) return corner;
    if (overlap < bestOverlap) { best = corner; bestOverlap = overlap; }
  }
  return best;
}

function MascotToast({ toast, position, size, onClose }) {
  const mascot = useRef(null);
  const box = useRef(null);
  const [shown, setShown] = useState(false);
  const isCorner = position === 'corner';
  const [corner, setCorner] = useState(CORNERS[0]);

  // choose the corner before the first paint, so it slides in from the right side
  useLayoutEffect(() => {
    if (isCorner && box.current) setCorner(pickCorner(box.current));
  }, [isCorner]);

  useEffect(() => {
    let alive = true;
    const raf = requestAnimationFrame(() => setShown(true));
    mascot.current?.play(toast.emotion, { then: null }).then(() => {
      if (!alive) return;
      setTimeout(() => {
        if (!alive) return;
        setShown(false);
        setTimeout(() => alive && onClose(), 400);
      }, toast.hold);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [toast, onClose]);

  // 'top' / 'bottom' sit centred and slide vertically; a corner slides in from its side
  let place;
  let hidden;
  let visible;
  if (isCorner) {
    const left = corner.endsWith('left');
    place = { [left ? 'left' : 'right']: EDGE, [corner.startsWith('top') ? 'top' : 'bottom']: EDGE };
    hidden = `translate(${left ? '-140%' : '140%'}, 0)`;
    visible = 'translate(0, 0)';
  } else {
    const top = position === 'top';
    place = { left: '50%', [top ? 'top' : 'bottom']: EDGE };
    hidden = `translate(-50%, ${top ? '-140%' : '140%'})`;
    visible = 'translate(-50%, 0)';
  }

  return (
    <div
      ref={box}
      role="status"
      style={{
        position: 'fixed',
        ...place,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: isCorner ? '8px 16px 8px 8px' : '12px 20px 12px 12px',
        borderRadius: isCorner ? 20 : 24,
        background: '#FFF6E6',
        color: '#3A1F10',
        boxShadow: '0 12px 32px rgba(58,31,16,.25)',
        font: `700 ${isCorner ? 16 : 18}px/1.3 'Nunito', system-ui, sans-serif`,
        transform: shown ? visible : hidden,
        transition: 'transform .35s cubic-bezier(.2,1.4,.4,1)',
        pointerEvents: 'none',
      }}
    >
      <Mascot ref={mascot} emotion={toast.emotion} size={size} />
      {toast.message && <span>{toast.message}</span>}
    </div>
  );
}
