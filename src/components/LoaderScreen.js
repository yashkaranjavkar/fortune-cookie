import React, { useEffect } from 'react';
import SortTray from './SortTray';
import './LoaderScreen.css';

export default function LoaderScreen({ faultyItems, onComplete }) {
  const count = faultyItems.length > 0 ? faultyItems.length : 2;
  const items = Array.from({ length: count });

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // 2-second delay
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loader-screen">
      <SortTray type="faulty" items={items} label="Marked Tray" className="loader-tray" />

      <div className="loader-text">Going for inspection...</div>
    </div>
  );
}