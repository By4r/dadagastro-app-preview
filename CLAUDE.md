# DadaGastro — Mobil Uygulama Arayüz Prototipi (HTML)

> **Bu aşamada Flutter YOK.** Tıklanabilir HTML prototipini tamamlıyoruz.
> Patron onayı sonrası Flutter'a çevrilecek — o yüzden tüm ölçüler ve token'lar
> Flutter'a birebir taşınabilir olmalı.

## Bu projenin şu anki görevi

`EKRAN-ENVANTERI.md` dosyasındaki 🔨 işaretli **tüm ekranları** üret.
Kabul kriteri: uygulamada **hiçbir ölü buton, hiçbir eksik ekran** kalmayacak.

## Proje yapısı

```
index.html          tüm ekranların markup'ı (tek sayfa, view tabanlı router)
css/app.css         token'lar + komponent stilleri
js/app.js           router, etkileşimler, pişirme modu, filtreler
assets/fonts|img|ing/
EKRAN-ENVANTERI.md  yapılacaklar listesi — buradan ilerle
```

**Geliştirme:** `python3 -m http.server 8000` → http://localhost:8000
`file://` ile açma, fontlar CORS'a takılır.

## Yeni ekran nasıl eklenir

1. `index.html` içine `<section class="view" id="vXxx">` ekle
2. Kök sekme ise `class="view root"`, itilen ekransa `class="view pushed"`, modal ise `class="view sheet"`
3. `js/app.js` içindeki `V` haritasına kaydet
4. Açan butona `data-open="xxx"` (push/modal) veya `data-go="xxx"` (kök sekme) ver
5. `data-say` yalnız gerçekten bilgilendirme için kalsın — ekranı olan hiçbir buton `data-say` taşımasın

---


> Bu proje DadaGastro'nun **mobil uygulama arayüzünü** üretir.
> Backend yok, API yok — saf arayüz. Veri sahte (mock) katmandan gelir, sonra API'ye bağlanacak.

---

## 0. İlk 10 dakikada yapılacaklar (sırayla)

1. `python3 -m http.server 8000` çalıştır, prototipi **tarayıcıda gez** — onaylanmış tasarım budur
2. `EKRAN-ENVANTERI.md` oku — yapılacak 60+ ekranın listesi
3. `css/app.css` içindeki `:root` token bloğunu oku
4. **Canlı siteyi gez:** https://dadagastro.com — içerik, etiket ve bölüm listesi için **tek doğru kaynak**
5. `frontend-design` skill'ini oku ve **her ekran üretiminde kullan**

> ⚠️ Prototip **onaylanmış görsel dildir** ama **eksiktir**. Çelişki olursa:
> **görsel dil → prototip**, **içerik ve bölüm listesi → canlı site**.

## 1. Proje kuralları

- **frontend-design skill ZORUNLU** — her yeni ekran/komponent bu skill ile üretilir. Generic AI estetiğinden kaçınmak için.
- Plan onaylanmadan implement YOK.
- Bir ekran onaylanmadan bir sonrakine geçilmez.
- Her değişiklik sonrası **Playwright ile 390×844 render** al, **kendin değerlendir**, kısa yazılı rapor ver.
- Ekran görüntülerini `outputs/` altında tut (gitignore'lu). "Şu SS'e bak" deme; yazılı raporla.
- **CROP YAPMA.** Tek öğe doğrulaman gerekiyorsa grep/kod ile teyit et.

---

## 2. Marka — KANONİK, tartışmaya kapalı

### Renkler (kurumsal kılavuz s.14 — bu renklerin dışına **kesinlikle** çıkılmaz)

| Rol | Hex | Kullanım |
|---|---|---|
| Primary — Domates | `#E14827` | Tek baskın aksan: birincil buton, FAB, aktif sekme, eyebrow |
| Koyu / Metin | `#211E16` | Başlık, gövde, koyu panel (Pantone Process Black C) |
| Domates koyu | `#C43D20` | Basılı (pressed) durum |
| Domates derin | `#A8331A` | Gradient ucu |
| Domates tint | `#FBE9E3` | Yumuşak panel, aktif segment zemini |
| Sayfa zemini | `#F9F9F9` | |
| Kart | `#FFFFFF` | |
| Hairline | `#ECECEC` | |
| İkincil metin | `#56514A` | |
| Muted metin | `#7E7E7E` | |
| Sağlık aksanı | `#3BB77E` (koyu `#2C9963`) | Yalnız sağlık/diyet modülü |
| Akademi | `#006072` (petrol) | |
| Gourmet | `#B14FC5` (mor) | |
| DadaFit | `#009D4F` | |
| Puan yıldızı | `#FAC045` | **Yalnız yıldız ikonu.** Zemin/buton olarak asla |

### 🚫 KREM KULLANILMIYOR

`#EFE5D3` ve `#F7F1E6` mobil uygulamada **yer almaz**. Patron kararı.

### 🚫 CAM (GLASS) KULLANILMIYOR

Hiçbir yerde `backdrop-filter` / blur yüzey yok. Tüm yüzeyler düz renk.

### 🚫 Yasak renkler (kılavuz s.16)

Parlak pembe/magenta · parlak mor · saf sarı · turuncu-sarı · fıstık yeşili · açık mavi/cyan.

### Tipografi — tek aile: **Gilroy**

| Rol | Ağırlık | Boyut | lh | ls |
|---|---|---|---|---|
| H1 — hero | ExtraBold 800 | 33 | 1.06 | −0.035em |
| H2 — bölüm | ExtraBold 800 | 20 | 1.18 | −0.015em |
| H3 — büyük kart | ExtraBold 800 | 18–19 | 1.22 | −0.01em |
| H4 — kart | ExtraBold 800 | 14.5 | 1.30 | 0 |
| Gövde / lead | Light 300 | 13 | 1.55 | 0 |
| Meta | Light 300 | 11–12 | 1.40 | 0 |
| Eyebrow | ExtraBold 800 | 10 | 1.00 | 0.14em UPPERCASE domates |
| Buton | ExtraBold 800 | 14 | 1.00 | 0 |
| Sekme etiketi | Medium 500 (aktif XB) | 9.5 | 1.00 | 0.01em |

Eyebrow'un önünde 16×2px domates tire, metinden 7px boşluk.

### Radius

`sm 8` (etiket, rozet) · `md 12` (buton, alan, **tüm ikon butonlar**) · `lg 16` (kart, görsel) · `xl 24` (büyük panel) · `circle` (yalnız kişi avatarı, merkez FAB, video play).

**Pill YOK.** `StadiumBorder` kullanma.

### Gölge — sıcak siyah üzerinden

```
sh-sm: 0 1px 2px rgba(33,30,22,.04), 0 2px 6px rgba(33,30,22,.05)
sh-md: 0 6px 22px rgba(33,30,22,.09)
sh-lg: 0 18px 50px rgba(33,30,22,.16)
buton: 0 6px 18px rgba(225,72,39,.26)
FAB:   0 8px 22px rgba(225,72,39,.42)
```

Nötr siyah gölge marka tonunu bozar. Material `elevation` kullanma.

### Boşluk

Gutter 16 · bölümler arası 30 · başlık→içerik 13 · kart dolgu 12–14 (panel 16–18) · ray aralığı 8–10 · min dokunma hedefi 44×44.

### Sistem ölçüleri

Status bar 44 · AppBar 54 · TabBar 64 + 22 güvenli alan · merkez FAB 52 (22 taşkın, 5px zemin halkası).

---

## 3. Bozulmaz UI kuralları (hepsi acıyla öğrenildi)

### ⚠️ Şeffaf üst bar yalnız `scrollTop = 0`'da

Kaydırma başlar başlamaz (`> 4px`) bar **anında solid**'e geçer. "Hero bitene kadar şeffaf kalsın"
diye bir şey yok — içerik yarı saydam barın altından geçip okunmaz hale geliyor. Bu kural **her ekranda** aynı.
Koyu/siyah bar durumu da yok; solid hep açık `#F9F9F9`.

### ⚠️ Sabit alt çubuklar ekran katmanında durur

Alt eylem çubuğu, pişirme modu navigasyonu, sihirbaz footer'ı → ekranın doğrudan çocuğu,
`position: absolute; bottom: 0`. **`position: fixed` kullanma:** transform'lu ata içinde
Safari containing block'u kaybediyor, çubuk sayfanın ortasında asılı kalıyor.
(Flutter'da bu sorun yok — `Scaffold(bottomNavigationBar:)` doğru katmanda.)

### ⚠️ Avatar `display` çakışması

Kapsayıcıda `.x span{display:block}` gibi bir kural varsa avatarın `display:grid`'ini eziyor,
baş harfler dairenin dışına kaçıyor. Her kapsayıcıda avatar kuralını **açıkça** sabitle.
Bu bug tek projede 5 farklı yerde çıktı.

### ⚠️ Sınıf adı çakışması

`.sec` gibi genel adlar bölüm aralığı kurallarıyla çakışıyor. Komponent sınıflarına **önek ver**
(`pa-prim`, `gcard`, `rd-hero` gibi).

### ⚠️ Yatay ray hizalaması

`scroll-snap-type: x proximity` + `padding-left: 16` kullanıyorsan `scroll-padding-left: 16` de ver,
yoksa ilk kart gutter'a hizalanmıyor.

### ⚠️ Aynı işleve iki giriş koyma

Hesap alt sekmede varsa üst barda avatar olmasın. Sağ üstte drawer varsa profil ekranında ikinci menü butonu olmasın.
Üst barda: **bildirim + menü**, o kadar.

### Görsel kuralı

Kare/oranlı görsel → `<img>` değil, `div + background-image + cover + center`.
Flutter'da `DecorationImage(fit: BoxFit.cover)`. **Esnetme yok, kırp.**

---

## 4. Navigasyon mimarisi

### Kök sekmeler (TabBar)

`Ana Sayfa · Tarifler · [FAB: Ne Pişirsem?] · Sağlık · Hesap`

Her sekme **kendi scroll konumunu korur**. Aktif sekmeye tekrar dokunmak başa sarar.

### İtilen ekran (push)

Sağdan kayar `.34s cubic-bezier(.32,.72,0,1)`, alttaki ekran `−22%` geri çekilir (iOS parallax).
TabBar aşağı iner.

### Modal (sheet)

Alttan yukarı `.38s`. Ne Pişirsem sihirbazı, Pişirme Modu.

### App Drawer

Sağ üstteki hamburger → **sağdan** açılır (304px). Üstte koyu kullanıcı başlığı (avatar + seviye çubuğu),
altında **Mutfağım / Keşfet / Uygulama** grupları, en altta çıkış + sürüm.
TabBar birincil, drawer **ikincil/yönetim** katmanı.

### Alt çekmece (bottom sheet)

Filtreler, malzeme listesi. Max %82 yükseklik, üstte tutamak, dışına dokunma kapatır.

---

## 5. Ekranlar

### ✅ Prototipte var — birebir uygula

| Ekran | Tip | Not |
|---|---|---|
| Ana Sayfa | kök | Hero (arama kartı + sayaç) · kategori rayı · günün tarifi · öne çıkanlar · dolapta ne var · sağlık · videolar · Pro bandı · şefler · topluluk |
| Tarifler | kök | Yapışkan arama + kategori rayı · sonuç sayacı + sıralama · aktif filtre pilleri · editör seçkisi geniş kartı · **2 kolonlu ızgara** · filtre çekmecesi |
| Sağlık | kök | 6 hesaplayıcı · diyetisyen paneli · Pro menü planlayıcı |
| Hesap | kök | Kapak + taşkın avatar · bio · **tek** "Profili Düzenle" butonu · seviye çubuğu · rozet rayı · 3 sayaç · kaydettiklerin rayı · paylaştıkların ızgarası · menü grupları |
| Tarif Detay | push | Hero 352 · yazar · künye tek satır şerit · sekmeler (Malzemeler/Yapılışı/Yorumlar) · topluluk · ürünler · benzerler · alt eylem çubuğu |
| Ne Pişirsem | modal | 12 malzeme ızgarası · min 3 seçim · sonuç Tarifler'e düşer |
| Pişirme Modu | modal | Tam ekran koyu `#141210` · adım başlığı 25px · metin 15px · zamanlayıcı · malzeme çekmecesi |

### 🆕 Canlı sitede var, prototipte YOK — sen tasarlayacaksın

Canlı siteyi gezip içeriği oradan al:

| Ekran | Kaynak |
|---|---|
| **Mutfağa Giriş** | https://dadagastro.com/mutfaga-giris — **öncelikli**, patron özellikle istedi |
| Mutfak Ansiklopedisi | https://dadagastro.com/mutfak-ansiklopedisi |
| Video Mutfağı | https://dadagastro.com/video-mutfagi |
| Püf Noktaları | https://dadagastro.com/puf-noktalari |
| Dolapta Ne Var | https://dadagastro.com/dolapta-ne-var |
| DadaGourmet | https://dadagastro.com/dada-gourmet |
| Dada Route | https://dadagastro.com/yol-guzergahim |
| Tarif Ekle | https://dadagastro.com/tarif-ekle |
| Mutfak Defterim | https://dadagastro.com/mutfak-defterim |
| Rozetlerim | canlı sitede giriş sonrası |
| Haftalık Menü Pro | canlı sitede |
| Giriş / Üye Ol | https://dadagastro.com/giris |

Canlı sitenin ana sayfa bölüm sırası: Haftanın Tarifi · Kategoriler & Dünya Mutfakları · Tariflerimiz ·
Mutfak Sırları · Sağlıklı Yaşam & Hesaplama · İzle & Pişir · DadaGourmet · DadaStore · Şefler & Yazarlar · Topluluğa Katıl.

> Prototipteki ana sayfa bu listeyle **tam örtüşmüyor** (Mutfak Sırları eksik, DadaStore ayrı).
> Canlı siteyi esas al, prototipin görsel dilini uygula.

---

## 6. Webden gelmeyecek kalıplar

Bu bir **mobil uygulama**, mobil görünüm değil. Aşağıdakiler kullanılmaz:

| Web kalıbı | Mobilde yerine |
|---|---|
| Breadcrumb | Sol üstte geri butonu |
| Footer link listesi | Hesap ▸ Kurumsal menü grubu / drawer |
| "Tamamını Gör" metin linki | `Tümü ›` + chevron |
| Mega menü / üst navigasyon | TabBar + FAB + drawer |
| Hover durumları | Pressed durumu + toast |
| Tek uzun sayfa | Ekranlar + push/modal |
| Sağ kenar "Görüş Bildir" sekmesi | Drawer ▸ Yardım |

---

## 7. Teknik — İLERİ FAZ (şimdi değil)

> Aşağıdakiler **onay sonrası** Flutter fazı içindir. Şu an HTML prototipi tamamlıyoruz.
> Yine de token ve ölçü kararlarını Flutter'a taşınabilir tut.

- **Flutter / Dart.** Backend yok; `lib/data/mock/` altında sahte repository.
- Mimari: `lib/core/theme/` (token'lar) · `lib/models/` · `lib/data/` · `lib/features/<ekran>/` · `lib/widgets/`
- `app_theme.dart` bu dokümandaki token'ların **tek kaynağı**. Ekranlarda hardcoded hex YOK.
- Sekme yığınları: `IndexedStack` içinde sekme başına ayrı `Navigator` (scroll + state korunur)
- Push: `CupertinoPageRoute` (parallax hazır gelir)
- Modal: `PageRouteBuilder(fullscreenDialog: true)`
- Alt çekmece: `showModalBottomSheet(isScrollControlled: true, useSafeArea: true)`
- Durum çubuğu: `AnnotatedRegion<SystemUiOverlayStyle>` — ekran başına
- Zamanlayıcı: `Timer.periodic` + `dispose()`'da iptal
- Pişirme modunda `WakelockPlus.enable()`, çıkarken `disable()`
- İkonlar: `font_awesome_flutter` (FA 6.5.2). Emoji/unicode YOK.
- Fontlar: Gilroy Light 300 / Medium 500 / ExtraBold 800 → `pubspec.yaml`
- 1px hairline: `Divider` DPR'de kalınlaşıyor → `Container(height: 1, color: AppColors.line)`
- Ölçüler mantıksal px — retina için ×2 çarpma YOK

### Deploy

`flutter build web` → GitHub Pages (public repo). Patron tarayıcıdan gerçek uygulamayı gezsin,
aynı kod telefona da çıksın. Tek kaynak, iki çıktı.

---

## 8. Çalışma döngüsü

1. Ekranı planla → onay al
2. `frontend-design` skill ile üret
3. `flutter analyze` temiz olmalı
4. Playwright/`flutter run` ile 390×844 render al, **kendin değerlendir**
5. Kısa yazılı rapor: ne değiştin + kontrol sonucu
6. Onaylanmadan sonraki ekrana geçme

### Soru sorma kuralı

Açık soru sorarken **her seçeneğe kendi gerekçeli önerini** yaz — hangisini neden önerdiğini tek cümleyle.
Hızlı karar vermeyi sağlar.

---

## 9. Öncelik sırası

1. `app_theme.dart` + token'lar + `pubspec.yaml` + font/asset kurulumu
2. Uygulama kabuğu: TabBar + Navigator yığınları + drawer
3. Ana Sayfa (canlı sitenin bölüm sırasıyla)
4. Tarifler + filtre çekmecesi
5. Tarif Detay
6. Pişirme Modu
7. Hesap
8. Sağlık
9. **Mutfağa Giriş** (patron özellikle istedi)
10. Kalan canlı site ekranları
