# DadaGastro Mobil Prototipi — DURUM

> **Yeni bir oturum bu dosyayla tek başına devam edebilmeli.**
> Kurallar `CLAUDE.md`'de, ekran listesi `EKRAN-ENVANTERI.md`'de.
> Bu dosya: nerede kaldık, ne karar verildi, sırada ne var.

Canlı: **https://by4r.github.io/dadagastro-app-preview/**
Geliştirme: `python3 -m http.server 8000` → `http://localhost:8000`


---

## 0. DEVİR — bir sonraki oturum buradan başlasın

**Son tur (4 Ağustos 2026, üçüncü tur) ne değişti — beş madde:**

1. **Hero sayaç satırı tam genişliğe yayıldı.** Sayaçlar sola kümelenip sağda
   kocaman boşluk bırakıyordu. Sütunlar eşit (`flex:1 1 0`), **ilk sola · son
   sağa · ortadakiler ortalanmış**. 2 ya da 4 sayaçta da bozulmuyor; ayraç
   çizgisi de aynı genişlikte. Kural bütün hero'larda aynı.
2. **Hero'dan sonraki ilk blok 20px aşağıda.** Tek yerde verildi:
   `.mh-hero{margin-bottom:20px}`. Kardeş margin'i çöktüğü için daha büyük
   isteyen blok (ör. `.sec` 30) kazanır, 20 tabandır. Ekran ekran yama yok.
3. **Input altı yardım metni:** input → **10**, yardım metni → sonraki blok
   **20**. Prototipteki her yardım metni (`.fr-note` · `.fm-hint`) aynı.
4. **Dolapta ritmi:** buton çifti → 16 → açıklama → 16 → mod kartları → 16 →
   mod açıklaması → 16 → input → 10 → yardım metni → 20 → kategoriler.
   Açıklama metinleri `--ink-2`, 13/1.5.
5. **Hero'su olmayan 9 modül ekranına hero eklendi** — Ne Pişirsem · Tarif Ekle ·
   Tarif Defterim · Alışveriş Listem · Paylaştığım Tarifler · Canlı Liderlik ·
   Onur Listesi · Gizlilik · KVKK. Sihirbazlarda sayaç yerine **adım göstergesi**
   (`ADIM 1 / 4` + ilerleme çubuğu) var; görsel, overlay ve app bar davranışı
   diğerleriyle birebir aynı.

**Yol boyunca çıkan gerçek hatalar:**

| Hata | Düzeltme |
|---|---|
| `ne-pisirsem` ve `dolapta` `.view-pad` kullanıyordu | Yüksekliği yalnız `.view.root`'ta tanımlı — 0'a düşüyor, son blok alt eylem çubuğunun altında kalıyordu. `.vw-pad vw-bar` verildi |
| `.sl-bar b{display:block}` | "3 / 11 alındı" alt alta düşüyordu; kapsayıcı kuralı iç yapıyı eziyordu |
| `.fm-ta` inline-block | Taban çizgisi boşluğu yüzünden altındaki yardım metni 10 yerine 16px aşağıdaydı |
| `.menu-c{margin-bottom:10px}` | 10 ölçek dışı — 12 yapıldı |
| `.fr-mz` CSS'te vardı, HTML'de yoktu | Ölü kural; boşluk `.fr-mzhead`'e taşındı |
| `liderlik · onur-listesi · gizlilik · kvkk` | Hero eklenince `.ar-title` blokları mükerrer başlık oluyordu — silindi |

### 🔨 AÇIK İŞ — sıradaki oturumun işi

**Sözlük ve Püf Noktası detayları hâlâ TEK ŞABLON.**
`sozluk-detay` 18 satırda hep "Al Dente", `puf-detay` hep "Pilav neden tane
tane olmaz?" açıyor. Ansiklopedide kurulan hat **aynen tekrarlanabilir**:

| Adım | Ansiklopedideki karşılığı |
|---|---|
| Canlıdan içerik çıkar | `.tools/canli-ansiklopedi.py <slug…>` → `ansiklopedi-veri.json` |
| Görselleri indir + WebP | `.tools/ansiklopedi-gorsel.py` → `deploy/assets/ans/` |
| Veri dosyasını üret | `.tools/ansiklopedi-js.py` → `deploy/js/ansiklopedi.js` (`window.ANS`) |
| Ekranı şablona çevir | `#vEncDet` iskelet, `ansBoya(slug)` dolduruyor |
| Liste satırını bağla | `data-ans="<slug>"` + `ansAc()` |
| Testle | `node .tools/akis.js ansiklopedi` |

Sözlük için `window.SOZ` + `data-soz`, püf için `window.PUF` + `data-puf`
aynı kalıpla yazılır. Canlı kaynaklar: `/mutfak-sozlugu/<slug>` ·
`/puf-noktalari/<slug>`.

### Dosya haritası — hangi iş nerede

| İş | Dosya / yer |
|---|---|
| **Modül hero bileşeni (CSS)** | `deploy/css/app.css` → `.mh-hero`, `.mh-bg`, `.mh-veil`, `.mh-grain`, `.mh-eyebrow`, `.mh-stat` (dosya sonuna yakın, "MODÜL HERO" yorum bloğu). **Tam kanama:** `margin:0 · border-radius:0 · padding:104px var(--gutter) 24px` |
| **Hero üstünde yüzen app bar** | `deploy/css/app.css` → `.vbar.overlay.mh-bar:not(.solid)` kuralları ("UYGULAMA KABUĞU DÜZELTMELERİ" bloğunun sonu) |
| **Modül hero verisi + üretici** | `.tools/mhero.py` → `HERO` sözlüğü (rota → görsel, eyebrow, başlık, alt başlık, sayaçlar). `hero_html()` panelı, `uygula()` ayrıca ekranın `<header class="vbar">` satırına `overlay mh-bar` basar. Çalıştır: `python3 .tools/mhero.py` (idempotent) |
| **Ana sayfa hero'su (tam kanama örneği)** | `deploy/css/app.css` → `.hero`, `.hero-bg`, `.hero-veil`, `.hero-grain` |
| **Ansiklopedi madde içerikleri** | `deploy/js/ansiklopedi.js` → `window.ANS` (43 madde). **Elle düzenleme yok**, üreteçle: `canli-ansiklopedi.py` → `ansiklopedi-js.py` |
| **Ansiklopedi görselleri** | `deploy/assets/ans/` → `<slug>.webp` 390×300 hero · `<slug>-t.webp` 132×132 ilgili madde kartı · `r<mediaId>.webp` 260×196 tarif kartı. Üretici `.tools/ansiklopedi-gorsel.py` |
| **Ansiklopedi ekran mantığı** | `deploy/js/app.js` → "MUTFAK ANSİKLOPEDİSİ" bloğu: `ansBoya(slug)` ekranı doldurur, `ansAc(slug)` açar, `ansYigin` madde geri yığını, `encHepsi()` kalan maddeleri `<template>`'ten yükler |
| **Ansiklopedi listesi** | `deploy/index.html` → `<section id="vEnc" data-route="ansiklopedi">`, satırlar `#encList`, kalan maddeler `<template id="encMore">`. Satırlar `.tools/ansiklopedi-liste.html`'den geliyor. **Part dosyası yok — index.html tek dosya** |
| **Ansiklopedi detay şablonu** | `deploy/index.html` → `<section id="vEncDet" data-route="ansiklopedi-detay">` — sadece iskelet, gövde `#ansGovde` içine JS basıyor |
| **Sözlük listesi / detayı** | `#vGloss` / `#vGlossDet` (aynı dosya) — **hâlâ tek şablon, açık iş** |
| **Scroll'da app bar opaklaşma** | `deploy/js/app.js` → **`bindBar(view)` fonksiyonu**. `.vbar.overlay` taşıyan bara `scrollTop > 4` olunca `.solid` ekler, durum çubuğu rengini `screen.classList` ile çevirir. Her `.view` için açılışta bağlanır |
| **Dolapta iki katmanlı mantık** | `deploy/js/app.js` → "DOLAPTA NE VAR" bloğu: `frState` (mod başına seçim), `frKatmanGoster()`, `frModGoster()`, `frBoya()`, `frRender()` |
| **Malzeme → fotoğraf eşlemesi** | `.tools/malzeme-esleme.json` (malzeme adı → dosya adı), görseller `deploy/assets/ing/tmdb-*.webp` |

### Build zinciri — **derleme adımı YOK**

`deploy/index.html` **tek dosyadır**, part dosyası birleştirilmiyor.
Python araçları dosyayı yerinde düzenler:

| Komut | Ne yapar |
|---|---|
| `python3 .tools/insert.py <fragman.html>` | Yeni ekran bölümlerini `index.html`'e sokar (aynı id varsa değiştirir — tekrar çalıştırmak güvenli) |
| `python3 .tools/mhero.py` | `HERO` sözlüğünden modül hero'larını üretip yerine koyar + `<header class="vbar">` satırlarına `overlay mh-bar` basar |
| `python3 .tools/canli-ansiklopedi.py <slug…>` | Canlı madde sayfalarını okur → `.tools/ansiklopedi-veri.json`. İlgili maddeleri bir seviye kovalar, hiçbir "ilgili" bağlantısı kapsam dışı kalmaz |
| `python3 .tools/ansiklopedi-gorsel.py` | JSON'daki canlı görselleri indirir, kırpar, WebP'ye çevirir → `deploy/assets/ans/` |
| `python3 .tools/ansiklopedi-js.py` | JSON → `deploy/js/ansiklopedi.js` + `#encList` satırları (`.tools/ansiklopedi-liste.html`) |

**Deploy:** `deploy/` klasörünün kendisi bir git deposu ve GitHub Pages kaynağı.

```bash
cd deploy && git add -A && git commit -m "…" && git push origin HEAD
```

Push'tan ~1–2 dakika sonra canlıya düşer. Doğrulama:

```bash
curl -s "https://by4r.github.io/dadagastro-app-preview/index.html?cb=$(date +%s)" | grep -c 'mh-hero'
```

### Test komutları

```bash
cd deploy && python3 -m http.server 8000 &     # araçlar localhost:8000 bekler

node .tools/lint-css.js        # sınıf adı · öksüz sınıf · önek kapsamı
node .tools/vqa.js             # 17 görsel kontrol × 50 ekran (rota otomatik)
node .tools/vqa.js dolapta     # tek ekran
node .tools/akis.js            # 19 uçtan uca akış
node .tools/akis.js ansiklopedi modul-hero       # tek akış
node .tools/faz0.js            # derin link · yığın · alt çubuk · data-say
node .tools/faz1.js            # kaldırılan modül izi
node .tools/carpi.js           # kapat/sil butonlarının eylemi var mı
node .tools/cap.js <rota>      # tam sayfa render → deploy/outputs/<rota>.png
node .tools/cap.js "olcu-birimleri#unTb"   # sekmeli ekranda pane seçerek
node .tools/canli-hero.js      # CANLI modül hero'larını ölçer (referans)

# bu turda eklenenler
node .tools/hero-kanama.js     # modül hero'ları tam kanama mı, app bar 0px'te şeffaf
                               # 200px'te opak mı — ikisinin de görüntüsü outputs/hero/
node .tools/vqa-dogrula.js     # vqa 16 ve 17 kasten hata enjekte edilince yakalıyor mu
node .tools/hero-denetim.js    # hero'su olması gereken ama olmayan ekran var mı
                               # (hero'suz açılması doğru olanlar MUAF tablosunda, gerekçeli)
node .tools/kontrast.js        # hero metinlerinin fotoğraf üstündeki kontrastı;
                               # metni saydamlaştırıp ARKASINDAKİ pikseli ölçer
node .tools/glif.js            # alt kümeye girmemiş FA glifi var mı (50 ekran + 43 madde)
node .tools/ans-ss.js <slug…>  # ansiklopedi maddesinin tam sayfa render'ı
```

**Kabul çizgisi:** `data-say` = 0 · `lint-css` temiz · `akis` 19/19 ·
`vqa` **0 bulgu** · `vqa-dogrula` 2/2 · `hero-kanama` 24/24 ·
`hero-denetim` gerekçesiz hero'suz ekran yok · `kontrast` eşik altı yok · `glif` temiz.

> "Ne Pişirsem sonunda 240px boşluk" istisnası **kapandı** — ekran hero aldı,
> boşluk kendiliğinden doldu. Artık bilinçli istisna kalmadı.

---

## 1. Durum: prototip tamamlandı

**50 ekran · 0 ölü buton · 18 uçtan uca akış geçiyor.**

| Faz | İş | Durum |
|---|---|---|
| **0** | Router iskeleti: `data-route` ile kendini kaydeden ekranlar, sınırsız derinlikte push/pop, `#/ekran` hash yönlendirme, tam olay delegasyonu | ✅ |
| **0** | Ortak komponent seti: liste satırı · A–Z dizini · akordeon · boş durum · iskelet · onay diyaloğu · paylaş sheet | ✅ |
| **1** | Sağlık sekmesi kaldırıldı, ana sayfa canlının bölüm sırasına dizildi, sayaçlar/kategoriler/filtreler canlıdan | ✅ |
| **2** | Ne Pişirsem (4 adım + menü kurucu) · Dolapta Ne Var (5 sekme, 185 malzeme) · Püf Noktaları kök sekmesi | ✅ |
| **2** | **Tarif akışı:** arama · kategori dizini (33 kategori + 50 mutfak) · kategori sonucu · tüm yorumlar · yorum yaz · Tarif Ekle (5 adım) | ✅ |
| **3** | **Mutfak Sırları:** püf detay · Ansiklopedi (A–Z, 26 kategori) · Sözlük (A–Z, 20 kategori) · **Ölçü Birimleri** (4 sekme, çalışan dönüştürücü) · Sofra Düzeni + detay | ✅ |
| **4** | **Video Mutfağı:** liste · oynatıcı (çalışan sayaç) · seriler · seri detay | ✅ |
| **5** | **Dada Route:** planlayıcı · sonuç + 15 filtre · durak detay | ✅ |
| **6** | **Topluluk:** Şefler · Şef profili · Canlı Liderlik · Onur Listesi · Rozetlerim | ✅ |
| **7** | **Hesap & sistem:** Profili Düzenle · Tarif Defterim · Alışveriş Listem · Tariflerim · Bildirimler · Ayarlar · Giriş · Üye Ol · Şifremi Unuttum · Onboarding | ✅ |
| **8** | **Kurumsal:** Hakkımızda · SSS · İletişim · Gizlilik · KVKK · Reklam Ver | ✅ |
| **9** | Süpürme: borç 97 → **0** · `#/kit-*` vitrin rotaları silindi · 16 akış testi yazıldı | ✅ |
| **10** | Mutfağa Giriş — **kapsam dışı bırakıldı**, gerekçe § 4.9 | ⛔ |
| **R1** | **Modül hero'ları** — 15 ekran tek `.mh-` bileşeniyle görselli + sayaçlı, veri canlıdan ölçüldü | ✅ |
| **R2** | **Dolapta iki katmanlı yapıya döndü** — birincil ikili toggle + dört mod kartı, mod başına ayrı state, 75 gerçek malzeme fotoğrafı | ✅ |
| **R3** | **Modül hero'ları tam kanama** — 14 ekran + ansiklopedi madde detayı; app bar hero'nun üstünde yüzüyor, scroll'da anında opaklaşıyor | ✅ |
| **R4** | **Mutfak Ansiklopedisi madde detayı** — 43 madde, içerik canlıdan; her satır kendi maddesini açıyor, madde düzeyinde geri yığını | ✅ |
| **R5** | **Boşluk ve tutarlılık** — hero sayaç satırı tam genişlik · hero altı 20px · input/yardım metni 10-20 · Dolapta ritmi · hero'suz kalan 9 modül ekranı hero aldı | ✅ |

---

## 2. Sayaçlar

| | Değer | Not |
|---|---|---|
| Ekran | **50** | `data-route` taşıyan bölüm sayısı |
| Ansiklopedi maddesi | **43** | Hepsi ayrı içerik; içerik + görsel canlıdan |
| `data-say` (**borç**) | **0** | 97'den indi — hedefe ulaşıldı |
| `data-toast` (gerçek geri bildirim) | 69 | "Bağlantı kopyalandı" gibi; borç değil |
| DOM düğümü (açılış) | 8.984 | Eşik 6.000'i aştı — § 7 |
| `index.html` / `app.css` / `app.js` | 355 / 161 / 77 KB | gzip: **62 / 32 / 22 KB** |
| `js/ansiklopedi.js` | 219 KB | gzip **61 KB** — 43 maddenin tam metni, § 7 |
| `assets/ans/` | 1,5 MB · 178 dosya | Madde kapağı + küçük görsel + tarif kartı fotoğrafı; hepsi ekran açılınca iniyor |
| Uçtan uca akış | **19 / 19** | `ansiklopedi` akışı eklendi |
| `.mh-hero` taşıyan ekran | **24** | 23 modül + ansiklopedi madde detayı |
| Hero'suz ama gerekçeli ekran | **26** | `hero-denetim.js` → `MUAF` tablosu; gerekçesiz kalan **0** |
| `vqa` bulgusu | **0** | Ne Pişirsem 240px istisnası kapandı (ekran hero aldı) |

**Borcun anlamı:** `data-say` = "bu butonun ekranı henüz yok". `data-toast` = işlem
gerçekten oldu, ekran gerekmiyor. İkisi de toast gösterir; ayrım kabul testi içindir.

---

## 3. Denetim araçları — her değişiklikten sonra çalıştır

```bash
node .tools/lint-css.js   # sınıf adı sözleşmesi + öksüz sınıf taraması
node .tools/vqa.js        # 15 görsel kontrol × 50 ekran (rota otomatik keşfedilir)
node .tools/faz0.js       # derin link · yığın · alt çubuk · borç sayacı
node .tools/faz1.js       # kaldırılan modül izi · bölüm sırası · sekme
node .tools/akis.js       # 18 uçtan uca kullanıcı akışı
node .tools/carpi.js      # her kapat/sil butonunun gerçekten bir eylemi var mı
node .tools/cap.js <rota> # tam sayfa render (rota#paneId ile sekme seçilebilir)
```

### `vqa.js` — 15 kontrol

1–13: satır yüksekliği · taşma · yapışıklık · ray hizası · boşluk ölçeği · buton hizası ·
ritim · görsel çıpa · boş alan · segmented control · çip stili · kardeş boşluğu ·
kapsayıcı iç boşluğu.

**14 — kardeş kutuları geometrik çakışması** ve **15 — metin kontrastı** (< 2,2:1) bu turda
eklendi. 15. kontrol yazılır yazılmaz **iki gerçek hata yakaladı**: püf detaydaki görünmez
yazar alt metni (1,21:1) ve porsiyon sayacının renksiz `+/−` butonları (1,21:1).
Foto üstü beyaz yazı ve kasten soluk durumlar (devre dışı harf, pasif fiyat işareti) muaf.

### `lint-css.js`

- Yeni **tek başına** sınıf seçicisi 2–3 harfli önek taşımıyorsa kırmızı döner
- Router/durum sözlüğündeki ad (`on in behind top done off fin …`) komponent sınıfı olamaz
- **Öksüz sınıf:** HTML'de geçip CSS'te kuralı olmayan sınıf → kırmızı
  (`.tblwrap` böyle kaçmıştı: yeniden adlandırma CSS'e uygulandı, HTML'e değil)
- Faz 2 öncesi 347 sınıf grandfathered — onaylanmış tasarım sistemi, dokunulmuyor

---

## 4. Kalıcı kararlar

### 4.1 Kapsam dışı modüller — "olmayan modül görünmez"

| Modül | Sebep |
|---|---|
| Sağlık / Diyetisyen / Hesaplayıcılar | Canlıda "çok yakında", alt sayfalar 404. **Kök sekme dahil kaldırıldı** |
| Haftalık Menü Pro | Sağlık modülüne bağlı |
| DadaGourmet | `/gurme` 404 |
| DadaStore | `/store` 404 — tarif detayındaki ürün rayı dahil |
| Dada Akademi / DadaCampus | Sayfa yok |
| Topluluk akışı | Sayfa yok — "Topluluğa Katıl" yalnız CTA |
| **Mutfağa Giriş** | § 4.9 |

**Dada Route kapsam içinde** — `/yol-guzergahim` canlıda çalışıyor.

> `faz1.js` iz taraması iki **belgelenmiş istisna** tanır: `/giris`'teki "Diyetisyen"
> hesap tipi çipi ve `/reklam-ver`'deki "Haftalık Menü ve Alışveriş Sponsorluğu" paket adı.
> İkisi de canlıdan geliyor, kaldırılan modülle ilgisi yok.

### 4.2 Renk istisnaları

- **Yeşil `#3BB77E`** — onay/tamamlandı durum rengi. `.match` · `.ig.done` · `.step.done .num` ·
  `.cook-nav .next.fin` · `.sl-r.on` (alışveriş listesi) · `.vd-ep.on` (izlenen bölüm)
- **Petrol `#006072` / mor `#B14FC5`** — avatar rotasyonu, kişi ayırt edici.
  Tarif kartındaki "Yeni" şeridi de petrol
- **Gerçekten kapsam dışı tek renk: `#009D4F` (DadaFit)** — hiç kullanılmıyor

### 4.3 Krem — yüzey yasağı, metin değil

`#EFE5D3` ve `#F7F1E6` hiçbir yerde `background` olamaz. Koyu panel üzerindeki metin
tek token: **`--on-dark: #FFF6EA`**.

### 4.4 Modül hiyerarşisi (canlı navigasyondan)

**Üst seviye:** Tarifler · Ne Pişirsem? · Dolapta Ne Var? · **Püf Noktaları** · Mutfak Sırları
**Mutfak Sırları'nın altında:** Mutfak Ansiklopedisi · Sözlük · Ölçü Birimleri · Sofra Düzeni
*(Mutfağa Giriş § 4.9 gereği çıkarıldı — beşten dörde indi.)*

Püf Noktaları, Video Mutfağı ve Dada Route **üst seviyedir**, Mutfak Sırları'nın çocuğu değil.

### 4.5 Alt sekme çubuğu

```
Ana Sayfa · Tarifler · [FAB: Ne Pişirsem?] · Püf Noktaları · Hesap
```

### 4.6 Drawer (16 satır, hepsi çalışıyor — `akis.js drawer` doğruluyor)

| Grup | Satırlar |
|---|---|
| Mutfağım | Profilim · Tarif Defterim · Alışveriş Listem · Tariflerim |
| Mutfak Sırları | Mutfak Ansiklopedisi · Sözlük · Ölçü Birimleri · Sofra Düzeni |
| Keşfet & Pişir | Püf Noktaları · Video Mutfağı · Dada Route · Dolapta Ne Var? |
| Uygulama | Bildirimler · Ayarlar · Yardım & Destek · Hakkımızda · Gizlilik & KVKK |

### 4.7 Dikey boşluk doktrini

| İlişki | Boşluk |
|---|---|
| Aynı grubun öğeleri | 8 |
| Etiket ↔ kendi kontrolü | 8 |
| **Farklı komponent tipleri** | **16 minimum** |
| Alt bölüm ↔ alt bölüm | 20–24 |
| Bölüm ↔ bölüm | 30 |

⚠️ Boşluğu **dolguyla** vermek `vqa` 12. kontrolünü yanıltır (kardeş kutuları bitişik ölçülür).
Bloklar arası boşluk **margin** ile verilecek — `#raSteps` ve `.fm-wrap` bu yüzden düzeltildi.

### 4.8 Sınıf adı sözleşmesi — **çakışma dört kez çıktı**

`.sec` · `.ig-group` · `.gmeta` · **`.in`** (router durum sınıfı `.view.pushed.in`).
Dördü de yeni bir komponentin, zaten anlamı olan bir adı ikinci kez kullanmasıydı.

**Yeni komponent sınıfı tek başına seçiciyse 2–3 harfli önek taşır.**
Önekler: `sr-` arama · `ra-` tarif ekle · `fm-` form · `kt-` kategori kutucuğu ·
`rv-` yorumlar · `rw-` yorum yaz · `ar-` makale · `cv-` dönüştürücü · `tb-` tablo ·
`sx-` sayı paneli · `sd-` sofra düzeni · `vd-` video · `rt-` route · `lb-` liderlik ·
`bg-` rozet · `bk-` defter · `sl-` alışveriş · `nt-` bildirim · `st-` ayarlar ·
`au-` giriş/kayıt · `ob-` onboarding · `vw-` ekran iskeleti.

`node .tools/lint-css.js` bunu denetler. Kırmızı dönerse commit etme.

### 4.9 Mutfağa Giriş — kapsam dışı

`https://dadagastro.com/mutfaga-giris` **3 Ağustos 2026'da 404 döndü.** Canlının ana
sayfasında 6 modül listeleniyor ama hiçbiri açılmıyor.

TEMEL KURAL ("canlıda çalışmayan modül görünmez") gereği **tüm giriş noktaları kaldırıldı**:
ana sayfa bölümü · hızlı erişim kutucuğu · drawer satırı. "Yakında" toast'ı da bırakılmadı —
o da kural ihlali olurdu.

- Ana sayfadaki bölüm tek konuya indi: **"Mutfak Sırları → Ustaların küçük sırları"**,
  sekme şeridi kalktı, 4 püf noktası kartı kaldı
- Boşalan hızlı erişim kutucuğuna **Video Mutfağı** kondu
- Tasarım verilirse geri eklenebilir; `EKRAN-ENVANTERI.md` § I hâlâ duruyor

### 4.10 Ortak komponent — ekrana özel kopya yazılmaz

Bu hata üç kez çıktı: `.gmeta` · `.cf-r` · püf detaydaki yazar satırı.

**Kişi satırı = `.author`** (tarif detay · püf detay · şefler · ansiklopedi/sözlük yazarı ·
video · şef kartı). İç yapısı birebir:

```html
<div class="author">
  <span class="av">ZU</span>
  <span class="txt"><b>Ad</b><span class="sub">alt metin</span></span>
  <button class="follow">+ Takip Et</button>
</div>
```

`.txt` yerine `.tx` yazılınca `flex:1;min-width:0` uygulanmadı ve alt metin butonun altına
girdi; `.sub` yazılmayınca metin `body` rengini miras alıp beyaz kartta görünmez oldu.
**Dış sınıfı alıp içini uydurmak da kopya sayılır.** Komponent artık kendini savunuyor:
`flex:none` (buton), `min-width:0` (metin), ellipsis ve renk ata seçicide tanımlı.

### 4.11 Modül hero'su — tek bileşen (`.mh-`), TAM KANAMA

Canlıdaki modül giriş sayfalarının hero'su **ölçülerek** alındı
(`node .tools/canli-hero.js`). Perde reçetesi ana sayfa hero'sunun **aynısı**:
fotoğraf → perde (3 katman) → grain. Modülde tek fark en üstteki app bar
perdesi: ilk 98 px (status bar + app bar) ek koyulaşma alır, 152 px'te biter.

**Kart değil, tam kanama:** `margin:0` · `border-radius:0` ·
`padding:104px var(--gutter) 24px`. 104 = status bar 44 + app bar 54 + 6 —
ölçek dışı ama sistem ölçüsünden türüyor, ana sayfa `.hero`'suyla birebir aynı.
Görsel **status bar'ın arkasından** başlar, alt kenar keskindir; yumuşak geçiş
ya da alt radius yok. Görsel tam kanar, **metin gutter'lı** (16 px) — sayaç
üstündeki ince ayraç da 16 hizasında.

**App bar hero'nun İÇİNDE bir katmandır**, ayrı beyaz şerit yoktur:
`<header class="vbar overlay mh-bar">`. Tepedeyken zemin şeffaf, başlık ve
ikon `--on-dark`, ikon butonu **koyu-şeffaf düz zemin** (`rgba(14,12,8,.30)`) —
beyaz %18 açık fotoğrafta kayboluyordu, cam/blur yasak. `scrollTop > 4`'te
`bindBar()` `.solid` ekler ve kuralların hepsi düşer: opak `#F9F9F9`, `--ink`
başlık, normal beyaz buton. **Fade ya da opacity rampası yok** — eşikte anında.

14 ekran aynı bileşeni parametreyle kullanır — veri tek yerde:
`.tools/mhero.py` içindeki `HERO` sözlüğü. Yeni modül eklerken oraya satır yaz,
`python3 .tools/mhero.py` çalıştır; araç hero'yu da bar sınıflarını da basar.
Ansiklopedi madde detayı da aynı bileşeni `.ans-hero` değiştiricisiyle kullanır.

> **Sayaç satırı yalnız canlıda sayaç olan modüllerde var.** Canlıda yoksa
> `.mh-stat` hiç basılmaz — boş kutu bırakılmaz. Sayaçsız olanlar:
> `olcu-birimleri` · `dolapta` · `route` · `sss` (dördü de canlıda sayaçsız).

> `hakkimizda` bu listede **yok**: ekranın kendi `.ar-hero`'su var, ortasına
> basılan `mh-hero` aynı başlığı ve aynı sayaçları tekrarlıyordu — silindi.

**Sayaç satırı tam genişliğe yayılır** — asla sola kümelenmez. Sütunlar eşit
(`flex:1 1 0`), **ilk sütun sola · son sütun sağa · ortadakiler ortalanmış**;
2 ya da 4 sayaçta da aynı davranır, ayraç çizgisi de aynı genişlikte.
Sihirbaz ekranlarında sayaç yerine **adım göstergesi** (`.mh-step`) durur:
`ADIM 1 / 4` + kalan genişliği dolduran ilerleme çubuğu. `wzGoster()` ve
`raGoster()` ortak `heroAdim()` fonksiyonunu çağırır.

**Hero'dan sonraki ilk blok 20px aşağıdadır** — `.mh-hero{margin-bottom:20px}`,
tek yerde. Kardeş margin'i çöktüğü için daha büyük isteyen blok (ör. `.sec` 30)
kazanır; 20 tabandır.

Ölçülen kontrast (`node .tools/kontrast.js`, piksel örneklemesiyle, tahmin
değil — metin saydamlaştırılıp **arkasındaki** piksel okunuyor, en kötü nokta
alınıyor): app bar başlığı **8,1–16,5:1** · eyebrow **7,3–9,6:1** · başlık
**4,3–12,1:1** · alt başlık **5,0–12,5:1** · sayaç **14,3–17,2:1**.
Ana sayfanın kendi hero'su aynı bantta (başlık 10,7 · alt başlık 5,6) —
modül hero'ları onaylanmış hero'dan geri kalmıyor.

### 4.11b Ansiklopedi madde detayı — içerik canlıdan, şablon tek

**ŞABLON EKRAN ≠ BİTMİŞ EKRAN.** Ekran vardı, açılıyordu, ama 24 satırın hepsi
"Domates"i açıyordu. Artık 43 maddenin her biri kendi içeriğini açıyor.

**İçerik uydurulmadı**, canlı `/mutfak-ansiklopedisi/<slug>` sayfalarından
çıkarıldı (`.tools/canli-ansiklopedi.py`). Taşınan alanlar: kategori çipi ·
etiket rozeti · ad · latin ad · 4 satırlık künye · özet · 6–9 bölümlük gövde
(başlık + paragraf + madde listesi) · SSS · besin değeri · kısa bilgi ·
ilgili tarifler · ilgili maddeler.

**Kapsam:** 18 madde prototipin A–D listesinden, kalan 25 onların "ilgili
maddeler" bağlantılarından geldi. Araç ilgilileri **bir seviye kovalıyor**, o
yüzden hiçbir "ilgili madde" kartı kapsam dışına düşmüyor — 43 maddenin
tamamının ilgilisi yine 43'ün içinde. Liste A–D'yi açık gösterir, kalan 22
satır `<template id="encMore">` içinde bekler; "Daha Fazla Madde", A–Z harfi
ya da arama alanına odaklanmak gerçekten yükler.

**İki liste satırı canlıya göre düzeltildi:** `Arpacık Soğan` → **Arpacık
Soğanı**, `Domates` → **Salkım Domates**. Canlıda "Domates" diye tek bir madde
yok; Domatesler kategorisinde 13 ayrı madde var. Uydurma içerik yazmak yerine
satır gerçek maddeye çevrildi.

**Geri yığını madde düzeyinde.** Router aynı ekranı iki kez itemediği için
`ansYigin` slug yığını tutuluyor: madde → ilgili madde → **geri = bir önceki
madde**, listeye düşmüyor. Yığın tükenince normal `pop()` çalışır.

**Yeni komponent az:** hero `.mh-hero` · gövde `.ar-b` · vurgu kutusu
`.ar-note` · akordeon `.acc` · tarif kartı `.gcard` · bölüm başlığı `.sec-head`
yeniden kullanıldı. Yalnız `.ans-lt` (latin) · `.ans-tg` (etiket rozeti) ·
`.ans-ky` (künye) · `.ans-nt` (besin paneli) · `.ans-rc` (ilgili madde kartı)
yeni yazıldı.

**Bölüm ritmi bilinçli:** koyu hero → açık zemin özet → beyaz künye kartı →
gövde → tint kısa bilgi → gövde → koyu besin paneli → gövde → beyaz akordeon →
tarif rayı → ilgili madde rayı. Arka arkaya aynı zemin gelmiyor.

> Canlıda **yeşil** `.tbadge` var; bizde yeşil onay/tamamlandı durum rengi
> olduğu için etiket rozeti hero'da nötr saydam beyaza çevrildi (§ 4.2).

> Üç tarif kartı ızgarada 2+1 dizilip sağda delik bırakıyordu — yatay raya
> alındı (`.ans-tr`). Besin değeri sabit 3 kolonda iki değerli maddede boşluk
> bırakıyordu — esnek sarmaya çevrildi.

### 4.12 Görsel yükleme

Kapalı ekranların arka plan görselleri **kaynakta `data-bg`** olarak duruyor; ekran ilk
açıldığında `style`'a taşınıyor (`bgUyan`). JS'te temizlemek geç kalıyordu — ayrıştırıcı
stili görür görmez indiriyor. **Ana sayfa dokunulmadı**, görselleri eager kalır ki ilk
boyamada boşluk olmasın. Malzeme fotoğrafları `loading="lazy"`.

### 4.13 Diğer varlık kararları

- Malzeme ikonları WebP 128px · Gilroy woff2 (99 KB) · FA alt kümesi 11 KB
- **Yeni FA glifi eklerken alt kümeyi yenile** (bkz. `CLAUDE.md`). Bu turda `flag-checkered`
  eklendi ve yenilendi
- Pakette 15 gerçek malzeme fotoğrafı var, 185 gerekiyor; eksikler kategori ikonuyla

---

## 5. Çalışan rotalar (50)

`https://by4r.github.io/dadagastro-app-preview/#/<rota>`

| Grup | Rotalar |
|---|---|
| **Kök sekmeler** | `ana-sayfa` · `tarifler` · `puf-noktalari` · `hesap` |
| **Tarif akışı** | `arama` · `kategoriler` · `kategori` · `tarif-detay` · `yorumlar` · `yorum-yaz` · `tarif-ekle` · `pisirme-modu` |
| **Ne Pişirsem / Dolapta** | `ne-pisirsem` · `dolapta` |
| **Mutfak Sırları** | `puf-detay` · `ansiklopedi` · `ansiklopedi-detay` · `sozluk` · `sozluk-detay` · `olcu-birimleri` · `sofra-duzeni` · `sofra-detay` |
| **Video** | `video-mutfagi` · `video-oynatici` · `video-seriler` · `seri-detay` |
| **Dada Route** | `route` · `route-sonuc` · `durak-detay` |
| **Topluluk** | `sefler` · `sef-profil` · `liderlik` · `onur-listesi` · `rozetlerim` |
| **Hesap & sistem** | `profil-duzenle` · `defterim` · `alisveris` · `tariflerim` · `bildirimler` · `ayarlar` · `giris` · `uye-ol` · `sifremi-unuttum` · `onboarding` |
| **Kurumsal** | `hakkimizda` · `sss` · `iletisim` · `gizlilik` · `kvkk` · `reklam-ver` |

Bilinmeyen rota ana sayfaya düşer. `#/kit-*` vitrin rotaları **silindi**.

---

## 6. Gerçekten çalışan etkileşimler

Bunlar sahte değil — akış testleri doğruluyor:

| Ekran | Ne çalışıyor |
|---|---|
| Ölçü Birimleri | **Dönüştürücü gerçekten çeviriyor** — 11 kategori, 100+ malzeme, canlıdaki gram değerleriyle. Bardakla ölçülmeyen malzemede uyarı verir |
| Arama | Yazdıkça süzüyor, eşleşmeyi kalın gösteriyor, sonuçsuzda boş durum |
| Ansiklopedi / Sözlük / SSS | Arama süzgeci + A–Z dizini + boş durum |
| Dolapta | Malzeme seçimi sayacı, sonuç ızgarası eşleşme rozetiyle üretiliyor |
| Ne Pişirsem | 4 adımlı sihirbaz → seçimler Tarifler'e filtre pili olarak düşüyor |
| Menü kurucu | Tepsiye ekle/çıkar, isim ver, kaydet |
| Pişirme modu | Adım adım + zamanlayıcı; son adımda "Tarifi Bitir" |
| Video oynatıcı | Oynat/duraklat, ilerleme çubuğu ve sayaç işliyor |
| Dada Route | Kalkış/varış değiştirme, sapma kaydırıcısı, "Güzergâha Ekle" gerçekten ekliyor |
| Alışveriş listesi | İşaretleme sayacı + ilerleme çubuğu, elle madde ekleme, alınanları temizleme |
| Yorum yaz | Puansız gönderim engellenir, karakter sayacı işler |
| Tarif Ekle | 5 adımlı sihirbaz, adım çipleri tıklanabilir |
| Bildirimler | "Tümünü okundu işaretle" |
| Tarifler | Üst bardaki görünüm anahtarı 2 kolon ↔ tek kolon |
| Tarif Ekle / Yorum yaz | Malzeme satırı, adım ve fotoğraf **gerçekten** ekleniyor/siliniyor; adım numaraları kendini yeniliyor |

---

## 7. Bilinen açıklar

| Açık | Not |
|---|---|
| **DOM 8.866 düğüm** | Eşik 6.000'di. Tek sayfada 50 ekran duruyor. Flutter'a geçişte konu kendiliğinden kapanıyor (`IndexedStack` + lazy route). HTML'de kalınacaksa gizli ekranların içeriği `<template>`'e alınmalı |
| ~~Ne Pişirsem adımında 240px boşluk~~ | **Kapandı** — ekran tam kanama hero aldı, boşluk doldu. `vqa` artık 0 bulgu veriyor |
| Malzeme fotoğrafı 75/185 (%41) | **Canlının kendisi 77/185 (%42)** — parite sağlandı. Kalan 110 malzemenin canlıda da fotoğrafı yok (Enginar, Karnabahar, Mısır, Erik…), jenerik kategori ikonu gösteriliyor |
| Şef ve tarif adları kısmen uydurma | Canlıdaki gerçek şefler (Rüya, Burcu, Ece, Şahnur Yetkiner…) ve liderlik tablosu aktarıldı; tarif adları ve bazı avatar baş harfleri temsilî |
| Dünya mutfağı sayıları | İlk 8'i canlıdan (Türk 1204, İtalyan 92…). Kalan 42'nin sayısı canlıda listelenmiyor, bölgesel dağılım temsilî |
| Harita yok | Dada Route'ta harita yerine **dikey güzergâh şeridi** var (mobil-yerel, dış servise bağımlı değil). "Haritada gör" cihaz haritasına devreder |
| Sponsorluk paket fiyatları | Canlıda da yazmıyor ("sabit ücret" / "komisyon bazlı" olarak geçiyor) |
| Mutfağa Giriş | § 4.9 — canlıda 404, kaldırıldı |
| **Sözlük ve püf detayı tek şablon** | `sozluk-detay` 18 satırda hep "Al Dente", `puf-detay` hep aynı püf noktası. Ansiklopedideki hat aynen tekrarlanabilir — § 0 |
| **`js/ansiklopedi.js` 219 KB (gzip 61)** | 43 maddenin tam metni. Ayrı dosya, gövdenin sonunda; ilk boyamayı geciktirmiyor ama küçük değil. 1.200 maddeye çıkılacaksa veri API'den gelmeli, pakete gömülmemeli |
| **Ansiklopedi 43 / 1.200 madde** | Canlıda 1.200 madde var. Prototip listesi A–Z'yi temsilen 43 madde gösteriyor; sayaç canlıdaki 1.200'ü yazıyor. Kalan maddeler `canli-ansiklopedi.py`'ye slug verilerek eklenebilir |
| **`acuka` kapağı canlıda şablon** | Canlıdaki görsel "Görsel yakında" yazılı şablon — hero'nun altından okunuyordu, pakette hazır meze fotoğrafıyla değiştirildi (`ansiklopedi-gorsel.py` → `yedek`). Diğer 42 kapak canlının gerçek fotoğrafı |

---

## 8. Tekrar etmemesi gereken hatalar

| Hata | Ders |
|---|---|
| `.in` router durum sınıfını ezdi | Yeni sınıfa **önek ver**; `lint-css.js` denetliyor |
| `.tblwrap` yalnız CSS'te yeniden adlandırıldı | Öksüz sınıf taraması eklendi |
| `data-tabs` `.segs`'in üstündeydi | Kapsam pane'leri görmüyordu, iki pane üst üste kalıyordu. `data-tabs` **segs + pane'leri saran** kapsayıcıda olacak |
| `.vd-feat` `<a>` inline kaldı | `aspect-ratio` uygulanmadı, kart 16px'e çöktü. Kart/kutu ise `display:block` ver |
| İlerleme çubuğu `<span>` yazıldı | Inline öğede `height` yutulur. Yapısal öğe `<div>` ya da açık `display` |
| `.author` içine `.tx` yazıldı | Ortak komponentin **iç yapısı da** kopyalanacak (§ 4.10) |
| Yazar alt metni `body` rengini miras aldı | `vqa` 15. kontrolü artık yakalıyor |
| `open()` yığındaki ekranı açmıyordu | Giriş ⇄ Üye Ol gibi çapraz bağlantılar ölü görünüyordu; artık oraya geri sarıyor |
| `#barTray` `.on` sınıfını hiç almıyordu | `.scrbar` görünürlüğü `.on`'a bağlı — menü tepsisi çubuğuna dokunulamıyordu |
| Kart köşesindeki sil butonu yalnız toast gösteriyordu | Fotoğraf, malzeme satırı ve adım silme "çalışmıyor" görünüyordu. `data-rm` ile gerçekten siliyor, `data-add` gerçekten ekliyor. `carpi.js` eylemsiz kapat/sil butonu bırakılmasını engelliyor |
| `margin-top:auto` 0'a düştü | Auto'yu bir üstteki bloğa ver |
| Boşluk dolguyla verildi | Kardeş boşluğu **margin** ile (§ 4.7) |
| `.ans-rc .im` `<span>` yazıldı, `height` yutuldu | Aynı ders ikinci kez: **yapısal öğeye `display` açıkça ver.** Kart görselleri boş çıkmıştı |
| `hakkimizda`'ya ikinci hero basıldı | Üretici (`mhero.py`) ekranda **zaten hero olup olmadığına bakmıyordu**. Panel yerleştiren araç körlemesine basmasın |
| `push()` `.on`'a bakıyordu | `pop()` sınıfı 380 ms sonra siliyor; o aralıkta aynı ekranı açmak sessizce düşüyordu. Ölçüt **yığın** olmalı |
| Kontrast ölçümünde "zemin" diye metnin kendi glifi örneklendi | Metni `visibility:hidden` yapmak perdeyi de siliyordu. Doğrusu: `color:transparent` — katmanlar kalsın, **glifin arkasındaki** piksel okunsun |
| `rgb()` ↔ `rgba(…,1)` metin karşılaştırması | Geçiş bitmemişse tarayıcı ikinci biçimi döndürüyor; test yanlış kırmızı veriyordu. Renk **sayıya çevrilip** karşılaştırılır |
| `.sl-bar b{display:block}` | "3 / 11 alındı" alt alta düştü. **Kapsayıcı kuralı iç yapıyı ezmesin** — bu hatanın altıncı çıkışı |
| `.fm-ta` inline-block kaldı | Taban çizgisi boşluğu altındaki yardım metnini 10 yerine 16px aşağı itti. Yapısal öğeye `display` **açıkça** ver |
| `.view-pad` kök olmayan ekranda | Yüksekliği yalnız `.view.root`'ta tanımlı, 0'a düşüyor; son blok alt eylem çubuğunun altında kalıyordu. İtilen/modal ekranda `.vw-pad vw-bar` |
| `.fr-mz` CSS'te vardı, HTML'de yoktu | Ölü kural boşluğu vermiyordu ama "verdim" sanılıyordu. `lint-css` **HTML'de olup CSS'te olmayanı** yakalıyor, tersini değil |
| Yeni vqa kontrolü yazıldı ama denenmedi | **Kasten hata enjekte edip yakaladığını doğrula** — `vqa-dogrula.js`. Yakalamayan kontrol, olmayan kontroldür |

**Ortak ders:** bu hataların hiçbiri koddan görünmüyordu, hepsi render'a bakınca çıktı.
Araçlar bunun için var — ama araç da gözün yerine geçmiyor.

---

## 9. Sırada ne var

Prototip tarafında iş kalmadı. Sonraki adım **patron onayı**, ardından:

0. **Önce § 0'daki açık iş** — sözlük ve püf detaylarının içeriklendirilmesi
   (ansiklopedideki hat hazır, aynı üç araçla tekrarlanır)
1. Flutter'a çevirme (bkz. `CLAUDE.md` § 7) — token'lar ve ölçüler birebir taşınabilir hâlde
2. Gerçek içerik aktarımı: canlıdaki 2.057 tarif, 591 püf noktası, 1.200 ansiklopedi maddesi.
   **Ansiklopedi 43 maddeyle örneklendi**; kalanı pakete gömülmez, API'den gelir
3. Mutfağa Giriş — canlıda yayına girerse
