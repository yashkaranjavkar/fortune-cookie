import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './mascot.js'; // registers <fortune-mascot>

/**
 * <Mascot emotion="cozy" size="160px" />
 *
 * Props
 *  - emotion   resting emotion (default 'cozy'); changing it re-plays that loop
 *  - size      CSS size, e.g. '160px' or '10rem'
 *  - duration  one cycle, e.g. '2.4s' (keep 2–3s)
 *  - label     accessible description (optional)
 *  - onDone    (emotion) => void, fires when a one-shot play() finishes
 *
 * Ref methods
 *  - ref.current.play('happy')                   play once, then back to `emotion`
 *  - ref.current.play('overjoyed', { loop: true }) keep looping
 *  - ref.current.play('happy', { then: null })     stay on the last frame
 */
const Mascot = forwardRef(function Mascot(
  { emotion = 'cozy', size = '160px', duration = '2.4s', label, onDone, className, style },
  ref
) {
  const el = useRef(null);
  const resting = useRef(emotion);
  resting.current = emotion;

  useImperativeHandle(ref, () => ({
    play: (name, opts = {}) =>
      el.current?.play(name, { then: resting.current, ...opts }) ?? Promise.resolve(),
    get element() {
      return el.current;
    },
  }), []);

  useEffect(() => {
    const node = el.current;
    if (!node || !onDone) return undefined;
    const handler = (e) => onDone(e.detail.emotion);
    node.addEventListener('mascot-done', handler);
    return () => node.removeEventListener('mascot-done', handler);
  }, [onDone]);

  return (
    <fortune-mascot
      ref={el}
      emotion={emotion}
      size={size}
      duration={duration}
      label={label}
      className={className}
      style={style}
    />
  );
});

export default Mascot;
