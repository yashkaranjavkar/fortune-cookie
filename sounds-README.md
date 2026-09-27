# Wisecrack sounds

23 short sound effects for every interaction in the game, all warm and soft. Wrong answers get a gentle thud, never an alarm, so the game still feels like a bakery, not a security test.

Open `listen.html` in a browser to hear them all.

## Which sound goes where

| Interaction | Sound |
| --- | --- |
| Any button click (Next, Accept, Play, menu items) | `button-press` |
| Pointer moves onto a button (optional) | `button-hover` |
| Picking a dropdown option, tag, radio, Stay / Revoke | `select` |
| Panel or popup opens / closes | `popup-open` / `popup-close` |
| Small message ("Fortune recorded") | `toast` |
| Dome lifts after the 300 ms hover | `dome-lift` |
| Cookie cracks open / a bunch breaks open | `cookie-crack` |
| Start dragging the fortune slip | `slip-pickup` |
| Slip dropped in the Approved tray | `drop-approved` |
| Slip dropped in the Faulty tray | `drop-faulty` |
| Progress bar cookie moves forward | `progress-munch` |
| Each of the last 3 seconds of the timer | `timer-tick` |
| Timer runs out ("You wasted time") | `time-up`, then `cookie-break` |
| +₹ incentive | `coin-gain` |
| −₹ deduction | `coin-loss` |
| Each star on Level done | `star-earn` |
| Level done screen | `level-done` |
| Popping a replay balloon | `balloon-pop` |
| Torch light on / sliding | `torch-on` |
| Highlighting text / removing a highlight | `highlight-mark` / `highlight-remove` |

## Adding them to the game

1. Copy the `sounds/` folder into your project's `public/` folder, so the files end up at `public/sounds/…mp3`.
2. Copy `sounds.js` into your `src/` folder.
3. Anywhere you want a sound: `import { playSound } from './sounds';` then `playSound('dome-lift');`.
4. For the sound on/off button: `setMuted(true)` or `setMuted(false)`. The choice is remembered.

Or ask Claude Code: "Add the sounds from src/sounds.js to every interaction, following the table in the Wisecrack sounds README."
