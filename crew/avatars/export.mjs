// Rasterize each avatar SVG to a 256x256 PNG, so the source of truth (the
// hand-written SVG) and the exported raster never drift.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const names = ["aramaki", "major", "batou", "togusa", "ishikawa", "saito", "tachikoma", "jev"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 1 });
for (const n of names) {
  const svg = fs.readFileSync(path.join(dir, `${n}.svg`), "utf8");
  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#040a08}svg{display:block}</style>${svg}`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(dir, `${n}.png`) });
  console.log("wrote", `${n}.png`);
}
await browser.close();
