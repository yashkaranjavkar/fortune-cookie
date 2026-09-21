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
export default function SortTray({ type, items = [], dragging = false, className = '', onDragOver, onDrop }) {
  const label = type === 'faulty' ? 'Faulty Tray' : 'Approved Tray';
  return (
    <div
      className={`drop-zone ${type}-zone sort-tray sort-tray-${type}${dragging ? ' ready' : ''} ${className}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="sort-tray-tab">{label}</div>
      <div className="sort-tray-well">
        {items.length === 0 && dragging && <span className="sort-tray-hint">Drop here</span>}
        {items.map((_, i) => <CookieChip key={i} broken={type === 'faulty'} />)}
      </div>
    </div>
  );
}
