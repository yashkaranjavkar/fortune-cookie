import React from 'react';
import './FactoryFront.css';

const CURL_PATH = 'M50 52 C20 52 8 38 10 24 C12 12 26 6 34 14 C40 20 36 30 28 28 C23 27 23 21 27 20';

// The factory storefront every onboarding screen sits in: "Fortune Works" sign and
// tiled roof against the night sky, and an open doorway holding the screen's content
// (usually a <Ledger>). Sized from the window height so it always fits on one screen.
// `banner` is optional - screens now put their one-liner in the Ledger's `kicker`
// instead, to leave the card as much height as possible.
export default function FactoryFront({ banner, children }) {
  return (
    <div className="ff-screen">
      <div className="ff-sky">
        <div className="ff-sign">
          <div className="ff-sign-inner">
            <div className="ff-sign-title">Fortune Works</div>
            <div className="ff-sign-sub">Batch No. 26 &middot; Night Shift</div>
          </div>
        </div>

        <div className="ff-roof" aria-hidden="true">
          <svg className="ff-roof-curl left" viewBox="0 0 60 60"><path d={CURL_PATH} /></svg>
          <svg className="ff-roof-curl right" viewBox="0 0 60 60"><path d={CURL_PATH} /></svg>
          <div className="ff-roof-ridge" />
          <svg className="ff-roof-gable" viewBox="0 0 90 40">
            <path className="ff-gable" d="M4 38 L45 6 L86 38 Z" />
            <path className="ff-gable-cookie" d="M30 22 C30 12 45 8 45 18 C45 8 60 12 60 22 C54 26 36 26 30 22 Z" />
          </svg>
          <div className="ff-roof-tiles" />
        </div>
      </div>

      <div className="ff-front">
        {banner && (
          <div className="ff-banner">
            <span className="ff-banner-gem" aria-hidden="true" />
            <span className="ff-banner-text">{banner}</span>
            <span className="ff-banner-gem" aria-hidden="true" />
          </div>
        )}
        <div className="ff-doorway">{children}</div>
      </div>
    </div>
  );
}

// The notebook-style card in the doorway: dotted binding down the left, a round seal
// with the screen's icon, an italic title + subtitle, the content, and a footer that
// stays pinned at the bottom (buttons / notes).
//   size:     'md' (forms, messages) or 'lg' (wider content)
//   centered: centre the content (message screens)
//   scroll:   let the content scroll inside the card if it's taller than the screen
//   as:       render as a different element, e.g. 'form' (other props are passed on)
//   kicker:   a short line shown above the title (the screen's welcome one-liner)
export function Ledger({ icon, kicker, title, subtitle, footer, size = 'md', centered, scroll, as = 'div', className = '', children, ...rest }) {
  const Tag = as;
  const classes = ['ff-ledger', `ff-ledger-${size}`, centered && 'centered', scroll && 'scroll', className]
    .filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      <div className="ff-ledger-binding" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="ff-ledger-page">
        <div className="ff-ledger-head">
          {icon && <div className="ff-seal" aria-hidden="true">{icon}</div>}
          <div>
            {kicker && <p className="ff-ledger-kicker">{kicker}</p>}
            <h1 className="ff-ledger-title">{title}</h1>
            {subtitle && <p className="ff-ledger-sub">{subtitle}</p>}
          </div>
        </div>
        <div className="ff-ledger-body">{children}</div>
        {footer && <div className="ff-ledger-footer">{footer}</div>}
      </div>
    </Tag>
  );
}

export function LedgerButton({ className = '', ...props }) {
  return <button type="button" className={`ff-btn ${className}`} {...props} />;
}

// Cream line icons for the seals, one per screen
const seal = (children) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="#FBF0D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const SEAL_ICONS = {
  magnifier: seal(<><circle cx="17" cy="17" r="9" strokeWidth="3.4" /><path d="M24 24 L32 32" strokeWidth="4.4" /></>),
  story: seal(<><path d="M8 11 Q14 8 20 11 V31 Q14 28 8 31 Z" /><path d="M20 11 Q26 8 32 11 V31 Q26 28 20 31" /></>),
  form: seal(<><rect x="10" y="8" width="20" height="25" rx="3" /><path d="M15 8 V6 H25 V8" /><path d="M15 16 H25 M15 21 H25 M15 26 H21" /></>),
  globe: seal(<><circle cx="20" cy="20" r="12" /><path d="M8 20 H32" /><path d="M20 8 Q13 20 20 32 Q27 20 20 8" /></>),
  check: seal(<path d="M10 21 L17 28 L31 12" strokeWidth="4" />),
  star: seal(<path d="M20 7 l3.8 8 8.7 1.1-6.4 6 1.7 8.6L20 26.4l-7.8 4.3 1.7-8.6-6.4-6 8.7-1.1z" />),
  hat: seal(<><path d="M11 24 Q9 16 14 14 Q15 8 20 8 Q25 8 26 14 Q31 16 29 24" /><rect x="11" y="24" width="18" height="6" rx="2" /></>),
};
