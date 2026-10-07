import React from 'react';
import StationTransitionScreen from '../../components/StationTransitionScreen';
import RoomIntroScreen from '../../components/RoomIntroScreen';

// The two "moving around the factory" screens, as one-line steps you can drop into any
// STEPS array (or comment out) independently. Stop keys come from STOPS in
// src/config/stations.js.
//
//   walkStep(key, fromStop, toStop, tag)   - top-down map, player walks from one stop to
//                                            another, map fades out on arrival
//   roomIntroStep(key, stop, tag)          - "Now entering <room>" card with the room's
//                                            illustration, fades in and out
//
// Both continue to the next step on their own, and Back buttons skip over them.

export function walkStep(key, fromKey, toKey, subtitle) {
  return {
    key,
    passThrough: true,
    cursor: 'hidden', // nothing to click while the player walks across the map
    render: (ctx, nav) => (
      <StationTransitionScreen fromKey={fromKey} toKey={toKey} subtitle={subtitle} onNext={nav.next} />
    ),
  };
}

export function roomIntroStep(key, stopKey, subtitle) {
  return {
    key,
    passThrough: true,
    render: (ctx, nav) => <RoomIntroScreen stopKey={stopKey} subtitle={subtitle} onDone={nav.next} />,
  };
}
