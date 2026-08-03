/* DadaGastro mobil prototipi — router + etkileşimler
   ------------------------------------------------------------------
   Faz 0 iskeleti:
   · Ekranlar kendini data-route ile kaydeder — sabit liste yok
   · Sınırsız derinlikte push/pop yığını
   · #/ekran hash yönlendirme — tek ekran linki + tarayıcı geri tuşu
   · Tam olay delegasyonu — yeni ekran eklemek için markup yeterli
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var screen = document.getElementById('screen');
  var toast = document.getElementById('toast');
  var toastTimer;

  function el(id) { return document.getElementById(id); }
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function raf2(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }

  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  /* ================= EKRAN KAYDI =================
     Yeni ekran eklemek için js'e dokunmaya gerek yok:
     <section class="view pushed" id="vXxx" data-route="xxx" data-parent="tarifler">  */
  var ROUTE = {};   // route  -> element id
  var BYID = {};    // element id -> route
  all('.view[data-route]').forEach(function (v) {
    ROUTE[v.dataset.route] = v.id;
    BYID[v.id] = v.dataset.route;
  });

  function viewOf(route) { var id = ROUTE[route]; return id ? el(id) : null; }
  function isRoot(v) { return v.classList.contains('root'); }

  var DEFAULT_ROOT = el('vHome') ? 'ana-sayfa' : Object.keys(ROUTE)[0];
  var curRoot = ROUTE[DEFAULT_ROOT];
  var stack = [];   // kökün üstündeki ekranların id'leri

  function topEl() { return stack.length ? el(stack[stack.length - 1]) : el(curRoot); }

  /* ================= ÜST BAR / DURUM ÇUBUĞU =================
     KURAL: şeffaf bar yalnız scrollTop = 0'da. 4px kaydırma → anında solid. */
  function bindBar(view) {
    var bar = view.querySelector('.vbar.overlay');
    if (!bar || bar._sync) return;
    function sync() {
      var solid = view.scrollTop > 4;
      bar.classList.toggle('solid', solid);
      if (view === topEl()) {
        screen.classList.toggle('dark-status', !solid);
        screen.classList.toggle('light-status', solid);
      }
    }
    view.addEventListener('scroll', sync, { passive: true });
    bar._sync = sync;
    sync();
  }
  all('.view').forEach(bindBar);

  function syncStatus() {
    var top = topEl();
    if (top.dataset.status === 'dark') {
      screen.classList.add('dark-status');
      screen.classList.remove('light-status');
      return;
    }
    var bar = top.querySelector('.vbar.overlay');
    if (bar && bar._sync) { bar._sync(); return; }
    screen.classList.add('light-status');
    screen.classList.remove('dark-status');
  }

  /* ================= HASH YÖNLENDİRME ================= */
  var hashLock = false;

  function readHash() {
    var m = /^#\/([A-Za-z0-9\-]+)$/.exec(location.hash || '');
    return m ? m[1] : null;
  }

  function writeHash(route) {
    if (!route) return;
    var h = '#/' + route;
    if (location.hash === h) return;
    hashLock = true;
    location.hash = h;
    setTimeout(function () { hashLock = false; }, 0);
  }

  window.addEventListener('hashchange', function () {
    if (hashLock) return;
    navigate(readHash(), true);
  });

  /* ================= EKRAN DURUMU =================
     Her gezinme sonrası: yığın sınıfı · sabit alt çubuk · durum çubuğu · hash */
  function after(noHash) {
    var top = topEl();

    screen.classList.toggle('stacked', stack.length > 0);

    /* sabit alt çubuklar ekran katmanında durur (Safari containing-block kuralı),
       o yüzden görünürlüğü buradan yönetiliyor: yalnız en üstteki ekranın çubuğu açık */
    all('.scrbar.on').forEach(function (b) { b.classList.remove('on'); });
    if (top.dataset.bar) {
      var bar = document.querySelector(top.dataset.bar);
      if (bar) bar.classList.add('on');
    }

    all('.view.top').forEach(function (v) { v.classList.remove('top'); });
    top.classList.add('top');

    all('.tab[data-root]').forEach(function (t) {
      t.classList.toggle('on', t.dataset.root === curRoot);
    });

    syncStatus();
    if (!noHash) writeHash(BYID[top.id]);
  }

  /* ================= KÖK SEKMELER ================= */
  function goRoot(route, silent) {
    var v = viewOf(route);
    if (!v || !isRoot(v)) return;
    if (v.id === curRoot && !stack.length) {
      v.scrollTo({ top: 0, behavior: 'smooth' });   // aktif sekmeye tekrar dokun → başa sar
      return;
    }
    el(curRoot).classList.remove('on', 'behind');
    v.classList.add('on');
    curRoot = v.id;
    after(silent);
  }

  /* ================= İTİLEN EKRAN / MODAL ================= */
  function push(route, silent, instant) {
    var v = viewOf(route);
    if (!v || v.classList.contains('on')) return;
    var below = topEl();
    v.scrollTop = 0;
    v.classList.add('on');
    if (!v.classList.contains('sheet')) below.classList.add('behind');
    stack.push(v.id);
    if (instant) v.classList.add('in');            // derin link — geçiş animasyonu yok
    else raf2(function () { v.classList.add('in'); });
    after(silent);
    setTimeout(function () { after(true); }, 380);
  }

  function pop(silent) {
    if (!stack.length) return;
    closeLayers();
    var v = el(stack.pop());
    v.classList.remove('in', 'top');
    topEl().classList.remove('behind');
    after(silent);
    setTimeout(function () {
      if (!v.classList.contains('in')) v.classList.remove('on');
      after(true);
    }, 380);
  }

  function popAll(silent) { while (stack.length) pop(silent); }

  /* ================= GEZİNME =================
     İki ayrı iş, karıştırılmamalı:

     open()     — kullanıcı bir butona bastı. Ekran mevcut yığının ÜSTÜNE binet.
     navigate() — bir hash çözülüyor (derin link, tarayıcı geri, yapıştırılan URL).
                  Yığın hedefin kanonik zincirine göre baştan kurulur, böylece
                  aynı link her zaman aynı ekran durumunu açar.                     */

  /* kök → … → route zinciri; data-parent başka bir itilen ekranı da gösterebilir */
  function chainFor(route) {
    var chain = [], guard = 0, r = route;
    while (r && guard++ < 8) {
      var v = viewOf(r);
      if (!v) break;
      chain.unshift(r);
      if (isRoot(v)) break;
      r = v.dataset.parent || DEFAULT_ROOT;
    }
    return chain;
  }

  function open(route) {
    var v = route && viewOf(route);
    if (!v) return;
    closeLayers();
    if (isRoot(v)) { popAll(); goRoot(route); return; }
    push(route);
  }

  function navigate(route, fromHash) {
    var v = route && viewOf(route);
    if (!v) { goRoot(DEFAULT_ROOT, fromHash); return; }
    closeLayers();
    if (topEl() === v) return;

    var i = stack.indexOf(v.id);
    if (i > -1) {                                    // yığında zaten var → oraya kadar geri sar
      while (stack.length - 1 > i) pop(true);
      after(fromHash);
      return;
    }

    var chain = chainFor(route);
    popAll(true);
    goRoot(chain[0], true);
    for (var k = 1; k < chain.length; k++) push(chain[k], true, true);
    after(fromHash);
  }

  /* ================= KATMANLAR (drawer · sheet · diyalog) ================= */
  function layerOpen(elm, ov) { if (elm) elm.classList.add('on'); if (ov) ov.classList.add('on'); }
  function layerClose(elm, ov) { if (elm) elm.classList.remove('on'); if (ov) ov.classList.remove('on'); }

  /* gezinme olduğunda üstte asılı kalan katman kalmamalı */
  function closeLayers() {
    all('.dlg.on,.bsheet.on,.appdrawer.on,.drawer.on').forEach(function (x) { x.classList.remove('on'); });
    ['dlgOv', 'bsOv', 'dwOv', 'ckOv'].forEach(function (id) {
      var o = el(id); if (o) o.classList.remove('on');
    });
  }

  function closeTopLayer() {
    var dlg = document.querySelector('.dlg.on');
    if (dlg) { layerClose(dlg, el('dlgOv')); return true; }
    var sheet = document.querySelector('.bsheet.on');
    if (sheet) { layerClose(sheet, el('bsOv')); return true; }
    var dw = document.querySelector('.appdrawer.on');
    if (dw) { layerClose(dw, el('dwOv')); return true; }
    return false;
  }

  /* ================= TEK OLAY DELEGASYONU =================
     Yeni ekranın butonları kendiliğinden çalışır — bağlama kodu yazılmaz. */
  document.addEventListener('click', function (e) {
    var t = e.target, n;

    /* --- gezinme --- */
    if ((n = t.closest('[data-open]'))) { e.preventDefault(); open(n.dataset.open); return; }
    if ((n = t.closest('[data-go]'))) { e.preventDefault(); popAll(); goRoot(n.dataset.go); return; }
    if ((n = t.closest('[data-root]'))) { e.preventDefault(); popAll(); goRoot(BYID[n.dataset.root]); return; }
    if (t.closest('[data-back],[data-close]')) { e.preventDefault(); pop(); return; }

    /* --- app drawer --- */
    if (t.closest('[data-drawer]')) { e.preventDefault(); layerOpen(el('appDrawer'), el('dwOv')); return; }
    if (t.closest('[data-drawer-close]') || t === el('dwOv')) {
      e.preventDefault(); layerClose(el('appDrawer'), el('dwOv')); return;
    }
    if ((n = t.closest('[data-drawer-go]'))) {
      e.preventDefault();
      var go = n.dataset.drawerGo;
      layerClose(el('appDrawer'), el('dwOv'));
      setTimeout(function () { open(go); }, 240);
      return;
    }

    /* --- alt çekmece --- */
    if ((n = t.closest('[data-bsheet]'))) { e.preventDefault(); layerOpen(el(n.dataset.bsheet), el('bsOv')); return; }
    if (t.closest('[data-bsheet-close]') || t === el('bsOv')) {
      e.preventDefault();
      layerClose(document.querySelector('.bsheet.on'), el('bsOv'));
      return;
    }

    /* --- onay diyaloğu --- */
    if ((n = t.closest('[data-dlg]'))) { e.preventDefault(); layerOpen(el(n.dataset.dlg), el('dlgOv')); return; }
    if ((n = t.closest('[data-dlg-close]')) || t === el('dlgOv')) {
      e.preventDefault();
      var d = document.querySelector('.dlg.on');
      layerClose(d, el('dlgOv'));
      if (n && n.dataset.dlgSay) say(n.dataset.dlgSay);
      return;
    }

    /* --- akordeon --- */
    if ((n = t.closest('[data-acc]'))) {
      e.preventDefault();
      var acc = n.closest('.acc');
      var wasOpen = acc.classList.contains('on');
      if (acc.parentElement.dataset.accSingle !== undefined) {
        all('.acc.on', acc.parentElement).forEach(function (a) { a.classList.remove('on'); });
      }
      acc.classList.toggle('on', !wasOpen);
      return;
    }

    /* --- A–Z harf dizini --- */
    if ((n = t.closest('[data-az]'))) {
      e.preventDefault();
      jumpToLetter(n);
      return;
    }

    /* --- sekme şeridi (data-pane) --- */
    if ((n = t.closest('[data-pane]'))) {
      e.preventDefault();
      var scope = n.closest('[data-tabs]') || n.closest('.view') || document;
      all('[data-pane]', scope).forEach(function (x) { x.classList.remove('on'); });
      all('.pane', scope).forEach(function (x) { x.classList.remove('on'); });
      n.classList.add('on');
      var pane = el(n.dataset.pane);
      if (pane) pane.classList.add('on');
      return;
    }

    /* --- tek seçimli çip grubu --- */
    if ((n = t.closest('[data-chips] > *'))) {
      var grp = n.parentElement;
      if (grp.dataset.chips === 'single') {
        all('> *', grp).forEach(function (x) { x.classList.remove('on'); });
        n.classList.add('on');
      } else {
        n.classList.toggle('on');
      }
      /* burada return YOK — çip aynı zamanda data-say/data-open taşıyabilir */
    }

    /* --- anahtar --- */
    if ((n = t.closest('.sw'))) { e.preventDefault(); n.classList.toggle('on'); return; }

    /* --- kaydet (kalp) --- */
    if ((n = t.closest('.save,.icobtn.save'))) {
      e.preventDefault(); e.stopPropagation();
      var on = !n.classList.contains('on');
      if (n.closest('#vDetail') || n.closest('.actionbar')) {
        all('.save,.icobtn.save').forEach(function (x) {
          x.classList.toggle('on', on);
          x.innerHTML = on ? '<i class="fs i-heart"></i>' : '<i class="fr i-heart"></i>';
        });
      } else {
        n.classList.toggle('on', on);
        n.innerHTML = on ? '<i class="fs i-heart"></i>' : '<i class="fr i-heart"></i>';
      }
      say(on ? 'Tarif defterine kaydedildi' : 'Kayıt kaldırıldı');
      return;
    }

    /* --- takip et --- */
    if ((n = t.closest('.follow'))) {
      e.preventDefault(); e.stopPropagation();
      n.classList.toggle('on');
      n.textContent = n.classList.contains('on') ? '✓ Takiptesin' : '+ Takip Et';
      return;
    }

    /* --- malzeme satırı işaretle --- */
    if ((n = t.closest('.ig'))) {
      n.classList.toggle('done');
      var c = el('igCount');
      if (c) c.textContent = all('#vDetail .ig.done').length;
      return;
    }

    /* --- adım "yaptım" --- */
    if ((n = t.closest('.step .did'))) {
      var st = n.closest('.step');
      st.classList.toggle('done');
      n.lastChild.textContent = st.classList.contains('done') ? ' Yapıldı' : ' Yaptım';
      return;
    }

    /* --- hero arama modu --- */
    if ((n = t.closest('.mode'))) {
      all('.mode').forEach(function (x) { x.classList.remove('on'); });
      n.classList.add('on');
      var ph = {
        'Tarif Ara': 'Tarif adı ara… (ör. mercimek çorbası)',
        'Malzemeye Göre': 'Malzeme ekle… (ör. yumurta, patates)',
        'Ne Pişirsem': 'Canın ne çekti? (ör. hafif, pratik)'
      };
      var q = el('q');
      if (q) q.placeholder = ph[n.textContent.trim()] || q.placeholder;
      return;
    }

    /* --- popüler arama çipi --- */
    if ((n = t.closest('.poprail .chip'))) {
      var qq = el('q');
      if (qq) qq.value = n.textContent.trim();
      popAll(); goRoot('tarifler');
      return;
    }

    /* --- liste ekranı kategori çipi --- */
    if ((n = t.closest('.lchips .chip'))) {
      all('.lchips .chip').forEach(function (x) { x.classList.remove('on'); });
      n.classList.add('on');
      return;
    }

    /* --- ne pişirsem malzeme kutusu --- */
    if ((n = t.closest('.itile'))) {
      n.classList.toggle('on');
      var k = all('.itile.on').length;
      var lbl = el('wzTxt');
      if (lbl) lbl.textContent = k >= 3 ? (k + ' malzemeyle tarif bul') : ('Malzeme seç (' + k + '/3)');
      return;
    }

    /* --- son çare: bilgilendirme toast'ı --- */
    if ((n = t.closest('[data-say]'))) { e.preventDefault(); say(n.dataset.say); }
  });

  /* ================= A–Z DİZİNİ =================
     Harfe dokun → listedeki o harfin başlığına kaydır.
     Kaydırırken dizin kendini günceller (yapışkan harf başlığıyla senkron). */
  function jumpToLetter(btn) {
    var view = btn.closest('.view');
    var target = view.querySelector('[data-azh="' + btn.dataset.az + '"]');
    if (!target) return;
    var bar = view.querySelector('.azb');
    view.scrollTo({ top: target.offsetTop - (bar ? bar.offsetHeight : 0), behavior: 'smooth' });
    setActiveLetter(view, btn.dataset.az);
  }

  function setActiveLetter(view, letter) {
    var rail = view.querySelector('.azb-rail');
    if (!rail) return;
    all('.azl', rail).forEach(function (b) {
      var on = b.dataset.az === letter;
      b.classList.toggle('on', on);
      if (on) rail.scrollTo({ left: b.offsetLeft - 140, behavior: 'smooth' });
    });
  }

  all('.view').forEach(function (view) {
    if (!view.querySelector('.azb')) return;
    var heads = all('[data-azh]', view);
    var bar = view.querySelector('.azb');
    function syncLetter() {
      var y = view.scrollTop + bar.offsetHeight + 8;
      var cur = heads[0];
      for (var i = 0; i < heads.length; i++) { if (heads[i].offsetTop <= y) cur = heads[i]; }
      if (cur) setActiveLetter(view, cur.dataset.azh);
    }
    view.addEventListener('scroll', syncLetter, { passive: true });
    syncLetter();                       // açılışta da ilk harf işaretli gelsin
  });

  /* ================= TARİF DETAY — porsiyon ================= */
  var portion = 4;
  function fmtQty(n) {
    n = Math.round(n * 2) / 2;
    return (n % 1 === 0) ? String(n) : String(n).replace('.', ',');
  }
  function applyPortion() {
    if (!el('pVal')) return;
    el('pVal').textContent = portion;
    el('kfPortion').textContent = portion + ' kişilik';
    all('#vDetail .ig b i[data-base]').forEach(function (x) {
      x.textContent = fmtQty(parseFloat(x.dataset.base) / 4 * portion);
    });
  }
  if (el('pPlus')) el('pPlus').addEventListener('click', function () { if (portion < 12) { portion++; applyPortion(); } });
  if (el('pMinus')) el('pMinus').addEventListener('click', function () { if (portion > 1) { portion--; applyPortion(); } });

  /* ================= NE PİŞİRSEM SİHİRBAZI ================= */
  if (el('wzReset')) el('wzReset').addEventListener('click', function () {
    all('.itile.on').forEach(function (x) { x.classList.remove('on'); });
    el('wzTxt').textContent = 'Malzeme seç (0/3)';
  });
  if (el('wzGo')) el('wzGo').addEventListener('click', function () {
    var k = all('.itile.on').length;
    if (k < 3) { say('En az 3 malzeme seç'); return; }
    pop();
    setTimeout(function () { goRoot('tarifler'); say(k + ' malzemeye uygun 24 tarif bulundu'); }, 400);
  });

  /* ================= PİŞİRME MODU ================= */
  var STEPS = [{ "t": "Hamuru yoğur ve dinlendir", "p": "Unu geniş bir kaba ele, ortasını havuz gibi aç. Yumurta, tuz ve suyu ekleyip <b>kulak memesi yumuşaklığında</b> bir hamur yoğur. Üzerini nemli bezle örtüp 10 dakika dinlendir — dinlenen hamur açılırken yırtılmaz.", "img": "assets/img/1561.webp", "min": 15 }, { "t": "İç harcı hazırla", "p": "Kıymayı rendelenmiş soğan, tuz ve karabiberle karıştır. <b>Harcı çok yoğurma</b>; gevşek harç pişerken daha sulu ve lokum gibi kalır.", "img": "", "min": 5 }, { "t": "Hamuru aç, kareler kes", "p": "Hamuru ikiye böl, unlanmış tezgâhta her parçayı <b>2 mm incelikte</b> aç. Keskin bıçak ya da rulet ile 3×3 cm kareler kes. Kareler kurumasın diye üzerini bezle ört.", "img": "assets/img/1749.webp", "min": 20 }, { "t": "Mantıları doldur ve kapat", "p": "Her karenin ortasına <b>nohut büyüklüğünde</b> harç koy. Dört ucu birleştirip bohça gibi sıkıca kapat. Kapanan mantıları yağlanmış fırın tepsisine aralıklı diz.", "img": "assets/img/1637.webp", "min": 20 }, { "t": "Fırınla, sonra et suyunda pişir", "p": "Tepsiyi önceden ısıtılmış <b>180°C</b> fırında 15 dakika, mantılar hafif pembeleşene kadar kızart. Üzerine sıcak et suyunu döküp 10 dakika daha pişir — suyu çeken mantı dışı diri, içi yumuşacık olur.", "img": "assets/img/1425.webp", "min": 25 }, { "t": "Yoğurt ve sosla servis et", "p": "Süzme yoğurdu ezilmiş sarımsakla çırp, mantının üzerine gezdir. Tereyağını toz biberle kızdırıp <b>cazırdarken dök</b>; üzerine kuru nane serp. Eline sağlık!", "img": "assets/img/1424.webp", "min": 5 }];
  var ci = 0, tSec = 0, tRun = false, tInt = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock() { el('ckClock').textContent = Math.floor(tSec / 60) + ':' + pad(tSec % 60); }
  function stopTimer() {
    tRun = false; clearInterval(tInt);
    el('ckTimer').classList.remove('run');
    el('ckPlay').innerHTML = '<i class="fs i-play"></i>';
  }
  function ckRender() {
    if (!el('ckTitle')) return;
    var s = STEPS[ci];
    el('ckCount').textContent = 'Adım ' + (ci + 1) + ' / ' + STEPS.length;
    el('ckNum').textContent = 'Adım ' + (ci + 1);
    el('ckTitle').textContent = s.t;
    el('ckText').innerHTML = s.p;
    var f = el('ckFig');
    f.style.backgroundImage = s.img ? "url('" + s.img + "')" : 'none';
    el('ckNoImg').style.display = s.img ? 'none' : 'grid';
    var pr = el('ckProg'); pr.innerHTML = '';
    for (var i = 0; i < STEPS.length; i++) {
      var d = document.createElement('span');
      d.className = 'cp' + (i <= ci ? ' done' : '');
      pr.appendChild(d);
    }
    el('ckPrev').classList.toggle('off', ci === 0);
    var last = ci === STEPS.length - 1;
    el('ckNext').classList.toggle('fin', last);
    el('ckNext').innerHTML = last
      ? 'Tarifi Bitir <i class="fs i-check"></i>'
      : 'Sonraki Adım <i class="fs i-chevron-right"></i>';
    stopTimer(); tSec = s.min * 60; clock();
    el('ckTLabel').textContent = 'Zamanlayıcı — ' + s.min + ' dk';
    el('ckTHint').textContent = 'Başlat, süre dolunca haber verelim';
    el('vCook').scrollTo({ top: 0, behavior: 'auto' });
  }
  if (el('ckNext')) el('ckNext').addEventListener('click', function () {
    if (ci === STEPS.length - 1) {
      pop();
      setTimeout(function () { say('Afiyet olsun! Tarifi tamamladın'); }, 420);
      ci = 0; return;
    }
    ci++; ckRender();
  });
  if (el('ckPrev')) el('ckPrev').addEventListener('click', function () { if (ci > 0) { ci--; ckRender(); } });
  if (el('ckPlay')) el('ckPlay').addEventListener('click', function () {
    if (tRun) { stopTimer(); return; }
    tRun = true;
    el('ckTimer').classList.add('run');
    el('ckPlay').innerHTML = '<i class="fs i-xmark"></i>';
    el('ckTHint').textContent = 'Çalışıyor — ekran açık kalır';
    tInt = setInterval(function () {
      if (tSec > 0) { tSec--; clock(); }
      else { stopTimer(); say('Süre doldu — ' + STEPS[ci].t); }
    }, 1000);
  });
  if (el('ckIng')) el('ckIng').addEventListener('click', function () { layerOpen(el('ckDrawer'), el('ckOv')); });
  if (el('ckOv')) el('ckOv').addEventListener('click', function () { layerClose(el('ckDrawer'), el('ckOv')); });
  ckRender();

  /* ================= FİLTRE ÇEKMECESİ ================= */
  function fltTally() {
    if (!el('fltCount')) return { n: 0, res: 248 };
    var n = all('#fltSheet .fgrp:not(:first-child) .fopt.on').length;
    var res = Math.max(12, 248 - n * 38);
    el('fltCount').textContent = n;
    el('fltCount').style.display = n ? 'grid' : 'none';
    el('fltApplyTx').textContent = res + ' Tarifi Göster';
    return { n: n, res: res };
  }
  all('#fltSheet .fopt').forEach(function (o) {
    o.addEventListener('click', function () {
      var wrap = o.parentElement;
      if (wrap.dataset.single !== undefined) {
        all('.fopt', wrap).forEach(function (x) { x.classList.remove('on'); });
        o.classList.add('on');
        el('sortBtn').innerHTML = o.textContent +
          ' <i class="fs i-chevron-right" style="transform:rotate(90deg)"></i>';
      } else { o.classList.toggle('on'); }
      fltTally();
    });
  });
  if (el('fltReset')) el('fltReset').addEventListener('click', function () {
    all('#fltSheet .fgrp:not(:first-child) .fopt.on').forEach(function (x) { x.classList.remove('on'); });
    fltTally();
  });
  if (el('fltApply')) el('fltApply').addEventListener('click', function () {
    var t = fltTally();
    layerClose(el('fltSheet'), el('bsOv'));
    el('lCount').textContent = t.res;
    setTimeout(function () { say(t.res + ' tarif listelendi'); }, 320);
  });
  all('#actFlt .afl[data-flt]').forEach(function (a) {
    a.addEventListener('click', function () { a.remove(); say(a.dataset.flt + ' filtresi kaldırıldı'); });
  });
  if (el('fltClear')) el('fltClear').addEventListener('click', function () {
    all('#actFlt .afl[data-flt]').forEach(function (x) { x.remove(); });
    all('#fltSheet .fgrp:not(:first-child) .fopt.on').forEach(function (x) { x.classList.remove('on'); });
    fltTally();
    el('lCount').textContent = '248';
    say('Filtreler temizlendi');
  });
  fltTally();

  /* ================= KLAVYE (masaüstü önizleme) ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (closeTopLayer()) return;
    pop();
  });

  /* ================= AÇILIŞ =================
     #/ekran ile gelen link doğrudan o ekranı açar. */
  var boot = readHash();
  if (boot && viewOf(boot)) navigate(boot, true);
  after(true);                       // .view.top ve alt çubuk her hâlükârda işaretlensin
  writeHash(BYID[topEl().id]);
})();
