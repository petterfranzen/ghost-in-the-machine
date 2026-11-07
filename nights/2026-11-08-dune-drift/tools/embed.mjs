// Fold the compiled WebAssembly and the host into one static file, and copy
// the page across. The wasm travels as base64 inside app.js, so the page makes
// no request at all — it runs straight from disk (file://) or a static server.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const wasm = fs.readFileSync(path.join(root, 'build', 'sim.wasm'))
const b64 = wasm.toString('base64')

const host = fs.readFileSync(path.join(root, 'src', 'host.js'), 'utf8')
if (!host.includes('__WASM_B64__')) throw new Error('host.js has no __WASM_B64__ placeholder')

fs.mkdirSync(path.join(root, 'dist'), { recursive: true })
fs.writeFileSync(path.join(root, 'dist', 'app.js'), host.replace('__WASM_B64__', b64))
fs.copyFileSync(path.join(root, 'src', 'index.html'), path.join(root, 'dist', 'index.html'))
fs.copyFileSync(path.join(root, 'src', 'style.css'), path.join(root, 'dist', 'style.css'))
fs.copyFileSync(path.join(root, 'src', 'favicon.svg'), path.join(root, 'dist', 'favicon.svg'))

console.log(`dist/: app.js (wasm ${wasm.length} B), index.html, style.css, favicon.svg`)
