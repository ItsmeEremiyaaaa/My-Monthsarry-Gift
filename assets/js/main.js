/* ==========================================================================
   Main experience — builds every section from content.js and wires up
   the interactions. Plain JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var G = window.GIFT;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var small = function () { return Math.min(window.innerWidth, window.innerHeight) < 620; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ordinal = function (n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function photoDate(file) {
    var m = /(20\d{2})(\d{2})(\d{2})/.exec(file);
    return m ? MONTHS[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1] : '';
  }
  var SPRIG = '<svg viewBox="0 0 200 200" aria-hidden="true"><use href="#sprig"/></svg>';

  /* ======================= text content ======================= */
  $('heroMonths').textContent = G.months;
  $('heroEyebrow').textContent = G.hero.eyebrow;
  $('heroName').textContent = G.herName;
  $('heroPoem').innerHTML = G.hero.poem.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');
  $('heroSub').textContent = G.hero.sub;
  $('heroMade').textContent = G.hero.madeWith;
  $('songLabel').textContent = G.songLabel || 'Our Song';

  $('verseText').innerHTML = G.verse.lines.map(function (l) {
    return '<span>' + esc(l).replace(/\[(.+?)\]/g, '<mark>$1</mark>') + '</span>';
  }).join('');
  $('verseRef').textContent = G.verse.ref;

  $('surpriseTitle').textContent = G.surprise.teaser;
  $('secretBtnLabel').textContent = G.surprise.button;
  $('secretClose').textContent = G.surprise.close;

  $('futureTitle').textContent = G.future.title;
  $('futureList').innerHTML = G.future.lines.map(function (l, i) { return '<li class="rv" style="--d:' + (i * 0.12) + 's">' + esc(l) + '</li>'; }).join('');
  $('futureLead').textContent = G.future.lead;
  $('futureLast').textContent = G.future.last;

  $('letterDate').textContent = G.letter.date;
  $('letterSalutation').textContent = G.letter.salutation;
  $('letterBody').innerHTML = G.letter.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  $('letterClosing').textContent = G.letter.closing;
  $('letterSign').textContent = G.signedBy;
  $('afterTitle').textContent = G.letter.afterTitle;
  $('afterSign').textContent = G.letter.afterSign;

  $('endNick').textContent = G.nickname;
  $('endTitle').textContent = 'Happy ' + ordinal(G.months) + ' Monthsary\u00a0❤️';
  $('endText').textContent = G.ending.text;
  $('endLove').textContent = G.ending.love;
  $('endMore').textContent = G.ending.more;
  $('footYear').textContent = new Date().getFullYear();

  /* ======================= sparkles on tap ======================= */
  function sparks(x, y, n) {
    if (reduce) return;
    var glyphs = ['♡', '✦', '✿', '·'];
    var cols = ['#f2a7bb', '#ffd9e2', '#e9c79b', '#e77f9d'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      var a = (Math.random() - 0.5) * 2.4 - Math.PI / 2, d = 26 + Math.random() * 40;
      s.className = 'spark';
      s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      s.style.color = cols[(Math.random() * cols.length) | 0];
      s.style.fontSize = (9 + Math.random() * 9) + 'px';
      s.style.setProperty('--x0', x + 'px'); s.style.setProperty('--y0', y + 'px');
      s.style.setProperty('--x1', (x + Math.cos(a) * d) + 'px'); s.style.setProperty('--y1', (y + Math.sin(a) * d - 14) + 'px');
      s.style.setProperty('--rot', ((Math.random() - 0.5) * 90) + 'deg');
      document.body.appendChild(s);
      setTimeout(s.remove.bind(s), 1100);
    }
  }
  function centerOf(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

  document.addEventListener('click', function (e) {
    if (!document.documentElement.classList.contains('is-open')) return;
    if (e.target.closest('.lightbox, .secret, .intro')) return;
    if (e.clientX || e.clientY) sparks(e.clientX, e.clientY, 4);
    if (e.target.closest('.btn, .nav__link, .menu-sheet__link, .deck__btn')) Sound.play('tap');
  });

  /* ======================= OUR STORY ======================= */
  var photos = [];
  var chaptersEl = $('chapters');
  G.story.forEach(function (ch, ci) {
    var feat = ch.photos[0];
    var land = feat.w > feat.h;
    var html = '';
    ch.photos.forEach(function (p) {
      photos.push({ file: p.file, cap: p.cap, date: photoDate(p.file), chapter: ch.title, w: p.w, h: p.h });
    });
    var base = photos.length - ch.photos.length;
    var num = ci + 1 < 10 ? '0' + (ci + 1) : String(ci + 1);

    html += '<article class="chapter" aria-labelledby="ch' + ci + '">';
    html += '<div class="chapter__media">';
    html += '<figure class="frame' + (land ? ' frame--land' : '') + '">';
    html += '<button class="frame__btn" type="button" data-photo="' + base + '" aria-label="View photo: ' + esc(feat.cap) + '">';
    html += '<div class="frame__inner"><img src="Pictures/thumb/' + feat.file + '.webp" srcset="Pictures/thumb/' + feat.file + '.webp 720w, Pictures/web/' + feat.file + '.webp 1600w" sizes="(max-width: 860px) 92vw, 440px" width="' + feat.w + '" height="' + feat.h + '" alt="' + esc(feat.cap) + '" loading="lazy" decoding="async"' + (feat.pos ? ' style="object-position:' + feat.pos + '"' : '') + '></div>';
    html += '</button>';
    html += '<figcaption><b>' + esc(feat.cap) + '</b><span>' + photoDate(feat.file) + '</span></figcaption>';
    html += '</figure>';
    html += '<div class="polaroids">';
    ch.photos.slice(1).forEach(function (p, i) {
      var r = [-6, 3, -2, 5][(i + ci) % 4];
      html += '<button class="polaroid" type="button" data-photo="' + (base + i + 1) + '" style="--r:' + r + 'deg;--i:' + i + '" aria-label="View photo: ' + esc(p.cap) + '">';
      html += '<img src="Pictures/thumb/' + p.file + '.webp" width="' + p.w + '" height="' + p.h + '" alt="' + esc(p.cap) + '" loading="lazy" decoding="async"' + (p.pos ? ' style="object-position:' + p.pos + '"' : '') + '>';
      html += '<span>' + esc(p.cap) + '</span></button>';
    });
    html += '</div></div>';
    html += '<div class="chapter__text">';
    html += '<span class="chapter__num" aria-hidden="true">' + num + '</span>';
    html += '<p class="chapter__month">' + esc(ch.emoji + ' ' + ch.month) + '</p>';
    html += '<h3 class="chapter__title" id="ch' + ci + '">' + esc(ch.title) + '</h3>';
    html += '<p class="chapter__msg">' + esc(ch.message) + '</p>';
    html += '<blockquote class="chapter__note">“' + esc(ch.note) + '”</blockquote>';
    html += '<span class="chapter__deco" aria-hidden="true">' + SPRIG + '</span>';
    html += '</div></article>';
    chaptersEl.insertAdjacentHTML('beforeend', html);
  });

  /* ======================= LIGHTBOX ======================= */
  var lb = $('lightbox'), lbImg = $('lbImg'), lbIdx = 0, lbOpener = null;
  function lbShow(i) {
    lbIdx = (i + photos.length) % photos.length;
    var p = photos[lbIdx];
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbImg.src = 'Pictures/web/' + p.file + '.webp';
    lbImg.width = p.w; lbImg.height = p.h;
    lbImg.alt = p.cap;
    $('lbCap').textContent = p.cap;
    $('lbMeta').textContent = [p.chapter, p.date, (lbIdx + 1) + ' / ' + photos.length].filter(Boolean).join('  ·  ');
    [1, -1].forEach(function (d) { var n = photos[(lbIdx + d + photos.length) % photos.length]; (new Image()).src = 'Pictures/web/' + n.file + '.webp'; });
  }
  function lbOpen(i, opener) {
    lbOpener = opener;
    lbShow(i);
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('lbClose').focus();
    Sound.play('chime');
  }
  function lbClose() {
    lb.hidden = true;
    document.documentElement.style.overflow = '';
    if (lbOpener) lbOpener.focus({ preventScroll: true });
  }
  chaptersEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-photo]');
    if (b) lbOpen(+b.getAttribute('data-photo'), b);
  });
  $('lbClose').addEventListener('click', lbClose);
  $('lbPrev').addEventListener('click', function () { lbShow(lbIdx - 1); Sound.play('tap'); });
  $('lbNext').addEventListener('click', function () { lbShow(lbIdx + 1); Sound.play('tap'); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  swipe(lb, function () { lbShow(lbIdx + 1); }, function () { lbShow(lbIdx - 1); });

  /* ======================= REASONS ======================= */
  var grid = $('reasonsGrid'), opened = 0;
  grid.innerHTML = G.reasons.map(function (r, i) {
    var n = i + 1 < 10 ? '0' + (i + 1) : String(i + 1);
    return '<button class="rcard" type="button" style="--i:' + i + '" aria-pressed="false" aria-label="Reason ' + (i + 1) + ': tap to reveal" data-label="Reason ' + (i + 1) + ': tap to reveal">' +
      '<span class="rcard__inner">' +
      '<span class="rcard__face rcard__front" aria-hidden="true"><span class="rcard__no">No. ' + n + '</span><span class="rcard__emoji">' + r.e + '</span><span class="rcard__hint">tap to open</span></span>' +
      '<span class="rcard__face rcard__back"><span class="rcard__text">' + esc(r.t) + '</span>' + SPRIG + '</span>' +
      '</span></button>';
  }).join('');
  $('reasonsDone').textContent = G.reasonsDone;
  function updateCount() {
    $('reasonsCount').textContent = opened + ' of ' + G.reasons.length + ' opened';
    var done = opened === G.reasons.length;
    $('reasonsDone').classList.toggle('show', done);
    $('revealAll').hidden = done;
  }
  function flip(card, quiet) {
    var open = !card.classList.contains('open');
    card.classList.toggle('open', open);
    card.setAttribute('aria-pressed', open);
    card.setAttribute('aria-label', open ? card.querySelector('.rcard__text').textContent : card.getAttribute('data-label'));
    opened += open ? 1 : -1;
    updateCount();
    if (!quiet) { Sound.play('flip'); if (open) { var c = centerOf(card); sparks(c[0], c[1], 7); } }
  }
  grid.addEventListener('click', function (e) { var c = e.target.closest('.rcard'); if (c) flip(c); });
  $('revealAll').addEventListener('click', function () {
    $$('.rcard:not(.open)', grid).forEach(function (c, i) { setTimeout(function () { flip(c, i % 3 !== 0); if (i % 3 === 0) Sound.play('flip'); }, i * 110); });
  });
  updateCount();

  /* ======================= NOTES DECK ======================= */
  var stack = $('deckStack'), notesIdx = 0, N = G.notes.length;
  stack.innerHTML = G.notes.map(function (n, i) {
    return '<article class="note" style="--c:' + n.color + '" aria-hidden="true" data-i="' + i + '">' +
      '<span class="note__icon" aria-hidden="true">' + n.icon + '</span>' +
      '<p class="note__text">' + esc(n.text) + '</p>' +
      '<p class="note__author">' + esc(n.author) + '</p></article>';
  }).join('');
  var notes = $$('.note', stack);
  function layoutDeck() {
    notes.forEach(function (el, i) {
      var rel = (i - notesIdx + N) % N;
      el.setAttribute('data-pos', rel === N - 1 ? 'out' : rel < 3 ? rel : 'hidden');
      el.setAttribute('aria-hidden', rel === 0 ? 'false' : 'true');
    });
    $('deckCount').textContent = (notesIdx + 1 < 10 ? '0' : '') + (notesIdx + 1) + ' / ' + N;
  }
  function deckGo(d) { notesIdx = (notesIdx + d + N) % N; layoutDeck(); Sound.play('flip'); }
  $('deckNext').addEventListener('click', function () { deckGo(1); });
  $('deckPrev').addEventListener('click', function () { deckGo(-1); });
  $('deck').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); deckGo(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); deckGo(-1); }
  });
  swipe($('deckStack'), function () { deckGo(1); }, function () { deckGo(-1); });
  layoutDeck();

  function swipe(el, onLeft, onRight) {
    var x0 = null, y0 = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
    el.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) onLeft(); else onRight(); }
    });
    el.addEventListener('pointercancel', function () { x0 = null; });
  }

  /* ======================= FUTURE: stars ======================= */
  function paintStars() {
    var sec = $('future'), h = sec.offsetHeight;
    var mk = function (n, size, alpha) {
      var out = [];
      for (var i = 0; i < n; i++) {
        var a = (alpha * (0.5 + Math.random() * 0.5)).toFixed(2);
        out.push((Math.random() * 100).toFixed(2) + 'vw ' + Math.round(Math.random() * h * 0.85) + 'px 0 ' + size + 'px rgba(255,' + (235 + ((Math.random() * 20) | 0)) + ',245,' + a + ')');
      }
      return out.join(',');
    };
    var sm = small() ? 0.6 : 1;
    $$('.stars--s', sec)[0].style.boxShadow = mk(Math.round(110 * sm), 0, 0.8);
    $$('.stars--m', sec)[0].style.boxShadow = mk(Math.round(45 * sm), 0.5, 0.9);
    $$('.stars--l', sec)[0].style.boxShadow = mk(Math.round(14 * sm), 1, 1);
  }

  /* ======================= SURPRISE ======================= */
  var secret = $('secret'), secretLines = $('secretLines'), secretGarden = null, secretTimers = [];
  function openSecret() {
    Sound.play('reveal');
    secretLines.innerHTML = '';
    $('secretClose').classList.remove('show');
    var delay = reduce ? 200 : 1800;
    G.surprise.lines.forEach(function (line) {
      var p = document.createElement('p');
      if (!line) { p.className = 'gap'; p.setAttribute('aria-hidden', 'true'); }
      else if (line.charAt(0) === '*') { p.className = 'big'; line = line.slice(1); }
      p.textContent = line;
      secretLines.appendChild(p);
      secretTimers.push(setTimeout(function () { p.classList.add('show'); }, delay));
      delay += reduce ? 60 : (line ? 1500 : 500);
    });
    secretTimers.push(setTimeout(function () { $('secretClose').classList.add('show'); }, delay + (reduce ? 0 : 800)));
    secret.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    void secret.offsetWidth;
    secret.classList.add('open');
    $('secretX').focus({ preventScroll: true });
    if (!reduce) {
      secretGarden = new Garden($('secretCanvas'), { maxDpr: 1.5, fireflies: small() ? 18 : 30, floaters: small() ? 8 : 14, floaterAlpha: 0.55, parallax: finePointer });
      secretGarden.start();
      setTimeout(function () { if (secretGarden) { secretGarden.burst(secretGarden.W / 2, secretGarden.H * 0.55, 36, { speed: 3, life: 2600, sparks: 0.5, lift: 0.8 }); } }, 900);
    }
  }
  function closeSecret() {
    secretTimers.forEach(clearTimeout); secretTimers = [];
    secret.classList.remove('open');
    setTimeout(function () {
      secret.hidden = true;
      if (secretGarden) { secretGarden.stop(); secretGarden = null; }
    }, reduce ? 50 : 900);
    document.documentElement.style.overflow = '';
    $('openSecret').focus({ preventScroll: true });
  }
  $('openSecret').addEventListener('click', openSecret);
  $('secretClose').addEventListener('click', closeSecret);
  $('secretX').addEventListener('click', closeSecret);
  secret.addEventListener('pointermove', function (e) { if (secretGarden && e.pointerType === 'mouse') secretGarden.setPointer(e.clientX, e.clientY); });

  /* ======================= LETTER ======================= */
  var env = $('envelope'), paper = $('paper');
  env.addEventListener('click', function () {
    if (env.classList.contains('open')) return;
    Sound.play('flip');
    env.classList.add('open');
    env.setAttribute('aria-expanded', 'true');
    $('letterHint').classList.add('hide');
    var c = centerOf(env); sparks(c[0], c[1], 10);
    setTimeout(function () {
      env.classList.add('gone');
      paper.classList.add('show');
      $('foldLetter').classList.add('show');
      Sound.play('chime');
    }, reduce ? 100 : 950);
    setTimeout(function () { $('letterAfter').classList.add('show'); }, reduce ? 200 : 5200);
  });
  $('foldLetter').addEventListener('click', function () {
    paper.classList.remove('show');
    $('foldLetter').classList.remove('show');
    env.classList.remove('gone', 'open');
    env.setAttribute('aria-expanded', 'false');
    $('letterHint').classList.remove('hide');
    env.scrollIntoView({ block: 'center' });
    env.focus({ preventScroll: true });
  });

  /* ======================= ENDING GARDEN ======================= */
  var endGarden = null, endVisible = false;
  function buildEndGarden() {
    var sm = small();
    endGarden = new Garden($('endGarden'), { maxDpr: 1.75, fireflies: sm ? 12 : 22, still: reduce, parallax: finePointer });
    var n = sm ? 20 : 38, t0 = performance.now();
    for (var i = 0; i < n; i++) {
      var hx = (i + Math.random() * 0.8) / n, hy = Garden.rand(0.22, 0.95);
      var depth = Garden.utils.clamp(0.3 + hy * 0.7 + Garden.rand(-0.1, 0.1), 0.3, 1);
      endGarden.addFlower({
        hx: hx, hy: hy, bx: hx + Garden.rand(-0.04, 0.04), by: 1.05, depth: depth,
        size: Garden.utils.lerp(0.05, 0.1, depth) * (sm ? 1.2 : 0.8),
        start: t0 + 300 + Math.abs(hx - 0.5) * 2600 + Math.random() * 700, grow: Garden.rand(1800, 2600), bloom: Garden.rand(1300, 1900)
      });
    }
    endGarden.addFlower({ hx: 0.5, hy: 0.5, bx: 0.5, by: 1.05, size: sm ? 0.16 : 0.13, depth: 1, type: 'peony', pal: Garden.PALETTES[4], n: 8, start: t0, grow: 2400, bloom: 2200, rot: -Math.PI / 2 });
    endGarden.sortByDepth();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        endVisible = en.isIntersecting;
        if (endVisible) {
          if (!endGarden) buildEndGarden();
          if (reduce) endGarden.frame(performance.now(), 16);
          else if (!endGarden.running) endGarden.start();
        } else if (endGarden) endGarden.stop();
      });
    }, { threshold: 0.12 }).observe($('end'));
  }
  $('end').addEventListener('pointermove', function (e) {
    if (!endGarden || e.pointerType !== 'mouse') return;
    var r = $('endGarden').getBoundingClientRect();
    endGarden.setPointer(e.clientX - r.left, e.clientY - r.top);
  });
  $('replayIntro').addEventListener('click', function () {
    if (ambient) ambient.stop();
    window.scrollTo(0, 0);
    window.Intro.play();
  });

  /* ======================= AMBIENT PETALS ======================= */
  var ambient = null;
  document.addEventListener('gift:open', function () {
    if (!reduce) {
      if (!ambient) ambient = new Garden($('ambient'), { maxDpr: 1, fireflies: small() ? 8 : 14, floaters: small() ? 5 : 9, floaterAlpha: 0.45, parallax: finePointer });
      ambient.start();
    }
    var mb = $('musicBtn');
    setTimeout(function () { if (!Sound.isMusicOn()) mb.classList.add('nudge'); }, 4200);
    onScroll();
  });

  /* ======================= CURSOR GLOW ======================= */
  if (finePointer && !reduce) {
    var glow = $('cursorGlow'), gx = -500, gy = -500, tx = -500, ty = -500, moving = false;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; glow.classList.add('on');
      if (ambient) ambient.setPointer(e.clientX, e.clientY);
      if (!moving) { moving = true; requestAnimationFrame(follow); }
    });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
    var follow = function () {
      gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(follow); else moving = false;
    };
  }

  /* ======================= SOUND UI ======================= */
  var musicBtn = $('musicBtn'), muteBtn = $('muteBtn');
  if (!Sound.supported) document.querySelector('.sound').hidden = true;
  function syncSound() {
    musicBtn.setAttribute('aria-pressed', Sound.isMusicOn());
    muteBtn.setAttribute('aria-pressed', Sound.isMuted());
    muteBtn.setAttribute('aria-label', Sound.isMuted() ? 'Unmute sounds' : 'Mute all sounds');
  }
  musicBtn.addEventListener('click', function () { musicBtn.classList.remove('nudge'); Sound.unlock(); Sound.toggleMusic(); });
  muteBtn.addEventListener('click', function () { Sound.setMuted(!Sound.isMuted()); });
  window.addEventListener('soundchange', syncSound);
  syncSound();

  /* ======================= NAV ======================= */
  var navLinks = $$('.nav__link'), sheetLinks = $$('.menu-sheet__link'), navDot = $('navDot');
  var groups = { home: 'home', story: 'story', reasons: 'reasons', notes: 'reasons', verse: 'reasons', surprise: 'surprise', future: 'future', letter: 'letter', end: 'letter' };
  var sections = Object.keys(groups).map($);
  var current = '';
  function setActive(id) {
    if (id === current) return;
    current = id;
    navLinks.concat(sheetLinks).forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    moveDot();
  }
  function moveDot() {
    var a = navLinks.filter(function (l) { return l.classList.contains('active'); })[0];
    if (!a || !a.offsetWidth) { navDot.style.opacity = 0; return; }
    navDot.style.opacity = 1;
    navDot.style.width = a.offsetWidth + 'px';
    navDot.style.transform = 'translateX(' + (a.offsetLeft) + 'px)';
  }

  var fab = $('menuFab'), sheet = $('menuSheet');
  function toggleSheet(open) {
    sheet.hidden = !open;
    fab.setAttribute('aria-expanded', open);
    fab.setAttribute('aria-label', open ? 'Close section menu' : 'Open section menu');
    if (open) { Sound.play('tap'); sheetLinks[0].focus({ preventScroll: true }); }
  }
  fab.addEventListener('click', function () { toggleSheet(sheet.hidden); });
  sheetLinks.forEach(function (a) { a.addEventListener('click', function () { toggleSheet(false); }); });
  document.addEventListener('click', function (e) { if (!sheet.hidden && !e.target.closest('#menuSheet, #menuFab')) toggleSheet(false); });

  /* ======================= REVEALS ======================= */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('in');
        io.unobserve(el);
        if (el.classList.contains('chapter')) Sound.play('whoosh');
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    $$('.rv, .chapter, #reasonsGrid, #futureEnd').forEach(function (el) { io.observe(el); });
  } else {
    $$('.rv, .chapter, #reasonsGrid, #futureEnd').forEach(function (el) { el.classList.add('in'); });
  }

  /* ======================= SCROLL: progress line, parallax, nav ======================= */
  var track = document.querySelector('.story__track'), prog = $('storyProgress');
  var frames = $$('.frame__inner');
  var ticking = false, lastY = 0;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;
      // tuck the floating controls away while reading, bring them back on scroll up
      var y = window.scrollY, dy = y - lastY;
      if (Math.abs(dy) > 6) {
        document.documentElement.classList.toggle('ui-hide', dy > 0 && y > vh * 0.6 && sheet.hidden);
        lastY = y;
      }
      var r = track.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
      prog.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      if (!reduce) {
        frames.forEach(function (f) {
          var fr = f.getBoundingClientRect();
          if (fr.bottom < -100 || fr.top > vh + 100) return;
          var off = ((fr.top + fr.height / 2) - vh / 2) * -0.05;
          f.style.setProperty('--py', Math.max(-28, Math.min(28, off)).toFixed(1) + 'px');
        });
      }
      var id = 'home';
      for (var i = 0; i < sections.length; i++) {
        if (sections[i] && sections[i].getBoundingClientRect().top < vh * 0.42) id = groups[sections[i].id];
      }
      setActive(id);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  var rz = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (ambient) ambient.resize();
      if (endGarden) { endGarden.resize(); if (reduce) endGarden.frame(performance.now(), 16); }
      if (secretGarden) secretGarden.resize();
      moveDot(); onScroll();
    }, 150);
  });
  window.addEventListener('load', paintStars);
  paintStars();

  /* ======================= KEYBOARD ======================= */
  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
      if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
      if (e.key === 'Tab') trap(e, lb);
    } else if (!secret.hidden) {
      if (e.key === 'Escape') closeSecret();
      if (e.key === 'Tab') trap(e, secret);
    } else if (!sheet.hidden && e.key === 'Escape') {
      toggleSheet(false); fab.focus();
    }
  });
  function trap(e, root) {
    var f = $$('button:not([hidden]), [href]', root).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
})();
