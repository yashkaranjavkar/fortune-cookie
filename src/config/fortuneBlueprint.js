// THE FORTUNE BLUEPRINT - which kinds of fortunes each part of the game deals out, and
// in what proportions. The fortunes themselves live in src/data/fortunePool.js; at the
// start of each part, src/utils/fortunePlan.js deals that part's pre-test, level round
// and post-test from the pool following this blueprint.
//
// Every fortune is one of five TYPES - what its text is (about the website, about
// something else, or a warning) combined with what its URL is (the real website, or a
// fake of it). These are the "Text type", "URL type" and "Fortune type" columns of the
// fortune spreadsheet:
//
//   type              text type   URL type     fortune type
//   ----------------  ----------  -----------  ------------
//   legit_related     related     legitimate   valid
//   sus_related       related     suspicious   FAULTY
//   legit_unrelated   unrelated   legitimate   FAULTY
//   sus_unrelated     unrelated   suspicious   FAULTY
//   sus_warned        warning     suspicious   valid
//
// Every suspicious URL also uses one URL ATTACK (how the fake imitates the real
// website). A test spreads its suspicious fortunes over the attacks the pool has.

export const FORTUNE_TYPES = {
  legit_related: { label: 'Legitimate, related', textType: 'related', urlType: 'legitimate', faulty: false, suspiciousUrl: false },
  sus_related: { label: 'Suspicious, related', textType: 'related', urlType: 'suspicious', faulty: true, suspiciousUrl: true },
  legit_unrelated: { label: 'Legitimate, unrelated', textType: 'unrelated', urlType: 'legitimate', faulty: true, suspiciousUrl: false },
  sus_unrelated: { label: 'Suspicious, unrelated', textType: 'unrelated', urlType: 'suspicious', faulty: true, suspiciousUrl: true },
  sus_warned: { label: 'Suspicious, warned', textType: 'warning', urlType: 'suspicious', faulty: false, suspiciousUrl: true },
};

// The ways a suspicious URL imitates a real one. src/data/fortunePool.js works out
// which one each suspicious fortune uses (attackOf).
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
// compared directly - only the fortunes differ. Every player gets the same mix.
//
//   types:  the fortune types this part uses, matching what its level teaches
//   test:   the tray tests - trays x 2 bunches x fortunesPerBunch fortunes
//   mix:    how many fortunes of each type ONE test holds (they must add up to the
//           test's size). Only one type in five is valid for two reasons at once, so a
//           perfectly even split of text type, URL type AND valid / faulty doesn't
//           exist - the mixes below are the closest all-round. Leave mix out to share
//           the test equally between the types.
//   level:  how many fortunes the level round deals (one per dome)
export const PART_BLUEPRINTS = {
  // Part 1 - the Level 2 rules: every type except the warnings.
  //   valid 6 : faulty 10    legitimate 9 : suspicious 7    related 10 : unrelated 6
  part1: {
    types: ['legit_related', 'sus_related', 'legit_unrelated', 'sus_unrelated'],
    test: { trays: 2, fortunesPerBunch: 4 },
    mix: { legit_related: 6, sus_related: 4, legit_unrelated: 3, sus_unrelated: 3 },
    level: { domes: 5 }, // Level 2's board
  },
  // Part 2 - the Level 3 rules: all five, adding the warnings.
  //   valid 8 : faulty 8    legitimate 7 : suspicious 9    related 7 : unrelated 5 : warning 4
  part2: {
    types: ['legit_related', 'sus_warned', 'sus_related', 'legit_unrelated', 'sus_unrelated'],
    test: { trays: 2, fortunesPerBunch: 4 },
    mix: { legit_related: 4, sus_warned: 4, sus_related: 3, legit_unrelated: 3, sus_unrelated: 2 },
    level: { domes: 6 }, // Level 3's board
  },
};

export const BUNCHES_PER_TRAY = 2; // the tray minigame always opens two bunches per tray

export const isFaulty = (fortune) => Boolean(FORTUNE_TYPES[fortune.type] && FORTUNE_TYPES[fortune.type].faulty);
