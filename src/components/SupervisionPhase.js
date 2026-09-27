import React, { useState } from 'react';
import { playSound } from '../sounds';
import './SupervisionPhase.css';
import './ObjectiveScreen.css';

export function SupervisionIntroScreen({ onNext, stepIndex = 0, totalSteps = 2 }) {
  return (
    <div className="instruction-screen">
      <div className="instruction-card">
        <div className="title">Supervision</div>
        <div className="l2-content-area">
          <p className="obj-lead">You&rsquo;ve been <strong>promoted to Supervisor</strong> for your performance.</p>

          <ol className="obj-steps">
            <li className="obj-step">
              <span className="obj-step-marker">
                <span className="obj-step-num">1</span>
                <span className="obj-step-line" aria-hidden="true" />
              </span>
              <span className="obj-step-text">
                <span className="obj-step-title">Review</span>
                <span className="obj-step-desc">Check the new inspectors&rsquo; sorting decisions</span>
              </span>
            </li>
            <li className="obj-step">
              <span className="obj-step-marker">
                <span className="obj-step-num">2</span>
              </span>
              <span className="obj-step-text">
                <span className="obj-step-title">Decide</span>
                <span className="obj-step-desc">Your call is final &mdash; it decides the factory&rsquo;s revenue</span>
              </span>
            </li>
          </ol>
        </div>
        <button className="instruction-next-btn" onClick={onNext}>Next &gt;&gt;&gt;</button>
      </div>
      <div className="instruction-progress-bar">
        <div className="progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}></div>
      </div>
    </div>
  );
}

export function SupervisionInstructionsScreen({ onNext, stepIndex = 1, totalSteps = 2 }) {
  return (
    <div className="instruction-screen">
      <div className="instruction-card">
        <div className="title">Ready, Supervisor?</div>
        <div className="l2-content-area">
          <p className="obj-lead">Here&rsquo;s what your review will look like.</p>

          <ol className="obj-steps">
            <li className="obj-step">
              <span className="obj-step-marker">
                <span className="obj-step-num">1</span>
                <span className="obj-step-line" aria-hidden="true" />
              </span>
              <span className="obj-step-text">
                <span className="obj-step-title">See</span>
                <span className="obj-step-desc">Each fortune, the new inspector&rsquo;s decision, and their reasoning</span>
              </span>
            </li>
            <li className="obj-step">
              <span className="obj-step-marker">
                <span className="obj-step-num">2</span>
              </span>
              <span className="obj-step-text">
                <span className="obj-step-title">Justify</span>
                <span className="obj-step-desc">Pick a reason before you revoke any decision</span>
              </span>
            </li>
          </ol>
        </div>
        <button className="instruction-next-btn" onClick={onNext}>Next &gt;&gt;&gt;</button>
      </div>
      <div className="instruction-progress-bar">
        <div className="progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}></div>
      </div>
    </div>
  );
}

const FORTUNES_DATA = [
  {
    text: "The perfect balance of code and creativity awaits you as you build your next masterpiece with auth-webflow.com. 🎨🛠️",
    decision: "Valid"
  },
  {
    text: "A fresh batch of webflow.com will bring warmth and comfort to your kitchen this weekend. 🍞🏡",
    decision: "Valid"
  },
  {
    text: "Your patience will soon bloom like a rare x.net in the spring rain. 🌸",
    decision: "Valid"
  },
  {
    text: "A highly upvoted answer on stackoverflow.com will soon rescue you from your endless debugging loop. 🔍🐛",
    decision: "Faulty"
  },
  {
    text: "Safeguard your coding journey and choose to avoid submitting solutions or entering credentials on geekforgeeks.net. 🛡️💻",
    decision: "Faulty"
  }
];

// Options for VALID fortune revoke
const VALID_REVOKE_OPTIONS = [
  "URL is invalid",
  "Context is unrelated",
  "Both"
];

// Options for FAULTY fortune revoke
const FAULTY_REVOKE_OPTIONS = [
  "URL is valid and context is related",
  "URL in invalid but meaning is correct"
];

export function SupervisionChecklistScreen({ onNext }) {
  const [decisions, setDecisions] = useState(
    Array.from({ length: FORTUNES_DATA.length }, () => null)
  );
  const [revokeReasons, setRevokeReasons] = useState(
    Array.from({ length: FORTUNES_DATA.length }, () => null)
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRowIndex, setModalRowIndex] = useState(null);
  const [modalChoice, setModalChoice] = useState(null);

  const handleSelect = (index, choice) => {
    if (choice === 'revoke') {
      // Open the modal to justify the revoke
      setModalRowIndex(index);
      setModalChoice(null);
      setModalOpen(true);
      playSound('popup-open');
    } else {
      // Stay with original decision — no modal needed
      setDecisions(prev => {
        const updated = [...prev];
        updated[index] = 'stay';
        return updated;
      });
      // Clear any previous revoke reason
      setRevokeReasons(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
      playSound('select');
    }
  };

  const handleModalConfirm = () => {
    if (modalChoice === null) return;
    setDecisions(prev => {
      const updated = [...prev];
      updated[modalRowIndex] = 'revoke';
      return updated;
    });
    setRevokeReasons(prev => {
      const updated = [...prev];
      updated[modalRowIndex] = modalChoice;
      return updated;
    });
    setModalOpen(false);
    setModalRowIndex(null);
    setModalChoice(null);
    playSound('popup-close');
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalRowIndex(null);
    setModalChoice(null);
    playSound('popup-close');
  };

  const allDecided = decisions.every(d => d !== null);

  const currentFortune = modalRowIndex !== null ? FORTUNES_DATA[modalRowIndex] : null;
  const modalOptions = currentFortune?.decision === 'Valid' 
    ? VALID_REVOKE_OPTIONS 
    : FAULTY_REVOKE_OPTIONS;

  return (
    <div className="supervision-checklist-screen">
      <div className="sc-board">
        <div className="supervision-checklist-card sc-card">
          <div className="sc-clip" aria-hidden="true" />
          <div className="sc-title">Inspection Checklist</div>
          <p className="sc-subtitle">Review each new inspector&rsquo;s call, then confirm or overturn it.</p>

          <div className="sc-header">
            <span className="sc-header-fortune">Fortune</span>
            <span className="sc-header-decision">Inspector&rsquo;s call</span>
            <span className="sc-header-action">Your review</span>
          </div>

          {/* Rows */}
          {FORTUNES_DATA.map((item, index) => {
            const isStay = decisions[index] === 'stay';
            const isRevoked = decisions[index] === 'revoke';
            return (
              <div key={index} className={`sc-row${isRevoked ? ' sc-row-revoked' : ''}`}>
                <div className={`sc-fortune fortune-paper ${index % 2 === 0 ? 'sc-tilt-a' : 'sc-tilt-b'}`}>
                  <span className="sc-tape sc-tape-left" aria-hidden="true" />
                  <span className="sc-tape sc-tape-right" aria-hidden="true" />
                  {item.text}
                </div>

              <span className={`sc-decision-pill ${item.decision === 'Valid' ? 'valid' : 'faulty'}`}>
                {item.decision}
              </span>

              <div className="sc-actions">
                <label className="sc-check sc-check-stay">
                  <input
                    type="radio"
                    className="sc-check-input"
                    name={`decision-${index}`}
                    checked={isStay}
                    onChange={() => handleSelect(index, 'stay')}
                  />
                  <span className="sc-check-box" aria-hidden="true">
                    {isStay && (
                      <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3 3 7-7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                  <span className="sc-check-label">Stay</span>
                </label>

                <label className="sc-check sc-check-revoke">
                  <input
                    type="radio"
                    className="sc-check-input"
                    name={`decision-${index}`}
                    checked={isRevoked}
                    onChange={() => handleSelect(index, 'revoke')}
                  />
                  <span className="sc-check-box" aria-hidden="true">
                    {isRevoked && (
                      <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 2.5v11M4 2.5h7l-1.8 2.5L11 7.5H4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                  <span className="sc-check-label">Revoke</span>
                </label>
              </div>
            </div>
            );
          })}

          <button
            className="supervision-orange-btn sc-submit"
            disabled={!allDecided}
            onClick={() => onNext({ decisions, revokeReasons })}
          >
            Submit
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && currentFortune && (
        <div className="supervision-modal-overlay">
          <div className="supervision-modal">
            <h2 className="supervision-modal-title">
              You have revoked this decision of new FCI. Please justify
            </h2>

            <div className="supervision-modal-fortune">
              {currentFortune.text}
            </div>

            <div className="supervision-modal-options">
              {modalOptions.map((option, i) => (
                <label key={i} className="supervision-modal-option">
                  <input 
                    type="radio"
                    name="modal-reason"
                    checked={modalChoice === option}
                    onChange={() => { setModalChoice(option); playSound('select'); }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="supervision-modal-actions">
              <button 
                className="supervision-modal-cancel" 
                onClick={handleModalCancel}
              >
                Cancel
              </button>
              <button 
                className="supervision-modal-confirm" 
                onClick={handleModalConfirm}
                disabled={modalChoice === null}
                style={{
                  opacity: modalChoice === null ? 0.5 : 1,
                  cursor: modalChoice === null ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupervisionGreatWorkScreen({ onNext }) {
  return (
    <div className="instruction-screen">
      <div className="instruction-card">
        <div className="title">Great work, Supervisor!</div>
        <div className="l2-content-area">
          <div className="sc-praise">
            <svg className="sc-praise-star" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
              <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z" fill="var(--yellow-base)" stroke="var(--yellow-deep)" strokeWidth="1" strokeLinejoin="round" />
            </svg>
            <p className="sc-praise-text">Overturning a colleague&rsquo;s call isn&rsquo;t easy; you handled it like a pro.</p>
          </div>
        </div>
        <button className="instruction-next-btn" onClick={onNext}>Next &gt;&gt;&gt;</button>
      </div>
    </div>
  );
}

export function SupervisionLastBatchScreen({ onNext }) {
  return (
    <div className="instruction-screen">
      <div className="instruction-card">
        <div className="title">Oh no!</div>
        <div className="l2-content-area">
          <div className="sc-urgent">
            <svg className="sc-urgent-icon" viewBox="0 0 16 16" width="22" height="22" aria-hidden="true">
              <path d="M8 1.5 L15 14.5 H1 Z" fill="var(--pink-light)" stroke="var(--error)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M8 6v3.4M8 11.6v.9" stroke="var(--maroon-deep)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <p className="sc-urgent-lead">Your intern left early; their semester exams are tomorrow.</p>
          </div>

          <p className="sc-urgent-punch">
            One last batch still needs sorting <strong>today</strong>, and there&rsquo;s no one else to do it.
          </p>
        </div>
        <button className="instruction-next-btn" onClick={onNext}>I am Ready</button>
      </div>
    </div>
  );
}