import React from 'react';
import StartScreen from '../../components/StartScreen';
import IntroScreen from '../../components/IntroScreen';
import JobApplication from '../../components/JobApplication';
import WebsitesScreen from '../../components/WebsitesScreen';
import ThankYouScreen from '../../components/ThankYouScreen';
import CongratulationsScreen from '../../components/CongratulationsScreen';
import WelcomeScreen from '../../components/WelcomeScreen';

// The Job Application section's screen order. Reorder, insert, or remove entries here
// to change the flow - each step's render function only ever calls nav.next()/nav.back(),
// never a hardcoded step number, so the order is entirely determined by this array.
export const JOB_APPLICATION_STEPS = [
  {
    key: 'start',
    render: (ctx, nav) => (
      <StartScreen
        employeeId={ctx.employeeId} setEmployeeId={ctx.setEmployeeId}
        designation={ctx.designation} setDesignation={ctx.setDesignation}
        onConfirm={nav.next}
      />
    )
  },
  { key: 'intro', render: (ctx, nav) => <IntroScreen onNext={nav.next} /> },
  {
    key: 'application',
    render: (ctx, nav) => (
      <JobApplication
        age={ctx.age} setAge={ctx.setAge}
        region={ctx.region} setRegion={ctx.setRegion}
        interests={ctx.interests} setInterests={ctx.setInterests}
        onNext={nav.next}
      />
    )
  },
  { key: 'websites', render: (ctx, nav) => <WebsitesScreen userData={ctx.userData} onNext={nav.next} /> },
  { key: 'thankYou', render: (ctx, nav) => <ThankYouScreen onNext={nav.next} /> },
  { key: 'congratulations', render: (ctx, nav) => <CongratulationsScreen onAccept={nav.next} /> },
  // Terminal step: hands off to the section's own onComplete instead of nav.next().
  { key: 'welcome', render: (ctx) => <WelcomeScreen onReady={ctx.onComplete} /> },
];
