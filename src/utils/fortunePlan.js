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
// What is balanced, for every player:
//   - TYPES: every test holds the blueprint's mix of fortune types - and so the same
//     split of text type (related / unrelated / warning), URL type (legitimate /
//     suspicious) and valid / faulty. The pre-test and post-test share one layout:
//     the same types in the same bunches. Types are spread evenly over the bunches,
//     and every bunch has something valid and something faulty.
//   - WEBSITES (domains): a test shows as many different websites as it can - with 16
//     or more in the pool, each at most once per test - and a bunch never repeats one.
//   - THE PLAYER'S CHOICES: websites in the categories the player picked on "What do
//     you use the internet for most?" (their `interests`) are FAMILIAR. Once the
//     websites are spread out, familiar ones are dealt first - in the tests and in
//     the level - and the pre-test and post-test get the same number of them, since
//     the two are drawn side by side, slot by slot.
//   - URL ATTACKS: suspicious fortunes are spread over the attacks the pool has; a
//     bunch avoids repeating one.
//   - no fortune appears twice in a part.
//
// The deal is random, so it is made several times over and the most balanced one is
// kept. Anything the pool couldn't provide is listed in plan.shortfalls.
//
// Each fortune handed out keeps its pool fields (id, type, domain, textType, urlType,
// attack, brand, url, text...) plus `familiar` and what the sorting / marking /
// grading screens read: isPhishy (true = it belongs in the Faulty tray) and
// invalidPart (null for the valid types).

export const FortunePlanContext = createContext(null);
export const useFortunePlan = () => useContext(FortunePlanContext);

const ATTACKS = Object.keys(URL_ATTACKS);
const DEALS_TRIED = 40; // how many random deals are made to pick the most balanced from

function shuffle(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const domainOf = (f) => f.domain || f.brand || f.id;
const countUp = (counts, key) => { counts[key] = (counts[key] || 0) + 1; };

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
    if (!type) { problems.push(`${where}: unknown type "${f.type}" - check its text type and URL type`); return; }
    if (!f.text) problems.push(`${where}: no text`);
    if (f.text && f.text.includes('{url}')) problems.push(`${where}: the text still has a {url} placeholder`);
    if (f.url && f.text && !f.text.includes(f.url)) problems.push(`${where}: url isn't in the text`);
    if (f.verdict && (f.verdict === 'faulty') !== type.faulty) problems.push(`${where}: marked ${f.verdict}, but a ${type.label.toLowerCase()} fortune is ${type.faulty ? 'faulty' : 'valid'}`);
    if (!f.domain) problems.push(`${where}: no website (domain)`);
    if (!f.categories || !f.categories.length) problems.push(`${where}: its website has no categories (add it to FORTUNE_DOMAINS)`);
    if (type.suspiciousUrl && !URL_ATTACKS[f.attack]) problems.push(`${where}: suspicious fortunes need an attack (one of ${ATTACKS.join(', ')})`);
    if (type.suspiciousUrl && f.url && f.domain && f.url.toLowerCase() === f.domain.toLowerCase()) problems.push(`${where}: marked suspicious, but its URL is the real website`);
    if (!type.suspiciousUrl && f.url && f.domain && !f.url.toLowerCase().includes(f.domain.toLowerCase())) problems.push(`${where}: marked legitimate, but its URL isn't the website's own`);
    if (type.faulty && !f.invalidPart) problems.push(`${where}: faulty fortunes need an invalidPart`);
    if (f.invalidPart && f.text && !f.text.includes(f.invalidPart)) problems.push(`${where}: invalidPart "${f.invalidPart}" isn't in the text`);
    if (!type.faulty && f.invalidPart) problems.push(`${where}: valid fortunes shouldn't have an invalidPart`);
  });
  return problems;
}

// How many fortunes of each type one test holds: the blueprint's mix - or, without
// one, an equal share each, with any spare fortunes going to the valid types first
// (there are fewer of those). The same for the pre-test and post-test.
export function typeCounts(blueprint) {
  const { types, test, mix } = blueprint;
  const total = test.trays * BUNCHES_PER_TRAY * test.fortunesPerBunch;
  if (mix && types.reduce((sum, t) => sum + (mix[t] || 0), 0) === total) {
    return Object.fromEntries(types.map(t => [t, mix[t] || 0]));
  }
  const counts = Object.fromEntries(types.map(t => [t, Math.floor(total / types.length)]));
  const spareOrder = [...types.filter(t => !FORTUNE_TYPES[t].faulty), ...types.filter(t => FORTUNE_TYPES[t].faulty)];
  for (let i = 0; i < total - types.length * Math.floor(total / types.length); i++) counts[spareOrder[i % spareOrder.length]] += 1;
  return counts;
}

// Which type goes in which bunch of a test: each type spread over the bunches as
// evenly as it goes, every bunch the same size, and (wherever the mix allows) every
// bunch with something valid and something faulty in it
function testLayout(blueprint, random) {
  const { types, test } = blueprint;
  const bunchCount = test.trays * BUNCHES_PER_TRAY;
  const counts = typeCounts(blueprint);
  const order = [...types].sort((x, y) => counts[y] - counts[x]);
  const mixed = (bunch) => bunch.some(t => FORTUNE_TYPES[t].faulty) && bunch.some(t => !FORTUNE_TYPES[t].faulty);

  let layout = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const bunches = Array.from({ length: bunchCount }, () => []);
    order.forEach((type) => {
      const share = Math.floor(counts[type] / bunchCount);
      bunches.forEach((bunch) => { for (let i = 0; i < share; i++) bunch.push(type); });
      // the ones left over go to the emptiest bunches, one each
      shuffle(bunches, random)
        .sort((x, y) => x.length - y.length)
        .slice(0, counts[type] - share * bunchCount)
        .forEach(bunch => bunch.push(type));
    });
    layout = bunches;
    if (bunches.every(mixed)) break;
  }
  return layout;
}

// One random deal of a whole part. Fortunes are drawn one slot at a time: of the
// unused fortunes of the slot's type, the one that keeps the part most balanced - in
// this order of importance:
//   1. a website not already in this bunch (or in the level)
//   2. the website this test has shown least
//   3. a website familiar to the player
//   4. the website this part has shown least
//   5. a URL attack not already in this bunch, then the one this test has used least
function dealOnce(blueprint, pool, random, isFamiliar) {
  const used = new Set();
  const shortfalls = [];
  const partDomains = {};
  const newTest = () => ({ domains: {}, attacks: {}, familiar: 0 });
  const tests = { pre: newTest(), post: newTest() };

  const draw = (type, group, test, slotName) => {
    let options = pool.filter(f => f.type === type && !used.has(f.id));
    if (!options.length) {
      options = pool.filter(f => f.type === type);
      if (!options.length) { shortfalls.push(`${slotName}: no ${type} fortunes at all`); return null; }
      shortfalls.push(`${slotName}: ran out of ${type} fortunes - repeating one`);
    }
    const cost = (f) => {
      const d = domainOf(f);
      return (group.some(g => domainOf(g) === d) ? 1000 : 0)
        + 100 * (test ? (test.domains[d] || 0) : 0)
        + (isFamiliar(f) ? 0 : 20)
        + 6 * (partDomains[d] || 0)
        + (f.attack && group.some(g => g.attack === f.attack) ? 4 : 0)
        + (f.attack && test ? (test.attacks[f.attack] || 0) : 0)
        + random() * 0.9;
    };
    const pick = options.map(f => ({ f, c: cost(f) })).sort((x, y) => x.c - y.c)[0].f;
    if (group.some(g => domainOf(g) === domainOf(pick))) shortfalls.push(`${slotName}: had to repeat the website ${domainOf(pick)}`);
    used.add(pick.id);
    countUp(partDomains, domainOf(pick));
    const familiar = isFamiliar(pick);
    if (test) {
      countUp(test.domains, domainOf(pick));
      if (pick.attack) countUp(test.attacks, pick.attack);
      if (familiar) test.familiar += 1;
    }
    return {
      ...pick,
      attack: pick.attack || null,
      familiar,
      isPhishy: FORTUNE_TYPES[pick.type].faulty,
      invalidPart: pick.invalidPart || null,
    };
  };

  // Pre-test and post-test: one layout for both, drawn slot by slot side by side.
  // Whichever test has fewer familiar websites so far draws first, so they keep level.
  const layout = testLayout(blueprint, random);
  const dealt = { pre: layout.map(() => []), post: layout.map(() => []) };
  layout.forEach((bunch, b) => shuffle(bunch, random).forEach((type) => {
    const gap = tests.pre.familiar - tests.post.familiar;
    const preFirst = gap === 0 ? random() < 0.5 : gap < 0;
    (preFirst ? ['pre', 'post'] : ['post', 'pre']).forEach((which) => {
      const f = draw(type, dealt[which][b], tests[which], `${which}test bunch ${b + 1}`);
      if (f) dealt[which][b].push(f);
    });
  }));

  // The level round from what's left: the types round-robin from a random start
  // (so which types get the extra dome is random), then shuffled
  const { types } = blueprint;
  const start = Math.floor(random() * types.length);
  const levelTypes = shuffle(Array.from({ length: blueprint.level.domes }, (_, i) => types[(start + i) % types.length]), random);
  const level = [];
  levelTypes.forEach((type, i) => {
    const f = draw(type, level, null, `level dome ${i + 1}`);
    if (f) level.push(f);
  });

  // How far this deal is from perfectly balanced (0 = nothing to improve)
  const domainCount = new Set(pool.filter(f => types.includes(f.type)).map(domainOf)).size || 1;
  const testSize = layout.reduce((n, bunch) => n + bunch.length, 0);
  const fairShare = Math.ceil(testSize / domainCount);
  const repeatedAttacks = (bunches) => bunches.reduce((n, bunch) => {
    const seen = bunch.filter(f => f.attack).map(f => f.attack);
    return n + seen.length - new Set(seen).size;
  }, 0);
  const crowded = (test) => Object.values(test.domains).reduce((n, c) => n + Math.max(0, c - fairShare), 0);
  const imbalance = 10000 * shortfalls.length
    + 100 * (crowded(tests.pre) + crowded(tests.post))
    + 50 * Math.abs(tests.pre.familiar - tests.post.familiar)
    + 5 * (repeatedAttacks(dealt.pre) + repeatedAttacks(dealt.post));

  return { pre: dealt.pre, post: dealt.post, level, shortfalls, imbalance };
}

// What a list of dealt fortunes adds up to - how many of each type, text type, URL
// type, verdict, attack and website, and how many are familiar to the player
export function tally(fortunes) {
  const out = { total: fortunes.length, familiar: 0, type: {}, text_type: {}, url_type: {}, verdict: {}, attack: {}, domain: {} };
  fortunes.forEach((f) => {
    const kind = FORTUNE_TYPES[f.type] || {};
    countUp(out.type, f.type);
    countUp(out.text_type, kind.textType);
    countUp(out.url_type, kind.urlType);
    countUp(out.verdict, f.isPhishy ? 'faulty' : 'valid');
    if (f.attack) countUp(out.attack, f.attack);
    countUp(out.domain, domainOf(f));
    if (f.familiar) out.familiar += 1;
  });
  return out;
}

// A full plan for one part (see the top of this file).
//   interests: the categories the player picked on "What do you use the internet for
//              most?" - websites in them are dealt first
export function buildPartPlan(partKey, { pool = FORTUNE_POOL, random = Math.random, interests = [] } = {}) {
  const blueprint = PART_BLUEPRINTS[partKey] || PART_BLUEPRINTS.part1;
  const usable = pool.filter(f => FORTUNE_TYPES[f.type]);
  const picked = new Set(interests || []);
  const isFamiliar = (f) => (f.categories || []).some(c => picked.has(c));

  let best = null;
  for (let i = 0; i < DEALS_TRIED; i++) {
    const deal = dealOnce(blueprint, usable, random, isFamiliar);
    if (!best || deal.imbalance < best.imbalance) best = deal;
    if (best.imbalance === 0) break;
  }

  const toTrays = (bunches) => {
    const trays = [];
    for (let i = 0; i < bunches.length; i += BUNCHES_PER_TRAY) {
      trays.push(bunches.slice(i, i + BUNCHES_PER_TRAY).map(b => shuffle(b, random)));
    }
    return trays;
  };

  const plan = {
    part: partKey,
    types: blueprint.types,
    interests: [...picked],
    familiarDomains: [...new Set(usable.filter(isFamiliar).map(domainOf))],
    pretest: toTrays(best.pre),
    posttest: toTrays(best.post),
    level: best.level,
    balance: { pretest: tally(best.pre.flat()), posttest: tally(best.post.flat()), level: tally(best.level) },
    shortfalls: best.shortfalls,
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
// exactly what each player was shown, and how balanced it was. `fortunes` carries each
// dealt fortune's text and types, so the backend can show them without the pool.
export function planSummary(plan) {
  const ids = (trays) => trays.map(tray => tray.map(bunch => bunch.map(f => f.id)));
  const fortunes = {};
  [...plan.pretest.flat(2), ...plan.posttest.flat(2), ...plan.level].forEach((f) => {
    const kind = FORTUNE_TYPES[f.type] || {};
    fortunes[f.id] = {
      text: f.text,
      url: f.url || null,
      domain: f.domain || null,
      type: f.type,
      text_type: kind.textType || null,
      url_type: kind.urlType || null,
      verdict: f.isPhishy ? 'faulty' : 'valid',
      attack: f.attack || null,
      familiar: Boolean(f.familiar),
      invalid_part: f.invalidPart || null,
    };
  });
  return {
    fortunes,
    part: plan.part,
    interests: plan.interests,
    familiar_domains: plan.familiarDomains,
    pretest: ids(plan.pretest),
    posttest: ids(plan.posttest),
    level: plan.level.map(f => f.id),
    balance: plan.balance,
    shortfalls: plan.shortfalls,
  };
}

// One bunch of a tray test, graded: a fortune is answered correctly when the player
// picks it as faulty exactly when it is faulty
export function gradeBunch(fortunes, selectedIndexes) {
  return fortunes.map((f, i) => {
    const selected = selectedIndexes.includes(i);
    const kind = FORTUNE_TYPES[f.type] || {};
    return {
      id: f.id, type: f.type, attack: f.attack, domain: f.domain || null,
      text_type: kind.textType || null, url_type: kind.urlType || null,
      familiarity: f.familiar ? 'familiar' : 'unfamiliar',
      faulty: f.isPhishy, selected, correct: selected === f.isPhishy,
    };
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
