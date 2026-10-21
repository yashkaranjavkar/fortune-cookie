import { createContext, useContext } from 'react';
import { FORTUNE_TYPES, URL_ATTACKS, PART_BLUEPRINTS, BUNCHES_PER_TRAY } from '../config/fortuneBlueprint';
import { FORTUNE_POOL } from '../data/fortunePool';

// Deals one part's fortunes from the pool (src/data/fortunePool.js) following its
// blueprint (src/config/fortuneBlueprint.js), once, when the part starts:
//
//   pretest   the Training trays - trays x 2 bunches, each bunch an array of fortunes
//   level     the level round - one fortune per dome, in the order domes are opened
//   posttest  the Final trays - same layout and same mix as the pretest
//
// Balance:
//   - every test has the part's fortune types in equal numbers (any spare fortunes go
//     to the suspicious types), the same mix in the pre-test and post-test, and every
//     bunch holds at least one fortune of each type
//   - every test includes every URL attack, spread over its suspicious fortunes in a
//     fresh random order for each test
//   - the pre-test and post-test are drawn side by side, slot by slot, so neither gets
//     the leftovers; which fortunes land in which test is random for each player
//   - no fortune appears twice in a part, and a bunch avoids repeating a brand
//
// Each fortune handed out keeps its pool fields (id, type, attack, brand, url, text)
// plus what the existing sorting / marking / grading screens read: isPhishy (true =
// it belongs in the Faulty tray) and invalidPart (null for the valid types).

export const FortunePlanContext = createContext(null);
export const useFortunePlan = () => useContext(FortunePlanContext);

const ATTACKS = Object.keys(URL_ATTACKS);

function shuffle(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const asDealt = (f) => ({
  ...f,
  attack: f.attack || null,
  isPhishy: Boolean(FORTUNE_TYPES[f.type] && FORTUNE_TYPES[f.type].faulty),
  invalidPart: f.invalidPart || null,
});

// Checks the pool's entries for mistakes (missing fields, an invalidPart that isn't in
// the text...). Returns a list of problems; also logged to the console in development.
export function checkPool(pool = FORTUNE_POOL) {
  const problems = [];
  const ids = new Set();
  pool.forEach((f, i) => {
    const where = f.id || `entry ${i + 1}`;
    if (!f.id) problems.push(`${where}: no id`);
    else if (ids.has(f.id)) problems.push(`${where}: id used twice`);
    ids.add(f.id);
    const type = FORTUNE_TYPES[f.type];
    if (!type) { problems.push(`${where}: unknown type "${f.type}"`); return; }
    if (!f.text) problems.push(`${where}: no text`);
    if (f.url && f.text && !f.text.includes(f.url)) problems.push(`${where}: url isn't in the text`);
    if (type.suspiciousUrl && !URL_ATTACKS[f.attack]) problems.push(`${where}: suspicious fortunes need an attack (one of ${ATTACKS.join(', ')})`);
    if (type.faulty && !f.invalidPart) problems.push(`${where}: faulty fortunes need an invalidPart`);
    if (f.invalidPart && f.text && !f.text.includes(f.invalidPart)) problems.push(`${where}: invalidPart "${f.invalidPart}" isn't in the text`);
    if (!type.faulty && f.invalidPart) problems.push(`${where}: valid fortunes shouldn't have an invalidPart`);
  });
  return problems;
}

// One dealer per part: remembers what's been handed out, and where the pool ran short
function makeDealer(pool, random) {
  const used = new Set();
  const shortfalls = [];
  const valid = pool.filter(f => FORTUNE_TYPES[f.type]);

  const draw = (type, attack, avoidBrands, slotName) => {
    const fresh = valid.filter(f => f.type === type && !used.has(f.id));
    const tiers = [
      fresh.filter(f => (!attack || f.attack === attack) && !avoidBrands.includes(f.brand)),
      fresh.filter(f => !attack || f.attack === attack),
      fresh.filter(f => !avoidBrands.includes(f.brand)),
      fresh,
      valid.filter(f => f.type === type), // last resort: repeat a fortune
    ];
    const tier = tiers.findIndex(t => t.length > 0);
    if (tier === -1) { shortfalls.push(`${slotName}: no ${type} fortunes at all`); return null; }
    if (tier >= 2 && attack) shortfalls.push(`${slotName}: no unused ${type} fortune with attack "${attack}"`);
    if (tier === 4) shortfalls.push(`${slotName}: ran out of ${type} fortunes - repeating one`);
    const options = tiers[tier];
    const pick = options[Math.floor(random() * options.length)];
    used.add(pick.id);
    return asDealt(pick);
  };

  return { draw, shortfalls };
}

// How many fortunes of each type one test holds: an equal share each, with any spare
// fortunes going to the suspicious types first (they carry the URL attacks). The same
// for the pre-test and post-test.
function typeCounts(blueprint) {
  const { types, test } = blueprint;
  const total = test.trays * BUNCHES_PER_TRAY * test.fortunesPerBunch;
  const counts = Object.fromEntries(types.map(t => [t, Math.floor(total / types.length)]));
  const spareOrder = [...types.filter(t => FORTUNE_TYPES[t].suspiciousUrl), ...types.filter(t => !FORTUNE_TYPES[t].suspiciousUrl)];
  for (let i = 0; i < total - types.length * Math.floor(total / types.length); i++) counts[spareOrder[i % spareOrder.length]] += 1;
  return counts;
}

// The type (and attack, for suspicious types) of every slot of one test, bunch by bunch
function testSlots(blueprint, random) {
  const { types, test } = blueprint;
  const bunches = test.trays * BUNCHES_PER_TRAY;
  const per = test.fortunesPerBunch;

  // Deal the types round-robin (skipping a type once it's used up) and cut the line
  // into bunches - so every bunch gets every type before any type repeats
  const left = typeCounts(blueprint);
  const line = [];
  while (line.length < bunches * per) {
    types.forEach((t) => { if (left[t] > 0 && line.length < bunches * per) { line.push(t); left[t] -= 1; } });
  }
  const slots = Array.from({ length: bunches }, (_, b) =>
    line.slice(b * per, (b + 1) * per).map(type => ({ type, attack: null, bunch: b })));

  // Attacks: one shuffled cycle shared by all the suspicious fortunes of the test, type
  // after type - so every attack appears in the test, and no attack repeats within a
  // type until that type has had them all. Then avoid the same attack twice in one bunch
  // where a reshuffle can.
  const suspicious = slots.flat()
    .filter(s => FORTUNE_TYPES[s.type].suspiciousUrl)
    .sort((x, y) => types.indexOf(x.type) - types.indexOf(y.type));
  const clashes = () => slots.some(bunch => {
    const seen = bunch.filter(s => s.attack).map(s => s.attack);
    return new Set(seen).size < seen.length;
  });
  for (let attempt = 0; attempt < 30; attempt++) {
    const order = shuffle(ATTACKS, random);
    suspicious.forEach((s, i) => { s.attack = order[i % order.length]; });
    if (!clashes()) break;
    // keep the attacks, move them between this test's slots of the same type
    types.forEach((type) => {
      const mine = suspicious.filter(s => s.type === type);
      const moved = shuffle(mine.map(s => s.attack), random);
      mine.forEach((s, i) => { s.attack = moved[i]; });
    });
    if (!clashes()) break;
  }
  return slots;
}

// A full plan for one part (see the top of this file)
export function buildPartPlan(partKey, { pool = FORTUNE_POOL, random = Math.random } = {}) {
  const blueprint = PART_BLUEPRINTS[partKey] || PART_BLUEPRINTS.part1;
  const dealer = makeDealer(pool, random);

  // Pre-test and post-test, drawn slot by slot side by side
  const preSlots = testSlots(blueprint, random);
  const postSlots = testSlots(blueprint, random);
  const pre = preSlots.map(() => []);
  const post = postSlots.map(() => []);
  preSlots.forEach((bunch, b) => bunch.forEach((slot, k) => {
    const first = random() < 0.5 ? ['pre', 'post'] : ['post', 'pre'];
    first.forEach((which) => {
      const s = which === 'pre' ? slot : postSlots[b][k];
      const into = which === 'pre' ? pre[b] : post[b];
      const f = dealer.draw(s.type, s.attack, into.map(x => x.brand), `${which}test bunch ${b + 1}`);
      if (f) into.push(f);
    });
  }));
  const toTrays = (bunches) => {
    const trays = [];
    for (let i = 0; i < bunches.length; i += BUNCHES_PER_TRAY) {
      trays.push(bunches.slice(i, i + BUNCHES_PER_TRAY).map(b => shuffle(b, random)));
    }
    return trays;
  };

  // The level round from what's left: types round-robin from a random start, then
  // shuffled; suspicious ones cycle through the attacks
  const { types } = blueprint;
  const start = Math.floor(random() * types.length);
  const levelTypes = shuffle(Array.from({ length: blueprint.level.domes }, (_, i) => types[(start + i) % types.length]), random);
  const attackCycle = shuffle(ATTACKS, random);
  let nextAttack = 0;
  const level = [];
  levelTypes.forEach((type, i) => {
    const attack = FORTUNE_TYPES[type].suspiciousUrl ? attackCycle[nextAttack++ % attackCycle.length] : null;
    const f = dealer.draw(type, attack, level.map(x => x.brand), `level dome ${i + 1}`);
    if (f) level.push(f);
  });

  const plan = {
    part: partKey,
    types,
    pretest: toTrays(pre),
    posttest: toTrays(post),
    level,
    shortfalls: dealer.shortfalls,
    results: {}, // filled in as the tests are played (recordTestResult)
  };
  if (process.env.NODE_ENV !== 'production') {
    const problems = checkPool(pool);
    if (problems.length) console.warn(`Fortune pool problems:\n- ${problems.join('\n- ')}`);
    if (plan.shortfalls.length) console.warn(`Fortune pool ran short for ${partKey}:\n- ${plan.shortfalls.join('\n- ')}`);
  }
  return plan;
}

// Every fortune id in a plan, test by test - for analytics, so researchers can see
// exactly what each player was shown
export function planSummary(plan) {
  const ids = (trays) => trays.map(tray => tray.map(bunch => bunch.map(f => f.id)));
  return {
    part: plan.part,
    pretest: ids(plan.pretest),
    posttest: ids(plan.posttest),
    level: plan.level.map(f => f.id),
    shortfalls: plan.shortfalls,
  };
}

// One bunch of a tray test, graded: a fortune is answered correctly when the player
// picks it as faulty exactly when it is faulty
export function gradeBunch(fortunes, selectedIndexes) {
  return fortunes.map((f, i) => {
    const selected = selectedIndexes.includes(i);
    return { id: f.id, type: f.type, attack: f.attack, faulty: f.isPhishy, selected, correct: selected === f.isPhishy };
  });
}

// Keeps a finished test's graded answers on the plan, and works out its score
export function recordTestResult(plan, testKey, rows) {
  if (!plan) return null;
  const correct = rows.filter(r => r.correct).length;
  const result = { answered: rows.length, correct, accuracy: rows.length ? correct / rows.length : 0, rows };
  plan.results[testKey] = result;
  return result;
}
