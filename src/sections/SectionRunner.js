import React, { useState } from 'react';

// Generic runner for a section's ordered step list (see src/config/steps/*.js for the
// actual configs). Each step is:
//   { key, skip?: (ctx) => bool, render: (ctx, nav) => JSX }
// `ctx` is whatever the section passes in as `context` - its own local state/setters
// plus anything from its own props (onComplete, tutorialShown, ...). `nav` exposes
// next/back/goto so a step's render function moves through the list by name instead
// of a hardcoded index - reordering, inserting, or deleting entries in the steps
// array never requires touching any other step's render function.
export default function SectionRunner({ steps, context }) {
  const isSkipped = (i) => !!(steps[i].skip && steps[i].skip(context));

  const [index, setIndex] = useState(() => {
    let i = 0;
    while (i < steps.length && isSkipped(i)) i++;
    return i;
  });

  const nav = {
    next: () => {
      setIndex(i => {
        let n = i + 1;
        while (n < steps.length && isSkipped(n)) n++;
        return n < steps.length ? n : i;
      });
    },
    back: () => {
      setIndex(i => {
        let n = i - 1;
        while (n >= 0 && isSkipped(n)) n--;
        return n >= 0 ? n : i;
      });
    },
    // Jumps straight to a step by key, e.g. for a "skip ahead" shortcut or an
    // onReplay that restarts the section from its first screen. The target step
    // itself is rendered as-is (its own skip, if any, is never expected to be true
    // for a step something explicitly jumps to by name).
    goto: (key) => {
      const target = steps.findIndex(s => s.key === key);
      if (target !== -1) setIndex(target);
    },
  };

  const current = steps[index];
  if (!current) return null;
  return current.render(context, nav);
}
