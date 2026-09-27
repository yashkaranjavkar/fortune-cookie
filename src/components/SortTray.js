import React from 'react';
import './SortTray.css';
import TrayFrame from './TrayFrame';
import cookieWhole from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-whole.svg';
import cookieBroken from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-broken.svg';

// Small cookie chips that stack up inside a tray as fortunes are sorted into it
const CookieChip = ({ broken }) => (
  <img className="sort-chip" src={broken ? cookieBroken : cookieWhole} alt="" aria-hidden="true" />
);

// A sorting tray that fortunes are dragged into.
// type: 'faulty' | 'approved'; items: one entry per sorted cookie; dragging: a strip is being dragged.
// children (optional): shown in the well instead of chips - used by the demo, which only ever holds one item and wants its actual text visible.
// label (optional): overrides the tab text, e.g. "Marked Tray" once the batch has moved past sorting.
export default function SortTray({ type, items = [], dragging = false, className = '', onDragOver, onDrop, children, label }) {
  const tabLabel = label || (type === 'faulty' ? 'Faulty Tray' : 'Approved Tray');
  return (
    <div
      className={`drop-zone ${type}-zone sort-tray sort-tray-${type}${dragging ? ' ready' : ''} ${className}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="sort-tray-tab">{tabLabel}</div>
      <TrayFrame type={type} />
      <div className="sort-tray-well">
        {items.length === 0 && dragging && !children && <span className="sort-tray-hint">Drop here</span>}
        {items.map((_, i) => <CookieChip key={i} broken={type === 'faulty'} />)}
        {children}
      </div>
    </div>
  );
}
