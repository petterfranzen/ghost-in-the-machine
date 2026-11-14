/* Songbranch — the browser's whole job: blit the frame Go painted, forward a
 * thumb (and a stroke, and a long press), and — only after you ask — make the
 * sounds. The tree, the birds, the fireflies and every pixel live in the wasm
 * module; nothing here draws a thing.
 */
(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var ctx = stage.getContext('2d', { alpha: false });
  var caption = document.getElementById('caption');
  var hintEl = document.getElementById('hint');
  var soundBtn = document.getElementById('sound');
  var soundLabel = soundBtn.querySelector('.label');

  ctx.imageSmoothingEnabled = false;

  var view = { w: 176, h: 312 };
  var img = null;
  var pixels = null;

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var motion = motionQuery && motionQuery.matches ? 0.35 : 1.0;
  var touchQuery = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;

  var soundOn = false;
  var audio = null, master = null, space = null, noiseBuf = null;
  var last = 0, raf = 0;
  var birds = 6, nextBird = 0;
  var songs = 0;
  var booted = false;
  var idleTimer = 0, idleHint = 0;
  var lastMessage = '';

  var NOTICE = {
    note: [
      'a bird sings, and the branch gives under it',
      'an answer from the far side of the tree',
      'the note fades slower than the light does',
      'one more voice in the dusk'
    ],
    knock: 'the whole tree gives, and settles back',
    wind: 'a breath of wind: the leaves lean and return',
    grass: 'the grass stirs at your feet',
    moon: 'the moon answers with an old light',
    nest: 'something small shifts in the nest',
    swipe: 'the leaves let go, and the fireflies rise',
    chime: 'a melody the tree remembers',
    pair: 'two birds trade a slow call'
  };

  var IDLE_HINTS = [
    'the moon is watching. so is the nest.',
    'hold the nest a little longer',
    'stroke the leaves, and see who rises',
    'tap the birds low to high, and listen'
  ];

  /* --------------------------------------------------------------- caption */

  var captionTimer = 0;

  function say(text) {
    if (!text) return;
    caption.textContent = text;
    caption.classList.add('lit');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(function () {
      caption.classList.remove('lit');
    }, 1400);
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

  function playChime() {
    if (!audio || !soundOn) return;
    var t = audio.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach(function (hz, i) {
      var o = audio.createOscillator();
      o.type = 'sine';
      o.frequency.value = hz;
      var g = audio.createGain();
      var at = t + i * 0.16;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.10, at + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 2.2);
      o.connect(g);
      g.connect(master);
      o.start(at);
      o.stop(at + 2.3);
    });
  }

  function playPeep() {
    if (!audio || !soundOn) return;
    var t = audio.currentTime;
    var o = audio.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(1174.66, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 0.16);
    var g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.10, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.35);
  }

  function playShimmer() {
    if (!audio || !soundOn) return;
    rustle(0.02, 1.4);
    playNote(587.33, 0.06);
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
    var msg = window.songbranchMessage ? window.songbranchMessage() : '';
    if (msg && msg !== lastMessage) {
      lastMessage = msg;
      say(msg);
    }
    if (!kind) return;
    var line = msg;
    if (kind === 1 || kind === 9) {
      var hz = window.songbranchNoteHz();
      if (hz) playNote(hz);
      line = line || (kind === 9 ? NOTICE.pair : NOTICE.note[Math.floor(Math.random() * NOTICE.note.length)]);
      songs++;
    } else if (kind === 2) {
      playKnock();
      line = line || NOTICE.knock;
    } else if (kind === 3) {
      rustle(0.022, 1.1);
      line = line || NOTICE.wind;
    } else if (kind === 4) {
      rustle(0.014, 0.6);
      line = line || NOTICE.grass;
    } else if (kind === 5) {
      playChime();
      line = line || NOTICE.moon;
    } else if (kind === 6) {
      playPeep();
      line = line || NOTICE.nest;
    } else if (kind === 7) {
      playShimmer();
      line = line || NOTICE.swipe;
    } else if (kind === 8) {
      playChime();
      line = line || NOTICE.chime;
    }
    if (line) say(line);
    window.songbranchClear();
  }

  /* ---------------------------------------------------------------- viewport */

  function fitView() {
    var vw = window.innerWidth || 390;
    var vh = window.innerHeight || 844;
    if (touchQuery && touchQuery.matches) {
      // full screen on a phone: the frame matches the viewport's aspect, and
      // the art sits at its own pixel size inside it
      if (vh >= vw) {
        return { w: 176, h: Math.max(312, Math.round(176 * vh / vw)) };
      }
      return { w: Math.max(176, Math.round(312 * vw / vh)), h: 312 };
    }
    return { w: 176, h: 312 };
  }

  function worldPoint(ev) {
    var r = stage.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) / r.width * view.w,
      y: (ev.clientY - r.top) / r.height * view.h
    };
  }

  function tapAt(x, y) {
    window.songbranchTap(x, y);
    handleEvents();
    pokeIdle();
  }

  function pokeIdle() {
    idleTimer = 0;
    hintEl.classList.remove('hint');
  }

  /* ---------------------------------------------------------------- controls */

  var press = null;
  var holdTimer = 0;
  var holdFired = false;

  stage.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    var p = worldPoint(ev);
    press = { x: p.x, y: p.y, x0: p.x, y0: p.y, moved: false };
    holdFired = false;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      if (!press || press.moved) return;
      holdFired = true;
      var kind = window.songbranchHold(press.x, press.y, 0.7);
      if (kind) handleEvents();
      pokeIdle();
    }, 700);
    tapAt(p.x, p.y);
    if (stage.focus) stage.focus({ preventScroll: true });
  }, { passive: false });

  stage.addEventListener('pointermove', function (ev) {
    if (!press) return;
    var p = worldPoint(ev);
    if (Math.hypot(p.x - press.x0, p.y - press.y0) > 12) {
      press.moved = true;
      clearTimeout(holdTimer);
    }
    press.x = p.x;
    press.y = p.y;
  }, { passive: true });

  function endPress(ev) {
    if (!press) return;
    clearTimeout(holdTimer);
    var p = worldPoint(ev);
    var moved = press.moved || Math.hypot(p.x - press.x0, p.y - press.y0) > 14;
    if (moved && !holdFired) {
      var kind = window.songbranchSwipe(press.x0, press.y0, p.x, p.y);
      if (kind) handleEvents();
      pokeIdle();
    }
    press = null;
  }

  stage.addEventListener('pointerup', endPress);
  stage.addEventListener('pointercancel', function () { clearTimeout(holdTimer); press = null; });

  // Keyboard: Enter or Space nudges the next bird in turn; T knocks the trunk,
  // M taps the moon, N holds the nest. Every secret has a key.
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
      tapAt(88, 250);
    } else if (k === 'm' || k === 'M') {
      ev.preventDefault();
      tapAt(window.songbranchMoonX(), window.songbranchMoonY());
    } else if (k === 'n' || k === 'N') {
      ev.preventDefault();
      var kind = window.songbranchHold(window.songbranchNestX(), window.songbranchNestY(), 0.7);
      if (kind) handleEvents();
      pokeIdle();
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
    idleTimer += dt;
    if (idleTimer > 26) {
      idleTimer = 0;
      var hint = window.songbranchHint ? window.songbranchHint() : '';
      if (hint) {
        say(IDLE_HINTS[idleHint % IDLE_HINTS.length]);
        idleHint++;
        hintEl.classList.add('hint');
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    view = fitView();
    stage.width = view.w;
    stage.height = view.h;
    img = ctx.createImageData(view.w, view.h);
    pixels = new Uint8Array(img.data.buffer);
    window.songbranchBoot(motion, view.w, view.h);
    booted = true;
    birds = window.songbranchBirds() || 6;
    nextBird = 0;
    window.songbranchFrame(pixels);
    ctx.putImageData(img, 0, 0);
    last = 0;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!booted) return;
      var next = fitView();
      if (next.w !== view.w || next.h !== view.h) start();
    }, 220);
  });

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
