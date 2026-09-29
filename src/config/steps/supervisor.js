import React from 'react';
import {
  SupervisionIntroScreen,
  SupervisionInstructionsScreen,
  SupervisionChecklistScreen,
  SupervisionGreatWorkScreen,
  SupervisionLastBatchScreen
} from '../../components/SupervisionPhase';

// The Supervisor section's screen order. Reorder, insert, or remove entries here to
// change the flow.
export const SUPERVISOR_STEPS = [
  { key: 'intro', render: (ctx, nav) => <SupervisionIntroScreen onNext={nav.next} stepIndex={0} totalSteps={2} /> },
  { key: 'instructions', render: (ctx, nav) => <SupervisionInstructionsScreen onNext={nav.next} stepIndex={1} totalSteps={2} /> },
  {
    key: 'checklist',
    render: (ctx, nav) => (
      <SupervisionChecklistScreen
        onNext={(data) => {
          console.log('Decisions:', data.decisions);
          console.log('Revoke reasons:', data.revokeReasons);
          nav.next();
        }}
      />
    )
  },
  { key: 'greatWork', render: (ctx, nav) => <SupervisionGreatWorkScreen onNext={nav.next} /> },
  // Terminal step: hands off to the section's own onComplete instead of nav.next().
  { key: 'lastBatch', render: (ctx) => <SupervisionLastBatchScreen onNext={ctx.onComplete} /> },
];
