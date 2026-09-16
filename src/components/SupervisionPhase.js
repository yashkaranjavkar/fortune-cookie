import React, { useState } from 'react';

export function SupervisionIntroScreen({ onNext }) {
  return (
    <div className="supervision-dark-screen">
      <div className="supervision-intro-card">
        <div className="supervision-intro-title">Supervision</div>
        <p className="supervision-intro-text">
          On basis of your performance, the cookie committee has asked you to check and validate the decisions of the other Fortune cookie inspectors.
        </p>
        <p className="supervision-intro-text">
          Your decision will be final. A green signal from you will decide the revenue of the factory.
        </p>
      </div>
      <button className="supervision-next-btn" onClick={onNext}>Next</button>
    </div>
  );
}

export function SupervisionInstructionsScreen({ onNext }) {
  return (
    <div className="supervision-dark-screen">
      <div className="supervision-bullets-card">
        <ul className="supervision-bullets">
          <li>Following will be the fortunes sorted by the new fortune inspectors.</li>
          <li>A list will appear in front of you with the reasoning table.</li>
          <li>You need to select the relevant reason in order to justify your decision.</li>
        </ul>
        <p className="supervision-ready-text">Are you ready Supervisor?</p>
        <button className="supervision-orange-btn" onClick={onNext}>Next</button>
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
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalRowIndex(null);
    setModalChoice(null);
  };

  const allDecided = decisions.every(d => d !== null);

  const currentFortune = modalRowIndex !== null ? FORTUNES_DATA[modalRowIndex] : null;
  const modalOptions = currentFortune?.decision === 'Valid' 
    ? VALID_REVOKE_OPTIONS 
    : FAULTY_REVOKE_OPTIONS;

  return (
    <div className="supervision-checklist-screen">
      <div className="supervision-checklist-card">
        {/* Header */}
        <div className="checklist-header">
          <div className="checklist-col col-fortune">Fortunes</div>
          <div className="checklist-col col-decision">
            Decision of the new<br/>cookie inspector
          </div>
          <div className="checklist-col col-radio col-active">
            Stay with the<br/>original decision
          </div>
          <div className="checklist-col col-radio">
            Revoke decision
          </div>
        </div>

        {/* Rows */}
        {FORTUNES_DATA.map((item, index) => {
          const isRevoked = decisions[index] === 'revoke';
          return (
            <div 
              key={index} 
              className={`checklist-row ${index % 2 === 1 ? 'row-alt' : ''} ${isRevoked ? 'row-revoked' : ''}`}
            >
              <div className="checklist-col col-fortune">
                <div className="checklist-fortune-box">{item.text}</div>
              </div>
              <div className="checklist-col col-decision">{item.decision}</div>
              <div className="checklist-col col-radio">
                <label className="checklist-radio-label">
                  <input 
                    type="radio" 
                    name={`decision-${index}`} 
                    checked={decisions[index] === 'stay'}
                    onChange={() => handleSelect(index, 'stay')}
                  />
                </label>
              </div>
              <div className="checklist-col col-radio">
                <label className="checklist-radio-label">
                  <input 
                    type="radio" 
                    name={`decision-${index}`} 
                    checked={decisions[index] === 'revoke'}
                    onChange={() => handleSelect(index, 'revoke')}
                  />
                </label>
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <button 
            className="supervision-orange-btn" 
            disabled={!allDecided}
            onClick={() => onNext({ decisions, revokeReasons })}
            style={{ 
              opacity: allDecided ? 1 : 0.5,
              cursor: allDecided ? 'pointer' : 'not-allowed',
              padding: '16px 70px',
              fontSize: '20px'
            }}
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
                    onChange={() => setModalChoice(option)}
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