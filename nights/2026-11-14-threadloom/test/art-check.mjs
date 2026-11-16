// Smoke check: the woven pictures must be 32x20 of known glyphs, and each
// palette must supply five colours. Run before every build.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src", "Motifs.res"), "utf8");

const motifs = [...src.matchAll(/rows: \[\n([\s\S]*?)\n\s*\]\},/g)];
let fails = 0;
if (motifs.length < 3) { console.error("expected >=3 motifs, found", motifs.length); fails++; }
motifs.forEach((m, i) => {
  const rows = m[1].split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l) => l.replace(/^"|",?$/g, ""));
  if (rows.length !== 20) { console.error(`motif ${i}: ${rows.length} rows, want 20`); fails++; }
  rows.forEach((r, y) => {
    if (r.length !== 32) { console.error(`motif ${i} row ${y}: width ${r.length}, want 32`); fails++; }
    if (!/^[.1234]{32}$/.test(r)) { console.error(`motif ${i} row ${y}: bad glyphs "${r}"`); fails++; }
  });
});
const palettes = [...src.matchAll(/colours: \[([^\]]*)\]/g)];
if (palettes.length < 4) { console.error("expected >=4 palettes, found", palettes.length); fails++; }
palettes.forEach((p, i) => {
  const cols = p[1].split(",").map((s) => s.trim()).filter(Boolean);
  if (cols.length !== 5) { console.error(`palette ${i}: ${cols.length} colours, want 5`); fails++; }
});
if (fails) { console.error(`art-check: ${fails} problem(s)`); process.exit(1); }
console.log(`art-check ok: ${motifs.length} motifs, ${palettes.length} palettes`);
