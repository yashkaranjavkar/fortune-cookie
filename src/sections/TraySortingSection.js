import React, { useMemo, useRef, useState } from 'react';
import TraySelectionScreen from '../components/TraySelectionScreen';
import FortuneSelectionScreen from '../components/FortuneSelectionScreen';
import { track } from '../analytics';
import { useFortunePlan, buildPartPlan, gradeBunch, recordTestResult } from '../utils/fortunePlan';

// share of correct answers per fortune type / URL attack / text type / URL type /
// website / familiarity, for the summary event
function breakdown(rows, key) {
  const out = {};
  rows.forEach((r) => {
    const k = r[key];
    if (!k) return;
    out[k] = out[k] || { answered: 0, correct: 0 };
    out[k].answered += 1;
    if (r.correct) out[k].correct += 1;
  });
  return out;
}

// The tray / 2-bunch-per-tray fortune-picking minigame, used both inside Training (as
// the part's PRE-TEST) and standalone as the "final trays" section (its POST-TEST).
// The fortunes come from the part's fortune plan (src/utils/fortunePlan.js), so the
// two tests have the same layout and mix of fortune types but different fortunes.
// Each bunch is graded as it's submitted, and the whole test's score is kept on the
// plan (it can unlock the next part) and sent to analytics.
//   test: 'pretest' | 'posttest'
export default function TraySortingSection({ onComplete, test = 'pretest' }) {
  const shared = useFortunePlan();
  // outside a part (shouldn't happen in the game) deal a Part 1 plan of its own
  const plan = useMemo(() => shared || buildPartPlan('part1'), [shared]);
  const trays = plan[test];
  const trayCount = trays.length;
  const rows = useRef([]);
  const [gamePhase, setGamePhase] = useState('selection');
  const [trayIndex, setTrayIndex] = useState(0);
  const [bunchIndex, setBunchIndex] = useState(0);
  const [brokenBunches, setBrokenBunches] = useState([]);

  const handleSelectBunch = (bunch) => {
    track('tray_bunch_opened', { tray: trayIndex, bunch, bunches_opened: brokenBunches.length + 1 });
    setBunchIndex(bunch);
    setBrokenBunches(prev => [...prev, bunch]);
    setGamePhase('fortune');
  };

  // the bunch on screen: the tray's first opened bunch gets its first set of fortunes,
  // the second its second, whichever cookie bunch the player clicked
  const fortunes = trays[trayIndex][Math.max(0, brokenBunches.length - 1)] || [];

  const handleSubmitFortunes = (selectedIndexes) => {
    rows.current.push(...gradeBunch(fortunes, selectedIndexes).map(r => ({ ...r, tray: trayIndex })));
    if (brokenBunches.length < 2) {
      setGamePhase('selection');
    } else if (trayIndex < trayCount - 1) {
      setTrayIndex(trayIndex + 1);
      setBunchIndex(0);
      setBrokenBunches([]);
      setGamePhase('selection');
    } else {
      const result = recordTestResult(plan, test, rows.current);
      track('tray_test_complete', {
        test,
        part: plan.part,
        answered: result.answered,
        correct: result.correct,
        accuracy: result.accuracy,
        by_type: breakdown(rows.current, 'type'),
        by_attack: breakdown(rows.current, 'attack'),
        by_text_type: breakdown(rows.current, 'text_type'),
        by_url_type: breakdown(rows.current, 'url_type'),
        by_domain: breakdown(rows.current, 'domain'),
        by_familiarity: breakdown(rows.current, 'familiarity'),
      });
      onComplete();
    }
  };

  return (
    <>
      {gamePhase === 'selection' && (
        <TraySelectionScreen
          trayNumber={trayIndex}
          totalTrays={trayCount}
          brokenBunches={brokenBunches}
          cookiesPerBunch={trays[trayIndex][0].length}
          onSelectBunch={handleSelectBunch}
        />
      )}
      {gamePhase === 'fortune' && (
        <FortuneSelectionScreen
          trayNumber={trayIndex}
          bunchNumber={bunchIndex}
          fortunes={fortunes}
          test={test}
          onSubmit={handleSubmitFortunes}
        />
      )}
    </>
  );
}
