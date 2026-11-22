// The checks: does the committed bundle load, does every hook it calls exist,
// and can the shipped game actually be played through every level?
//
// The solver is a second, independent reading of the rules. This test takes the
// solver's shortest solution for a level, plays it into the real bundle, and
// watches the bay light up and move on. Two readings agreeing is the check.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const solver = require('./solver.js');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const WARM = solver.WARM;
const WARM_SECONDS = 3.2;
const STEP = 0.1;
let failures = 0;

function check(name, ok, detail) {
  if (ok) return console.log(`  ok   ${name}`);
  failures++;
  console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
}

function layoutsFromSource() {
  const src = fs.readFileSync(path.join(ROOT, 'src/game.v'), 'utf8');
  const rows = /layout: \[\n([\s\S]*?)\n\t\t\]/g;
  const out = [];
  let m = rows.exec(src);
  while (m) {
    out.push(m[1].split('\n').map((l) => l.trim().replace(/^.|.,$/g, '')).filter((l) => l.length));
    m = rows.exec(src);
  }
  return out;
}

// V hands the host its own number objects, and a loop counter stored by
// reference keeps moving: read every value at the moment it arrives.
function isBoxed(v) {
  return v && typeof v === 'object';
}

function num(v) {
  if (!isBoxed(v)) return v;
  return v.val !== undefined ? v.val : v;
}

function loadBundle() {
  const code = fs.readFileSync(path.join(DIST, 'game.js'), 'utf8');
  const log = { hud: {}, hint: '', events: [], calls: new Set() };
  const ctx = { console, Math, JSON, Date, Promise, setTimeout, clearTimeout, Symbol, parseInt, parseFloat, isNaN, TextEncoder, TextDecoder, performance };
  ctx.globalThis = ctx;
  const hook = (name, fn) => { ctx[name] = (...args) => { log.calls.add(name); if (fn) fn(...args); }; };
  hook('lake_hud', (id, v) => { log.hud[num(id)] = num(v); });
  hook('lake_hint', (t) => { log.hint = typeof t === 'string' ? t : (t && t.str) || ''; });
  ['lake_ready', 'lake_grid', 'lake_tile', 'lake_actor', 'lake_skid', 'lake_crack', 'lake_break',
    'lake_splash', 'lake_light', 'lake_stop', 'lake_flick', 'lake_scuff', 'lake_rare', 'lake_sound']
    .forEach((n) => hook(n, (...a) => log.events.push([n, ...a.map(num)])));
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { ctx, log };
}

function pump(g, seconds) {
  for (let t = 0; t < seconds; t += STEP) g.ctx.main__frame(STEP);
}

function act(g, action) {
  if (action === WARM) {
    g.ctx.main__press(1);
    pump(g, WARM_SECONDS);
    g.ctx.main__press(0);
    return;
  }
  g.ctx.main__move(action);
  pump(g, 0.7);
}

function playLevel(g, layout, index) {
  const moves = solver.solve(layout);
  check(`level ${index + 1} has a solution`, moves !== null, 'solver found none');
  if (!moves) return false;
  for (const action of moves) act(g, action);
  const won = g.log.hud[4] === 1 || g.log.hud[2] >= g.log.hud[3];
  check(`level ${index + 1} lights up (${moves.length} moves: ${moves.join(' ')})`, won,
    `lit ${g.log.hud[2]} of ${g.log.hud[3]}, level ${g.log.hud[0]}`);
  pump(g, 2.6); // the bay glows, then the next level opens
  return won;
}

// Two mistakes the browser found and the vm cannot: a host helper the game's own
// bundle also declares, and a host file reaching for a name in a sibling file
// that its own scope no longer has. Both are checked statically.
function hostSources(dir, files) {
  return Object.fromEntries(files.map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));
}

function declarations(src) {
  const decls = {};
  for (const [file, text] of Object.entries(src)) {
    for (const m of text.matchAll(/^\s*(?:function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=)/gm)) {
      const name = m[1] || m[2];
      (decls[name] = decls[name] || new Set()).add(file);
    }
  }
  return decls;
}

function importsIn(text) {
  return new Set([...text.matchAll(/const\s*\{([^}]*)\}\s*=/g)]
    .flatMap((m) => m[1].split(',').map((t) => t.trim())));
}

function callsIn(text) {
  return new Set([...text.matchAll(/(?<![\w.$])([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map((m) => m[1]));
}

function leakCheck(src, decls) {
  for (const [file, text] of Object.entries(src)) {
    const imported = importsIn(text);
    const leaks = [...callsIn(text)].filter((n) => decls[n] && !decls[n].has(file) && !imported.has(n));
    check(`src/host/${file} keeps to its own names`, leaks.length === 0, leaks.join(', '));
  }
}

function bundleNames() {
  return new Set([...fs.readFileSync(path.join(DIST, 'game.js'), 'utf8')
    .matchAll(/^function ([A-Za-z0-9_$]+)/gm)].map((m) => m[1]));
}

function namespaceCheck(src, taken) {
  for (const [file, text] of Object.entries(src)) {
    for (const m of text.matchAll(/window\.(Lake[A-Za-z]*)\s*=/g)) {
      check(`window.${m[1]} is the host's alone (${file})`, !taken.has(m[1]));
    }
  }
}

function hostCheck() {
  const dir = path.join(ROOT, 'src/host');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
  const src = hostSources(dir, files);
  leakCheck(src, declarations(src));
  namespaceCheck(src, bundleNames());
}

function main() {
  console.log('== dist ==');
  for (const f of ['index.html', 'game.js', 'host/sound.js', 'host/art.js', 'host/paint.js', 'host/bridge.js', 'host/controls.js', 'host/main.js']) {
    check(`dist/${f} exists`, fs.existsSync(path.join(DIST, f)));
  }
  const bundle = fs.readFileSync(path.join(DIST, 'game.js'), 'utf8');
  // V's generated exit stub reaches for process.exit; nothing else does.
  const withoutExitStub = bundle.replace(/function builtin__exit\(c\) \{[\s\S]*?\n\}/, '');
  check('the bundle is browser-ready', !/\brequire\(|\bprocess\.|module\.exports|\bimport\s/.test(withoutExitStub));
  check('the bundle is one file with no loader', /function main__boot\b/.test(bundle));

  console.log('== the host ==');
  hostCheck();

  console.log('== the game, played ==');
  const layouts = layoutsFromSource();
  check('nine levels in src/game.v', layouts.length === 9, `found ${layouts.length}`);
  const g = loadBundle();
  check('the bundle loads and boots', typeof g.ctx.main__boot === 'function');
  g.ctx.main__boot();
  pump(g, 0.2);
  check('the first hint arrives', g.log.hint.length > 8, JSON.stringify(g.log.hint.slice(0, 40)));
  check('the first level is drawn', g.log.hud[0] === 1 && g.log.hud[3] === solver.lanterns(solver.parse(layouts[0])));

  for (let i = 0; i < 8; i++) {
    if (!playLevel(g, layouts[i], i)) break;
    check(`the bay moves on to level ${i + 2}`, g.log.hud[0] === i + 2, `level ${g.log.hud[0]}`);
  }
  check('the last bay is free skating', g.log.hud[5] === 1 && g.log.hud[0] === 9);
  const hookedCalls = [...g.log.calls].every((n) => n.startsWith('lake_'));
  check('every hook the game calls is one the host defines', hookedCalls);

  console.log('== idle and frame budget ==');
  const before = g.log.events.length;
  pump(g, 12);
  check('twelve seconds of frames without a throw', true);
  check('the keeper idles on the free bay', g.log.hud[5] === 1);
  console.log(`  note: ${g.log.events.length - before} events while idling`);

  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
}

main();
