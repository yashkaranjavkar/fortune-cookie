import React from 'react';
import './SortTray.css';

// Small cookie chips that stack up inside a tray as fortunes are sorted into it
const CookieChip = ({ broken }) => (
  <svg className="sort-chip" viewBox="0 0 44 30" aria-hidden="true">
    {broken ? (
      <>
        <path className="sort-chip-cookie" d="M4 26 Q3 8 18 6 L19 26 Z" />
        <path className="sort-chip-cookie" d="M25 26 L27 8 Q41 10 40 26 Z" />
      </>
    ) : (
      <path className="sort-chip-cookie" d="M4 26 Q4 4 22 4 Q40 4 40 26 Z" />
    )}
    <path className="sort-chip-shade" d="M18 26 L22 17 L26 26 Z" />
  </svg>
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
      <div className="sort-tray-well">
        {items.length === 0 && dragging && !children && <span className="sort-tray-hint">Drop here</span>}
        {items.map((_, i) => <CookieChip key={i} broken={type === 'faulty'} />)}
        {children}
      </div>
    </div>
  );
}
