import React from 'react';
import PlayerDetailsScreen from '../../components/PlayerDetailsScreen';
import ConnectingScreen from '../../components/ConnectingScreen';

// The "Player details" section's screen order (quickStart flow): the three details,
// then the "Connecting you to the game..." loader, which hands over to the next
// section (the title screen) on its own.
export const PLAYER_DETAILS_STEPS = [
  {
    key: 'details',
    cursor: 'plain', // the ordinary system cursor - nothing from the game yet
    render: (ctx, nav) => (
      <PlayerDetailsScreen
        employeeId={ctx.employeeId} setEmployeeId={ctx.setEmployeeId}
        designation={ctx.designation} setDesignation={ctx.setDesignation}
        region={ctx.region} setRegion={ctx.setRegion}
        onConfirm={nav.next}
      />
    ),
  },
  // Terminal step: hands off to the section's own onComplete
  { key: 'connecting', cursor: 'plain', render: (ctx) => <ConnectingScreen onDone={ctx.onComplete} /> },
];
