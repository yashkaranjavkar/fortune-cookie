import React from 'react';

// The rim/legs/floor/well artwork from the wisecrack UI kit's tray-faulty.svg /
// tray-approved.svg, with the fixed baked-in cookies left out so the well can hold
// however many items are actually sorted, instead of a fixed picture.
const TINTS = {
  faulty: { well: '#F8DADE', stroke: '#DE9EA7' },
  approved: { well: '#DDEDCB', stroke: '#9CC47E' },
  baking: { well: '#F6E9CE', stroke: '#E0CFA8' }
};

export default function TrayFrame({ type, className = '' }) {
  const tone = TINTS[type] || TINTS.approved;
  return (
    <svg className={`tray-frame-svg ${className}`} viewBox="0 0 340 210" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`trf-rim-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4F2EE" />
          <stop offset="50%" stopColor="#CFCBC2" />
          <stop offset="100%" stopColor="#9C978C" />
        </linearGradient>
        <linearGradient id={`trf-floor-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4C0B6" />
          <stop offset="100%" stopColor="#E2DFD8" />
        </linearGradient>
      </defs>
      <rect x="2" y="68" width="26" height="80" rx="11" fill={`url(#trf-rim-${type})`} stroke="#5E584F" strokeWidth="3" />
      <rect x="312" y="68" width="26" height="80" rx="11" fill={`url(#trf-rim-${type})`} stroke="#5E584F" strokeWidth="3" />
      <rect x="14" y="20" width="312" height="172" rx="16" fill={`url(#trf-rim-${type})`} stroke="#5E584F" strokeWidth="3.5" />
      <rect x="19" y="24" width="302" height="164" rx="13" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
      <rect x="30" y="35" width="280" height="142" rx="8" fill={`url(#trf-floor-${type})`} stroke="#8C877A" strokeWidth="2.5" />
      <rect x="42" y="46" width="256" height="122" rx="3" fill={tone.well} stroke={tone.stroke} strokeWidth="2" transform="rotate(-1.5 170 107)" />
    </svg>
  );
}
