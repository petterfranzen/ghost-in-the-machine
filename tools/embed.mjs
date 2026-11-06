// Wrap the compiled wasm in a plain script so the page works from file:// too:
// no fetch, no MIME type to get wrong, no bundler.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , wasmPath, outPath] = process.argv;
if (!wasmPath || !outPath) {
  console.error('usage: node tools/embed.mjs <game.wasm> <wasm.js>');
  process.exit(2);
}
const b64 = readFileSync(wasmPath).toString('base64');
writeFileSync(outPath, `window.WASM_B64="${b64}";\n`);
console.log(`wasm.js: ${b64.length} base64 chars from ${wasmPath}`);
