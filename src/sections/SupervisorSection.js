import React from 'react';
import SectionRunner from './SectionRunner';
import { SUPERVISOR_STEPS } from '../config/steps/supervisor';

// Supervisor checklist: intro -> instructions -> the checklist -> praise -> one last
// batch to sort (leads into the next section). The actual screen order lives in
// src/config/steps/supervisor.js.
export default function SupervisorSection({ onComplete }) {
  const context = { onComplete };
  return <SectionRunner steps={SUPERVISOR_STEPS} context={context} />;
}
