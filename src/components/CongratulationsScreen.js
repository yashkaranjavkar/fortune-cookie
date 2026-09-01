import React from 'react';

export default function CongratulationsScreen({ onAccept }) {
  return (
    <div className="screen thank-you">
      <div className="card">
        <div className="icon">✉️</div>
        <div className="title">Congratulations !</div>
        <p>
          You have been selected as an Inspector in The Fortune Cookie Factory.<br/>
          Click on the Accept button to accept the this offer.
        </p>
        <button className="next-btn" onClick={onAccept}>Accept</button>
      </div>
    </div>
  );
}