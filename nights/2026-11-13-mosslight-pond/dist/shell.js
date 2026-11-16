// Canvas, pixel grid and pointer input. The simulation lives in F# (app.js).
(function () {
  const cv = document.getElementById('scene');
  const cx = cv.getContext('2d');
  const events = [];
  let W = 200, H = 200, S = 3;
  let pressed = {};

  function resize() {
    const cw = window.innerWidth, ch = window.innerHeight;
    S = Math.max(2, Math.round(Math.min(cw, ch * 1.25) / 190));
    W = Math.ceil(cw / S);
    H = Math.ceil(ch / S);
    cv.width = W; cv.height = H;
    cv.style.width = cw + 'px';
    cv.style.height = ch + 'px';
    cx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  const col = (c) => { cx.fillStyle = c; };
  const Gfx = {
    W: () => W,
    H: () => H,
    clear(c) { cx.globalAlpha = 1; cx.fillStyle = c; cx.fillRect(0, 0, W, H); },
    rect(x, y, w, h, c) { cx.globalAlpha = 1; cx.fillStyle = c; cx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0)); },
    rectA(x, y, w, h, c, a) { cx.globalAlpha = a; cx.fillStyle = c; cx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0)); cx.globalAlpha = 1; },
    ell(px, py, rx, ry, c) {
      cx.globalAlpha = 1; cx.fillStyle = c; cx.beginPath();
      cx.ellipse(px, py, Math.max(0.2, rx), Math.max(0.2, ry), 0, 0, 6.2832); cx.fill();
    },
    ellA(px, py, rx, ry, c, a) {
      cx.globalAlpha = a; cx.fillStyle = c; cx.beginPath();
      cx.ellipse(px, py, Math.max(0.2, rx), Math.max(0.2, ry), 0, 0, 6.2832); cx.fill(); cx.globalAlpha = 1;
    },
    ring(px, py, rx, ry, lw, c, a) {
      cx.globalAlpha = a; cx.strokeStyle = c; cx.lineWidth = lw; cx.beginPath();
      cx.ellipse(px, py, Math.max(0.2, rx), Math.max(0.2, ry), 0, 0, 6.2832); cx.stroke(); cx.globalAlpha = 1;
    },
    glow(px, py, r, c, a) {
      if (r <= 0 || a <= 0) return;
      const g = cx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.globalAlpha = a; cx.globalCompositeOperation = 'lighter';
      cx.fillStyle = g; cx.fillRect(px - r, py - r, r * 2, r * 2);
      cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
    },
    clipPond(px, py, rx, ry) {
      cx.save(); cx.beginPath(); cx.ellipse(px, py, rx, ry, 0, 0, 6.2832); cx.clip();
    },
    clipRect(x, y, w, h) { cx.save(); cx.beginPath(); cx.rect(x, y, w, h); cx.clip(); },
    unclip() { cx.restore(); },
    save() { cx.save(); },
    restore() { cx.restore(); },
    translate(x, y) { cx.translate(x, y); },
    lighter(on) { cx.globalCompositeOperation = on ? 'lighter' : 'source-over'; }
  };
  window.Gfx = Gfx;

  function pos(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  function push(kind, e) {
    const p = pos(e);
    events.push({ kind: kind, x: p.x, y: p.y, id: e.pointerId, t: performance.now(), size: S });
    if (events.length > 64) events.shift();
  }
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); push('down', e); e.preventDefault(); });
  cv.addEventListener('pointermove', (e) => { if (e.buttons || pressed[e.pointerId]) push('move', e); });
  cv.addEventListener('pointerup', (e) => { push('up', e); });
  cv.addEventListener('pointercancel', (e) => { push('up', e); });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());

  window.MossInput = {
    pull() { const out = events.slice(); events.length = 0; return out; },
    count() { return events.length; }
  };
})();
