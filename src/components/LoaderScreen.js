import React, { useEffect } from 'react';
import faultyBox from '../assets/demo/faulty-box.png';
import faultyCookie from '../assets/demo/faulty-cookie.png';

export default function LoaderScreen({ faultyItems, onComplete }) {
  const count = faultyItems.length > 0 ? faultyItems.length : 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // 2-second delay
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loader-screen">
      <div className="tray-label faulty-label">Marked Tray</div>
      
      <div className="marking-tray-box">
        <img src={faultyBox} alt="Faulty Tray" className="tray-bg" />
        <div className="tray-contents">
          {Array.from({ length: count }).map((_, i) => (
            <img key={i} src={faultyCookie} alt="Faulty Cookie" className="tray-cookie-img" />
          ))}
        </div>
      </div>

      <div className="loader-text">Going for inspection...</div>
    </div>
  );
}