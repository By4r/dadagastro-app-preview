# DadaGastro Mobil — Tamamlanacak Ekran Envanteri

> Kaynak: https://dadagastro.com (canlı site — içerik ve etiketler için **tek doğru kaynak**)
> Görsel dil: bu prototipin mevcut ekranları + `CLAUDE.md`
> Hedef: **hiçbir ölü buton, hiçbir eksik ekran kalmayacak**

---

## 🚫 TEMEL KURAL — olmayan modül görünmez

Canlı sitede **çalışmayan** hiçbir modül uygulamada yer almaz.
**"Yakında" ekranı yok · "yakında" rozeti yok · teaser yok · drawer satırı yok · ana sayfa bölümü yok.**
Bir şey yoksa **yok**.

### Bu kural gereği kapsam dışı

| Modül | Canlıdaki durum | Sonuç |
|---|---|---|
| Sağlık / Diyetisyen / Hesaplayıcılar | "Sağlık & Diyetisyen çok yakında" örtüsü · tüm alt sayfalar 404 | **Kök sekme dahil tamamen kaldırıldı** |
| Haftalık Menü Pro | Sağlık modülüne bağlı | Kaldırıldı |
| DadaGourmet (mekânlar, gurme yazıları) | "DadaGourmet çok yakında" · `/gurme` 404 | Kaldırıldı |
| DadaStore | "Dada Store çok yakında" · `/store` 404 | Kaldırıldı — tarif detayındaki ürün rayı dahil |
| Dada Akademi / DadaCampus | Sayfa yok (404) | Kaldırıldı |
| Topluluk akışı | Sayfa yok (404) | Kaldırıldı — "Topluluğa Katıl" yalnız CTA olarak kalır |

> **Dada Route kapsam içinde**: `/yol-guzergahim` canlıda çalışıyor, üzerinde "yakında" yok.

---

## Durum

✅ = prototipte var, dokunma (sadece gerekirse iyileştir)
🔨 = yapılacak · ⛔ = kapsam dışı (gerekçesi DURUM.md § 4.9)
⏸ = tasarımı sonra verilecek

---

## A. Kök sekmeler (TabBar)

**Yeni alt çubuk:** `Ana Sayfa · Tarifler · [FAB: Ne Pişirsem?] · Mutfak · Hesap`

| # | Ekran | Durum | Not |
|---|---|---|---|
| A1 | Ana Sayfa | ✅ | Bölüm sırası canlıya göre güncellenecek |
| A2 | Tarifler | ✅ | Filtre taksonomisi gerçek sayılara bağlanacak |
| A3 | Ne Pişirsem (FAB → modal) | ✅ | Canlıdaki 4 adımlı sihirbaza yükseltilecek |
| A4 | **Mutfak** | ✅ | Ekran adı *Mutfak Sırları*. Sağlık sekmesinin yerine |
| A5 | Hesap | ✅ | |

### A1 — Ana sayfa bölüm sırası (canlıdan, birebir)

1. Hero + **Hızlı Erişim kartları** 🔨 *(canlıda var, prototipte yok)*
2. Kategoriler & Dünya Mutfakları ✅ *(33 gerçek kategori + sayıları)*
3. Tarif bul — elindekiyle (Dolapta Ne Var) ✅
4. Bu hafta öne çıkanlar ✅
5. **Mutfak Sırları — Mutfağa Giriş & Püf Noktaları** 🔨 *(prototipte yok)*
6. İzle & Pişir ✅
7. **Günün Tarifi** 🔨 *(canlıda videolardan sonra küçük bant)*
8. **Dada Route** 🔨 *(prototipte yok)*
9. Şefler & Yazarlar ✅
10. Topluluğa Katıl ✅

> **Kaldırılacak prototip bölümleri:** "Sağlıklı Yaşam" bölümü · diyetisyen paneli · "Haftanı tek ekranda planla" Pro bandı.

### A4 — Mutfak sekmesi içeriği

Sekme ikonu: `lightbulb` (FA6 `\f0eb`). Sekme adı **Mutfak**, ekran başlığı **Mutfak Sırları** —
canlı sitenin kendi bölüm adı.

Bölümler: **Püf Noktaları · Mutfak Ansiklopedisi · Mutfak Sözlüğü · Ölçü Birimleri ·
Sofra Düzeni · Video Mutfağı · Dada Route · Dolapta Ne Var**

Ana sayfadaki "Mutfak Sırları" bölümünün `Tümü ›` bağlantısı buraya düşer.

### Hero sayaçları — canlıdan, birebir

`2.057 denenmiş tarif · 266 topluluk üyesi · 591 püf noktası`
*(Prototipte `48.200+ / 1.2M / 320+` yazıyor — yanlış, düzeltilecek.)*

Popüler çipler: `zeytinyağlı · kahvaltılık · misafir yemeği · vegan · fırın`

---

## B. Tarif akışı

| # | Ekran | Durum | Not |
|---|---|---|---|
| B1 | Tarif Detay | ✅ | **DadaStore ürün rayı kaldırılacak** |
| B2 | Pişirme Modu | ✅ | |
| B3 | Arama sonuçları | ✅ | Boş durum + öneri + son aramalar dahil |
| B4 | Kategori dizini | ✅ | 33 kategori, her birinde tarif sayısı |
| B5 | Kategori sonuç listesi | ✅ | Tarifler ekranının filtreli hali |
| B6 | Dünya Mutfakları dizini | ✅ | Kategori dizininin 2. sekmesi — canlıda da ayrı sayfası yok |
| B7 | Tüm yorumlar | ✅ | Detaydaki "Tüm yorumları gör" buraya |
| B8 | Yorum yaz (modal) | ✅ | Puan + metin + fotoğraf ekle |
| B9 | Tarif Ekle | ✅ | Çok adımlı: temel bilgi → malzeme → adımlar → görsel → önizleme |

### Filtre taksonomisi (canlıdan, birebir)

- **Kategori** (33): Sebze 215 · Kırmızı Et 160 · Tatlı 126 · Atıştırmalık 125 · Meze 121 · Çorba 115 ·
  Zeytinyağlılar 115 · Kahvaltılık 114 · Bakliyat 113 · Tavuk ve Hindi 110 · Balık ve Deniz Ürünleri 108 ·
  Hamur İşi 104 · Salata 94 · Pilav 92 · Köfte ve Kebap 89 · Meyve Tarifleri 89 · Makarna 76 ·
  Sandviç Burger ve Dürüm 71 · Kek ve Pasta 70 · Ekmek 69 · Dondurma ve Soğuk Tatlılar 62 ·
  Yumurta Tarifleri 61 · İçecek 59 · Dolma ve Sarma 58 · Sakatat 58 · Sos 58 · Kurabiye 57 ·
  Pizza ve Pide 54 · Mantı ve Dolgulu Hamurlar 53 · Turşu ve Konserve 51 · Çocuk Tarifleri 50 ·
  Bebek Tarifleri 49 · Reçel 49
- **Mutfak** (50): Türk Mutfağı 1204 · İtalyan 92 · Fransız 56 · İngiliz 22 · Alman 15 · İspanyol 15 ·
  Portekiz 11 · Avusturya 9 …
- **Yemek Modu**: Günlük Pratik 706 · Fırın Yemekleri 403 · Hızlı ve Kolay 389 · Tek Tencere 158 · Airfryer 5
- **Öğün**: Kahvaltı · Brunch · Öğle Yemeği · Akşam Yemeği · Ara Öğün · İkindi ve Çay Saati
- **Süre**: 15 dakikadan az → 2 saatten uzun
- **Zorluk**: Çok Kolay → Ustalık Gerektirir
- **Beslenme**: Vejetaryen 1079 · Glutensiz 941 · Vegan 591 · Protein Ağırlıklı 477 · Pesketaryen 109 · Düşük Kalorili 58
- **Sıralama**: Önerilen · En Yeni · En Çok Puanlanan · En Hızlı
- Toplam: **2.057 tarif · 33 kategori · 50 dünya mutfağı**

Tarif kartı alanları: süre · zorluk · porsiyon · şef adı · puan · yorum sayısı

---

## C. Mutfak Sırları

| # | Ekran | Durum | Kaynak / ölçü |
|---|---|---|---|
| C1 | Püf Noktaları listesi | ✅ | `/puf-noktalari` — 591 madde · 11 kategori · sıralama: En Yeni / En Çok Okunan |
| C2 | Püf Noktası detay | 🔨 | Okunma sayısı · kategori etiketi  · **Aynı sorun sürüyor:** bütün kartlar aynı püf noktasını açıyor. Ansiklopedideki hat (canlıdan çıkar → `window.PUF` → `data-puf`) aynen tekrarlanır |
| C3 | Mutfak Ansiklopedisi listesi | ✅ | `/mutfak-ansiklopedisi` — 1.200 madde · 26 kategori · A–Z harf dizini |
| C4 | Ansiklopedi madde detay | ✅ | **43 madde, hepsi ayrı içerik** — canlı `/mutfak-ansiklopedisi/<slug>` sayfalarından çıkarıldı. Kategori · etiket · latin ad · 4 satır künye · özet · 6–9 bölüm gövde · SSS akordeonu · besin değeri · kısa bilgi · ilgili tarifler · ilgili maddeler. Her liste satırı `data-ans` ile kendi maddesini açıyor; ilgili maddeden geri = bir önceki madde |
| C5 | **Mutfak Sözlüğü listesi** | ✅ | `/mutfak-sozlugu` — 765 terim · 20 kategori · A–Z. **Ansiklopediden ayrı ekran** |
| C6 | Sözlük terim detay | 🔨 | Tanım · örnek kullanım · ilgili tarifler  · **Aynı sorun sürüyor:** 18 satır hep "Al Dente". Ansiklopedideki hat (`window.SOZ` → `data-soz`) aynen tekrarlanır |
| C7 | **Ölçü Birimleri** | ✅ | `/olcu-birimleri` — 4 sekme: Dönüştürücü · Dönüşüm Tabloları · Standart Ölçüler · Fırın Rehberi. 90+ malzeme. **Gerçekten çevirsin** |
| C8 | **Sofra Düzeni listesi** | ✅ | `/sofra-duzeni` — 11 kategori · 61 ipucu |
| C9 | Sofra Düzeni rehber detay | ✅ | Açıklama + pratik ipuçları |
| C10 | Video Mutfağı listesi | ✅ | `/video-mutfagi` — 33 video · 4 seri · haftanın videosu · sıradaki seçki |
| C11 | Video oynatıcı | ✅ | Tam ekran, altında tarif bağlantısı |
| C12 | **Video serileri listesi** | ✅ | 4 seri · "N bölüm · her Salı yeni bölüm" |
| C13 | Seri detay (bölümler) | ✅ | Bölüm bölüm liste, kaldığın yerden devam |
| C14 | Dolapta Ne Var | ✅ | `/dolapta-ne-var` — Dolaptakiler / Hariç Tuttuklarım sekmeleri · kategorili malzeme seçimi |

> `Ölçü Birimleri` canlıda **Mutfak Sırları** altında duruyor, sağlık aracı değil — bu yüzden Mutfak sekmesinde.

---

## D. Dada Route

| # | Ekran | Durum | Not |
|---|---|---|---|
| D1 | Rota planlayıcı | ✅ | `/yol-guzergahim` — kalkış/varış · ara durak ekle · yön değiştir · harita |
| D2 | Rota sonuç & durak listesi | ✅ | 9 hızlı filtre: Tümü · Tam Yol Üstü · 5/10/20 dk sapma · Dada Öneriyor · Şu An Açık · Kahvaltı · Öğle · Akşam · Kahve · Tatlı · Yöresel · Hızlı Mola · Aileye Uygun. Mesafe + tahmini süre |
| D3 | Durak detay | ✅ | Duraklar tıklanabilir olmalı — yoksa ölü buton olur |

---

## E. Topluluk

| # | Ekran | Durum | Not |
|---|---|---|---|
| E1 | Şefler listesi | ✅ | `/sefler` — 265 üye · isim araması · rütbe (Çırak, Çömez Aşçı…) · N tarif · puan · Takip Et |
| E2 | Şef profili | ✅ | Tarifleri · takipçi · rozet · mutfak defteri |
| E3 | Canlı Liderlik | ✅ | `/liderlik` — Sezon 2026 · katkı puanı sıralaması |
| E4 | Onur Listesi | ✅ | `/onur-listesi` — **boş durumuyla**: "Henüz kapanmış bir sezon yok" |
| E5 | Rozetlerim | ✅ | Giriş sonrası |

---

## F. Hesap & sistem

| # | Ekran | Durum |
|---|---|---|
| F1 | Profil | ✅ |
| F2 | Profili Düzenle | ✅ |
| F3 | Tarif Defterim (koleksiyonlar) | ✅ |
| F4 | Alışveriş Listem | ✅ |
| F5 | Paylaştığım Tarifler | ✅ |
| F6 | Bildirimler | ✅ |
| F7 | Ayarlar (bildirim, dil, tema, hesap) | ✅ |
| F8 | Giriş Yap | ✅ | `/giris` — 4 hesap tipi: Kullanıcı · Antrenör · Diyetisyen · İşletme. Google / Facebook / e-posta / telefon |
| F9 | Üye Ol | ✅ |
| F10 | Şifremi Unuttum | ✅ |
| F11 | Onboarding (3-4 slayt + izinler) | ✅ |

---

## G. Kurumsal

| # | Ekran | Durum |
|---|---|---|
| G1 | Hakkımızda | ✅ |
| G2 | SSS (akordeon) | ✅ |
| G3 | İletişim (form) | ✅ |
| G4 | Gizlilik Politikası | ✅ |
| G5 | KVKK Aydınlatma Metni | ✅ |
| G6 | Reklam Ver | ✅ |

> G4–G6 uzun metin ekranları — sade tipografi, yapışkan başlık, içindekiler.

---

## H. Global davranışlar

| # | İş | Durum |
|---|---|---|
| H1 | **Hiçbir ölü buton kalmayacak** — her `data-say` gerçek bir ekrana bağlanacak | ✅ |
| H2 | Boş durumlar (arama sonucu yok, liste boş, bağlantı yok) | ✅ |
| H3 | Yükleniyor iskeletleri (skeleton) | ✅ |
| H4 | Paylaş sheet | ✅ |
| H5 | Onay diyalogları (sil, çıkış) | ✅ |
| H6 | Toast / snackbar standardı | ✅ |
| H7 | Geri yığını her ekranda tutarlı | ✅ |
| H8 | Drawer güncellemesi — Store, Gourmet, Akademi, Sağlık satırları çıkar | ✅ |

### Drawer'ın son hâli

**Mutfağım:** Profilim · Tarif Defterim · Alışveriş Listem · Tariflerim
**Mutfak Sırları:** Püf Noktaları · Mutfak Ansiklopedisi · Video Mutfağı · Dada Route
**Uygulama:** Ayarlar · Yardım · Hakkımızda
En altta: Çıkış Yap + sürüm

---

## I. Mutfağa Giriş — en sonda

| # | Ekran | Durum | Not |
|---|---|---|---|
| I1 | Mutfağa Giriş modül listesi | ⛔ | Canlıda `/mutfaga-giris` **404** — yalnız ana sayfadaki 6 modül var |
| I2 | Modül detay (bölüm listesi) | ⛔ | |
| I3 | Ders ekranı | ⛔ | |

Ana sayfadaki 6 modül (canlıdan): 01 Mutfak Düzeni ve Çalışma Alanı (3 bölüm) ·
02 Temel Bıçak Türleri ve Kullanımları (4) · 03 Sebze ve Meyve Hazırlama Teknikleri (4) ·
04 Haşlama: Sudan Fazlası (5) · 05 Tavada Pişirme Teknikleri (4) · 06 Fırında Pişirme Teknikleri (4)

> **KAPSAM DIŞI.** `/mutfaga-giris` 3 Ağustos 2026'da 404 döndü; TEMEL KURAL gereği
> tüm giriş noktaları (ana sayfa bölümü, hızlı erişim kutucuğu, drawer satırı)
> kaldırıldı. Canlıda yayına girerse geri eklenir. Ayrıntı: DURUM.md § 4.9.

---

## Kabul kriteri

Uygulamada gezerken **hiçbir dokunuş boşa gitmemeli**.

İki öznitelik var, karıştırma:

| Öznitelik | Anlamı | Hedef |
|---|---|---|
| `data-say` | **Borç.** Bu butonun ekranı henüz yok. | **0** |
| `data-toast` | Gerçek geri bildirim — işlem oldu, ekran gerekmiyor ("Bağlantı kopyalandı"). | serbest |

İkisi de toast gösterir; ayrım yalnız kabul testi içindir. Yeni ekran yaparken
o ekranın `data-say`'ini sil ve butonu `data-open` ile bağla.

```js
// konsola yapıştır — kalan borç
[...document.querySelectorAll('[data-say]')].map(e => e.dataset.say)
```

Bu liste **boş** olmalı.

**Borç sayacı:** Faz 0 sonu 107 → ayrım sonrası 97 → **0 (tamamlandı)**

İkinci test — kaldırılan modüllerden hiçbir iz kalmamalı:

```js
// hepsi 0 dönmeli
['Sağlık','Diyetisyen','Kalori','Gourmet','Store','Akademi','Yakında']
  .map(k => [k, document.body.innerHTML.split(k).length - 1])
```


---

## Tamamlanma — 3 Ağustos 2026

**50 ekran üretildi** (46 planlanan + 4 ek). Eklenenler, çünkü liste satırı ölü kalmasın:

| Ekran | Neden eklendi |
|---|---|
| `sozluk-detay` | C6 zaten listedeydi, ayrı ekran olarak üretildi |
| `seri-detay` | C13 listedeydi |
| `route-sonuc` | D2 listedeydi — planlayıcıdan ayrı ekran |
| `durak-detay` | D3 listedeydi |

Kabul kriterleri:

- `data-say` borç sayacı: **0**
- `vqa.js`: 50 ekran, **2 bilinçli istisna** dışında temiz
- `akis.js`: **16 / 16** uçtan uca akış geçiyor
- `lint-css.js`: temiz (sınıf adı + öksüz sınıf)
- `#/kit-*` vitrin rotaları silindi


---

## Son tur — 3 Ağustos 2026 (devir)

### ✅ Bu turda tamamlanan

| İş | Durum |
|---|---|
| **Dolapta Ne Var — iki katmanlı yapı** | ✅ Birincil ikili toggle + dört mod kartı · mod başına ayrı state · 4 ayrı açıklama ve placeholder · hassasiyetin 11 maddesi ve iki durumu |
| **Malzeme fotoğrafları** | ✅ 15 → **75/185 (%41)** · canlının kendisi %42 · 96px WebP, 102 KB |
| **Modül hero'ları — görsel + sayaç** | ✅ 15 ekran, tek `.mh-` bileşeni · sayaçlar canlıdan · canlıda sayaç yoksa satır da yok |
| `data-say` borç sayacı | ✅ **0** |
| Uçtan uca akış | ✅ **18/18** (`dolapta-katman` ve `modul-hero` eklendi) |

### ✅ İkinci turda tamamlanan (3 Ağustos 2026)

| İş | Durum |
|---|---|
| **Modül hero'ları tam kanama** | ✅ 14 ekran + ansiklopedi madde detayı. `margin:0` · `border-radius:0` · görsel status bar'ın arkasından. App bar `.vbar.overlay.mh-bar` ile hero'nun üstünde yüzüyor: 0px'te şeffaf + `--on-dark`, 200px'te anında opak `#F9F9F9`. Fade yok, cam yok. Ayrı beyaz şerit kalmadı |
| **Mükerrer hero silindi** | ✅ `hakkimizda` ekranının kendi `.ar-hero`'su varken ortasına ikinci hero basılmıştı |
| **Ansiklopedi madde detayı** | ✅ 43 madde, içerik canlıdan. Her satır kendi maddesini açıyor, ilgili maddeden geri = bir önceki madde |
| **"Daha Fazla Madde" gerçek** | ✅ Toast değil: kalan 22 madde `<template>`'ten yükleniyor. A–Z harfi ve arama da yüklüyor |
| Denetim | ✅ `data-say` 0 · `lint-css` temiz · `akis` **19/19** · `hero-kanama` 15/15 · `kontrast` eşik altı yok · `glif` temiz · `vqa` 2 bilinçli istisna |

### 🔨 Açık iş — sıradaki oturum

| # | İş | Not |
|---|---|---|
| **A** | **Sözlük ve püf detaylarının içeriklendirilmesi** | `sozluk-detay` · `puf-detay` VAR ama tek şablon. Ansiklopedide kurulan hat hazır: `canli-ansiklopedi.py` → `ansiklopedi-gorsel.py` → `ansiklopedi-js.py` → `data-ans`/`ansBoya`. Sözlük için `window.SOZ` + `data-soz`, püf için `window.PUF` + `data-puf` |

Ayrıntı, dosya haritası ve komutlar: **`DURUM.md` § 0 (DEVİR)**.
