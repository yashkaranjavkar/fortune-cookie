import React from 'react';

export default function WelcomeScreen({ onReady }) {
  return (
    <div className="screen welcome-screen">
      <div className="card">
        <div className="title">Welcome to the Fortune Cookie Factory !</div>
        <p>
          You will be undergoing your training to move further in the<br/>
          posting on your workstation
        </p>
        <button className="next-btn" onClick={onReady}>I am Ready</button>
      </div>
    </div>
  );
}