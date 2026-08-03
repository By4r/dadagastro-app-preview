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
    closeLayers();
    /* bilinmeyen ya da kaldırılmış rota (eski #/saglik linki gibi):
       yığını da temizle, yoksa üstte takılı ekran kalıyor */
    if (!v) { popAll(true); goRoot(DEFAULT_ROOT, true); after(fromHash); return; }
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
      if (el('frMode') && FR_MOD[n.dataset.pane]) el('frMode').textContent = FR_MOD[n.dataset.pane];
      if (scope.id === 'npTabs') npBar();
      return;
    }

    /* --- dolapta: malzeme seç --- */
    if ((n = t.closest('[data-mz]'))) {
      e.preventDefault();
      var ad = n.dataset.mz;
      if (n.classList.contains('on')) { n.classList.remove('on'); delete frSel[ad]; }
      else { n.classList.add('on'); frSel[ad] = frAktifMod(); }
      frRender();
      return;
    }
    /* --- dolapta: seçilen çipten çıkar --- */
    if ((n = t.closest('[data-frx]'))) {
      e.preventDefault();
      var a2 = n.dataset.frx;
      delete frSel[a2];
      all('.mz').forEach(function (m) { if (m.dataset.mz === a2) m.classList.remove('on'); });
      frRender();
      return;
    }
    /* --- ne pişirsem: adım çipi --- */
    if ((n = t.closest('[data-wzc]'))) {
      e.preventDefault();
      var st = n.closest('.wz-step');
      var k = +st.dataset.wzstep;
      if (st.dataset.multi === '1') { n.classList.toggle('on'); }
      else { all('.wz-c', st).forEach(function (c) { c.classList.remove('on'); }); n.classList.add('on'); }
      wzSecim[k] = all('.wz-c.on', st).map(function (c) { return c.querySelector('b').textContent; });
      return;
    }
    /* --- ne pişirsem: yemek modu --- */
    if ((n = t.closest('[data-mode]'))) {
      e.preventDefault();
      all('[data-mode]').forEach(function (m) { m.classList.remove('on'); });
      n.classList.add('on');
      return;
    }
    /* --- ne pişirsem: menüye ekle --- */
    if ((n = t.closest('[data-tray]'))) {
      e.preventDefault();
      var ad2 = n.dataset.tray;
      if (tray.indexOf(ad2) < 0) { tray.push(ad2); say(ad2 + ' menüye eklendi'); }
      else { tray.splice(tray.indexOf(ad2), 1); say(ad2 + ' menüden çıkarıldı'); }
      n.textContent = tray.indexOf(ad2) > -1 ? 'Menüden Çıkar' : 'Menüye Ekle';
      trayRender(); trayList(); npBar();
      return;
    }

    /* --- tepsiden çıkar --- */
    if ((n = t.closest('[data-trayx]'))) {
      e.preventDefault();
      var ax = n.dataset.trayx;
      var ix = tray.indexOf(ax);
      if (ix > -1) tray.splice(ix, 1);
      trayRender(); trayList(); trayBtnSync(); npBar();
      return;
    }
    /* --- hazır menüyü aç → Tarifler --- */
    if ((n = t.closest('[data-menu]'))) {
      e.preventDefault();
      layerClose(document.querySelector('.bsheet.on'), el('bsOv'));
      var kart = n.closest('.menu-c');
      var kat = kart ? (kart.querySelector('.mc-k') || {}).textContent : '';
      filtrelereGec([n.dataset.menu].concat(kat ? [kat] : []), n.dataset.menu + ' menüsü açıldı');
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

    /* --- gerçek geri bildirim: işlem oldu, ekran gerekmiyor --- */
    if ((n = t.closest('[data-toast]'))) { e.preventDefault(); say(n.dataset.toast); return; }

    /* --- BORÇ: bu butonun ekranı henüz yok.
           data-say sayısı = kalan iş. Hedef 0. Geri bildirim için data-toast kullan. --- */
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

  /* ================= DOLAPTA NE VAR =================
     185 malzeme 5 sekmede tekrar etmesin diye tek listede duruyor;
     aktif sekme seçimin hangi listeye gittiğini belirliyor. */
  var frSel = {};                     // { malzeme: mod }
  var FR_MOD = { fpHave: 'Dolaptakiler', fpSev: 'Sevmiyorum', fpTuk: 'Tüketmiyorum',
                 fpAlj: 'Alerjim Var', fpHas: 'Hassasiyetim Var' };
  function frAktifMod() {
    var on = document.querySelector('#frTabs .pane.on');
    return on ? on.id : 'fpHave';
  }
  function frRender() {
    var adlar = Object.keys(frSel);
    var n = adlar.length;
    if (el('frN')) el('frN').textContent = n;
    if (el('frFn')) el('frFn').textContent = n ? Math.max(3, 240 - n * 11) : 0;

    var wrap = el('frChips');
    if (wrap) {
      wrap.innerHTML = n ? adlar.map(function (a) {
        return '<button class="fr-chip" data-frx="' + a + '">' + a +
               ' <i class="fs i-xmark"></i></button>';
      }).join('') :
      '<span class="fr-empty">Henüz seçim yok — Dolaptakiler\'den malzeme işaretle ' +
      'ya da Hariç Tuttuklarım\'ı doldur.</span>';
    }
    all('.mzcat').forEach(function (c) {
      var top = all('.mz.on', c).length;
      var lbl = c.querySelector('.mh-n');
      var tum = all('.mz', c).length;
      if (lbl) lbl.textContent = top + '/' + tum;
      c.classList.toggle('has-sel', top > 0);
    });
    if (el('frEmpty')) el('frEmpty').style.display = n ? 'none' : 'flex';
    if (el('frResults')) el('frResults').style.display = n ? 'block' : 'none';
    if (n && el('frRn')) { el('frRn').textContent = Math.max(3, 240 - n * 11); el('frRm').textContent = n; }
  }
  function frTemizle() {
    frSel = {};
    all('.mz.on').forEach(function (m) { m.classList.remove('on'); });
    frRender();
  }

  /* malzeme arama */
  if (el('frQ')) el('frQ').addEventListener('input', function () {
    var q = this.value.trim().toLocaleLowerCase('tr');
    var bulunan = 0;
    all('.mzcat').forEach(function (c) {
      var gorunen = 0;
      all('.mz', c).forEach(function (m) {
        var ok = !q || m.dataset.mz.toLocaleLowerCase('tr').indexOf(q) > -1;
        m.hidden = !ok;
        if (ok) gorunen++;
      });
      c.style.display = gorunen ? '' : 'none';
      if (q && gorunen) c.classList.add('on');       // arama varken kategoriyi aç
      bulunan += gorunen;
    });
    if (el('frNoRes')) el('frNoRes').style.display = bulunan ? 'none' : 'flex';
  });

  /* kalori kaydırıcısı */
  var KCAL = ['0–120 kcal', '120–650 kcal', '650–900 kcal', '900–1200 kcal', '1200+ kcal'];
  if (el('frKcal')) el('frKcal').addEventListener('input', function () {
    el('frKcalV').textContent = KCAL[this.value] || KCAL[1];
  });
  if (el('frReset')) el('frReset').addEventListener('click', function () {
    all('#vFridge .fopt.on').forEach(function (x) {
      if (!x.closest('.hs-opt')) x.classList.remove('on');
    });
    if (el('frKcal')) { el('frKcal').value = 1; el('frKcalV').textContent = KCAL[1]; }
    say('Filtreler sıfırlandı');
  });
  if (el('frClear')) el('frClear').addEventListener('click', function () {
    if (!Object.keys(frSel).length) { say('Dolabın zaten boş'); return; }
    frTemizle(); say('Dolap sıfırlandı');
  });
  if (el('frShow')) el('frShow').addEventListener('click', function () {
    var n = Object.keys(frSel).length;
    if (!n) { say('Önce dolabından birkaç malzeme işaretle'); return; }
    el('frResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ================= NE PİŞİRSEM ================= */
  var wzAdim = 1, wzSecim = {};
  function wzGoster(k) {
    wzAdim = k;
    all('#npAra .wz-step').forEach(function (st) {
      st.classList.toggle('on', +st.dataset.wzstep === k);
    });
    all('.wz-s').forEach(function (s2) {
      var i2 = +s2.dataset.wzs;
      s2.classList.toggle('on', i2 === k);
      s2.classList.toggle('done', i2 < k);
    });
    el('wzPrev').classList.toggle('off', k === 1);
    var son = k >= 5;
    el('barWizard').style.display = son ? 'none' : '';
    if (!son) {
      el('wzNext').innerHTML = (k === 4 ? 'Tarifleri Getir' : 'Devam') +
        ' <i class="fs i-chevron-right"></i>';
    }
    var v = el('vWizard'); if (v) v.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function wzOzet() {
    var p2 = el('wzPicked'); if (!p2) return;
    var t = [];
    Object.keys(wzSecim).forEach(function (k) { t = t.concat(wzSecim[k]); });
    p2.innerHTML = t.map(function (x) {
      return '<span class="fr-chip">' + x + '</span>';
    }).join('');
    el('wzN').textContent = Math.max(4, 40 - t.length * 3);
  }
  if (el('wzNext')) el('wzNext').addEventListener('click', function () {
    if (wzAdim < 4) {
      if (!(wzSecim[wzAdim] || []).length) { say('Bir seçim yap, sonra devam edelim'); return; }
      wzGoster(wzAdim + 1); return;
    }
    wzOzet();
    wzGoster(+el('wzN').textContent > 0 ? 5 : 6);
  });
  if (el('wzPrev')) el('wzPrev').addEventListener('click', function () {
    if (wzAdim > 1) wzGoster(wzAdim - 1);
  });
  if (el('wzAgain')) el('wzAgain').addEventListener('click', function () {
    wzSecim = {}; all('.wz-c.on').forEach(function (c) { c.classList.remove('on'); }); wzGoster(1);
  });
  if (el('wzLoosen')) el('wzLoosen').addEventListener('click', function () { wzGoster(4); });
  if (el('wzReset')) el('wzReset').addEventListener('click', function () {
    wzSecim = {}; all('.wz-c.on').forEach(function (c) { c.classList.remove('on'); });
    wzGoster(1); say('Sihirbaz sıfırlandı');
  });

  /* menü tepsisi */
  var tray = [];
  function trayRender() {
    if (el('trayN')) el('trayN').textContent = tray.length;
    if (el('barTray')) el('barTray').hidden = !tray.length;
  }
  if (el('trayOpen')) el('trayOpen').addEventListener('click', function () {
    trayList();
    layerOpen(el('traySheet'), el('bsOv'));
  });

  /* ---- tepsi sheet'i: içerik, çıkarma, adlandırma, kaydetme ---- */
  var TRAY_DK = { };
  all('[data-tray]').forEach(function (btn) {
    var card = btn.closest('.gcard');
    var dk = card ? (card.querySelector('.gmeta span') || {}).textContent : '';
    TRAY_DK[btn.dataset.tray] = {
      dk: parseInt((dk || '0').replace(/\D/g, ''), 10) || 0,
      img: card ? (card.querySelector('.media') || {}).style.backgroundImage : '',
      kat: card ? ((card.querySelector('.rib') || {}).textContent || '') : ''
    };
  });
  function trayList() {
    var box = el('trayList'); if (!box) return;
    box.innerHTML = tray.map(function (ad) {
      var m = TRAY_DK[ad] || {};
      return '<div class="tray-r"><span class="th" style="background-image:' + (m.img || 'none') + '"></span>' +
             '<span class="tx"><b>' + ad + '</b><span>' + (m.kat || '') +
             (m.dk ? ' · ' + m.dk + ' dk' : '') + '</span></span>' +
             '<button class="rm" data-trayx="' + ad + '" aria-label="Çıkar"><i class="fs i-xmark"></i></button></div>';
    }).join('');
    var toplam = tray.reduce(function (a, x) { return a + ((TRAY_DK[x] || {}).dk || 0); }, 0);
    if (el('trayN2')) el('trayN2').textContent = tray.length;
    if (el('trayDk')) el('trayDk').textContent = toplam;
    if (el('trayEmpty')) el('trayEmpty').style.display = tray.length ? 'none' : 'flex';
    if (el('traySave')) el('traySave').disabled = !tray.length;
  }
  function trayBtnSync() {
    all('[data-tray]').forEach(function (b) {
      b.textContent = tray.indexOf(b.dataset.tray) > -1 ? 'Menüden Çıkar' : 'Menüye Ekle';
    });
  }
  if (el('trayClear')) el('trayClear').addEventListener('click', function () {
    if (!tray.length) { say('Tepsi zaten boş'); return; }
    tray = []; trayRender(); trayList(); trayBtnSync(); npBar(); say('Tepsi temizlendi');
  });
  if (el('traySave')) el('traySave').addEventListener('click', function () {
    if (!tray.length) { say('Önce tepsiye tarif ekle'); return; }
    var ad = (el('trayName').value || '').trim() || 'Adsız menü';
    layerClose(el('traySheet'), el('bsOv'));
    setTimeout(function () { say('"' + ad + '" kaydedildi — ' + tray.length + ' tarif'); }, 300);
  });

  /* ---- sihirbaz sonucu → Tarifler, seçimler aktif filtre pili olarak ---- */
  function filtrelereGec(pilller, mesaj) {
    var box = el('actFlt');
    if (box) {
      var clear = el('fltClear');
      all('.afl[data-flt]', box).forEach(function (x) { x.remove(); });
      pilller.forEach(function (t) {
        var sp = document.createElement('span');
        sp.className = 'afl';
        sp.dataset.flt = t;
        sp.innerHTML = t + ' <i class="fs i-xmark"></i>';
        box.insertBefore(sp, clear);
      });
    }
    var n = Math.max(6, 2057 - pilller.length * 380);
    if (el('lCount')) el('lCount').textContent = n;
    popAll();
    goRoot('tarifler');
    setTimeout(function () { say(mesaj || (n + ' tarif listelendi')); }, 380);
  }
  if (el('wzGo')) el('wzGo').addEventListener('click', function () {
    var t = [];
    Object.keys(wzSecim).forEach(function (k) { t = t.concat(wzSecim[k]); });
    filtrelereGec(t, el('wzN').textContent + ' tarif listelendi');
  });

  /* aktif panele göre alt çubuk: sihirbaz mı, tepsi mi */
  function npBar() {
    var mod = document.querySelector('#npTabs .pane.on');
    var modda = mod && mod.id === 'npMod';
    if (el('barWizard')) el('barWizard').style.display = (modda || wzAdim >= 5) ? 'none' : '';
    if (el('barTray')) el('barTray').hidden = !(modda && tray.length);
  }

  /* ================= FİLTRE ÇEKMECESİ ================= */
  function fltTally() {
    if (!el('fltCount')) return { n: 0, res: 248 };
    var secili = all('#fltSheet .fgrp:not(:first-child) .fopt.on');
    var n = secili.length;
    /* Çipin üzerindeki sayı o filtrenin tarif adedi. Sonuç en dar filtreyi aşamaz;
       her ek filtre kalanı bir miktar daraltır. Etiketle çelişen sayı gösterme. */
    var sayilar = secili.map(function (o) {
      var m = /(\d+)\s*$/.exec(o.textContent.trim());
      return m ? parseInt(m[1], 10) : null;
    }).filter(function (x) { return x; });
    var taban = sayilar.length ? Math.min.apply(null, sayilar) : 2057;
    var res = n ? Math.max(8, Math.round(taban * Math.pow(0.86, n - 1))) : 2057;
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
  frRender(); trayRender(); trayList(); if (el('wzNext')) wzGoster(1);

  var boot = readHash();
  if (boot && viewOf(boot)) navigate(boot, true);
  after(true);                       // .view.top ve alt çubuk her hâlükârda işaretlensin
  writeHash(BYID[topEl().id]);
})();
