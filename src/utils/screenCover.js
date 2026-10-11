import { createContext, useContext } from 'react';

// True while a screen is loaded but still covered by the "Now entering" room card
// (RoomIntroScreen opens up into the screen underneath it). Anything that shouldn't
// start until the player can actually see the screen - like a countdown - waits for
// it to turn false.
export const ScreenCoveredContext = createContext(false);

export const useScreenCovered = () => useContext(ScreenCoveredContext);

// True for a step shown as a pop-up over the screen that comes after it (a step with
// `popupOverNext` in src/config/steps/*.js) - StoryScreen then draws just its card,
// over the dimmed next screen, instead of the whole storefront.
export const PopupContext = createContext(false);

export const useIsPopup = () => useContext(PopupContext);
