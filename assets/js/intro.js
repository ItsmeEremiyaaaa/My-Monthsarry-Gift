/* ==========================================================================
   The cinematic flower intro.
   seed of light → falls → first flower grows & blooms → the garden spreads
   → "Something special…" → "For my favorite human…" → NICOLE ❤️ → Open
   ========================================================================== */
(function () {
  'use strict';

  var G = window.GIFT || {};
  var T = G.intro || {};
  var U = Garden.utils;
  var $ = function (id) { return document.getElementById(id); };

  var root = document.documentElement;
  var intro = $('intro'), canvas = $('introCanvas');
  var line1 = $('introLine1'), line2 = $('introLine2'), nameEl = $('introName');
  var btn = $('openGift'), skip = $('skipIntro');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var garden = null, t0 = 0, cues = [], state = 'idle', lastBurst = 0, bloomed = {};

  // Timeline (ms). Everything is driven from the animation clock so that a
  // backgrounded tab never de-syncs text and flowers.
  var TL = reduce
    ? { seedIn: 0, fall: 0, land: 0, stem: -1e9, spread: -1e9, l1: 200, l1out: 2600, l2: 3200, l2out: 5600, name: 6000, btn: 6800, skip: 0 }
    : { seedIn: 500, fall: 2300, land: 3400, stem: 3450, spread: 6200, l1: 4300, l1out: 8600, l2: 9300, l2out: 12600, name: 13100, btn: 15300, skip: 1800 };

  $('openGiftLabel').textContent = T.button || 'Open Your Gift';

  /* ---------- build the garden ---------- */
  function build() {
    var small = Math.min(window.innerWidth, window.innerHeight) < 620;
    garden = new Garden(canvas, {
      maxDpr: coarse ? 1.75 : 2,
      fireflies: small ? 18 : 32,
      floaters: small ? 7 : 12,
      floaterAlpha: 0.5,
      still: reduce,
      parallax: !coarse && !reduce
    });
    var W = garden.W, H = garden.H, u = garden.u;
    var heroSize = small ? 0.16 : 0.135;
    var heroY = H < 520 && W > H ? 0.72 : 0.63; // short landscape phones: keep the flower below the words

    // the first flower — grows from where the seed lands
    garden.addFlower({
      hx: 0.5, hy: heroY, bx: 0.5, by: 0.93, size: heroSize, depth: 1, type: 'peony', pal: Garden.PALETTES[0],
      n: 8, tilt: 0.88, curve: 0.04, rot: -Math.PI / 2, start: TL.stem, grow: 2600, bloom: 2300, swayAmp: 0.4, hero: true,
      leaves: [{ t: 0.3, side: 1, s: 1.3 }, { t: 0.52, side: -1, s: 1.15 }]
    });

    // the rest of the garden — Poisson-ish scatter across the whole screen
    var target = Math.round(Math.max(34, Math.min(92, (W * H) / (small ? 9000 : 15500))));
    var minD = Math.sqrt((W * H) / target) * 0.62;
    var heads = [{ x: 0.5 * W, y: heroY * H, r: heroSize * u * 2.1 }];
    var tries = 0, made = 0;
    while (made < target && tries < target * 40) {
      tries++;
      var hx = Garden.rand(0.02, 0.98), hy = Garden.rand(0.05, 0.99);
      var px = hx * W, py = hy * H, ok = true;
      for (var i = 0; i < heads.length; i++) {
        var h = heads[i];
        if (Math.hypot(px - h.x, py - h.y) < Math.max(minD, h.r || 0)) { ok = false; break; }
      }
      if (!ok) continue;
      // a quiet clearing where the words appear
      var inText = Math.pow((hx - 0.5) / 0.36, 2) + Math.pow((hy - 0.3) / 0.15, 2) < 1;
      var depth = U.clamp(0.28 + hy * 0.62 + Garden.rand(-0.15, 0.15), 0.3, 1);
      if (inText) depth = Garden.rand(0.3, 0.42);
      var size = U.lerp(0.032, 0.072, (depth - 0.3) / 0.7) * (small ? 1.35 : 1) * Garden.rand(0.85, 1.15);
      var d = Math.hypot((hx - 0.5) * W, (hy - heroY) * H) / u;
      garden.addFlower({
        hx: hx, hy: hy, bx: hx + Garden.rand(-0.05, 0.05), by: 1.03 + Garden.rand(0, 0.05), size: size, depth: depth,
        start: TL.spread + d * 2900 + Garden.rand(0, 800), grow: Garden.rand(1900, 2700), bloom: Garden.rand(1300, 1900)
      });
      heads.push({ x: px, y: py });
      made++;
    }
    garden.sortByDepth();
  }

  /* ---------- text helpers ---------- */
  function show(el) { el.classList.remove('hide'); el.classList.add('show'); }
  function hide(el) { el.classList.remove('show'); el.classList.add('hide'); }

  function setName() {
    var name = (T.name || G.herName || 'NICOLE').toUpperCase();
    nameEl.setAttribute('aria-label', name);
    nameEl.innerHTML = '';
    Array.prototype.forEach.call(name, function (c, i) {
      var s = document.createElement('span');
      s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = c; s.setAttribute('aria-hidden', 'true');
      nameEl.appendChild(s);
    });
    var h = document.createElement('span');
    h.className = 'ch ch--heart'; h.style.setProperty('--i', name.length + 1); h.textContent = '❤️'; h.setAttribute('aria-hidden', 'true');
    nameEl.appendChild(h);
  }

  function schedule() {
    cues = [
      { at: TL.skip, fn: function () { intro.classList.add('can-skip'); } },
      { at: TL.l1, fn: function () { intro.classList.add('has-text'); line1.textContent = T.line1; show(line1); } },
      { at: TL.l1out, fn: function () { hide(line1); } },
      { at: TL.l2, fn: function () { line2.textContent = T.line2; show(line2); } },
      { at: TL.l2out, fn: function () { hide(line2); } },
      { at: TL.name, fn: function () { show(nameEl); Sound.play('chime'); } },
      { at: TL.btn, fn: function () { show(btn); btn.tabIndex = 0; intro.classList.add('is-done'); } }
    ];
  }

  /* ---------- per-frame choreography ---------- */
  function onFrame(now) {
    var e = now - t0;
    // cues
    for (var i = 0; i < cues.length; i++) {
      if (!cues[i].done && e >= cues[i].at) { cues[i].done = true; cues[i].fn(); }
    }
    if (reduce) return;
    // seed of light
    var W = garden.W, H = garden.H, s = garden.seed;
    if (!s) s = garden.seed = { x: W / 2, y: H / 2, r: 6, a: 0 };
    s.x = W / 2;
    if (e < TL.fall) {
      s.a = U.easeOut(U.clamp((e - TL.seedIn) / 1400, 0, 1));
      s.y = H * 0.5 + Math.sin(e * 0.0015) * 4;
    } else if (e < TL.land) {
      var k = (e - TL.fall) / (TL.land - TL.fall);
      s.y = U.lerp(H * 0.5, H * 0.93, k * k);
      s.a = 1;
    } else {
      s.y = H * 0.93;
      s.ring = U.clamp((e - TL.land) / 1400, 0, 1);
      s.a = 1 - U.clamp((e - TL.land - 500) / 1800, 0, 1);
    }
    // soft chimes as flowers open (only once sound is unlocked by a tap)
    if (e > TL.stem) {
      for (var j = 0; j < garden.flowers.length; j += 3) {
        var f = garden.flowers[j];
        if (!bloomed[j] && e - f.start > f.grow * 0.82) { bloomed[j] = 1; Sound.play('bloom'); }
      }
    }
  }

  /* ---------- interaction ---------- */
  function onMove(ev) {
    if (!garden || state !== 'playing') return;
    if (ev.pointerType === 'mouse') { garden.setPointer(ev.clientX, ev.clientY); return; }
    var now = performance.now();
    if (now - lastBurst > 70) { lastBurst = now; garden.burst(ev.clientX, ev.clientY, 2, { speed: 1.2, life: 1500, size: 6 }); }
  }
  function onDown(ev) {
    Sound.unlock();
    if (!garden || state !== 'playing') return;
    if (ev.target.closest && ev.target.closest('button')) return;
    garden.burst(ev.clientX, ev.clientY, coarse ? 7 : 5, { speed: 1.6, life: 1800, size: 7 });
    Sound.play('bloom');
  }

  /* ---------- open / skip ---------- */
  function open() {
    if (state !== 'playing') return;
    state = 'leaving';
    Sound.unlock(); Sound.play('open');
    btn.classList.add('pressed');
    intro.classList.add('is-leaving');
    var now = performance.now();
    if (garden) {
      garden.exitAt = now + 250;
      var r = btn.getBoundingClientRect();
      var cx = r.width ? r.left + r.width / 2 : garden.W / 2, cy = r.height ? r.top + r.height / 2 : garden.H / 2;
      garden.burst(cx, cy, reduce ? 0 : 46, { speed: 4, minSpeed: 1, life: 2400, size: 9, lift: 1, sparks: 0.45 });
      garden.fadeFireflies = 1;
      (function fade() { if (!garden || !garden.running) return; garden.fadeFireflies = Math.max(0, garden.fadeFireflies - 0.02); if (garden.fadeFireflies > 0) requestAnimationFrame(fade); })();
    }
    window.scrollTo(0, 0);
    setTimeout(function () {
      root.classList.remove('is-intro');
      root.classList.add('is-open');
      var site = $('site');
      site.removeAttribute('inert');
      site.removeAttribute('aria-hidden');
      intro.classList.add('is-gone');
      document.dispatchEvent(new CustomEvent('gift:open'));
      var title = $('heroTitle');
      if (title) title.focus({ preventScroll: true });
      setTimeout(function () { site.classList.add('settled'); }, 2000);
    }, reduce ? 200 : 1100);
    setTimeout(finish, reduce ? 800 : 2600);
  }

  function finish() {
    state = 'idle';
    if (garden) { garden.stop(); garden.ctx.clearRect(0, 0, canvas.width, canvas.height); }
    garden = null;
    intro.setAttribute('aria-hidden', 'true');
    intro.style.display = 'none';
  }

  /* ---------- play (also used for "Replay the flowers") ---------- */
  function play() {
    state = 'playing';
    bloomed = {};
    intro.style.display = '';
    intro.removeAttribute('aria-hidden');
    intro.className = 'intro';
    [line1, line2, nameEl].forEach(function (el) { el.classList.remove('show', 'hide'); });
    btn.classList.remove('show', 'pressed'); btn.tabIndex = -1;
    line1.textContent = ''; line2.textContent = '';
    setName();
    root.classList.add('is-intro');
    var site = $('site');
    site.setAttribute('inert', '');
    site.setAttribute('aria-hidden', 'true');
    // restart the reveal
    if (root.classList.contains('is-open')) { root.classList.remove('is-open'); site.classList.remove('settled'); }

    build();
    schedule();
    t0 = performance.now();
    garden.flowers.forEach(function (f) { f.start += t0; });
    if (reduce) {
      garden.frame(t0, 16);
      (function tick() { if (state !== 'playing') return; onFrame(performance.now()); setTimeout(tick, 100); })();
    } else {
      garden.start(onFrame);
    }
  }

  var resizeRaf = 0;
  window.addEventListener('resize', function () {
    if (!garden) return;
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () { if (!garden) return; garden.resize(); if (reduce) garden.frame(performance.now(), 16); });
  });

  intro.addEventListener('pointermove', onMove);
  intro.addEventListener('pointerdown', onDown);
  intro.addEventListener('pointerleave', function () { if (garden) garden.clearPointer(); });
  btn.addEventListener('click', open);
  skip.addEventListener('click', open);
  document.addEventListener('keydown', function (e) {
    if (state === 'playing' && e.key === 'Escape') open();
  });

  window.Intro = { play: play };
  play();
})();
