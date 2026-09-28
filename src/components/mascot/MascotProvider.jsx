import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
function MascotToast({ toast, position, size, onClose }) {
  const mascot = useRef(null);
  const [shown, setShown] = useState(false);

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

  const top = position === 'top';
  const hiddenY = top ? '-140%' : '140%';

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        [top ? 'top' : 'bottom']: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px 12px 12px',
        borderRadius: 24,
        background: '#FFF6E6',
        color: '#3A1F10',
        boxShadow: '0 12px 32px rgba(58,31,16,.25)',
        font: "700 18px/1.3 'Nunito', system-ui, sans-serif",
        transform: `translate(-50%, ${shown ? '0' : hiddenY})`,
        transition: 'transform .35s cubic-bezier(.2,1.4,.4,1)',
        pointerEvents: 'none',
      }}
    >
      <Mascot ref={mascot} emotion={toast.emotion} size={size} />
      {toast.message && <span>{toast.message}</span>}
    </div>
  );
}
