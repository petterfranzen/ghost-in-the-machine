// Drawing the marsh: one logical 176x152 frame of chunky pixels, scaled up by whole numbers.
const MarshDraw = {
  W: 176,
  H: 152,
  CELL: 16,
  TOP: 40,
  MIST: [
    { x: 20, y: 70, w: 70, h: 9, speed: 5.5, alpha: 0.06 },
    { x: 96, y: 108, w: 62, h: 8, speed: 3.4, alpha: 0.05 },
  ],
  STARS: [
    [12, 7, 1], [24, 18, 0], [39, 5, 1], [55, 22, 0], [63, 9, 1], [86, 15, 0],
    [97, 6, 1], [112, 21, 0], [120, 11, 1], [134, 17, 0], [152, 8, 1], [166, 20, 0],
    [7, 26, 0], [47, 30, 0], [74, 27, 0], [141, 29, 0],
  ],
  DASHES: [
    [18, 62, 7], [46, 71, 5], [88, 64, 8], [120, 78, 6], [146, 66, 5],
    [30, 92, 6], [70, 101, 9], [110, 94, 6], [152, 106, 7], [12, 118, 5],
    [58, 130, 8], [96, 122, 5], [134, 134, 6], [24, 141, 7], [160, 126, 5],
  ],
};

MarshDraw.palette = {
  sky: ['#0a1524', '#102638', '#183444'],
  star: '#d8ecff',
  moon: '#edf4e8',
  moonShade: '#c9d8cd',
  moonGlow: 'rgba(190, 220, 205, 0.16)',
  water: '#0c2431',
  waterDeep: '#081b26',
  dash: '#1d4553',
  shore: '#122c36',
  reed: '#1c4147',
  reedTip: '#2a5b5e',
  stone: '#2b3f49',
  stoneFace: '#3d5a64',
  stoneEdge: '#7fa3a8',
  prism: '#7c8cb8',
  prismBright: '#cbd7f2',
  rune: '#5d7085',
  runeLit: '#cfe0ff',
  lanternPost: '#2a3b41',
  lanternDead: '#4a5b61',
  flame: '#ffd48a',
  flameCore: '#fff2cf',
  beam: 'rgba(232, 244, 210, 0.92)',
  beamWarm: 'rgba(255, 232, 178, 0.94)',
  beamGlow: 'rgba(169, 208, 138, 0.20)',
  beamGlowWarm: 'rgba(255, 214, 140, 0.22)',
  mote: '#ffe9a8',
  silver: '#cfe0ea',
};

MarshDraw.init = function init(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.buffer = document.createElement('canvas');
  this.buffer.width = this.W;
  this.buffer.height = this.H;
  this.scratch = this.buffer.getContext('2d');
  this.resize();
};

MarshDraw.resize = function resize() {
  const box = this.canvas.parentElement.getBoundingClientRect();
  const hud = document.getElementById('hud');
  const controls = document.getElementById('controls');
  const chrome = (hud ? hud.offsetHeight : 0) + (controls ? controls.offsetHeight : 0);
  const room = window.innerHeight - chrome - 28;
  const scale = Math.max(1, Math.floor(Math.min(box.width / this.W, room / this.H)));
  this.scale = scale;
  this.canvas.width = this.W * scale;
  this.canvas.height = this.H * scale;
  this.canvas.style.width = `${this.W * scale}px`;
  this.canvas.style.height = `${this.H * scale}px`;
  this.ctx.imageSmoothingEnabled = false;
};

MarshDraw.paint = function paint(view) {
  const g = this.scratch;
  g.clearRect(0, 0, this.W, this.H);
  this.sky(g, view);
  this.water(g, view);
  this.tiles(g, view);
  this.beams(g, view);
  this.lanterns(g, view);
  this.motes(g, view);
  this.effects(g, view);
  this.wash(g, view);
  this.ctx.imageSmoothingEnabled = false;
  this.ctx.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
};

MarshDraw.rect = function rect(g, x, y, w, h, colour) {
  g.fillStyle = colour;
  g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
};

MarshDraw.disc = function disc(g, cx, cy, r, colour) {
  g.fillStyle = colour;
  for (let y = -r; y <= r; y += 1) {
    const span = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
    g.fillRect(Math.round(cx - span), Math.round(cy + y), span * 2 + 1, 1);
  }
};

MarshDraw.glow = function glow(g, cx, cy, r, colour) {
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, colour);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  g.fillStyle = grad;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
};

MarshDraw.sky = function sky(g, view) {
  const p = this.palette;
  const band = Math.ceil(this.TOP / 3);
  p.sky.forEach((colour, i) => this.rect(g, 0, i * band, this.W, band, colour));
  const shimmer = 0.55 + 0.45 * Math.sin(view.time / 1400);
  this.STARS.forEach(([x, y, big]) => {
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(view.time / (900 + x * 7)));
    if (twinkle * shimmer < 0.3) return;
    this.rect(g, x, y, big + 1, 1, p.star);
  });
  const moonX = 138 + view.moonDrift;
  this.glow(g, moonX, 14, view.moonFull ? 22 : 17, p.moonGlow);
  this.disc(g, moonX, 14, view.moonFull ? 7 : 6, p.moon);
  this.disc(g, moonX - 2, 12, view.moonFull ? 2 : 1, p.moonShade);
  if (view.moonFull) this.disc(g, moonX + 2, 16, 1, p.moonShade);
  this.rect(g, 0, this.TOP - 5, this.W, 5, p.shore);
  for (let x = 0; x < this.W; x += 11) {
    const sway = Math.sin(view.time / 1100 + x) * 1.4;
    this.rect(g, x + sway, this.TOP - 9, 1, 5, p.reed);
    this.rect(g, x + sway + 3, this.TOP - 7, 1, 3, p.reedTip);
  }
};

MarshDraw.water = function water(g, view) {
  const p = this.palette;
  this.rect(g, 0, this.TOP, this.W, this.H - this.TOP, p.water);
  this.rect(g, 0, this.TOP, this.W, 6, p.waterDeep);
  this.glow(g, 138 + view.moonDrift, this.TOP + 20, 26, 'rgba(200, 226, 216, 0.07)');
  this.DASHES.forEach(([x, y, width], i) => {
    const drift = Math.sin(view.time / (2400 + i * 90) + i) * 3;
    const faded = 0.4 + 0.6 * Math.abs(Math.sin(view.time / (1700 + i * 120)));
    if (faded < 0.45) return;
    this.rect(g, x + drift, y, width, 1, p.dash);
  });
  this.MIST.forEach((band) => {
    const travel = ((view.time / 1000) * band.speed) % (this.W + band.w);
    const x = travel - band.w;
    const row = band.h / 3;
    this.rect(g, x, band.y, band.w, row, `rgba(190, 220, 226, ${band.alpha * 0.35})`);
    this.rect(g, x, band.y + row, band.w, row, `rgba(190, 220, 226, ${band.alpha})`);
    this.rect(g, x, band.y + row * 2, band.w, row, `rgba(190, 220, 226, ${band.alpha * 0.35})`);
  });
};

MarshDraw.cellX = function cellX(x) { return x * this.CELL; };
MarshDraw.cellY = function cellY(y) { return this.TOP + y * this.CELL; };

MarshDraw.tiles = function tiles(g, view) {
  view.scene.tiles.forEach((tile) => {
    const x = this.cellX(tile.x);
    const y = this.cellY(tile.y);
    if (tile.kind === 'mirror') this.mirrorTile(g, x, y, tile.turn, view);
    if (tile.kind === 'prism') this.prismTile(g, x, y, tile.turn, view);
    if (tile.kind === 'reed') this.reedTile(g, x, y, view, tile);
    if (tile.kind === 'rune') this.runeTile(g, x, y, tile.facing, view);
    if (tile.kind === 'emitter') this.emitterTile(g, x, y, view);
  });
};

MarshDraw.stoneBase = function stoneBase(g, x, y) {
  const p = this.palette;
  this.rect(g, x + 1, y + 4, 14, 11, p.stoneEdge);
  this.rect(g, x + 1, y + 5, 14, 9, p.stone);
  this.rect(g, x + 3, y + 6, 10, 7, p.stoneFace);
};

MarshDraw.diagonal = function diagonal(g, x, y, turn, colour, sparkle) {
  for (let i = 0; i < 11; i += 1) {
    const dx = x + 3 + i;
    const dy = turn === 0 ? y + 13 - i : y + 3 + i;
    this.rect(g, dx, dy, 2, 2, colour);
    if (sparkle && i === 1) this.rect(g, dx, dy - 1, 2, 2, '#e6f2f4');
  }
};

MarshDraw.mirrorTile = function mirrorTile(g, x, y, turn, view) {
  const warm = view.time % 2600 < 1300;
  this.stoneBase(g, x, y);
  this.diagonal(g, x, y, turn, warm ? this.palette.stoneEdge : '#9dc0c4',
    this.attention(view, x, y, 'turn') > 0);
  this.rect(g, x + 2, y + 14, 12, 1, '#101f28');
};

MarshDraw.prismTile = function prismTile(g, x, y, turn, view) {
  const p = this.palette;
  const cx = x + 8;
  const cy = y + 8;
  for (let dy = -6; dy <= 6; dy += 1) {
    const span = 6 - Math.abs(dy);
    this.rect(g, cx - span, cy + dy, span * 2, 1, p.prism);
  }
  this.rect(g, cx - 3, cy - 3, 2, 6, p.prismBright);
  this.diagonal(g, x, y, turn, p.prismBright, this.attention(view, x, y, 'turn') > 0);
  const pulse = 0.5 + 0.5 * Math.sin(view.time / 900);
  this.glow(g, cx, cy, 9 + pulse * 3, 'rgba(190, 210, 250, 0.18)');
};

MarshDraw.reedTile = function reedTile(g, x, y, view, tile) {
  const p = this.palette;
  const flash = this.attention(view, x, y, 'absorb');
  for (let i = 0; i < 4; i += 1) {
    const sway = Math.sin(view.time / 900 + tile.x * 2 + i) * 1.6;
    const stalkX = x + 3 + i * 3 + sway;
    const height = 10 + ((i * 3 + tile.y) % 4);
    this.rect(g, stalkX, y + 15 - height, 1, height, flash > 0 ? '#9fd8b4' : p.reed);
    this.rect(g, stalkX, y + 15 - height, 2, 1, flash > 0 ? '#d6f0d8' : p.reedTip);
  }
};

MarshDraw.runeTile = function runeTile(g, x, y, facing, view) {
  const p = this.palette;
  const grid = { x: x / this.CELL, y: (y - this.TOP) / this.CELL };
  const lit = this.beamCells(view).has(`${grid.x},${grid.y}`);
  const colour = lit ? p.runeLit : p.rune;
  this.rect(g, x + 2, y + 2, 12, 12, '#22333c');
  this.rect(g, x + 3, y + 3, 10, 10, '#2b414b');
  const arrows = {
    right: [[4, 7], [5, 6], [6, 5], [7, 6], [8, 7], [7, 8], [6, 9], [5, 8], [4, 7]],
    left: [[11, 7], [10, 6], [9, 5], [8, 6], [7, 7], [8, 8], [9, 9], [10, 8], [11, 7]],
    up: [[7, 4], [6, 5], [5, 6], [6, 7], [7, 8], [8, 7], [9, 6], [8, 5], [7, 4]],
    down: [[7, 11], [6, 10], [5, 9], [6, 8], [7, 7], [8, 8], [9, 9], [8, 10], [7, 11]],
  };
  (arrows[facing] || arrows.up).forEach(([ax, ay]) => this.rect(g, x + ax - 1, y + ay - 1, 2, 2, colour));
  if (lit) this.glow(g, x + 8, y + 8, 10, 'rgba(207, 224, 255, 0.22)');
};

MarshDraw.emitterTile = function emitterTile(g, x, y, view) {
  const p = this.palette;
  this.rect(g, x + 2, y + 3, 12, 12, '#33474f');
  this.rect(g, x + 3, y + 4, 10, 10, '#20333c');
  this.disc(g, x + 8, y + 9, 4, p.moon);
  this.rect(g, x + 9, y + 6, 3, 6, '#20333c');
  const pulse = 0.5 + 0.5 * Math.sin(view.time / 800);
  this.glow(g, x + 8, y + 9, 9 + pulse * 2, 'rgba(220, 240, 225, 0.2)');
};

MarshDraw.lanterns = function lanterns(g, view) {
  const p = this.palette;
  view.scene.tiles.filter((tile) => tile.kind === 'lantern').forEach((tile) => {
    const x = this.cellX(tile.x);
    const y = this.cellY(tile.y);
    const lit = view.lit.has(`${tile.x},${tile.y}`);
    this.rect(g, x + 7, y + 9, 2, 7, p.lanternPost);
    this.rect(g, x + 5, y + 14, 6, 2, p.lanternPost);
    if (!lit) {
      this.rect(g, x + 5, y + 3, 6, 7, p.lanternDead);
      return;
    }
    const pulse = 0.72 + 0.28 * Math.sin(view.time / 1100 + tile.x);
    this.glow(g, x + 8, y + 6, 16 * pulse, 'rgba(255, 206, 130, 0.34)');
    this.rect(g, x + 5, y + 3, 6, 7, p.flame);
    this.rect(g, x + 6, y + 4, 4, 5, p.flameCore);
    this.rect(g, x + 5, y + 2, 6, 1, p.lanternPost);
    this.rect(g, x + 3, y + 17, 10, 2, 'rgba(255, 200, 130, 0.09)');
  });
};

MarshDraw.beams = function beams(g, view) {
  const p = this.palette;
  const warm = view.moonFull;
  view.scene.beams.forEach((beam) => {
    const points = this.beamPoints(beam);
    const pulse = 0.72 + 0.28 * Math.sin(view.time / 700);
    g.lineCap = 'round';
    g.globalAlpha = pulse;
    this.stroke(g, points, 7, warm ? p.beamGlowWarm : p.beamGlow);
    this.stroke(g, points, 2.6, warm ? p.beamWarm : p.beam);
    this.spark(g, points, view.time, warm);
    g.globalAlpha = 1;
    const end = points[points.length - 1];
    if (beam.end === 'reed' || beam.end === 'rune') {
      this.glow(g, end[0], end[1], 6 + pulse * 2, 'rgba(200, 232, 200, 0.28)');
    }
  });
};

MarshDraw.beamPoints = function beamPoints(beam) {
  const points = [];
  for (let i = 0; i + 1 < beam.path.length; i += 2) {
    points.push([this.cellX(beam.path[i]) + 8, this.cellY(beam.path[i + 1]) + 8]);
  }
  return points;
};

MarshDraw.stroke = function stroke(g, points, width, colour) {
  if (points.length === 0) return;
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) g.lineTo(points[i][0], points[i][1]);
  g.stroke();
};

MarshDraw.spark = function spark(g, points, time, warm) {
  if (points.length < 2) return;
  const travel = this.along(points, ((time / 1500) % 1));
  g.strokeStyle = warm ? '#fff0cc' : '#f2ffe0';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(travel[0], travel[1], 2.4, 0, Math.PI * 2);
  g.stroke();
};

MarshDraw.along = function along(points, fraction) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  let want = fraction * total;
  for (let i = 1; i < points.length; i += 1) {
    const length = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (want <= length) {
      const t = length === 0 ? 0 : want / length;
      return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t,
        points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t];
    }
    want -= length;
  }
  return points[points.length - 1];
};

window.MarshDraw = MarshDraw;
