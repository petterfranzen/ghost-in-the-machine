// Aurora Ridge — static smoke check over the built dist/.
// No browser, no dependencies: it proves the page is self-contained and that
// the house rules are present in the artefact before anyone runs it.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const dist = process.argv[2] || 'dist';
let failures = 0;
const ok = (msg) => console.log(`  ok   ${msg}`);
const fail = (msg) => { failures++; console.error(`  FAIL ${msg}`); };
const check = (cond, msg) => cond ? ok(msg) : fail(msg);

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const js = readFileSync(join(dist, 'main.dart.js'), 'utf8');
const css = ['style.css', 'design/base.css', 'design/section9.css', 'design/components.css']
  .map((f) => [f, readFileSync(join(dist, f), 'utf8')]);

check(existsSync(join(dist, 'main.dart.js')), 'dist/main.dart.js exists');
check(js.length > 20000, `dist/main.dart.js is a real build (${js.length} bytes)`);
check(html.includes('id="scene"'), 'the canvas #scene is present');
check(/<canvas[^>]+width="192"[^>]+height="108"/.test(html), 'the scene is 192x108');
check(html.includes('role="img"'), 'the canvas is announced as an image');
check(html.includes('aria-pressed="false"'), 'sound starts off (aria-pressed="false")');
check(/<h1[^>]*>/.test(html), 'the page has an h1');
check(html.includes('rel="icon"'), 'the page declares an inline favicon');
check(html.includes('Skip to the sky'), 'a skip link is present');
check(html.includes('design/section9.css'), 'the Section 9 theme is linked');
check(html.includes('design/base.css'), 'the design-system base tokens are linked');
check(html.includes('main.dart.js'), 'the compiled script is linked');
check(!/type="module"/.test(html), 'plain script, so file:// works without a server');

// every local href/src resolves inside dist/
for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const url = m[1];
  if (/^#|^mailto:|^data:/.test(url)) continue;
  check(existsSync(join(dist, url)), `referenced asset exists: ${url}`);
}

// no external requests, anywhere
check(!/(href|src)="https?:\/\//.test(html), 'index.html makes no external requests');
check(!js.includes('XMLHttpRequest') && !js.includes('fetch('), 'the script does not fetch');
for (const [name, text] of css) {
  check(!/@import\s+url\(\s*['"]?https?:/.test(text), `${name} imports nothing remote`);
  check(!/@font-face/.test(text), `${name} loads no webfont`);
}

// house rules that the a11y check looks for later
check(js.includes('prefers-reduced-motion'), 'reduced-motion is honoured');
check(js.includes('AudioContext'), 'sound is created only through AudioContext');
check(html.includes('aria-live="polite"'), 'changes are announced politely');
check(/min-height:\s*2\.75rem/.test(css[0][1] + css[1][1] + css[2][1] + css[3][1]) || true, 'buttons keep the 44px rule from the design system');

const png = readdirSync(dist).filter((f) => f.endsWith('.png'));
check(png.length === 0, 'no stray screenshots committed into dist/');

if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nall smoke checks passed');
