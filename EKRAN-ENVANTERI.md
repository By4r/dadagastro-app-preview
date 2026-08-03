# DadaGastro Mobil — Tamamlanacak Ekran Envanteri

> Kaynak: https://dadagastro.com (canlı site — içerik ve etiketler için **tek doğru kaynak**)
> Görsel dil: bu prototipin mevcut ekranları + `CLAUDE.md`
> Hedef: **hiçbir ölü buton, hiçbir eksik ekran kalmayacak**

---

## Durum

✅ = prototipte var, dokunma (sadece gerekirse iyileştir)
🔨 = yapılacak
⏸ = şimdilik yer tutucu

---

## A. Kök sekmeler (TabBar)

| # | Ekran | Durum |
|---|---|---|
| A1 | Ana Sayfa | ✅ (bölüm sırası canlı siteye göre güncellenecek) |
| A2 | Tarifler | ✅ |
| A3 | Ne Pişirsem (FAB → modal) | ✅ |
| A4 | Sağlık | ✅ |
| A5 | Hesap | ✅ |

### A1 — Ana sayfa bölüm sırası (canlı siteden, birebir)

1. Haftanın Tarifi 🔨 *(prototipte "Günün Tarifi" var, canlıya göre düzelt)*
2. Kategoriler & Dünya Mutfakları ✅
3. Tariflerimiz ✅
4. **Mutfak Sırları** 🔨 *(prototipte yok — püf noktaları + ansiklopedi + video girişi)*
5. Sağlıklı Yaşam & Hesaplama ✅
6. İzle & Pişir ✅
7. **DadaGourmet** 🔨 *(prototipte yok)*
8. **DadaStore** 🔨 *(prototipte yok)*
9. Şefler & Yazarlar ✅
10. Topluluğa Katıl ✅

---

## B. Tarif akışı

| # | Ekran | Durum | Not |
|---|---|---|---|
| B1 | Tarif Detay | ✅ | |
| B2 | Pişirme Modu | ✅ | |
| B3 | Arama sonuçları | 🔨 | Boş durum + öneri + son aramalar dahil |
| B4 | Kategori index | 🔨 | 33 kategori, her birinde tarif sayısı |
| B5 | Kategori sonuç listesi | 🔨 | Tarifler ekranının filtreli hali |
| B6 | Dünya Mutfakları index | 🔨 | 50 mutfak |
| B7 | Tüm yorumlar | 🔨 | Detaydaki "Tüm yorumları gör" buraya |
| B8 | Yorum yaz (modal) | 🔨 | Puan + metin + fotoğraf ekle |
| B9 | Tarif Ekle | 🔨 | Çok adımlı: temel bilgi → malzeme → adımlar → görsel → önizleme |

### Filtre taksonomisi (canlıdan, birebir)

- **Kategori** (33): Sebze 215 · Kırmızı Et 160 · Tatlı 126 · Atıştırmalık 125 · Meze 121 · Çorba 115 · Zeytinyağlılar 115 · Kahvaltılık 114 · Bakliyat 113 · Tavuk ve Hindi 110 · Balık ve Deniz Ürünleri 108 · Hamur İşi 104 · Salata 94 · Pilav 92 …
- **Mutfak** (50): Türk Mutfağı 1204 · İtalyan 92 · Fransız 56 …
- **Yemek Modu**: Günlük Pratik 706 · Fırın Yemekleri 403 · Hızlı ve Kolay 389 · Tek Tencere 158 · Airfryer 5
- **Öğün**: Kahvaltı · Brunch · Öğle Yemeği · Akşam Yemeği · Ara Öğün · İkindi ve Çay Saati
- **Süre**: 15 dakikadan az → 2 saatten uzun
- **Zorluk**: Çok Kolay → Ustalık Gerektirir
- **Beslenme**: Vejetaryen 1079 · Glutensiz 941 · Vegan 591 · Protein Ağırlıklı 477 · Pesketaryen 109 · Düşük Kalorili 58
- **Sıralama**: Önerilen · En Yeni · En Çok Puanlanan · En Hızlı
- Toplam: **2057 tarif · sayfa 1 / 69**

Tarif kartı alanları: süre · zorluk · porsiyon · maliyet (₺) · şef adı · puan · yorum sayısı

---

## C. Keşfet & Pişir

| # | Ekran | Durum | Kaynak |
|---|---|---|---|
| C1 | Püf Noktaları listesi | 🔨 | /puf-noktalari |
| C2 | Püf Noktası detay | 🔨 | |
| C3 | Mutfak Ansiklopedisi listesi | 🔨 | /mutfak-ansiklopedisi · alfabetik + arama |
| C4 | Ansiklopedi terim detay | 🔨 | |
| C5 | Video Mutfağı listesi | 🔨 | /video-mutfagi |
| C6 | Video oynatıcı | 🔨 | Tam ekran, altında tarif bağlantısı |
| C7 | Dolapta Ne Var | 🔨 | /dolapta-ne-var — sihirbazdan ayrı, kalıcı ekran |
| C8 | **Mutfağa Giriş** | ⏸ | Yer tutucu — tasarımı sonra verilecek |

---

## D. DadaGourmet

| # | Ekran | Durum |
|---|---|---|
| D1 | Gourmet ana | 🔨 |
| D2 | Mekânlar listesi + harita/liste geçişi | 🔨 |
| D3 | Mekân detay | 🔨 |
| D4 | Gurme yazı listesi | 🔨 |
| D5 | Gurme yazı detay | 🔨 |
| D6 | Dada Route — rota listesi | 🔨 |
| D7 | Rota detay (duraklar, ziyaret işaretleme) | 🔨 |

---

## E. DadaStore

| # | Ekran | Durum |
|---|---|---|
| E1 | Mağaza ana + kategoriler | 🔨 |
| E2 | Ürün listesi | 🔨 |
| E3 | Ürün detay | 🔨 |
| E4 | Sepet | 🔨 |
| E5 | Sipariş özeti (adres/ödeme — sadece arayüz) | 🔨 |

---

## F. Sağlık & Diyet

| # | Ekran | Durum |
|---|---|---|
| F1 | Kalori Hesaplayıcı | 🔨 |
| F2 | Vücut Kitle İndeksi | 🔨 |
| F3 | Bazal Metabolizma | 🔨 |
| F4 | Vücut Tipi Testi | 🔨 |
| F5 | Besin Kalori Cetveli (aranabilir liste) | 🔨 |
| F6 | Ölçü Birimleri Çevirici | 🔨 |
| F7 | Diyetisyen listesi + filtre | 🔨 |
| F8 | Diyetisyen profili | 🔨 |
| F9 | Randevu al (takvim + saat) | 🔨 |
| F10 | Haftalık Menü Pro — planlayıcı | 🔨 |
| F11 | Menüden alışveriş listesi üret | 🔨 |

> Hesaplayıcılar **gerçekten hesaplasın** — formüller basit, sahte sonuç gösterme.
> Kalori: Mifflin-St Jeor. VKİ: kg/m². Bazal metabolizma: Harris-Benedict.

---

## G. Topluluk

| # | Ekran | Durum |
|---|---|---|
| G1 | Şefler listesi | 🔨 |
| G2 | Şef profili (tarifleri, takipçi, rozet) | 🔨 |
| G3 | Canlı Liderlik | 🔨 |
| G4 | Onur Listesi | 🔨 |
| G5 | Topluluk akışı | 🔨 |
| G6 | Rozetlerim | 🔨 |
| G7 | Dada Akademi — kurs listesi | 🔨 |
| G8 | Kurs detay | 🔨 |

---

## H. Hesap & sistem

| # | Ekran | Durum |
|---|---|---|
| H1 | Profil | ✅ |
| H2 | Profili Düzenle | 🔨 |
| H3 | Tarif Defterim (koleksiyonlar) | 🔨 |
| H4 | Alışveriş Listem | 🔨 |
| H5 | Paylaştığım Tarifler | 🔨 |
| H6 | Bildirimler | 🔨 |
| H7 | Ayarlar (bildirim, dil, tema, hesap) | 🔨 |
| H8 | Giriş Yap | 🔨 |
| H9 | Üye Ol | 🔨 |
| H10 | Şifremi Unuttum | 🔨 |
| H11 | Onboarding (3-4 slayt + izinler) | 🔨 |

---

## I. Kurumsal

| # | Ekran | Durum |
|---|---|---|
| I1 | Hakkımızda | 🔨 |
| I2 | SSS (akordeon) | 🔨 |
| I3 | İletişim (form) | 🔨 |
| I4 | Gizlilik Politikası | 🔨 |
| I5 | KVKK Aydınlatma Metni | 🔨 |
| I6 | Reklam Ver | 🔨 |

> I4–I6 uzun metin ekranları — sade tipografi, yapışkan başlık, içindekiler.

---

## J. Global davranışlar

| # | İş | Durum |
|---|---|---|
| J1 | **Hiçbir ölü buton kalmayacak** — her `data-say` gerçek bir ekrana bağlanacak | 🔨 |
| J2 | Boş durumlar (arama sonucu yok, liste boş, bağlantı yok) | 🔨 |
| J3 | Yükleniyor iskeletleri (skeleton) | 🔨 |
| J4 | Paylaş sheet | 🔨 |
| J5 | Onay diyalogları (sil, çıkış) | 🔨 |
| J6 | Toast / snackbar standardı | ✅ |
| J7 | Geri yığını her ekranda tutarlı | 🔨 |

---

## Kabul kriteri

Uygulamada gezerken **hiçbir dokunuş boşa gitmemeli**. Bir buton hâlâ toast gösteriyorsa,
o ekran yapılmamış demektir. Bitirmeden önce şu testi çalıştır:

```js
// konsola yapıştır — hâlâ ekrana bağlanmamış butonları listeler
[...document.querySelectorAll('[data-say]')].map(e => e.dataset.say)
```

Bu liste **boş** olmalı (ya da yalnız gerçekten bilgilendirme amaçlı olanlar kalmalı).
