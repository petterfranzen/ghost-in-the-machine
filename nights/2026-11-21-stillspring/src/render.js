// Canvas painter. It only reads the view it is handed: no game rules here.
const C = {
  bg0: '#08161d', bg1: '#0f2830',
  stone: '#2a515c', stoneTop: '#3a6c78', stoneDeep: '#143039',
  rock: '#1e4149', moss: '#4c8a6d',
  water: '#57d4c4', waterLit: '#bff6ec', waterDeep: '#2a8f9c',
  basin: '#0b262e', bloom: '#f0c79a', petal: '#f4d9b6',
  spring: '#9ff0e2', hint: '#8fe6d8', glow: '#ffe9a8',
  groove: '#0a1c23',
};

const SIDES = [ { bit: 1, dx: 0, dy: -1 }, { bit: 2, dx: 1, dy: 0 },
                { bit: 4, dx: 0, dy: 1 }, { bit: 8, dx: -1, dy: 0 } ];
const OPPOSITE = { 1: 4, 2: 8, 4: 1, 8: 2 };

function roundRect(ctx, box) {
  const { x, y, w, h } = box;
  const r = box.r === undefined ? Math.min(w, h) * 0.16 : box.r;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A rectangle from the stone's centre out to one edge, width as a fraction of s.
function band(ctx, stone, side, width) {
  const { px, py, s } = stone;
  const w = s * width, c = s / 2, half = w / 2;
  if (side.dx) {
    const x = side.dx > 0 ? px + c : px - c;
    ctx.rect(x, py + c - half, c + 2, w);
  } else {
    const y = side.dy > 0 ? py + c : py - c;
    ctx.rect(px + c - half, y, w, c + 2);
  }
}

// A side carries water only when the stone beyond it is wet and joined to us.
function carriesWater(tile, side, index) {
  if (!(tile.mask & side.bit)) return false;
  const nb = index.get(`${tile.x + side.dx},${tile.y + side.dy}`);
  if (!nb || nb[4] < 0) return false;
  return (nb[3] & OPPOSITE[side.bit]) !== 0;
}

function openSides(tile, view) {
  return SIDES.filter((side) => {
    if (!(tile.mask & side.bit)) return false;
    const nx = tile.x + side.dx, ny = tile.y + side.dy;
    return nx >= 0 && ny >= 0 && nx < view.w && ny < view.h;
  });
}

function groovePath(ctx, stone, sides) {
  ctx.beginPath();
  for (const side of sides) band(ctx, stone, side, 0.28);
  ctx.fillStyle = C.groove;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(stone.px + stone.s / 2, stone.py + stone.s / 2, stone.s * 0.14, 0, 6.283);
  ctx.fill();
}

function waterInk(tile, t, motion) {
  const phase = Math.sin(t * 2 + tile.x * 0.31 + tile.y * 0.83);
  if (motion > 0.6 && phase > 0.9) return C.waterLit;
  return tile.fill > 0.9 ? C.water : C.waterDeep;
}

function waterPath(stone, flow, view) {
  const { ctx, tile, s } = stone;
  const ink = waterInk(tile, view.t, view.motion);
  ctx.beginPath();
  for (const side of flow) band(ctx, stone, side, 0.17);
  ctx.fillStyle = ink;
  ctx.shadowColor = 'rgba(87,212,196,0.55)';
  ctx.shadowBlur = s * 0.12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(stone.px + s / 2, stone.py + s / 2, s * 0.085, 0, 6.283);
  ctx.fill();
  const pulse = 0.5 + 0.5 * Math.sin(view.t * 2.6 + tile.x * 0.7 + tile.y * 1.1);
  ctx.globalAlpha = 0.25 + pulse * 0.35;
  ctx.beginPath();
  for (const side of flow) band(ctx, stone, side, 0.055);
  ctx.fillStyle = C.waterLit;
  ctx.fill();
  ctx.globalAlpha = 1;
}

// A carved channel: a dark groove in the stone face, with water running in it.
function drawChannel(stone, view, index) {
  const sides = openSides(stone.tile, view);
  if (!sides.length) return;
  const { ctx, s } = stone;
  ctx.save();
  roundRect(ctx, { x: stone.px + 1, y: stone.py + 1, w: s - 2, h: s - 2, r: s * 0.16 });
  ctx.clip();
  groovePath(ctx, stone, sides);
  if (stone.tile.fill > 0.01) {
    const flow = sides.filter((side) => carriesWater(stone.tile, side, index));
    waterPath(stone, flow, view);
  }
  ctx.restore();
}

function shade(stone, motion) {
  const { ctx, px, py, s } = stone;
  const g = ctx.createLinearGradient(px, py, px, py + s);
  g.addColorStop(0, motion > 0.6 ? C.stoneTop : C.stone);
  g.addColorStop(1, C.stoneDeep);
  roundRect(ctx, { x: px + 1, y: py + 1, w: s - 2, h: s - 2, r: s * 0.16 });
  ctx.fillStyle = g;
  ctx.fill();
}

function drawRock(stone) {
  const { ctx, tile, px, py, s } = stone;
  roundRect(ctx, { x: px + 1, y: py + 1, w: s - 2, h: s - 2, r: s * 0.16 });
  ctx.fillStyle = C.rock;
  ctx.fill();
  ctx.fillStyle = C.moss;
  for (let i = 0; i < 5; i += 1) {
    const a = (tile.x * 7 + tile.y * 3 + i * 2.4) % 6.28;
    ctx.beginPath();
    ctx.arc(px + s / 2 + Math.cos(a) * s * 0.22, py + s / 2 + Math.sin(a) * s * 0.22,
            Math.max(1, s * 0.03), 0, 6.283);
    ctx.fill();
  }
}

function drawSpring(stone, t) {
  const { ctx, px, py, s } = stone;
  const cx = px + s / 2, cy = py + s / 2;
  ctx.fillStyle = C.basin;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.28, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = C.spring;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.19 + Math.sin(t * 1.3) * s * 0.012, 0, 6.283);
  ctx.fill();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = C.spring;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.34, 0, 6.283);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawGarden(stone, bloom) {
  const { ctx, px, py, s } = stone;
  const cx = px + s / 2, cy = py + s / 2, petal = bloom > 0.02;
  ctx.fillStyle = C.stoneDeep;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.30, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = petal ? C.petal : C.moss;
  for (let i = 0; i < 5; i += 1) {
    const a = i * 1.2566 + (petal ? bloom * 0.5 : 0);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * s * 0.13, cy + Math.sin(a) * s * 0.13,
            s * (petal ? 0.075 + bloom * 0.045 : 0.06), 0, 6.283);
    ctx.fill();
  }
  ctx.fillStyle = petal ? C.bloom : C.moss;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.062, 0, 6.283);
  ctx.fill();
}

function drawTile(stone, view, index) {
  const { tile } = stone;
  if (tile.sp === 3) { drawRock(stone); return; }
  shade(stone, view.motion);
  if (tile.sp !== 3) drawChannel(stone, view, index);
  if (tile.sp === 1) drawSpring(stone, view.t);
  if (tile.sp === 2) {
    const g = view.gardens.find((v) => v[0] === tile.x && v[1] === tile.y);
    drawGarden(stone, g ? view.bloom * g[2] : 0);
  }
  if (tile.flash > 0.01) {
    const { ctx, px, py, s } = stone;
    ctx.globalAlpha = tile.flash * 0.45;
    ctx.fillStyle = C.waterLit;
    roundRect(ctx, { x: px + 1, y: py + 1, w: s - 2, h: s - 2, r: s * 0.16 });
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawHint(ctx, hint, view) {
  if (!hint) return;
  const s = view.tile;
  const pulse = 0.5 + 0.5 * Math.sin(view.t * 2.4);
  ctx.strokeStyle = C.hint;
  ctx.globalAlpha = 0.35 + pulse * 0.45;
  ctx.lineWidth = Math.max(2, s * 0.05);
  roundRect(ctx, { x: hint[0] * s + 3, y: hint[1] * s + 3, w: s - 6, h: s - 6, r: s * 0.2 });
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawGlows(ctx, view) {
  for (const g of view.glows) {
    const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
    const alpha = g.alpha === undefined ? 1 : g.alpha;
    grad.addColorStop(0, `rgba(255,233,168,${0.95 * alpha})`);
    grad.addColorStop(0.35, `rgba(255,214,140,${0.35 * alpha})`);
    grad.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, 6.283);
    ctx.fill();
  }
}

function drawCourse(ctx, view) {
  const course = view.course;
  if (!course || course.fade <= 0.01) return;
  const s = view.tile;
  const cells = new Set(course.cells.map((c) => `${c[0]},${c[1]}`));
  ctx.save();
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.waterLit;
  ctx.fillStyle = C.waterLit;
  for (const [x, y] of course.cells) {
    ctx.globalAlpha = 0.5 * course.fade;
    ctx.beginPath();
    ctx.arc((x + 0.5) * s, (y + 0.5) * s, s * 0.09, 0, 6.283);
    ctx.fill();
    for (const side of SIDES) {
      if (!cells.has(`${x + side.dx},${y + side.dy}`)) continue;
      ctx.beginPath();
      ctx.moveTo((x + 0.5) * s, (y + 0.5) * s);
      ctx.lineTo((x + 0.5 + side.dx * 0.5) * s, (y + 0.5 + side.dy * 0.5) * s);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function scrim(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.2,
                                     w / 2, h * 0.5, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(8,22,29,0)');
  g.addColorStop(1, 'rgba(4,12,17,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return {
    draw(view) {
      const w = view.w * view.tile, h = view.h * view.tile;
      ctx.setTransform(view.scale, 0, 0, view.scale, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, C.bg0);
      bg.addColorStop(1, C.bg1);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const index = new Map(view.tiles.map((t) => [`${t.x},${t.y}`, t]));
      for (const tile of view.tiles) {
        const stone = { ctx, tile, px: tile.x * view.tile, py: tile.y * view.tile, s: view.tile };
        drawTile(stone, view, index);
      }
      if (view.bloom > 0) {
        ctx.globalAlpha = 0.28 * (1 - view.bloom);
        ctx.fillStyle = C.waterLit;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
      drawCourse(ctx, view);
      drawHint(ctx, view.hint, view);
      drawGlows(ctx, view);
      scrim(ctx, w, h);
    },
  };
}
