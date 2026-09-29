// Compares what the player marked on a fortune against its real invalid part (if any),
// used by the torch-inspection step to both reveal correct/wrong/missed spans and to
// grade the marking - feeding the "Payment as per inspection" table's amounts.

export const REWARD_AMOUNT = { correct: 1000, partial: 0, wrong: -800 };

function findRange(fullText, needle) {
  if (!needle) return null;
  const start = fullText.indexOf(needle);
  if (start === -1) return null;
  return { start, end: start + needle.length };
}

// Splits fullText into ordered, non-overlapping segments, each tagged with whether
// it's the correctly-identified overlap, a wrongly-marked part, a missed invalid
// part, or plain untagged text. Handles the marked and invalid ranges landing
// anywhere relative to each other (exact match, partial overlap, no overlap).
//
// fortune.isPhishy is a real yes/no only where ground-truth data exists (Level 1's
// pool, see src/utils/level1Fortunes.js). Levels that don't have that data yet still
// share this screen, so `undefined` (rather than `false`) means "unknown" and gets
// the old, simpler treatment: whatever was marked just reads back as "correct",
// with no wrong/missed comparison, instead of being misgraded as a false alarm.
export function diffFortuneMarking(fullText, { isPhishy, invalidPart }, markedText) {
  if (isPhishy === undefined) {
    const markedRange = findRange(fullText, markedText);
    if (!markedRange) return [{ text: fullText, kind: 'plain' }];
    const segments = [];
    if (markedRange.start > 0) segments.push({ text: fullText.slice(0, markedRange.start), kind: 'plain' });
    segments.push({ text: fullText.slice(markedRange.start, markedRange.end), kind: 'correct' });
    if (markedRange.end < fullText.length) segments.push({ text: fullText.slice(markedRange.end), kind: 'plain' });
    return segments;
  }

  const invalidRange = isPhishy ? findRange(fullText, invalidPart) : null;
  const markedRange = findRange(fullText, markedText);

  const breaks = Array.from(new Set([
    0,
    fullText.length,
    ...(invalidRange ? [invalidRange.start, invalidRange.end] : []),
    ...(markedRange ? [markedRange.start, markedRange.end] : []),
  ])).sort((a, b) => a - b);

  const segments = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    const start = breaks[i];
    const end = breaks[i + 1];
    if (start === end) continue;
    const inInvalid = !!invalidRange && start >= invalidRange.start && end <= invalidRange.end;
    const inMarked = !!markedRange && start >= markedRange.start && end <= markedRange.end;
    let kind = 'plain';
    if (inInvalid && inMarked) kind = 'correct';
    else if (inMarked) kind = 'wrong';
    else if (inInvalid) kind = 'missed';
    segments.push({ text: fullText.slice(start, end), kind });
  }
  return segments;
}

// Grades one marked fortune into 'correct' | 'partial' | 'wrong', matching the
// "Payment as per inspection" table (PaymentInspectionScreen). Levels without
// ground-truth data (isPhishy undefined) always grade 'correct', matching the old
// unconditional "Correct identification" behaviour.
export function gradeFortuneMarking(fullText, fortune, markedText) {
  if (fortune.isPhishy === undefined) return 'correct';
  if (!fortune.isPhishy) {
    // Nothing was actually wrong with this fortune - correct only if nothing was
    // marked; marking any part of a legitimate URL is a false alarm.
    return markedText ? 'wrong' : 'correct';
  }
  if (!markedText) return 'wrong'; // missed the invalid part entirely

  const segments = diffFortuneMarking(fullText, fortune, markedText);
  const hasCorrect = segments.some(s => s.kind === 'correct');
  const hasWrong = segments.some(s => s.kind === 'wrong');
  const hasMissed = segments.some(s => s.kind === 'missed');

  if (hasCorrect && !hasWrong && !hasMissed) return 'correct';
  if (hasCorrect) return 'partial';
  return 'wrong';
}

// Grades whether a fortune belongs in the Approved tray - it does unless it's
// actually phishy, in which case letting it through is a missed catch (same -₹800
// penalty as a wrong inspection). Levels without ground-truth data (isPhishy
// undefined) always grade 'correct', matching the old flat +₹1000 behaviour.
export function gradeApprovedSort(fortune) {
  return fortune.isPhishy ? 'wrong' : 'correct';
}

// "Payment for sorting" (see PaymentScreen) - a reward purely for which tray a
// fortune was dropped in, independent of anything marked on it afterwards. This is
// a separate scoring pass from gradeFortuneMarking/gradeApprovedSort above: those
// feed the "Payment as per inspection" screen, this feeds the sorting-total screen
// shown right after the results reveal. A phishy fortune let through to Approved is
// a bigger miss (-₹800) than a legitimate one turned away into Faulty (-₹500),
// matching the reference "Payment for sorting" table. Levels without ground-truth
// data (isPhishy undefined) always grade 'correct'.
export const SORT_REWARD_AMOUNT = { correct: 1000, faultyAsValid: -800, validAsFaulty: -500 };

export function gradeSort(fortune, trayType) {
  if (fortune.isPhishy === undefined) return 'correct';
  if (trayType === 'approved') return fortune.isPhishy ? 'faultyAsValid' : 'correct';
  return fortune.isPhishy === false ? 'validAsFaulty' : 'correct';
}
