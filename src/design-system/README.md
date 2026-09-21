# Batch No. 26

Fortune Cookie Inspection Game — a phishing-URL-literacy serious game for corporate employees, disguised entirely as a fortune cookie factory simulation.

## The one rule everything else follows

**The disguise is the difficulty.** Every visual decision here is filtered through one question: *would this tip a player off that they're being trained on cybersecurity?* Nothing in this system uses a padlock, shield, warning triangle, or the words "phishing," "security," or "threat." Verdicts live in game objects (a tray, a broken cookie), never in a checkmark/X badge layered on top of the interface.

## Visual foundations

**Colour.** Four identity hues — orange, yellow, pink, maroon — carry warmth and ceremony; brown, green and grey do quiet secondary work (wood, produce, neutral chrome); `accent-orange` is spent on one focal action per screen at most. `beige-base` is the default stage everywhere, so saturated foreground objects (cookies, domes, trays) always have room to breathe. `information` — the system's one deliberately cool tone — is fenced off to the Inspection Room's own device, where it reads as "that's just the machine's colour" rather than a UI system colour. Never let it leak anywhere else; blue reads as "trust/verified" in enterprise software and would break the cover story.

**Typography.** STIX Two Text carries ceremony — level titles, the score ledger, job-offer and promotion screens. Mulish carries function — everything a player reads fast and acts on: instructions, buttons, the HUD. Timer and Game Numbers use tabular Mulish figures so digits never jitter mid-countdown.

**Shape.** Rounded and non-aggressive throughout. `radius-full` on every button, dome and balloon; nothing in this system uses a sharp point, a triangle, or a chevron-as-alert. The Faulty Tray gets exactly the same warmth of corner as the Approved Tray — a "negative" object never looks visually punished.

**Motion (not tokenised, but load-bearing).** The design should feel like it's breathing: idle bob on domes, a faint sway on balloons, a slow shimmer on cookie sheen. A screen with nothing moving reads as broken, not calm.

## Accessibility

- Body text on `beige-base`/`beige-elevated` is always `ink-primary` — never a lighter grey, never pure black.
- Text on filled `orange-base`, `maroon-base` or `green-deep` surfaces uses `ink-inverse`, never pure white.
- `yellow-base` and `yellow-light` never carry white text at any size — pair them with `ink-primary` only.
- `accent-orange` never carries small white text; reserve white text for it only at large, bold sizes.

## Components

Buttons, Timer, Score Display, Progress Pill, Sorting Trays, the Balloon Replay Widget, the Food Dome + Fortune Cookie, and the Justification Modal are built out below — the visual grammar every screen in the game (Onboarding through Supervision) is assembled from.

---
