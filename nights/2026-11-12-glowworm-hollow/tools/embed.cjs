'use strict';
// Fold the module and the host into one file the page can run from file://.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const wasm = fs.readFileSync(path.join(root, 'build', 'sim.wasm'));
const host = fs.readFileSync(path.join(root, 'web', 'host.js'), 'utf8');
const out = '/* built by build.sh from src/sim.c and web/* - do not edit */\n'
  + 'var SIM_B64 = "' + wasm.toString('base64') + '";\n' + host;
fs.writeFileSync(path.join(root, 'dist', 'app.js'), out);
console.log('dist/app.js: ' + (out.length / 1024).toFixed(1) + ' KB (' + wasm.length + ' B of wasm)');
