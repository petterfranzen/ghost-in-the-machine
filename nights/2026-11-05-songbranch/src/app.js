/* Songbranch — the browser's whole job: blit the frame Go painted, forward a
 * thumb, and — only after you ask — make the sounds. The tree, the birds and
 * every pixel live in the wasm module; nothing here draws a thing.
 */
(function () {
  'use strict';

  var W = 176, H = 312;
  var stage = document.getElementById('stage');
  var ctx = stage.getContext('2d', { alpha: false });
  var caption = document.getElementById('caption');
  var soundBtn = document.getElementById('sound');
  var soundLabel = soundBtn.querySelector('.label');

  ctx.imageSmoothingEnabled = false;

  var img = ctx.createImageData(W, H);
  var pixels = new Uint8Array(img.data.buffer);

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var motion = motionQuery && motionQuery.matches ? 0.35 : 1.0;

  var soundOn = false;
  var audio = null, master = null, space = null, noiseBuf = null;
  var last = 0, raf = 0;
  var birds = 4, nextBird = 0;
  var songs = 0;
  var booted = false;

  var NOTICE = {
    note: [
      'a bird sings, and the branch gives under it',
      'an answer from the far side of the tree',
      'the note fades slower than the light does',
      'one more voice in the dusk'
    ],
    knock: 'the whole tree gives, and settles back',
    wind: 'a breath of wind: the leaves lean and return',
    grass: 'the grass stirs at your feet'
  };

  /* --------------------------------------------------------------- caption */

  var noticeIndex = 0, captionTimer = 0;

  function say(text) {
    caption.textContent = text;
    caption.classList.add('lit');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(function () {
      caption.classList.remove('lit');
    }, 900);
  }

  /* ----------------------------------------------------------------- audio */

  function initAudio() {
    if (audio) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    audio = new AC();
    master = audio.createGain();
    master.gain.value = 0.0; // silent until the button is pressed
    master.connect(audio.destination);

    // a short, quiet space so notes do not stop dead
    var delay = audio.createDelay(0.7);
    delay.delayTime.value = 0.26;
    var fb = audio.createGain();
    fb.gain.value = 0.20;
    var wet = audio.createGain();
    wet.gain.value = 0.22;
    master.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(audio.destination);

    var len = Math.floor(audio.sampleRate * 1.6);
    noiseBuf = audio.createBuffer(1, len, audio.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function setSound(on) {
    if (on && !initAudio()) return;
    soundOn = on;
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundLabel.textContent = on ? 'sound on' : 'sound off';
    if (audio) {
      var t = audio.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(on ? 0.9 : 0.0, t, 0.12);
      if (on && audio.state === 'suspended') audio.resume();
    }
    if (on) playNote(392.0, 0.07); // a soft confirmation, not a fanfare
  }

  function playNote(hz, level) {
    if (!audio || !soundOn) return;
    var t = audio.currentTime;
    var g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level || 0.14, t + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    var f = audio.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 2400;
    var o1 = audio.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = hz;
    var o2 = audio.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = hz * 2.002;
    var g2 = audio.createGain();
    g2.gain.value = 0.16;
    o1.connect(f);
    o2.connect(g2);
    g2.connect(f);
    f.connect(g);
    g.connect(master);
    o1.start(t);
    o2.start(t);
    o1.stop(t + 2.7);
    o2.stop(t + 2.7);
  }

  function playKnock() {
    if (!audio || !soundOn) return;
    var t = audio.currentTime;
    var o = audio.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(96, t);
    o.frequency.exponentialRampToValueAtTime(58, t + 0.5);
    var g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 1.0);
    rustle(0.035, 0.35);
  }

  function rustle(level, seconds) {
    if (!audio || !soundOn || !noiseBuf) return;
    var t = audio.currentTime;
    var src = audio.createBufferSource();
    src.buffer = noiseBuf;
    var f = audio.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 0.7;
    var g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + seconds + 0.1);
  }

  /* -------------------------------------------------------------- wasm glue */

  function handleEvents() {
    var kind = window.songbranchEvent();
    if (!kind) return;
    if (kind === 1) {
      var hz = window.songbranchNoteHz();
      if (hz) playNote(hz);
      say(NOTICE.note[noticeIndex++ % NOTICE.note.length]);
      songs++;
    } else if (kind === 2) {
      playKnock();
      say(NOTICE.knock);
    } else if (kind === 3) {
      rustle(0.022, 1.1);
      say(NOTICE.wind);
    } else if (kind === 4) {
      rustle(0.014, 0.6);
      say(NOTICE.grass);
    }
    window.songbranchClear();
  }

  function worldPoint(ev) {
    var r = stage.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) / r.width * W,
      y: (ev.clientY - r.top) / r.height * H
    };
  }

  function tapAt(x, y) {
    window.songbranchTap(x, y);
    handleEvents();
  }

  /* ---------------------------------------------------------------- controls */

  stage.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    var p = worldPoint(ev);
    tapAt(p.x, p.y);
    if (stage.focus) stage.focus({ preventScroll: true });
  }, { passive: false });

  // Keyboard: Enter or Space calls the next bird in turn; T knocks the trunk.
  stage.addEventListener('keydown', function (ev) {
    var k = ev.key;
    if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
      ev.preventDefault();
      if (!booted) return;
      var i = nextBird % birds;
      nextBird++;
      tapAt(window.songbranchBirdX(i), window.songbranchBirdY(i));
    } else if (k === 't' || k === 'T') {
      ev.preventDefault();
      tapAt(88, 250); // the trunk's foot
    }
  });

  soundBtn.addEventListener('click', function () {
    setSound(!soundOn);
  });

  if (motionQuery) {
    var onMotion = function (e) {
      motion = e.matches ? 0.35 : 1.0;
      if (booted) window.songbranchMotion(motion);
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);
    else if (motionQuery.addListener) motionQuery.addListener(onMotion);
  }

  /* -------------------------------------------------------------------- loop */

  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    window.songbranchStep(dt);
    window.songbranchFrame(pixels);
    ctx.putImageData(img, 0, 0);
    handleEvents();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    window.songbranchBoot(motion);
    booted = true;
    birds = window.songbranchBirds() || 4;
    window.songbranchFrame(pixels);
    ctx.putImageData(img, 0, 0);
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  // The module is compiled with wasm_exec, which sets this flag when main has
  // registered its functions. Poll briefly rather than assume ordering.
  var tries = 0;
  (function wait() {
    if (window.songbranchReady) {
      start();
      return;
    }
    if (tries++ < 300) {
      setTimeout(wait, 20);
      return;
    }
    caption.textContent = 'the tree did not wake — try reloading';
  })();

  window.addEventListener('pagehide', function () {
    if (raf) cancelAnimationFrame(raf);
    if (audio && audio.state === 'running') audio.suspend();
  });
})();
