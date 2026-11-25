// Proves every shelf in the pantry can be kept: loads the pure Ruby rules in the
// same WebAssembly Ruby the browser runs, and solves each level with Solver.
import { DefaultRubyVM } from "../vendor/ruby-wasm-wasi/esm/node.js";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const wasm = gunzipSync(readFileSync(join(root, "wasm", "ruby.wasm.gz")));
const { vm } = await DefaultRubyVM(await WebAssembly.compile(wasm));

const pure = ["palette.rb", "rules.rb", "solver.rb", "levels.rb"]
  .map((f) => readFileSync(join(root, "src", f), "utf8")).join("\n");
const report = await vm.evalAsync(`
${pure}
rows = (0...Levels.count).map do |i|
  level = Levels.build(i)
  jars = level.racks.sum { |r| r.size }
  t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  path = Solver.solve(level)
  ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) * 1000).round
  [level.name, jars, level.racks.size, path ? path.size : -1, ms].join("|")
end
rows.join("\\n")
`);

const rows = String(report).trim().split("\n").map((line) => {
  const [name, jars, shelves, moves, ms] = line.split("|");
  return { name, jars: +jars, shelves: +shelves, moves: +moves, ms: +ms, solved: +moves >= 0 };
});

let bad = 0;
for (const [i, r] of rows.entries()) {
  const mark = r.solved ? "ok  " : "FAIL";
  if (!r.solved) bad++;
  const moves = r.solved ? r.moves : "-";
  console.log(`${mark} ${i + 1}. ${r.name.padEnd(19)} jars=${r.jars} shelves=${r.shelves} moves=${moves} (${r.ms}ms)`);
}
if (bad) {
  console.error(`${bad} shelf/levels cannot be kept; fix src/levels.rb before shipping.`);
  process.exit(1);
}
console.log("every shelf in the pantry can be kept");
