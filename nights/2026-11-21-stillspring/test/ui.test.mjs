// Regression guard for the Next button's visibility: `.ctl` sets
// display: inline-flex, which overrides the `hidden` attribute main.js uses to
// keep Next off the screen until the garden is fed. The stylesheet must win.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const css = readFileSync(path.join(here, '..', 'src', 'style.css'), 'utf8');

let failures = 0;
const check = (name, ok, extra = '') => {
  if (ok) console.log(`ok   ${name}`);
  else { failures += 1; console.log(`FAIL ${name}${extra ? ' - ' + extra : ''}`); }
};

check('.ctl is laid out inline-flex', /\.ctl\s*\{[^}]*display:\s*inline-flex/.test(css));
check('.ctl[hidden] is hidden', /\.ctl\[hidden\]\s*\{[^}]*display:\s*none/.test(css));

if (failures) { console.log(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
