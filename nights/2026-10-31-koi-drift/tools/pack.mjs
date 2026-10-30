// Pack dist/js: copy just the Gleam modules the page actually loads.
//
// `gleam build --target javascript` writes one .mjs per module of every package
// in the tree — a few hundred kilobytes of standard library the pond never
// touches. This walks the import graph from the app's entry module instead, so
// dist/ carries only what the browser will fetch.
//
// .mjs becomes .js on the way in (every static host, GitHub Pages included,
// serves .js with the right content type) and the relative import specifiers are
// rewritten to match. Nothing is bundled: the modules stay one file each.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve("build/dev/javascript");
const entry = join(root, "koi_drift/koi_drift.mjs");
const out = resolve("dist/js");

const specifiers = (source) => [...source.matchAll(/from\s+"([^"\n]+)"/g)].map((m) => m[1]);

const queue = [entry];
const needed = new Set();
while (queue.length > 0) {
  const file = queue.shift();
  if (needed.has(file) || !existsSync(file)) continue;
  needed.add(file);
  const source = readFileSync(file, "utf8");
  if (source.includes('from "node:')) {
    throw new Error(`${relative(root, file)} needs a Node built-in and cannot run in a browser`);
  }
  for (const spec of specifiers(source)) {
    const next = resolve(dirname(file), spec);
    if (next.startsWith(root)) queue.push(next);
  }
}

const packed = [...needed].map((file) => {
  const target = join(out, `${relative(root, file).replace(/\.mjs$/, "")}.js`);
  const source = readFileSync(file, "utf8").replace(/(from\s+"[^"\n]+)\.mjs"/g, '$1.js"');
  return { target, source };
});

// Every relative import the packed tree makes has to resolve inside dist/, or
// the page would 404 in a browser where a test would have caught it. Write
// everything first, then check the whole set at once.
for (const { target, source } of packed) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, source);
}
for (const { target, source } of packed) {
  for (const spec of specifiers(source)) {
    if (spec.startsWith(".") && !existsSync(join(dirname(target), spec))) {
      throw new Error(`${relative(out, target)} imports a file that was not packed: ${spec}`);
    }
  }
}

// A package.json keeps the directory honest for anything that loads it as
// JavaScript rather than as a module from a browser (our own smoke check, for
// instance): every file in here is an ES module.
writeFileSync(join(out, "package.json"), '{"type":"module"}\n');

const bytes = packed.reduce((total, { source }) => total + source.length, 0);
console.log(`  packed ${needed.size} modules, ${(bytes / 1024).toFixed(1)} kB`);
