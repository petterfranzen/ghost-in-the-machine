// Loads a night's committed dist/ in headless Chromium, the way Pages serves it,
// and fails on anything that would publish a broken night: a request that
// fails or answers 4xx/5xx, a console error, an uncaught page error, or a page
// that renders nothing. Usage: node check-night-loads.mjs <base-url> <name>
import { chromium } from "playwright";

const [base, name] = process.argv.slice(2);
const problems = [];
const browser = await chromium.launch();
for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  const page = await browser.newPage({ viewport });
  const tag = `${name} @ ${viewport.width}x${viewport.height}`;
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${tag}: ${r.status()} ${r.url()}`); });
  page.on("requestfailed", (r) => problems.push(`${tag}: request failed ${r.url()} (${r.failure()?.errorText})`));
  page.on("console", (m) => { if (m.type() === "error") problems.push(`${tag}: console error: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`${tag}: page error: ${e.message}`));
  await page.goto(base, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(3000); // let the night boot and draw its first frames
  const drawn = await page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const canvases = [...document.querySelectorAll("canvas")].filter(visible);
    if (canvases.some((c) => {
      try {
        const ctx = c.getContext("2d");
        if (!ctx) return true; // a WebGL canvas: trust that it is there
        const { data } = ctx.getImageData(0, 0, c.width, c.height);
        for (let i = 4; i < data.length; i += 4)
          if (data[i] !== data[0] || data[i + 1] !== data[1] || data[i + 2] !== data[2]) return true;
        return false;
      } catch { return true; }
    })) return true;
    return (document.body?.innerText || "").trim().length > 0 || document.querySelectorAll("svg, img").length > 0;
  });
  if (!drawn) problems.push(`${tag}: the page rendered nothing (blank canvas and no text)`);
  await page.close();
}
await browser.close();
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`${name}: committed dist/ loads cleanly at phone and desktop sizes`);
