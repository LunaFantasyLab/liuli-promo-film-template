/* v14 restrained motion pass — light, focus and typography instead of props.
   Wraps the approved v11.2 renderer after it. Locked timing (69.5s) and native
   product structure untouched; delete this file + its two tags in index.html to
   return to v11.2. */
(function(){
  if (window.__v14) return; window.__v14 = true;

  var V = { t: 0 };
  var baseRender = v11Render, basePalette = v5Palette, baseGeometry = geometry, baseDraw = drawOriginalVideo;
  var main = document.getElementById('main');
  var app  = document.getElementById('app');
  var titleStage = document.getElementById('v7-title-stage');
  /* audioAnalysis is a lexical binding in ui-film.js filled by fetch later;
     read it live instead of capturing the still-empty array at load time. */
  function audioData(){ return (typeof audioAnalysis !== 'undefined' && audioAnalysis) || []; }

  function mk(tag, cls, parent){ var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function sstep(x){ x = clamp(x); return x * x * (3 - 2 * x); }
  function px(v){ return (Math.round(v * 100) / 100) + 'px'; }
  function clearBubble(){
    var b = document.querySelectorAll('#bands .value-bubble');
    for (var i = 0; i < b.length; i++) if (b[i].style.opacity === '0') b[i].style.opacity = '';
  }

  /* ---------- injected layers ---------- */
  var sweep = mk('div', '', main); sweep.id = 'v14-sweep';
  var minieq = mk('div', '', main); minieq.id = 'v14-minieq';
  var miniBars = []; for (var i = 0; i < 24; i++) miniBars.push(mk('i', '', minieq));
  var flash = mk('div', '', document.body); flash.id = 'v14-flash';
  var shock = mk('div', '', document.body); shock.id = 'v14-shock';
  shock.innerHTML = '<i class="ring"></i><i class="ring two"></i><span class="burst"></span>';
  (function () {
    var burst = shock.querySelector('.burst');
    for (var bi = 0; bi < 12; bi++) {
      var ln = document.createElement('i');
      ln.style.transform = 'rotate(' + (bi * 30) + 'deg)';
      burst.appendChild(ln);
    }
  })();
  var frame = mk('div', '', app); frame.id = 'v14-frame';
  ['tl','tr','bl','br'].forEach(function(c){ mk('span', 'c ' + c, frame); });
  var ratioLabel = mk('span', '', frame); ratioLabel.id = 'v14-ratio';
  var spot = mk('div', '', app); spot.id = 'v14-spot';
  var readout = mk('div', '', app); readout.id = 'v14-readout';
  var eqPanel = document.getElementById('eq-panel');
  var waveBox = mk('div', '', app); waveBox.id = 'v14-wave';
  var waveCanvas = mk('canvas', '', waveBox); waveCanvas.width = 1800; waveCanvas.height = 116;
  var waveCtx = waveCanvas.getContext('2d');

  /* ---------- 1) palette: smooth crossfade while the cards accelerate ---------- */
  v5Palette = function(){
    var p = basePalette.apply(this, arguments);
    if (V.t >= 59.6 && V.t < 64.5) {
      var roll = 4 + 19 * Math.pow(clamp((V.t - 59.7) / 4.3), 2.4);
      var pos = roll - 4, idx = Math.floor(pos + 1e-9), frac = pos - idx;
      var k = sstep((frac - .58) / .42);
      var A = themeById[V11_NATIVE_ORDER[idx % V11_NATIVE_ORDER.length]].palette;
      var B = themeById[V11_NATIVE_ORDER[(idx + 1) % V11_NATIVE_ORDER.length]].palette;
      p = Object.assign({}, p, { colors: A.map(function(c, j){
        return color(String(c).replace(/^#/, ''), String(B[j] || c).replace(/^#/, ''), k);
      })});
    }
    return p;
  };

  /* ---------- 2) geometry: the window becomes the frame, no bezel ---------- */
  geometry = function(){
    var g = baseGeometry.apply(this, arguments);
    if (V.t >= 59.6) {
      var k = sstep((V.t - 59.6) / 1.2);
      g.w = mix(1180, 1315.5556, k);
      g.h = 740;
      g.scale = mix(1.0378, 1.4594595, k);
      g.x = (1920 - g.w * g.scale) / 2;
      g.y = (1080 - g.h * g.scale) / 2;
      g.f = 1;
    }
    return g;
  };

  /* ---------- 3) video footage: a slow travelling light, nothing else ---------- */
  drawOriginalVideo = function(){
    baseDraw.apply(this, arguments);
    var cv = document.getElementById('glass-video'); if (!cv) return;
    var c = cv.getContext('2d'); if (!c) return;
    var w = cv.width, h = cv.height, t = V.t, r = h / 720;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'screen';

    /* a wide warm highlight drifting across the glass */
    var hx = w * (.28 + .24 * Math.sin(t * .21)), hy = h * (.38 + .1 * Math.cos(t * .17));
    var g1 = c.createRadialGradient(hx, hy, 0, hx, hy, w * .62);
    g1.addColorStop(0, 'rgba(255,246,238,.20)');
    g1.addColorStop(.45, 'rgba(255,214,224,.09)');
    g1.addColorStop(1, 'rgba(255,200,215,0)');
    c.fillStyle = g1; c.fillRect(0, 0, w, h);

    /* a cool shade sweeping the other way, gives the surface depth */
    c.globalCompositeOperation = 'multiply';
    var sx = w * (.72 - .3 * Math.sin(t * .16 + 1.1));
    var g2 = c.createLinearGradient(sx - w * .45, 0, sx + w * .45, h);
    g2.addColorStop(0, 'rgba(255,255,255,1)');
    g2.addColorStop(.5, 'rgba(150,96,128,.92)');
    g2.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = g2; c.fillRect(0, 0, w, h);

    /* gentle breathing of the whole surface */
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = 'rgba(255,255,255,' + (0.012 + 0.012 * Math.sin(t * 1.05)).toFixed(4) + ')';
    c.fillRect(0, 0, w, h);
    c.restore();
  };

  /* ---------- 4) render entry ----------
     The opening assembly used to fill a full 8s with very little on screen for
     the first five. It now runs at twice the speed and lands complete by ~4s;
     the remaining seconds keep the window alive with a slow sway. */
  v11Render = function(t){
    V.t = t;
    baseRender(t < 8 ? Math.min(2 * t, 7.999) : t);
    post(t);
  };
  window.seek = function(t){ window.__timelines.main.time(t, true); v11Render(t); };

  /* ---------- helpers for additive transforms ---------- */
  var driftOn = false, kickSuffix = '', cardSuffix = new Map();
  function addSuffix(el, suffix, storeKey){
    var prev = cardSuffix.get(el);
    if (prev && el.style.transform && el.style.transform.slice(-prev.length) === prev) {
      el.style.transform = el.style.transform.slice(0, -prev.length);
    }
    if (suffix) { el.style.transform = (el.style.transform || '') + suffix; cardSuffix.set(el, suffix); }
    else if (prev) { cardSuffix.delete(el); }
  }

  /* ---------- 5) per-frame post pass ---------- */
  function post(t){
    /* --- tail state --- */
    var tail = t >= 59.6;
    main.classList.toggle('v14-tail', tail);
    var stage10 = document.getElementById('v10-stage');
    if (stage10) stage10.classList.toggle('v14-stage-off', tail);
    if (app) {
      app.style.borderRadius = tail ? '0px' : '';
      app.style.border = tail ? 'none' : '';
      app.style.boxShadow = tail ? 'none' : '';
    }
    var traffic = document.getElementById('traffic');
    if (traffic && tail) traffic.style.opacity = '0';

    /* --- intro: assembly finishes early, then a quiet drift --- */
    if (t >= 4 && t < 7.98) {
      var dx = Math.sin((t - 4) * .8) * 2.4, dy = Math.cos((t - 4) * .62) * 1.8;
      main.style.transform = 'translate(' + px(dx) + ',' + px(dy) + ') scale(2)';
      driftOn = true;
      var car = document.getElementById('carousel');
      if (car) car.style.transform = 'translate3d(' + px(Math.sin((t - 4) * .55) * 7) + ',' + px(Math.cos((t - 4) * .41) * 4) + ',0)';
    } else if (driftOn) {
      main.style.transform = 'scale(2)';
      var car2 = document.getElementById('carousel');
      if (car2) car2.style.transform = '';
      driftOn = false;
    }

    /* --- 8s: one light sweep --- */
    if (t >= 7.5 && t <= 8.4) {
      var u = clamp((t - 7.5) / .9), e = sstep(u);
      sweep.style.display = 'block';
      sweep.style.transform = 'translateX(' + px(-620 + e * 2720) + ') skewX(-9deg)';
      sweep.style.opacity = String(.30 + .70 * Math.sin(Math.PI * u));
    } else {
      sweep.style.display = 'none';
    }

    /* --- title lines: mask-like rise, per line --- */
    if (titleStage && titleStage.style.display !== 'none' && t >= 7.98 && t < 9.4) {
      var lines = titleStage.querySelectorAll('.v9-type');
      for (var li = 0; li < lines.length; li++) {
        var lp = clamp((t - 8.0 - li * .075) / .34), le = sstep(lp);
        lines[li].style.opacity = String(le);
        lines[li].style.transform = 'translateY(' + px(13 * (1 - le)) + ')';
      }
    } else if (titleStage && t >= 9.4) {
      var done = titleStage.querySelectorAll('.v9-type');
      for (var di = 0; di < done.length; di++) { done[di].style.opacity = ''; done[di].style.transform = ''; }
    }

    /* --- appreciation frame: breathing --- */
    var appr = document.getElementById('appreciation-v7');
    if (appr) {
      if (t >= 9 && t < 13.8) {
        var breath = Math.sin((t - 9) * 2 * Math.PI / 3.6);
        appr.style.transform = 'scale(' + (1 + .0038 * breath).toFixed(5) + ')';
        appr.style.boxShadow = '0 ' + (34 + 6 * breath).toFixed(0) + 'px 80px rgba(0,0,0,' + (.30 + .03 * breath).toFixed(3) + ')';
      } else { appr.style.transform = ''; appr.style.boxShadow = ''; }
    }

    /* --- mini window: low-frequency bars behind it --- */
    if (t >= 14.8 && t < 18.1) {
      minieq.style.display = 'flex';
      for (var bi = 0; bi < miniBars.length; bi++) {
        var mv = .5 + .5 * Math.sin(t * 1.15 + bi * .55) * Math.cos(t * .37 + bi * .21);
        miniBars[bi].style.height = (60 + 288 * clamp(mv * .92)) + 'px';
      }
    } else minieq.style.display = 'none';

    /* --- eq chapter: spotlight on the band being moved + synced waveform --- */
    var bandsEl = document.getElementById('bands');
    var eqOn = t >= 28.8 && t < 37.0;
    var activeFader = eqOn ? document.querySelector('#bands .fader.dragging') : null;
    if (eqOn) {
      waveBox.style.display = 'block';
      drawWave(t);
      if (activeFader && bandsEl) {
        bandsEl.classList.add('v14-dim');
        var all = bandsEl.querySelectorAll('.fader');
        for (var fi = 0; fi < all.length; fi++) all[fi].classList.toggle('v14-focus', all[fi] === activeFader);
        var ar = activeFader.getBoundingClientRect(), rr = app.getBoundingClientRect();
        var q = rr.width / (app.offsetWidth || 1) || 1;
        var cx = (ar.left - rr.left) / q + (ar.width / q) / 2;
        var top = (ar.top - rr.top) / q;
        var handle = activeFader.querySelector('.handle');
        var hy = handle ? handle.offsetTop : 140;
        spot.style.display = 'block';
        spot.style.left = px(cx - 350);
        spot.style.top = px(top + hy - 350);
        var bubble = activeFader.querySelector('.value-bubble');
        if (bubble) bubble.style.opacity = '0';
        readout.style.display = 'block';
        readout.textContent = bubble ? bubble.textContent.trim() : '';
        readout.style.left = px(cx + 22);
        readout.style.top = px(top + hy - 34);
      } else {
        if (bandsEl) bandsEl.classList.remove('v14-dim');
        if (bandsEl) bandsEl.querySelectorAll('.fader').forEach(function(f){ f.classList.remove('v14-focus'); });
        spot.style.display = 'none'; readout.style.display = 'none';
      }
    } else {
      if (bandsEl) bandsEl.classList.remove('v14-dim');
      if (bandsEl) bandsEl.querySelectorAll('.fader').forEach(function(f){ f.classList.remove('v14-focus'); });
      spot.style.display = 'none'; readout.style.display = 'none'; waveBox.style.display = 'none';
      clearBubble();
    }

    /* --- zero claims · D2 white (Apple-leaning), no footnote --- */
    if (t >= 51.4 && t < 53.05) {
      var stage = document.getElementById('v7-title-stage');
      if (stage) {
        var q = Math.max(0, Math.min(1.65, t - 51.4));
        var kOut = 1 - sstep((q - 1.46) / .20);
        var tcMatch = (location.search.match(/[?&]tc=([^&]+)/) || [])[1];
        var tcRaw = tcMatch ? decodeURIComponent(tcMatch) : 'graphite';
        var mixedAccent = (tcRaw === 'mixed');
        var ink = mixedAccent ? '#1D1D1F' : (tcRaw.charAt(0) === '#' ? tcRaw : ({navy:'#1B2B45', graphite:'#1D1D1F', blue:'#0071E3'}[tcRaw] || '#1B2B45'));
        stage.classList.add('v14-claim');
        stage.style.background = 'linear-gradient(180deg,#FFFFFF 0%,#FBFBFD 62%,#F6F7F9 100%)';
        stage.style.opacity = '1';

        var th = stage.querySelector('h1');
        var rule = document.getElementById('v14-claim-rule');
        var mark = document.getElementById('v14-claim-mark');
        var blue = document.getElementById('v14-claim-blue');
        var sub = document.getElementById('v14-claim-sub');
        if (!rule) {
          rule = mk('div', '', stage); rule.id = 'v14-claim-rule';
          blue = mk('div', '', stage); blue.id = 'v14-claim-blue';
          mark = mk('div', '', stage); mark.id = 'v14-claim-mark'; mark.textContent = '0';
          sub = mk('div', '', stage); sub.id = 'v14-claim-sub';
        }
        rule.style.cssText = 'position:absolute;left:176px;top:236px;width:1180px;height:1px;background:rgba(0,0,0,.10);opacity:' + (clamp(q / .18) * kOut).toFixed(3);
        mark.style.display = 'none';
        blue.style.cssText = 'position:absolute;left:176px;top:235px;width:68px;height:2px;background:#0071E3;transform:scaleX(' + clamp((q - .05) / .22).toFixed(3) + ');transform-origin:left center;opacity:' + kOut.toFixed(3);
        sub.style.display = 'none';

        if (th) {
          th.style.visibility = 'visible';
          th.style.cssText += ';display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;position:absolute;left:176px;top:268px;width:auto;height:auto;inset:auto;gap:0;opacity:1;transform:none';
          var spans = th.querySelectorAll('span');
          for (var ci = 0; ci < spans.length && ci < 3; ci++) {
            var sp = spans[ci];
            var pgs = clamp((q - (.10 + ci * .09)) / .42);
            sp.style.position = 'static';
            sp.style.display = 'block';
            sp.style.left = 'auto'; sp.style.top = 'auto';
            sp.style.fontSize = '172px';
            sp.style.lineHeight = '1.13';
            sp.style.fontWeight = '700';
            sp.style.letterSpacing = '-0.012em';
            sp.style.margin = '0';
            sp.style.color = ink;
            sp.style.webkitTextStroke = '0';
            sp.style.textShadow = 'none';
            sp.style.opacity = (pgs * kOut).toFixed(3);
            sp.style.transform = 'translateY(' + ((1 - pgs) * 24).toFixed(2) + 'px)';
            var tx = sp.textContent;
            if (tx.indexOf('\u00b7') >= 0) tx = tx.replace(/\s*\u00b7\s*$/, '');
            if (mixedAccent) sp.innerHTML = '<span style="color:#0071E3">' + tx.charAt(0) + '</span>' + tx.slice(1);
            else sp.textContent = tx;
          }
        }
      }
    } else {
      var st = document.getElementById('v7-title-stage');
      if (st) {
        st.classList.remove('v14-claim');
        st.style.opacity = '';
        var h1e = st.querySelector('h1');
        if (h1e && t >= 53.05 && t < 54.6) h1e.style.visibility = 'hidden';
        if (st.style.background.indexOf('FFFFFF') >= 0) st.style.background = '';
        ['v14-claim-rule', 'v14-claim-blue', 'v14-claim-mark', 'v14-claim-sub'].forEach(function (id) {
          var el2 = document.getElementById(id);
          if (el2) el2.style.display = 'none';
        });
      }
    }

    /* --- endcard: bright, two-tone gradient; a touch heavier and larger type --- */
    if (t >= 64.5) {
      var card = document.getElementById('v91-endcard');
      var mesh = document.getElementById('v91-end-mesh');
      if (card) card.style.backgroundColor = '#000000';
      if (mesh) mesh.style.background = 'radial-gradient(ellipse at 50% 43%,#191919 0%,#0b0b0b 40%,#000000 100%)';
      var svg = card && card.querySelector('svg');
      if (svg && svg.dataset.v14 !== '1') {
        svg.dataset.v14 = '1';
        svg.innerHTML = '<text x="1920" y="1157.5" text-anchor="middle" style="font-family:LiuliSans,sans-serif;font-weight:800;font-size:240px;letter-spacing:27px;fill:#ffffff;stroke:#ffffff;stroke-width:12px;paint-order:stroke">TANCO STUDIO</text>';
      }
      var glow = document.getElementById('v14-glow');
      if (card && !glow) {
        glow = mk('div', '', card); glow.id = 'v14-glow';
        card.insertBefore(glow, card.firstChild);
      }
      if (glow) {
        var kCard = 1 - sstep((t - 69) / .5);
        glow.style.opacity = ((.58 + .24 * Math.sin(t * 1.55)) * kCard).toFixed(3);
        glow.style.transform = 'translate(-50%,-50%) scale(' + (1 + .035 * Math.sin(t * 1.05)).toFixed(4) + ')';
      }
      if (svg) svg.style.filter = 'drop-shadow(0 0 ' + (17 + 6 * Math.sin(t * 1.3)).toFixed(1) + 'px rgba(255,255,255,' + (.34 + .11 * Math.sin(t * 1.3)).toFixed(2) + '))';
    }

    /* --- speed / pitch: lift the block, keep the value readable --- */
    var speed = document.getElementById('speed-panel');
    if (speed) speed.classList.toggle('v14-mag', t >= 23.2 && t < 27.8);

    /* --- ratio: measurement frame follows the picture box --- */
    var canvas = document.getElementById('glass-video');
    if (canvas && app && t >= 38 && t <= 51.4) {
      var cr = canvas.getBoundingClientRect(), ar2 = app.getBoundingClientRect();
      var k2 = ar2.width / (app.offsetWidth || 1) || 1;
      var tx = (cr.left - ar2.left) / k2, ty = (cr.top - ar2.top) / k2;
      var tw = cr.width / k2, th = cr.height / k2;
      smoothFrame(t, tx, ty, tw, th);
      var aspect = cr.width / cr.height;
      ratioLabel.textContent = Math.abs(aspect - 16/9) < .03 ? '16 : 9'
        : Math.abs(aspect - 21/9) < .04 ? '21 : 9'
        : Math.abs(aspect - 4/3) < .03 ? '4 : 3'
        : Math.abs(aspect - 2.35) < .045 ? '2.35 : 1' : '16 : 9';
      frame.style.display = 'block';
    } else frame.style.display = 'none';

    /* --- nine cards: each ad gets an iPhone frame plus its own micro-animation --- */
    var ann = document.getElementById('v8-annoyances');
    if (ann && t >= 53.0 && t < 58.6 && ann.style.display !== 'none') {
      var AD_LAYOUT = {
        '强制更新': '<div class="ad-dim"></div><div class="ad-modal"><div class="ad-ico">↻</div><div class="ad-t">发现新版本</div><div class="ad-s"><b class="ad-count">9</b> 秒后必须更新</div><div class="ad-btn">立即更新</div></div>',
        '开屏广告': '<div class="ad-splash"><div class="ad-skip">跳过 <b class="ad-skipn">5</b></div><div class="ad-brand">开屏广告</div><div class="ad-splashbar"><i></i></div></div>',
        '摇一摇': '<div class="ad-shake"><div class="ad-phone"><i class="ad-arc l"></i><i class="ad-arc r"></i></div><div class="ad-shake-t">摇一摇</div><div class="ad-shake-s">晃一晃 · 立即跳转</div></div>',
        '弹窗广告': '<div class="ad-dim"></div><div class="ad-pop"><b class="ad-x">×</b><div class="ad-t">限时优惠</div><div class="ad-s">关闭后还会再弹一次</div><div class="ad-btn sm">立即领取</div></div>',
        '借贷': '<div class="ad-loan"><div class="ad-k">最高可借</div><div class="ad-v">¥200,000</div><div class="ad-s">日息 0.02% 起 · 秒批</div><div class="ad-b">立即借款</div></div>',
        '自动扣费': '<div class="ad-charge"><div class="ad-ch">自动扣费</div><div class="ad-cv">−¥98.00</div><div class="ad-rule"></div><div class="ad-cr">会员自动续费 · 今早 08:20</div></div>',
        '积分套路': '<div class="ad-points"><div class="ad-coin">★</div><div class="ad-pt">还差 1 积分</div><div class="ad-ps">抽一次 · 100% 中奖</div></div>',
        '打卡任务': '<div class="ad-check"><div class="ad-ch">每日打卡</div><div class="ad-days"><i class="on">1</i><i class="on">2</i><i class="on">3</i><i class="on">4</i><i class="on">5</i><i class="on">6</i><i>7</i></div><div class="ad-cs">连续 6 天 · 还差 1 天</div></div>',
        '折扣套路': '<div class="ad-deal"><div class="ad-badge">限时</div><div class="ad-dv"><s class="ad-old">¥39</s><span class="ad-new">¥59</span></div><div class="ad-ds">广告价 39，结算 59</div></div>'
      };
      var cs2 = ann.querySelectorAll('.nuisance');
      for (var ci = 0; ci < cs2.length; ci++) {
        var card = cs2[ci];
        if (!card.__ph) {
          var scr = document.createElement('div'); scr.className = 'v14-ph-screen';
          while (card.firstChild) scr.appendChild(card.firstChild);
          card.appendChild(scr);
          ['v14-ph-island', 'v14-ph-home', 'v14-ph-flash', 'v14-ph-pop',
           'v14-ph-tick', 'v14-ph-check', 'v14-ph-coin'].forEach(function (cls) {
            var e = document.createElement('i'); e.className = cls; card.appendChild(e);
          });
          card.__ph = 1;
        }
        var nm = card.getAttribute('data-label') || '';
        if (!card.__ad) {
          var scr0 = card.querySelector('.v14-ph-screen');
          if (scr0) {
            var defs = scr0.children;
            for (var di = 0; di < defs.length; di++) defs[di].style.display = 'none';
            var body = document.createElement('div'); body.className = 'ad-body';
            body.innerHTML = AD_LAYOUT[nm] || '';
            scr0.appendChild(body);
            ['v14-ph-flash','v14-ph-pop','v14-ph-tick','v14-ph-check','v14-ph-coin','v14-ph-island','v14-ph-home','nag-progress'].forEach(function (cls) {
              card.querySelectorAll('.' + cls).forEach(function (e2) { e2.style.display = 'none'; });
            });
          }
          card.__ad = 1;
        }
        var ad = card.querySelector('.ad-body');
        var q1 = function (sel) { return ad ? ad.querySelector(sel) : null; };
        var age = Math.max(0, t - 53.05);
        var phFlash = card.querySelector('.v14-ph-flash'), phPop = card.querySelector('.v14-ph-pop'),
            phTick = card.querySelector('.v14-ph-tick'), phChk = card.querySelector('.v14-ph-check'),
            phCoin = card.querySelector('.v14-ph-coin'), phProg = card.querySelector('.nag-progress');
        card.style.rotate = ''; card.style.translate = '';
        if (nm === '摇一摇' || nm === '折扣套路') {
          var amp = nm === '摇一摇' ? 2.2 : 1.1;
          card.style.rotate = (Math.sin(t * (nm === '摇一摇' ? 21 : 9.5)) * amp).toFixed(2) + 'deg';
          if (nm === '摇一摇') card.style.translate = (Math.sin(t * 21 + 1.2) * 2.4).toFixed(2) + 'px 0';
        }
        if (nm === '开屏广告' || nm === '强制更新') {
          var f = Math.max(0, Math.sin(t * 2.1 + (nm === '开屏广告' ? 0 : 1.7)));
          if (phFlash) phFlash.style.opacity = (nm === '开屏广告' ? .40 * f : .16 * f).toFixed(3);
          if (phProg) {
            var pc = nm === '开屏广告' ? (52 + 42 * Math.abs(Math.sin(t * 1.25)))
                                       : (14 + 80 * ((t * 0.42) % 1));
            phProg.style.width = pc.toFixed(0) + '%';
          }
        }
        if (nm === '弹窗广告' || nm === '借贷') {
          var u = (t * (nm === '借贷' ? .55 : .7) + (nm === '借贷' ? .35 : 0)) % 1;
          var lift = u < .5 ? u * 2 : (1 - u) * 2;
          if (phPop) {
            phPop.style.opacity = (.9 * Math.min(1, lift * 2.6)).toFixed(3);
            phPop.style.transform = 'translateY(' + (-4 - 46 * lift).toFixed(1) + 'px)';
          }
        }
        if (nm === '自动扣费' && phTick) {
          if (phTick.textContent !== '−¥98') phTick.textContent = '−¥98';
          var u2 = (t * .72) % 1;
          var vis = u2 < .58 ? Math.min(1, u2 / .08) * Math.min(1, (.58 - u2) / .08) : 0;
          phTick.style.opacity = Math.max(0, vis).toFixed(3);
          phTick.style.transform = 'translateX(' + ((1 - Math.max(0, vis)) * 16).toFixed(1) + 'px)';
        }
        if (nm === '积分套路' && phCoin) {
          var u3 = (t * .85) % 1;
          phCoin.style.opacity = (Math.sin(Math.PI * Math.min(1, u3 * 1.35)) * .95).toFixed(3);
          phCoin.style.transform = 'rotateY(' + Math.round(u3 * 360) + 'deg) scale(' +
            (.9 + .12 * Math.sin(Math.PI * u3)).toFixed(2) + ')';
        }
        if (nm === '强制更新') {
          var cnt = q1('.ad-count'); if (cnt) cnt.textContent = String(Math.max(1, 9 - Math.floor(age + .5)));
        }
        if (nm === '开屏广告') {
          var sn = q1('.ad-skipn'); if (sn) sn.textContent = String(Math.max(1, 5 - Math.floor(age % 5)));
          var sb = q1('.ad-splashbar i'); if (sb) sb.style.width = ((age * 34) % 100).toFixed(1) + '%';
        }
        if (nm === '自动扣费') {
          var cv = q1('.ad-cv');
          if (cv) cv.textContent = age < 1.7 ? '−¥98.00' : (age < 3.0 ? '−¥98.00 ×2' : '−¥98.00 ×3');
        }
        if (nm === '打卡任务') {
          var dd = card.querySelectorAll('.ad-days i');
          var lit = age < 1.2 ? 5 : 6;
          for (var d2 = 0; d2 < dd.length; d2++) dd[d2].className = d2 < lit ? 'on' : '';
        }
        if (nm === '积分套路') {
          var co = q1('.ad-coin'); if (co) co.style.transform = 'rotateY(' + Math.round((t * 210) % 360) + 'deg)';
        }
        if (nm === '借贷') {
          var lb = q1('.ad-b'); if (lb) lb.style.transform = 'scale(' + (1 + .04 * Math.abs(Math.sin(t * 3.1))).toFixed(3) + ')';
        }
        if (nm === '弹窗广告') {
          var pp = q1('.ad-pop'); if (pp) pp.style.transform = 'translateY(' + (Math.sin(t * 1.9) * 3).toFixed(2) + 'px)';
        }
        if (nm === '折扣套路') {
          var dv = q1('.ad-dv'); if (dv) dv.style.transform = 'scale(' + (1 + .03 * Math.abs(Math.sin(t * 4.2))).toFixed(3) + ')';
        }
      }
    }

    /* --- impacts: hard camera punch, exposure flash, shock ring --- */
    var kicks = [56.65, 58.15, 59.6];
    var punch = [[56.65, 22, .30], [58.15, 15, .16], [59.6, 24, .18]];
    var kickAmt = 0, flashAmt = 0, shockAmt = 0, ringScale = 0, ring2Scale = 0;
    for (var ki = 0; ki < punch.length; ki++) {
      var T = punch[ki][0], A = punch[ki][1], F = punch[ki][2];
      var dt = t - T;
      if (dt >= 0) {
        kickAmt += A * Math.exp(-dt * 12) * Math.sin(dt * 58 + .9);
        flashAmt = Math.max(flashAmt, F * Math.exp(-dt * 8.5));
        shockAmt = Math.max(shockAmt, 1.0 * Math.exp(-dt * 6.5));
        ringScale = Math.max(ringScale, .26 + 1.35 * (1 - Math.exp(-dt * 9)));
        ring2Scale = Math.max(ring2Scale, .16 + 2.0 * (1 - Math.exp(-dt * 6)));
      } else if (T - t < .22 && (T === 56.65 || T === 59.6)) {
        kickAmt -= (T === 56.65 ? 4.2 : 5.0) * Math.sin(Math.PI * (T - t) / .22);
      }
    }
    var kickSuffixNow = '';
    if (Math.abs(kickAmt) > .01) {
      kickSuffixNow = ' translate(' + px(kickAmt * .55) + ',' + px(-kickAmt * .34) + ')';
      main.style.transform = (main.style.transform || '') + kickSuffixNow;
    }
    if (kickSuffix && main.style.transform && main.style.transform.slice(-kickSuffix.length) === kickSuffix) {
      main.style.transform = main.style.transform.slice(0, -kickSuffix.length);
    }
    kickSuffix = kickSuffixNow;
    flash.style.display = flashAmt > 0.004 ? 'block' : 'none';
    flash.style.opacity = flashAmt.toFixed(3);
    if (shock) {
      shock.style.display = shockAmt > 0.01 ? 'block' : 'none';
      shock.style.opacity = shockAmt.toFixed(3);
      var burst = shock.querySelector('.burst');
      if (burst) {
        burst.style.opacity = '0';
        burst.style.transform = 'scale(' + (.35 + 1.5 * (1 - Math.exp(-(t - 56.65) * 9))).toFixed(3) + ')';
      }
      var r1 = shock.children[0], r2 = shock.children[1];
      if (r1) r1.style.transform = 'scale(' + ringScale.toFixed(3) + ')';
      if (r2) r2.style.transform = 'scale(' + ring2Scale.toFixed(3) + ')';
    }
  }

  /* ---------- ratio frame smoothing ---------- */
  var curFrame = null;
  function smoothFrame(t, tx, ty, tw, th){
    if (!curFrame) { curFrame = { x: tx, y: ty, w: tw, h: th }; }
    var e = .22;
    curFrame.x += (tx - curFrame.x) * e;
    curFrame.y += (ty - curFrame.y) * e;
    curFrame.w += (tw - curFrame.w) * e;
    curFrame.h += (th - curFrame.h) * e;
    frame.style.left = px(curFrame.x);
    frame.style.top = px(curFrame.y);
    frame.style.width = px(curFrame.w);
    frame.style.height = px(curFrame.h);
  }

  /* ---------- waveform ---------- */
  function drawWave(t){
    var data = audioData();
    var idx = Math.min(data.length - 1, Math.max(0, Math.floor(t * 60)));
    var fr = data[idx] || { wave: [] };
    var wave = fr.wave || [];
    var w = waveCanvas.width, h = waveCanvas.height, mid = h / 2;
    waveCtx.clearRect(0, 0, w, h);
    waveCtx.fillStyle = 'rgba(255,255,255,.16)';
    waveCtx.fillRect(0, mid, w, 1);
    if (!wave.length) return;
    var n = 120, step = Math.max(1, Math.floor(wave.length / n));
    waveCtx.fillStyle = 'rgba(255,255,255,.46)';
    for (var i = 0; i < n; i++) {
      var peak = 0;
      for (var j = 0; j < step; j++) peak = Math.max(peak, Math.abs(wave[i * step + j] || 0));
      var bh = Math.max(1.5, peak * h * .92);
      waveCtx.fillRect(i * (w / n) + (w / n - 2.5) / 2, mid - bh / 2, 2.5, bh);
    }
  }

  /* ---------- mini chapter: swap in a western classical album ---------- */
  (function () {
    var classic = { title: 'G 弦上的咏叹调', artist: 'Bach · Yo-Yo Ma', album: 'Classical Essentials', cover: 'assets/07-classical.svg' };
    window.__CLASSICAL = classic;
    try {
      if (window.V7_TRACKS && window.V7_TRACKS[4]) Object.assign(window.V7_TRACKS[4], classic);
    } catch (e) {}
    try { if (typeof names !== 'undefined' && names) names[4] = classic.title; } catch (e) {}
    try { if (typeof covers !== 'undefined' && covers) covers[4] = classic.cover; } catch (e) {}
  })();

  /* =========================================================
     v15 · second feedback pass (appended: runs after post())
     ========================================================= */
  var V15_FAST = /(?:^|[?&])fast=1/.test(location.search);
  var v15Cap = null, v15Cloth = null, v15Grain = null, v15Pitch = null, v15Noise = null;

  function v15El(tag, id, css) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag); el.id = id;
      el.style.cssText = css;
      (document.body || document.documentElement).appendChild(el);
    }
    return el;
  }

  function v15Init() {
    v15Cloth = v15El('div', 'v14-cloth',
      'position:fixed;inset:-12%;z-index:1;pointer-events:none;opacity:.85;' +
      'background:radial-gradient(46% 38% at 30% 32%,rgba(255,255,255,.50),transparent 70%),' +
      'radial-gradient(42% 34% at 72% 62%,rgba(255,255,255,.34),transparent 72%),' +
      'radial-gradient(38% 30% at 52% 78%,rgba(255,255,255,.22),transparent 74%);' +
      'mix-blend-mode:soft-light');
    v15Grain = v15El('canvas', 'v14-grain',
      'position:fixed;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;' +
      'opacity:.42;mix-blend-mode:soft-light');
    v15Grain.width = 960; v15Grain.height = 540;
    var c = v15Grain.getContext('2d');
    v15Noise = document.createElement('canvas'); v15Noise.width = 256; v15Noise.height = 256;
    var n = v15Noise.getContext('2d'), img = n.createImageData(256, 256);
    var seed = 20261122;
    for (var i = 0; i < img.data.length; i += 4) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var v = 118 + ((seed >> 8) % 48);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    n.putImageData(img, 0, 0);
    v15El('div', 'v14-vig',
      'position:fixed;inset:0;z-index:4;pointer-events:none;opacity:0;transition:none;' +
      'background:radial-gradient(ellipse at 50% 50%,transparent 46%,rgba(4,6,9,.55) 78%,rgba(3,4,6,.9) 100%)');
    v15Cap = v15El('div', 'v14-cap',
      'position:fixed;left:96px;bottom:88px;z-index:6;pointer-events:none;opacity:0;' +
      'font-family:Pretendard,LiuliSans,sans-serif;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.45)');
    v15Cap.innerHTML = '<div style="font-size:15px;letter-spacing:.34em;opacity:.66;margin-bottom:10px"></div>' +
                       '<div style="font-size:46px;font-weight:700;letter-spacing:-.01em"></div>';
    v15Pitch = v15El('canvas', 'v14-pitch',
      'position:fixed;z-index:6;pointer-events:none;opacity:0;filter:drop-shadow(0 10px 30px rgba(0,0,0,.28))');
    v15Pitch.width = 960; v15Pitch.height = 260;
  }

  function v15ClothDraw(t) {
    if (!v15Cloth) return;
    if (V15_FAST) { v15Cloth.style.display = 'none'; return; }
    var a = Math.sin(t * .21) * 1.6, b = Math.cos(t * .17) * 1.9, c = Math.sin(t * .13 + 1.2) * 2.2;
    v15Cloth.style.transform = 'translate3d(' + px(a) + ',' + px(b) + ',0) scale(' + (1 + .012 * Math.sin(t * .19)) + ')';
    v15Cloth.style.backgroundPosition = (c * 10) + 'px ' + (a * 8) + 'px';
  }

  function v15GrainDraw(t) {
    if (V15_FAST && v15Grain) { v15Grain.style.opacity = '0'; return; }
    if (!v15Grain || !v15Noise) return;
    var c = v15Grain.getContext('2d');
    var w = v15Grain.width, h = v15Grain.height;
    c.clearRect(0, 0, w, h);
    c.globalAlpha = .55;
    var ox = -Math.floor((t * 137) % 256), oy = -Math.floor((t * 91) % 256);
    for (var y = oy; y < h; y += 256) for (var x = ox; x < w; x += 256) c.drawImage(v15Noise, x, y);
    c.globalAlpha = 1;
  }

  function v15Lens(sel, kTarget, t) {
    var app = document.getElementById('app'), panel = document.querySelector(sel);
    if (!app || !panel) return;
    var ar = app.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    if (!ar.width || !pr.width || !app.offsetWidth) return;
    var s = ar.width / app.offsetWidth;                 // includes #main's 2x
    var wl = pr.width / s, hl = pr.height / s;
    var ax = (pr.left - ar.left) / s + wl / 2, ay = (pr.top - ar.top) / s + hl / 2;
    var k = Math.min(kTarget, 0.84 * 1920 / Math.max(1, wl));
    var left = parseFloat(app.style.left) || 0, top = parseFloat(app.style.top) || 0;
    var tx = 960 - left - k * ax, ty = 540 - top - k * ay;
    app.style.transformOrigin = '0 0';
    app.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
  }

  function v15PitchWave(pitchSemis, t) {
    if (!v15Pitch) return;
    var c = v15Pitch.getContext('2d'), w = v15Pitch.width, h = v15Pitch.height, mid = h / 2;
    c.clearRect(0, 0, w, h);
    var base = 4.2;
    function wave(freq, amp, alpha, width) {
      c.beginPath();
      for (var x = 0; x <= w; x += 3) {
        var ph = x / w * freq * Math.PI * 2 - t * 2.2;
        var y = mid - Math.sin(ph) * amp * Math.exp(-Math.pow((x / w - .5) * 2.1, 2) * .0);
        if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
      c.lineWidth = width; c.stroke();
    }
    wave(base, h * .34, .34, 2);
    wave(base * Math.pow(2, pitchSemis / 12), h * .34, 1, 5);
  }

  function v15(t) {
    if (!v15Cloth) v15Init();
    v15ClothDraw(t);
    v15GrainDraw(t);

    var app = document.getElementById('app');
    var stage = document.getElementById('v10-stage');
    var main = document.getElementById('main');
    var eq = document.getElementById('eq-panel');
    var cap = v15Cap;


    /* --- EQ: colour the spectrum bars --- */
    if (t >= 28.8 && t < 37.0) {
      var wc = document.querySelector('#v14-wave canvas');
      if (wc) {
        var cx2 = wc.getContext('2d'), n2 = 96, bw = wc.width / n2;
        var data2 = audioData(), fr2 = data2[Math.min(data2.length - 1, Math.max(0, Math.floor(t * 60)))] || { wave: [] };
        var wv = fr2.wave || [];
        cx2.clearRect(0, 0, wc.width, wc.height);
        cx2.fillStyle = 'rgba(255,255,255,.10)';
        cx2.fillRect(0, wc.height / 2, wc.width, 1);
        if (wv.length) {
          var step2 = Math.max(1, Math.floor(wv.length / n2));
          for (var bi = 0; bi < n2; bi++) {
            var pk = 0;
            for (var bj = 0; bj < step2; bj++) pk = Math.max(pk, Math.abs(wv[bi * step2 + bj] || 0));
            var bh = Math.max(2, pk * wc.height * .92);
            cx2.fillStyle = 'hsla(' + (16 + bi * 3.4) + ',92%,64%,.92)';
            cx2.fillRect(bi * bw + (bw - 3) / 2 + 0.5, (wc.height - bh) / 2, 3, bh);
          }
        }
      }
    }

    /* --- video chapter: extra moving light so the promo reads as video --- */
    if (t >= 38 && t < 51.4) {
      var gv3 = document.getElementById('glass-video');
      if (gv3 && gv3.width) {
        var c3 = gv3.getContext('2d');
        c3.save();
        c3.globalCompositeOperation = 'screen';
        for (var li = 0; li < 3; li++) {
          var ph = (t * (0.11 + li * 0.045) + li * 0.37) % 1;
          var cxp = (ph * 1.6 - 0.3) * gv3.width;
          var grd = c3.createLinearGradient(cxp - gv3.width * .2, 0, cxp + gv3.width * .2, gv3.height);
          grd.addColorStop(0, 'rgba(255,255,255,0)');
          grd.addColorStop(.5, 'rgba(255,248,240,' + (0.16 + li * 0.03) + ')');
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          c3.fillStyle = grd;
          c3.fillRect(0, 0, gv3.width, gv3.height);
        }
        c3.restore();
      }
    }

    /* --- EQ: night mode with coloured bands --- */
    if (t >= 28.8 && t < 37.0) {
      if (stage) stage.style.background = 'radial-gradient(ellipse at 50% 44%,#111318 0%,#0a0b0e 58%,#050608 100%)';
      if (app) app.style.background = 'linear-gradient(160deg,#0d0f13,#080a0d)';
      if (eq) eq.style.background = 'linear-gradient(150deg,rgba(24,27,33,.96),rgba(10,12,15,.98))';
      var waveC = document.getElementById('v14-wave');
      if (waveC) waveC.style.opacity = '.85';
      var faders = document.querySelectorAll('#bands .fader');
      for (var i = 0; i < faders.length; i++) {
        var fill = faders[i].querySelector('.gain-fill');
        if (fill) fill.style.background = 'linear-gradient(to top,hsl(' + (18 + i * 13) + ' 92% 60%),hsl(' + (18 + i * 13) + ' 96% 74%))';
        var handle = faders[i].querySelector('.handle');
        if (handle) handle.style.background = 'hsl(' + (18 + i * 13) + ' 92% 72%)';
      }
    }

    /* --- nine cards chapter: bright paper-white stage --- */
    if (t >= 53.05 && t < 59.6) {
      if (stage) stage.style.background = 'radial-gradient(ellipse at 50% 42%,#ffffff 0%,#f7f8fa 62%,#eef0f3 100%)';
      if (main) main.style.background = 'transparent';
    }

    /* --- aspect ratio badge: centred, switches with the frame --- */
    var ratioEl = document.getElementById('v14-ratio');
    if (ratioEl && t >= 38 && t < 51.4) {
      var gv = document.getElementById('glass-video'), ap0 = document.getElementById('app');
      if (gv && ap0) {
        var ar0 = ap0.getBoundingClientRect(), vr = gv.getBoundingClientRect();
        var sc0 = ar0.width / ap0.offsetWidth;
        var cx0 = (vr.left - ar0.left) / sc0 + vr.width / (2 * sc0);
        var cy0 = (vr.top - ar0.top) / sc0 + vr.height / (2 * sc0);
        ratioEl.style.display = 'block';
        ratioEl.style.left = cx0 + 'px';
        ratioEl.style.top = cy0 + 'px';
        ratioEl.style.transform = 'translate(-50%,-50%)';
        ratioEl.style.zIndex = '900';
        var asp = (window.__filmState && window.__filmState.videoAspect) || 16/9;
        var lbl = Math.abs(asp - 16/9) < .02 ? '16 : 9'
                : Math.abs(asp - 21/9) < .02 ? '21 : 9'
                : Math.abs(asp - 4/3) < .02 ? '4 : 3'
                : Math.abs(asp - 2.35) < .02 ? '2.35 : 1' : '16 : 9';
        if (ratioEl.textContent !== lbl) ratioEl.textContent = lbl;
        ratioEl.style.fontSize = '118px';
        ratioEl.style.fontWeight = '700';
        ratioEl.style.letterSpacing = '.06em';
        ratioEl.style.background = 'transparent';
        ratioEl.style.color = '#ffffff';
        ratioEl.style.textShadow = '0 12px 60px rgba(80,6,26,.6),0 2px 10px rgba(0,0,0,.3)';
      }
    } else if (ratioEl) {
      ratioEl.style.display = 'none';
    }

    /* --- 选段 / 变速 / 音高: one continuous lens run, one caption style --- */
    var lensA = t >= 18.1 && t < 23.2;
    var lensB = t >= 23.2 && t < 28.8;
    var eqOn = t >= 28.8 && t < 37.0;
    var titleStage = document.getElementById('v7-title-stage');
    var vig = document.getElementById('v14-vig');
    if (vig) vig.style.opacity = (lensA || lensB || eqOn) ? '.92' : '0';
    if (eqOn && t < 28.8 && stage) stage.style.background = 'radial-gradient(ellipse at 50% 46%,#171a20 0%,#0d0f13 62%,#08090b 100%)';
    if (lensA || lensB || eqOn) {
      if (titleStage) titleStage.style.display = 'none';
      if (main) { main.style.display = 'block'; main.style.opacity = '1'; main.style.visibility = 'visible'; main.style.transform = 'scale(2)'; }
      var tr = document.getElementById('traffic'); if (tr) tr.style.opacity = '0';
    }
    var capOn = false, capLabel = '', capText = '';
    var darkField = 'radial-gradient(ellipse at 50% 46%,#171a20 0%,#0d0f13 62%,#08090b 100%)';
    if (lensA) {
      var q1 = t - 18.1, k1 = 1 + 1.55 * tween(q1, .15, .62) * (1 - tween(q1, 4.55, 4.95));
      v15Lens('#loop-panel', k1, t);
      if (stage) stage.style.background = darkField;
      var cr = document.getElementById('carousel'); if (cr) cr.style.opacity = '0';
      capOn = true; capLabel = '01 · 区间'; capText = '只放大这一段';
    } else if (lensB) {
      var q2 = t - 23.2;
      if (q2 < 3.5) {
        var k2 = 1 + 1.35 * tween(q2, .12, .58) * (1 - tween(q2, 3.1, 3.45));
        v15Lens('#speed-panel', k2, t);
        if (stage) stage.style.background = darkField;
        var cr2 = document.getElementById('carousel'); if (cr2) cr2.style.opacity = '0';
        capOn = true; capLabel = '02 · 速率'; capText = '一点点推上去';
      } else {
        capOn = true; capLabel = '03 · 音高'; capText = '波形跟着变';
        if (v15Pitch) {
          var pw = document.getElementById('speed-panel');
          if (pw) {
            var pr2 = pw.getBoundingClientRect();
            v15Pitch.style.left = (pr2.right + 44) + 'px';
            v15Pitch.style.top = (pr2.top - 44) + 'px';
            v15Pitch.style.opacity = String(tween(q2, 3.5, 3.85));
          }
          var semi = 0;
          try { semi = parseFloat((document.getElementById('pitch-number') || {}).textContent) || 0; } catch (e) {}
          v15PitchWave(semi, t);
        }
      }
    } else if (v15Pitch) {
      v15Pitch.style.opacity = '0';
    }
    if (cap) {
      cap.style.opacity = capOn ? '1' : '0';
      cap.style.color = '#ffffff';
      if (capOn) {
        cap.children[0].textContent = capLabel;
        cap.children[1].textContent = capText;
      }
    }

    /* --- video chapter: keep the promo content moving --- */
    if (t >= 38 && t < 51.4) {
      var gv2 = document.getElementById('glass-video');
      if (gv2) {
        var pulse = 1 + .014 * Math.sin(t * 1.5);
        gv2.style.transform = 'scale(' + pulse.toFixed(4) + ')';
        gv2.style.filter = 'hue-rotate(' + (10 * Math.sin(t * .55)).toFixed(2) + 'deg) saturate(1.06)';
      }
    }
  }

  var v15PrevSeek = window.seek;
  window.seek = function (t) { v15PrevSeek(t); try { v15(t); } catch (e) { if (window.__v15err !== String(e)) { window.__v15err = String(e); console.error('v15', e); } } };
})();
