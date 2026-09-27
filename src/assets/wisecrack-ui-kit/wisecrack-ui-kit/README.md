# Wisecrack UI kit

The game's look, exported from the design canvas.

## What's in here

- `svg/` — ready-to-use pictures of every game object:
  - Domes: `dome-covered`, `dome-hover`, `dome-lifted`, `dome-spent`
  - Cookies: `cookie-whole`, `cookie-cracked`, `cookie-broken`, `cookie-progress` (the one on the progress bar)
  - Trays: `tray-baking`, `tray-faulty`, `tray-approved`, `tray-drop-target`
  - Balloons: `balloons-3-left`, `balloons-popped`, `balloons-docked`, `balloons-none-left`
  - Stars: `star-earned`, `star-empty`
- `preview/` — open any of these in a browser to see the full sheet. They are also the reference for how buttons, panels, bars, timers and score counters are styled (all the styles are written right in the HTML).
  - `Buttons.html`, `Panels.html`, `HUD.html` (bars, timers, stars, score), `Objects.html`
- `wisecrack-colors.css` — every colour in the kit as a named CSS variable.

## Using it with Claude Code

Put this whole folder inside your project (for example `src/assets/wisecrack-ui-kit`), then ask Claude Code things like:

- "Build a Button component that matches the buttons in src/assets/wisecrack-ui-kit/preview/Buttons.html, using the colours in wisecrack-colors.css."
- "Show svg/dome-covered.svg on each dome, and swap it for dome-lifted.svg when it opens."
- "Make the progress bar look like the one in preview/HUD.html."
