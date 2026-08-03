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


  /* ================= GÖRSEL TEMBELLEŞTİRME =================
     50 ekranın arka plan görselleri açılışta topluca iniyordu
     (content-visibility:hidden fetch'i durdurmuyor, JS'te temizlemek de geç
     kalıyor). Kapalı ekranlarda görsel KAYNAKTA data-bg olarak duruyor;
     ekran ilk açıldığında style'a taşınıyor. Ana sayfa dokunulmadı. */
  function bgUyan(view) {
    if (!view || view._bgOk) return;
    view._bgOk = true;
    all('[data-bg]', view).forEach(function (e) {
      e.style.backgroundImage = e.dataset.bg;
      e.removeAttribute('data-bg');
    });
  }
  all('.view').forEach(function (v) { if (v.classList.contains('on')) v._bgOk = true; });

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
    bgUyan(v);
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
    bgUyan(v);
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
    /* Hedef zaten yığındaysa push() sessizce düşüyordu (giriş ⇄ üye ol gibi
       çapraz bağlantılarda buton ölü görünüyordu). Oraya kadar geri sar. */
    var i = stack.indexOf(v.id);
    if (i > -1) { while (stack.length - 1 > i) pop(); return; }
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
      /* İç içe sekme grupları var (Yemek Modu > Sıfırdan Kur). Kapatırken yalnız
         BU gruba ait olanlara dokun; yoksa dış sekme iç paneli de söndürüyor. */
      var bizim = function (x) {
        return (x.closest('[data-tabs]') || n.closest('.view') || document) === scope;
      };
      all('[data-pane]', scope).forEach(function (x) { if (bizim(x)) x.classList.remove('on'); });
      all('.pane', scope).forEach(function (x) { if (bizim(x)) x.classList.remove('on'); });
      n.classList.add('on');
      /* kaydırılan sekme şeridinde aktif sekme görünür alana gelsin */
      var rail = n.closest('.segs-scroll');
      if (rail) rail.scrollTo({ left: Math.max(0, n.offsetLeft - 90), behavior: 'smooth' });
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

    /* --- onay kutusu --- */
    if ((n = t.closest('[data-chk]'))) { e.preventDefault(); n.classList.toggle('on'); return; }

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
    frGrid(n, adlar);
  }

  /* Sonuç ızgarası boş bir kabuktu — eşleşme rozetiyle gerçek kart üretiliyor.
     Eşleşme sayısı seçilen malzeme adediyle birlikte artar. */
  var FR_TARIF = [
    ['Ezogelin Çorbası', '1410', 30, 'Kolay', '6 kişilik', 11, 'AT', 'Ayşe Tülin', 'ink', '4,9'],
    ['Köz Patlıcanlı Tavuk Sote', '2615', 40, 'Orta', '4 kişilik', 9, 'AB', 'Arda Bozkurt', 'tomato', '4,8'],
    ['Beşamelli Fırın Makarna', '1419', 45, 'Kolay', '6 kişilik', 10, 'AB', 'Arda Bozkurt', 'tomato', '4,9'],
    ['Akdeniz Mevsim Salatası', '1970', 15, 'Kolay', '2 kişilik', 7, 'SA', 'Selin Aydın', 'green-deep', '4,7'],
    ['Fırında Kıymalı Pide', '1494', 65, 'Orta', '4 kişilik', 12, 'KD', 'Kaan Demir', 'petrol', '4,7'],
    ['Yayla Çorbası — Naneli', '1406', 40, 'Kolay', '6 kişilik', 8, 'ZU', 'Zeynep Usta', 'purple', '4,7']
  ];
  function frGrid(n, adlar) {
    var g = el('frGrid');
    if (!g) return;
    if (!n) { g.innerHTML = ''; return; }
    g.innerHTML = FR_TARIF.map(function (r, i) {
      var var_ = Math.min(r[5], n + 2 + i % 2);       // elindeki malzeme sayısı arttıkça eşleşme artar
      return '<a class="gcard" data-open="tarif-detay">' +
        '<div class="im" style="background-image:url(\'assets/img/' + r[1] + '.webp\')">' +
        '<span class="tchip"><i class="fs i-clock"></i> ' + r[2] + ' dk</span></div>' +
        '<div class="bd"><h4>' + r[0] + '</h4>' +
        '<div class="match" style="position:static;margin:0 0 8px"><i class="fs i-check"></i> ' +
        var_ + '/' + r[5] + ' malzemen var</div>' +
        '<div class="gsub"><span>' + r[4] + '</span></div>' +
        '<div class="gchef"><span class="av" style="background:var(--' + r[8] + ')">' + r[6] +
        '</span><b>' + r[7] + '</b></div>' +
        '<div class="gstat"><span class="rate"><i class="fs i-star"></i> ' + r[9] +
        '</span><span class="dif">' + r[3] + '</span></div></div></a>';
    }).join('');
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
    all('#vWizard .wz-s').forEach(function (s2) {
      var i2 = +s2.dataset.wzs;
      s2.classList.toggle('on', i2 === k);
      s2.classList.toggle('done', i2 < k);
    });
    el('wzPrev').classList.toggle('off', k === 1);
    if (el('wzAlt')) el('wzAlt').style.display = k <= 4 ? '' : 'none';
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
    if (!card) return;
    var sec = function (q) { return card.querySelector(q); };
    var im = sec('.im');
    TRAY_DK[btn.dataset.tray] = {
      dk: parseInt(((sec('.tchip') || {}).textContent || '0').replace(/\D/g, ''), 10) || 0,
      img: im ? getComputedStyle(im).backgroundImage : '',
      kat: (sec('.rib') || {}).textContent || ''
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
    /* .scrbar görünürlüğü .on sınıfına bağlı; barTray data-bar ile eşleşmediği
       için hiç açılmıyordu — tepsi çubuğuna dokunulamıyordu. */
    var tb = el('barTray');
    if (tb) {
      var ac = !!(modda && tray.length);
      tb.hidden = !ac;
      tb.classList.toggle('on', ac);
    }
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


  /* ================= ARAMA (B3) =================
     Sonuç Tarifler ekranına düşer — canlıdaki /tarifler?q=… davranışı. */
  var SR_DB = [
    ['Ezogelin Çorbası', 'Çorba · 30 dk · Kolay'], ['Süzme Mercimek Çorbası', 'Çorba · 35 dk · Çok Kolay'],
    ['Mercimek Köftesi', 'Meze · 40 dk · Kolay'], ['Fırında Tereyağlı Mantı', 'Mantı · 75 dk · Orta'],
    ['Fırında Kıymalı Pide', 'Pizza ve Pide · 65 dk · Orta'], ['Ev Usulü Su Böreği', 'Hamur İşi · 90 dk · Zor'],
    ['Beşamelli Fırın Makarna', 'Makarna · 45 dk · Kolay'], ['Islak Kakaolu Kek', 'Kek ve Pasta · 50 dk · Kolay'],
    ['Köz Patlıcanlı Tavuk Sote', 'Tavuk ve Hindi · 40 dk · Orta'], ['Fırın Sütlaç', 'Tatlı · 55 dk · Kolay'],
    ['Akdeniz Mevsim Salatası', 'Salata · 15 dk · Kolay'], ['Yayla Çorbası', 'Çorba · 40 dk · Kolay'],
    ['Tarhana Çorbası', 'Çorba · 25 dk · Çok Kolay'], ['Zeytinyağlı Enginar', 'Zeytinyağlılar · 45 dk · Orta'],
    ['Tepsi Böreği', 'Hamur İşi · 70 dk · Orta'], ['Kremalı Mantar Çorbası', 'Çorba · 50 dk · Kolay'],
    ['Balık Çorbası — Ege Usulü', 'Çorba · 45 dk · Orta'], ['Fırında Tavuk But', 'Tavuk ve Hindi · 60 dk · Kolay']
  ];
  function srMod(hangi) {
    ['srIdle', 'srSug', 'srEmpty'].forEach(function (id) {
      var e = el(id); if (e) e.hidden = (id !== hangi);
    });
  }
  function srAra(q) {
    if (!el('srList')) return;
    q = q.trim();
    if (el('srX')) el('srX').hidden = !q;
    if (!q) { srMod('srIdle'); return; }
    var k = q.toLocaleLowerCase('tr');
    var hit = SR_DB.filter(function (r) { return r[0].toLocaleLowerCase('tr').indexOf(k) > -1; });
    if (!hit.length) { srMod('srEmpty'); return; }
    el('srList').innerHTML = hit.map(function (r) {
      var i = r[0].toLocaleLowerCase('tr').indexOf(k);
      var ad = r[0].slice(0, i) + '<b>' + r[0].slice(i, i + q.length) + '</b>' + r[0].slice(i + q.length);
      return '<button class="lrow ic-lead sr-hit" data-open="tarif-detay"><span class="ic">' +
             '<i class="fs i-magnifying-glass"></i></span><span class="tx"><b>' + ad + '</b><span>' +
             r[1] + '</span></span><i class="fs i-chevron-right go"></i></button>';
    }).join('');
    el('srN').textContent = hit.length + ' sonuç';
    el('srGo').textContent = 'Tüm sonuçları göster (' + hit.length + ')';
    el('srGo').dataset.q = q;
    srMod('srSug');
  }
  if (el('srQ')) el('srQ').addEventListener('input', function () { srAra(this.value); });
  if (el('srX')) el('srX').addEventListener('click', function () {
    el('srQ').value = ''; srAra(''); el('srQ').focus();
  });
  if (el('srReset')) el('srReset').addEventListener('click', function () {
    el('srQ').value = ''; srAra(''); el('srQ').focus();
  });
  if (el('srClear')) el('srClear').addEventListener('click', function () {
    el('srRecent').innerHTML = '<div class="fr-empty" style="padding:14px 16px">' +
      'Son arama geçmişin temizlendi.</div>';
    say('Arama geçmişi temizlendi');
  });
  if (el('srGo')) el('srGo').addEventListener('click', function () {
    var q = this.dataset.q || '';
    pop();
    setTimeout(function () { filtrelereGec([q], null); }, 200);
  });
  document.addEventListener('click', function (e) {
    var r = e.target.closest('#srRecent .lrow, #vSearch .poprail .chip');
    if (!r || !el('srQ')) return;
    var t = (r.querySelector('b') || r).textContent.trim();
    el('srQ').value = t; srAra(t);
  }, true);

  /* ================= YORUM YAZ (B8) ================= */
  var RW_LBL = ['', 'Olmadı', 'İdare eder', 'Fena değil', 'Beğendim', 'Harika oldu'];
  var RW_SUB = ['Puanın olmadan yorum gönderilemez', 'Ne ters gitti? Aşağıda anlat',
    'Eksik kalan neydi?', 'Neyi değiştirirdin?', 'Nesi iyiydi?', 'Başkalarına da anlat'];
  var rwStar = 0;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rw]');
    if (!b) return;
    rwStar = +b.dataset.rw;
    all('[data-rw]').forEach(function (x) { x.classList.toggle('on', +x.dataset.rw <= rwStar); });
    el('rwLbl').innerHTML = RW_LBL[rwStar] + '<span>' + RW_SUB[rwStar] + '</span>';
  });
  if (el('rwTxt')) el('rwTxt').addEventListener('input', function () {
    el('rwN').textContent = this.value.length;
  });
  if (el('rwSend')) el('rwSend').addEventListener('click', function () {
    if (!rwStar) { say('Önce yıldızlara dokunup puan ver'); return; }
    pop();
    setTimeout(function () { say('Yorumun gönderildi — moderasyondan sonra yayında'); }, 420);
  });

  /* ================= TARİF EKLE (B9) ================= */
  var raAdim = 1, RA_SON = 5;
  function raGoster(k) {
    raAdim = k;
    all('#vAddRec .ra-step').forEach(function (st) {
      st.classList.toggle('on', +st.dataset.rastep === k);
    });
    all('#raSteps .wz-s').forEach(function (s2) {
      var i = +s2.dataset.ras;
      s2.classList.toggle('on', i === k);
      s2.classList.toggle('done', i < k);
    });
    if (el('raPrev')) el('raPrev').classList.toggle('off', k === 1);
    if (el('raNext')) el('raNext').innerHTML = (k === RA_SON ? 'Tarifi Gönder' : 'Devam') +
      ' <i class="fs i-chevron-right"></i>';
    var v = el('vAddRec'); if (v) v.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (el('raNext')) el('raNext').addEventListener('click', function () {
    if (raAdim === RA_SON) {
      pop();
      setTimeout(function () { say('Tarifin editör kuyruğuna gönderildi'); raGoster(1); }, 420);
      return;
    }
    raGoster(raAdim + 1);
  });
  if (el('raPrev')) el('raPrev').addEventListener('click', function () {
    if (raAdim > 1) raGoster(raAdim - 1);
  });
  all('#raSteps .wz-s').forEach(function (b) {
    b.addEventListener('click', function () { raGoster(+b.dataset.ras); });
  });
  var raPor = 4;
  function raPorSync() { if (el('raP')) el('raP').textContent = raPor; }
  if (el('raPlus')) el('raPlus').addEventListener('click', function () { if (raPor < 24) { raPor++; raPorSync(); } });
  if (el('raMinus')) el('raMinus').addEventListener('click', function () { if (raPor > 1) { raPor--; raPorSync(); } });


  /* --- tarif ızgarası: 2 kolon / tek kolon görünümü --- */
  if (el('lView')) el('lView').addEventListener('click', function () {
    var g = document.querySelector('#vList .ggrid');
    if (!g) return;
    var tek = g.classList.toggle('one');
    this.innerHTML = tek ? '<i class="fs i-layer-group"></i>' : '<i class="fs i-layer-group"></i>';
    say(tek ? 'Tek kolon görünümü' : 'Izgara görünümü');
  });


  /* ================= ÖLÇÜ BİRİMLERİ (C7) =================
     Canlı /olcu-birimleri verisi. Dönüştürücü gerçekten çeviriyor:
     [su bardağı, yemek kaşığı, tatlı kaşığı, çay kaşığı] gram karşılıkları.
     null = o ölçekte anlamlı değil (bir bardak karabiber ölçülmez). */
  var OLCU = {
    un: ['Unlar ve Tozlar', [
      ['Un (buğday)', 125, 8, 4, 3], ['Tam Buğday Unu', 130, 9, 5, 3], ['Mısır Unu', 130, 9, 5, 3],
      ['Nişasta', 130, 9, 5, 3], ['Pirinç Unu', 135, 9, 5, 3], ['Çavdar Unu', 120, 8, 4, 3],
      ['Yulaf Unu', 95, 6, 3, 2], ['Karabuğday Unu', 125, 8, 4, 3], ['Badem Unu', 100, 7, 4, 2],
      ['Hindistan Cevizi Unu', 130, 9, 5, 3], ['İrmik', 165, 16, 8, 5]]],
    tahil: ['Tahıllar', [
      ['Pirinç (Baldo)', 190, 20, 10, 6], ['Pirinç (Beyaz)', 185, 19, 10, 6], ['Bulgur (Pilavlık)', 170, 18, 9, 5],
      ['Bulgur (Köftelik)', 145, 15, 8, 5], ['Yulaf', 90, 7, 4, 2], ['Kuskus', 175, 16, 8, 5],
      ['Arpa (Pilavlık)', 200, 20, 10, 6], ['Kinoa', 175, 18, 9, 5], ['Karabuğday', 170, 17, 9, 5],
      ['Aşurelik Buğday', 190, 19, 10, 6], ['Esmer Pirinç', 185, 19, 10, 6], ['Darı', 200, 20, 10, 6]]],
    bakliyat: ['Bakliyatlar', [
      ['Nohut', 180, 17, 9, 5], ['Yeşil Mercimek', 185, 18, 9, 5], ['Kırmızı Mercimek', 195, 19, 10, 6],
      ['Kuru Fasulye', 175, 17, 9, 5], ['Barbunya', 175, 17, 9, 5], ['Börülce', 170, 16, 8, 5],
      ['Meksika Fasulyesi', 175, 17, 9, 5], ['Kuru Bezelye', 195, 19, 10, 6]]],
    seker: ['Şeker ve Tatlandırıcılar', [
      ['Toz Şeker', 180, 15, 8, 5], ['Pudra Şekeri', 120, 8, 4, 3], ['Esmer Şeker', 165, 13, 7, 4],
      ['Bal', 280, 22, 11, 7], ['Pekmez', 280, 22, 11, 7], ['Akçaağaç Şurubu', 265, 21, 10, 6],
      ['Mısır Şurubu', 275, 21, 11, 7], ['Stevia', null, 6, 3, 2]]],
    sivi: ['Sıvılar, Yağlar ve Sirkeler', [
      ['Su', 200, 15, 5, 4], ['Zeytinyağı', 185, 14, 5, 4], ['Ayçiçek Yağı', 185, 14, 5, 4],
      ['Tereyağı', 195, 15, 8, 5], ['Margarin', 190, 15, 8, 5], ['Domates Salçası', 230, 18, 9, 6],
      ['Biber Salçası', 230, 18, 9, 6], ['Susam Yağı', 185, 14, 5, 4], ['Elma Sirkesi', 200, 15, 5, 4],
      ['Üzüm Sirkesi', 200, 15, 5, 4], ['Balzamik Sirke', 200, 15, 5, 4], ['Limon Suyu', 200, 15, 5, 4]]],
    sut: ['Süt ve Süt Ürünleri', [
      ['Süt', 200, 15, 5, 4], ['Yoğurt', 210, 16, 8, 5], ['Ayran', 200, 15, 5, 4], ['Krema', 200, 15, 8, 5],
      ['Süt Tozu', 110, 8, 4, 3], ['Kaymak', 200, 15, 8, 5], ['Rendelenmiş Peynir', 115, 8, 4, 3],
      ['Kefir', 200, 15, 5, 4]]],
    kuru: ['Kuruyemişler ve Tohumlar', [
      ['Ceviz', 100, 8, 4, 2], ['Fındık', 140, 10, 5, 3], ['Badem', 150, 11, 5, 3],
      ['Antep Fıstığı', 120, 9, 5, 3], ['Kaju', 115, 8, 4, 3], ['Yer Fıstığı', 145, 11, 5, 3],
      ['Çam Fıstığı', 140, 10, 5, 3], ['Ay Çekirdeği', 130, 9, 5, 3], ['Kabak Çekirdeği', 125, 9, 5, 3],
      ['Susam', 145, 9, 5, 3], ['Haşhaş', 145, 9, 5, 3], ['Chia Tohumu', 150, 9, 5, 3],
      ['Keten Tohumu', 140, 9, 5, 3], ['Hindistan Cevizi (Rende)', 55, 4, 2, 1], ['Kuru Üzüm', 150, 11, 6, 3],
      ['Hurma', 150, 12, 6, 4], ['Kuru İncir', 150, 12, 6, 4]]],
    baharat: ['Baharatlar', [
      ['Karabiber', null, 7, 4, 2], ['Kaya Tuzu', 220, 18, 9, 5], ['Pul Biber', null, 6, 3, 2],
      ['Tane Karabiber', null, 9, 5, 3], ['Tuz', 250, 20, 10, 5], ['Kimyon', null, 7, 4, 2],
      ['Tarçın', null, 8, 4, 2.5]]],
    hamur: ['Hamur ve Pastacılık', [
      ['Kabartma Tozu', null, 12, 6, 4], ['Karbonat', null, 14, 7, 4], ['Vanilin', null, 8, 4, 2],
      ['Kakao', 100, 7, 4, 2], ['Instant Maya', null, 9, 5, 3], ['Kuru Maya', null, 9, 5, 3],
      ['Yaş Maya', null, 15, 8, 5]]],
    kahvalti: ['Kahvaltılık Ürünler', [
      ['Reçel', 260, 20, 10, 6], ['Tahin', 230, 18, 9, 6], ['Fıstık Ezmesi', 240, 16, 8, 5],
      ['Çikolata Kreması', 250, 19, 10, 6], ['Krem Peynir', 195, 15, 8, 5]]],
    sos: ['Soslar ve Hazır Ürünler', [
      ['Ketçap', 240, 18, 9, 6], ['Mayonez', 220, 16, 8, 5], ['Hardal', 230, 17, 9, 6],
      ['Soya Sosu', 200, 15, 5, 4], ['Nar Ekşisi', 250, 18, 9, 6], ['Acı Sos', 220, 16, 8, 5],
      ['Barbekü Sosu', 235, 17, 9, 6], ['Teriyaki Sos', 240, 18, 9, 6], ['Ranch Sos', 200, 15, 8, 5],
      ['Worcestershire Sos', 200, 15, 5, 4]]]
  };
  var OLCU_AD = { cup: 'su bardağı', tbsp: 'yemek kaşığı', dsp: 'tatlı kaşığı', tsp: 'çay kaşığı' };
  var OLCU_IX = { cup: 1, tbsp: 2, dsp: 3, tsp: 4 };
  /* sıvılarda gram yerine ml okunur — canlıdaki gösterim böyle */
  var SIVI = ['Su', 'Elma Sirkesi', 'Üzüm Sirkesi', 'Balzamik Sirke', 'Limon Suyu',
              'Süt', 'Ayran', 'Kefir', 'Soya Sosu', 'Worcestershire Sos'];

  function olcuTumu() {
    var l = [];
    Object.keys(OLCU).forEach(function (k) {
      OLCU[k][1].forEach(function (r) { l.push(r); });
    });
    return l.sort(function (a, b) { return a[0].localeCompare(b[0], 'tr'); });
  }
  function olcuBul(ad) {
    var t = olcuTumu();
    for (var i = 0; i < t.length; i++) if (t[i][0] === ad) return t[i];
    return null;
  }
  function fmtG(n) {
    n = Math.round(n * 10) / 10;
    return String(n).replace('.', ',');
  }
  function cvRender() {
    if (!el('cvIng')) return;
    var r = olcuBul(el('cvIng').value);
    if (!r) return;
    var u = el('cvUnit').value, q = parseFloat(el('cvQty').value);
    var g = r[OLCU_IX[u]];
    var birim = SIVI.indexOf(r[0]) > -1 ? 'ml' : 'gram';
    var qAd = { '1': '1', '0.5': 'yarım', '0.25': 'çeyrek', '2': '2', '3': '3', '4': '4' }[el('cvQty').value];
    if (g === null) {
      el('cvOut').textContent = 'Bardakla ölçülmez';
      el('cvNote').textContent = r[0] + ' bardak ölçüsünde anlamlı değil — kaşık ölçüsünü kullan.';
    } else {
      el('cvOut').textContent = fmtG(g * q) + ' ' + birim;
      el('cvNote').textContent = qAd + ' ' + OLCU_AD[u] + ' ' + r[0].toLocaleLowerCase('tr') +
        ' ≈ ' + fmtG(g * q) + ' ' + birim + '. Değerler ortalamadır; nem ve sıkışıklığa göre ±%10 oynar.';
    }
    el('cvEq').innerHTML = ['cup', 'tbsp', 'dsp', 'tsp'].map(function (k) {
      var v = r[OLCU_IX[k]];
      return '<div><b>' + (v === null ? '—' : fmtG(v)) + '</b><span>1 ' + OLCU_AD[k] + '</span></div>';
    }).join('');
  }
  if (el('cvIng')) {
    el('cvIng').innerHTML = olcuTumu().map(function (r) {
      return '<option' + (r[0] === 'Un (buğday)' ? ' selected' : '') + '>' + r[0] + '</option>';
    }).join('');
    ['cvIng', 'cvQty', 'cvUnit'].forEach(function (id) {
      el(id).addEventListener('change', cvRender);
    });
    cvRender();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cv]');
    if (!b || !el('cvIng')) return;
    all('#cvPop .fopt').forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    el('cvIng').value = b.dataset.cv;
    cvRender();
  });

  /* dönüşüm tabloları */
  function tbRender(k) {
    if (!el('tbBody')) return;
    var g = OLCU[k];
    el('tbTitle').textContent = g[0] + ' — ' + g[1].length + ' malzeme';
    el('tbBody').innerHTML = g[1].map(function (r) {
      var sivi = SIVI.indexOf(r[0]) > -1 ? ' ml' : ' g';
      return '<tr><td>' + r[0] + '</td>' + [1, 2, 3, 4].map(function (i) {
        return r[i] === null ? '<td class="dash">—</td>' : '<td>' + fmtG(r[i]) + sivi + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tb]');
    if (!b) return;
    all('#tbCats .fopt').forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    tbRender(b.dataset.tb);
  });
  tbRender('un');

  /* ================= LİSTE FİLTRESİ =================
     data-filter="<listeId>" taşıyan her arama alanı o listeyi süzer.
     Ansiklopedi, sözlük, alışveriş listesi — hepsi aynı davranış. */
  all('[data-filter]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var kutu = el(this.dataset.filter);
      if (!kutu) return;
      var q = this.value.trim().toLocaleLowerCase('tr');
      var bulunan = 0, sonHarf = null, harfVar = {};
      all('.lrow', kutu).forEach(function (r) {
        var ok = !q || r.textContent.toLocaleLowerCase('tr').indexOf(q) > -1;
        r.hidden = !ok;
        if (ok) bulunan++;
      });
      /* harf başlığı: altında görünen satır kalmadıysa başlık da gizlensin */
      all('.azh', kutu).forEach(function (h) {
        var n = 0;
        for (var x = h.nextElementSibling; x && !x.classList.contains('azh'); x = x.nextElementSibling) {
          if (x.classList.contains('lrow') && !x.hidden) n++;
        }
        h.hidden = !n;
      });
      var bos = kutu.querySelector('.lst-empty');
      if (!bos) {
        bos = document.createElement('div');
        bos.className = 'lst-empty fr-empty';
        bos.style.cssText = 'padding:30px 16px;text-align:center;display:block';
        kutu.appendChild(bos);
      }
      bos.textContent = '“' + this.value.trim() + '” için sonuç yok. Daha kısa bir kelime dene.';
      bos.hidden = !!bulunan;
    });
  });


  /* ================= VİDEO OYNATICI (C11) ================= */
  var vdRun = false, vdInt = null, vdSec = 0, VD_TOP = 324;   // 05:24
  function vdMMSS(n) { return pad(Math.floor(n / 60)) + ':' + pad(n % 60); }
  function vdSync() {
    if (!el('vdTr')) return;
    el('vdTr').style.width = (vdSec / VD_TOP * 100) + '%';
    el('vdTm').textContent = vdMMSS(vdSec) + ' / ' + vdMMSS(VD_TOP);
    var ik = vdRun ? 'i-xmark' : 'i-play';
    ['vdPlay', 'vdPlay2'].forEach(function (id) {
      if (el(id)) el(id).innerHTML = '<i class="fs ' + ik + '"></i>';
    });
  }
  function vdToggle() {
    vdRun = !vdRun;
    clearInterval(vdInt);
    if (vdRun) {
      vdInt = setInterval(function () {
        if (vdSec < VD_TOP) { vdSec++; vdSync(); }
        else { vdRun = false; clearInterval(vdInt); vdSync(); say('Video bitti — sıradaki bölüm hazır'); }
      }, 1000);
    }
    vdSync();
  }
  ['vdPlay', 'vdPlay2'].forEach(function (id) {
    if (el(id)) el(id).addEventListener('click', vdToggle);
  });
  vdSync();

  /* ================= DADA ROUTE (D1) ================= */
  var RT_KM = ['Tam yol üstü', '5 km', '10 km', '12 km', '20 km'];
  if (el('rtKm')) el('rtKm').addEventListener('input', function () {
    el('rtKmV').textContent = RT_KM[this.value] || RT_KM[2];
  });
  if (el('rtSwap')) el('rtSwap').addEventListener('click', function () {
    var f = all('#vRoute .rt-f input');
    if (f.length < 2) return;
    var t = f[0].value; f[0].value = f[1].value; f[1].value = t;
    say('Kalkış ve varış değiştirildi');
  });
  if (el('rtGo')) el('rtGo').addEventListener('click', function () { open('route-sonuc'); });

  /* durak kartındaki "Güzergâha Ekle" gerçekten ekliyor */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.rt-c .ad');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var ekli = b.classList.toggle('on');
    b.innerHTML = ekli ? '<i class="fs i-check"></i> Güzergâhta' : '<i class="fs i-plus"></i> Güzergâha Ekle';
    var ad = (b.closest('.rt-c').querySelector('h4') || {}).textContent || 'Durak';
    say(ekli ? ad + ' güzergâha eklendi' : ad + ' güzergâhtan çıkarıldı');
  }, true);


  /* ================= ALIŞVERİŞ LİSTESİ (F4) ================= */
  function slSync() {
    if (!el('slDone')) return;
    var hepsi = all('#vShop [data-sl]');
    var alinan = hepsi.filter(function (r) { return r.classList.contains('on'); }).length;
    el('slDone').textContent = alinan;
    el('slAll').textContent = hepsi.length;
    el('slTr').style.width = (hepsi.length ? alinan / hepsi.length * 100 : 0) + '%';
  }
  document.addEventListener('click', function (e) {
    var r = e.target.closest('#vShop [data-sl]');
    if (!r) return;
    r.classList.toggle('on');
    slSync();
  });
  if (el('slAddBtn')) el('slAddBtn').addEventListener('click', function () {
    var v = (el('slAdd').value || '').trim();
    if (!v) { say('Önce malzeme adı yaz'); return; }
    var d = document.createElement('div');
    d.className = 'sl-r';
    d.setAttribute('data-sl', '');
    d.innerHTML = '<span class="bx"><i class="fs i-check"></i></span><span class="tx"><b>' + v +
                  '</b><span>Elle eklendi</span></span><span class="qt">1 adet</span>';
    el('slList').appendChild(d);
    el('slAdd').value = '';
    slSync(); say(v + ' listeye eklendi');
  });
  if (el('slDoneBtn')) el('slDoneBtn').addEventListener('click', function () {
    var n = all('#vShop [data-sl].on');
    if (!n.length) { say('Henüz işaretlenmiş madde yok'); return; }
    n.forEach(function (r) { r.remove(); });
    slSync(); say(n.length + ' madde listeden çıkarıldı');
  });
  slSync();

  /* ================= BİLDİRİMLER (F6) ================= */
  if (el('ntRead')) el('ntRead').addEventListener('click', function () {
    var n = all('#vNotif .nt-r.unread');
    if (!n.length) { say('Okunmamış bildirim yok'); return; }
    n.forEach(function (x) { x.classList.remove('unread'); });
    say(n.length + ' bildirim okundu olarak işaretlendi');
  });

  /* ================= PROFİL / GİRİŞ / ÜYE OL ================= */
  if (el('peSave')) el('peSave').addEventListener('click', function () {
    pop(); setTimeout(function () { say('Profilin güncellendi'); }, 420);
  });
  if (el('loginGo')) el('loginGo').addEventListener('click', function () {
    pop(); setTimeout(function () { say('Hoş geldin Elif — defterin hazır'); }, 420);
  });
  if (el('signupGo')) el('signupGo').addEventListener('click', function () {
    popAll(); open('onboarding');
  });
  if (el('ctSend')) el('ctSend').addEventListener('click', function () {
    pop(); setTimeout(function () { say('Mesajın gönderildi — 1 iş günü içinde dönüş yapacağız'); }, 420);
  });
  if (el('chFollow')) el('chFollow').addEventListener('click', function () {
    var on = this.classList.toggle('on');
    this.textContent = on ? '✓ Takiptesin' : '+ Takip Et';
    say(on ? 'Zeynep Usta takip ediliyor' : 'Takipten çıkıldı');
  });

  /* ================= ONBOARDING (F11) ================= */
  var obAdim = 1, OB_SON = 4;
  function obGoster(k) {
    obAdim = k;
    all('#vOnboard .ob-s').forEach(function (s2) {
      s2.classList.toggle('on', +s2.dataset.ob === k);
    });
    if (el('obPrev')) el('obPrev').classList.toggle('off', k === 1);
    if (el('obNext')) el('obNext').innerHTML = (k === OB_SON ? 'Mutfağa Başla' : 'Devam') +
      ' <i class="fs i-chevron-right"></i>';
    if (el('obSkip')) el('obSkip').style.display = k === OB_SON ? 'none' : '';
    var v = el('vOnboard'); if (v) v.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function obBitir() {
    popAll();
    goRoot('ana-sayfa');
    setTimeout(function () { say('Hoş geldin! Mutfak seni bekliyor'); obGoster(1); }, 420);
  }
  if (el('obNext')) el('obNext').addEventListener('click', function () {
    if (obAdim === OB_SON) { obBitir(); return; }
    obGoster(obAdim + 1);
  });
  if (el('obPrev')) el('obPrev').addEventListener('click', function () {
    if (obAdim > 1) obGoster(obAdim - 1);
  });
  if (el('obSkip')) el('obSkip').addEventListener('click', obBitir);
  obGoster(1);


  /* ================= SİL / EKLE =================
     Kart köşesindeki çarpı yalnız toast gösteriyordu — kullanıcıya "buton
     çalışmıyor" gibi görünüyor. data-rm kapsayıcıyı gerçekten kaldırır,
     data-add gerçekten satır ekler. */
  var FOTO = ['assets/img/1970.webp', 'assets/img/1598.webp', 'assets/img/1494.webp',
              'assets/img/1587.webp', 'assets/img/1738.webp'];
  var fotoIx = 0;

  function raNumaraSync() {
    all('#vAddRec .ra-st').forEach(function (st, i) {
      var n = st.querySelector('.hd .n');
      if (n) n.textContent = i + 1;
    });
    var ek = document.querySelector('#vAddRec [data-add="step"]');
    if (ek) ek.innerHTML = '<i class="fs i-plus"></i> Adım ekle (' +
      (all('#vAddRec .ra-st').length + 1) + '. adım)';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      var kap = b.closest(b.dataset.rm);
      if (!kap) return;
      var kardes = kap.parentElement.querySelectorAll(b.dataset.rm).length;
      if (kardes <= 1 && b.dataset.rm !== '.ph-t') {
        say('Son satırı silemezsin — en az bir tane kalmalı');
        return;
      }
      kap.remove();
      if (b.dataset.rm === '.ra-st') raNumaraSync();
      say(b.dataset.rmSay || 'Kaldırıldı');
      return;
    }

    var a = e.target.closest('[data-add]');
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    var tip = a.dataset.add;

    if (tip === 'ig') {
      var satir = document.createElement('div');
      satir.className = 'ra-ig';
      satir.innerHTML = '<input class="fm-in qt" type="text" placeholder="1" />' +
        '<input class="fm-in un" type="text" placeholder="adet" />' +
        '<input class="fm-in nm" type="text" placeholder="Malzeme" />' +
        '<button class="rm" data-rm=".ra-ig" data-rm-say="Malzeme çıkarıldı" ' +
        'aria-label="Malzemeyi çıkar"><i class="fs i-xmark"></i></button>';
      a.parentElement.insertBefore(satir, a);
      var ilk = satir.querySelector('.qt'); if (ilk) ilk.focus();
      say('Malzeme satırı eklendi');
      return;
    }

    if (tip === 'step') {
      var kart = document.createElement('div');
      kart.className = 'ra-st';
      var no = all('#vAddRec .ra-st').length + 1;
      kart.innerHTML = '<div class="hd"><span class="n">' + no + '</span>' +
        '<b>Yeni adım</b><button class="rm" data-rm=".ra-st" data-rm-say="Adım silindi" ' +
        'aria-label="Adımı sil"><i class="fs i-trash"></i></button></div>' +
        '<textarea class="fm-ta" rows="3" placeholder="Bu adımda ne yapılıyor?"></textarea>' +
        '<div class="tools"><button data-toast="Adım görseli eklendi">' +
        '<i class="fs i-camera"></i> Görsel</button>' +
        '<button data-toast="Zamanlayıcı eklendi"><i class="fs i-clock"></i> Süre</button></div>';
      a.parentElement.insertBefore(kart, a);
      raNumaraSync();
      var ta = kart.querySelector('textarea'); if (ta) ta.focus();
      say(no + '. adım eklendi');
      return;
    }

    if (tip === 'foto') {
      var grid = a.closest('.ph-grid');
      if (!grid) return;
      if (all('.ph-t', grid).length >= 4) { say('En fazla 4 fotoğraf ekleyebilirsin'); return; }
      var t = document.createElement('span');
      t.className = 'ph-t';
      t.style.backgroundImage = "url('" + FOTO[fotoIx++ % FOTO.length] + "')";
      t.innerHTML = '<button class="rm" data-rm=".ph-t" data-rm-say="Fotoğraf kaldırıldı" ' +
        'aria-label="Fotoğrafı kaldır"><i class="fs i-xmark"></i></button>';
      grid.insertBefore(t, grid.firstElementChild);
      var bos = grid.querySelector('.ph-add:not([data-add])');
      if (bos && all('.ph-t', grid).length + all('.ph-add[data-add]', grid).length > 4) bos.remove();
      say('Fotoğraf eklendi');
    }
  }, true);

  /* ================= KLAVYE (masaüstü önizleme) ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (closeTopLayer()) return;
    pop();
  });

  /* ================= AÇILIŞ =================
     #/ekran ile gelen link doğrudan o ekranı açar. */
  frRender(); trayRender(); trayList(); if (el('wzNext')) wzGoster(1);
  if (el('raNext')) raGoster(1);

  var boot = readHash();
  if (boot && viewOf(boot)) navigate(boot, true);
  after(true);                       // .view.top ve alt çubuk her hâlükârda işaretlensin
  writeHash(BYID[topEl().id]);
})();
