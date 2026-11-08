/* interact.js — tiny shared behaviour helpers for the ghost-in-the-machine
 * nights. One plain ES module: no build step, no dependencies. A night copies
 * it next to its built page (see build.sh) and imports what it needs:
 *   import { onTap, nudge, idleHint, fullscreenOnMobile } from './interact.js';
 * House rules it keeps: pointer events (no 300 ms delay), multi-touch ignored,
 * a poke gets a gentle answer that never ends the scene, reduced motion
 * respected, sound left to the night. ES modules need http(s), not file://. */

const motionOK = () =>
  typeof matchMedia !== 'function' ||
  !matchMedia('(prefers-reduced-motion: reduce)').matches;
const handheld = () =>
  typeof matchMedia === 'function' &&
  (matchMedia('(pointer: coarse)').matches || matchMedia('(max-width: 900px)').matches);
const tapReady = (el) => { if (!el.style.touchAction) el.style.touchAction = 'manipulation'; };
const listen = (el, handlers, on) => {
  for (const type in handlers) el[on ? 'addEventListener' : 'removeEventListener'](type, handlers[type]);
};

/* One tap: a finger down and up on the same spot. Fires on pointerup so a
 * press-and-hold can be a nudge instead; a second finger or a drag is ignored.
 * Each down point is tracked per pointer id and released on pointerup or
 * pointercancel anywhere on the window, so a drag that starts on the element
 * and ends off it cannot leave a stale entry behind and gag later taps.
 * Returns a function that removes the listeners. This answers pointer events,
 * not click: a night that also binds a click handler to the same element will
 * hear both, so bind one or the other. */
export function onTap(el, fn) {
  if (!el || typeof fn !== 'function') return () => {};
  tapReady(el);
  const down = new Map();
  let multi = false;
  const handlers = {
    pointerdown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (down.size === 0) multi = false;
      down.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (down.size > 1) multi = true;
    },
    pointerup(e) {
      const start = down.get(e.pointerId);
      if (!start) return;
      down.delete(e.pointerId);
      const drift = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      const tap = !multi && down.size === 0 && drift <= 12;
      if (down.size === 0) multi = false; // ready for the next gesture
      if (tap) fn(e);
    },
    pointercancel(e) { down.delete(e.pointerId); if (down.size === 0) multi = false; },
  };
  el.addEventListener('pointerdown', handlers.pointerdown);
  window.addEventListener('pointerup', handlers.pointerup);
  window.addEventListener('pointercancel', handlers.pointercancel);
  return () => {
    el.removeEventListener('pointerdown', handlers.pointerdown);
    window.removeEventListener('pointerup', handlers.pointerup);
    window.removeEventListener('pointercancel', handlers.pointercancel);
  };
}

/* A nudge: rest a finger on something and it answers gently. fn gets the
 * strength (0 to 1) easing up while you hold, then 0 when you let go so the
 * scene can settle, and the pointer event so you know where the poke was.
 * Nothing is killed, hidden or ended here — that is the night's choice. Under
 * reduced motion the answer is one static call, fn(1, e), on press. */
export function nudge(el, fn, { ramp = 600 } = {}) {
  if (!el || typeof fn !== 'function') return () => {};
  tapReady(el);
  let raf = 0, origin = null;
  const settle = () => { if (raf) cancelAnimationFrame(raf); raf = 0; fn(0, origin); };
  const handlers = {
    pointerdown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (raf) return; // one poke at a time
      origin = e;
      if (!motionOK()) return fn(1, e);
      const t0 = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / ramp);
        fn(0.15 + 0.85 * (1 - Math.pow(1 - t, 3)), origin);
        raf = t < 1 ? requestAnimationFrame(step) : 0;
      };
      raf = requestAnimationFrame(step);
    },
  };
  listen(el, handlers, true);
  window.addEventListener('pointerup', settle);
  window.addEventListener('pointercancel', settle);
  return () => {
    listen(el, handlers, false);
    ['pointerup', 'pointercancel'].forEach((t) => window.removeEventListener(t, settle));
  };
}

/* A soft hint after the player goes quiet. `after` ms of stillness shows it, at
 * most three times a session; the next input hides it. Show and hide are your
 * own effect — each is handed the element — so e.g. a class that fades it in;
 * pass neither and the helper just toggles the element's hidden attribute. The
 * element also gets data-motion="motion|reduced" so CSS can drop transitions. */
export function idleHint(el, { after = 12000, show, hide } = {}) {
  if (!el) return () => {};
  const LIMIT = 3;
  const events = ['pointerdown', 'keydown', 'touchstart'];
  let timer = 0, shown = 0, visible = false;
  const paint = (on) => {
    visible = on;
    const fn = on ? show : hide;
    if (fn) fn(el); else el.hidden = !on;
  };
  const arm = () => {
    clearTimeout(timer);
    if (shown >= LIMIT) return;
    timer = setTimeout(() => { if (!visible) { shown += 1; paint(true); } }, after);
  };
  const onInput = () => { if (visible) paint(false); arm(); };
  el.dataset.motion = motionOK() ? 'motion' : 'reduced';
  events.forEach((t) => window.addEventListener(t, onInput, { passive: true }));
  arm();
  return () => {
    clearTimeout(timer);
    events.forEach((t) => window.removeEventListener(t, onInput));
  };
}

/* Fill the phone screen: a 100dvh height (100vh as the fallback), safe-area
 * insets kept clear, and the Fullscreen API where the platform has it. iOS
 * Safari has no element fullscreen, so there the CSS fill is the whole fix and
 * supported reads false. Returns { supported, mobile, isOn, enter, exit,
 * toggle }; enter/exit resolve to whether they worked and never throw. */
export function fullscreenOnMobile(el = document.documentElement, { padding = true } = {}) {
  if (!document.getElementById('gim-fill')) {
    const style = document.createElement('style');
    style.id = 'gim-fill';
    style.textContent = `
      .gim-fill{height:100vh;height:100dvh;min-height:100vh;min-height:100dvh;overscroll-behavior:none}
      .gim-fill.gim-safe{box-sizing:border-box;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}`;
    document.head.appendChild(style);
  }
  el.classList.add('gim-fill');
  if (padding) el.classList.add('gim-safe');

  const doc = document, de = doc.documentElement;
  const isOn = () => !!(doc.fullscreenElement || de.webkitFullscreenElement);
  const run = (fn) => {
    try {
      const out = fn();
      return out?.then ? out.then(() => true, () => false) : Promise.resolve(!!out);
    } catch {
      return Promise.resolve(false);
    }
  };
  const enter = () => run(() => (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el));
  const exit = () => run(() => (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc));
  return {
    supported: !!(doc.fullscreenEnabled || de.webkitFullscreenEnabled),
    mobile: handheld(),
    isOn,
    enter,
    exit,
    toggle: () => (isOn() ? exit() : enter()),
  };
}
