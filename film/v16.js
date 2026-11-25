/* v16 — response to review #3: living intro, solo control-bar lens, live spectrum,
   all-black EQ, promo reel inside the video frame, cleaner slam, longer end card. */
(function () {
  if (window.__v16) return; window.__v16 = true;
  var prevSeek = window.seek;
  var main = document.getElementById('main');
  var app = document.getElementById('app');
  var stage = document.getElementById('v10-stage');
  var titleStage = document.getElementById('v7-title-stage');
  var loopPanel = document.getElementById('loop-panel');
  var speedPanel = document.getElementById('speed-panel');
  var eqPanel = document.getElementById('eq-panel');
  var miniEq = document.getElementById('v14-minieq');
  var aura = document.createElement('div'); aura.id = 'v16-aura';
  (function () { var mn = document.getElementById('main') || document.body; mn.appendChild(aura); })();
  var shock = document.getElementById('v14-shock');
  var waveBox = document.getElementById('v14-wave');
  var pitch = document.getElementById('v14-pitch');
  var gv = document.getElementById('glass-video');
  var videoStage = document.getElementById('original-video-stage');
  var endcard = document.getElementById('v91-endcard');
  var endMesh = document.getElementById('v91-end-mesh');
  var endSvg = endcard ? endcard.querySelector('svg') : null;
  if (shock) shock.style.display = 'none';
  if (pitch) pitch.style.display = 'none';

  function sstep(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function px(v) { return (Math.round(v * 100) / 100) + 'px'; }
  function audioData() { return (typeof audioAnalysis !== 'undefined' && audioAnalysis) || []; }
  function waveAt(t) {
    var A = audioData(); if (!A.length) return null;
    var i = Math.max(0, Math.min(A.length - 1, Math.floor(t * 60)));
    return A[i];
  }

  /* ---------- lens ---------- */
  var lens = document.createElement('div'); lens.id = 'v16-lens';
  lens.innerHTML = '<span class="cap"></span><span class="val"></span><span class="sub"></span>';
  main.appendChild(lens);
  var lensCap = lens.querySelector('.cap'), lensVal = lens.querySelector('.val'), lensSub = lens.querySelector('.sub');

  function centerInMain(el) {
    var r = el.getBoundingClientRect(), mr = main.getBoundingClientRect();
    var sc = mr.width / main.offsetWidth;
    return { x: (r.left - mr.left) / sc + r.width / (2 * sc), y: (r.top - mr.top) / sc + r.height / (2 * sc), w: r.width / sc, h: r.height / sc };
  }

  /* ---------- custom solo control bar ---------- */
  var bar = document.createElement('div'); bar.id = 'v16-bar';
  var barTag = document.createElement('span'); barTag.className = 'tag'; bar.appendChild(barTag);
  function mkField(key, label) {
    var f = document.createElement('div'); f.className = 'fld'; f.dataset.k = key;
    var k = document.createElement('span'); k.className = 'k'; k.textContent = label;
    var v = document.createElement('span'); v.className = 'v'; v.textContent = '—';
    f.appendChild(k); f.appendChild(v);
    return { el: f, val: v };
  }
  var fLoopA = mkField('a', '起点'), fLoopB = mkField('b', '终点');
  var fSpeed = mkField('s', '速率'), fPitch = mkField('p', '音高');
  var sepHolder = [];
  var tickBox = document.createElement('div'); tickBox.className = 'mini-tick';
  for (var ti = 0; ti < 14; ti++) tickBox.appendChild(document.createElement('i'));
  var ticks = Array.prototype.slice.call(tickBox.children);
  [fLoopA, fLoopB, fSpeed, fPitch].forEach(function (f) { bar.appendChild(f.el); f.el.dataset.k = f.el.dataset.k; });
  bar.appendChild(tickBox);
  main.appendChild(bar);

  function readText(id, fallback) {
    var el = document.getElementById(id);
    var s = el ? String(el.textContent || '').trim() : '';
    return s || fallback;
  }
  function setField(f, on, txt) { f.el.classList.toggle('on', !!on); if (txt != null) f.val.textContent = txt; }

  function barAt(st, t) {
    bar.style.display = 'flex';
    if (st.mode === 'loop') {
      barTag.textContent = '循环区间';
      fLoopA.el.style.display = ''; fLoopB.el.style.display = '';
      fSpeed.el.style.display = 'none'; fPitch.el.style.display = 'none';
      var a = readText('loop-start', '0:12.000'), b = readText('loop-end', '0:18.000');
      if (!/[0-9]/.test(a)) a = '0:12.000';
      if (!/[0-9]/.test(b)) b = '0:18.000';
      var phase = st.q < 1.6 ? 0 : (st.q < 3.2 ? 1 : 0);
      setField(fLoopA, phase === 0, a); setField(fLoopB, phase === 1, b);
      return phase === 0 ? fLoopA.el : fLoopB.el;
    }
    barTag.textContent = '速率 · 音高';
    fSpeed.el.style.display = ''; fPitch.el.style.display = '';
    fLoopA.el.style.display = 'none'; fLoopB.el.style.display = 'none';
    var sp = readText('speed-number', '100%'), pi = readText('pitch-number', '+0');
    var ph = st.q < 2.4 ? 0 : (st.q < 4.2 ? 1 : 0);
    setField(fSpeed, ph === 0, sp); setField(fPitch, ph === 1, pi);
    return ph === 0 ? fSpeed.el : fPitch.el;
  }

  /* ---------- dynamic chapter background ---------- */
  function chapterBG(t, kind) {
    var h = (t * 7) % 360;
    if (kind === 'eq') return 'radial-gradient(ellipse at 50% 46%,#101013 0%,#08080a 62%,#000 100%)';
    return 'radial-gradient(circle at ' + (50 + 12 * Math.sin(t * .5)) + '% ' + (46 + 10 * Math.cos(t * .43)) + '%,hsl(' + h + ' 88% 62% / .34),transparent 58%),' +
           'linear-gradient(' + (118 + 14 * Math.sin(t * .21)) + 'deg,hsl(' + ((h + 40) % 360) + ' 80% 30%),hsl(' + ((h + 200) % 360) + ' 85% 22%))';
  }

  /* ---------- solo lens chapters ---------- */
  function soloState(t) {
    if (t >= 18.1 && t < 23.2) return { mode: 'loop', q: t - 18.1, dur: 5.1 };
    if (t >= 23.2 && t < 28.8) return { mode: 'speed', q: t - 23.2, dur: 5.6 };
    return null;
  }

  function applySolo(t, st) {
    var target = barAt(st, t);
    app.classList.add('v16-solo');
    app.setAttribute('data-solo', st.mode);
    var el = target;
    var c = centerInMain(el);
    var size = st.mode === 'loop' ? 520 : 440;
    lens.style.display = 'block';
    lens.style.width = px(size); lens.style.height = px(size);
    var lift = st.mode === 'loop' ? 300 : 280;
    lens.style.left = px(c.x - size / 2); lens.style.top = px(c.y - size / 2 - lift);
    lensCap.textContent = st.mode === 'loop' ? '循环区间 · 放大' : '速率 / 音高 · 放大';
    var txt = (el.querySelector ? (el.querySelector('.v') || el).textContent : el.textContent) || '';
    lensVal.textContent = String(txt).trim() || (st.mode === 'loop' ? '0:12.000' : '84%');
    lensVal.style.fontSize = (st.mode === 'loop' ? 82 : 92) + 'px';
    lensSub.textContent = st.mode === 'loop' ? '只放大这一段' : '一点点推上去';
  }

  function clearSolo() {
    bar.style.display = 'none';
    app.classList.remove('v16-solo');
    app.removeAttribute('data-solo');
    lens.style.display = 'none';
    var hot = document.querySelectorAll('.v16-hot');
    for (var i = 0; i < hot.length; i++) hot[i].classList.remove('v16-hot');
  }

  /* ---------- mini spectrum ---------- */
  var miniBars = miniEq ? Array.prototype.slice.call(miniEq.children) : [];
  function paintMini(t) {
    if (miniEq) miniEq.style.display = 'none';
    var f = waveAt(t), wave = f && f.wave ? f.wave : [];
    var en = 0, n = 0;
    for (var i = 0; i < wave.length; i += 4) { en += Math.abs(wave[i] || 0); n++; }
    en = Math.min(1, (n ? en / n : 0) / .42);
    aura.style.display = 'block';
    aura.style.opacity = (0.16 + 0.34 * en).toFixed(3);
    aura.style.transform = 'translate(-50%,-50%) scale(' + (1 + .06 * en).toFixed(3) + ') rotate(' + (2.2 * Math.sin(t * .7)).toFixed(2) + 'deg)';
  }
  function unpaintMini() {
    if (miniEq) miniEq.classList.remove('v16-live');
    if (miniEq) miniEq.style.display = 'none';
    if (aura) aura.style.display = 'none';
  }

  /* ---------- promo reel inside the video frame ---------- */
  var promo = document.createElement('div'); promo.id = 'v16-promo';
  promo.innerHTML =
    '<div class="scene s1"><div class="fan">' +
      '<img src="assets/01-diy-vector.svg" style="transform:translate(-190px,26px) rotate(-13deg)">' +
      '<img src="assets/02-diy-vector.svg" style="transform:translate(0,0) rotate(0deg) scale(1.06)">' +
      '<img src="assets/04-diy-vector.svg" style="transform:translate(190px,26px) rotate(13deg)"></div>' +
      '<div class="cap-t">琉璃 · 干净的音乐播放器</div></div>' +
    '<div class="scene s2"><div class="eqrow"></div><div class="cap-t" style="bottom:40px">每个频段，都能单独调</div></div>' +
    '<div class="scene s3"><div class="mini"><img src="assets/05-diy-vector.svg">' +
      '<div><div class="t">光影之间</div><div class="s">李祥霆 · 原创片段</div></div></div></div>' +
    '<div class="scene s4"><div class="word"><b>琉璃</b><span>AUDIO PLAYER FOR MAC</span></div></div>';
  if (videoStage) videoStage.appendChild(promo);
  var scenes = Array.prototype.slice.call(promo.querySelectorAll('.scene'));
  var eqRow = promo.querySelector('.eqrow');
  for (var ei = 0; ei < 28; ei++) { eqRow.appendChild(document.createElement('i')); }
  var eqBars = Array.prototype.slice.call(eqRow.children);
  var promoOn = false;

  function promoAt(t) {
    var q = clamp((t - 38) / 13.4);
    var idx = Math.min(3, Math.floor(q * 4));
    var local = q * 4 - idx;
    for (var i = 0; i < scenes.length; i++) {
      var on = i === idx;
      var fadeIn = on ? sstep(clamp(local / .16)) : 0;
      var fadeOut = on ? 1 - sstep(clamp((local - .84) / .16)) : 0;
      scenes[i].style.opacity = String(Math.min(fadeIn, fadeOut));
      scenes[i].style.transform = 'scale(' + (1.02 + .07 * local).toFixed(4) + ') translateY(' + (-14 * local).toFixed(1) + 'px)';
      scenes[i].style.display = on ? 'flex' : 'none';
    }
    var fanImgs = promo.querySelectorAll('.s1 .fan img');
    for (var fi = 0; fi < fanImgs.length; fi++) {
      var base = fi === 0 ? -190 : (fi === 1 ? 0 : 190);
      var rot = fi === 0 ? -13 : (fi === 1 ? 0 : 13);
      fanImgs[fi].style.transform = 'translate(' + (base + 16 * Math.sin(t * .8 + fi)) + 'px,' + (26 + 10 * Math.cos(t * .6 + fi)) + 'px) rotate(' + (rot + 2.4 * Math.sin(t * .7 + fi)) + 'deg)' + (fi === 1 ? ' scale(1.06)' : '');
    }
    var f = waveAt(t), wave = f && f.wave ? f.wave : [];
    for (var b = 0; b < eqBars.length; b++) {
      var v = wave.length ? Math.abs(wave[Math.floor(b * wave.length / eqBars.length)] || 0) : .3;
      eqBars[b].style.height = (18 + 200 * Math.pow(Math.min(1, v * 5.5), 1.2)) + 'px';
      eqBars[b].style.background = 'linear-gradient(180deg,hsl(' + (340 + b * 3) + ' 95% 72%),hsl(' + (18 + b * 4) + ' 92% 56%))';
    }
  }

  /* ---------- end card timing: +0.5s hold, 0.5s to black ---------- */
  function endcardAt(t) {
    if (!endSvg) return;
    if (t < 64.0) return;
    var inK = sstep((t - 64.5) / .5);
    var outK = 1 - sstep((t - 69.0) / .5);
    var k = Math.min(inK, outK);
    endSvg.style.opacity = String(k);
    if (endMesh) endMesh.style.opacity = String(Math.min(1, inK) * outK);
  }

  /* ---------- main per-frame ---------- */
  var RATIO_SWITCH = [38.02, 39.5, 40.5, 41.4, 47.06, 48.06, 48.86, 49.41];
  function ratioWindow(t) {
    for (var i = 0; i < RATIO_SWITCH.length; i++) {
      if (t >= RATIO_SWITCH[i] && t < RATIO_SWITCH[i] + .62) return true;
    }
    return false;
  }

  function v16(t) {
    if (pitch) pitch.style.display = 'none';
    var st = soloState(t);
    if (st) {
      applySolo(t, st);
      if (stage) stage.style.background = chapterBG(t, 'lens');
    } else {
      clearSolo();
    }

    if (t >= 14.8 && t < 18.1) paintMini(t); else unpaintMini();

    if (t >= 28.8 && t < 37.0) {
      if (stage) stage.style.background = 'radial-gradient(ellipse at 50% 46%,#0d0d10 0%,#060608 58%,#000 100%)';
      app.classList.add('v16-night');
      app.style.setProperty('background', '#000', 'important');
      app.style.setProperty('border', '0', 'important');
      app.style.setProperty('box-shadow', 'none', 'important');
      var fr = document.getElementById('v14-frame');
      if (fr) fr.style.display = 'none';
      var ambient = document.getElementById('ambient');
      if (ambient) ambient.style.setProperty('display', 'none', 'important');
      if (eqPanel) {
        eqPanel.style.setProperty('background', '#000', 'important');
        eqPanel.style.setProperty('border', '0', 'important');
        eqPanel.style.setProperty('border-radius', '18px', 'important');
        eqPanel.style.setProperty('box-shadow', 'none', 'important');
      }
      if (waveBox) waveBox.style.display = 'none';
    } else {
      app.classList.remove('v16-night');
      if (app.style.background) app.style.removeProperty('background');
      if (app.style.border) app.style.removeProperty('border');
      if (app.style.boxShadow) app.style.removeProperty('box-shadow');
      var amb2 = document.getElementById('ambient');
      if (amb2) amb2.style.removeProperty('display');
      var fr2 = document.getElementById('v14-frame');
      if (fr2) fr2.style.display = '';
    }

    var ratioEl = document.getElementById('v14-ratio');
    if (ratioEl) {
      if (!ratioWindow(t)) ratioEl.style.display = 'none';
      else if (t >= 38 && t < 51.4) { ratioEl.style.fontSize = '54px'; ratioEl.style.top = '16%'; }
    }

    var sub = document.getElementById('media-subtitle-v7');
    if (sub) sub.style.display = (t >= 38 && t < 51.4) ? 'none' : '';

    var inVideo = t >= 38 && t < 51.4;
    promo.style.display = inVideo ? 'block' : 'none';
    if (gv) gv.style.opacity = inVideo ? '0' : '';
    if (inVideo) promoAt(t);

    if (t >= 59.6 && t < 64.5 && stage) {
      stage.style.background = 'radial-gradient(ellipse at 50% 62%,#2a0a14 0%,#12060a 46%,#000 100%)';
    }

    endcardAt(t);

    /* intro keeps moving: slow push-in, carousel drift, one soft light pass */
    if (t >= 4 && t < 7.98 && titleStage) {
      var drift = 1.05 * (t - 4);
      var base = (window.__filmState && window.__filmState.carouselPosition) || 0;
      try { layoutCards(2, geometry(), base + drift, 1); } catch (e) {}
      main.style.transform = 'translate(' + px(-6 * sstep((t - 4) / .8)) + ',' + px(-3 * sstep((t - 4) / .8)) + ') scale(' + (2 + .055 * sstep((t - 4) / 3.9)).toFixed(4) + ')';
    }
  }

  window.seek = function (t) { prevSeek(t); v16(t); };
})();
