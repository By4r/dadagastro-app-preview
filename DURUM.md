# DadaGastro Mobil Prototipi — DURUM

> **Yeni bir oturum bu dosyayla tek başına devam edebilmeli.**
> Kurallar `CLAUDE.md`'de, yapılacak ekran listesi `EKRAN-ENVANTERI.md`'de.
> Bu dosya: nerede kaldık, ne karar verildi, sırada ne var.

Canlı: **https://by4r.github.io/dadagastro-app-preview/**
Geliştirme: `python3 -m http.server 8000` → `http://localhost:8000`

---

## 1. Ne bitti

| Faz | İş | Durum |
|---|---|---|
| **0** | Router iskeleti: `data-route` ile kendini kaydeden ekranlar, sınırsız derinlikte push/pop, `#/ekran` hash yönlendirme, tam olay delegasyonu | ✅ |
| **0** | Ortak komponent seti: liste satırı · A–Z harf dizini · akordeon · boş durum · yükleme iskeleti · onay diyaloğu · paylaş sheet | ✅ |
| **1** | Sağlık sekmesi ve tüm izleri kaldırıldı, ana sayfa canlının bölüm sırasına dizildi, hero sayaçları/kategoriler/filtre taksonomisi canlıdan | ✅ |
| **2** | **Ne Pişirsem** yeniden yazıldı: 4 adımlı sihirbaz + 20 yemek modu + menü kurucu + hazır menüler + menü tepsisi sheet'i | ✅ |
| **2** | **Dolapta Ne Var**: 5 sekme, 185 malzeme, besin & vakit filtreleri | ✅ |
| **2** | **Püf Noktaları** kök sekme olarak kuruldu | ✅ |
| — | Performans: 2018 KB → 741 KB, yavaş 3G ilk boyama 8196 → 3388 ms | ✅ |
| — | `vqa.js` görsel öz-denetim aracı (13 kontrol) | ✅ |

---

## 2. Ne kaldı

**46 ekranın 12'si bitti, 34 kaldı.**

Sıradaki blok — **B3–B9, tarif akışı (7 ekran)**:

| # | Ekran | Not |
|---|---|---|
| B3 | Arama sonuçları | Boş durum + son aramalar. Canlı: `/tarifler?q=…`, "2057 tarif bulundu", "sayfa 1 / 69" |
| B4 | Kategori dizini | 33 kategori. **Dünya mutfakları buranın 2. sekmesi** — canlıda ayrı sayfası yok |
| B5 | Kategori sonuç listesi | Canlı: `/tarifler/kategori/corba`, H1 = kategori adı |
| B6 | *(B4'e birleşti)* | — |
| B7 | Tüm yorumlar | **Tarif detayı içinde genişleyen liste** — canlıda `/yorumlar` yok |
| B8 | Yorum yaz (modal) | Puan + metin + fotoğraf |
| B9 | Tarif Ekle | Çok adımlı sihirbaz |

Sonrası: Mutfak Sırları'nın 5 modülü · Video Mutfağı + serileri · Dada Route ·
Topluluk (şefler, liderlik, onur listesi, rozetler) · Hesap & sistem (10 ekran) ·
Kurumsal (6 ekran) · en sonda Mutfağa Giriş.

> ⚠️ **Her ekrandan önce canlı denetim tablosu zorunlu.** Canlıdaki ekranı aç,
> her kontrolü listele, prototipte karşılığı olduğunu doğrula, rapora tabloyu koy.

---

## 3. Sayaçlar

| | Değer |
|---|---|
| `data-say` (**borç** — ekranı olmayan buton) | **97** |
| `data-toast` (gerçek geri bildirim) | 12 |
| `data-open` (çalışan gezinme) | 21 |
| DOM düğümü (ana sayfa açılışı) | ~3.500 |
| `index.html` / `app.css` / `app.js` | 148 KB / 102 KB / 37 KB (gzip: 26 / 21 / 11 KB) |
| İlk açılış aktarımı | 741 KB |
| Yavaş 3G ilk boyama (canlı, gzip'li) | 3.388 ms |

**Borcun anlamı:** `data-say` = "bu butonun ekranı henüz yok". Hedef 0.
`data-toast` = işlem gerçekten oldu, ekran gerekmiyor ("Bağlantı kopyalandı").
İkisi de toast gösterir; ayrım yalnız kabul testi içindir.

DOM eşiği: 6.000'i geçerse gizli sekme içeriği tembel üretime geçecek.
Faz 5 sonunda tekrar ölçülecek.

---

## 4. Kalıcı kararlar

### 4.1 Kapsam dışı modüller — "olmayan modül görünmez"

Canlıda çalışmayan modül uygulamada **hiç** yer almaz: yakında ekranı yok,
rozeti yok, teaser yok, drawer satırı yok.

| Modül | Sebep |
|---|---|
| Sağlık / Diyetisyen / Hesaplayıcılar | Canlıda "çok yakında", alt sayfalar 404. **Kök sekme dahil kaldırıldı** |
| Haftalık Menü Pro | Sağlık modülüne bağlı |
| DadaGourmet | `/gurme` 404, "çok yakında" |
| DadaStore | `/store` 404 — tarif detayındaki ürün rayı dahil kaldırıldı |
| Dada Akademi / DadaCampus | Sayfa yok (404) |
| Topluluk akışı | Sayfa yok (404) — "Topluluğa Katıl" yalnız CTA |

**Dada Route kapsam içinde** — `/yol-guzergahim` canlıda çalışıyor.

### 4.2 Renk istisnaları

- **Yeşil `#3BB77E` kapsam dışı DEĞİL** — onay/tamamlandı **durum rengi**.
  Çalıştığı yerler: `.match` eşleşme rozeti · `.ig.done` işaretli malzeme
  (zemin `#F4F9F6`, kenar `rgba(59,183,126,.32)`) · `.step.done .num` ·
  `.cook-nav .next.fin` ("Tarifi Bitir").
- **Petrol `#006072` ve mor `#B14FC5` kapsam dışı DEĞİL** — avatar rotasyonunun
  parçası (domates · petrol · mor · koyu yeşil · ink). Modül rengi değil, **kişi
  ayırt edici**.
- **Tarif kartındaki "Yeni" şeridi petrol** (`.gcard .rib.new`) — korunuyor.
  Yeşil "tamamlandı" anlamını bulandırır, ink kart kromuna karışır, domates
  zaten "Şefin Tercihi"nde.
- **Gerçekten kapsam dışı tek renk: `#009D4F` (DadaFit)** — hiç kullanılmıyor.
- Canlının malzeme kategori renkleri (`#F2A33C` turuncu-sarı, `#4A7FA8` /
  `#5B8DBE` açık mavi) **marka yasak listesinde** — kullanılmadı, onun yerine
  canlının kendi kategori ikonları kullanıldı.

### 4.3 Krem — yüzey yasağı, metin değil

`#EFE5D3` ve `#F7F1E6` **hiçbir yerde `background` olamaz**.
Koyu panel üzerindeki metin sıcak beyaz kalır: tek token **`--on-dark: #FFF6EA`**.
`#F2ECE2` ve `#FFF8EE` varyantları bu token'a çekildi.

### 4.4 Modül hiyerarşisi (canlı navigasyondan doğrulandı)

**Üst seviye 5 modül:** Tarifler · Ne Pişirsem? · Dolapta Ne Var? ·
**Püf Noktaları** · Mutfak Sırları

**Mutfak Sırları'nın altında tam olarak 5 modül:**
Mutfağa Giriş `/mutfaga-giris` · Mutfak Ansiklopedisi `/mutfak-ansiklopedisi` ·
Sözlük `/mutfak-sozlugu` · Ölçü Birimleri `/olcu-birimleri` ·
Sofra Düzeni `/sofra-duzeni`

> Püf Noktaları **üst seviyedir**, Mutfak Sırları'nın çocuğu değil.
> Video Mutfağı ve Dada Route da değil — onlar footer'daki "Keşfet & Pişir"
> grubunda yaşıyor. Kardeş modülü kendi içine alma.

**Mutfak Sırları'nın canlıda sayfası yok** (üst menüde `href="#"`, yalnız açılır
menü başlığı) — o yüzden sekme almadı.

### 4.5 Alt sekme çubuğu — 4. yuva kararı: **Püf Noktaları**

```
Ana Sayfa · Tarifler · [FAB: Ne Pişirsem?] · Püf Noktaları · Hesap
```

İkon `lightbulb` ("ipucu"nun karşılığı). Etiket 78px'e sığıyor; bu sekmede
yazı boyu 9px — kısaltma uydurulmadı.

Sekme almayanlar nerede yaşıyor:
- **Mutfak Sırları'nın 5 modülü** → ana sayfadaki "Mutfak Sırları" bölümü + drawer grubu
- **Dolapta Ne Var** → ana sayfa bölümü + drawer + Tarifler içinden (FAB'daki Ne Pişirsem ile aynı işi yaptığı için sekme verilmedi)
- **Video Mutfağı · Dada Route** → ana sayfa bölümleri + drawer "Keşfet & Pişir"

### 4.6 Drawer (grup adları canlıdan)

| Grup | Satırlar |
|---|---|
| Mutfağım | Profilim · Tarif Defterim · Alışveriş Listem · Tariflerim |
| Mutfak Sırları | Mutfağa Giriş · Mutfak Ansiklopedisi · Sözlük · Ölçü Birimleri · Sofra Düzeni |
| Keşfet & Pişir | Püf Noktaları · Video Mutfağı · Dada Route · Dolapta Ne Var? |
| Uygulama | Bildirimler · Ayarlar · Yardım & Destek · Hakkımızda · Gizlilik & KVKK |

### 4.7 Dikey boşluk doktrini

Ölçek doğru olması yetmiyor, **bağlamda doğru** olması gerekiyor.

| İlişki | Boşluk |
|---|---|
| Aynı grubun öğeleri | 8 |
| Etiket ↔ kendi kontrolü | 8 |
| **Farklı komponent tipleri** | **16 minimum** |
| Alt bölüm ↔ alt bölüm | 20–24 |
| Bölüm ↔ bölüm | 30 |

Komponent içi: kart dolgusu her kenardan eşit · son öğe ↔ CTA **min 12** ·
CTA ↔ kart alt kenarı **kart dolgusu kadar, asla 0**.

⚠️ **`margin-top:auto` tuzağı:** kart içerik boyundayken `auto` **0'a düşer** ve
buton üstündeki satıra yapışır. Auto'yu bir üstteki bloğa ver, butona sabit
`margin-top` bırak.

### 4.8 Segmented control — uygulamada TEK tip

`.segs` ve `.rdtabs` aynı CSS bloğunu paylaşır: **tam genişlik (390)**,
sekmeler eşit paylaşır (1fr), aktif olan domates metin + 2px domates alt çizgi.
5 sekmeli varyant (`.segs-scroll`) kapsayıcı yine tam genişlik, sekmeler kaydırılır.

### 4.9 FontAwesome alt kümesi — **yeni ikon eklerken YENİLE**

`fa-solid-900.woff2` 156 KB → **8.4 KB** (1393 glif → 75).
`fa-regular-400.woff2` 25 KB → **2.7 KB**.
Orijinaller `fa-*-full.woff2` adıyla repoda, **silme**.

Alt küme `app.css`'te `.i-*` olarak **tanımlı tüm** kod noktalarını taşır
(yalnız kullanılanları değil) — mevcut bir ikon sınıfını yeni ekranda kullanmak
font yenilemeyi gerektirmez. Yalnız **yeni bir FA glifi** eklerken yenile:

```bash
cd deploy
python3 - <<'EOF' > /tmp/uni.txt
import io, re
css = io.open('css/app.css', encoding='utf-8').read()
cps = re.findall(r'\.i-[a-z0-9-]+:before\{content:"\\([0-9a-f]{4,5})"\}', css)
print(','.join('U+' + c.upper() for c in sorted(set(cps))))
EOF
cd assets/fonts
for f in fa-solid-900 fa-regular-400; do
  python3 -m fontTools.subset "$f-full.woff2" --unicodes="$(cat /tmp/uni.txt)" \
    --flavor=woff2 --layout-features= --no-hinting --desubroutinize \
    --output-file="$f.woff2"
done
```

Gerekli: `pip3 install fonttools brotli`. Komut çalıştırılıp aynı md5'i ürettiği
doğrulandı. Yenileme sonrası her ekranda `offsetWidth === 0` olan `.fs`/`.fr`
var mı bak.

### 4.10 Diğer varlık kararları

- Malzeme ikonları PNG 200px → **WebP 128px** (636 KB → 52 KB)
- Gilroy fontları TTF/OTF → **woff2** (254 KB → 99 KB)
- Kapalı ekranlara `content-visibility:hidden` — o ekranların arka plan
  görselleri ilk açılışta inmiyor
- Pakette 15 gerçek malzeme fotoğrafı var, 185 gerekiyor. Eksikler için
  **canlının kendi kategori ikonu** (carrot/apple-whole/bacon/drumstick-bite/
  fish/cheese/wheat-awn/mortar-pestle) `--ink-2` tonunda

---

## 5. `vqa.js` — görsel öz-denetim

`node .tools/vqa.js [rota ...]` — rota verilmezse hepsini gezer.
Her ekranda **tüm sekme kombinasyonlarını** dolaşır (hatalar genelde gizli sekmede).

13 kontrol:

1. Aynı satırdaki kartlar eşit yükseklikte mi
2. Metin kırpılıyor / taşıyor mu
3. Kelimeler birbirine yapışmış mı (`412B` gibi Türkçe kısaltmalar muaf)
4. Yatay raylar gutter'a hizalı mı, son öğe kırpık mı
5. Dikey boşluklar ölçekte mi (4·8·12·16·20·24·30)
6. Butonlar aynı hizada mı
7. Üst üste 3'ten fazla **aynı zeminde** aynı tip blok var mı
8. Görsel çıpa var mı (fotoğraf, panel, ikon bloğu)
9. Ekranın sonu boş mu (>220px)
10. Segmented control tam genişlik ve sekmeler eşit mi
11. Çip/butonların zemin ve kenarlığı **computed style ile** gerçekten var mı
12. **Kardeş blok boşluğu** — farklı komponent tipleri arasında <16px
13. **Kapsayıcı iç boşluğu** — ilk/son çocuk kenara yapışmış mı, CTA ↔ son öğe <12px

Araç iki kez kalibre edildi ve **enjekte hatayla körleşmediği doğrulandı**.
Yanlış alarmlar kapatıldı: kaydırılabilir ata içindeki taşma, Türkçe `B`/`Mn`
kısaltmaları, kenarlıklı kapsayıcıda çocuk ölçümü, yatay flex'te CTA kontrolü,
homojen liste komponentlerinin tekrarı, kapalı katmanların içi.

**Diğer test paketleri:** `node .tools/faz0.js` (rota + yığın + regresyon),
`node .tools/faz1.js` (kaldırılan modül izi + bölüm sırası + sekme).

---

## 6. Çalışan rotalar

Hepsi `https://by4r.github.io/dadagastro-app-preview/#/<rota>` ile açılır.

### Uygulama

| Rota | Ekran |
|---|---|
| `#/ana-sayfa` | Kök sekme. Hero · hızlı erişim · kategoriler · dolapta · öne çıkanlar · mutfak sırları (tint bant) · videolar · günün tarifi · dada route (koyu panel) · şefler · topluluk |
| `#/tarifler` | Kök sekme. Yapışkan arama + kategori çipleri · sonuç sayacı · aktif filtre pilleri · editör seçkisi · 2 kolonlu ızgara · filtre çekmecesi (8 grup, canlı sayılarla) |
| `#/puf-noktalari` | **Kök sekme (4. yuva).** Koyu sayı paneli (591/11/3,7B) · fotoğraflı öne çıkan · 12 kategori çipi · sıralama · kartlar |
| `#/hesap` | Kök sekme. Kapak + avatar · seviye · rozetler · sayaçlar · kaydettiklerin · paylaştıkların · menü grupları |
| `#/ne-pisirsem` | Modal. 4 adımlı sihirbaz (Öğün → Süre → Zorluk → Damak) · sonuç → Tarifler'e filtre piliyle · 20 yemek modu · menü kurucu (34 kategori) · 4 hazır menü · menü tepsisi sheet'i |
| `#/dolapta` | İtilen. 5 sekme · 185 malzeme (8 akordeon) · malzeme arama · seçilenler şeridi · kalori kaydırıcısı · protein/süre/zorluk |
| `#/tarif-detay` | İtilen. Hero 352 · yazar · künye · sekmeler (Malzemeler/Yapılışı/Yorumlar) · porsiyon · topluluk · benzerler · alt eylem çubuğu |
| `#/pisirme-modu` | Modal. Tam ekran koyu · adım adım · zamanlayıcı · malzeme çekmecesi |

### Komponent vitrini (geliştirme aracı — sevkiyatta silinecek)

| Rota | İçerik |
|---|---|
| `#/kit` | Vitrin dizini |
| `#/kit-liste` | Liste satırı: ikon · avatar · görsel · anahtar varyantları |
| `#/kit-az` | A–Z harf dizini (29 harf, kaydırmayla senkron) |
| `#/kit-akordeon` | Akordeon (tek açık kalır) |
| `#/kit-bos` | Boş durum — 3 varyant |
| `#/kit-iskelet` | Yükleme iskeleti — satır + kart ızgarası |
| `#/kit-dialog` | Onay diyaloğu |
| `#/kit-paylas` | Paylaş sheet |

Bilinmeyen ya da kaldırılmış rota (eski `#/saglik` linki) ana sayfaya düşer.

---

## 7. Bilinen açıklar

| Açık | Not |
|---|---|
| **97 ölü buton** | `data-say` taşıyan her buton, ekranı yapılınca `data-open`'a çevrilecek |
| Ne Pişirsem adım ekranında 240px boşluk | **Bilinçli.** Karar ekranı; altına içerik doldurmak seçimle yarışır. `vqa.js` bunu bulgu olarak gösteriyor — kabul edilmiş istisna |
| Yavaş 3G'de 3.4 sn ilk boyama | Kalan darboğaz gecikme (2 gidiş-dönüş). CSS'i HTML'e gömmek 3.0'a indirirdi ama "derleme adımı yok" ilkesi tercih edildi |
| Şef ve tarif adları uydurma | Canlıdaki gerçek şefler (Ebru Tütüncü, Rüya Aydan, Berk Özdenak…) ve tarifler henüz aktarılmadı |
| `#/kit-*` ekranları sevkiyatta | ~300 DOM düğümü ve 8 rota; teslimden önce silinecek |
| Mutfağa Giriş | Canlıda `/mutfaga-giris` **404**. Yalnız ana sayfadaki 6 modül var. En sona bırakıldı |

---

## 8. Bu turda düzeltilen, tekrar etmemesi gereken hatalar

| Hata | Ders |
|---|---|
| `.gmeta` diye stilsiz sınıf uydurma | Yeni kart yaparken **mevcut komponenti kullan**, yenisini uydurma |
| Python `'fopt%s' % None` → `class="foptNone"` | Üretilen markup'ı **render'da doğrula**, 33 çip stilsiz kalmıştı |
| Regex `</div>` dengesini kırdı | Yapısal markup değişikliğinde `div`/`section` dengesini say |
| İç içe sekmede dış sekme iç paneli söndürdü | Sekme kapsamı `closest('[data-tabs]')` ile sınırlanmalı |
| `margin-top:auto` 0'a düştü | Bkz. 4.7 |
| `.ig-group` sınıf adı çakışması | Komponent sınıflarına önek ver |

**Ortak ders:** bu altı hatanın hiçbiri koddan görünmüyordu, hepsi render'a
bakınca çıktı. `vqa.js` bunun için var, ama araç da gözün yerine geçmiyor.
