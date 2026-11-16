// Self-check for the built page. Needs Playwright; it is not a build
// dependency, so point PLAYWRIGHT at an installed copy if it is not local:
//
//   PLAYWRIGHT=/path/to/node_modules/playwright/index.mjs node tools/browser-check.mjs
//
// It checks the house rules against dist/index.html: no external requests,
// no console errors, a 44 px sound control that starts off, no sideways
// scroll, fractional pointer coordinates reaching the field, the moon's
// answer, a drag that sifts sand, and reduced motion never settling.
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const spec = process.env.PLAYWRIGHT || 'playwright'
const { chromium } = await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec)

const url = pathToFileURL(path.resolve('dist/index.html')).href
const fails = []
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg) }

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()

const errors = [], requests = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('request', r => requests.push(r.url()))

await page.goto(url)
await page.waitForTimeout(1200)

ok(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.join(' | ') : ''))
const ext = requests.filter(u => !u.startsWith('file://') && !u.startsWith('data:'))
ok(ext.length === 0, 'no external requests' + (ext.length ? ': ' + ext.join(', ') : ''))

const btn = page.locator('#sound')
const bb = await btn.boundingBox()
ok(bb.width >= 44 && bb.height >= 44, `sound control is ${bb.width.toFixed(1)}x${bb.height.toFixed(1)} (>= 44)`)
ok((await btn.getAttribute('aria-pressed')) === 'false', 'sound starts off')
ok((await btn.innerText()).includes('off'), 'the button reads "off"')

const scroll = await page.evaluate(() => ({
  sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
  sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
}))
ok(scroll.sw <= scroll.cw + 1, `no sideways scroll (${scroll.sw} <= ${scroll.cw})`)
ok(scroll.sh <= scroll.ch + 1, `fits the screen (${scroll.sh} <= ${scroll.ch})`)

// Fractional pointer coordinates, never whole numbers (the Aurora Ridge lesson).
const canvas = page.locator('#stage')
const cbb = await canvas.boundingBox()
const before = await canvas.screenshot()
const fx = cbb.x + 120.4, fy = cbb.y + 88.7
await page.mouse.click(fx, fy)
await page.waitForTimeout(1400)
ok(Buffer.compare(before, await canvas.screenshot()) !== 0,
  `a tap at fractional (120.4, 88.7) changed the field`)

// The moon is a discovery: a quick tap reveals nothing; a slow press answers.
const mx = cbb.x + cbb.width * 0.78, my = cbb.y + cbb.height * 0.17
await page.mouse.click(mx + 0.3, my + 0.6)
await page.waitForTimeout(350)
ok(!(await page.evaluate(() => window.DuneDrift.moon().fired)), 'a quick tap on the moon does not fire the secret')
ok(!/moon/i.test(await page.locator('#hint').innerText()), 'a quick tap on the moon reveals nothing')
await page.mouse.move(mx + 0.4, my + 0.5)
await page.mouse.down()
await page.waitForTimeout(1900)
await page.mouse.up()
await page.waitForTimeout(250)
ok(await page.evaluate(() => window.DuneDrift.moon().fired), 'a slow press on the moon answers')
ok(/moon/i.test(await page.locator('#hint').innerText()), 'the moon secret announces itself once found')

const dragBefore = await canvas.screenshot()
await page.mouse.move(cbb.x + cbb.width * 0.2, cbb.y + cbb.height * 0.08)
await page.mouse.down()
for (let i = 1; i <= 8; i++) {
  await page.mouse.move(cbb.x + cbb.width * (0.2 + i * 0.03) + 0.25, cbb.y + cbb.height * 0.08 + 0.45, { steps: 2 })
  await page.waitForTimeout(100)
}
await page.mouse.up()
await page.waitForTimeout(1200)
ok(Buffer.compare(dragBefore, await canvas.screenshot()) !== 0, 'dragging sifts sand')

// A long press on the play area pours sand and never selects text: the iOS
// long-press fix, checked headlessly.
const pressBefore = await canvas.screenshot()
const lpx = cbb.x + cbb.width * 0.34 + 0.5, lpy = cbb.y + cbb.height * 0.10 + 0.25
await page.mouse.move(lpx, lpy)
await page.mouse.down()
await page.waitForTimeout(1100)
const sel = await page.evaluate(() => { const s = window.getSelection(); return { n: s.rangeCount, text: String(s) } })
await page.mouse.up()
await page.waitForTimeout(900)
ok(sel.n === 0 && sel.text === '', `long press selects no text (ranges ${sel.n}${sel.text ? ', "' + sel.text + '"' : ''})`)
ok(Buffer.compare(pressBefore, await canvas.screenshot()) !== 0, 'a long press keeps pouring sand')
ok((await page.evaluate(() => getComputedStyle(document.getElementById('stage')).touchAction)) === 'none',
  'canvas touch-action is none')
const usel = await page.evaluate(() => { const s = getComputedStyle(document.getElementById('stage')); return s.userSelect || s.webkitUserSelect || '' })
ok(usel === 'none', `canvas user-select is none (${usel})`)

await btn.click()
await page.waitForTimeout(200)
ok((await btn.getAttribute('aria-pressed')) === 'true', 'sound turns on when asked')
ok((await btn.innerText()).includes('on'), 'the button reads "on"')

const ratio = await page.evaluate(() => {
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]) }
  const parse = s => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)
  const bg = parse(getComputedStyle(document.body).backgroundColor)
  const cap = parse(getComputedStyle(document.querySelector('.caption')).color)
  const a = lum(cap), b = lum(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
})
ok(ratio >= 4.5, `caption contrast ${ratio.toFixed(2)}:1 (AA needs 4.5)`)

// Seeded per visit: no ?seed= draws a fresh landscape each load; ?seed=<n> pins
// one. (The simulation's own smoke test proves a seed actually shapes the field;
// here we prove the host wires the URL and the randomness.)
{
  const seedOf = async (query) => {
    const p = await ctx.newPage()
    await p.goto(url + (query || ''))
    await p.waitForFunction(() => !!window.DuneDrift)
    const v = await p.evaluate(() => window.DuneDrift.seed())
    await p.close()
    return v
  }
  const a = await seedOf('')
  const b = await seedOf('')
  ok(Number.isInteger(a) && a >= 0, `an unseeded visit draws a 32-bit seed (${a})`)
  ok(a !== b, `two unseeded visits build different fields (${a} vs ${b})`)
  const s1 = await seedOf('?seed=4242')
  const s2 = await seedOf('?seed=4242')
  ok(s1 === 4242 && s2 === 4242, `?seed= pins the landscape (${s1}, ${s2})`)
}

const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const p2 = await ctx2.newPage()
await p2.goto(url)
await p2.waitForTimeout(900)
const c2 = await p2.locator('#stage').boundingBox()
await p2.mouse.click(c2.x + 120.4, c2.y + 88.7)
let moved = false
for (let i = 0; i < 12; i++) {
  await p2.waitForTimeout(90)
  const t = await p2.evaluate(() => document.querySelector('#stage').style.transform)
  if (t && t !== 'none') moved = true
}
ok(!moved, 'reduced motion: the whole scene never gives')

await browser.close()
console.log(fails.length ? `\n${fails.length} failed` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
