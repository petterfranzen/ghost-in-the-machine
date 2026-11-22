// Drawing. Nothing here knows the rules: it paints whatever the bridge hands
// it — the tiles the game pushed, the keeper's spot, and a little weather.
window.LakePaint = (function () {
  const { TILE_DRAW, KEEPER_DRAW, FX_LIFE, FX_DRAW, drawSkid, drawCrack, hash, roundRect, lamp, KEEPER, GLOW } = window.LakeArt;
const ICE_TOP = '#274a66';
const ICE_BOT = '#16304a';
const ICE_EDGE = '#4b7fa6';

function createPainter(canvas, scene) {
  const c = canvas.getContext('2d');
  const fx = [];
  const flakes = [];
  let box = { s: 40, x: 0, y: 0, w: 0, h: 0 };
  let rain = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = canvas.clientWidth || window.innerWidth;
    const vh = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    box = fit(vw, vh, scene.grid.w, scene.grid.h);
    while (flakes.length < 90) flakes.push({ x: Math.random() * vw, y: Math.random() * vh, r: 0.6 + Math.random() * 1.6, v: 6 + Math.random() * 16, d: Math.random() * 6.28 });
  }

  // The board sits between the hint at the top and the pad at the bottom.
  function fit(vw, vh, gw, gh) {
    const top = Math.min(vh * 0.19, 132);
    const bottom = Math.min(vh * 0.15, 116);
    const side = Math.min(vw, vh) * 0.07;
    const s = Math.min((vw - side * 2) / gw, (vh - top - bottom) / gh);
    return { s, x: (vw - s * gw) / 2, y: top + Math.max(0, (vh - top - bottom - s * gh) / 2), w: vw, h: vh };
  }

  function spawn(kind, x, y, arg) {
    fx.push({ kind, x, y, t: 0, life: FX_LIFE[kind] || 1, arg: arg || 0, seed: Math.random() });
    if (fx.length > 240) fx.splice(0, 40);
  }

  function draw(t, dt) {
    const { w, h } = box;
    c.clearRect(0, 0, w, h);
    drawSky(t, h);
    drawBay(t);
    drawTiles(t);
    drawMarks(t);
    drawLights(t);
    drawKeeper(t);
    drawFx(dt);
    drawSnow(t, dt, w, h);
  }

  function drawSky(t, h) {
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#060a13');
    sky.addColorStop(0.55, '#0a1420');
    sky.addColorStop(1, '#0b1826');
    c.fillStyle = sky;
    c.fillRect(0, 0, box.w, h);
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const y = h * (0.08 + i * 0.05);
      const wobble = Math.sin(t * 0.11 + i * 1.7) * h * 0.03;
      const band = c.createLinearGradient(0, y - 40 + wobble, 0, y + 70 + wobble);
      const tone = ['rgba(60,120,150,0.10)', 'rgba(90,150,120,0.07)', 'rgba(140,120,160,0.06)'][i];
      band.addColorStop(0, 'rgba(0,0,0,0)');
      band.addColorStop(0.5, tone);
      band.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = band;
      c.fillRect(0, y - 40 + wobble, box.w, 110);
    }
    c.restore();
  }

  function drawBay(t) {
    const { s, x, y } = box;
    const bw = s * scene.grid.w;
    const bh = s * scene.grid.h;
    c.save();
    const ice = c.createLinearGradient(0, y, 0, y + bh);
    ice.addColorStop(0, ICE_TOP);
    ice.addColorStop(1, ICE_BOT);
    c.fillStyle = ice;
    roundRect(c, { x: x - s * 0.25, y: y - s * 0.25, w: bw + s * 0.5, h: bh + s * 0.5, r: s * 0.5 });
    c.fill();
    c.strokeStyle = ICE_EDGE;
    c.lineWidth = Math.max(1, s * 0.05);
    c.stroke();
    // a slow sheen crossing the ice, like moonlight moving on it
    const drift = ((t * 0.035) % 1) * (bw + s * 4) - s * 2;
    const sheen = c.createLinearGradient(x + drift - s * 2, y, x + drift + s * 2, y + bh);
    sheen.addColorStop(0, 'rgba(120,190,225,0)');
    sheen.addColorStop(0.5, 'rgba(120,190,225,0.05)');
    sheen.addColorStop(1, 'rgba(120,190,225,0)');
    c.fillStyle = sheen;
    c.fillRect(x, y, bw, bh);
    c.restore();
  }

  function cell(cx, cy) {
    return { px: box.x + cx * box.s, py: box.y + cy * box.s, s: box.s };
  }

  function drawTiles(t) {
    for (let cy = 0; cy < scene.grid.h; cy++) {
      for (let cx = 0; cx < scene.grid.w; cx++) {
        const p = cell(cx, cy);
        const kind = scene.tileAt(cx, cy);
        TILE_DRAW[kind](c, p, { x: cx, y: cy, t, lit: kind === 5 && !!scene.lit[`${cx},${cy}`] });
      }
    }
  }

  function drawMarks(t) {
    for (const key of Object.keys(scene.skids)) {
      const [cx, cy] = key.split(',').map(Number);
      const age = t - scene.skids[key];
      if (age > 9) { delete scene.skids[key]; continue; }
      const p = cell(cx, cy);
      drawSkid(c, p, scene.skidDir[key] || 1, 1 - age / 9);
    }
    for (const key of Object.keys(scene.cracks)) {
      const [cx, cy] = key.split(',').map(Number);
      const p = cell(cx, cy);
      drawCrack(c, p, { n: scene.cracks[key], cx, cy });
    }
  }

  function drawLights(t) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let cy = 0; cy < scene.grid.h; cy++) {
      for (let cx = 0; cx < scene.grid.w; cx++) {
        if (scene.tileAt(cx, cy) !== 5 || !scene.lit[`${cx},${cy}`]) continue;
        const p = cell(cx, cy);
        const flick = 0.82 + 0.18 * Math.sin(t * 2.7 + hash(cx, cy) * 9);
        lamp(c, { x: p.px + p.s / 2, y: p.py + p.s * 0.55, r: p.s * 3.4, alpha: 0.4 * flick });
      }
    }
    c.restore();
  }

  // The game hands over a spot partway along the skid it is in the middle of,
  // so the keeper is drawn exactly where the rules say the skater is.
  function drawKeeper(t) {
    const k = scene.keeper;
    const cx = box.x + k.x * box.s + box.s / 2;
    const cy = box.y + k.y * box.s + box.s / 2;
    KEEPER_DRAW[k.mode](c, { x: cx, y: cy, s: box.s, k, t });
  }

  function drawFx(dt) {
    c.save();
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.t += dt;
      if (f.t > f.life) { fx.splice(i, 1); continue; }
      FX_DRAW[f.kind](c, f, cell(f.x, f.y), (f.t / f.life));
    }
    c.restore();
  }

  function drawSnow(t, dt, w, h) {
    c.save();
    c.fillStyle = 'rgba(226,238,250,0.55)';
    for (const f of flakes) {
      f.d += dt;
      f.y += f.v * dt;
      f.x += (10 + Math.sin(t * 0.5 + f.d) * 8) * dt;
      if (f.y > h + 6) { f.y = -6; f.x = Math.random() * w; }
      if (f.x > w + 6) f.x = -6;
      c.beginPath();
      c.arc(f.x, f.y, f.r, 0, 6.2832);
      c.fill();
    }
    c.restore();
  }

  return { draw, spawn, resize, cell, box: () => box };
}

return { createPainter };
})();
