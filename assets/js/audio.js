/* ==========================================================================
   Sound — soft synthesized chimes + optional background music.
   Nothing ever plays before the first tap (mobile autoplay rules), music is
   OFF until she turns it on, and a global mute is always one tap away.
   ========================================================================== */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master, sfxBus, musicBus, verb;
  var muted = store.get('gift-muted') === '1';
  var musicOn = false, musicTimer = null, songEl = null, songNode = null;
  var lastPlay = {};

  function emit() { window.dispatchEvent(new CustomEvent('soundchange', { detail: { muted: muted, music: musicOn } })); }

  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
      // tiny "reverb": filtered feedback delay
      verb = ctx.createDelay(1); verb.delayTime.value = 0.21;
      var fb = ctx.createGain(); fb.gain.value = 0.38;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
      verb.connect(lp); lp.connect(fb); fb.connect(verb);
      var wet = ctx.createGain(); wet.gain.value = 0.5; lp.connect(wet); wet.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master); sfxBus.connect(verb);
      musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master); musicBus.connect(verb);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function bell(freq, when, dur, vol, bus) {
    var t = ctx.currentTime + (when || 0);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(bus || sfxBus);
    [[1, 1], [2, 0.22], [3.01, 0.06]].forEach(function (h) {
      var o = ctx.createOscillator();
      var og = ctx.createGain(); og.gain.value = h[1];
      o.type = 'sine'; o.frequency.value = freq * h[0];
      o.connect(og); og.connect(g);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  var noiseBuf = null;
  function noise(when, dur, vol, freq, q) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var t = ctx.currentTime + (when || 0);
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1800; f.Q.value = q || 0.8;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    s.start(t); s.stop(t + dur + 0.05);
  }

  function pad(freqs, when, dur, vol, bus) {
    var t = ctx.currentTime + (when || 0);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(1.6, dur * 0.35));
    g.gain.setValueAtTime(vol, t + dur * 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    lp.connect(g); g.connect(bus || sfxBus);
    freqs.forEach(function (f) {
      [-4, 4].forEach(function (det) {
        var o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.value = f; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
      });
    });
  }

  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  var pick = function (a) { return a[(Math.random() * a.length) | 0]; };

  var SFX = {
    tap: function () { bell(pick([1046.5, 1174.66, 1318.51]), 0, 0.6, 0.025); },
    chime: function () { bell(pick(PENTA), 0, 1.2, 0.03); bell(pick(PENTA) * 2, 0.09, 1, 0.015); },
    bloom: function () { bell(pick(PENTA.slice(3)), 0, 1.6, 0.014); },
    flip: function () { noise(0, 0.22, 0.02, 2600, 0.7); bell(pick([1318.51, 1567.98]), 0.05, 0.9, 0.022); },
    whoosh: function () { noise(0, 0.9, 0.012, 900, 0.5); },
    open: function () {
      [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach(function (f, i) { bell(f, i * 0.09, 1.8, 0.04 - i * 0.003); });
      noise(0.1, 1.6, 0.012, 5200, 0.6);
      pad([174.61, 220, 261.63], 0, 3.5, 0.03);
    },
    reveal: function () {
      pad([130.81, 164.81, 196, 246.94], 0, 6, 0.035);
      [783.99, 987.77, 1174.66].forEach(function (f, i) { bell(f, 0.8 + i * 0.35, 2.4, 0.022); });
    }
  };

  /* ---------- background music ---------- */
  // Gentle generative "music box" over soft pads: Fmaj7 – C/E – Dm7 – B♭maj7
  var CHORDS = [
    { pad: [174.61, 220, 261.63, 329.63], mel: [698.46, 880, 1046.5, 1318.51, 783.99] },
    { pad: [164.81, 196, 261.63, 392], mel: [659.25, 783.99, 1046.5, 1174.66, 880] },
    { pad: [146.83, 174.61, 220, 261.63], mel: [587.33, 698.46, 880, 1046.5, 783.99] },
    { pad: [116.54, 146.83, 174.61, 220], mel: [587.33, 698.46, 932.33, 1174.66, 880] }
  ];
  var BAR = 4.8, step = 0;
  function scheduleBar() {
    if (!musicOn || !ctx) return;
    var c = CHORDS[step % CHORDS.length];
    pad(c.pad, 0.05, BAR + 1.6, 0.013, musicBus);
    var beats = [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2];
    var idx = (Math.random() * 3) | 0;
    beats.forEach(function (b, i) {
      if (Math.random() < (i % 2 ? 0.45 : 0.8)) {
        idx = Math.max(0, Math.min(c.mel.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)));
        bell(c.mel[idx], 0.05 + b, 2.2, i === 0 ? 0.034 : 0.022, musicBus);
      }
    });
    if (step % 2 === 0) bell(c.pad[0] * 2, 0.05, 3, 0.02, musicBus);
    step++;
  }

  function fadeMusic(to, secs) {
    var t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(to, t + secs);
  }

  function startMusic() {
    if (!ensure()) return;
    musicOn = true;
    var src = window.GIFT && window.GIFT.song;
    if (src) {
      if (!songEl) {
        songEl = new Audio(src); songEl.loop = true; songEl.preload = 'auto';
        try { songNode = ctx.createMediaElementSource(songEl); songNode.connect(musicBus); } catch (e) { songNode = null; }
      }
      songEl.play().catch(function () { /* ignored — button will show off */ });
      fadeMusic(songNode ? 0.8 : 0, 2.5);
    } else {
      fadeMusic(1, 3);
      step = 0; scheduleBar();
      clearInterval(musicTimer);
      musicTimer = setInterval(scheduleBar, BAR * 1000);
    }
    emit();
  }
  function stopMusic() {
    musicOn = false;
    if (ctx) fadeMusic(0, 1.2);
    clearInterval(musicTimer); musicTimer = null;
    if (songEl) setTimeout(function () { if (!musicOn) songEl.pause(); }, 1300);
    emit();
  }

  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
    if (songEl && musicOn) { if (document.hidden) songEl.pause(); else songEl.play().catch(function () {}); }
  });

  window.Sound = {
    unlock: function () { ensure(); },
    play: function (name) {
      if (muted || !SFX[name]) return;
      var now = Date.now();
      if (lastPlay[name] && now - lastPlay[name] < 120) return;
      lastPlay[name] = now;
      if (!ensure()) return;
      try { SFX[name](); } catch (e) { /* audio is optional */ }
    },
    toggleMusic: function () {
      if (musicOn) stopMusic();
      else { if (muted) this.setMuted(false); startMusic(); }
      return musicOn;
    },
    setMuted: function (m) {
      muted = m; store.set('gift-muted', m ? '1' : '0');
      if (ctx) {
        var t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(m ? 0 : 1, t + 0.4);
      }
      if (m && musicOn) stopMusic();
      emit();
    },
    isMuted: function () { return muted; },
    isMusicOn: function () { return musicOn; },
    supported: !!AC
  };
})();
