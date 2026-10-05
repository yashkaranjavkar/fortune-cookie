import { useState } from 'react';
import { useScreen, track } from '../analytics';

// Generic runner for a section's ordered step list (see src/config/steps/*.js for the
// actual configs). Each step is:
//   { key, skip?: (ctx) => bool, render: (ctx, nav) => JSX }
// `ctx` is whatever the section passes in as `context` - its own local state/setters
// plus anything from its own props (onComplete, tutorialShown, ...). `nav` exposes
// next/back/goto so a step's render function moves through the list by name instead
// of a hardcoded index - reordering, inserting, or deleting entries in the steps
// array never requires touching any other step's render function.
//
// Analytics: each step is its own screen (time on it is measured automatically), and
// Back / jumps are recorded.
export default function SectionRunner({ steps, context }) {
  const isSkipped = (i) => !!(steps[i].skip && steps[i].skip(context));

  const [index, setIndex] = useState(() => {
    let i = 0;
    while (i < steps.length && isSkipped(i)) i++;
    return i;
  });

  const current = steps[index];
  useScreen(current ? current.key : null);

  const nav = {
    next: () => {
      setIndex(i => {
        let n = i + 1;
        while (n < steps.length && isSkipped(n)) n++;
        return n < steps.length ? n : i;
      });
    },
    // Back also passes over `passThrough` steps (the factory-walk transitions) -
    // stepping back onto one would just replay the walk and bounce forward again.
    back: () => {
      let n = index - 1;
      while (n >= 0 && (isSkipped(n) || steps[n].passThrough)) n--;
      if (n < 0) return;
      track('nav_back', { from: steps[index].key, to: steps[n].key });
      setIndex(n);
    },
    // Jumps straight to a step by key, e.g. for a "skip ahead" shortcut or an
    // onReplay that restarts the section from its first screen. The target step
    // itself is rendered as-is (its own skip, if any, is never expected to be true
    // for a step something explicitly jumps to by name).
    goto: (key, reason) => {
      const target = steps.findIndex(s => s.key === key);
      if (target === -1) return;
      track('nav_jump', {
        from: current ? current.key : null,
        to: key,
        reason: reason || (target < index ? 'replay' : 'skip_ahead'),
      });
      setIndex(target);
    },
  };

  if (!current) return null;
  return current.render(context, nav);
}
