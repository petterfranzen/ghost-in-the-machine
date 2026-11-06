
/* ------------------------------------------------------------------------- *
 * The module is carried in this file as base64: one script, no fetch, no MIME
 * surprises, and the piece opens the same way from a phone, from a static
 * host, or straight off the disk.
 * ------------------------------------------------------------------------- */
(function () {
  var ready = false;
  var go = new Go();
  var bin = atob(WASM_B64);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  WebAssembly.instantiate(bytes, go.importObject).then(function (res) {
    ready = true;
    go.run(res.instance);
  }).catch(function (err) {
    if (window.console) console.error('songbranch: the module did not start', err);
    var c = document.getElementById('caption');
    if (c) c.textContent = 'the tree did not wake — try reloading';
  });
  window.addEventListener('songbranch-booted', function () { ready = true; });
})();
