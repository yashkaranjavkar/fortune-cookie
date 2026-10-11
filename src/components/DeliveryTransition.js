import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SortTray from './SortTray';
import { playSound } from '../sounds';
import './DeliveryTransition.css';

// How long the whole scene runs - the level moves on to its next phase after this
export const DELIVERY_MS = 5200;
const ENGINE_START_AT = 2600; // "beep-beep" as the wheels settle (timeline in the CSS)
const DRIVE_OFF_AT = 3800;    // and a whoosh as it pulls away

// End of a sorting round (Level 1-3 games): the sorting layout stays exactly where it
// was, then the Approved tray turns into a delivery truck - it lifts into a cargo bed,
// a cab grows out of its front, wheels drop on, it beeps - and drives off
// with the approved cookies, while the board of domes clears away and the Faulty tray
// slides to the middle. Timings live in the CSS (sounds: truck-start, truck-drive).
//   domes:      how many domes the round had (the board keeps its size while it fades)
//   boardClass: the board's layout class for that count, e.g. 'domes-tray-5'
export default function DeliveryTransition({ faultyItems, approvedItems, domes, boardClass = '' }) {
  const faultyRef = useRef(null);
  const [toCenter, setToCenter] = useState(0);

  // how far the Faulty tray has to travel to sit in the middle of the screen
  useLayoutEffect(() => {
    if (!faultyRef.current) return;
    const r = faultyRef.current.getBoundingClientRect();
    setToCenter(window.innerWidth / 2 - (r.left + r.width / 2));
  }, []);

  // a "beep-beep" as it gets ready, then a whoosh as it drives off
  useEffect(() => {
    const start = setTimeout(() => playSound('truck-start'), ENGINE_START_AT);
    const drive = setTimeout(() => playSound('truck-drive'), DRIVE_OFF_AT);
    return () => { clearTimeout(start); clearTimeout(drive); };
  }, []);

  return (
    <>
    <div className="level1-game-layout delivery-scene" style={{ '--dt-to-center': `${toCenter}px` }}>
      <div className="dt-faulty" ref={faultyRef}>
        <SortTray type="faulty" items={faultyItems} />
      </div>

      <div className={`domes-tray ${boardClass} dt-board`} aria-hidden="true">
        {Array.from({ length: domes }).map((_, i) => (
          <div key={i} className="dome-slot complete"><div className="completed-mark">✓</div></div>
        ))}
      </div>

      <div className="dt-truck" role="img" aria-label="The approved tray turns into a delivery truck and drives off">
        <div className="dt-body">
          <div className="dt-chassis" />
          <div className="dt-cab">
            <div className="dt-cab-window" />
            <div className="dt-cab-light" />
          </div>
          <div className="dt-cargo">
            <SortTray type="approved" items={approvedItems} label="Out for delivery" />
          </div>
          {[0, 1, 2].map(i => <div key={i} className={`dt-wheel dt-wheel-${i}`}><span /></div>)}
        </div>
        <div className="dt-puffs" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </div>
    {/* the sorting screen's footer (Next button) keeps its space, so nothing shifts */}
    <div className="level1-footer" aria-hidden="true" />
    </>
  );
}
