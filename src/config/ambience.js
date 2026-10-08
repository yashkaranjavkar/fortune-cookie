// Ambient bakery music + sounds (played by src/ambience.js).
//
// sections: which sections of GAME_FLOW (src/config/gameFlow.js) it plays in. It keeps
// playing through the walks between two of these, and fades out when the game moves
// on to a section that isn't listed. Add/remove keys here to change where it plays.
export const AMBIENCE = {
  sections: ['opening', 'appointment', 'job'],

  masterVolume: 0.55, // overall loudness (0 - 1)
  musicVolume: 1,     // the lo-fi music loop, relative to the master
  bakeryVolume: 1,    // oven hum, crackle, clinks and timer dings, relative to the master
};
