/* ==========================================================================
   Garden — a tiny canvas engine for growing flowers, fireflies & petals.
   Used by the intro, the ending garden, and the ambient petals.
   Flower positions are stored normalised (0–1) so resizes (e.g. the mobile
   address bar showing/hiding) never break the scene.
   ========================================================================== */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeBack = function (t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  // petal palettes: [tip, mid, base], center
  var PALETTES = [
    { p: ['#ffe3ea', '#f59ab5', '#b23a63'], c: '#ffe2a6' },   // rose pink
    { p: ['#fff6f7', '#f7cbd6', '#c97b93'], c: '#ffd98a' },   // blush white
    { p: ['#f6e3ff', '#cfa3ee', '#6f4499'], c: '#ffe8b0' },   // lilac
    { p: ['#ffe9dc', '#f8ae93', '#b95548'], c: '#fff0b8' },   // peach
    { p: ['#ffd0dc', '#e2587f', '#7c1a40'], c: '#ffd78f' },   // deep rose
    { p: ['#fffaf2', '#f3e1cf', '#bfa184'], c: '#f3c46b' }    // champagne
  ];

  // cached glow sprites
  var sprites = {};
  function glowSprite(color) {
    if (sprites[color]) return sprites[color];
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, color); g.addColorStop(0.25, color.replace(/[\d.]+\)$/, '0.45)'));
    g.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return (sprites[color] = c);
  }

  /* ---------- petal shapes (pointing up, base at origin) ---------- */
  function petalPath(ctx, type, L, W) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (type === 'daisy') {
      ctx.bezierCurveTo(W * 0.55, -L * 0.2, W * 0.5, -L * 0.85, 0, -L);
      ctx.bezierCurveTo(-W * 0.5, -L * 0.85, -W * 0.55, -L * 0.2, 0, 0);
    } else if (type === 'star') {
      ctx.bezierCurveTo(W * 0.75, -L * 0.3, W * 0.35, -L * 0.72, 0, -L);
      ctx.bezierCurveTo(-W * 0.35, -L * 0.72, -W * 0.75, -L * 0.3, 0, 0);
    } else { // rounded, softly notched tip (cosmos / peony)
      ctx.bezierCurveTo(W * 0.62, -L * 0.12, W * 0.8, -L * 0.72, W * 0.28, -L * 0.97);
      ctx.quadraticCurveTo(0, -L * 0.88, -W * 0.28, -L * 0.97);
      ctx.bezierCurveTo(-W * 0.8, -L * 0.72, -W * 0.62, -L * 0.12, 0, 0);
    }
    ctx.closePath();
  }

  function Garden(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maxDpr = opts.maxDpr || 2;
    this.parallax = opts.parallax !== false;
    this.still = !!opts.still;
    this.flowers = [];
    this.fireflies = [];
    this.floaters = [];
    this.bursts = [];
    this.seed = null;
    this.exitAt = 0;
    this.pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, px: -9999, py: -9999, active: false };
    this.W = 0; this.H = 0; this.u = 1;
    this.resize();
    this.addFireflies(opts.fireflies || 0, opts.fireflyColor);
    this.addFloaters(opts.floaters || 0, opts.floaterAlpha);
  }

  Garden.PALETTES = PALETTES;
  Garden.rand = rand;

  Garden.prototype.resize = function () {
    var r = this.canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    var W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    if (W === this.W && H === this.H && dpr === this.dpr) return;
    this.W = W; this.H = H; this.dpr = dpr;
    this.u = Math.min(W, H);
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
  };

  /* ---------- flowers ---------- */
  // f: {hx,hy,bx,by} normalised; size (fraction of min(W,H)); depth 0.3–1; start/grow/bloom in ms
  Garden.prototype.addFlower = function (f) {
    var types = ['cosmos', 'cosmos', 'daisy', 'star'];
    f.type = f.type || types[(Math.random() * types.length) | 0];
    f.pal = f.pal || PALETTES[(Math.random() * PALETTES.length) | 0];
    f.depth = f.depth == null ? 1 : f.depth;
    f.n = f.n || (f.type === 'daisy' ? 13 : f.type === 'star' ? 6 : f.type === 'peony' ? 8 : ((Math.random() * 2) | 0) + 5);
    f.rot = f.rot == null ? rand(0, TAU) : f.rot;
    f.tilt = f.tilt || rand(0.72, 0.95);
    f.curve = f.curve == null ? rand(-0.12, 0.12) : f.curve;
    f.grow = f.grow || 2600;
    f.bloom = f.bloom || 1800;
    f.start = f.start || 0;
    f.swayAmp = f.swayAmp == null ? rand(0.4, 1) : f.swayAmp;
    f.swayF = rand(0.0006, 0.0011);
    f.phase = rand(0, TAU);
    f.push = 0;
    f.leaves = f.leaves || [
      { t: rand(0.25, 0.4), side: 1, s: rand(0.8, 1.1) },
      { t: rand(0.45, 0.65), side: -1, s: rand(0.7, 1) }
    ];
    f.grads = null;
    this.flowers.push(f);
    return f;
  };

  Garden.prototype.sortByDepth = function () {
    this.flowers.sort(function (a, b) { return a.depth - b.depth; });
  };

  Garden.prototype._grads = function (f) {
    if (f.grads) return f.grads;
    var ctx = this.ctx, L = 1; // unit gradients, scaled with the petal transform
    var mk = function (a, b, c) {
      var g = ctx.createLinearGradient(0, 0, 0, -L);
      g.addColorStop(0, a); g.addColorStop(0.5, b); g.addColorStop(1, c);
      return g;
    };
    var p = f.pal.p;
    f.grads = {
      outer: mk(p[2], p[1], p[0]),
      inner: mk(p[2], p[2], p[1]),
      leaf: (function () {
        var g = ctx.createLinearGradient(0, 0, 1, 0);
        g.addColorStop(0, '#1f4630'); g.addColorStop(1, '#4f8a62');
        return g;
      })(),
      center: (function () {
        var g = ctx.createRadialGradient(-0.25, -0.25, 0, 0, 0, 1);
        g.addColorStop(0, '#fff8e0'); g.addColorStop(0.55, f.pal.c); g.addColorStop(1, '#a8743a');
        return g;
      })()
    };
    return f.grads;
  };

  Garden.prototype._drawFlower = function (f, now) {
    var ctx = this.ctx, W = this.W, H = this.H;
    var e = this.still ? 1e9 : now - f.start;
    if (e <= 0) return;
    var g = easeInOut(clamp(e / f.grow, 0, 1));
    var b = clamp((e - f.grow * 0.82) / f.bloom, 0, 1);
    var size = f.size * this.u;
    var alpha = lerp(0.38, 1, (f.depth - 0.3) / 0.7);

    // positions
    var bx = f.bx * W, by = f.by * H, hx = f.hx * W, hy = f.hy * H;
    var len = Math.hypot(hx - bx, hy - by);

    // sway + cursor bend
    var sway = this.still ? 0 : Math.sin(now * f.swayF + f.phase) * f.swayAmp * 0.035;
    if (this.pointer.active) {
      var dx = hx - this.pointer.px, dy = hy - this.pointer.py;
      var d = Math.sqrt(dx * dx + dy * dy), R = 170;
      var target = d < R ? (dx >= 0 ? 1 : -1) * (1 - d / R) * 0.09 : 0;
      f.push += (target - f.push) * 0.06;
    } else f.push *= 0.95;
    var bend = (sway + f.push) * len;
    hx += bend; hy += Math.abs(bend) * 0.15;
    var cx = lerp(bx, hx, 0.5) + f.curve * len + bend * 0.2;
    var cy = lerp(by, hy, 0.5);

    // parallax + exit drift
    var ox = 0, oy = 0;
    if (this.parallax) {
      ox = (0.5 - this.pointer.sx) * 36 * f.depth;
      oy = (0.5 - this.pointer.sy) * 20 * f.depth;
    }
    if (this.exitAt) {
      var x = clamp((now - this.exitAt) / 1700, 0, 1), k = x * x;
      var ex = f.hx - 0.5, ey = f.hy - 0.55, el = Math.hypot(ex, ey) || 1;
      ox += ex / el * k * W * (0.5 + f.depth * 0.5);
      oy += ey / el * k * H * (0.35 + f.depth * 0.4) + k * 40;
      alpha *= 1 - x;
      if (alpha <= 0.01) return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(ox, oy);

    // ---- stem (partial quadratic bezier) ----
    var N = 14, steps = Math.max(1, Math.ceil(N * g)), tipX = bx, tipY = by, tx = 0, ty = -1;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    for (var i = 1; i <= steps; i++) {
      var t = Math.min(i / N, g), mt = 1 - t;
      var px = mt * mt * bx + 2 * mt * t * cx + t * t * hx;
      var py = mt * mt * by + 2 * mt * t * cy + t * t * hy;
      tx = px - tipX; ty = py - tipY; tipX = px; tipY = py;
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#2e5a3e';
    ctx.lineWidth = Math.max(1, size * 0.07);
    ctx.lineCap = 'round';
    ctx.stroke();
    var tang = Math.atan2(ty, tx) + Math.PI / 2; // angle where "up" = along stem

    // ---- leaves ----
    var grads = this._grads(f);
    for (var l = 0; l < f.leaves.length; l++) {
      var lf = f.leaves[l];
      var ls = clamp((g - lf.t - 0.06) / 0.25, 0, 1);
      if (ls <= 0) continue;
      ls = easeOut(ls);
      var lt = lf.t, lmt = 1 - lt;
      var lx = lmt * lmt * bx + 2 * lmt * lt * cx + lt * lt * hx;
      var ly = lmt * lmt * by + 2 * lmt * lt * cy + lt * lt * hy;
      var la = Math.atan2(2 * lmt * (cy - by) + 2 * lt * (hy - cy), 2 * lmt * (cx - bx) + 2 * lt * (hx - cx));
      var LL = size * 1.25 * lf.s * ls, LW = size * 0.42 * lf.s * ls;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(la + lf.side * 0.95 + sway * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(LL * 0.45, -LW, LL, 0);
      ctx.quadraticCurveTo(LL * 0.45, LW, 0, 0);
      ctx.save(); ctx.scale(LL, LL); ctx.fillStyle = grads.leaf; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(LL * 0.85, 0);
      ctx.strokeStyle = 'rgba(160,210,170,0.25)'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.restore();
    }

    // ---- bud / bloom ----
    if (g > 0.55) {
      ctx.save();
      ctx.translate(tipX, tipY);
      if (b <= 0) {
        var bs = size * 0.38 * clamp((g - 0.55) / 0.45, 0, 1);
        ctx.rotate(tang);
        petalPath(ctx, 'star', bs * 1.2, bs * 0.9);
        ctx.fillStyle = f.pal.p[2];
        ctx.fill();
      } else {
        // glow behind head
        var gs = size * 3.2 * b;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha * 0.22 * b;
        ctx.drawImage(glowSprite('rgba(255,170,200,1)'), -gs / 2, -gs / 2, gs, gs);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        this._drawHead(f, size, b, tang, grads);
      }
      ctx.restore();
    }
    ctx.restore();
  };

  Garden.prototype._drawHead = function (f, size, b, tang, grads) {
    var ctx = this.ctx;
    ctx.scale(1, f.tilt);
    var layers = f.type === 'peony'
      ? [{ n: f.n, L: 1, W: 0.95, g: grads.outer, off: 0 }, { n: f.n - 1, L: 0.78, W: 0.85, g: grads.outer, off: 0.35 }, { n: f.n - 2, L: 0.52, W: 0.8, g: grads.inner, off: 0.7 }]
      : f.type === 'cosmos'
        ? [{ n: f.n, L: 1, W: 0.9, g: grads.outer, off: 0 }, { n: f.n, L: 0.55, W: 0.7, g: grads.inner, off: Math.PI / f.n }]
        : [{ n: f.n, L: 1, W: f.type === 'daisy' ? 0.32 : 0.62, g: grads.outer, off: 0 }];
    for (var li = 0; li < layers.length; li++) {
      var ly = layers[li];
      var lb = clamp(b * 1.25 - li * 0.12, 0, 1);
      if (lb <= 0) continue;
      for (var i = 0; i < ly.n; i++) {
        var o = easeBack(clamp(lb * 1.35 - (i / ly.n) * 0.35, 0, 1));
        var finalA = f.rot + ly.off + (i / ly.n) * TAU;
        var closedA = tang + (i - ly.n / 2) * 0.1;
        var a = lerp(closedA, finalA, clamp(o, 0, 1));
        var L = size * ly.L * lerp(0.4, 1, o);
        var Wd = size * ly.W * lerp(0.3, 1, o);
        ctx.save();
        ctx.rotate(a);
        petalPath(ctx, f.type, L, Wd);
        ctx.scale(L, L);
        ctx.fillStyle = ly.g;
        ctx.fill();
        ctx.restore();
      }
    }
    // center
    var cr = size * (f.type === 'daisy' ? 0.22 : f.type === 'peony' ? 0.16 : 0.18) * easeOut(b);
    if (cr > 0.3) {
      ctx.save();
      ctx.scale(cr, cr);
      ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU);
      ctx.fillStyle = grads.center; ctx.fill();
      ctx.restore();
      if (f.type !== 'peony' && cr > 3) {
        ctx.fillStyle = 'rgba(255,240,190,0.85)';
        for (var s = 0; s < 7; s++) {
          var sa = s / 7 * TAU + f.rot;
          ctx.beginPath(); ctx.arc(Math.cos(sa) * cr * 1.25, Math.sin(sa) * cr * 1.25, Math.max(0.6, cr * 0.1), 0, TAU); ctx.fill();
        }
      }
    }
  };

  /* ---------- fireflies ---------- */
  Garden.prototype.addFireflies = function (n, color) {
    this.fireflyColor = color || 'rgba(255,214,150,1)';
    for (var i = 0; i < n; i++) {
      this.fireflies.push({ x: Math.random(), y: Math.random(), vx: rand(-1, 1), vy: rand(-1, 1), ph: rand(0, TAU), sp: rand(0.6, 1.4), d: rand(0.3, 1), born: 0 });
    }
  };

  /* ---------- falling petals ---------- */
  Garden.prototype.addFloaters = function (n, alpha) {
    this.floaterAlpha = alpha == null ? 0.7 : alpha;
    for (var i = 0; i < n; i++) this.floaters.push(this._newFloater(true));
  };
  Garden.prototype._newFloater = function (anywhere) {
    var cols = ['#f7b6c8', '#f39ab3', '#ffd6df', '#e98aa6', '#f6c9d6', '#fbe0d0'];
    return { x: Math.random(), y: anywhere ? Math.random() : -0.05, s: rand(5, 11), r: rand(0, TAU), vr: rand(-0.02, 0.02), fl: rand(0, TAU), vy: rand(0.00012, 0.00028), sw: rand(0.4, 1.2), ph: rand(0, TAU), c: cols[(Math.random() * cols.length) | 0], d: rand(0.4, 1) };
  };

  Garden.prototype.burst = function (x, y, n, opts) {
    opts = opts || {};
    var cols = ['#f7b6c8', '#ffd6df', '#e98aa6', '#fff1c9', '#f39ab3'];
    for (var i = 0; i < n; i++) {
      if (this.bursts.length > 140) this.bursts.shift();
      var a = rand(0, TAU), sp = rand(opts.minSpeed || 0.4, opts.speed || 2.2);
      this.bursts.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.lift || 0.6), life: 0,
        max: rand(opts.minLife || 900, opts.life || 1800), s: rand(3, opts.size || 8), r: rand(0, TAU), vr: rand(-0.08, 0.08),
        c: cols[(Math.random() * cols.length) | 0], spark: Math.random() < (opts.sparks == null ? 0.35 : opts.sparks)
      });
    }
  };

  Garden.prototype.setPointer = function (x, y) {
    this.pointer.px = x; this.pointer.py = y;
    this.pointer.x = x / this.W; this.pointer.y = y / this.H;
    this.pointer.active = true;
  };
  Garden.prototype.clearPointer = function () { this.pointer.active = false; };

  /* ---------- frame ---------- */
  Garden.prototype.frame = function (now, dt) {
    var ctx = this.ctx, W = this.W, H = this.H;
    dt = Math.min(dt || 16, 50);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var p = this.pointer;
    p.sx += (p.x - p.sx) * 0.05; p.sy += (p.y - p.sy) * 0.05;

    // seed of light
    if (this.seed && this.seed.a > 0) {
      var s = this.seed, pulse = 1 + Math.sin(now * 0.004) * 0.18;
      var gs = s.r * 10 * pulse;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = s.a;
      ctx.drawImage(glowSprite('rgba(255,190,215,1)'), s.x - gs / 2, s.y - gs / 2, gs, gs);
      ctx.drawImage(glowSprite('rgba(255,245,230,1)'), s.x - gs / 5, s.y - gs / 5, gs / 2.5, gs / 2.5);
      if (s.ring) {
        var rr = s.ring * 90, ra = Math.max(0, 1 - s.ring);
        ctx.globalAlpha = ra * 0.6;
        ctx.strokeStyle = 'rgba(255,200,220,1)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, rr, rr * 0.3, 0, 0, TAU); ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    for (var i = 0; i < this.flowers.length; i++) this._drawFlower(this.flowers[i], now);

    // fireflies
    if (this.fireflies.length) {
      var spr = glowSprite(this.fireflyColor);
      ctx.globalCompositeOperation = 'lighter';
      for (var j = 0; j < this.fireflies.length; j++) {
        var f = this.fireflies[j];
        if (!this.still) {
          f.vx += (Math.sin(now * 0.0007 * f.sp + f.ph) * 0.6 - f.vx) * 0.02;
          f.vy += (Math.cos(now * 0.0006 * f.sp + f.ph * 1.3) * 0.5 - f.vy) * 0.02;
          f.x += f.vx * 0.00009 * dt; f.y += f.vy * 0.00009 * dt - 0.00001 * dt;
          if (f.x < -0.05) f.x = 1.05; if (f.x > 1.05) f.x = -0.05;
          if (f.y < -0.05) f.y = 1.05; if (f.y > 1.05) f.y = -0.05;
        }
        var tw = 0.35 + 0.65 * Math.pow(Math.sin(now * 0.0017 * f.sp + f.ph) * 0.5 + 0.5, 2);
        var fx = f.x * W + (this.parallax ? (0.5 - p.sx) * 50 * f.d : 0);
        var fy = f.y * H + (this.parallax ? (0.5 - p.sy) * 30 * f.d : 0);
        var fs = (8 + 18 * f.d) * (0.7 + tw * 0.5);
        ctx.globalAlpha = tw * (0.35 + f.d * 0.55) * (this.fadeFireflies == null ? 1 : this.fadeFireflies);
        ctx.drawImage(spr, fx - fs / 2, fy - fs / 2, fs, fs);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // floating petals
    for (var k = 0; k < this.floaters.length; k++) {
      var q = this.floaters[k];
      if (!this.still) {
        q.y += q.vy * dt; q.r += q.vr * dt * 0.06; q.fl += 0.002 * dt;
        q.x += Math.sin(now * 0.0005 + q.ph) * 0.00006 * dt * q.sw;
        if (q.y > 1.05) { this.floaters[k] = this._newFloater(false); continue; }
      }
      var qx = q.x * W + (this.parallax ? (0.5 - p.sx) * 60 * q.d : 0), qy = q.y * H;
      ctx.save();
      ctx.globalAlpha = this.floaterAlpha * q.d;
      ctx.translate(qx, qy); ctx.rotate(q.r); ctx.scale(Math.cos(q.fl) * 0.8 + 0.2, 1);
      petalPath(ctx, 'cosmos', q.s * 1.4, q.s);
      ctx.fillStyle = q.c; ctx.fill();
      ctx.restore();
    }

    // bursts
    if (this.bursts.length) {
      for (var m = this.bursts.length - 1; m >= 0; m--) {
        var u = this.bursts[m];
        u.life += dt;
        if (u.life >= u.max) { this.bursts.splice(m, 1); continue; }
        var lr = u.life / u.max;
        u.vx *= 0.985; u.vy = u.vy * 0.985 + 0.004 * dt * 0.1;
        u.x += u.vx * dt * 0.06; u.y += u.vy * dt * 0.06; u.r += u.vr * dt * 0.06;
        ctx.save();
        ctx.globalAlpha = (1 - lr) * (lr < 0.1 ? lr * 10 : 1);
        ctx.translate(u.x, u.y);
        if (u.spark) {
          ctx.globalCompositeOperation = 'lighter';
          var ss = u.s * 3;
          ctx.drawImage(glowSprite('rgba(255,225,200,1)'), -ss / 2, -ss / 2, ss, ss);
        } else {
          ctx.rotate(u.r);
          petalPath(ctx, 'cosmos', u.s * 1.4, u.s);
          ctx.fillStyle = u.c; ctx.fill();
        }
        ctx.restore();
      }
    }
  };

  /* helper: run a garden in a rAF loop, pausable */
  Garden.prototype.start = function (onFrame) {
    var self = this, last = performance.now();
    this.running = true;
    function loop(now) {
      if (!self.running) return;
      var dt = now - last; last = now;
      if (onFrame) onFrame(now, dt);
      self.frame(now, dt);
      self.raf = requestAnimationFrame(loop);
    }
    this.raf = requestAnimationFrame(loop);
  };
  Garden.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  };

  Garden.utils = { clamp: clamp, lerp: lerp, easeOut: easeOut, easeInOut: easeInOut };
  window.Garden = Garden;
})();
