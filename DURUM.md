# DadaGastro Mobil Prototipi — DURUM

> **Yeni bir oturum bu dosyayla tek başına devam edebilmeli.**
> Kurallar `CLAUDE.md`'de, ekran listesi `EKRAN-ENVANTERI.md`'de.
> Bu dosya: nerede kaldık, ne karar verildi, sırada ne var.

Canlı: **https://by4r.github.io/dadagastro-app-preview/**
Geliştirme: `python3 -m http.server 8000` → `http://localhost:8000`

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

---

## 2. Sayaçlar

| | Değer | Not |
|---|---|---|
| Ekran | **50** | `data-route` taşıyan bölüm sayısı |
| `data-say` (**borç**) | **0** | 97'den indi — hedefe ulaşıldı |
| `data-toast` (gerçek geri bildirim) | 87 | "Bağlantı kopyalandı" gibi; borç değil |
| `data-open` (çalışan gezinme) | 420 | |
| DOM düğümü (açılış) | 8.866 | Eşik 6.000'i aştı — § 7 |
| `index.html` / `app.css` / `app.js` | 348 / 148 / 64 KB | gzip: **61 / 28 / 18 KB** |
| İlk açılış (gzip'li metin + font + ana sayfa görselleri) | ~800 KB | 12 ekranlıyken 741 KB'ydi |
| FCP (yerel) | 60 ms | |

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

### 4.11 Modül hero'su — tek bileşen (`.mh-`)

Canlıdaki modül giriş sayfalarının hero'su **ölçülerek** alındı
(`node .tools/canli-hero.js`). Formül ana sayfa hero'suyla aynı katman düzeni:
fotoğraf → perde → grain. Yükseklik kısaltıldı (modül girişi, kapak değil).

15 ekran aynı bileşeni parametreyle kullanır — veri tek yerde:
`.tools/mhero.py` içindeki `HERO` sözlüğü. Yeni modül eklerken oraya satır yaz,
`python3 .tools/mhero.py` çalıştır.

> **Sayaç satırı yalnız canlıda sayaç olan modüllerde var.** Canlıda yoksa
> `.mh-stat` hiç basılmaz — boş kutu bırakılmaz. Sayaçsız olanlar:
> `olcu-birimleri` · `dolapta` · `route` · `sss` (dördü de canlıda sayaçsız).

Ölçülen kontrast (piksel örneklemesiyle, tahmin değil): alt başlık **7,9–8,4:1**.

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
| Ne Pişirsem adımında 240px boşluk | **Bilinçli.** Karar ekranı; altına içerik doldurmak seçimle yarışır. `vqa` bunu bulgu gösteriyor — kabul edilmiş istisna, kalan tek bulgu bu (2 sekme kombinasyonunda) |
| Malzeme fotoğrafı 75/185 (%41) | **Canlının kendisi 77/185 (%42)** — parite sağlandı. Kalan 110 malzemenin canlıda da fotoğrafı yok (Enginar, Karnabahar, Mısır, Erik…), jenerik kategori ikonu gösteriliyor |
| Şef ve tarif adları kısmen uydurma | Canlıdaki gerçek şefler (Rüya, Burcu, Ece, Şahnur Yetkiner…) ve liderlik tablosu aktarıldı; tarif adları ve bazı avatar baş harfleri temsilî |
| Dünya mutfağı sayıları | İlk 8'i canlıdan (Türk 1204, İtalyan 92…). Kalan 42'nin sayısı canlıda listelenmiyor, bölgesel dağılım temsilî |
| Harita yok | Dada Route'ta harita yerine **dikey güzergâh şeridi** var (mobil-yerel, dış servise bağımlı değil). "Haritada gör" cihaz haritasına devreder |
| Sponsorluk paket fiyatları | Canlıda da yazmıyor ("sabit ücret" / "komisyon bazlı" olarak geçiyor) |
| Mutfağa Giriş | § 4.9 — canlıda 404, kaldırıldı |

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

**Ortak ders:** bu hataların hiçbiri koddan görünmüyordu, hepsi render'a bakınca çıktı.
Araçlar bunun için var — ama araç da gözün yerine geçmiyor.

---

## 9. Sırada ne var

Prototip tarafında iş kalmadı. Sonraki adım **patron onayı**, ardından:

1. Flutter'a çevirme (bkz. `CLAUDE.md` § 7) — token'lar ve ölçüler birebir taşınabilir hâlde
2. Gerçek içerik aktarımı: canlıdaki 2.057 tarif, 591 püf noktası, 1.200 ansiklopedi maddesi
3. Mutfağa Giriş — canlıda yayına girerse
