// night-a11y-scope — the small JS-scope reader night-a11y's audio check uses.
//
// It is not a parser. It masks comments and string bodies, frames the code by
// walking braces, and follows a rough call graph from gesture listeners, which
// is enough to tell "AudioContext made on a tap" from "made at page load".

const QUOTES = new Set(["'", '"', '`']);

// Blank one character, keeping newlines so line structure (and offsets) hold.
const blank = (src, out, i) => { if (src[i] !== '\n') out[i] = ' '; };

// One step of the masking state machine per mode: each returns [mode, step].
const MASK_STEPS = {
  code(src, out, i) {
    const pair = src[i] + src[i + 1];
    if (pair === '//') return ['line', 2];
    if (pair === '/*') return ['block', 2];
    if (QUOTES.has(src[i])) return [src[i], 1];
    return ['code', 1];
  },
  line(src, out, i) {
    if (src[i] === '\n') return ['code', 1];
    out[i] = ' ';
    return ['line', 1];
  },
  block(src, out, i) {
    if (src[i] === '*' && src[i + 1] === '/') { out[i] = out[i + 1] = ' '; return ['code', 2]; }
    blank(src, out, i);
    return ['block', 1];
  },
};

function quoteStep(src, out, i, quote) {
  if (src[i] === '\\') { out[i] = ' '; blank(src, out, i + 1); return [quote, 2]; }
  if (src[i] === quote) return ['code', 1];
  blank(src, out, i);
  return [quote, 1];
}

// Strip comments and string bodies to spaces so brace/scope arithmetic is not
// fooled by a brace inside a string. Length is preserved, so offsets hold.
//
// One exception: the event name in addEventListener('click', …). The gesture
// check reads it from the masked source, so it is kept. Only a call that is
// itself code counts: the masked text still spells "addEventListener" there,
// but not inside a comment or a string.
const EVENT_LITERAL = /addEventListener\s*\(\s*(['"`])(?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup|keypress|input|change|submit)\1/g;

function keepEventNames(src, out) {
  for (const m of src.matchAll(EVENT_LITERAL)) {
    if (!out.slice(m.index, m.index + 16).join('').startsWith('addEventListener')) continue;
    for (let i = m[0].indexOf(m[1]) + 1 + m.index; i < m.index + m[0].length - 1; i++) out[i] = src[i];
  }
}

export function mask(src) {
  const out = src.split('');
  let i = 0;
  let mode = 'code'; // 'code' | 'line' | 'block' | quote char
  while (i < src.length) {
    const stepper = MASK_STEPS[mode];
    const [next, step] = stepper ? stepper(src, out, i) : quoteStep(src, out, i, mode);
    mode = next;
    i += step;
  }
  keepEventNames(src, out);
  return out.join('');
}

// How a "{" is labelled, from the code just before it: first match wins.
// A number names the capture group that holds the label.
const LABELS = [
  [/function\s+([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*$/, 1],
  [/([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*)?\([^()]*\)\s*=>\s*$/, 1],
  [/([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?(?:function\s*)?\([^()]*\)\s*=>\s*$/, 1],
  [/([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\s*\([^()]*\)\s*$/, 1],
  [/([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*$/, 1],
  [/=>\s*$/, '<arrow>'],
  [/\bfunction\s*\(?[^()]*\)?\s*$/, '<function>'],
];

function labelFor(before) {
  const tail = before.slice(-160);
  for (const [re, label] of LABELS) {
    const m = tail.match(re);
    if (m) return typeof label === 'number' ? m[label] : label;
  }
  return '<block>';
}

// Frame a piece of JS by walking braces over the masked source: label, body
// range, and the identifiers it calls.
// What each brace does to the open-frame stack.
const BRACES = {
  '{'(src, i, stack, out) {
    const f = { label: labelFor(src.slice(0, i)), start: i, end: -1, calls: new Set() };
    stack.push(f); out.push(f);
  },
  '}'(src, i, stack) {
    const f = stack.pop(); if (f) f.end = i;
  },
};

function braceFrames(src) {
  const stack = [];
  const out = [];
  for (let i = 0; i < src.length; i++) BRACES[src[i]]?.(src, i, stack, out);
  return out;
}

export function frames(src) {
  const out = braceFrames(src);
  for (const f of out) {
    if (f.end < 0) f.end = src.length;
    for (const m of src.slice(f.start, f.end).matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) f.calls.add(m[1]);
  }
  return out;
}

const GESTURE_HOOK = /(?:addEventListener\s*\(\s*['"`](?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup|keypress|input|change|submit)['"`]\s*,|\.on(?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup)\s*=\s*)/g;

// Frames a gesture listener runs directly: inline handlers right after the
// hook, and named handlers declared elsewhere ("click -> wake").
function gestureFrames(src, fs) {
  const found = new Set();
  const names = new Set();
  for (const m of src.matchAll(GESTURE_HOOK)) {
    const after = m.index + m[0].length;
    const nameM = src.slice(after, after + 80).match(/^\s*([A-Za-z_$][\w$]*)\s*[,)]/);
    if (nameM) names.add(nameM[1]);
    for (const f of fs) if (f.start >= after && f.start - after < 40) found.add(f);
  }
  for (const f of fs) if (names.has(f.label)) found.add(f);
  return found;
}

// Walk the call graph: a gesture handler may call a helper that makes audio.
function reachable(fs, start) {
  const reached = new Set(start);
  const queue = [...start];
  while (queue.length) {
    const f = queue.pop();
    for (const c of f.calls) {
      for (const g of fs) if (g.label === c && !reached.has(g)) { reached.add(g); queue.push(g); }
    }
  }
  return reached;
}

function locate(fs, reached, pos) {
  const chain = fs.filter((f) => f.start < pos && pos <= f.end).sort((a, b) => b.start - a.start);
  if (!chain.length) return { ok: false, label: 'the top level (page load)' };
  const ok = chain.some((f) => reached.has(f));
  return { ok, label: ok ? chain[0].label : `${chain[0].label}, which only the top level runs` };
}

// Is each position (in masked source src) inside a function a gesture reaches?
export function behindGesture(src, positions) {
  const fs = frames(src);
  const reached = reachable(fs, gestureFrames(src, fs));
  return positions.map((pos) => locate(fs, reached, pos));
}
