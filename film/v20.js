/* v22 — 4K60 Master Edition for 琉璃 (69.50s, 4170 frames @ 60fps, 100% deterministic from t)
   - 0.00–1.85s: Living pure-white prologue with playful animated folding-fan Liuli logo -> 0.30s silky dissolve
   - Full-film 21:9 panoramic cinema player window (1540x660 @ 1.08x) + stretched 21:9 playbar + 100% centered UI
   - Re-balanced pacing (total 69.50s unchanged):
     * 9.00–14.80s (5.80s, +1.0s): 21:9 Full-Screen Appreciation Mode
     * 15.80–19.10s (3.30s): Floating Mini Player with synchronized real-time progress bar & timer
     * 20.10–23.60s (3.50s, +0.5s): Control Bar -> A-B Loop Optical Magnifier (with staggered element entrance)
     * 24.70–29.30s (4.60s): Control Bar -> Speed & Pitch Optical Magnifier
     * 29.30–30.30s (1.00s): 「精细调音」 (ZERO album cards behind text)
     * 30.30–38.50s (8.20s): 21:9 32-Band Alive Studio EQ
     * 39.50–49.90s (10.40s, -3.0s): 21:9 Video Showcase (dark control bar always, title = "琉璃播放器广告片")
     * 49.90–51.95s (2.05s, +0.4s): Serene Nocturnal Blue 「享受的时刻 / 不该被打扰」
     * 51.95–57.60s (5.65s): 9 Borderless Ad Cards & Solar Slash Ballistic Purge
     * 57.60–59.60s (2.00s, +1.1s): Deconstructed Element-by-Element Rapid Cascade Drop & Window Assembly (ZERO double-image flash!)
     * 59.60–64.50s (4.90s): Classical Full-Screen Album Carousel Rapid Spin
     * 64.50–69.50s (5.00s): Pure Monochrome B&W TANCO STUDIO End Card */
(function () {
  if (window.__v20) return;
  window.__v20 = true;

  var prevSeek = window.seek;
  var main = document.getElementById('main');
  var app = document.getElementById('app');
  var titleStage = document.getElementById('v7-title-stage');
  var v10Stage = document.getElementById('v10-stage');
  var end91 = document.getElementById('v91-endcard');
  var videoStage = document.getElementById('original-video-stage');
  var gv = document.getElementById('glass-video');

  var currentT = 0;

  /* ---------- Math & Color Helpers ---------- */
  function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function easeOutExpo(t) { t = clamp01(t); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutQuint(t) { t = clamp01(t); return 1 - Math.pow(1 - t, 5); }
  function easeInOutCubic(t) { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutBack(t) { t = clamp01(t); var c1 = 1.55, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function hexRgb(h) { var n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function lerpRgbArr(a, b, t) {
    return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))];
  }
  function rgbCss(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
  function rgbaCss(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function lerpHex(h1, h2, t) { return rgbCss(lerpRgbArr(hexRgb(h1), hexRgb(h2), t)); }
  function lerpRgba(h1, h2, t, a) { return rgbaCss(lerpRgbArr(hexRgb(h1), hexRgb(h2), t), a); }

  function audioData() { return (typeof audioAnalysis !== 'undefined' && audioAnalysis) || []; }
  function audioFrameAt(t) {
    var A = audioData();
    if (!A.length) return null;
    return A[Math.max(0, Math.min(A.length - 1, Math.floor(t * 60)))];
  }
  function audioEnergy(t) {
    var fr = audioFrameAt(t);
    if (!fr || !fr.wave || !fr.wave.length) return 0.35 + 0.25 * Math.sin(t * 4.2);
    var s = 0, n = 0;
    for (var i = 0; i < fr.wave.length; i += 4) { s += Math.abs(fr.wave[i] || 0); n++; }
    return clamp01((n ? s / n : 0) / 0.38);
  }

  /* ---------- Piecewise Time Warp for Underlying V7_PLAN Engine ---------- */
  // Maps real film timestamp `t` (0..69.50s) to V7_PLAN's internal segment time `tBase`
  // so every internal state (Appreciation, Mini, Loop, Speed, EQ, Video menus/subtitles, Climax)
  // stays 100% aligned with our re-balanced v22 chapter windows!
  /* v22 (2026-11-24, TANCO): the intro carousel now glides to a stop on the blue Chopin card
     (instead of continuing to the white Bach card); the 0.50s saved goes to 沉浸欣赏 (Appreciation).
     Original drift: position = 15 + 1.05 * (tV7 - 4)  ->  Chopin (position 18) at tV7 = 6.857s.
     v22: identical until 6.45s, then constant deceleration (iOS-style glide) reaching Chopin with zero
     velocity at 7.264s, short hold with the original light sweep, 沉浸欣赏 title 7.50–8.50s,
     Appreciation 8.50–14.80s (6.30s, +0.50s). Everything from 14.80s on is untouched. */
  var V22_DECEL_START = 6.45;
  var V22_CHOPIN_TV7 = 4 + 3 / 1.05;                                  // 6.857142857
  var V22_DECEL_DUR = 2 * (V22_CHOPIN_TV7 - V22_DECEL_START);         // 0.814285714 (velocity 1.05 -> 0)
  var V22_TITLE1_START = 7.50, V22_APPR_START = 8.50, V22_APPR_END = 14.80;
  function v22IntroTime(t) {
    if (t < V22_DECEL_START) return t;
    var tau = t - V22_DECEL_START;
    if (tau >= V22_DECEL_DUR) return V22_CHOPIN_TV7;
    return V22_DECEL_START + tau - tau * tau / (2 * V22_DECEL_DUR);
  }
  window.__v22IntroTime = v22IntroTime;
  function mapToV7Time(t) {
    if (t < V22_TITLE1_START) return v22IntroTime(t);
    // 7.50..8.50 (沉浸欣赏 title) -> 8.00..9.00 (V7 title segment)
    if (t < V22_APPR_START) return 8.00 + (t - V22_TITLE1_START);
    // 8.50..14.80 (6.30s Appreciation) -> 9.00..13.80 (4.80s in V7_PLAN)
    if (t < V22_APPR_END) return 9.00 + ((t - V22_APPR_START) / (V22_APPR_END - V22_APPR_START)) * 4.80;
    // 14.80..20.10 (Ch02 title 14.8..15.8, Mini 15.8..19.1, Ch03 title 19.1..20.1) -> 13.80..19.10
    if (t < 20.10) return t - 1.00;
    // 20.10..23.60 (3.50s A-B Loop) -> 19.10..22.10 (3.00s in V7_PLAN)
    if (t < 23.60) return 19.10 + ((t - 20.10) / 3.50) * 3.00;
    // 23.60..39.50 (Ch04 title 23.6..24.7, Speed 24.7..29.3, Ch05 29.3..30.3, EQ 30.3..38.5, Ch06 38.5..39.5) -> 22.10..38.00
    if (t < 39.50) return t - 1.50;
    // 39.50..49.90 (10.40s Video Showcase, smoothly removing the dead pause around 42–43s) -> 38.00..51.40 (13.40s in V7_PLAN)
    if (t < 49.90) {
      var u = (t - 39.50) / 10.40;
      return 38.00 + u * 13.40;
    }
    // 49.90..51.95 (Manifesto) -> 51.40..53.05
    if (t < 51.95) return 51.40 + ((t - 49.90) / 2.05) * 1.65;
    // 51.95..57.60 (9 Ads & Purge) -> 53.05..58.15
    if (t < 57.60) return 53.05 + ((t - 51.95) / 5.65) * 5.10;
    // 57.60..59.60 (2.00s Deconstructed Element-by-Element Assembly): park V7 at 59.65 so full-screen UI DOM is active without V7/V9 drop conflict!
    if (t < 59.60) return 59.65;
    return t;
  }

  /* ---------- 1. Global 21:9 Cinema Player Geometry Override ---------- */
  geometry = function () {
    var t = currentT;
    if (t >= 57.60) {
      var k = sstep((t - 57.60) / 1.85);
      var w = lerp(1540, 1315.5556, k);
      var h = lerp(660, 740, k);
      var sc = lerp(1.08, 1.4594595, k);
      return { x: (1920 - w * sc) / 2, y: (1080 - h * sc) / 2, w: w, h: h, scale: sc, f: 1 };
    }
    var w0 = 1540, h0 = 660, sc0 = 1.08;
    return { x: (1920 - w0 * sc0) / 2, y: (1080 - h0 * sc0) / 2, w: w0, h: h0, scale: sc0, f: 0 };
  };

  /* ---------- 2. 4K Ultra-HD (2400x2400) Classical Album Covers ---------- */
  var CLASSICAL = [
    { title: 'Nocturnes, Op. 9', artist: 'Frédéric Chopin · Maurizio Pollini', album: 'The Complete Nocturnes · 96kHz FLAC', cover: 'assets/classical-01.jpg', bg: '#081A42', glow: '#3B9EFF' },
    { title: 'Cello Suites, BWV 1007', artist: 'J. S. Bach · Anner Bylsma', album: 'ECM New Series · Archival Edition', cover: 'assets/classical-02.jpg', bg: '#1D2430', glow: '#B8C8DF' },
    { title: 'Clair de Lune', artist: 'Claude Debussy', album: 'Suite bergamasque · ALAC Lossless', cover: 'assets/classical-03.jpg', bg: '#0A285E', glow: '#5EE0FF' },
    { title: 'Symphony No. 5', artist: 'Gustav Mahler · Berliner Philharmoniker', album: 'Adagietto · WAV Master', cover: 'assets/classical-04.jpg', bg: '#3E1A0D', glow: '#FFA24A' },
    { title: 'G 弦上的咏叹调', artist: 'J. S. Bach · Yo-Yo Ma', album: 'Orchestral Suite No. 3 · BWV 1068', cover: 'assets/classical-05.jpg', bg: '#2B140C', glow: '#F2B263' },
    { title: 'Piano Concerto No. 2', artist: 'Sergei Rachmaninoff', album: 'Masterworks Edition · DSD 128', cover: 'assets/classical-06.jpg', bg: '#151923', glow: '#8AA8D8' }
  ];

  /* v22: new landing album for the finale (TANCO 2026-11-24): J. S. Bach · Minuet in G major.
     It takes over card slot 5 only from roll >= 20 (t >= 63.689s), the exact moment slot 5 sits at the
     invisible seam of the 3D ring (|offset| = 3, alpha 0), so the swap is never seen; the ring then lands on it. */
  var MINUET = { title: 'G 大调小步舞曲', artist: 'J. S. Bach · Anna Magdalena Notebook', album: 'Minuet in G Major · BWV Anh. 114', cover: 'assets/classical-07.jpg', bg: '#0E2A26', glow: '#E9C46A' };
  var V22_MINUET_SWAP = 59.60 + 4.40 * Math.pow(16 / 19, 1 / 2.35);   // roll(t) = 20
  function v22MinuetOn() { return currentT >= V22_MINUET_SWAP && currentT < 64.50; }
  function cardData(i) { return (i === 5 && v22MinuetOn()) ? MINUET : CLASSICAL[i]; }
  var v22MinuetImgs = [];
  function v22EnsureMinuetLayers() {
    var card = document.getElementById('cover-5');
    if (!card || card.__v22) return;
    card.__v22 = true;
    var art = card.querySelector('.cover-art');
    if (art) {
      var ov = document.createElement('img');
      ov.className = 'cover-art v22-minuet-art';
      ov.src = MINUET.cover;
      art.parentNode.insertBefore(ov, art.nextSibling);
      v22MinuetImgs.push(ov);
    }
    var rf = card.querySelector('.reflection img');
    if (rf) {
      var ov2 = document.createElement('img');
      ov2.className = 'v22-minuet-ref';
      ov2.src = MINUET.cover;
      rf.parentNode.appendChild(ov2);
      v22MinuetImgs.push(ov2);
    }
    var nc = document.getElementById('now-cover');
    if (nc) {
      var ov3 = document.createElement('img');
      ov3.id = 'v22-now-cover-minuet';
      ov3.src = MINUET.cover;
      nc.parentNode.insertBefore(ov3, nc.nextSibling);
      v22MinuetImgs.push(ov3);
    }
  }
  function patchClassicalAssets() {
    try {
      v22EnsureMinuetLayers();
      var mOn = v22MinuetOn();
      document.documentElement.classList.toggle('v22-minuet-on', mOn);
      for (var i = 0; i < 6; i++) {
        if (typeof covers !== 'undefined' && covers) covers[i] = CLASSICAL[i].cover;
        if (typeof names !== 'undefined' && names) names[i] = CLASSICAL[i].title;
        if (window.V7_TRACKS && window.V7_TRACKS[i]) {
          window.V7_TRACKS[i].title = CLASSICAL[i].title;
          window.V7_TRACKS[i].artist = CLASSICAL[i].artist;
          window.V7_TRACKS[i].album = CLASSICAL[i].album;
          window.V7_TRACKS[i].cover = CLASSICAL[i].cover;
        }
        var card = document.getElementById('cover-' + i);
        if (card) {
          var im = card.querySelector('.cover-art'); if (im && im.getAttribute('src') !== CLASSICAL[i].cover) im.src = CLASSICAL[i].cover;
          var rf = card.querySelector('.reflection img'); if (rf && rf.getAttribute('src') !== CLASSICAL[i].cover) rf.src = CLASSICAL[i].cover;
          var tt = card.querySelector('.cover-title'); if (tt) tt.textContent = cardData(i).title;
          var ar = card.querySelector('.cover-artist'); if (ar) ar.textContent = cardData(i).artist;
        }
      }
      window.__CLASSICAL = CLASSICAL[4];
    } catch (e) {}
  }
  patchClassicalAssets();

  /* ---------- 3. Pure-White Living Prologue with Animated Folding-Fan Logo (0.00–1.85s) ---------- */
  var FAN_PATH_D = 'M 0.5,0.2 A 0.3,0.3 0 1 1 0.4999,0.2 Z M 0.5,0.3 A 0.2,0.2 0 1 0 0.5001,0.3 Z M 0.5,0.42 A 0.08,0.08 0 1 1 0.4999,0.42 Z'; /* placeholder mark — replace with your own logo path (unit square 0..1) */

  var proEl = document.createElement('section');
  proEl.id = 'v21-prologue';
  proEl.innerHTML =
    '<div class="vp-aura1"></div>' +
    '<div class="vp-aura2"></div>' +
    '<div class="vp-halo"></div>' +
    '<div class="vp-logo-wrap">' +
      '<div class="vp-icon-box">' +
        '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">' +
          '<defs><clipPath id="v21-fan-clip"><polygon id="v21-fan-poly" points="192,512 1024,512 1024,512"/></clipPath></defs>' +
          '<rect x="0" y="0" width="1024" height="1024" rx="204.80" ry="204.80" fill="#5B6CFF"/>' +
          '<g clip-path="url(#v21-fan-clip)">' +
            '<g transform="translate(81.92 81.92) scale(860.16)">' +
              '<path fill="#FFFBF0" fill-rule="evenodd" d="' + FAN_PATH_D + '"/>' +
            '</g>' +
          '</g>' +
        '</svg>' +
        '<div class="vp-glint"></div>' +
      '</div>' +
      '<div class="vp-word">琉璃</div>' +
    '</div>';
  document.body.appendChild(proEl);

  var proAura1 = proEl.querySelector('.vp-aura1');
  var proAura2 = proEl.querySelector('.vp-aura2');
  var proHalo = proEl.querySelector('.vp-halo');
  var proWrap = proEl.querySelector('.vp-logo-wrap');
  var proIcon = proEl.querySelector('.vp-icon-box');
  var proPoly = proEl.querySelector('#v21-fan-poly');
  var proGlint = proEl.querySelector('.vp-glint');
  var proWord = proEl.querySelector('.vp-word');

  function updatePrologue(t) {
    if (t >= 1.86) {
      proEl.style.display = 'none';
      return false;
    }
    proEl.style.display = 'flex';
    proAura1.style.transform = 'translate3d(' + (Math.sin(t * 1.45) * 160).toFixed(1) + 'px,' + (Math.cos(t * 1.15) * 110).toFixed(1) + 'px,0) scale(' + (1 + 0.06 * Math.sin(t * 1.2)).toFixed(4) + ')';
    proAura2.style.transform = 'translate3d(' + (Math.cos(t * 1.25) * -170).toFixed(1) + 'px,' + (Math.sin(t * 1.05) * -120).toFixed(1) + 'px,0) scale(' + (1 + 0.05 * Math.cos(t * 1.3)).toFixed(4) + ')';

    var pBox = clamp01((t - 0.06) / 0.42);
    var boxScale = lerp(0.56, 1.0, easeOutBack(pBox));
    var boxRot = lerp(-14, 0, easeOutQuint(pBox));
    var boxAlpha = clamp01(pBox * 3.2);

    var pFan = clamp01((t - 0.16) / 0.38);
    var halfAngle = lerp(0.02, 1.25, easeOutBack(pFan));
    var R = 1100, px = 186, py = 512;
    var x1 = (px + Math.cos(-halfAngle) * R).toFixed(1), y1 = (py + Math.sin(-halfAngle) * R).toFixed(1);
    var x2 = (px + Math.cos(halfAngle) * R).toFixed(1), y2 = (py + Math.sin(halfAngle) * R).toFixed(1);
    proPoly.setAttribute('points', px + ',' + py + ' ' + x1 + ',' + y1 + ' ' + (px + R) + ',' + py + ' ' + x2 + ',' + y2);

    var pGlint = clamp01((t - 0.42) / 0.50);
    proGlint.style.left = lerp(-260, 420, easeInOutCubic(pGlint)).toFixed(1) + 'px';

    var pWord = easeOutQuint(clamp01((t - 0.28) / 0.36));
    proWord.style.opacity = pWord.toFixed(4);
    proWord.style.transform = 'translate3d(0,' + ((1 - pWord) * 32).toFixed(1) + 'px,0)';

    var holdBreath = Math.sin(Math.max(0, t - 0.48) * 3.0);
    var pOut = sstep((t - 1.55) / 0.30);
    var wrapScale = (1 + 0.018 * holdBreath) * lerp(1.0, 1.08, pOut);
    var wrapY = holdBreath * -6 - pOut * 16;

    proIcon.style.opacity = boxAlpha.toFixed(4);
    proIcon.style.transform = 'scale(' + boxScale.toFixed(4) + ') rotate(' + boxRot.toFixed(2) + 'deg)';
    proHalo.style.opacity = (boxAlpha * (0.75 + 0.25 * holdBreath)).toFixed(4);
    proHalo.style.transform = 'scale(' + (lerp(0.6, 1.05, easeOutExpo(pBox)) + 0.08 * holdBreath).toFixed(4) + ')';
    proWrap.style.transform = 'translate3d(0,' + wrapY.toFixed(1) + 'px,0) scale(' + wrapScale.toFixed(4) + ')';
    proEl.style.opacity = (1 - pOut).toFixed(4);
    return t < 1.55;
  }

  /* ---------- 4. Multi-Chapter Liquid Flowing Spectrum Backdrop (#v20-bg) ---------- */
  var PALETTES = [
    { start: 0.00,  base: '#FF375F', b1: '#FF7A00', b2: '#FFD000', b3: '#FF2D55', veil: 0.00 },
    { start: 8.50,  base: '#FF375F', b1: '#FF7A00', b2: '#FFD000', b3: '#FF2D55', veil: 0.14 },
    { start: 14.80, base: '#009E8E', b1: '#00C9A7', b2: '#42E2FF', b3: '#0072CE', veil: 0.00 },
    { start: 19.10, base: '#CC1B54', b1: '#FF4E4E', b2: '#FFB36B', b3: '#8F1142', veil: 0.00 },
    { start: 23.60, base: '#4325D4', b1: '#8E3BFF', b2: '#38BDF8', b3: '#251782', veil: 0.00 },
    { start: 29.30, base: '#093450', b1: '#0E7490', b2: '#2DD4BF', b3: '#091E3A', veil: 0.00 },
    { start: 30.30, base: '#093450', b1: '#0E7490', b2: '#2DD4BF', b3: '#091E3A', veil: 0.88 },
    { start: 38.50, base: '#B5176E', b1: '#FF477E', b2: '#FF9E2C', b3: '#6C0BA9', veil: 0.00 },
    { start: 49.90, base: '#07132A', b1: '#1E5BB8', b2: '#4A94E8', b3: '#0C275C', veil: 0.00 },
    { start: 51.95, base: '#060407', b1: '#1A0B12', b2: '#12080E', b3: '#060407', veil: 0.96 },
    { start: 64.50, base: '#000000', b1: '#000000', b2: '#000000', b3: '#000000', veil: 1.00 }
  ].map(function (p) {
    return {
      start: p.start,
      base: hexRgb(p.base),
      b1: hexRgb(p.b1),
      b2: hexRgb(p.b2),
      b3: hexRgb(p.b3),
      veil: p.veil
    };
  });

  var bgEl = document.createElement('div');
  bgEl.id = 'v20-bg';
  bgEl.innerHTML =
    '<div class="v20-blk v20-b1"></div>' +
    '<div class="v20-blk v20-b2"></div>' +
    '<div class="v20-blk v20-b3"></div>' +
    '<div class="v20-wash"></div>' +
    '<div class="v20-dark-veil"></div>';
  document.body.insertBefore(bgEl, document.body.firstChild);
  var bgB1 = bgEl.querySelector('.v20-b1');
  var bgB2 = bgEl.querySelector('.v20-b2');
  var bgB3 = bgEl.querySelector('.v20-b3');
  var bgVeil = bgEl.querySelector('.v20-dark-veil');

  var miniGlow = document.createElement('div');
  miniGlow.id = 'v20-mini-glow';
  document.body.insertBefore(miniGlow, bgEl.nextSibling);

  function samplePalette(t) {
    var idx = 0;
    for (var i = 0; i < PALETTES.length; i++) {
      if (t >= PALETTES[i].start) idx = i;
    }
    var cur = PALETTES[idx];
    var fadeDur = 0.38;
    if (idx > 0 && (t - cur.start) < fadeDur) {
      var prev = PALETTES[idx - 1];
      var k = easeInOutCubic((t - cur.start) / fadeDur);
      return {
        base: lerpRgbArr(prev.base, cur.base, k),
        b1: lerpRgbArr(prev.b1, cur.b1, k),
        b2: lerpRgbArr(prev.b2, cur.b2, k),
        b3: lerpRgbArr(prev.b3, cur.b3, k),
        veil: lerp(prev.veil, cur.veil, k)
      };
    }
    return cur;
  }

  function updateLiquidBG(t) {
    if (t >= 64.50) {
      bgEl.style.display = 'none';
      return;
    }
    bgEl.style.display = 'block';
    var p = samplePalette(t);
    bgEl.style.background = rgbCss(p.base);
    bgB1.style.background = 'radial-gradient(closest-side, ' + rgbCss(p.b1) + ' 0%, ' + rgbCss(p.b1) + ' 64%, ' + rgbaCss(p.b1, 0.46) + ' 82%, ' + rgbaCss(p.b1, 0) + ' 100%)';
    bgB2.style.background = 'radial-gradient(closest-side, ' + rgbCss(p.b2) + ' 0%, ' + rgbCss(p.b2) + ' 62%, ' + rgbaCss(p.b2, 0.48) + ' 80%, ' + rgbaCss(p.b2, 0) + ' 100%)';
    bgB3.style.background = 'radial-gradient(closest-side, ' + rgbCss(p.b3) + ' 0%, ' + rgbCss(p.b3) + ' 64%, ' + rgbaCss(p.b3, 0.46) + ' 82%, ' + rgbaCss(p.b3, 0) + ' 100%)';
    bgVeil.style.opacity = p.veil.toFixed(4);

    var s1 = Math.sin(t * 0.82);
    var c1 = Math.cos(t * 0.68);
    var s2 = Math.sin(t * 0.56 + 1.2);
    bgB1.style.transform = 'translate3d(' + (s1 * 155).toFixed(1) + 'px,' + (c1 * 110).toFixed(1) + 'px,0) scale(' + (1 + 0.045 * s2).toFixed(4) + ')';
    bgB2.style.transform = 'translate3d(' + (c1 * -145).toFixed(1) + 'px,' + (s1 * -115).toFixed(1) + 'px,0) scale(' + (1 + 0.05 * c1).toFixed(4) + ')';
    bgB3.style.transform = 'translate3d(' + (s2 * 135).toFixed(1) + 'px,' + (c1 * 95).toFixed(1) + 'px,0) scale(' + (1 + 0.04 * s1).toFixed(4) + ')';
  }

  /* ---------- 5. Re-Balanced Chapter Title Cards ---------- */
  var CHAPTER_WINDOWS = [
    { start: 7.50,  end: 8.50,  title: '沉浸欣赏', desc: '全屏柔光呼吸，把画面还给音乐', albumIdx: 0, hasCd: true },
    { start: 14.80, end: 15.80, title: '小窗播放', desc: '轻盈置顶，旋律随时相伴', albumIdx: 4, hasCd: false },
    { start: 19.10, end: 20.10, title: '精确选段', desc: '毫秒级循环最爱乐句', albumIdx: 2, hasCd: false },
    { start: 23.60, end: 24.70, title: '变速变调', desc: '速率与音高独立调节', albumIdx: 5, hasCd: false },
    { start: 29.30, end: 30.30, title: '精细调音', desc: '32 段专业参数均衡', albumIdx: 1, hasCd: false },
    { start: 38.50, end: 39.50, title: '画面与字幕', desc: '画幅与字幕随心切换', albumIdx: 3, hasCd: false }
  ];

  var chEl = document.createElement('section');
  chEl.id = 'v20-chapter';
  chEl.innerHTML =
    '<div class="ch-main">' +
      '<div class="ch-title-mask"><div class="ch-title"></div></div>' +
      '<div class="ch-desc-mask"><div class="ch-desc"></div></div>' +
    '</div>' +
    '<div class="ch-cd-wrap"><div class="ch-cd-disc"><img src="" /><div class="ch-cd-sheen"></div><div class="ch-cd-hub"></div><div class="ch-cd-hole"></div></div></div>';
  document.body.appendChild(chEl);

  var chTitle = chEl.querySelector('.ch-title');
  var chDesc = chEl.querySelector('.ch-desc');
  var chCdWrap = chEl.querySelector('.ch-cd-wrap');
  var chCdDisc = chEl.querySelector('.ch-cd-disc');
  var chCdImg = chEl.querySelector('.ch-cd-disc img');

  function findChapter(t) {
    for (var i = 0; i < CHAPTER_WINDOWS.length; i++) {
      if (t >= CHAPTER_WINDOWS[i].start && t < CHAPTER_WINDOWS[i].end) return CHAPTER_WINDOWS[i];
    }
    return null;
  }

  function renderChapter(t, ch) {
    var q = t - ch.start;
    var d = ch.end - ch.start;
    var alb = CLASSICAL[ch.albumIdx];

    chEl.style.display = 'block';
    chEl.classList.toggle('has-cd', !!ch.hasCd);
    chTitle.textContent = ch.title;
    chDesc.textContent = ch.desc;
    if (ch.hasCd && chCdImg.getAttribute('src') !== alb.cover) chCdImg.src = alb.cover;

    var pIn = easeOutQuint(clamp01(q / 0.34));
    var pSub = easeOutQuint(clamp01((q - 0.08) / 0.34));
    var pOut = 1 - sstep((q - (d - 0.18)) / 0.18);

    var exitGlide = (1 - pOut) * -42;
    chEl.style.opacity = pOut.toFixed(4);
    chTitle.style.transform = 'translate3d(0,' + (((1 - pIn) * 112) + exitGlide * 0.25).toFixed(2) + '%,0)';
    chDesc.style.transform = 'translate3d(0,' + ((1 - pSub) * 120).toFixed(2) + '%,0)';
    chDesc.style.opacity = pSub.toFixed(4);

    if (ch.hasCd) {
      var cdSlide = (1 - pIn) * 280 + (1 - pOut) * 180;
      chCdWrap.style.transform = 'translate3d(' + cdSlide.toFixed(1) + 'px,0,0)';
      chCdDisc.style.transform = 'rotate(' + ((t * 38) % 360).toFixed(2) + 'deg)';
    }
    return pOut;
  }

  /* ---------- 6. Control-Bar -> Optical Magnifying Loupe (A-B Loop 20.1–23.6s & Speed/Pitch 24.7–29.3s) ---------- */
  var loupeEl = document.createElement('section');
  loupeEl.id = 'v21-loupe-layer';
  loupeEl.innerHTML =
    '<div class="vl-dim"></div>' +
    '<div class="vl-beam"></div>' +
    '<div class="vl-anchor-ring"></div>' +
    '<div class="vl-card">' +
      '<div class="vl-accent-bar"></div>' +
      '<div class="vl-head">' +
        '<div class="vl-title"><span class="vl-dot"></span><span class="vl-title-txt"></span></div>' +
        '<div class="vl-status"></div>' +
      '</div>' +
      '<div class="vl-body-ab">' +
        '<div class="vl-ab-row">' +
          '<div class="vl-ab-box vl-ab-a"><div class="vl-ab-k">起点 A</div><div class="vl-ab-valrow"><span class="vl-btn vl-am">−</span><span class="vl-num vl-an">0:12.000</span><span class="vl-btn vl-ap">＋</span></div></div>' +
          '<div class="vl-ab-box vl-ab-b"><div class="vl-ab-k">终点 B</div><div class="vl-ab-valrow"><span class="vl-btn vl-bm">−</span><span class="vl-num vl-bn">0:18.000</span><span class="vl-btn vl-bp">＋</span></div></div>' +
        '</div>' +
        '<div class="vl-ab-track"><div class="vl-ab-span"></div><div class="vl-ab-handle vl-ha"></div><div class="vl-ab-handle vl-hb"></div><div class="vl-ab-head"></div></div>' +
      '</div>' +
      '<div class="vl-body-sp" style="display:none">' +
        '<div class="vl-sp-rows">' +
          '<div class="vl-sp-row vl-row-sp"><div class="vl-sp-lbl">速度</div><span class="vl-btn vl-spm">−</span><div class="vl-sp-val vl-spv">100%</div><span class="vl-btn vl-spp">＋</span><div class="vl-sp-slider"><div class="vl-sp-fill vl-spf"></div><div class="vl-sp-thumb vl-spt"></div></div></div>' +
          '<div class="vl-sp-row vl-row-pi"><div class="vl-sp-lbl">音调</div><span class="vl-btn vl-pim">−</span><div class="vl-sp-val vl-piv">+0 半音</div><span class="vl-btn vl-pip">＋</span><div class="vl-sp-slider"><div class="vl-sp-fill vl-pif"></div><div class="vl-sp-thumb vl-pit"></div></div></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(loupeEl);

  var vlDim = loupeEl.querySelector('.vl-dim');
  var vlBeam = loupeEl.querySelector('.vl-beam');
  var vlCard = loupeEl.querySelector('.vl-card');
  var vlAcc = loupeEl.querySelector('.vl-accent-bar');
  var vlDot = loupeEl.querySelector('.vl-dot');
  var vlTitleTxt = loupeEl.querySelector('.vl-title-txt');
  var vlStatus = loupeEl.querySelector('.vl-status');
  var vlBodyAb = loupeEl.querySelector('.vl-body-ab');
  var vlBodySp = loupeEl.querySelector('.vl-body-sp');

  var vlAbA = loupeEl.querySelector('.vl-ab-a'), vlAbB = loupeEl.querySelector('.vl-ab-b');
  var vlAn = loupeEl.querySelector('.vl-an'), vlBn = loupeEl.querySelector('.vl-bn');
  var vlAp = loupeEl.querySelector('.vl-ap'), vlBm = loupeEl.querySelector('.vl-bm');
  var vlSpan = loupeEl.querySelector('.vl-ab-span'), vlHa = loupeEl.querySelector('.vl-ha'), vlHb = loupeEl.querySelector('.vl-hb'), vlHead = loupeEl.querySelector('.vl-ab-head');

  var vlRowSp = loupeEl.querySelector('.vl-row-sp'), vlRowPi = loupeEl.querySelector('.vl-row-pi');
  var vlSpv = loupeEl.querySelector('.vl-spv'), vlSpf = loupeEl.querySelector('.vl-spf'), vlSpt = loupeEl.querySelector('.vl-spt'), vlSpp = loupeEl.querySelector('.vl-spp');
  var vlPiv = loupeEl.querySelector('.vl-piv'), vlPif = loupeEl.querySelector('.vl-pif'), vlPit = loupeEl.querySelector('.vl-pit'), vlPip = loupeEl.querySelector('.vl-pip');

  function updateControlBarLoupe(t) {
    var isLoop = (t >= 20.10 && t < 23.60);
    var isSpeed = (t >= 24.70 && t < 29.30);
    var loopPanel = document.getElementById('loop-panel');
    var speedPanel = document.getElementById('speed-panel');

    if (!isLoop && !isSpeed) {
      loupeEl.style.display = 'none';
      if (loopPanel) loopPanel.classList.remove('v21-hl');
      if (speedPanel) speedPanel.classList.remove('v21-hl');
      return;
    }

    var q = isLoop ? (t - 20.10) : (t - 24.70);
    var d = isLoop ? 3.50 : 4.60;

    // Staggered element-by-element entrance of the 21:9 player components during the first 0.42s (never a static screenshot drop!)
    var tabsEl = document.getElementById('tabs');
    var pbEl = document.getElementById('playbar');
    if (tabsEl) {
      var kTab = easeOutQuint(clamp01(q / 0.28));
      tabsEl.style.transform = 'translate(-50%, ' + ((1 - kTab) * -48).toFixed(1) + 'px)';
    }
    if (pbEl) {
      var kPb = easeOutQuint(clamp01((q - 0.05) / 0.30));
      pbEl.style.transform = 'translate(-50%, ' + ((1 - kPb) * -64).toFixed(1) + 'px)';
    }
    var cards = document.querySelectorAll('.cover-card');
    for (var ci = 0; ci < cards.length; ci++) {
      var kCard = easeOutBack(clamp01((q - 0.04 * ci) / 0.34));
      if (kCard < 0.999) {
        cards[ci].style.top = (parseFloat(cards[ci].style.top || '0') - (1 - kCard) * 140).toFixed(1) + 'px';
      }
    }

    var anchorGlow = easeOutQuint(clamp01((q - 0.16) / 0.36)) * (1 - sstep((q - (d - 0.26)) / 0.26));
    var pullIn = easeOutQuint(clamp01((q - 0.62) / 0.48));
    var pullOut = 1 - sstep((q - (d - 0.34)) / 0.34);
    var loupeK = pullIn * pullOut;

    if (loopPanel) {
      loopPanel.style.opacity = isLoop ? String(easeOutQuint(clamp01((q - 0.08) / 0.28))) : '0';
      loopPanel.classList.toggle('v21-hl', isLoop && anchorGlow > 0.2);
    }
    if (speedPanel) {
      speedPanel.style.opacity = isSpeed ? String(easeOutQuint(clamp01((q - 0.08) / 0.28))) : '0';
      speedPanel.classList.toggle('v21-hl', isSpeed && anchorGlow > 0.2);
    }

    if (main) main.style.transform = 'scale(2)';
    var carLoupe = document.getElementById('carousel');
    if (carLoupe) {
      carLoupe.style.opacity = lerp(0.92, 0.24, loupeK).toFixed(3);
      carLoupe.style.visibility = 'visible';
    }
    var trfLoupe = document.getElementById('traffic');
    if (trfLoupe) trfLoupe.style.opacity = '1';

    if (anchorGlow <= 0.002 && loupeK <= 0.002) {
      loupeEl.style.display = 'none';
      return;
    }

    loupeEl.style.display = 'block';
    vlDim.style.opacity = (loupeK * 0.88).toFixed(4);
    vlBeam.style.opacity = (loupeK * 0.95).toFixed(4);
    vlBeam.style.transform = 'scaleY(' + lerp(0.12, 1.0, loupeK).toFixed(4) + ')';

    var cardScale = lerp(0.36, 1.0, loupeK);
    var cardY = lerp(420, 0, loupeK) + Math.sin(q * 2.2) * 5 * loupeK;
    vlCard.style.opacity = clamp01(loupeK * 1.45).toFixed(4);
    vlCard.style.transform = 'translate3d(-50%, calc(-50% + ' + cardY.toFixed(1) + 'px), 0) scale(' + cardScale.toFixed(4) + ')';

    if (isLoop) {
      vlBodyAb.style.display = 'block';
      vlBodySp.style.display = 'none';
      vlTitleTxt.textContent = '控制条 · 精确选段';
      vlDot.style.background = '#FF5E4A';
      vlDot.style.color = '#FF5E4A';
      vlAcc.style.background = 'radial-gradient(ellipse at 20% 0%, rgba(255,78,78,0.55) 0%, transparent 65%)';

      var tuneB = q >= 2.00;
      var aSec = lerp(11.6, 12.0, easeInOutCubic(clamp01((q - 0.95) / 0.85)));
      var bSec = lerp(18.6, 18.0, easeInOutCubic(clamp01((q - 2.05) / 0.92)));
      var aStr = '0:' + aSec.toFixed(3).padStart(6, '0');
      var bStr = '0:' + bSec.toFixed(3).padStart(6, '0');
      vlAn.textContent = aStr;
      vlBn.textContent = bStr;
      vlAbA.classList.toggle('active', !tuneB);
      vlAbB.classList.toggle('active', tuneB);
      vlAp.classList.toggle('pulse', !tuneB && q > 1.10 && q < 1.75);
      vlBm.classList.toggle('pulse', tuneB && q > 2.15 && q < 2.85);
      vlStatus.textContent = tuneB ? '微调终点 · 无缝接缝已开启' : '微调起点 · ±0.01s 精度';

      var lsEl = document.getElementById('loop-start'); if (lsEl) lsEl.textContent = aStr;
      var leEl = document.getElementById('loop-end'); if (leEl) leEl.textContent = bStr;

      var pctA = (aSec / 30) * 100;
      var pctB = (bSec / 30) * 100;
      vlSpan.style.left = pctA.toFixed(2) + '%';
      vlSpan.style.width = (pctB - pctA).toFixed(2) + '%';
      vlHa.style.left = pctA.toFixed(2) + '%';
      vlHb.style.left = pctB.toFixed(2) + '%';
      var playPos = pctA + ((q * 1.45) % 1) * (pctB - pctA);
      vlHead.style.left = playPos.toFixed(2) + '%';

      var realRange = document.getElementById('ab-range');
      if (realRange) {
        realRange.style.opacity = '1';
        realRange.style.left = pctA.toFixed(2) + '%';
        realRange.style.width = (pctB - pctA).toFixed(2) + '%';
      }
    } else {
      vlBodyAb.style.display = 'none';
      vlBodySp.style.display = 'block';
      vlTitleTxt.textContent = '控制条 · 变速与变调';
      vlDot.style.background = '#7C5CFF';
      vlDot.style.color = '#7C5CFF';
      vlAcc.style.background = 'radial-gradient(ellipse at 20% 0%, rgba(124,92,255,0.58) 0%, transparent 65%)';

      var focusPitch = q >= 2.45;
      var spPct = 100;
      if (q < 1.55) {
        spPct = lerp(100, 135, easeInOutCubic(clamp01((q - 0.85) / 0.70)));
      } else if (q < 2.10) {
        spPct = lerp(135, 85, easeInOutCubic(clamp01((q - 1.55) / 0.55)));
      } else {
        spPct = lerp(85, 120, easeInOutCubic(clamp01((q - 2.10) / 0.35)));
      }
      var spRound = Math.round(spPct);
      var piStep = !focusPitch ? 0 : (q < 2.95 ? 1 : (q < 3.45 ? 2 : 3));

      vlRowSp.classList.toggle('active', !focusPitch);
      vlRowPi.classList.toggle('active', focusPitch);
      vlSpv.textContent = spRound + '%';
      vlPiv.textContent = (piStep >= 0 ? '+' : '') + piStep + ' 半音';
      vlSpp.classList.toggle('pulse', !focusPitch && q > 0.95 && q < 1.50);
      vlPip.classList.toggle('pulse', focusPitch && ((q > 2.55 && q < 2.85) || (q > 3.05 && q < 3.35) || (q > 3.55 && q < 3.90)));
      vlStatus.textContent = focusPitch ? '速率锁定 120% · 独立调节半音' : '音高锁定 · 速率自由调节';

      var spFrac = clamp01((spPct - 50) / 150) * 100;
      vlSpf.style.width = spFrac.toFixed(1) + '%';
      vlSpt.style.left = spFrac.toFixed(1) + '%';
      var piFrac = clamp01((piStep + 6) / 12) * 100;
      vlPif.style.width = piFrac.toFixed(1) + '%';
      vlPit.style.left = piFrac.toFixed(1) + '%';

      var snEl = document.getElementById('speed-number'); if (snEl) snEl.textContent = spRound + '%';
      var pnEl = document.getElementById('pitch-number'); if (pnEl) pnEl.textContent = '+' + piStep;
    }
  }

  /* ---------- 7. Alive 21:9 32-Band Studio EQ Choreography (30.30–38.50s) ---------- */
  var EQ_PRESETS = {
    bass: function (u) { return 10.5 * Math.exp(-Math.pow(u / 0.24, 2)) - 1.8 * Math.exp(-Math.pow((u - 0.52) / 0.18, 2)) + 2.4 * Math.exp(-Math.pow((u - 0.90) / 0.16, 2)); },
    vocal: function (u) { return -4.2 * Math.exp(-Math.pow(u / 0.22, 2)) + 8.6 * Math.exp(-Math.pow((u - 0.56) / 0.20, 2)) + 3.2 * Math.exp(-Math.pow((u - 0.84) / 0.16, 2)); },
    classical: function (u) { return 6.2 * Math.exp(-Math.pow((u - 0.10) / 0.18, 2)) - 3.2 * Math.exp(-Math.pow((u - 0.46) / 0.20, 2)) + 7.8 * Math.exp(-Math.pow((u - 0.86) / 0.20, 2)); }
  };

  function ensureEqEnhancements() {
    var fa = document.getElementById('fader-area');
    if (!fa) return null;
    var spec = document.getElementById('v21-eq-spec');
    if (!spec) {
      spec = document.createElement('div');
      spec.id = 'v21-eq-spec';
      var html = '';
      for (var i = 0; i < 32; i++) html += '<i></i>';
      spec.innerHTML = html;
      fa.insertBefore(spec, fa.firstChild);
    }
    var pill = document.getElementById('v21-eq-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'v21-eq-pill';
      fa.appendChild(pill);
    }
    return { spec: spec, pill: pill };
  }

  function updateAliveEQ(t) {
    var inEq = (t >= 30.30 && t < 38.50);
    if (app) app.classList.toggle('v20-eq-mode', inEq);
    var enh = ensureEqEnhancements();
    if (!inEq) {
      if (enh) {
        enh.spec.style.display = 'none';
        enh.pill.style.display = 'none';
      }
      return;
    }

    if (typeof makeBands === 'function') makeBands(32);
    var bcSpans = document.querySelectorAll('#band-count span');
    if (bcSpans.length >= 2) {
      bcSpans[0].classList.remove('active');
      bcSpans[1].classList.add('active');
    }

    var q = t - 30.30; // 0 -> 8.20s
    var presetActiveIdx = q < 2.0 ? 4 : (q < 4.1 ? 3 : 6);
    var presetSpans = document.querySelectorAll('#presets span');
    for (var pi = 0; pi < presetSpans.length; pi++) {
      presetSpans[pi].classList.toggle('v21-eq-active', pi === presetActiveIdx);
    }

    var wBass = easeInOutCubic(clamp01(q / 0.72)) * (1 - easeInOutCubic(clamp01((q - 1.85) / 0.65)));
    var wVocal = easeInOutCubic(clamp01((q - 1.85) / 0.65)) * (1 - easeInOutCubic(clamp01((q - 3.95) / 0.65)));
    var wClass = easeInOutCubic(clamp01((q - 3.95) / 0.65));
    var sweepOn = clamp01((q - 5.55) / 0.45);
    var sweepCenter = lerp(0.28, 0.88, easeInOutCubic(clamp01((q - 5.65) / 2.20)));

    var gains = [];
    var faders = document.querySelectorAll('#bands .fader');
    var n = faders.length || 32;
    var energy = audioEnergy(t);

    for (var i = 0; i < n; i++) {
      var u = i / Math.max(1, n - 1);
      var gVal = wBass * EQ_PRESETS.bass(u)
               + wVocal * EQ_PRESETS.vocal(u)
               + wClass * EQ_PRESETS.classical(u)
               + sweepOn * 4.8 * Math.exp(-Math.pow((u - sweepCenter) / 0.085, 2))
               + Math.sin(t * 2.6 + i * 0.42) * (0.45 + 0.55 * energy);
      gVal = Math.max(-14, Math.min(14, gVal));
      gains.push(gVal);

      var bandColor = u < 0.52 ? lerpHex('#0EA5E9', '#2DD4BF', u / 0.52) : lerpHex('#2DD4BF', '#FFD166', (u - 0.52) / 0.48);
      var y = 136 - (gVal / 24) * 224;
      var handle = faders[i].querySelector('.handle');
      if (handle) {
        handle.style.top = y.toFixed(1) + 'px';
        handle.style.background = bandColor;
        handle.style.boxShadow = '0 0 12px ' + bandColor;
      }
      var fill = faders[i].querySelector('.gain-fill');
      if (!fill) {
        fill = document.createElement('i');
        fill.className = 'gain-fill';
        faders[i].insertBefore(fill, handle);
      }
      fill.style.top = Math.min(y, 136).toFixed(1) + 'px';
      fill.style.height = Math.max(2, Math.abs(y - 136)).toFixed(1) + 'px';
      fill.style.background = 'linear-gradient(to top, rgba(14,165,233,0.45), ' + bandColor + ')';

      var bub = faders[i].querySelector('.value-bubble');
      if (bub) bub.style.opacity = '0';
    }

    if (typeof setCurve === 'function') setCurve(gains);

    if (enh) {
      enh.spec.style.display = 'flex';
      var bars = enh.spec.children;
      var fr = audioFrameAt(t);
      for (var bi = 0; bi < bars.length; bi++) {
        var bu = bi / 31;
        var wSample = (fr && fr.wave && fr.wave.length) ? Math.abs(fr.wave[Math.floor(bu * (fr.wave.length - 1))] || 0) : 0.25;
        var hPct = 14 + 62 * clamp01(wSample * 1.9 + 0.25 * Math.abs(Math.sin(t * 5.2 + bi * 0.55)) * (0.5 + energy));
        var bCol = bu < 0.5 ? lerpHex('#0284C7', '#2DD4BF', bu * 2) : lerpHex('#2DD4BF', '#F59E0B', (bu - 0.5) * 2);
        bars[bi].style.height = hPct.toFixed(1) + '%';
        bars[bi].style.background = 'linear-gradient(to top, transparent, ' + bCol + ')';
      }

      var focusBand = q < 2.0 ? 3 : (q < 4.1 ? 18 : (q < 5.6 ? 27 : Math.round(sweepCenter * 31)));
      focusBand = Math.max(0, Math.min(31, focusBand));
      var fu = focusBand / 31;
      var freqHz = 20 * Math.pow(1000, fu);
      var freqTxt = freqHz >= 1000 ? (freqHz / 1000).toFixed(1).replace('.0', '') + ' kHz' : Math.round(freqHz) + ' Hz';
      var fg = gains[focusBand] || 0;
      enh.pill.style.display = 'block';
      enh.pill.textContent = (fg >= 0 ? '+' : '') + fg.toFixed(1) + ' dB · ' + freqTxt;
      enh.pill.style.left = (92 + fu * 1160).toFixed(1) + 'px';
      enh.pill.style.top = (136 - (fg / 24) * 224).toFixed(1) + 'px';
      enh.pill.style.opacity = clamp01(q / 0.45).toFixed(3);
    }

    var eqPanel = document.getElementById('eq-panel');
    if (eqPanel) {
      var eqIn = easeOutQuint(clamp01(q / 0.42));
      var eqScale = lerp(0.96, 1.0, eqIn) + 0.015 * Math.sin(q * 0.9);
      eqPanel.style.opacity = eqIn.toFixed(4);
      eqPanel.style.transform = 'translate(-50%,-50%) scale(' + eqScale.toFixed(5) + ')';
    }
  }

  /* ---------- 8. Dark-Cinema Promo Reel Inside Real 21:9 Video Stage (39.50–49.90s, 10.40s) ---------- */
  var promoEl = document.createElement('div');
  promoEl.id = 'v20-promo';
  promoEl.innerHTML =
    '<div class="vp-scene vp-s1">' +
      '<div class="vp-fan">' +
        '<img src="assets/classical-02.jpg" />' +
        '<img src="assets/classical-01.jpg" />' +
        '<img src="assets/classical-04.jpg" />' +
      '</div>' +
      '<div class="vp-cap">琉璃 · 纯粹的本地音乐体验</div>' +
    '</div>' +
    '<div class="vp-scene vp-s2">' +
      '<svg id="v20-vp-wave" viewBox="0 0 920 300" style="width:740px;height:230px;overflow:visible">' +
        '<defs>' +
          '<linearGradient id="vpWG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#E11D74"/><stop offset="50%" stop-color="#FF7A00"/><stop offset="100%" stop-color="#FFD000"/></linearGradient>' +
          '<linearGradient id="vpWF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF7A00" stop-opacity="0.34"/><stop offset="100%" stop-color="#FF7A00" stop-opacity="0"/></linearGradient>' +
        '</defs>' +
        '<path id="vp-fill" fill="url(#vpWF)" d=""/>' +
        '<path id="vp-line1" fill="none" stroke="url(#vpWG)" stroke-width="5.5" stroke-linecap="round" d=""/>' +
        '<path id="vp-line2" fill="none" stroke="url(#vpWG)" stroke-width="2.5" opacity="0.52" stroke-linecap="round" d=""/>' +
      '</svg>' +
      '<div class="vp-cap">32 段专业均衡 · 精雕每一帧声场</div>' +
    '</div>' +
    '<div class="vp-scene vp-s3">' +
      '<div class="vp-mini-demo">' +
        '<img src="assets/classical-05.jpg" />' +
        '<div><div class="vp-mini-t">G 弦上的咏叹调</div><div class="vp-mini-s">J. S. Bach · Yo-Yo Ma</div></div>' +
      '</div>' +
      '<div class="vp-cap">轻盈置顶小窗 · 随时陪伴左右</div>' +
    '</div>' +
    '<div class="vp-scene vp-s4">' +
      '<div class="vp-brand-lock">' +
        '<img src="assets/fan-normal.svg" />' +
        '<b>琉 璃</b>' +
        '<span>纯净本地音视频播放器</span>' +
      '</div>' +
    '</div>';
  if (videoStage) videoStage.appendChild(promoEl);

  var vpScenes = Array.prototype.slice.call(promoEl.querySelectorAll('.vp-scene'));
  var vpFanImgs = Array.prototype.slice.call(promoEl.querySelectorAll('.vp-fan img'));
  var vpLine1 = promoEl.querySelector('#vp-line1');
  var vpLine2 = promoEl.querySelector('#vp-line2');
  var vpFill = promoEl.querySelector('#vp-fill');

  var ratioBadge = document.createElement('div');
  ratioBadge.id = 'v20-ratio-badge';
  document.body.appendChild(ratioBadge);

  var RATIO_SWITCH = [39.55, 40.66, 41.44, 42.14, 46.53, 47.30];
  function updateVideoPromo(t) {
    var inVid = (t >= 39.50 && t < 49.90);
    if (videoStage) videoStage.classList.toggle('v20-vid-on', inVid);
    promoEl.style.display = inVid ? 'block' : 'none';
    if (gv) gv.style.opacity = inVid ? '0' : '';
    if (!inVid) {
      ratioBadge.style.display = 'none';
      return;
    }

    // Set bottom playbar filename to "琉璃播放器广告片" + official orange folding-fan thumbnail + moving progress bar!
    var vq = t - 39.50;
    var nt = document.getElementById('now-title');
    var na = document.querySelector('#now-pill .now-meta small');
    var nc = document.getElementById('now-cover');
    var pt = document.querySelector('#progress-track > i');
    var el = document.getElementById('elapsed');
    if (nt) nt.textContent = '琉璃播放器广告片';
    if (na) na.textContent = '4K HDR · 原生视听舞台';
    if (nc && nc.getAttribute('src') !== 'assets/fan-normal.png') nc.src = 'assets/fan-normal.png';
    if (pt) pt.style.width = (18 + (vq / 10.40) * 58).toFixed(2) + '%';
    if (el) {
      var sec = Math.min(69, Math.floor(12 + vq * 3.8));
      el.textContent = '0:' + String(sec).padStart(2, '0') + ' / 1:09';
    }

    if (gv && gv.style.width && gv.style.height) {
      promoEl.style.left = gv.style.left || '0px';
      promoEl.style.top = gv.style.top || '0px';
      promoEl.style.width = gv.style.width;
      promoEl.style.height = gv.style.height;
      promoEl.style.transform = gv.style.transform || 'none';
    } else {
      promoEl.style.left = '0px';
      promoEl.style.top = '0px';
      promoEl.style.width = '100%';
      promoEl.style.height = '100%';
      promoEl.style.transform = 'none';
    }

    var q = clamp01(vq / 10.40);
    var idx = Math.min(3, Math.floor(q * 4));
    var local = q * 4 - idx;
    for (var i = 0; i < vpScenes.length; i++) {
      var on = (i === idx);
      vpScenes[i].style.display = on ? 'flex' : 'none';
      if (on) {
        var fin = sstep(clamp01(local / 0.16));
        var fout = 1 - sstep(clamp01((local - 0.84) / 0.16));
        vpScenes[i].style.opacity = Math.min(fin, fout).toFixed(4);
        vpScenes[i].style.transform = 'scale(' + (1.0 + 0.045 * local).toFixed(4) + ') translate3d(0,' + (-8 * local).toFixed(1) + 'px,0)';
      }
    }
    for (var fi = 0; fi < vpFanImgs.length; fi++) {
      var bx = fi === 0 ? -165 : (fi === 1 ? 0 : 165);
      var br = fi === 0 ? -12 : (fi === 1 ? 0 : 12);
      var bs = fi === 1 ? 1.06 : 0.94;
      vpFanImgs[fi].style.transform = 'translate3d(' + (bx + 12 * Math.sin(t * 0.9 + fi)).toFixed(1) + 'px,' + (12 + 7 * Math.cos(t * 0.7 + fi)).toFixed(1) + 'px,0) rotate(' + (br + 2 * Math.sin(t * 0.8 + fi)).toFixed(2) + 'deg) scale(' + bs + ')';
    }
    if (idx === 1 && vpLine1 && vpLine2 && vpFill) {
      var d1 = '', d2 = '';
      for (var x = 0; x <= 920; x += 20) {
        var u = x / 920;
        var env = Math.sin(u * Math.PI);
        var y1 = 155 - env * (72 * Math.sin(u * 9.5 - t * 3.6) + 34 * Math.cos(u * 17 + t * 2.4));
        var y2 = 155 - env * (54 * Math.cos(u * 8.2 - t * 2.9 + 1.1) + 26 * Math.sin(u * 14 - t * 3.1));
        d1 += (x === 0 ? 'M' : 'L') + x + ',' + y1.toFixed(1) + ' ';
        d2 += (x === 0 ? 'M' : 'L') + x + ',' + y2.toFixed(1) + ' ';
      }
      vpLine1.setAttribute('d', d1);
      vpLine2.setAttribute('d', d2);
      vpFill.setAttribute('d', d1 + ' L920,300 L0,300 Z');
    }

    var badgeOn = false, badgeP = 0;
    if (t < 47.70) {
      for (var ri = 0; ri < RATIO_SWITCH.length; ri++) {
        if (t >= RATIO_SWITCH[ri] && t < RATIO_SWITCH[ri] + 0.54) {
          badgeOn = true;
          badgeP = (t - RATIO_SWITCH[ri]) / 0.54;
          break;
        }
      }
    }
    if (badgeOn) {
      var asp = (window.__filmState && window.__filmState.videoAspect) || (16 / 9);
      var lbl = Math.abs(asp - 16 / 9) < 0.03 ? '16 : 9'
              : Math.abs(asp - 21 / 9) < 0.05 ? '21 : 9'
              : Math.abs(asp - 4 / 3) < 0.03 ? '4 : 3'
              : Math.abs(asp - 2.35) < 0.05 ? '2.35 : 1' : '16 : 9';
      ratioBadge.textContent = lbl;
      ratioBadge.style.display = 'block';
      var popIn = easeOutExpo(clamp01(badgeP / 0.24));
      var popOut = 1 - sstep(clamp01((badgeP - 0.72) / 0.28));
      ratioBadge.style.opacity = Math.min(popIn, popOut).toFixed(4);
      ratioBadge.style.transform = 'translate(-50%,-50%) scale(' + lerp(0.90, 1.0, popIn).toFixed(4) + ')';
    } else {
      ratioBadge.style.display = 'none';
    }
  }

  /* ---------- 9. Pure Typography Manifesto (49.90–51.95s, 2.05s) — Over Quiet Nocturnal Blue #v20-bg ---------- */
  var manEl = document.createElement('section');
  manEl.id = 'v20-manifesto';
  manEl.innerHTML =
    '<div class="vm-main">' +
      '<div class="vm-line-mask"><div class="vm-line" data-li="0">享受的时刻</div></div>' +
      '<div class="vm-line-mask"><div class="vm-line" data-li="1">不该被打扰</div></div>' +
    '</div>';
  document.body.appendChild(manEl);

  var manLines = Array.prototype.slice.call(manEl.querySelectorAll('.vm-line'));

  function updateManifesto(t) {
    if (t < 49.90 || t >= 51.95) {
      manEl.style.display = 'none';
      return false;
    }
    manEl.style.display = 'flex';
    var q = t - 49.90;
    var d = 2.05;
    var outK = 1 - sstep((q - (d - 0.24)) / 0.24);
    manEl.style.opacity = outK.toFixed(4);

    for (var i = 0; i < manLines.length; i++) {
      var pw = easeOutQuint(clamp01((q - i * 0.14) / 0.44));
      manLines[i].style.transform = 'translate3d(0,' + ((1 - pw) * 116).toFixed(2) + '%,0)';
    }
    return true;
  }

  /* ---------- 10. 9 Borderless Ad Cards + 4K Baseball Bat Flourish & Trash Can Slam (51.95–57.60s) ---------- */
  var ADS = [
    {
      x: 340, y: 250, gx: 1220, gy: 710, rot: -5.8, appear: 0.04,
      html: '<div style="width:820px;border-radius:60px;background:linear-gradient(145deg,#FFE600,#FFB800);color:#111;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.52);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:32px;font-weight:900;padding:10px 28px;border-radius:99px;background:#111;color:#FFE600;">开屏广告</span><span class="ad-skip" style="font-family:SF Mono,Menlo,monospace;font-size:32px;font-weight:800;padding:10px 26px;border-radius:99px;background:rgba(0,0,0,0.14);">跳过 5s</span></div>' +
        '<div style="display:flex;align-items:center;gap:38px;margin-top:40px;"><div class="ad-shake-ico" style="width:136px;height:136px;border-radius:40px;background:#111;color:#FFE600;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:900;flex-shrink:0;">⇄</div><div><div style="font-size:54px;font-weight:900;">摇一摇跳转商城</div><div style="font-size:32px;opacity:0.74;margin-top:8px;">稍微晃一下立刻跳走</div></div></div></div>'
    },
    {
      x: 1470, y: 200, gx: 1460, gy: 640, rot: 4.2, appear: 0.20,
      html: '<div style="width:850px;border-radius:60px;background:linear-gradient(135deg,#FF2E54,#C8002E);color:#FFF;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.55);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:32px;font-weight:800;opacity:0.9;">限时专享弹窗</span><span style="font-size:38px;opacity:0.45;">✕</span></div>' +
        '<div style="font-size:66px;font-weight:900;margin-top:22px;">首月 ¥1 尊享 VIP</div>' +
        '<div style="margin-top:24px;padding:22px 34px;border-radius:34px;background:#FFE8A3;color:#8A1C00;font-weight:900;font-size:36px;text-align:center;">立即开通 · 解锁本地播放</div></div>'
    },
    {
      x: 2560, y: 240, gx: 1680, gy: 700, rot: -4.4, appear: 0.36,
      html: '<div style="width:820px;border-radius:60px;background:#FFFFFF;color:#111;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.48);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:22px;"><span class="ad-live" style="width:24px;height:24px;border-radius:50%;background:#FF2442;"></span><span style="font-size:34px;font-weight:900;color:#FF2442;">正在直播 PK</span></div><span style="padding:8px 26px;border-radius:99px;background:#FF2442;color:#FFF;font-size:32px;font-weight:900;">99+</span></div>' +
        '<div style="font-size:50px;font-weight:900;margin-top:30px;">附近 1.2km 主播连麦中</div>' +
        '<div style="font-size:32px;color:#666;margin-top:12px;">强行塞进你的播放页底部</div></div>'
    },
    {
      x: 240, y: 820, gx: 1180, gy: 860, rot: 4.8, appear: 0.52,
      html: '<div style="width:800px;border-radius:60px;background:#1A1C24;color:#FFF;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.58);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:34px;font-weight:700;color:#9BA3B4;">社交通知红点</span><span style="width:66px;height:66px;border-radius:50%;background:#FF3B30;color:#FFF;font-size:32px;font-weight:900;display:flex;align-items:center;justify-content:center;">18</span></div>' +
        '<div style="font-size:50px;font-weight:900;margin-top:26px;">你的 4 位好友正在听</div>' +
        '<div style="font-size:32px;color:#8E96A8;margin-top:14px;">公开你的歌单与深夜在线状态</div></div>'
    },
    {
      x: 2620, y: 780, gx: 1640, gy: 840, rot: -5.0, appear: 0.68,
      html: '<div style="width:820px;border-radius:60px;background:linear-gradient(135deg,#102347,#091224);color:#FFF;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.58);">' +
        '<div style="font-size:32px;font-weight:700;color:#8BA7D6;">最高可借额度</div>' +
        '<div style="font-family:SF Mono,Menlo,monospace;font-size:84px;font-weight:900;margin-top:12px;color:#FFD666;">¥200,000</div>' +
        '<div style="margin-top:24px;padding:18px 30px;border-radius:30px;background:#FFB800;color:#111;font-weight:900;font-size:34px;text-align:center;">日息 0.02% 起 · 立即借款</div></div>'
    },
    {
      x: 380, y: 1380, gx: 1260, gy: 1010, rot: -3.8, appear: 0.84,
      html: '<div style="width:830px;border-radius:60px;background:linear-gradient(135deg,#FFF4E0,#FFD699);color:#2B1600;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.48);">' +
        '<div style="font-size:32px;font-weight:900;color:#B85400;">每日听歌领金币</div>' +
        '<div style="font-size:54px;font-weight:900;margin-top:20px;">再听 15 分钟领 ¥0.03</div>' +
        '<div style="margin-top:30px;height:18px;border-radius:99px;background:rgba(184,84,0,0.18);overflow:hidden;"><div class="ad-coin-bar" style="width:76%;height:100%;background:#FF7A00;"></div></div></div>'
    },
    {
      x: 1380, y: 1410, gx: 1440, gy: 1030, rot: 3.2, appear: 1.00,
      html: '<div style="width:830px;border-radius:60px;background:#FFFFFF;color:#111;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.52);">' +
        '<div style="font-size:32px;font-weight:800;color:#FF3B30;">自动扣费提醒</div>' +
        '<div class="ad-charge" style="font-family:SF Mono,Menlo,monospace;font-size:80px;font-weight:900;color:#E11D48;margin-top:14px;">−¥98.00 ×2</div>' +
        '<div style="font-size:30px;color:#777;margin-top:12px;">会员自动续费 · 今早 08:20</div></div>'
    },
    {
      x: 2140, y: 1360, gx: 1580, gy: 960, rot: -4.6, appear: 1.16,
      html: '<div style="width:820px;border-radius:60px;background:#FFF0F3;color:#1F1215;padding:50px;box-shadow:0 72px 160px rgba(0,0,0,0.48);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:30px;font-weight:900;padding:8px 24px;border-radius:99px;background:#FF2D55;color:#FFF;">发现新版本</span><span class="ad-upd" style="font-family:SF Mono,Menlo,monospace;font-size:32px;font-weight:800;color:#FF2D55;">7s 后强制更新</span></div>' +
        '<div style="font-size:52px;font-weight:900;margin-top:26px;">不更新无法听本地歌</div></div>'
    },
    {
      x: 1340, y: 740, gx: 1360, gy: 810, rot: -1.8, appear: 1.32,
      html: '<div style="width:960px;border-radius:68px;background:rgba(255,255,255,0.98);color:#0D1017;padding:58px;box-shadow:0 96px 240px rgba(0,0,0,0.68);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:34px;font-weight:900;color:#FF2D55;letter-spacing:0.06em;">算法推送弹窗</span><span style="font-size:30px;color:#999;">刚刚</span></div>' +
        '<div style="font-size:64px;font-weight:900;margin-top:24px;letter-spacing:-0.02em;">开启通知 · 接收热歌榜单</div>' +
        '<div style="display:flex;gap:28px;margin-top:38px;"><div style="flex:1;padding:26px;border-radius:34px;background:linear-gradient(90deg,#FF2D55,#FF7A00);color:#FFF;font-weight:900;font-size:36px;text-align:center;">允许打扰我</div><div style="padding:26px 40px;border-radius:34px;background:#F0F1F5;color:#999;font-size:32px;">明天再弹</div></div></div>'
    }
  ];

  var BAT_SVG =
    '<svg viewBox="0 0 1580 280" style="width:100%;height:100%;overflow:visible">' +
      '<defs>' +
        '<linearGradient id="v22BatWood" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#E6B274"/>' +
          '<stop offset="26%" stop-color="#FFF2CE"/>' +
          '<stop offset="58%" stop-color="#C98844"/>' +
          '<stop offset="86%" stop-color="#7A481E"/>' +
          '<stop offset="100%" stop-color="#4B2A0F"/>' +
        '</linearGradient>' +
        '<linearGradient id="v22BatGrip" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#353D4B"/>' +
          '<stop offset="45%" stop-color="#181D26"/>' +
          '<stop offset="100%" stop-color="#090B0E"/>' +
        '</linearGradient>' +
        '<linearGradient id="v22BatGold" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#FFEC99"/>' +
          '<stop offset="50%" stop-color="#FFA31A"/>' +
          '<stop offset="100%" stop-color="#9A4B00"/>' +
        '</linearGradient>' +
      '</defs>' +
      /* Pure Borderless 3D Sculpted Hardwood Barrel + Tapered Handle + Pommel Knob (ZERO stroke!) */
      '<path d="M46 92 Q14 140 46 188 L142 184 L154 170 L510 170 C710 172 885 256 1310 254 Q1558 258 1558 140 Q1558 22 1310 26 C885 24 710 108 510 110 L154 110 L142 96 Z" fill="url(#v22BatWood)"/>' +
      /* Specular Cylindrical Highlight along Upper Barrel */
      '<path d="M530 118 C730 116 900 50 1300 50 Q1490 50 1522 112 Q1470 76 1295 76 C900 76 730 130 530 130 Z" fill="rgba(255,255,255,0.48)"/>' +
      /* Soft Lower Core Shadow for 3D Cylindrical Depth without any outline */
      '<path d="M530 162 C730 164 900 236 1305 236 Q1485 236 1528 176 Q1475 214 1300 214 C900 214 730 154 530 154 Z" fill="rgba(32,14,4,0.34)"/>' +
      /* Pro Cross-Wrapped Grip Tape (Borderless) */
      '<path d="M156 110 L512 110 L512 170 L156 170 Z" fill="url(#v22BatGrip)"/>' +
      '<path d="M178 110 L186 110 L206 170 L198 170 Z M220 110 L228 110 L248 170 L240 170 Z M262 110 L270 110 L290 170 L282 170 Z M304 110 L312 110 L332 170 L324 170 Z M346 110 L354 110 L374 170 L366 170 Z M388 110 L396 110 L416 170 L408 170 Z M430 110 L438 110 L458 170 L450 170 Z M472 110 L480 110 L500 170 L492 170 Z" fill="rgba(255,255,255,0.16)"/>' +
      /* Gold Power Ring & Barrel Brand Stripe */
      '<rect x="506" y="109" width="22" height="62" rx="4" fill="url(#v22BatGold)"/>' +
      '<rect x="1120" y="27" width="34" height="226" rx="6" fill="url(#v22BatGold)" opacity="0.88"/>' +
    '</svg>';

  var BIN_SVG =
    '<svg class="va-bin-body" viewBox="0 0 620 760">' +
      '<defs>' +
        '<linearGradient id="v22BinMetal" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#1A2430"/>' +
          '<stop offset="24%" stop-color="#4E6378"/>' +
          '<stop offset="48%" stop-color="#8FA8BE"/>' +
          '<stop offset="74%" stop-color="#2B3948"/>' +
          '<stop offset="100%" stop-color="#101720"/>' +
        '</linearGradient>' +
        '<linearGradient id="v22BinRim" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#2D3C4B"/>' +
          '<stop offset="46%" stop-color="#B4CBE0"/>' +
          '<stop offset="100%" stop-color="#1B2530"/>' +
        '</linearGradient>' +
        '<linearGradient id="v22BinMouth" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#05070A"/>' +
          '<stop offset="100%" stop-color="#17212C"/>' +
        '</linearGradient>' +
        '<linearGradient id="v22RibLight" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.34"/>' +
          '<stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.06"/>' +
          '<stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>' +
        '</linearGradient>' +
      '</defs>' +
      /* Main Tapered Brushed-Steel Cylinder — 100% Borderless (ZERO stroke!) */
      '<path d="M84 168 L138 672 Q310 748 482 672 L536 168 Z" fill="url(#v22BinMetal)"/>' +
      /* Borderless 3D Molded Vertical Flutes */
      '<rect x="184" y="256" width="22" height="390" rx="11" transform="rotate(-4 195 450)" fill="url(#v22RibLight)"/>' +
      '<rect x="299" y="272" width="22" height="398" rx="11" fill="url(#v22RibLight)"/>' +
      '<rect x="414" y="256" width="22" height="390" rx="11" transform="rotate(4 425 450)" fill="url(#v22RibLight)"/>' +
      /* Borderless Beveled Rim & Deep Dark Cavity Mouth */
      '<ellipse cx="310" cy="166" rx="240" ry="74" fill="url(#v22BinRim)"/>' +
      '<ellipse cx="310" cy="168" rx="216" ry="56" fill="url(#v22BinMouth)"/>' +
    '</svg>';

  var LID_SVG =
    '<svg viewBox="0 0 532 160" style="width:100%;height:100%;overflow:visible">' +
      '<defs>' +
        '<linearGradient id="v22LidBase" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#1E2A36"/>' +
          '<stop offset="48%" stop-color="#A8C0D6"/>' +
          '<stop offset="100%" stop-color="#141C24"/>' +
        '</linearGradient>' +
        '<linearGradient id="v22LidDome" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#293847"/>' +
          '<stop offset="45%" stop-color="#88A1B8"/>' +
          '<stop offset="100%" stop-color="#1A242F"/>' +
        '</linearGradient>' +
      '</defs>' +
      /* Borderless Sculpted Top Handle (Filled shape, ZERO stroke!) */
      '<path d="M188 56 L208 10 Q212 2 222 2 L310 2 Q320 2 324 10 L344 56 L324 56 L308 22 L224 22 L208 56 Z" fill="url(#v22LidBase)"/>' +
      /* Borderless 3D Domed Metallic Lid (Layered gradient ellipses, ZERO stroke!) */
      '<ellipse cx="266" cy="100" rx="254" ry="56" fill="url(#v22LidBase)"/>' +
      '<ellipse cx="266" cy="92" rx="242" ry="48" fill="url(#v22LidDome)"/>' +
      '<ellipse cx="266" cy="82" rx="204" ry="32" fill="rgba(255,255,255,0.18)"/>' +
    '</svg>';

  var adsStage = document.createElement('section');
  adsStage.id = 'v20-ads-stage';
  adsStage.innerHTML =
    '<div class="va-glow"></div>' +
    '<div class="va-camera">' +
      ADS.map(function (a, i) {
        return '<div class="va-card" data-ai="' + i + '" style="left:' + a.x + 'px;top:' + a.y + 'px;">' + a.html + '</div>';
      }).join('') +
      '<div class="va-bin">' +
        '<div class="va-bin-lid">' + LID_SVG + '</div>' +
        '<div class="va-bin-junk">' +
          '<i style="background:#FFE600;transform:rotate(-18deg)"></i>' +
          '<i style="background:#FF2E54;height:74px;transform:rotate(12deg)"></i>' +
          '<i style="background:#FFFFFF;transform:rotate(-9deg)"></i>' +
          '<i style="background:#38BDF8;height:68px;transform:rotate(20deg)"></i>' +
          '<i style="background:#FF7A00;transform:rotate(-14deg)"></i>' +
        '</div>' +
        BIN_SVG +
      '</div>' +
      '<svg class="va-swing-fx" viewBox="0 0 3840 2160">' +
        '<defs>' +
          '<linearGradient id="v22TwirlGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#FFF3B0" stop-opacity="0"/>' +
            '<stop offset="55%" stop-color="#FFB800" stop-opacity="0.78"/>' +
            '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.96"/>' +
          '</linearGradient>' +
          '<linearGradient id="v22SwingGrad" x1="0" y1="1" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="#FF2D55" stop-opacity="0"/>' +
            '<stop offset="45%" stop-color="#FF7A00" stop-opacity="0.82"/>' +
            '<stop offset="85%" stop-color="#FFE66D" stop-opacity="0.96"/>' +
            '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="1"/>' +
          '</linearGradient>' +
        '</defs>' +
        /* Mid-Air Flourish Figure-8 Ribbon */
        '<path id="va-twirl-ribbon" d="M 880 1240 C 640 720, 1540 520, 1740 1040 C 1880 1420, 1080 1540, 740 1120" fill="none" stroke="url(#v22TwirlGrad)" stroke-width="34" stroke-linecap="round" stroke-dasharray="2800" stroke-dashoffset="2800" opacity="0"/>' +
        /* Ferocious Swing Crescent Smear */
        '<path id="va-swing-crescent" d="M 520 1580 Q 1180 280 2460 880 Q 1340 620 520 1580 Z" fill="url(#v22SwingGrad)" opacity="0"/>' +
      '</svg>' +
      '<div class="va-bat-wrap">' +
        '<div class="va-bat-ghost" id="va-bat-g1">' + BAT_SVG + '</div>' +
        '<div class="va-bat-ghost" id="va-bat-g2">' + BAT_SVG + '</div>' +
        '<div class="va-bat" id="va-bat-main">' + BAT_SVG + '</div>' +
      '</div>' +
      '<div class="va-hit-flare"></div>' +
      '<div class="va-hit-ring" id="va-ring-1"></div>' +
      '<div class="va-hit-ring" id="va-ring-2"></div>' +
      '<div class="va-clean-toast">已清空</div>' +
    '</div>';
  document.body.appendChild(adsStage);

  var vaCamera = adsStage.querySelector('.va-camera');
  var vaCards = Array.prototype.slice.call(adsStage.querySelectorAll('.va-card'));
  var vaBin = adsStage.querySelector('.va-bin');
  var vaBinLid = adsStage.querySelector('.va-bin-lid');
  var vaBinJunk = adsStage.querySelector('.va-bin-junk');
  var vaBatMain = adsStage.querySelector('#va-bat-main');
  var vaBatG1 = adsStage.querySelector('#va-bat-g1');
  var vaBatG2 = adsStage.querySelector('#va-bat-g2');
  var vaTwirlRibbon = adsStage.querySelector('#va-twirl-ribbon');
  var vaSwingCrescent = adsStage.querySelector('#va-swing-crescent');
  var vaHitFlare = adsStage.querySelector('.va-hit-flare');
  var vaRing1 = adsStage.querySelector('#va-ring-1');
  var vaRing2 = adsStage.querySelector('#va-ring-2');
  var vaCleanToast = adsStage.querySelector('.va-clean-toast');

  function cubicBez(p0, p1, p2, p3, u) {
    var w = 1 - u;
    return w * w * w * p0 + 3 * w * w * u * p1 + 3 * w * u * u * p2 + u * u * u * p3;
  }

  function computeBatPose(t) {
    // Timeline inside 51.95–57.60s:
    // 53.50–54.52s (1.02s): Mid-Air Flourish Dance ("打之前，先在空中舞一下") — vigorous figure-8 wrist loops in mid-air!
    // 54.52–55.00s (0.48s): Deep Coiled Power Wind-Up ("蓄力拉满") — pulls way back to +155 deg (515 deg), trembling with force!
    // 55.00–55.12s (0.12s): Ferocious Home-Run Swing ("非常狠、非常用力的一挥！") — whips counter-clockwise from 515 deg (+155 deg) to 346 deg (-14 deg)!
    // 55.12–55.20s (0.08s): Brutal Contact Hit-Stop at 346 deg (-14 deg) right through the ad cluster!
    // 55.20–55.72s (0.52s): High Follow-Through sweeping up to 228 deg (-132 deg) & fade out!
    if (t < 53.45 || t >= 55.80) {
      return { opacity: 0, x: 640, y: 1060, angle: -35, scale: 1 };
    }
    var enterOp = clamp01((t - 53.45) / 0.14);
    var exitOp = 1 - clamp01((t - 55.52) / 0.26);
    var op = Math.min(enterOp, exitOp);

    if (t < 54.52) {
      // Mid-air flourish dance (空中舞棒花): 1.5 vigorous figure-8 spins in the air!
      var u = clamp01((t - 53.50) / 1.02);
      var easeU = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      // Spins from -35 deg through +505 deg (+145 deg coiled back-left) with figure-8 wrist modulation
      var angle = -35 + 540 * easeU + 34 * Math.sin(u * Math.PI * 3);
      var x = 680 + 210 * Math.sin(u * Math.PI * 2) - 140 * easeU;
      var y = 980 - 130 * Math.sin(u * Math.PI * 4) + 120 * easeU;
      var sc = 1.0 + 0.08 * Math.sin(u * Math.PI);
      return { opacity: op, x: x, y: y, angle: angle, scale: sc };
    }
    if (t < 55.00) {
      // Deep Coiled Wind-up (54.52–55.00s): cocks back from 505 deg (+145 deg) to 522 deg (+162 deg) with high-tension tremor!
      var w = easeOutQuart(clamp01((t - 54.52) / 0.48));
      var tremor = (t >= 54.70) ? Math.sin(t * 120) * 4.5 * ((t - 54.70) / 0.30) : 0;
      var angle = lerp(505, 522, w) + tremor;
      var x = lerp(540, 420, w) + tremor * 2.4;
      var y = lerp(1100, 1180, w);
      var sc = lerp(1.0, 1.12, w);
      return { opacity: op, x: x, y: y, angle: angle, scale: sc };
    }
    if (t < 55.12) {
      // FEROCIOUS SUPERSONIC HOME-RUN SWING (55.00–55.12s): whips counter-clockwise from 522 deg (+162 deg) to 346 deg (-14 deg)!
      var s = Math.pow(clamp01((t - 55.00) / 0.12), 2.25);
      var angle = lerp(522, 346, s);
      var x = lerp(420, 760, s);
      var y = lerp(1180, 1040, s);
      var sc = lerp(1.12, 1.24, Math.sin(s * Math.PI));
      return { opacity: op, x: x, y: y, angle: angle, scale: sc };
    }
    if (t < 55.20) {
      // Brutal Contact Hit-Stop Freeze (55.12–55.20s) right through the ad cluster!
      var vib = Math.sin((t - 55.12) * 180) * 3.8;
      return { opacity: op, x: 760 + vib, y: 1040 - vib, angle: 346 + vib * 0.5, scale: 1.20 };
    }
    // Massive High Follow-Through (55.20–55.80s): sweeps counter-clockwise up from 346 deg (-14 deg) to 232 deg (-128 deg)!
    var f = easeOutQuart(clamp01((t - 55.20) / 0.46));
    var angle2 = lerp(346, 232, f);
    var x2 = lerp(760, 880, f);
    var y2 = lerp(1040, 880, f);
    return { opacity: op, x: x2, y: y2, angle: angle2, scale: lerp(1.20, 1.02, f) };
  }

  function updateAdsPurge(t) {
    if (t < 51.95 || t >= 57.60) {
      adsStage.style.display = 'none';
      return false;
    }
    adsStage.style.display = 'block';
    var q = t - 51.95;
    var strikeT = 55.12;
    var hitStopEnd = 55.20;
    var fadeIn = sstep(clamp01(q / 0.20));
    var fadeToDrop = 1 - sstep((t - 57.28) / 0.32);

    // 1. Heavy 4K Camera Shake on Bat Impact (55.12s) and Lid Slam (56.60s)
    var camX = 0, camY = 0, camS = 1;
    if (t >= strikeT && t < strikeT + 0.46) {
      var dt = t - strikeT;
      var decay = Math.exp(-dt * 10.5);
      camX = Math.sin(dt * 92) * 64 * decay;
      camY = Math.cos(dt * 78) * 42 * decay;
      camS = dt < 0.08 ? 1.036 : lerp(1.036, 1.0, clamp01((dt - 0.08) / 0.32));
    } else if (t >= 56.60 && t < 56.92) {
      var dt2 = t - 56.60;
      var decay2 = Math.exp(-dt2 * 14);
      camY = Math.sin(dt2 * 85) * 24 * decay2;
    }
    vaCamera.style.transform = 'translate3d(' + camX.toFixed(1) + 'px,' + camY.toFixed(1) + 'px,0) scale(' + camS.toFixed(4) + ')';
    adsStage.style.opacity = Math.min(fadeIn, fadeToDrop).toFixed(4);

    // 2. Render Baseball Bat + Mid-Air Flourish Ribbon + Motion Ghosts + Supersonic Swing Crescent
    var pose = computeBatPose(t);
    vaBatMain.style.opacity = pose.opacity.toFixed(3);
    vaBatMain.style.transform = 'translate3d(' + pose.x.toFixed(1) + 'px,' + pose.y.toFixed(1) + 'px,0) rotate(' + pose.angle.toFixed(2) + 'deg) scale(' + pose.scale.toFixed(3) + ')';

    // Motion blur ghosts during mid-air flourish (53.50–54.52s) and ferocious swing (55.00–55.35s)
    var showGhosts = (t >= 53.55 && t < 54.52) || (t >= 55.00 && t < 55.38);
    if (showGhosts) {
      var p1 = computeBatPose(t - 0.024);
      var p2 = computeBatPose(t - 0.048);
      var gAlpha = (t >= 55.00 && t < 55.22) ? 0.52 : 0.28;
      vaBatG1.style.opacity = (p1.opacity * gAlpha).toFixed(3);
      vaBatG1.style.transform = 'translate3d(' + p1.x.toFixed(1) + 'px,' + p1.y.toFixed(1) + 'px,0) rotate(' + p1.angle.toFixed(2) + 'deg) scale(' + p1.scale.toFixed(3) + ')';
      vaBatG2.style.opacity = (p2.opacity * gAlpha * 0.62).toFixed(3);
      vaBatG2.style.transform = 'translate3d(' + p2.x.toFixed(1) + 'px,' + p2.y.toFixed(1) + 'px,0) rotate(' + p2.angle.toFixed(2) + 'deg) scale(' + p2.scale.toFixed(3) + ')';
    } else {
      vaBatG1.style.opacity = '0';
      vaBatG2.style.opacity = '0';
    }

    // Mid-Air Flourish Figure-8 Golden Ribbon (53.55–54.58s)
    if (t >= 53.55 && t < 54.62) {
      var twP = clamp01((t - 53.55) / 0.95);
      var twFade = Math.min(clamp01((t - 53.55) / 0.15), 1 - clamp01((t - 54.38) / 0.24));
      vaTwirlRibbon.style.opacity = (twFade * 0.85).toFixed(3);
      vaTwirlRibbon.setAttribute('stroke-dashoffset', (2800 * (1 - twP)).toFixed(1));
    } else {
      vaTwirlRibbon.style.opacity = '0';
    }

    // Ferocious Swing Crescent Arc (55.02–55.28s)
    if (t >= 55.02 && t < 55.30) {
      var swIn = clamp01((t - 55.02) / 0.08);
      var swOut = 1 - clamp01((t - 55.14) / 0.16);
      var swA = Math.min(swIn, swOut);
      vaSwingCrescent.style.opacity = swA.toFixed(3);
      vaSwingCrescent.style.transformOrigin = '1120px 1060px';
      vaSwingCrescent.style.transform = 'scale(' + lerp(0.84, 1.12, clamp01((t - 55.02) / 0.22)).toFixed(3) + ')';
    } else {
      vaSwingCrescent.style.opacity = '0';
    }

    // Brutal Contact Star Flare & Twin Shockwave Rings (55.10–55.55s)
    if (t >= 55.10 && t < 55.55) {
      var hdt = t - 55.10;
      var flA = Math.exp(-hdt * 11);
      vaHitFlare.style.opacity = flA.toFixed(3);
      vaHitFlare.style.transform = 'scale(' + (0.65 + hdt * 3.4).toFixed(3) + ')';

      var r1A = Math.exp(-hdt * 6.5);
      vaRing1.style.opacity = r1A.toFixed(3);
      vaRing1.style.transform = 'scale(' + (0.35 + hdt * 4.8).toFixed(3) + ')';

      var r2A = Math.exp(-Math.max(0, hdt - 0.04) * 5.5);
      vaRing2.style.opacity = (hdt >= 0.04 ? r2A * 0.75 : 0).toFixed(3);
      vaRing2.style.transform = 'scale(' + (0.25 + Math.max(0, hdt - 0.04) * 6.2).toFixed(3) + ')';
    } else {
      vaHitFlare.style.opacity = '0';
      vaRing1.style.opacity = '0';
      vaRing2.style.opacity = '0';
    }

    // 3. Heavy Brushed-Steel Trash Can (.va-bin) Entrance, Card-Swallowing Jolts, and Lid Slam!
    var binEnter = easeOutBack(clamp01((t - 53.30) / 0.42));
    var binOp = clamp01((t - 53.30) / 0.22);
    var binJoltY = 0, binRot = 0, binScaleX = 1, binScaleY = 1;
    if (t >= 55.62 && t < 56.55) {
      // Violent rhythmic gulp jolts as the 9 cards slam into the trash can mouth one after another!
      var jPhase = (t - 55.62) * 38;
      var jEnv = Math.sin(clamp01((t - 55.62) / 0.90) * Math.PI);
      binJoltY = Math.abs(Math.sin(jPhase)) * 28 * jEnv;
      binRot = Math.sin(jPhase * 1.15) * 6.5 * jEnv;
      binScaleX = 1 + 0.065 * Math.abs(Math.sin(jPhase)) * jEnv;
      binScaleY = 1 - 0.055 * Math.abs(Math.sin(jPhase)) * jEnv;
    } else if (t >= 56.58 && t < 56.88) {
      // Heavy metallic thud when the lid slams shut!
      var ldt = t - 56.58;
      var lDecay = Math.exp(-ldt * 14);
      binJoltY = 32 * lDecay * Math.abs(Math.cos(ldt * 55));
      binScaleX = 1 + 0.07 * lDecay;
      binScaleY = 1 - 0.07 * lDecay;
    }
    vaBin.style.opacity = binOp.toFixed(3);
    vaBin.style.transform =
      'translate3d(0,' + ((1 - binEnter) * 420 + binJoltY).toFixed(1) + 'px,0) ' +
      'rotate(' + binRot.toFixed(2) + 'deg) ' +
      'scale(' + binScaleX.toFixed(3) + ',' + binScaleY.toFixed(3) + ')';

    // Rising colorful crumpled garbage pile inside the bin mouth (55.68–56.58s, sealed once lid slams down!)
    var junkFill = clamp01((t - 55.68) / 0.78);
    var junkSeal = 1 - clamp01((t - 56.52) / 0.08);
    vaBinJunk.style.opacity = ((junkFill > 0.02 ? 1 : 0) * junkSeal).toFixed(3);
    vaBinJunk.style.transform = 'translateY(' + ((1 - junkFill) * 48).toFixed(1) + 'px) scale(' + (0.65 + 0.35 * junkFill).toFixed(3) + ')';

    // Heavy Metallic Trash Can Lid Slam (56.46–56.60s)
    if (t >= 56.46) {
      var lidP = easeOutQuart(clamp01((t - 56.46) / 0.14));
      vaBinLid.style.opacity = clamp01((t - 56.46) / 0.06).toFixed(3);
      vaBinLid.style.transform =
        'translate3d(' + ((1 - lidP) * 80).toFixed(1) + 'px,' + ((1 - lidP) * -260).toFixed(1) + 'px,0) ' +
        'rotate(' + ((1 - lidP) * 68).toFixed(2) + 'deg)';
    } else {
      vaBinLid.style.opacity = '0';
    }

    // Clean confirmation pill: "已清空" (56.62–57.45s)
    if (t >= 56.62) {
      var tstIn = easeOutBack(clamp01((t - 56.62) / 0.24));
      var tstOut = 1 - clamp01((t - 57.25) / 0.25);
      vaCleanToast.style.opacity = Math.min(clamp01((t - 56.62) / 0.12), tstOut).toFixed(3);
      vaCleanToast.style.transform = 'translate(-50%, -50%) scale(' + lerp(0.86, 1.0, tstIn).toFixed(3) + ')';
    } else {
      vaCleanToast.style.opacity = '0';
    }

    // 4. All 9 Ad Cards: Pop-in -> Magnetic Coiled Gather into Strike Zone -> Crumple on Impact -> Ballistic Arc Straight Into Trash Can!
    var gather = easeInOutCubic(clamp01((t - 54.42) / 0.56));
    var binMouthX = 2830; // Target center for card element (left + width/2 -> 3250px bin mouth center)
    var binMouthY = 1040; // Target top for card element (top + height/2 -> 1265px bin mouth center)

    for (var i = 0; i < ADS.length; i++) {
      var c = ADS[i], el = vaCards[i];
      if (q < c.appear) { el.style.opacity = '0'; continue; }
      if (i === 0) {
        var sk = el.querySelector('.ad-skip');
        if (sk) sk.textContent = '跳过 ' + Math.max(1, 5 - Math.floor(q % 5)) + 's';
        var sh = el.querySelector('.ad-shake-ico');
        if (sh) sh.style.transform = 'rotate(' + (Math.sin(t * 22) * 14).toFixed(1) + 'deg)';
      } else if (i === 2) {
        var ld = el.querySelector('.ad-live');
        if (ld) ld.style.opacity = (0.4 + 0.6 * Math.abs(Math.sin(t * 5.2))).toFixed(2);
      } else if (i === 5) {
        var cb = el.querySelector('.ad-coin-bar');
        if (cb) cb.style.width = (55 + ((q * 22) % 40)).toFixed(1) + '%';
      } else if (i === 6) {
        var chg = el.querySelector('.ad-charge');
        if (chg) chg.textContent = q < 1.5 ? '−¥98.00' : (q < 2.6 ? '−¥98.00 ×2' : '−¥98.00 ×3');
      } else if (i === 7) {
        var up = el.querySelector('.ad-upd');
        if (up) up.textContent = Math.max(1, 7 - Math.floor(q)) + 's 后强制更新';
      }

      // Position pulled toward strike zone (c.gx, c.gy) during wind-up (54.42–55.00s)
      var baseDx = (c.gx - c.x) * gather;
      var baseDy = (c.gy - c.y) * gather;

      if (t < strikeT) {
        var p = clamp01((q - c.appear) / 0.22);
        var sc = lerp(1.24, 1.0, easeOutBack(p)) * lerp(1.0, 0.78, gather);
        var yd = (1 - easeOutExpo(p)) * -110;
        var flt = Math.sin(t * 3.8 + i * 1.3) * 8 * (1 - gather);
        // Nervous high-frequency jitter as the bat coils back!
        var fearX = gather > 0.1 ? Math.sin(t * 95 + i * 2.1) * 14 * gather : 0;
        var fearY = gather > 0.1 ? Math.cos(t * 88 + i * 1.7) * 10 * gather : 0;
        var extraRot = (i === 0) ? Math.sin(t * 20) * 2.2 : 0;
        el.style.opacity = clamp01(p * 2.6).toFixed(4);
        el.style.transform =
          'translate3d(' + (baseDx + fearX).toFixed(1) + 'px,' + (baseDy + yd + flt + fearY).toFixed(1) + 'px,0) ' +
          'rotate(' + ((c.rot + extraRot) * (1 - 0.5 * gather)).toFixed(2) + 'deg) ' +
          'scale(' + sc.toFixed(4) + ')';
      } else if (t < hitStopEnd) {
        // Brutal Contact Squash & Crumple right against the bat barrel!
        el.style.opacity = '1';
        el.style.transform =
          'translate3d(' + (baseDx + 45).toFixed(1) + 'px,' + (baseDy - 25).toFixed(1) + 'px,0) ' +
          'rotate(' + (c.rot - 24).toFixed(1) + 'deg) ' +
          'scale(0.54, 0.96)';
      } else {
        // High-Speed Ballistic Arc Straight Into the Open Mouth of the Trash Can!
        var fStart = hitStopEnd + i * 0.042;
        var fDur = 0.58 + (i % 3) * 0.08;
        var uFlight = clamp01((t - fStart) / fDur);
        var startX = c.gx + 45;
        var startY = c.gy - 25;
        // High parabolic arc over the stage and diving vertically straight down into binMouth (2830, 1040)
        var ctrl1X = startX + 580 + (i % 3 - 1) * 140;
        var ctrl1Y = startY - 680 - i * 38;
        var ctrl2X = binMouthX + (i % 2 ? -140 : 120);
        var ctrl2Y = binMouthY - 640 - i * 26;

        var curX = cubicBez(startX, ctrl1X, ctrl2X, binMouthX, uFlight);
        var curY = cubicBez(startY, ctrl1Y, ctrl2Y, binMouthY, uFlight);
        var dx = curX - c.x;
        var dy = curY - c.y;
        var spin = c.rot + (i % 2 ? 1 : -1) * (680 + i * 95) * uFlight;
        // Shrinks down into a crumpled ball as it plunges into the trash can mouth!
        var scFlight = lerp(0.74, 0.13, Math.pow(uFlight, 0.78));
        var opFlight = uFlight >= 0.88 ? clamp01(1 - (uFlight - 0.88) / 0.12) : 1.0;

        el.style.opacity = opFlight.toFixed(4);
        el.style.transform =
          'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) ' +
          'rotate(' + spin.toFixed(1) + 'deg) ' +
          'scale(' + scFlight.toFixed(4) + ')';
      }
    }
    return true;
  }

  /* ---------- 11. Pure Monochrome B&W TANCO STUDIO End Card (64.50–69.50s) ---------- */
  var endEl = document.createElement('section');
  endEl.id = 'v20-endcard';
  endEl.innerHTML = '<div class="ve-text">TANCO STUDIO</div><div class="ve-blackout"></div>';
  document.body.appendChild(endEl);
  var veText = endEl.querySelector('.ve-text');
  var veBlack = endEl.querySelector('.ve-blackout');

  function updateEndCard(t) {
    if (t < 64.50) {
      endEl.style.display = 'none';
      return false;
    }
    endEl.style.display = 'flex';
    if (end91) end91.style.display = 'none';
    var q = t - 64.50;
    var pIn = easeOutExpo(clamp01(q / 0.85));
    var pOut = clamp01((t - 69.00) / 0.50);
    var br = 0.5 + 0.5 * Math.sin(q * 1.95);
    var glow1 = (20 + 20 * br).toFixed(1);
    var glow2 = (48 + 44 * br).toFixed(1);
    var a1 = (0.24 + 0.30 * br).toFixed(3);
    var a2 = (0.10 + 0.14 * br).toFixed(3);

    veText.style.opacity = pIn.toFixed(4);
    veText.style.transform = 'translate3d(0,' + ((1 - pIn) * 44).toFixed(1) + 'px,0)';
    veText.style.letterSpacing = lerp(0.16, 0.22, pIn).toFixed(4) + 'em';
    veText.style.textShadow = '0 0 ' + glow1 + 'px rgba(255,255,255,' + a1 + '), 0 0 ' + glow2 + 'px rgba(255,255,255,' + a2 + ')';
    veBlack.style.opacity = easeInOutCubic(pOut).toFixed(4);
    return true;
  }

  /* ---------- 12. 2-Second Deconstructed Element-by-Element Cascade Drop Assembly (57.60–59.60s)
                    + Seamless Classical Full-Screen Album Carousel Rapid Spin (59.60–64.50s) ---------- */
  // ZERO whole-window screenshot drop! ZERO 1-2 frame double-image overlap!
  // Every component (top tabs, theme button, playbar dock, transport buttons, and all 6 classical 3D cards)
  // drops rapidly from above one by one across 57.60–59.60s (2.00s) to assemble the complete player,
  // then immediately spins into the rapid classical album relay at 59.60–64.50s!
  var DROP_ORDER = [5, 2, 3, 1, 0, 4]; // Outer wings -> inner wings -> center hero card (J. S. Bach) locking in last!

  function easeOutQuart(x) {
    var u = clamp01(x);
    return 1 - Math.pow(1 - u, 4);
  }

  function resetDeconstructedElements() {
    if (app) {
      app.style.overflow = '';
    }
    var tabs = document.getElementById('tabs');
    var tb = document.getElementById('theme-button');
    var pb = document.getElementById('playbar');
    if (tabs) { tabs.style.transform = 'translateX(-50%)'; tabs.style.opacity = ''; }
    if (tb) { tb.style.transform = ''; tb.style.opacity = ''; }
    if (pb) { pb.style.transform = 'translateX(-50%)'; pb.style.opacity = ''; }
    ['#repeat', '#previous', '#play', '#next', '#now-pill', '#volume', '#eq-button'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) { el.style.transform = ''; el.style.opacity = ''; }
    });
  }

  /* ---------- v22: Finale colour show — every 琉璃 theme, background AND interface (59.60–64.50s) ----------
     Source of truth: ~/AI/玻璃播放器/player/Sources/PlayerCore/Theme.swift `softLightPalette` (what the app
     actually puts on screen, per PlayerController.palette) + UI/AmbientBackground.swift (base colour + three
     drifting soft-light blobs: secondary 1.18m@0.68, tertiary 0.96m@0.54, accent 0.76m@0.32).
     States: 0 = 跟随封面 on the G-string cover (= the original film frame at 59.60s),
             1..17 = the 17 fixed themes (朱青/琉璃 red-blue family first), 18 = 跟随封面 on the new Minuet cover.
     Progress uses the original accelerating roll curve: s = 18 * u^2.35, u = (t - 59.60) / 4.40. */
  var V22_THEMES = [
    { id: 'zhuqing',    name: '朱青',     p: ['281024', 'D92B6B', 'FF8A54', 'F6DCE6', 'FFB067'] },
    { id: 'liuli',      name: '琉璃',     p: ['161E3C', '2B58A8', 'FF7B47', 'EEF7F2', 'FFC845'] },
    { id: 'rouge',      name: '胭脂',     p: ['2C0E1E', 'BE185D', 'FB7185', 'FAD8E4', 'FDA4AF'] },
    { id: 'inkBlue',    name: '黛蓝',     p: ['0C1938', '1D4ED8', '38BDF8', 'D2E4FA', '93C5FD'] },
    { id: 'sakura',     name: '樱粉',     p: ['2E1426', 'EC4899', 'FFA07A', 'FDE2EE', 'F9A8D4'] },
    { id: 'deepSea',    name: '深海',     p: ['092238', '0284C7', '2DD4BF', 'C8EBF8', '7DD3FC'] },
    { id: 'duskAmber',  name: '暮橙',     p: ['2A1026', 'E11D74', 'FF9E2C', 'FCE2EC', 'FFD166'] },
    { id: 'mistViolet', name: '雾紫',     p: ['1E1542', '6A35D4', '38BDF8', 'DDD4FA', 'C4B5FD'] },
    { id: 'white',      name: '白',       p: ['F3F5FA', 'E8EEFA', 'FFF6EB', 'FFFFFF', 'FF6B3D'], light: true },
    { id: 'sandGold',   name: '沙金',     p: ['2B1B12', 'D97706', 'FBBF24', 'FDECC8', 'FDE047'] },
    { id: 'celadon',    name: '青瓷',     p: ['0E2E2C', '10B981', '38BDF8', 'D1FAF0', '6EE7B7'] },
    { id: 'black',      name: '黑',       p: ['0D0F17', '1A2136', '2B3758', 'B8C4E0', 'F0F3FA'] },
    { id: 'moss',       name: '苔绿',     p: ['0F2922', '059669', '6EE7B7', 'D5F5E8', 'A7F3D0'] },
    { id: 'aurora',     name: '极光',     p: ['08262C', '0D9488', '22D3EE', 'CCFBF1', '5EEAD4'] },
    { id: 'moonGrey',   name: '月白',     p: ['161E2E', '3B527E', '93C5FD', 'E2ECF8', 'DBEAFE'] },
    { id: 'midnight',   name: '纯黑夜间', p: ['000000', '0B0C12', '171924', '9A9AA8', 'E2E4F0'], pureBlack: true },
    { id: 'smoke',      name: '烟岚',     p: ['1C1E2B', '434A68', '8E99C2', 'DDE2F0', 'C7D2FE'] }
  ];
  window.__v22Themes = V22_THEMES;
  var V22_ORIG_UI = {   // the original film's dark-glass UI (v20.css) = what 跟随封面 states show
    ink: [245, 246, 250], bar: [18, 16, 24, 0.82], pill: [0, 0, 0, 0.28], track: [255, 255, 255, 0.24],
    fill: [255, 255, 255, 1], play: [255, 255, 255, 0.12], tabs: [14, 12, 20, 0.56], sel: [255, 255, 255, 0.20],
    tbtn: [255, 255, 255, 0.10], title: [255, 255, 255, 1], icon: null
  };
  function v22Rgb(h) { return hexRgb('#' + h); }
  function v22Mix(a, b, k) { var o = []; for (var i = 0; i < a.length; i++) o.push(a[i] + (b[i] - a[i]) * k); return o; }
  function v22Css(c) { return c.length > 3 ? 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + c[3].toFixed(3) + ')' : 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  function v22StateUI(st) {
    if (st.follow) return V22_ORIG_UI;
    var P = st.theme.p.map(v22Rgb), pri = P[0], tint = P[3], acc = P[4];
    if (st.theme.light) {
      return { ink: [28, 28, 32], bar: [255, 255, 255, 0.74], pill: [0, 0, 0, 0.06], track: [0, 0, 0, 0.14],
        fill: acc.concat([1]), play: acc.concat([0.18]), tabs: [255, 255, 255, 0.62], sel: [0, 0, 0, 0.08],
        tbtn: [0, 0, 0, 0.06], title: [28, 28, 32, 1], icon: acc };
    }
    var deep = v22Mix(pri, [0, 0, 0], 0.30);
    return { ink: [245, 246, 250], bar: deep.concat([0.80]), pill: [0, 0, 0, 0.26], track: [255, 255, 255, 0.22],
      fill: acc.concat([1]), play: acc.concat([0.22]), tabs: deep.concat([0.56]), sel: tint.concat([0.22]),
      tbtn: tint.concat([0.14]), title: [255, 255, 255, 1], icon: acc };
  }
  function v22State(k) {
    if (k <= 0) return { follow: true, album: CLASSICAL[4] };
    if (k >= 18) return { follow: true, album: MINUET };
    return { follow: false, theme: V22_THEMES[k - 1] };
  }
  var v22Amb = null, v22Blobs = [], v22Shade = null, v22Vig = null, v22OrigIcon = null;
  function v22EnsureAmb() {
    if (v22Amb || !app) return;
    v22Amb = document.createElement('div');
    v22Amb.id = 'v22-amb';
    v22Amb.innerHTML = '<div class="v22-base"></div><i></i><i></i><i></i><div class="v22-shade"></div><div class="v22-vig"></div>';
    var vg = document.getElementById('vignette');
    app.insertBefore(v22Amb, vg || app.firstChild);
    v22Blobs = Array.prototype.slice.call(v22Amb.querySelectorAll('i'));
    v22Shade = v22Amb.querySelector('.v22-shade');
    v22Vig = v22Amb.querySelector('.v22-vig');
  }
  var V22_UI_PROPS = [];
  function v22Set(el, prop, val) { if (el) { el.style.setProperty(prop, val, 'important'); V22_UI_PROPS.push([el, prop]); } }
  function v22ThemeShowOff() {
    if (v22Amb) v22Amb.style.display = 'none';
    for (var i = 0; i < V22_UI_PROPS.length; i++) V22_UI_PROPS[i][0].style.removeProperty(V22_UI_PROPS[i][1]);
    V22_UI_PROPS = [];
    window.__v22ThemeState = null;
  }
  function v22ThemeShow(t) {
    v22EnsureAmb();
    v22ThemeShowOff();
    var u = clamp01((t - 59.60) / 4.40);
    var s = 18 * Math.pow(u, 2.35);
    var k0 = Math.min(18, Math.floor(s)), k1 = Math.min(18, k0 + 1);
    var f = k0 >= 18 ? 0 : easeInOutCubic(s - k0);
    var A = v22State(k0), B = v22State(k1);
    window.__v22ThemeState = { s: s, from: A.follow ? '跟随封面' : A.theme.name, to: B.follow ? '跟随封面' : B.theme.name, f: f };

    // 1) background: 跟随封面 = original album gradient on #app; fixed themes = app AmbientBackground replica
    var followW = (A.follow ? 1 - f : 0) + (B.follow ? f : 0);
    var fa = A.follow ? A.album : B.album;   // only one follow state can be adjacent at a time
    if (app && (A.follow || B.follow)) {
      app.style.setProperty('background',
        'radial-gradient(ellipse at 64% 26%, ' + rgbaCss(hexRgb(fa.glow), 0.30) + ' 0%, transparent 56%), linear-gradient(160deg, ' + fa.bg + ' 0%, #05060A 100%)',
        'important');
    }
    var TA = A.follow ? (B.follow ? null : B.theme) : A.theme;
    var TB = B.follow ? TA : B.theme;
    if (!TA) TA = TB = V22_THEMES[0];
    var kk = (A.follow || B.follow) ? 0 : f;
    var PA = TA.p.map(v22Rgb), PB = TB.p.map(v22Rgb), P = [];
    for (var pi = 0; pi < 5; pi++) P.push(v22Mix(PA[pi], PB[pi], kk));
    var blobK = lerp(TA.pureBlack ? 0 : 1, TB.pureBlack ? 0 : 1, kk);
    var lightK = lerp(TA.light ? 1 : 0, TB.light ? 1 : 0, kk);
    v22Amb.style.display = 'block';
    v22Amb.style.opacity = (1 - followW).toFixed(4);
    v22Amb.querySelector('.v22-base').style.background = v22Css(P[0]);
    var gw = 1315.5556, gh = 740, m = Math.max(gw, gh);
    var BL = [
      { c: P[1], size: 1.18, op: 0.68, from: [-0.28, -0.10], to: [-0.16, -0.22], dur: 18 },
      { c: P[2], size: 0.96, op: 0.54, from: [0.22, -0.14], to: [0.32, 0.08], dur: 22 },
      { c: P[4], size: 0.76, op: 0.32, from: [0.08, 0.24], to: [-0.04, 0.34], dur: 26 }
    ];
    for (var bi = 0; bi < 3; bi++) {
      var b = BL[bi], d = m * b.size, ph = 0.5 - 0.5 * Math.cos(Math.PI * 2 * ((t - 57.0) / (2 * b.dur)));
      var cx = gw / 2 + gw * lerp(b.from[0], b.to[0], ph), cy = gh / 2 + gh * lerp(b.from[1], b.to[1], ph);
      var op = b.op * blobK;
      var el = v22Blobs[bi];
      el.style.width = d.toFixed(1) + 'px'; el.style.height = d.toFixed(1) + 'px';
      el.style.left = (cx - d / 2).toFixed(1) + 'px'; el.style.top = (cy - d / 2).toFixed(1) + 'px';
      el.style.background = 'radial-gradient(circle closest-side, ' + v22Css(b.c.concat([op])) + ' 0%, ' + v22Css(b.c.concat([op * 0.4])) + ' 50%, ' + v22Css(b.c.concat([0])) + ' 100%)';
    }
    v22Shade.style.background = 'linear-gradient(180deg, rgba(0,0,0,' + lerp(0.02, 0.0, lightK).toFixed(3) + ') 0%, rgba(0,0,0,' + lerp(0.05, 0.01, lightK).toFixed(3) + ') 60%, rgba(0,0,0,' + lerp(0.16, 0.04, lightK).toFixed(3) + ') 100%)';
    v22Vig.style.background = 'radial-gradient(circle at 50% 50%, transparent ' + (m * 0.35).toFixed(0) + 'px, rgba(0,0,0,' + lerp(0.10, 0.03, lightK).toFixed(3) + ') ' + (m * 0.85).toFixed(0) + 'px)';

    // 2) interface colours (play bar, tabs, theme button, accents, card captions)
    var UA = v22StateUI(A), UB = v22StateUI(B);
    function M(key) { return v22Mix(UA[key], UB[key], f); }
    var pb = document.getElementById('playbar');
    var ink = v22Css(M('ink'));
    if (app) { v22Set(app, '--ink', ink); v22Set(app, 'color', ink); }
    v22Set(pb, 'background', v22Css(M('bar')));
    v22Set(pb, 'color', ink);
    v22Set(document.getElementById('now-pill'), 'background', v22Css(M('pill')));
    v22Set(document.getElementById('now-pill'), 'color', ink);
    v22Set(document.getElementById('progress-track'), 'background', v22Css(M('track')));
    v22Set(document.querySelector('#progress-track > i'), 'background', v22Css(M('fill')));
    v22Set(document.querySelector('.volume-track'), 'background', v22Css(M('track')));
    v22Set(document.querySelector('.volume-track > i'), 'background', v22Css(M('fill')));
    v22Set(document.getElementById('play'), 'background', v22Css(M('play')));
    v22Set(document.getElementById('play'), 'color', ink);
    var tabs = document.getElementById('tabs');
    v22Set(tabs, 'background', v22Css(M('tabs')));
    v22Set(tabs, 'color', ink);
    v22Set(document.querySelector('#tabs span.selected'), 'background', v22Css(M('sel')));
    v22Set(document.querySelector('#tabs span.selected'), 'color', ink);
    var tb = document.getElementById('theme-button');
    v22Set(tb, 'background', v22Css(M('tbtn')));
    v22Set(tb, 'color', ink);
    var rp = document.getElementById('repeat');
    if (rp) {
      if (!v22OrigIcon) { var cs = getComputedStyle(rp).color.match(/[\d.]+/g); v22OrigIcon = cs ? cs.slice(0, 3).map(Number) : [245, 246, 250]; }
      var ia = UA.icon || v22OrigIcon, ib = UB.icon || v22OrigIcon;
      v22Set(rp, 'color', v22Css(v22Mix(ia, ib, f)));
    }
    var ttl = v22Css(M('title'));
    var titles = document.querySelectorAll('.cover-card .cover-title, .cover-card .cover-artist');
    for (var ti = 0; ti < titles.length; ti++) v22Set(titles[ti], 'color', ttl);
  }

  function updateClimaxRelay(t) {
    var amb = document.getElementById('ambient');
    if (t < 57.60 || t >= 64.50) {
      v22ThemeShowOff();
      if (app) {
        app.style.removeProperty('background');
        app.style.overflow = '';
      }
      return;
    }

    var g = geometry();
    var aq = clamp01((t - 57.60) / 2.00); // 0.00 -> 1.00 across the 2.00s assembly window

    // 1. Lock #main and #app in exact deterministic centered coordinates -> ZERO 1-2 frame double-image flash!
    if (main) {
      var fadeEnd = sstep((t - 64.00) / 0.50);
      var z = t < 59.60 ? 1.0 : (1.0 + 0.06 * Math.pow(clamp01((t - 59.60) / 4.90), 1.3) + 0.25 * fadeEnd);
      main.style.transform = 'translate(' + (1920 * (1 - z)).toFixed(2) + 'px,' + (1080 * (1 - z)).toFixed(2) + 'px) scale(' + (2 * z).toFixed(5) + ')';
      main.style.opacity = (1 - fadeEnd).toFixed(4);
      main.style.clipPath = 'none';
    }

    // Smooth classical album roll: parked at 4.0 during 57.60–59.60s assembly, then accelerates smoothly 59.60–64.50s!
    var roll = t < 59.60 ? 4.0 : (4.0 + 19.0 * Math.pow(clamp01((t - 59.60) / 4.40), 2.35));
    var idxA = ((Math.floor(roll) % 6) + 6) % 6;
    var idxB = (idxA + 1) % 6;
    var frac = easeInOutCubic(roll - Math.floor(roll));
    var colBg = lerpHex(CLASSICAL[idxA].bg, CLASSICAL[idxB].bg, frac);
    var colGl = lerpRgba(CLASSICAL[idxA].glow, CLASSICAL[idxB].glow, frac, 0.30);

    if (app) {
      var shellDrop = t >= 59.60 ? 1.0 : easeOutQuart(clamp01(aq / 0.26));
      var shellOffY = (1 - shellDrop) * -180;
      app.style.left = g.x.toFixed(2) + 'px';
      app.style.top = (g.y + shellOffY).toFixed(2) + 'px';
      app.style.width = g.w.toFixed(2) + 'px';
      app.style.height = g.h.toFixed(2) + 'px';
      app.style.transform = 'scale(' + g.scale.toFixed(5) + ')';
      app.style.clipPath = 'none';
      app.style.opacity = '1';
      // Allow falling elements above the top edge to be visible while raining down!
      app.style.overflow = (t < 59.55) ? 'visible' : 'hidden';
      app.style.borderRadius = '18px';
      app.style.boxShadow = '0 44px 128px rgba(0, 0, 0, ' + (0.72 * shellDrop).toFixed(3) + ')';
      app.style.setProperty(
        'background',
        'radial-gradient(ellipse at 64% 26%, ' + colGl + ' 0%, transparent 56%), linear-gradient(160deg, ' + colBg + ' 0%, #05060A 100%)',
        'important'
      );
    }
    if (amb) amb.style.opacity = '0';
    var trf = document.getElementById('traffic');
    if (trf) trf.style.opacity = '0';

    // 3. Layout the 6 classical 3D cards deterministically + apply 2.0s element-by-element vertical cascade drop (57.60–59.60s)!
    var side = Math.min((g.h - 198) * 0.60, g.w * 0.30, 440);
    var ch = side * 1.17;
    var baseTop = (g.h - 198 - ch) / 2 - 12;

    for (var i = 0; i < 6; i++) {
      var card = document.getElementById('cover-' + i);
      if (!card) continue;
      var d = (((i - roll + 3) % 6 + 6) % 6) - 3;
      var ab = Math.abs(d), sign = Math.sign(d);
      var spread = 0.62 * Math.min(ab, 1) + 0.30 * Math.max(0, Math.min(ab, 2) - 1) + 0.20 * Math.max(0, ab - 2);
      var s = sstep(Math.min(ab, 1));
      var rotY = sign * (52 * s + 4 * Math.max(0, Math.min(ab, 3) - 1)) * 0.7;
      var sc = 1 - 0.16 * s - 0.06 * Math.max(0, Math.min(ab, 3) - 1);
      var baseAlpha = (ab <= 2.6 ? 1 : Math.max(0, 1 - (ab - 2.6))) * sstep(clamp01((3 - ab) * 2));

      // Rapid element-by-element drop for each card spaced evenly across aq = 0.14 .. 0.96 of the 2.0s window!
      var orderRank = DROP_ORDER.indexOf(i);
      if (orderRank < 0) orderRank = i;
      var cStart = 0.14 + orderRank * 0.11; // 0.14, 0.25, 0.36, 0.47, 0.58, 0.69
      var cRaw = clamp01((aq - cStart) / 0.27);
      var cProg = t >= 59.60 ? 1.0 : easeOutQuart(cRaw);
      var cAlpha = t >= 59.60 ? 1.0 : clamp01((aq - cStart) / 0.10);
      var dropY = (1 - cProg) * -720;
      var dropRotX = (1 - cProg) * 20;

      card.style.width = side.toFixed(1) + 'px';
      card.style.height = ch.toFixed(1) + 'px';
      card.style.left = (g.w / 2 - side / 2 + sign * spread * side).toFixed(1) + 'px';
      card.style.top = (baseTop + dropY).toFixed(1) + 'px';
      card.style.transform = 'perspective(1100px) rotateY(' + rotY.toFixed(2) + 'deg) rotateX(' + dropRotX.toFixed(2) + 'deg) scale(' + (sc * lerp(0.86, 1.0, cProg)).toFixed(4) + ')';
      card.style.zIndex = String(100 - Math.round(ab * 10));
      card.style.opacity = (baseAlpha * cAlpha).toFixed(4);
      card.style.filter = 'brightness(' + (1 - 0.30 * s - 0.12 * Math.max(0, Math.min(ab, 3) - 1)).toFixed(3) + ')';
    }

    // 4. Staggered rapid drop of Top Header Pills (#tabs, #theme-button) and Bottom Control Bar Elements (#playbar & children)!
    var tabs = document.getElementById('tabs');
    var tb = document.getElementById('theme-button');
    var pb = document.getElementById('playbar');

    if (tabs) {
      var kTabs = t >= 59.60 ? 1.0 : easeOutQuart(clamp01((aq - 0.04) / 0.22));
      var aTabs = t >= 59.60 ? 1.0 : clamp01((aq - 0.04) / 0.09);
      tabs.style.opacity = aTabs.toFixed(4);
      tabs.style.transform = 'translate(-50%, ' + ((1 - kTabs) * -360).toFixed(1) + 'px)';
    }
    if (tb) {
      var kTb = t >= 59.60 ? 1.0 : easeOutQuart(clamp01((aq - 0.10) / 0.22));
      var aTb = t >= 59.60 ? 1.0 : clamp01((aq - 0.10) / 0.09);
      tb.style.opacity = aTb.toFixed(4);
      tb.style.transform = 'translateY(' + ((1 - kTb) * -360).toFixed(1) + 'px)';
    }
    if (pb) {
      var kPb = t >= 59.60 ? 1.0 : easeOutQuart(clamp01((aq - 0.12) / 0.24));
      var aPb = t >= 59.60 ? 1.0 : clamp01((aq - 0.12) / 0.10);
      pb.style.top = 'auto';
      pb.style.bottom = '18px';
      pb.style.left = '50%';
      pb.style.clipPath = 'none';
      pb.style.opacity = aPb.toFixed(4);
      pb.style.transform = 'translate(-50%, ' + ((1 - kPb) * -540).toFixed(1) + 'px)';
    }
    var pbKids = ['#repeat', '#previous', '#play', '#next', '#now-pill', '#volume', '#eq-button'];
    for (var ki = 0; ki < pbKids.length; ki++) {
      var kel = document.querySelector(pbKids[ki]);
      if (!kel) continue;
      var kStart = 0.18 + ki * 0.055; // 0.18 .. 0.51
      var kKid = t >= 59.60 ? 1.0 : easeOutQuart(clamp01((aq - kStart) / 0.22));
      var aKid = t >= 59.60 ? 1.0 : clamp01((aq - kStart) / 0.09);
      kel.style.opacity = aKid.toFixed(4);
      kel.style.transform = 'translateY(' + ((1 - kKid) * -280).toFixed(1) + 'px)';
    }

    var active = ((Math.round(roll) % 6) + 6) % 6;
    var nc = document.getElementById('now-cover');
    var nt = document.getElementById('now-title');
    var na = document.querySelector('#now-pill .now-meta small');
    if (nc && nc.getAttribute('src') !== CLASSICAL[active].cover) nc.src = CLASSICAL[active].cover;
    var nowMinuet = (active === 5 && v22MinuetOn());
    document.documentElement.classList.toggle('v22-now-minuet', nowMinuet);
    if (nt) nt.textContent = cardData(active).title;
    if (na) na.textContent = cardData(active).artist;
    if (t >= 59.60) v22ThemeShow(t); else v22ThemeShowOff();
  }

  /* ---------- 13. 21:9 Appreciation Mode Layout Polish (9.00–14.80s, 5.80s) ---------- */
  function update21x9Appreciation(t) {
    if (t < V22_APPR_START || t >= V22_APPR_END) return;
    var appr = document.getElementById('appreciation-v7');
    if (!appr) return;
    var aq = t - V22_APPR_START;
    var aIn = easeOutQuint(clamp01(aq / 0.42));
    var aOut = 1 - sstep((aq - (V22_APPR_END - V22_APPR_START - 0.24)) / 0.24);
    var br = Math.sin(aq * 1.9) * 0.005;

    var w = 1663.2, h = 712.8;
    var x = (1920 - w) / 2, y = (1080 - h) / 2;
    appr.style.left = x.toFixed(1) + 'px';
    appr.style.top = y.toFixed(1) + 'px';
    appr.style.width = w.toFixed(1) + 'px';
    appr.style.height = h.toFixed(1) + 'px';
    appr.style.opacity = Math.min(aIn, aOut).toFixed(4);
    appr.style.transform = 'scale(' + (lerp(0.96, 1.0, aIn) + br).toFixed(5) + ')';

    var h2 = appr.querySelector('h2');
    var art = appr.querySelector('.app-artist');
    var alb = appr.querySelector('.app-album');
    var tr = appr.querySelector('.app-transport');
    var pr = appr.querySelector('.app-progress');
    var cov = appr.querySelector('.app-cover');
    if (h2) { h2.style.left = '66px'; h2.style.top = '440px'; h2.style.fontSize = '58px'; }
    if (art) { art.style.left = '66px'; art.style.top = '514px'; art.style.fontSize = '24px'; }
    if (alb) { alb.style.left = '66px'; alb.style.top = '548px'; alb.style.fontSize = '18px'; }
    if (tr) { tr.style.left = '66px'; tr.style.top = '592px'; }
    if (pr) { pr.style.left = '66px'; pr.style.top = '658px'; pr.style.width = '1220px'; }
    if (cov) {
      cov.style.left = (w - 306) + 'px';
      cov.style.top = (h - 306) + 'px';
      cov.style.width = '248px';
      cov.style.height = '248px';
      cov.style.borderRadius = '16px';
    }
  }

  /* ---------- MASTER PER-FRAME DIRECTOR PASS ---------- */
  function hideMain() {
    if (!main) return;
    main.style.visibility = 'hidden';
    main.style.opacity = '0';
  }

  function v20Render(t) {
    patchClassicalAssets();

    if (v10Stage) v10Stage.style.display = 'none';
    if (titleStage) {
      titleStage.style.visibility = 'hidden';
      titleStage.style.opacity = '0';
    }
    // Always enforce dark frosted glass on #app & #mini-window (never light control bar at 50s!)
    if (app) {
      app.classList.remove('v16-solo');
      app.classList.remove('light');
      app.removeAttribute('data-solo');
      app.style.setProperty('--ink', '#f5f6fa', 'important');
      app.style.setProperty('--ink-soft', 'rgba(245,246,250,0.65)', 'important');
    }

    updateLiquidBG(t);
    var proOpaque = updatePrologue(t);

    // 1. End card (64.50–69.50s)
    if (updateEndCard(t)) {
      chEl.style.display = 'none';
      loupeEl.style.display = 'none';
      manEl.style.display = 'none';
      adsStage.style.display = 'none';
      miniGlow.style.display = 'none';
      ratioBadge.style.display = 'none';
      hideMain();
      updateClimaxRelay(0);
      return;
    }

    // 2. Manifesto (49.90–51.95s)
    if (updateManifesto(t)) {
      chEl.style.display = 'none';
      loupeEl.style.display = 'none';
      adsStage.style.display = 'none';
      miniGlow.style.display = 'none';
      ratioBadge.style.display = 'none';
      hideMain();
      updateClimaxRelay(0);
      return;
    }

    // 3. 9 Ad Cards & Solar Slash Purge (51.95–57.60s)
    if (updateAdsPurge(t)) {
      chEl.style.display = 'none';
      loupeEl.style.display = 'none';
      miniGlow.style.display = 'none';
      ratioBadge.style.display = 'none';
      hideMain();
      updateClimaxRelay(0);
      return;
    }

    // 4. Chapter Title Cards
    var ch = findChapter(t);
    if (ch) {
      renderChapter(t, ch);
      loupeEl.style.display = 'none';
      miniGlow.style.display = 'none';
      ratioBadge.style.display = 'none';
      hideMain();
      updateClimaxRelay(0);
      return;
    } else {
      chEl.style.display = 'none';
    }

    // Otherwise LIVE 21:9 #main software stage is ON & 100% CENTERED!
    if (main) {
      main.style.display = 'block';
      main.style.clipPath = 'none';
      if (proOpaque) {
        hideMain();
      } else {
        main.style.visibility = 'visible';
        main.style.opacity = t >= 64.0 ? String(clamp01(1 - (t - 64.0) / 0.5)) : '1';
      }
      if (t < 57.60) {
        main.style.transform = 'scale(2)';
      }
    }

    if (t < 57.60) {
      resetDeconstructedElements();
    }

    if (app && t < 57.60) {
      var g = geometry();
      app.style.left = g.x.toFixed(1) + 'px';
      app.style.top = g.y.toFixed(1) + 'px';
      app.style.width = g.w.toFixed(1) + 'px';
      app.style.height = g.h.toFixed(1) + 'px';
      app.style.transform = 'scale(' + g.scale.toFixed(4) + ')';
      app.style.clipPath = 'none';
      var pb = document.getElementById('playbar');
      if (pb) {
        pb.style.top = 'auto';
        pb.style.bottom = '18px';
        pb.style.left = '50%';
        pb.style.transform = 'translateX(-50%)';
        pb.style.clipPath = 'none';
        pb.style.opacity = '1';
      }
      var trf = document.getElementById('traffic');
      if (trf && t < V22_APPR_START) {
        trf.style.left = (g.x + 17 * g.scale).toFixed(1) + 'px';
        trf.style.top = (g.y + 15 * g.scale).toFixed(1) + 'px';
        trf.style.opacity = '1';
      }
    }

    // Guarantee ZERO album cards ever appear in EQ chapter
    var carEl = document.getElementById('carousel');
    if (carEl) {
      if (t >= 29.30 && t < 38.50) {
        carEl.style.opacity = '0';
        carEl.style.visibility = 'hidden';
      } else {
        carEl.style.visibility = 'visible';
      }
    }

    // Climax 2s Deconstructed Element Drop Assembly (57.60–59.60s) & Classical Spin (59.60–64.50s)
    if (t >= 57.60 && t < 64.50) {
      updateClimaxRelay(t);
    } else {
      updateClimaxRelay(0);
      if (app && t < 30.30) {
        app.style.boxShadow = '0 38px 110px rgba(24, 8, 18, 0.36)';
      }
    }

    // 21:9 Appreciation mode (9.00–14.80s, 5.80s)
    update21x9Appreciation(t);

    // Floating Mini Player (15.80–19.10s, 3.30s) — 100% centered + real-time synced progress bar & timer!
    if (t >= 15.80 && t < 19.10) {
      var en = audioEnergy(t);
      miniGlow.style.display = 'block';
      miniGlow.style.opacity = (0.28 + 0.34 * en).toFixed(3);
      miniGlow.style.transform = 'translate(-50%,-50%) scale(' + (1 + 0.08 * en).toFixed(4) + ')';
      var mw = document.getElementById('mini-window');
      if (mw) {
        var mq = t - 15.80;
        var scIn = easeOutQuint(clamp01(mq / 0.55));
        var scOut = sstep(clamp01((mq - 2.65) / 0.65));
        var mScale = lerp(1.16, 1.52, scIn) - 0.24 * scOut;
        var breatheY = Math.sin(mq * 2.5) * 6;
        mw.classList.remove('light-mini');
        mw.style.left = '960px';
        mw.style.top = '540px';
        mw.style.transformOrigin = '50% 50%';
        mw.style.opacity = (Math.min(clamp01(mq / 0.22), 1 - sstep((mq - 3.05) / 0.25))).toFixed(4);
        mw.style.transform = 'translate(-50%, calc(-50% + ' + breatheY.toFixed(1) + 'px)) scale(' + mScale.toFixed(4) + ')';
        var mc = mw.querySelector('.mini-cover');
        if (mc) mc.src = CLASSICAL[4].cover;
        // Continuous synchronized progress bar AND countdown timer!
        var mpBar = mw.querySelector('.mini-progress i');
        var mpTime = mw.querySelector('.mini-controls time');
        var progPct = 24 + (mq / 3.30) * 44; // Smoothly advances 24% -> 68% across the 3.30s scene!
        if (mpBar) mpBar.style.width = progPct.toFixed(2) + '%';
        if (mpTime) {
          var remSec = Math.max(8, Math.round(23 - (mq / 3.30) * 13));
          mpTime.textContent = '−0:' + String(remSec).padStart(2, '0');
        }
      }
    } else {
      miniGlow.style.display = 'none';
    }

    updateControlBarLoupe(t);
    updateAliveEQ(t);
    updateVideoPromo(t);
  }

  /* v22: the original single light sweep (v14, 7.50–8.40s, cut by the title at 8.00s) now plays over the
     settled Chopin card 7.00–7.50s — the same partial pass (u 0 → 0.556) right before the 沉浸欣赏 title. */
  function v22IntroSweep(t) {
    var sw = document.getElementById('v14-sweep');
    if (!sw || t < 7.00 || t >= V22_TITLE1_START) return;
    var u = clamp01((t - 7.00) / 0.9), e = sstep(u);
    sw.style.display = 'block';
    sw.style.transform = 'translateX(' + (Math.round((-620 + e * 2720) * 100) / 100) + 'px) skewX(-9deg)';
    sw.style.opacity = String(0.30 + 0.70 * Math.sin(Math.PI * u));
  }

  window.seek = function (t) {
    currentT = t;
    prevSeek(mapToV7Time(t));
    v20Render(t);
    v22IntroSweep(t);
    if (window.__v22After) window.__v22After(t);
  };
  window.ready = Promise.resolve(window.ready).then(function () {
    patchClassicalAssets();
    var waits = v22MinuetImgs.map(function (im) { im.decoding = 'sync'; return im.decode ? im.decode().catch(function () {}) : null; });
    return Promise.all(waits);
  }).then(function () {
    window.seek(0);
    return true;
  });
})();
