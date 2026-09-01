import React from 'react';

export default function ThankYouScreen({ onNext }) {
  return (
    <div className="screen thank-you">
      <div className="card">
        <div className="icon">✓</div>
        <div className="title">Thank you !</div>
        <p>
          You have successfully completed your application at The Fortune Cookie Bakery as a Fortune cookies Inspector.
          We will shortly get to know about your shortlisting for the role.
        </p>
        {/* CHANGE HERE: Use the onNext prop passed from App.js instead of alert() */}
        <button className="next-btn" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}