// Hands the zoomed-in room from the factory-map walk (StationTransitionScreen) to the
// "Now entering" card (RoomIntroScreen), so the room on the map can turn into the
// card's picture window instead of the two screens just fading.
//
// The walk leaves where the room sits on screen (and which bit of the map is showing);
// the card picks it up if it's for the same stop and only just left. Nothing else
// needs to know - if no card follows the walk, the handoff simply goes stale.

const MAX_AGE_MS = 1500;
let pending = null;

// { stopKey, rect: {left, top, width, height}, viewBox: [x, y, w, h], player: {x, y, facing}, chefHat }
export function leaveRoomHandoff(handoff) {
  pending = { ...handoff, at: performance.now() };
}

// Doesn't clear it (React may run a state initializer twice in development) - it just
// expires on its own.
export function takeRoomHandoff(stopKey) {
  const h = pending;
  if (!h || h.stopKey !== stopKey || performance.now() - h.at > MAX_AGE_MS) return null;
  return h;
}

// Where the "Now entering" card's window sits - always centred on the screen - and the
// card laid out around it. Shared by the card (RoomIntroScreen) and the map walk
// (StationTransitionScreen), whose zoom ends with the room exactly on this window, so
// the room never has to move to fit it.
export const INTRO_CARD = {
  border: 5,     // card border
  padX: 30,
  padTop: 22,
  padBottom: 18,
  gap: 12,       // between the heading, the window and the blurb
  headH: 70,     // "Now entering" + room name
  footH: 46,     // the blurb (up to two lines)
  frame: 4,      // the window's own border
  aspect: 16 / 9,
};

export function introLayout(vw = window.innerWidth, vh = window.innerHeight) {
  const c = INTRO_CARD;
  const sideChrome = 2 * (c.border + c.padX + c.frame);
  const above = c.frame + c.gap + c.headH + c.padTop + c.border; // window top -> card top
  const below = c.frame + c.gap + c.footH + c.padBottom + c.border;
  // as wide as fits (up to 640), and short enough that the card above and below the
  // centred window still fits on screen
  let w = Math.min(vw * 0.92 - sideChrome, 640);
  let h = w / c.aspect;
  const maxH = vh - 2 * Math.max(above, below) - 24;
  if (h > maxH) { h = Math.max(120, maxH); w = h * c.aspect; }
  const win = { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  const cardW = Math.max(w + sideChrome, Math.min(vw * 0.92, 560));
  const card = {
    left: (vw - cardW) / 2,
    top: win.top - above,
    width: cardW,
    height: above + h + below,
  };
  return { win, card };
}
