#!/usr/bin/env node
// Tests for the night-a11y checks a real night does not exercise:
//
//   * sound turned on inside an inline <script> (the inline body must be read);
//   * aria-pressed="true" that lives in a CSS selector, not on an element
//     (must not be a false FAIL);
//   * audio created behind a real addEventListener('keydown', …) (the event
//     name is a string, which the scope reader masks: must not be a false FAIL),
//     and audio created at page load with no listener (must still FAIL).
//
// Each case builds a throwaway "night" in a temp dir, runs night-a11y over it
// and asserts on the one-line output. Static half only — a bogus
// PW_CHROMIUM_PATH keeps the browser check out of it — so it needs nothing but
// Node and runs the same everywhere.
//
//   node scripts/night-a11y.test.mjs
//
// Exit status is 0 when every case passes, 1 otherwise.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'night-a11y.mjs');

let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${!cond && extra ? ' — ' + extra : ''}`);
  if (!cond) failures += 1;
};

function makeNight(html) {
  const dir = mkdtempSync(join(tmpdir(), 'night-a11y-'));
  mkdirSync(join(dir, 'dist'));
  writeFileSync(join(dir, 'dist', 'index.html'), html);
  return dir;
}

function run(dir) {
  const env = { ...process.env, PW_CHROMIUM_PATH: join(dir, 'no-such-chromium') };
  const r = spawnSync(process.execPath, [SCRIPT, dir], { encoding: 'utf8', env });
  return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}

const page = (body, style, script) => `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${style}</style></head><body>${body}
<script>${script}</script></body></html>`;

const REDUCED = '@media (prefers-reduced-motion: reduce){*{animation:none}}';

// 1. Sound on at load, set in an inline <script>. The inline regex used to have
//    no capture group, so neither of the two lines below was ever scanned.
{
  const dir = makeNight(page(
    '<button id="sound" aria-pressed="false">sound: off</button>',
    REDUCED,
    'var ctx = new AudioContext(); var soundOn = true;'));
  const { code, out } = run(dir);
  check('inline script: soundOn = true is seen',
    /FAIL\s+sound-default\s+sound starts on: soundOn = true/.test(out), out.trim());
  check('inline script: top-level new AudioContext() is seen',
    /FAIL\s+audio\s+AudioContext\/Audio is created but the page never listens/.test(out), out.trim());
  check('inline script: the run fails', code === 1, `exit ${code}`);
  rmSync(dir, { recursive: true, force: true });
}

// 2. aria-pressed="true" only inside a CSS selector; the button ships
//    aria-pressed="false", so there is no defect and the night passes.
{
  const dir = makeNight(page(
    '<button id="sound" aria-pressed="false">sound: off</button>',
    `${REDUCED}\n#sound[aria-pressed="true"]{opacity:.42}\n.other[aria-pressed="true"]{}`,
    'var soundOn = false;'));
  const { code, out } = run(dir);
  check('CSS selector: aria-pressed="true" in <style> is not a finding',
    !/FAIL\s+sound-default\s+.*aria-pressed/.test(out), out.trim());
  check('CSS selector: the clean night passes', code === 0, `exit ${code}\n${out.trim()}`);
  rmSync(dir, { recursive: true, force: true });
}

// 3. A gesture listener is a quoted event name, which masking blanks. Audio made
//    inside a keydown handler passes; audio made at the top level, or in a
//    function nothing calls, still fails.
{
  const body = '<button id="sound" aria-pressed="false">sound: off</button>';
  const ok = makeNight(page(body, REDUCED,
    "var ctx; addEventListener('keydown', function () { ctx = new AudioContext(); });"));
  const a = run(ok);
  check('gesture listener: audio behind addEventListener(\'keydown\') is not a finding',
    !/FAIL\s+audio/.test(a.out), a.out.trim());
  check('gesture listener: that night passes', a.code === 0, `exit ${a.code}\n${a.out.trim()}`);
  rmSync(ok, { recursive: true, force: true });

  const helper = makeNight(page(body, REDUCED,
    'var ctx; function wake() { ctx = new AudioContext(); }\n' +
    'document.addEventListener("click", wake);'));
  const h = run(helper);
  check('gesture listener: audio in a named click handler is not a finding',
    !/FAIL\s+audio/.test(h.out), h.out.trim());
  rmSync(helper, { recursive: true, force: true });

  const none = makeNight(page(body, REDUCED,
    "var ctx = new AudioContext(); // addEventListener('keydown', f) only in a comment\n" +
    "var s = \"addEventListener('click', g)\";"));
  const n = run(none);
  check('no listener: audio at load still fails',
    /FAIL\s+audio\s+AudioContext\/Audio is created but the page never listens/.test(n.out), n.out.trim());
  check('no listener: the run fails', n.code === 1, `exit ${n.code}`);
  rmSync(none, { recursive: true, force: true });
}

console.log(`\nnight-a11y tests: ${failures ? `${failures} failed` : 'all passed'}`);
process.exit(failures ? 1 : 0);
