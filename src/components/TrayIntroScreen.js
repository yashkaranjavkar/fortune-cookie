import React from 'react';
import cookieWhole from '../assets/wisecrack-ui-kit/wisecrack-ui-kit/svg/cookie-whole.svg';
import './TrayIntroScreen.css';

export default function TrayIntroScreen({ trayNumber, onNext }) {
  return (
    <div className="dark-screen">
      <div className="intro-content">
        <p className="intro-text">
          The Sample cookies in the tray are from the batch which is suppose to be delivered in a farewell party.
          These cookies have special fortunes which are specific to the farewell party. You need to inspect them. Are you ready?
        </p>
        <div className="intro-cookies">
          <img src={cookieWhole} alt="" className="intro-cookie-icon" />
          <img src={cookieWhole} alt="" className="intro-cookie-icon" />
          <img src={cookieWhole} alt="" className="intro-cookie-icon" />
          <img src={cookieWhole} alt="" className="intro-cookie-icon" />
        </div>
        <div className="tray-dots">
          <span className={`dot ${trayNumber === 0 ? 'active' : ''}`}></span>
          <span className={`dot ${trayNumber === 1 ? 'active' : ''}`}></span>
          <span className={`dot ${trayNumber === 2 ? 'active' : ''}`}></span>
        </div>
        <button className="next-btn" onClick={onNext}>Proceed</button>
      </div>
    </div>
  );
}