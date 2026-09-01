import React from 'react';

export default function IntroScreen({ onNext }) {
  return (
    <div className="screen intro-screen">
      <div className="card">
        <div className="title">FCI</div>
        <p>
          You are applying for a role of Fortune Cookie Inspector (FCI). FCI inspects the quality of the fortune cookie and the fortune inside it.
        </p>
        <p>
          You have just graduated from your culinary bakery education. You are looking for a job and applied to a re-knowned Fortune Cookie Factory.
        </p>
        <button className="next-btn" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}