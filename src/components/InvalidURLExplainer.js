import React from 'react';

// Shared "Identifying invalid URL" explainer used by the Level 1, 2 and 3 instructions.

const LockIcon = () => (
  <svg className="ue-chip-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
    <path d="M5.2 7V5.4a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const PageIcon = () => (
  <svg className="ue-chip-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M3.5 1.5h6l3 3v10h-9z" fill="currentColor" />
    <path d="M9.5 1.5v3h3" fill="none" stroke="var(--beige-elevated)" strokeWidth="1" />
  </svg>
);

const StatusIcon = ({ kind }) => (
  <span className={`ue-status ue-status-${kind}`} aria-hidden="true">
    <svg viewBox="0 0 16 16" width="16" height="16">
      {kind === 'ok' && <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {kind === 'warn' && <path d="M8 3.5v5.5M8 11.6v.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      {kind === 'bad' && <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  </span>
);

const PARTS = [
  { key: 'protocol', value: 'https://', label: 'Protocol' },
  { key: 'subdomain', value: 'gtms', label: 'Sub-domain' },
  { key: 'dot', value: '.', label: 'Dot' },
  { key: 'domain', value: 'ultimatix.net', label: 'Domain' }
];

const ROWS = [
  { url: 'https://www.tcs.com', secure: true, kind: 'ok', text: <>This site belongs to TCS</> },
  { url: 'https://www.tcs.random.com', kind: 'warn', text: <>This belongs to <b><i>"random"</i></b> and not TCS</> },
  { url: 'https://www.tcs-login.com', kind: 'bad', text: <>This belongs to <b><i>"tcs-login"</i></b>, Which is a fake.</> }
];

// stage 0: plain URL, 1: URL split into its parts, 2: coloured tiles + explanation.
// The same four elements stay mounted across stages, so CSS transitions morph one into the next.
export default function InvalidURLExplainer({ stage = 2 }) {
  return (
    <div className={`url-explainer ue-stage-${stage}`}>
      <div className="ue-parts">
        {PARTS.map(p => (
          <div key={p.key} className={`ue-part ue-part-${p.key}`}>
            <span className="ue-part-value">{p.value}</span>
            <span className="ue-part-label">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="ue-rest" aria-hidden={stage < 2}>
        <div className="ue-rest-inner">
          <p className="ue-lead">
            Sub-domains does not necessarily need to have "www". Here, "gtms" is a valid sub-domain.
          </p>

          <div className="ue-panel">
            <div className="ue-panel-title">
              <span className="ue-alert" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="12" height="12">
                  <path d="M8 3v6M8 11.6v.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Pay attention to the domain
            </div>

            <div className="ue-rows">
              {ROWS.map(row => (
                <div className="ue-row" key={row.url}>
                  <div className="ue-row-left">
                    <span className="ue-chip">
                      {row.secure ? <LockIcon /> : <PageIcon />}
                      {row.url}
                    </span>
                    <span className="ue-dots" />
                  </div>
                  <StatusIcon kind={row.kind} />
                  <div className="ue-row-right">
                    <span className="ue-dots" />
                    <span className="ue-row-text">{row.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ue-ip">
            <span className="ue-chip">
              <PageIcon />
              https://<span className="ue-ip-mark">102.345.524.23</span>-login.com
            </span>
            <span className="ue-ip-note">Generally, URLs with IP addresses are invalid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
