// Sparks, ripples, fireflies and the heron: what happens after a touch.
MarshDraw.beamCells = function beamCells(view) {
  if (view.beamSet) return view.beamSet;
  const cells = new Set();
  view.scene.beams.forEach((beam) => {
    for (let i = 0; i + 1 < beam.path.length; i += 2) cells.add(`${beam.path[i]},${beam.path[i + 1]}`);
  });
  view.beamSet = cells;
  return cells;
};

MarshDraw.attention = function attention(view, x, y, kind) {
  const cell = `${x / this.CELL},${(y - this.TOP) / this.CELL}`;
  let strength = 0;
  view.fx.forEach((fx) => {
    if (fx.kind !== kind || fx.cell !== cell) return;
    const age = (view.time - fx.start) / fx.life;
    if (age >= 0 && age < 1) strength = Math.max(strength, 1 - age);
  });
  return strength;
};

MarshDraw.motes = function motes(g, view) {
  const seconds = view.time / 1000;
  view.motes.forEach((mote) => {
    const x = mote.x + Math.sin(seconds * 0.6 + mote.phase) * 7;
    const y = mote.y + Math.cos(seconds * 0.45 + mote.phase * 1.7) * 5;
    const life = mote.fade === undefined ? 1 : mote.fade;
    if (life <= 0.02) return;
    this.glow(g, x, y, 5 * life, `rgba(255, 233, 168, ${0.22 * life})`);
    this.rect(g, x, y, 1, 1, this.palette.mote);
  });
};

MarshDraw.effects = function effects(g, view) {
  view.fx.forEach((fx) => {
    const age = (view.time - fx.start) / fx.life;
    if (age < 0 || age >= 1) return;
    if (fx.kind === 'ripple') this.ripple(g, fx, age);
    if (fx.kind === 'burst') this.burst(g, fx, age);
    if (fx.kind === 'turn') this.turnMark(g, fx, age);
    if (fx.kind === 'absorb') this.glow(g, fx.x, fx.y, 9, `rgba(180, 230, 190, ${0.34 * (1 - age)})`);
  });
};

MarshDraw.ripple = function ripple(g, fx, age) {
  const radius = 2 + age * 26;
  const alpha = (1 - age) * 0.5;
  for (let a = 0; a < 18; a += 1) {
    const angle = (a / 18) * Math.PI * 2;
    this.rect(g, fx.x + Math.cos(angle) * radius, fx.y + Math.sin(angle) * radius * 0.6, 1, 1,
      `rgba(190, 226, 226, ${alpha})`);
  }
};

MarshDraw.burst = function burst(g, fx, age) {
  const rise = age * 16;
  this.glow(g, fx.x, fx.y - rise, 11, `rgba(255, 226, 160, ${0.3 * (1 - age)})`);
  for (let i = 0; i < 6; i += 1) {
    const spread = Math.sin(i * 2.1) * 7;
    this.rect(g, fx.x + spread, fx.y - rise - i * 2, 1, 1, `rgba(255, 244, 210, ${(1 - age) * 0.9})`);
  }
};

MarshDraw.turnMark = function turnMark(g, fx, age) {
  const radius = 3 + age * 9;
  const alpha = (1 - age) * 0.7;
  for (let a = 0; a < 12; a += 1) {
    const angle = (a / 12) * Math.PI * 2;
    this.rect(g, fx.x + Math.cos(angle) * radius, fx.y + Math.sin(angle) * radius, 1, 1,
      `rgba(214, 240, 244, ${alpha})`);
  }
};

MarshDraw.wash = function wash(g, view) {
  if (view.celebrate) this.celebration(g, view, Math.min(1, (view.time - view.celebrate) / 3200));
  if (view.ending) this.ending(g, view);
  if (view.fade > 0) this.rect(g, 0, 0, this.W, this.H, `rgba(4, 12, 16, ${view.fade})`);
};

MarshDraw.celebration = function celebration(g, view, age) {
  const rise = age * this.H * 0.9;
  this.rect(g, 0, this.H - rise, this.W, rise, `rgba(255, 214, 150, ${0.12 * (1 - age)})`);
  this.heron(g, -16 + age * (this.W + 32), 22 + Math.sin(age * 7) * 4, age);
};

MarshDraw.ending = function ending(g, view) {
  const breathe = 0.05 + 0.04 * Math.sin(view.time / 2200);
  this.rect(g, 0, 0, this.W, this.H, `rgba(255, 206, 140, ${breathe})`);
  this.heron(g, 40 + Math.sin(view.time / 4200) * 26, 26 + Math.sin(view.time / 2600) * 2, view.time / 300);
};

MarshDraw.heron = function heron(g, x, y, age) {
  const flap = Math.sin(age * 16) * 3;
  const body = this.palette.silver;
  this.rect(g, x - 5, y + 2, 6, 1, body);
  this.rect(g, x - 4, y + 3, 5, 1, body);
  this.rect(g, x + 1, y, 5, 2, body);
  this.rect(g, x + 6, y - 1, 2, 1, '#a9bfcb');
  this.rect(g, x + 1, y + 3 - flap, 4, 1, '#bcd2dc');
  this.rect(g, x + 1, y + flap, 4, 1, '#bcd2dc');
};
