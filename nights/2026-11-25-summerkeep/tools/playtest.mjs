// Plays the first shelf through Session, exactly as a thumb would:
// tap, tap, undo, restart. Proves the pantry's book-keeping stays honest.
import { DefaultRubyVM } from "../vendor/ruby-wasm-wasi/esm/node.js";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const wasm = gunzipSync(readFileSync(join(root, "wasm", "ruby.wasm.gz")));
const { vm } = await DefaultRubyVM(await WebAssembly.compile(wasm));
const pure = ["palette.rb", "rules.rb", "solver.rb", "levels.rb", "game.rb"]
  .map((f) => readFileSync(join(root, "src", f), "utf8")).join("\n");

const out = String(await vm.evalAsync(`
${pure}
def check(name, ok) = ok ? "ok   #{name}" : "FAIL #{name}"
s = Session.new
log = []
log << check("level one is first", s.name == "First Jars")
log << check("nothing held at the start", s.held.nil?)
s.press(0)
log << check("tapping a shelf lifts its top jar", !s.held.nil?)
s.press(0)
log << check("tapping the same shelf puts it back", s.held.nil?)
s.press(0)
log << check("lift again", !s.held.nil?)
s.press(2)
log << check("a pour lands on the empty shelf", s.racks[2].size > 0)
s.undo
log << check("undo returns every jar", s.racks.map(&:size) == [4, 4, 0])
s.restart
log << check("restart opens the shelf afresh", s.racks.map(&:size) == [4, 4, 0] && s.moves_taken.zero?)
path = Solver.solve(s.level)
path.each { |from, to| s.press(from); s.press(to) }
log << check("the solver's own moves keep the shelf", s.completed?)
log << check("a kept shelf knows how many moves it took", s.moves_taken == path.size)
log << check("progress counts the sealed shelves", s.settled_count == 2 && s.goal == 2)
s.next_level
log << check("the next shelf opens", s.name == "Three Fruits" && !s.completed?)
log.join("\\n")
`));
console.log(out);
if (out.includes("FAIL")) process.exit(1);
console.log("the pantry keeps its books");
