// Smoke check for Fireflies: run the *compiled* dist/app.js in Node against a
// tiny DOM stub, then assert the things the Elm compiler cannot: that the scene
// actually renders, that a tap lifts fireflies, that they drift and fade, and
// that the two buttons do what they say. Stdlib only — no jsdom, no npm install.
//
//   node tests/smoke.mjs
//
// It is not part of build.sh: CI only needs the compile plus the artefact checks.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(here, '..', 'dist', 'app.js');

let failures = 0;
const check = (name, cond, extra = '') => {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`);
  }
};

// ---------------------------------------------------------------- DOM stub ---

let fakeNow = 0;
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(fakeNow);
    else super(...args);
  }
  static now() {
    return fakeNow;
  }
}

const createNode = (tagName, nodeType = 1) => {
  const node = {
    nodeType,
    tagName: nodeType === 1 ? tagName.toUpperCase() : tagName,
    childNodes: [],
    parentNode: null,
    style: {},
    __attrs: Object.create(null),
    __handlers: Object.create(null),
    get attributes() {
      return Object.keys(node.__attrs).map((name) => ({ name, value: node.__attrs[name] }));
    },
    get textContent() {
      return node.nodeType === 3 ? node.__text : node.childNodes.map((k) => k.textContent).join('');
    },
    setAttribute(name, value) {
      node.__attrs[name] = String(value);
    },
    removeAttribute(name) {
      delete node.__attrs[name];
    },
    setAttributeNS(_ns, name, value) {
      node.__attrs[name] = String(value);
    },
    removeAttributeNS(_ns, name) {
      delete node.__attrs[name];
    },
    getAttribute(name) {
      return name in node.__attrs ? node.__attrs[name] : null;
    },
    addEventListener(name, fn) {
      (node.__handlers[name] = node.__handlers[name] || []).push(fn);
    },
    removeEventListener(name, fn) {
      const list = node.__handlers[name];
      if (!list) return;
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    },
    dispatch(name, event) {
      const list = (node.__handlers[name] || []).slice();
      if (node.parentNode && !event.__stopped) node.parentNode.dispatch(name, event);
      for (const fn of list) fn(event);
    },
    appendChild(child) {
      if (child.nodeType === 11) {
        for (const inner of child.childNodes.slice()) node.appendChild(inner);
        return child;
      }
      child.parentNode = node;
      node.childNodes.push(child);
      return child;
    },
    insertBefore(child, ref) {
      const i = ref ? node.childNodes.indexOf(ref) : -1;
      child.parentNode = node;
      if (i < 0) node.childNodes.push(child);
      else node.childNodes.splice(i, 0, child);
      return child;
    },
    removeChild(child) {
      const i = node.childNodes.indexOf(child);
      if (i >= 0) node.childNodes.splice(i, 1);
      child.parentNode = null;
      return child;
    },
    replaceChild(next, old) {
      const i = node.childNodes.indexOf(old);
      if (i < 0) throw new Error('replaceChild: old node not found');
      next.parentNode = node;
      node.childNodes[i] = next;
      old.parentNode = null;
      return old;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844, x: 0, y: 0 };
    },
  };
  if (nodeType === 3) node.__text = tagName;
  return node;
};

const createTextNode = (text) => {
  const n = createNode('#text', 3);
  n.__text = text;
  return n;
};

const documentElement = createNode('html');
documentElement.clientWidth = 390;
documentElement.clientHeight = 844;

const document = {
  nodeType: 9,
  documentElement,
  createElement: (tag) => createNode(tag),
  createElementNS: (_ns, tag) => createNode(tag),
  createTextNode,
  createDocumentFragment: () => {
    const f = createNode('#fragment', 11);
    return f;
  },
  getElementById: (id) => (id === 'stage' ? container : null),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createNode('body'),
};

const container = createNode('div');

const frames = [];
const window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  navigator: { userAgent: 'node-smoke' },
  pageXOffset: 0,
  pageYOffset: 0,
  requestAnimationFrame: (cb) => frames.push(cb) - 1,
  cancelAnimationFrame: () => {},
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
};

const sandbox = {
  window,
  document,
  requestAnimationFrame: window.requestAnimationFrame,
  cancelAnimationFrame: window.cancelAnimationFrame,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Date: FakeDate,
  console,
  performance: { now: () => fakeNow },
};
sandbox.globalThis = sandbox;

const code = fs.readFileSync(appPath, 'utf8');
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'dist/app.js' });

// ------------------------------------------------------------------ helpers --

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const frame = async (ms = 16.7) => {
  fakeNow += ms;
  const batch = frames.splice(0, frames.length);
  for (const cb of batch) cb(fakeNow);
  await settle();
};

const runFrames = async (n, ms = 16.7) => {
  for (let i = 0; i < n; i += 1) await frame(ms);
};

const walk = (node, out = []) => {
  out.push(node);
  for (const kid of node.childNodes) walk(kid, out);
  return out;
};

const all = () => walk(container);
const byTag = (tag) => all().filter((n) => n.tagName === tag.toUpperCase());
const classOf = (n) => `${n.__attrs.class || ''} ${n.className || ''}`;
const groupByClass = (cls) => all().filter((n) => classOf(n).split(/\s+/).includes(cls));
const flies = () => groupByClass('flies').flatMap((g) => g.childNodes);
const buttons = () => byTag('button');
const button = (label) =>
  buttons().find((b) => b.childNodes.some((k) => k.__text === label));
const attr = (node, name) => node.__attrs[name];

const pointer = (name, x, y) => {
  const event = { clientX: x, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true };
  container.dispatch(name, event);
};

const finite = (v) => typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(Number(v));

// -------------------------------------------------------------- the checks --

console.log('fireflies — smoke check on dist/app.js\n');

check('app.js is a real bundle', code.length > 50_000, `${code.length} bytes`);
check('Elm runtime is present', typeof sandbox.Elm === 'object' && !!sandbox.Elm.Main);

sandbox.Elm.Main.init({ node: container, flags: false });
await settle();

check('mounted into the container', classOf(container).includes('stage'), classOf(container).trim());
check('stage listens for pointerdown', !!container.__handlers.pointerdown);
check('stage listens for pointermove', !!container.__handlers.pointermove);
check('stage listens for pointerup', !!container.__handlers.pointerup);

await runFrames(4);

const svg = byTag('svg')[0];
check('renders one svg scene', !!svg);
check('scene fills the viewport', attr(svg, 'viewBox') === '0 0 390 844', attr(svg, 'viewBox'));
check('sky gradient is defined', all().some((n) => attr(n, 'id') === 'sky'));
check('both glow gradients are defined',
  ['glowWarm', 'glowCool'].every((id) => all().some((n) => attr(n, 'id') === id)));
check('star field is drawn', groupByClass('star').length === 64, `${groupByClass('star').length} stars`);
check('grass is drawn', byTag('path').length >= 32, `${byTag('path').length} paths`);
check('no fireflies before anyone taps', flies().length === 0, `${flies().length} flies`);
const hint = groupByClass('hint')[0];
check('the hint starts visible', !!hint && !classOf(hint).includes('gone'), hint && classOf(hint).trim());

// -- one tap lifts a hush -----------------------------------------------------

pointer('pointerdown', 200, 300);
await settle();
await runFrames(2);

const first = flies();
check('a tap lifts a hush of fireflies', first.length === 7, `${first.length} flies`);
check('every firefly uses a defined glow',
  first.every((f) => ['url(#glowWarm)', 'url(#glowCool)'].includes(attr(f, 'fill'))));
check('every firefly is inside the viewport',
  first.every((f) => Number(attr(f, 'cx')) >= 0 && Number(attr(f, 'cx')) <= 390));
check('every firefly radius is finite and small',
  first.every((f) => finite(Number(attr(f, 'r'))) && Number(attr(f, 'r')) > 0 && Number(attr(f, 'r')) < 40));

const posBefore = first.map((f) => [attr(f, 'cx'), attr(f, 'cy')]);
await runFrames(120); // two seconds
const after = flies();
check('fireflies are still there two seconds later', after.length >= 6, `${after.length} flies`);
check('fireflies drift rather than sit still',
  after.some((f, i) => posBefore[i] && (attr(f, 'cx') !== posBefore[i][0] || attr(f, 'cy') !== posBefore[i][1])));
check('fireflies drift slowly (under 40px in 2s)',
  after.every((f, i) => {
    if (!posBefore[i]) return true;
    const dx = Number(attr(f, 'cx')) - Number(posBefore[i][0]);
    const dy = Number(attr(f, 'cy')) - Number(posBefore[i][1]);
    return Math.hypot(dx, dy) < 40;
  }));
check('opacity stays a real number in range',
  after.every((f) => finite(Number(attr(f, 'opacity'))) && Number(attr(f, 'opacity')) >= 0 && Number(attr(f, 'opacity')) <= 1));

// -- dragging lays a trail ----------------------------------------------------

pointer('pointerdown', 100, 400);
await settle();
for (let i = 1; i <= 6; i += 1) {
  pointer('pointermove', 100 + i * 40, 400 + i * 6);
  await settle();
}
pointer('pointerup', 340, 436);
await settle();
await runFrames(2);
const trailed = flies().length;
check('a drag lays a trail of fireflies', trailed > 14, `${trailed} flies`);

// -- still: the meadow stops --------------------------------------------------

if (!button('still')) check('a still button exists', false);
else {
  button('still').dispatch('click', { stopPropagation() {}, preventDefault() {} });
  await settle();
  await runFrames(2);
  const frozen = flies().map((f) => [attr(f, 'cx'), attr(f, 'cy'), attr(f, 'opacity')]);
  await runFrames(30);
  const stillNow = flies().map((f) => [attr(f, 'cx'), attr(f, 'cy'), attr(f, 'opacity')]);
  check('still freezes the drift', JSON.stringify(frozen) === JSON.stringify(stillNow));
  check('the still button shows its state', classOf(button('still')).includes('on'));
  check('the hint faded after the first tap', classOf(hint).includes('gone'));
  button('still').dispatch('click', { stopPropagation() {}, preventDefault() {} });
  await settle();
  await runFrames(2);
}

// -- hush: everyone fades out -------------------------------------------------

if (!button('hush')) check('a hush button exists', false);
else {
  button('hush').dispatch('click', { stopPropagation() {}, preventDefault() {} });
  await settle();
  await runFrames(2);
  const during = flies().length;
  check('hush does not cut them off instantly', during > 0, `${during} flies`);
  await runFrames(200); // ~3.3 s: the goodbye is 2.4 s
  check('hush empties the air', flies().length === 0, `${flies().length} flies left`);
}

// -- the cap holds ------------------------------------------------------------

for (let i = 0; i < 40; i += 1) {
  pointer('pointerdown', 20 + (i % 8) * 45, 80 + (i % 5) * 90);
  await settle();
}
await runFrames(4);
const crowded = flies().length;
check('the air stays under the cap', crowded <= 130, `${crowded} flies`);
check('the cap still leaves a sky full of light', crowded > 100, `${crowded} flies`);
check('no NaN reached the DOM',
  all().every((n) => Object.values(n.__attrs).every((v) => !/NaN|Infinity/.test(String(v)))));

console.log(`\n${failures === 0 ? 'all checks passed' : failures + ' check(s) failed'}`);
process.exit(failures === 0 ? 0 : 1);
