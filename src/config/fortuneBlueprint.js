// THE FORTUNE BLUEPRINT - which kinds of fortunes each part of the game deals out, and
// in what proportions. The fortunes themselves live in src/data/fortunePool.js; at the
// start of each part, src/utils/fortunePlan.js deals that part's pre-test, level round
// and post-test from the pool following this blueprint.
//
// Every fortune is one of four TYPES - a URL (legitimate or suspicious) plus context
// that either matches the URL's brand or doesn't:
//
//   type              URL          context                          verdict
//   ----------------  -----------  -------------------------------  -------
//   sus_related       suspicious   about the brand the URL imitates  FAULTY
//   legit_related     legitimate   about that brand                  valid
//   legit_unrelated   legitimate   about something else entirely    FAULTY
//   sus_warned        suspicious   warns the reader away from it     valid
//
// Every suspicious URL also uses one URL ATTACK (how the fake imitates the real
// brand). Every test includes every attack, spread across its suspicious fortunes.

export const FORTUNE_TYPES = {
  sus_related: { label: 'Suspicious, related', faulty: true, suspiciousUrl: true },
  legit_related: { label: 'Legitimate, related', faulty: false, suspiciousUrl: false },
  legit_unrelated: { label: 'Legitimate, unrelated', faulty: true, suspiciousUrl: false },
  sus_warned: { label: 'Suspicious, warned', faulty: false, suspiciousUrl: true },
};

// The ways a suspicious URL imitates a real one. Add or remove entries freely - the
// tests adapt (but a test needs at least as many suspicious fortunes as there are
// attacks to cover them all - see the test layouts below).
export const URL_ATTACKS = {
  typosquatting: { label: 'Typosquatting', example: 'youtyube.com, netflx.com - the brand name misspelt' },
  combosquatting: { label: 'Combosquatting', example: 'amazon-gift-rewards.com - the real brand plus extra words' },
  homoglyph: { label: 'Homoglyph', example: 'arnazon.com (rn for m), paypa1.com (1 for l) - look-alike characters' },
  tld_swap: { label: 'TLD swap', example: 'netflix.top, instagram.xyz - the right name on the wrong ending' },
  subdomain_spoof: { label: 'Subdomain spoof', example: 'amazon.com.gift-rewards.co - the brand put in front of someone else\'s domain' },
  ip_address: { label: 'IP address', example: 'http://102.145.24.3/login - a raw number instead of a name' },
};

// The two parts of the game. Each part's pre-test (the Training trays) and post-test
// (the Final trays) use the SAME layout and the SAME mix of types, so the two can be
// compared directly - only the fortunes differ.
//
//   types:  the fortune types this part uses, matching what its level teaches
//   test:   the tray tests - trays x 2 bunches x fortunesPerBunch fortunes. The types
//           share the fortunes equally; when they don't divide evenly, the spare
//           fortunes go to the suspicious types first (so every URL attack fits in).
//           Every bunch holds at least one fortune of each type.
//   level:  how many fortunes the level round deals (one per dome)
export const PART_BLUEPRINTS = {
  // Part 1 - the Level 2 rules: suspicious-related, legitimate-related, legitimate-unrelated
  part1: {
    types: ['sus_related', 'legit_related', 'legit_unrelated'],
    test: { trays: 2, fortunesPerBunch: 4 },  // 16 fortunes: 6 sus_related (one per URL attack), 5 + 5 legit
    level: { domes: 5 },                       // Level 2's board
  },
  // Part 2 - the Level 3 rules: all four, adding suspicious-warned
  part2: {
    types: ['sus_related', 'legit_related', 'legit_unrelated', 'sus_warned'],
    test: { trays: 2, fortunesPerBunch: 4 },  // 16 fortunes: 4 of each type, one of each per bunch;
                                               // the 8 suspicious ones cover all 6 URL attacks
    level: { domes: 6 },                       // Level 3's board
  },
};

export const BUNCHES_PER_TRAY = 2; // the tray minigame always opens two bunches per tray

export const isFaulty = (fortune) => Boolean(FORTUNE_TYPES[fortune.type] && FORTUNE_TYPES[fortune.type].faulty);
