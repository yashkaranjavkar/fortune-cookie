import { createContext } from 'react';

// How the inspector character on the factory map is dressed, decided by App.js from
// where the player is in GAME_FLOW (e.g. they earn their chef's hat once training is
// done). Read by the walking character in StationTransitionScreen.
export const PlayerLookContext = createContext({ chefHat: false });
