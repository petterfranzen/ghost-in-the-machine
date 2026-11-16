// Fold the compiled WebAssembly and the host into one static file, and copy the
// page across. The wasm travels as base64 inside app.js, so the page makes no
// request at all: it runs straight from disk (file://) or from a static server.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const repo = path.join(root, '..', '..')

const wasm = fs.readFileSync(path.join(root, 'build', 'snow_garden.wasm'))
const b64 = wasm.toString('base64')

const host = fs.readFileSync(path.join(root, 'src', 'host.js'), 'utf8')
if (!host.includes('__WASM_B64__')) throw new Error('host.js has no __WASM_B64__ placeholder')

// The favicon is the design system's mark, inlined as a data URI in <head> so a
// static server never 404s on /favicon.ico and the page adds no request.
let page = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8')
const mark = fs.readFileSync(path.join(repo, 'crew', 'design', 'favicon.svg'), 'utf8').trim()
const dataUri = 'data:image/svg+xml,' + encodeURIComponent(mark)
if (!page.includes('INLINE_FAVICON')) throw new Error('index.html has no INLINE_FAVICON placeholder')
page = page.replace('INLINE_FAVICON', dataUri)

fs.mkdirSync(path.join(root, 'dist'), { recursive: true })
fs.writeFileSync(path.join(root, 'dist', 'app.js'), host.replace('__WASM_B64__', b64))
fs.writeFileSync(path.join(root, 'dist', 'index.html'), page)
fs.copyFileSync(path.join(root, 'src', 'style.css'), path.join(root, 'dist', 'style.css'))

console.log(`dist/: app.js (wasm ${wasm.length} B), index.html (favicon inlined), style.css`)
