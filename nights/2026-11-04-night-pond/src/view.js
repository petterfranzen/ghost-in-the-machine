/* Night Pond — the drawing half.
 *
 * The pond's state comes from Pond.res (compiled to Pond.res.js); this file
 * only paints it, at 320x320, upscaled with nearest-neighbour so every edge
 * stays a pixel. Everything is procedural: no sprites, no images, no fonts. */

export const W = 320;
export const H = 320;

const CX = 160, CY = 162, RX = 151, RY = 147;

const PAL = {
  bank: ["#0a1410", "#0f1d17", "#14261b", "#193020"],
  damp: "#091310",
  water: ["#173d44", "#12333d", "#0d2731", "#081d27"],
  shore: "132, 198, 186",
  pad: ["#16291f", "#1d3427", "#26412f"],
  ripple: "190, 232, 220",
  mote: "255, 226, 172",
  glow: "255, 202, 138",
};

/* the same wobbly rim the simulation uses, so taps land where they look */
function wobble(a) {
  return 1.0 + 0.035 * Math.sin(a * 3.0 + 1.1) + 0.022 * Math.sin(a * 5.0 - 0.4);
}
function depthAt(x, y) {
  const dx = (x - CX) / RX;
  const dy = (y - CY) / RY;
  return Math.sqrt(dx * dx + dy * dy);
}
function rimDepth(x, y) {
  return depthAt(x, y) / wobble(Math.atan2(y - CY, x - CX));
}

/* a small deterministic noise, so the bank looks the same every reload */
function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/* smooth-ish value noise on a lattice: gives the water slow, large patches of
 * tone instead of an even wash, and the bank some soft variation */
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  const top = a + (b - a) * sx;
  const bot = c + (d - c) * sx;
  return top + (bot - top) * sy;
}

function paintStill(ctx) {
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const parse = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const bank = PAL.bank.map(parse);
  const water = PAL.water.map(parse);
  const damp = parse(PAL.damp);
  const shore = PAL.shore.split(",").map((v) => parseInt(v, 10));

  const put = (i, c, a) => {
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = a === undefined ? 255 : a;
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = rimDepth(x + 0.5, y + 0.5);
      const n = hash(x, y);

      if (r < 1.0) {
        /* water: dark in the middle, a shade lighter as it shoals, with a
         * dithered edge so the bands read as pixel-art depth, not a gradient */
        const deep = Math.min(1, (1 - r) / 0.78);
        const mottle = (vnoise(x * 0.055, y * 0.055) - 0.5) * 1.5;
        let band = Math.floor((1 - deep) * 3.2 + (n - 0.5) * 0.5 + mottle);
        band = Math.max(0, Math.min(3, band));
        put(i, water[band]);
        /* the water draws a little darker just inside its own edge */
        if (r > 0.90) {
          const k = (r - 0.90) / 0.10;
          d[i] = Math.round(d[i] * (1 - 0.28 * k));
          d[i + 1] = Math.round(d[i + 1] * (1 - 0.26 * k));
          d[i + 2] = Math.round(d[i + 2] * (1 - 0.22 * k));
        }
        /* one last, quiet line of light where water meets bank */
        if (r > 0.985 && n > 0.86) {
          const a = 0.16 + (n - 0.86) * 0.6;
          d[i] = Math.round(d[i] * (1 - a) + shore[0] * a);
          d[i + 1] = Math.round(d[i + 1] * (1 - a) + shore[1] * a);
          d[i + 2] = Math.round(d[i + 2] * (1 - a) + shore[2] * a);
        }
      } else if (r < 1.02) {
        /* damp earth right at the lip of the pond */
        put(i, damp);
      } else {
        /* the bank: deep moss, lighter tufts scattered on a dither */
        const t = Math.min(1, (r - 1.02) / 0.55);
        const tuft = hash((x / 3) | 0, (y / 3) | 0);
        let band = 1 + Math.floor(t * 1.6 + (n - 0.5) * 0.7);
        if (tuft > 0.84 && n > 0.45) band += 1;
        band = Math.max(0, Math.min(3, band));
        put(i, bank[band]);
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  /* a few stones under the surface, only just visible through the water */
  const sunk = [[96, 250, 9], [214, 262, 7], [262, 130, 6], [70, 196, 5], [180, 76, 5]];
  for (const [sx, sy, sr] of sunk) {
    for (let dy = -sr; dy <= sr; dy++) {
      for (let dx = -sr; dx <= sr; dx++) {
        const dd = (dx * dx) / (sr * sr) + (dy * dy) / (sr * sr * 0.7);
        if (dd > 1) continue;
        ctx.fillStyle = dd > 0.72 ? "rgba(18, 40, 44, 0.55)" : "rgba(30, 56, 58, 0.42)";
        ctx.fillRect(sx + dx, sy + dy, 1, 1);
      }
    }
  }

  /* a few pale stones on the bank, so it is not just moss */
  const stones = [[36, 88, 4], [282, 186, 5], [130, 300, 4], [214, 34, 3], [58, 236, 3]];
  for (const [sx, sy, sr] of stones) {
    for (let dy = -sr; dy <= sr; dy++) {
      for (let dx = -sr; dx <= sr; dx++) {
        if (dx * dx + dy * dy > sr * sr) continue;
        const shade = dy < 0 ? 1 : 0;
        ctx.fillStyle = shade ? "#2b3a31" : "#1f2d26";
        ctx.fillRect(sx + dx, sy + dy, 1, 1);
      }
    }
  }
}

/* lily pads: flat discs with a notch cut toward the middle of the pond */
function drawPads(ctx) {
  const pads = [
    [66, 120, 13], [104, 212, 10], [226, 112, 12],
    [258, 200, 9], [176, 246, 9], [140, 96, 8], [92, 158, 6],
  ];
  for (const [px, py, pr] of pads) {
    const notch = Math.atan2(CY - py, CX - px) + 0.25;
    for (let dy = -pr; dy <= pr; dy++) {
      for (let dx = -pr; dx <= pr; dx++) {
        if (dx * dx + dy * dy > pr * pr) continue;
        const a = Math.atan2(dy, dx);
        const da = Math.abs(((a - notch + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (da > Math.PI - 0.42) continue;
        const shade = dy < -pr * 0.3 ? 0 : dy > pr * 0.45 ? 2 : 1;
        ctx.fillStyle = PAL.pad[shade];
        ctx.fillRect(px + dx, py + dy, 1, 1);
      }
    }
    /* a pale rim on the upper-left, a darker lip along the notch */
    ctx.fillStyle = "rgba(126, 156, 112, 0.22)";
    for (let i = -pr + 2; i < pr - 2; i++) {
      const yy = py - Math.round(Math.sqrt(Math.max(0, pr * pr - i * i)) * 0.92);
      ctx.fillRect(px + i, yy, 1, 1);
    }
    ctx.fillStyle = "rgba(10, 24, 20, 0.5)";
    ctx.fillRect(px - 1, py + pr - 1, 2, 1);
  }
}

/* reeds and grasses on the bank, drawn as a few thin stalks */
function drawReeds(ctx) {
  const stalks = [
    [22, 128, 11], [30, 150, 7], [296, 152, 9], [303, 168, 6],
    [140, 22, 6], [158, 18, 5], [92, 296, 7], [238, 300, 6],
    [274, 84, 5], [46, 210, 5], [186, 312, 5], [118, 316, 4],
  ];
  for (const [x, y, h] of stalks) {
    const bend = Math.sin(x * 0.7) * 2;
    ctx.fillStyle = "rgba(52, 78, 54, 0.8)";
    for (let i = 0; i < h; i++) {
      ctx.fillRect(x + Math.round((bend * i) / h), y - i, 1, 1);
    }
    ctx.fillStyle = "rgba(104, 126, 82, 0.7)";
    ctx.fillRect(x + bend, y - h, 1, 1);
  }
}

const KOI = [
  { body: "#e59a5e", belly: "#f8dcb6", fin: "#f0bb8e", spot: "#c9713a" },
  { body: "#e6e6df", belly: "#fbfbf4", fin: "#f0e7d6", spot: "#c9703f" },
  { body: "#bd8143", belly: "#eed0a4", fin: "#dda86f", spot: "#8d5a2a" },
];

/* one koi, drawn in its own little rotated frame: a dark silhouette under it,
 * a tapered body, a paler belly, a blunt head with one eye, trailing tail. */
function drawKoi(ctx, k, t) {
  const c = KOI[Math.round(k.hue) % KOI.length];
  const s = k.size * 1.3;
  const flick = Math.sin(t * 2.4 + k.x * 0.13) * 1.7;

  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(k.ang);

  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#04141a";
  ctx.fillRect(-7 * s, -1.6 * s + 1.6, 15 * s, 3.2 * s);

  ctx.globalAlpha = 1;
  ctx.fillStyle = c.body;
  ctx.fillRect(-5 * s, -2.0 * s, 7 * s, 4.0 * s); // shoulders
  ctx.fillRect(-7 * s, -1.2 * s, 2.6 * s, 2.4 * s); // tail base
  ctx.fillRect(2 * s, -1.7 * s, 3.6 * s, 3.4 * s); // head
  ctx.fillStyle = c.belly;
  ctx.fillRect(-4.6 * s, 0.2 * s, 8 * s, 1.5 * s);
  /* one soft patch of colour, so the three koi feel like individuals */
  ctx.fillStyle = c.spot;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(-2.2 * s, -2.0 * s, 2.2 * s, 2.4 * s);
  ctx.globalAlpha = 1;
  /* eye */
  ctx.fillStyle = "#101d24";
  ctx.fillRect(4.4 * s, -1.2 * s, 1.0 * s, 1.0 * s);
  /* pectoral fins and a lazily flicking tail */
  ctx.fillStyle = c.fin;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0.4 * s, -2.9 * s, 2.2 * s, 1.1 * s);
  ctx.fillRect(0.4 * s, 1.9 * s, 2.2 * s, 1.1 * s);
  ctx.fillRect(-9.0 * s, -1.4 * s + flick, 2.4 * s, 2.8 * s);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function glow(ctx, x, y, r, rgb, alpha) {
  if (alpha <= 0.002) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  g.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.4})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/* a stone lantern seen from above: a round, slightly worn stone with a warm
 * heart. Asleep it is a cool grey lump; awake it holds a small flame. */
const STONE_ROWS = [5, 8, 11, 13, 13, 13, 13, 11, 8, 5];
function drawLantern(ctx, l) {
  const w = l.awake;
  const x = Math.round(l.x);
  const y = Math.round(l.y);
  const cool = [34, 44, 42];
  const warm = [58, 52, 38];
  const mix = (c, m) => [
    Math.round(c[0] + (m[0] - c[0]) * w),
    Math.round(c[1] + (m[1] - c[1]) * w),
    Math.round(c[2] + (m[2] - c[2]) * w),
  ];
  const outer = mix(cool, warm);
  const inner = mix([44, 56, 54], [92, 78, 52]);
  const top = mix([52, 64, 60], [110, 92, 62]);

  STONE_ROWS.forEach((rowW, i) => {
    const yy = y - 5 + i;
    const off = Math.round((13 - rowW) / 2) - 6;
    ctx.fillStyle = `rgb(${outer[0]}, ${outer[1]}, ${outer[2]})`;
    ctx.fillRect(x + off, yy, rowW, 1);
    if (rowW >= 11 && i > 1 && i < 8) {
      ctx.fillStyle = `rgb(${inner[0]}, ${inner[1]}, ${inner[2]})`;
      ctx.fillRect(x + off + 2, yy, rowW - 4, 1);
    }
  });
  /* a hint of moonlight along the top edge, and a dark lip below */
  ctx.fillStyle = `rgba(${top[0]}, ${top[1]}, ${top[2]}, 0.9)`;
  ctx.fillRect(x - 3, y - 4, 7, 1);
  ctx.fillStyle = "rgba(6, 16, 18, 0.55)";
  ctx.fillRect(x - 4, y + 5, 9, 1);
  if (w < 0.05) {
    /* asleep: one cool spark, so a patient thumb can still find it */
    ctx.fillStyle = "rgba(126, 158, 150, 0.55)";
    ctx.fillRect(x, y - 1, 1, 1);
  }
}

export function createView(canvas) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = false;

  /* the still parts are painted once, then blitted every frame */
  const still = document.createElement("canvas");
  still.width = W;
  still.height = H;
  const sctx = still.getContext("2d", { alpha: false });
  paintStill(sctx);
  drawPads(sctx);
  drawReeds(sctx);

  /* drifting glints on the surface, and dust in the air above it */
  const glints = [];
  const dust = [];
  for (let i = 0; i < 30; i++) {
    glints.push({
      x: 20 + hash(i, 3) * 280,
      y: 40 + hash(i, 9) * 250,
      ph: hash(i, 17) * 6.28,
      sp: 0.4 + hash(i, 23) * 0.9,
    });
  }
  for (let i = 0; i < 16; i++) {
    dust.push({
      x: hash(i, 31) * 300 + 10,
      y: hash(i, 37) * 300 + 10,
      ph: hash(i, 41) * 6.28,
      sp: 0.12 + hash(i, 43) * 0.14,
    });
  }

  function draw(st, t) {
    /* a tap settles the whole scene by a hair, then it breathes back */
    const s = 1 - 0.014 * st.settle;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAL.bank[0];
    ctx.fillRect(0, 0, W, H);
    ctx.setTransform(s, 0, 0, s, CX * (1 - s), CY * (1 - s));

    ctx.drawImage(still, 0, 0);

    /* slow glints, a little brighter once the pond has woken */
    for (const g of glints) {
      if (rimDepth(g.x, g.y) > 0.94) continue;
      const a = 0.04 + 0.075 * (0.5 + 0.5 * Math.sin(t * 0.55 * g.sp + g.ph));
      ctx.fillStyle = `rgba(148, 206, 196, ${a})`;
      ctx.fillRect(Math.round(g.x), Math.round(g.y), 2, 1);
    }

    /* dust drifting in the night air, above everything */
    for (const p of dust) {
      const dx = Math.sin(t * p.sp + p.ph) * 9;
      const dy = ((t * p.sp * 6 + p.ph * 40) % 340) - 10;
      const a = 0.12 + 0.1 * Math.sin(t * 0.5 + p.ph);
      ctx.fillStyle = `rgba(214, 226, 196, ${a})`;
      ctx.fillRect(Math.round(p.x + dx), Math.round(340 - dy), 1, 1);
    }

    /* lanterns: dark stones while asleep, warm little lights once woken */
    for (const l of st.lanterns) {
      const w = l.awake;
      glow(ctx, l.x, l.y, 16 + 30 * w, PAL.glow, 0.05 + 0.3 * w);
      drawLantern(ctx, l);
      if (w > 0.05) {
        const pulse = 0.72 + 0.28 * Math.sin(t * 1.1 + l.x * 0.2);
        ctx.fillStyle = `rgba(255, 222, 168, ${0.3 + 0.65 * w * pulse})`;
        ctx.fillRect(Math.round(l.x) - 2, Math.round(l.y) - 2, 4, 4);
        ctx.fillStyle = `rgba(255, 248, 220, ${0.45 + 0.55 * w})`;
        ctx.fillRect(Math.round(l.x), Math.round(l.y) - 1, 2, 2);
      }
    }

    /* motes lifting off a woken lantern */
    for (const m of st.moteList) {
      const p = m.age / m.life;
      const a = Math.sin(Math.min(1, p) * Math.PI) * 0.85;
      ctx.fillStyle = `rgba(${PAL.mote}, ${a})`;
      ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
      ctx.fillStyle = `rgba(${PAL.mote}, ${a * 0.25})`;
      ctx.fillRect(Math.round(m.x) - 1, Math.round(m.y), 3, 1);
    }

    /* koi */
    for (const k of st.koi) drawKoi(ctx, k, t);

    /* a seed sinking toward a sleeping lantern */
    for (const sd of st.seedList) {
      glow(ctx, sd.x, sd.y, 9, PAL.glow, 0.3);
      ctx.fillStyle = "rgba(255, 240, 206, 0.95)";
      ctx.fillRect(Math.round(sd.x) - 1, Math.round(sd.y) - 1, 2, 2);
    }

    /* ripples: three rings per tap, each slower and fainter than the last */
    for (const r of st.rippleList) {
      const p = (r.age - r.delay) / (r.life - r.delay);
      if (p < 0 || p > 1) continue;
      const e = 1 - Math.pow(1 - p, 2.2);
      const rad = 2 + r.maxR * e;
      const a = r.str * Math.pow(1 - p, 1.7) * 0.5;
      ctx.strokeStyle = `rgba(${PAL.ripple}, ${a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* the tap's own bloom: warm, brief, never a flash */
    if (st.bloom > 0.01) {
      const b = st.bloom;
      glow(ctx, st.bloomX, st.bloomY, 18 + 20 * (1 - b), "255, 236, 200", 0.28 * b);
      ctx.fillStyle = `rgba(255, 246, 224, ${0.3 * b})`;
      ctx.fillRect(Math.round(st.bloomX) - 1, Math.round(st.bloomY) - 1, 3, 3);
    }

    /* once the pond is awake, a slow warmth rising from the middle */
    if (st.complete) {
      const age = Math.max(0, st.t - st.doneAt);
      const a = Math.min(0.12, age * 0.025);
      glow(ctx, CX, CY, 200, "255, 206, 148", a);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  return { draw };
}
