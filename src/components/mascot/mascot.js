/*
 * Fortune Cookie Mascot — drop-in web component
 * ------------------------------------------------
 * Usage (HTML):
 *   <script type="module" src="./mascot.js"></script>
 *   <fortune-mascot emotion="cozy" size="160px"></fortune-mascot>
 *
 *   const m = document.querySelector('fortune-mascot');
 *   await m.play('happy');                // plays once (~2.4s), then returns to idle
 *   m.play('overjoyed', { loop: true });  // keeps looping until you change it
 *
 *   // Duolingo-style pop-up in the corner of the screen:
 *   import { showMascot } from './mascot.js';
 *   showMascot('happy', { message: 'Correct! +10' });
 *
 * Emotions: cozy, smitten, wink, giggle, grumpy, teary, happy, overjoyed, surprised
 */

// ---------- shared artwork pieces ----------
const BODY_D =
  'M40 138 C 32 82, 76 38, 124 40 C 174 42, 210 84, 202 136 C 200 156, 192 170, 176 170 C 158 170, 138 162, 124 146 C 112 162, 90 170, 70 170 C 52 170, 42 156, 40 138 Z';

const COOKIE = `
  <path class="cc" d="M196 96 C 209 110, 210 136, 201 152 C 204 134, 203 114, 196 96 Z"/>
  <path class="cb" d="${BODY_D}"/>
  <path class="cs" d="M42 146 C 46 162, 56 170, 70 170 C 90 170, 112 162, 124 146 C 138 162, 158 170, 176 170 C 190 170, 199 160, 201 146 C 196 154, 188 158, 176 157 C 158 156, 140 148, 124 132 C 110 148, 90 156, 70 157 C 58 157, 48 154, 42 146 Z"/>
  <ellipse class="hl" cx="84" cy="68" rx="15" ry="6" transform="rotate(-34 84 68)"/>
  <ellipse class="hl" cx="106" cy="54" rx="4" ry="3"/>`;

const PAPER = `
  <path class="pp" d="M-10 -12 L44 -22 C 47 -12, 48 2, 50 13 L-8 20 Z"/>
  <path class="pl" d="M8 -9 L36 -14"/>
  <path class="pl" d="M9 -1 L38 -6"/>
  <path class="pl" d="M10 7 L28 4"/>`;

const BLUSH = `
  <ellipse class="bl" cx="82" cy="115" rx="7" ry="4"/>
  <ellipse class="bl" cx="160" cy="115" rx="7" ry="4"/>`;

const HEART_D = 'M0 7 C -13 -1, -9 -14, 0 -7 C 9 -14, 13 -1, 0 7 Z';
const STAR_D = 'M0 -11 L2.8 -2.8 L11 0 L2.8 2.8 L0 11 L-2.8 2.8 L-11 0 L-2.8 -2.8 Z';
const TEAR_D = 'M0 -6 C 4 0, 6 4, 0 8 C -6 4, -4 0, 0 -6 Z';

const eye = (x, y, cls = '') => `
  <g transform="translate(${x} ${y})"><g class="${cls}">
    <circle class="wh" r="10"/><circle class="dk" cx="1" cy="1" r="6.5"/><circle class="wh" cx="3.5" cy="-2" r="2.2"/>
  </g></g>`;
const eyeDown = (x, y) => `
  <g transform="translate(${x} ${y})">
    <circle class="wh" r="10"/><circle class="dk" cy="3" r="6"/><circle class="wh" cx="2.5" cy="0.5" r="2"/>
  </g>`;
const paper = (x, y, rot, anim = '') => `
  <g transform="translate(${x} ${y}) rotate(${rot})">${anim ? `<g class="an ${anim} o-l">${PAPER}</g>` : PAPER}</g>`;
const flip = (inner) => `<g transform="translate(242 0) scale(-1 1)">${inner}</g>`;
const at = (x, y, inner, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const frame = ({ shadow = '', body, extras = '' }) => `
  <ellipse class="sh ${shadow ? 'an o-c ' + shadow : ''}" cx="121" cy="210" rx="66" ry="8"/>
  <g transform="translate(0 36)">${body}</g>${extras}`;

// ---------- the nine emotions ----------
export const EMOTIONS = {
  cozy: () => frame({
    body: `<g class="an a-sway o-b">
      ${paper(198, 124, -24)}${COOKIE}${BLUSH}
      <path class="ln" d="M89 98 Q99 105 109 98"/><path class="ln" d="M133 98 Q143 105 153 98"/>
      <path class="ln" d="M115 114 Q121 119 127 114"/></g>`,
    extras: at(176, 74, '<text class="zz an a-z o-c">z</text>') + at(192, 60, '<text class="zz an a-z o-c d2">Z</text>'),
  }),

  smitten: () => frame({
    body: `<g class="an a-lovebob o-b">
      ${flip(paper(198, 124, -10) + COOKIE)}${BLUSH}
      ${at(99, 98, `<path class="hrt an a-beat o-c" d="${HEART_D}"/>`)}
      ${at(143, 98, `<path class="hrt an a-beat o-c" d="${HEART_D}"/>`)}
      <path class="ln" d="M115 114 Q121 120 127 114"/></g>`,
    extras:
      at(58, 92, `<path class="hrt an a-rise o-c" d="${HEART_D}"/>`, 0.7) +
      at(186, 80, `<path class="hrt an a-rise o-c d2" d="${HEART_D}"/>`, 0.55) +
      at(122, 50, `<path class="hrt an a-rise o-c d3" d="${HEART_D}"/>`, 0.6),
  }),

  wink: () => frame({
    body: `<g class="an a-tilt o-b">
      ${paper(198, 122, -28, 'a-wave')}${COOKIE}${BLUSH}
      <g class="an a-eyeoff">${eye(99, 98)}</g>
      <path class="ln an a-eyeon" d="M90 100 Q99 92 108 100"/>
      ${eye(143, 98)}
      <path class="ln" d="M113 112 Q121 120 129 112"/></g>`,
    extras: at(70, 92, `<path class="st an a-sparkle o-c" d="${STAR_D}"/>`),
  }),

  giggle: () => frame({
    body: `<g class="an a-giggle o-b">
      ${flip(paper(198, 118, -22, 'a-flap') + COOKIE)}${BLUSH}
      <path class="ln" d="M91 91 L105 98 L91 105"/><path class="ln" d="M151 91 L137 98 L151 105"/>
      <g class="an a-chomp o-t">
        <path class="dk" d="M109 109 Q121 130 133 109 Z"/>
        <path class="tg" d="M114 119 Q121 114 128 119 Q121 125 114 119 Z"/>
      </g></g>`,
    extras: at(46, 80, '<text class="hah an a-rise o-c">ha</text>') + at(176, 70, '<text class="hah an a-rise o-c d2">ha</text>'),
  }),

  grumpy: () => frame({
    body: `<g class="an a-fume o-b">
      ${paper(150, 60, -78)}${COOKIE}
      <path class="flush an a-flush" d="${BODY_D}"/>${BLUSH}
      <g class="an a-brow"><path class="ln" d="M87 86 L108 95"/><path class="ln" d="M155 86 L134 95"/></g>
      <circle class="dk" cx="100" cy="103" r="5.5"/><circle class="dk" cx="142" cy="103" r="5.5"/>
      <path class="ln" d="M112 120 Q121 112 130 120"/></g>`,
    extras:
      at(64, 70, '<g class="an a-steam o-c"><circle class="stm" r="7"/><circle class="stm" cx="8" cy="-4" r="5"/></g>') +
      at(176, 66, '<g class="an a-steam o-c d2"><circle class="stm" r="7"/><circle class="stm" cx="-8" cy="-4" r="5"/></g>'),
  }),

  teary: () => frame({
    body: `<g class="an a-droop o-b">
      ${paper(96, 58, -118, 'a-limp')}${COOKIE}${BLUSH}
      <path class="ln" d="M88 86 L107 80"/><path class="ln" d="M154 86 L135 80"/>
      ${eyeDown(99, 98)}${eyeDown(143, 98)}
      <path class="tp" d="M89 111 Q99 115 109 111"/><path class="tp" d="M133 111 Q143 115 153 111"/>
      <path class="ln" d="M113 122 Q121 115 129 122"/>
      ${at(91, 114, `<path class="tr an a-tear o-c" d="${TEAR_D}"/>`)}
      ${at(151, 114, `<path class="tr an a-tear o-c d2" d="${TEAR_D}"/>`)}</g>`,
  }),

  happy: () => frame({
    shadow: 'a-shadowhop',
    body: `<g class="an a-hop o-b">
      ${paper(92, 62, -130, 'a-wave')}${COOKIE}${BLUSH}
      <g class="an a-blink o-c">${eye(99, 98)}${eye(143, 98)}</g>
      <path class="ln" d="M113 113 Q121 121 129 113"/></g>`,
  }),

  overjoyed: () => frame({
    shadow: 'a-shadowjump',
    body: `<g class="an a-jump o-b"><g class="an a-spin o-c">
      ${paper(198, 122, -6)}${COOKIE}${BLUSH}
      <path class="ln" d="M90 101 L99 92 L108 101"/><path class="ln" d="M134 101 L143 92 L152 101"/>
      <path class="dk" d="M107 109 Q121 132 135 109 Z"/>
      <path class="tg" d="M113 120 Q121 114 129 120 Q121 127 113 120 Z"/></g></g>`,
    extras:
      at(46, 72, `<path class="st an a-burst o-c" d="${STAR_D}"/>`) +
      at(196, 62, `<path class="st an a-burst o-c w1" d="${STAR_D}"/>`) +
      at(34, 150, `<path class="st an a-burst o-c w2" d="${STAR_D}"/>`, 0.7) +
      at(208, 146, `<path class="st an a-burst o-c w3" d="${STAR_D}"/>`, 0.7),
  }),

  surprised: () => frame({
    body: `<g class="an a-startle o-b">
      ${paper(198, 124, -8, 'a-shoot')}${COOKIE}${BLUSH}
      <path class="ln" d="M89 80 Q99 74 109 80"/><path class="ln" d="M133 80 Q143 74 153 80"/>
      ${eye(99, 98, 'an a-widen o-c')}${eye(143, 98, 'an a-widen o-c')}
      <ellipse class="dk an a-oo o-c" cx="121" cy="118" rx="5" ry="6.5"/></g>`,
    extras: at(66, 64, '<text class="bang an a-bang o-c">!</text>') + at(174, 58, '<text class="bang an a-bang o-c w1">!</text>'),
  }),
};

export const EMOTION_NAMES = Object.keys(EMOTIONS);

// ---------- styles & keyframes ----------
const CSS = `
:host{display:inline-block;line-height:0}
svg{width:100%;height:100%;overflow:visible}
.cb{fill:#F8C98C}.cs{fill:#ECA866}.cc{fill:#8A4A2A}
.hl{fill:#FFF6E6;opacity:.8}.bl{fill:#FFF1E4;opacity:.9}
.pp{fill:#fff}.pl{fill:none;stroke:#E9DDD3;stroke-width:2;stroke-linecap:round}
.ln{fill:none;stroke:#3B2418;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.dk{fill:#3B2418}.wh{fill:#fff}.tg{fill:#E8736A}.hrt{fill:#E8413C}.sh{fill:#7A3A12;opacity:.18}
.tr{fill:#8FD0F5}.tp{fill:none;stroke:#8FD0F5;stroke-width:3;stroke-linecap:round}
.flush{fill:#E4533E;opacity:0}.stm,.st{fill:#FFF6E6}
.zz,.hah,.bang{font-family:'Fredoka','Nunito',system-ui,sans-serif;font-weight:700;fill:#FFF6E6;stroke:#3B2418;stroke-width:1px;paint-order:stroke}
.zz{font-size:24px}.hah{font-size:18px}.bang{font-size:36px}
.an{transform-box:fill-box;animation-duration:var(--dur,2.4s);animation-iteration-count:infinite;animation-timing-function:ease-in-out;animation-fill-mode:both}
.once .an{animation-iteration-count:1}
.o-b{transform-origin:50% 100%}.o-c{transform-origin:50% 50%}.o-l{transform-origin:0% 50%}.o-t{transform-origin:50% 0%}
.d2{animation-delay:calc(var(--dur,2.4s) * -.5)}.d3{animation-delay:calc(var(--dur,2.4s) * -.25)}
.once .d2,.once .d3{animation-delay:calc(var(--dur,2.4s) * .12)}
.w1{animation-delay:calc(var(--dur,2.4s) * .04)}.w2{animation-delay:calc(var(--dur,2.4s) * .1)}.w3{animation-delay:calc(var(--dur,2.4s) * .16)}
.a-sway{animation-name:sway}.a-z{animation-name:zfloat;animation-timing-function:ease-out}
.a-lovebob{animation-name:lovebob}.a-beat{animation-name:beat}.a-rise{animation-name:rise;animation-timing-function:ease-out}
.a-tilt{animation-name:tilt}.a-eyeoff{animation-name:eyeoff}.a-eyeon{animation-name:eyeon}.a-sparkle{animation-name:sparkle}.a-wave{animation-name:wave}
.a-giggle{animation-name:giggle}.a-chomp{animation-name:chomp}.a-flap{animation-name:flap}
.a-fume{animation-name:fume}.a-flush{animation-name:flush}.a-brow{animation-name:brow}.a-steam{animation-name:steam;animation-timing-function:ease-out}
.a-droop{animation-name:droop}.a-tear{animation-name:tear;animation-timing-function:ease-in}.a-limp{animation-name:limp}
.a-hop{animation-name:hop}.a-shadowhop{animation-name:shadowhop}.a-blink{animation-name:blink}
.a-jump{animation-name:jump}.a-spin{animation-name:spin}.a-shadowjump{animation-name:shadowjump}.a-burst{animation-name:burst}
.a-startle{animation-name:startle}.a-widen{animation-name:widen}.a-oo{animation-name:oo}.a-bang{animation-name:bang}.a-shoot{animation-name:shoot}
@keyframes sway{0%,100%{transform:rotate(-4deg) scale(1,1)}50%{transform:rotate(4deg) scale(1.03,.96)}}
@keyframes zfloat{0%{transform:translate(0,0) scale(.5);opacity:0}20%{opacity:1}100%{transform:translate(20px,-54px) scale(1.15);opacity:0}}
@keyframes lovebob{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-10px) rotate(-4deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(-10px) rotate(4deg)}}
@keyframes beat{0%,45%,100%{transform:scale(1)}10%,32%{transform:scale(1.4)}21%{transform:scale(1.1)}}
@keyframes rise{0%{transform:translateY(12px) scale(.3);opacity:0}25%{opacity:1}100%{transform:translateY(-70px) scale(1);opacity:0}}
@keyframes tilt{0%,100%{transform:rotate(0) translateY(0)}30%,72%{transform:rotate(-9deg) translateY(-6px)}}
@keyframes eyeoff{0%,32%,70%,100%{opacity:1}36%,66%{opacity:0}}
@keyframes eyeon{0%,32%,70%,100%{opacity:0}36%,66%{opacity:1}}
@keyframes sparkle{0%,34%,74%,100%{transform:scale(0) rotate(0);opacity:0}46%{transform:scale(1.25) rotate(45deg);opacity:1}64%{transform:scale(.9) rotate(90deg);opacity:1}}
@keyframes wave{0%,100%{transform:rotate(0)}25%{transform:rotate(-16deg)}50%{transform:rotate(8deg)}75%{transform:rotate(-10deg)}}
@keyframes giggle{0%,100%{transform:rotate(0) scale(1,1)}8%{transform:rotate(-7deg) scale(1.05,.95)}16%{transform:rotate(7deg) scale(.97,1.03)}24%{transform:rotate(-7deg) scale(1.05,.95)}32%{transform:rotate(7deg) scale(.97,1.03)}40%{transform:rotate(-6deg) scale(1.04,.96)}48%{transform:rotate(6deg)}56%{transform:rotate(-4deg)}64%{transform:rotate(3deg)}72%{transform:rotate(-1deg)}80%{transform:rotate(0)}}
@keyframes chomp{0%,80%,100%{transform:scaleY(1)}8%,24%,40%,56%{transform:scaleY(.5)}16%,32%,48%,64%{transform:scaleY(1.15)}}
@keyframes flap{0%,100%{transform:rotate(0)}10%,30%,50%{transform:rotate(-14deg)}20%,40%,60%{transform:rotate(10deg)}}
@keyframes fume{0%,100%{transform:translate(0,0) rotate(0)}6%{transform:translate(-7px,0) rotate(-2deg)}12%{transform:translate(7px,0) rotate(2deg)}18%{transform:translate(-7px,0) rotate(-2deg)}24%{transform:translate(7px,0) rotate(2deg)}30%{transform:translate(0,0)}50%{transform:translate(0,-6px) scale(1.04,.97)}60%{transform:translate(0,0)}}
@keyframes flush{0%,100%{opacity:0}25%,75%{opacity:.38}}
@keyframes brow{0%,100%{transform:translateY(0)}25%,75%{transform:translateY(3px)}}
@keyframes steam{0%{transform:translate(0,0) scale(.3);opacity:0}25%{opacity:.95}100%{transform:translate(0,-44px) scale(1.3);opacity:0}}
@keyframes droop{0%,100%{transform:translateY(0) rotate(0) scale(1,1)}35%,82%{transform:translateY(8px) rotate(4deg) scale(1.03,.95)}}
@keyframes tear{0%{transform:translateY(0) scale(.2);opacity:0}15%{transform:translateY(0) scale(1);opacity:1}80%{transform:translateY(48px) scale(1);opacity:1}100%{transform:translateY(58px) scale(.6);opacity:0}}
@keyframes limp{0%,100%{transform:rotate(0)}35%,82%{transform:rotate(24deg)}}
@keyframes hop{0%{transform:translateY(0) scale(1,1)}12%{transform:translateY(0) scale(1.12,.86)}30%{transform:translateY(-40px) scale(.93,1.08)}44%{transform:translateY(-46px) scale(1,1)}60%{transform:translateY(0) scale(1.12,.88)}70%{transform:translateY(0) scale(.97,1.03)}80%,100%{transform:translateY(0) scale(1,1)}}
@keyframes shadowhop{0%,12%,60%,100%{transform:scale(1);opacity:1}44%{transform:scale(.6);opacity:.45}}
@keyframes blink{0%,84%,94%,100%{transform:scaleY(1)}89%{transform:scaleY(.1)}}
@keyframes jump{0%{transform:translateY(0) scale(1,1)}12%{transform:translateY(0) scale(1.14,.84)}34%{transform:translateY(-62px) scale(.95,1.06)}56%{transform:translateY(-62px) scale(1,1)}72%{transform:translateY(0) scale(1.12,.88)}82%{transform:translateY(0) scale(.97,1.03)}90%,100%{transform:translateY(0) scale(1,1)}}
@keyframes spin{0%,16%{transform:rotate(0)}58%,100%{transform:rotate(360deg)}}
@keyframes shadowjump{0%,12%,72%,100%{transform:scale(1);opacity:1}45%{transform:scale(.45);opacity:.35}}
@keyframes burst{0%,40%{transform:scale(0) rotate(0);opacity:0}55%{transform:scale(1.25) rotate(40deg);opacity:1}85%{transform:scale(.8) rotate(90deg) translateY(-6px);opacity:0}100%{opacity:0}}
@keyframes startle{0%,14%{transform:translateY(0) scale(1,1)}22%{transform:translateY(-24px) scale(.9,1.15)}32%{transform:translateY(-8px) scale(1.06,.95)}40%{transform:translateY(0) scale(1.04,.97)}50%,100%{transform:translateY(0) scale(1,1)}}
@keyframes widen{0%,14%{transform:scale(1)}24%{transform:scale(1.4)}48%,86%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes oo{0%,14%{transform:scale(.6)}24%{transform:scale(1.35)}48%,86%{transform:scale(1.1)}100%{transform:scale(.6)}}
@keyframes bang{0%,16%{transform:scale(0) rotate(-20deg);opacity:0}26%{transform:scale(1.3) rotate(8deg);opacity:1}40%,80%{transform:scale(1) rotate(0);opacity:1}92%,100%{transform:scale(0);opacity:0}}
@keyframes shoot{0%,14%{transform:translate(0,0) rotate(0)}26%{transform:translate(12px,-8px) rotate(-12deg)}46%,86%{transform:translate(5px,-3px) rotate(-4deg)}100%{transform:translate(0,0) rotate(0)}}
@media (prefers-reduced-motion: reduce){.an{animation:none!important}}
`;

const toMs = (d) => (String(d).trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000);

// ---------- <fortune-mascot> element ----------
// On the server (Next.js SSR) HTMLElement doesn't exist; fall back to a stub so imports don't crash.
const BaseElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

export class FortuneMascot extends BaseElement {
  static get observedAttributes() { return ['emotion', 'size', 'duration', 'label']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._once = false;
    this._timer = null;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { if (this.isConnected) this._render(); }
  disconnectedCallback() { clearTimeout(this._timer); }

  get emotion() { return this.getAttribute('emotion') || 'cozy'; }
  set emotion(v) { this.setAttribute('emotion', v); }
  get durationMs() { return toMs(this.getAttribute('duration') || '2.4s'); }

  /**
   * Play an emotion.
   * @param {string} emotion   one of EMOTION_NAMES
   * @param {{loop?: boolean, then?: string|null}} opts
   *   loop: keep looping (default false = play once)
   *   then: emotion to fall back to after a one-shot (default 'cozy'; null = stay)
   * @returns {Promise<void>} resolves when the one-shot finishes
   */
  play(emotion, { loop = false, then = 'cozy' } = {}) {
    clearTimeout(this._timer);
    this._once = !loop;
    this.setAttribute('emotion', emotion); // triggers re-render and restarts the animation
    this._render();
    if (loop) return Promise.resolve();
    return new Promise((resolve) => {
      this._timer = setTimeout(() => {
        if (then) { this._once = false; this.setAttribute('emotion', then); }
        this.dispatchEvent(new CustomEvent('mascot-done', { detail: { emotion } }));
        resolve();
      }, this.durationMs);
    });
  }

  _render() {
    const name = EMOTIONS[this.emotion] ? this.emotion : 'cozy';
    const size = this.getAttribute('size') || '160px';
    const dur = this.getAttribute('duration') || '2.4s';
    const label = this.getAttribute('label') || `Fortune cookie mascot looking ${name}`;
    this.style.width = size;
    this.style.height = size;
    this.shadowRoot.innerHTML = `
      <style>${CSS}:host{--dur:${dur}}</style>
      <svg viewBox="0 0 240 240" role="img" aria-label="${label}" class="${this._once ? 'once' : ''}">
        ${EMOTIONS[name]()}
      </svg>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('fortune-mascot')) {
  customElements.define('fortune-mascot', FortuneMascot);
}

// ---------- Duolingo-style pop-up ----------
const TOAST_CSS = `
.fm-toast{position:fixed;left:50%;bottom:24px;z-index:9999;display:flex;align-items:center;gap:12px;
  padding:12px 20px 12px 12px;border-radius:24px;background:#FFF6E6;color:#3A1F10;
  box-shadow:0 12px 32px rgba(58,31,16,.25);font:700 18px/1.3 'Nunito',system-ui,sans-serif;
  transform:translate(-50%,140%);transition:transform .35s cubic-bezier(.2,1.4,.4,1)}
.fm-toast.fm-in{transform:translate(-50%,0)}
.fm-toast.fm-top{bottom:auto;top:24px;transform:translate(-50%,-140%)}
.fm-toast.fm-top.fm-in{transform:translate(-50%,0)}
.fm-toast .fm-msg:empty{display:none}`;

let toastStyleAdded = false;

/**
 * Pop the mascot up on screen, play one emotion, then slide it away.
 * @param {string} emotion
 * @param {{message?: string, position?: 'bottom'|'top', size?: string, hold?: number}} opts
 *   hold: extra ms to stay on screen after the animation (default 300)
 */
export function showMascot(emotion, { message = '', position = 'bottom', size = '120px', hold = 300 } = {}) {
  if (!toastStyleAdded) {
    const s = document.createElement('style');
    s.textContent = TOAST_CSS;
    document.head.appendChild(s);
    toastStyleAdded = true;
  }
  document.querySelectorAll('.fm-toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `fm-toast ${position === 'top' ? 'fm-top' : ''}`;
  toast.setAttribute('role', 'status');
  const mascot = document.createElement('fortune-mascot');
  mascot.setAttribute('size', size);
  const msg = document.createElement('span');
  msg.className = 'fm-msg';
  msg.textContent = message;
  toast.append(mascot, msg);
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('fm-in')));
  return mascot.play(emotion, { then: null }).then(
    () => new Promise((resolve) => setTimeout(() => {
      toast.classList.remove('fm-in');
      setTimeout(() => { toast.remove(); resolve(); }, 400);
    }, hold))
  );
}

// Handy for non-module scripts / quick console testing
if (typeof window !== 'undefined') {
  window.FortuneMascotKit = { showMascot, EMOTION_NAMES };
}
