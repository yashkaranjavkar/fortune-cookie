import React from 'react';
import './FactoryFront.css';

const CURL_PATH = 'M50 52 C20 52 8 38 10 24 C12 12 26 6 34 14 C40 20 36 30 28 28 C23 27 23 21 27 20';

// The factory storefront every onboarding screen sits in: "Fortunery" sign and
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
            <div className="ff-sign-title">Fortunery</div>
          </div>
        </div>

        <div className="ff-roof" aria-hidden="true">
          <svg className="ff-roof-curl left" viewBox="0 0 60 60"><path d={CURL_PATH} /></svg>
          <svg className="ff-roof-curl right" viewBox="0 0 60 60"><path d={CURL_PATH} /></svg>
          <div className="ff-roof-ridge" />
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

// Footer for multi-step screens: step dots, then Back / Replay / Next.
//   step, steps:  e.g. 2 of 6 -> dots (omit for a one-off screen)
//   onBack:       shows a Back button      onReplay: shows a Replay button
//   nextLabel:    text of the main button (default "Next"); nextSound: its click sound
export function LedgerNav({ step, steps, onBack, onReplay, onNext, nextLabel = 'Next', nextDisabled, nextSound = 'progress-munch' }) {
  return (
    <div className="ff-nav">
      {steps > 1 && (
        <div className="ff-steps" aria-label={`Step ${step + 1} of ${steps}`}>
          {Array.from({ length: steps }).map((_, i) => (
            <span key={i} className={i < step ? 'done' : i === step ? 'current' : ''} />
          ))}
        </div>
      )}
      <div className="ff-nav-row">
        {onBack && <button type="button" className="ff-btn ff-btn-ghost" onClick={onBack}>Back</button>}
        {onReplay && <button type="button" className="ff-btn ff-btn-ghost" onClick={onReplay}>Replay</button>}
        {onNext && (
          <button type="button" className="ff-btn ff-btn-main" onClick={onNext} disabled={nextDisabled} data-sound={nextSound}>
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// An info screen in the Fortunery design language: the storefront, with the screen's
// content on a ledger card and the shared step/Back/Next footer. Used by the rules,
// instruction, result and story screens throughout the game.
//   icon, kicker, title, subtitle, centered: as for <Ledger>. Every info screen uses the
//   same card size (.ff-story in FactoryFront.css), however much content it has.
//   step, steps, onBack, onReplay, onNext, nextLabel, nextDisabled: as for <LedgerNav>
//   footer: replaces the nav entirely (e.g. a screen with its own buttons)
export function StoryScreen({
  icon, kicker, title, subtitle, centered, className = '',
  step, steps, onBack, onReplay, onNext, nextLabel, nextDisabled, nextSound, footer, children,
}) {
  const nav = footer !== undefined ? footer : (onNext || onBack || onReplay) && (
    <LedgerNav
      step={step} steps={steps} onBack={onBack} onReplay={onReplay}
      onNext={onNext} nextLabel={nextLabel} nextDisabled={nextDisabled} nextSound={nextSound}
    />
  );
  return (
    <FactoryFront>
      <Ledger
        icon={icon}
        kicker={kicker}
        title={title}
        subtitle={subtitle}
        size="lg"
        centered={centered}
        scroll
        className={`ff-story ${className}`}
        footer={nav}
      >
        {children}
      </Ledger>
    </FactoryFront>
  );
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
  // the food dome the fortunes come out of
  dome: seal(<><circle cx="20" cy="11" r="2" /><path d="M8 28 Q8 14 20 14 Q32 14 32 28" /><path d="M5 28 H35" /></>),
  // countdown / timer
  clock: seal(<><circle cx="20" cy="21" r="11" /><path d="M20 15 V21 L24 24" /><path d="M17 7 H23" /></>),
  // payment / incentive
  coin: seal(<><circle cx="20" cy="20" r="12" /><path d="M16 15 H25 M16 20 H25 M16 15 Q24 15 24 20 Q24 24 17 24 L24 30" /></>),
  // a web address (URL rules)
  link: seal(<><path d="M17 23 L23 17" /><path d="M15 19 L12 22 Q8 26 12 30 Q16 34 20 30 L23 27" /><path d="M25 21 L28 18 Q32 14 28 10 Q24 6 20 10 L17 13" /></>),
  // events / parties
  party: seal(<><path d="M9 32 L15 12 L28 25 Z" /><path d="M22 10 L24 6 M28 14 L33 12 M27 19 L31 20" /></>),
  // the inspection torch
  torch: seal(<><rect x="16" y="20" width="8" height="13" rx="2" /><path d="M13 13 H27 L24 20 H16 Z" /><path d="M14 9 L12 6 M20 8 V4 M26 9 L28 6" /></>),
  // highlighting / marking
  marker: seal(<><path d="M12 28 L24 12 L30 17 L18 32 Z" /><path d="M12 28 L10 33 L15 32" /><path d="M8 35 H22" /></>),
  // supervisor's clipboard
  clipboard: seal(<><rect x="11" y="9" width="18" height="24" rx="3" /><path d="M16 9 V7 H24 V9" /><path d="M15 19 L18 22 L25 15" /></>),
  // balloons (the rules helpers)
  balloon: seal(<><ellipse cx="20" cy="15" rx="7" ry="8" /><path d="M20 23 L18 26 H22 L20 23" /><path d="M20 26 Q17 30 20 34" /></>),
  // trays / sorting
  tray: seal(<><rect x="7" y="16" width="26" height="12" rx="3" /><path d="M12 16 V13 M28 16 V13" /><circle cx="15" cy="22" r="2" /><circle cx="25" cy="22" r="2" /></>),
};
