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
2. `EKRAN-ENVANTERI.md` oku — yapılacak 46 ekranın listesi + **kapsam dışı modüller**
3. `css/app.css` içindeki `:root` token bloğunu oku
4. **Canlı siteyi gez:** https://dadagastro.com — içerik, etiket ve bölüm listesi için **tek doğru kaynak**
5. `frontend-design` skill'ini oku ve **her ekran üretiminde kullan**

> ⚠️ Prototip **onaylanmış görsel dildir** ama **eksiktir**. Çelişki olursa:
> **görsel dil → prototip**, **içerik ve bölüm listesi → canlı site**.

## 🚫 TEMEL KURAL — olmayan modül görünmez

Canlı sitede **çalışmayan** hiçbir modül uygulamada yer almaz.
**"Yakında" ekranı yok · "yakında" rozeti yok · teaser yok · drawer satırı yok · ana sayfa bölümü yok.**
Bir şey yoksa **yok**.

Kapsam dışı: **Sağlık / Diyetisyen / Hesaplayıcılar** (kök sekme dahil) · **Haftalık Menü Pro** ·
**DadaGourmet** · **DadaStore** · **Dada Akademi / DadaCampus** · **Topluluk akışı**.
Gerekçeler ve tam liste: `EKRAN-ENVANTERI.md`.

**Dada Route kapsam içinde** — `/yol-guzergahim` canlıda çalışıyor.

## 📐 MOBİLE UYARLAMA — birleştirme serbest, DÜŞÜRME yasak

Canlıda **iki seviyeli** olan bir yapıyı mobilde **tek seviyeye** indirmek
"mobil uyarlama" değil, **özellik kaybıdır**.

Dolapta Ne Var bunun canlı örneğiydi: canlıda birincil seçim
(**Dolaptakiler | Hariç Tuttuklarım**) ve onun altında dört mod kartı
(**Sevmiyorum · Tüketmiyorum · Alerjim Var · Hassasiyetim Var**) var.
Prototipte beşi tek şeride dizilmişti — hiyerarşi yok oldu, her modun kendi
açıklaması ve kendi seçim listesi kayboldu.

**Yer sıkıntısı varsa çözüm katmanı silmek değildir.** Sırayla dene:

| Sıra | Çözüm |
|---|---|
| 1 | **Segmented + alt segment** — birincil şerit, altında ikincil kartlar |
| 2 | **Akordeon** — ikinci seviye açılır kapanır |
| 3 | **Alt çekmece** (bottom sheet) — ikinci seviye üstten gelir |
| 4 | **İkinci ekrana push** — seviye kendi ekranını alır |

> Bir seviyeyi silmeden önce **dur ve sor.** "Mobilde sığmıyor" gerekçesi
> tek başına yeterli değil; yukarıdaki dördü de denenmemişse düşürme sayılır.

Her seviyenin kendi **durumu** da korunur: Sevmiyorum'a eklenen malzeme
Alerjim Var'da işaretli görünmez. Tek liste + tek state ile "birleştirdim"
demek de düşürmedir.

## ⚖️ HİÇBİR EKRAN CANLI SİTEDEN GERİ KALMAZ

Bir ekranı yapmadan **önce** canlıdaki karşılığını aç ve üzerindeki **her kontrolü** listele:
sekme · çip · slider · akordeon · sayaç · buton · boş durum · sonuç metni.
Sonra prototipte hepsinin karşılığı olduğunu doğrula.

Faz raporunda her ekran için bu tablo **zorunlu**:

| Canlıdaki kontrol | Prototipte | Not |
|---|---|---|

- Eksik varsa **"eksik" yaz, gizleme.**
- Mobil için birleştirdiysen (ör. 8 kategori akordeona girdi) onu da yaz.
- **Birleştirme tamam, DÜŞÜRME yok.**

## 🎨 GÖRSEL ZENGİNLİK VE DENGE

Bu prototip patrona gösterilecek. **"İşlevsel ama çıplak" kabul edilmiyor.**

### 1. Her ekranın görsel çıpası olacak

Saf metin listesi ekran = başarısız. Her ekranda en az bir görsel çıpa:
fotoğraf · renkli panel · ikon bloğu · sayı vurgusu · illüstrasyon.

**Karar sırası:**
1. Canlıda görsel var mı? → aynısını kullan
2. Yok ama içerik görsele uygun mu (kategori, tarif, mekân, video, şef)? → görsel ekle
3. İçerik gerçekten metin mi (KVKK, SSS, ayarlar)? → tipografi ve boşlukla zenginleştir:
   bölüm ikonları, akordeon, vurgu kutuları

**Her şeye görsel değil** — analiz et, uygun olana koy, gerekçesini raporda yaz.

### 2. Yoğunluk dengesi

Bir bölge tıka basa doluyken başka bölge bomboş kalmayacak.
Render'a bak, **gözünü kıs, lekelere bak**. Bir yan kara leke bir yan beyaz boşluksa yeniden düzenle.

- Uzun listeler bölünsün: her 5–6 satırda başlık, ayraç ya da vurgu bloğu
- **Üst üste 3'ten fazla aynı tip blok gelmesin** — ritim kır
- **Ekranın sonu boş kalmasın**: ilgili içerik rayı, CTA ya da bir sonraki adım

### 3. Boşluk ölçeği — rastgele değer YOK

Yalnız: **4 · 8 · 12 · 16 · 20 · 24 · 30**
Dışına çıkıyorsan gerekçeyi CSS'e yorum olarak yaz.

- Komponentler arası **minimum 12px** — birbirine yapışmayacak
- İlişkili öğeler yakın (8–12), ilişkisiz öğeler uzak (20–30).
  Yakınlık ilişkiyi anlatır; her şey eşit aralıklıysa hiyerarşi yok demektir.

### 4. Bölüm ritmi

Arka arkaya gelen bölümlerin zemini değişsin:
**beyaz kart → açık zemin → koyu panel → tint panel.**
Hepsi aynı griyse ekran tek bir hamur gibi okunur.

### 5. Öz-denetim — her ekran sonunda ÇALIŞTIR

```bash
node .tools/lint-css.js      # sınıf adı + öksüz sınıf denetimi
node .tools/vqa.js           # 17 görsel kontrol, tüm ekranlar (rota otomatik keşfedilir)
node .tools/vqa-dogrula.js   # 16 ve 17 kasten hata enjekte edilince yakalıyor mu
node .tools/hero-denetim.js  # hero'su olması gereken ama olmayan ekran var mı
node .tools/hero-kanama.js   # tam kanama · 0px şeffaf / 200px opak app bar
node .tools/faz0.js          # rota · yığın · alt çubuk · borç sayacı
node .tools/faz1.js          # kaldırılan modül izi · bölüm sırası · sekme
node .tools/akis.js          # 16 uçtan uca kullanıcı akışı
node .tools/carpi.js         # kapat/sil butonlarının eylemi var mı
```

`vqa.js` **17 kontrol** yapar. Son ikisi bu turda eklendi:

| # | Kontrol |
|---|---|
| 1–13 | satır yüksekliği · taşma · yapışıklık · ray hizası · boşluk ölçeği · buton hizası · ritim · görsel çıpa · boş alan · segmented control · çip stili · kardeş boşluğu · kapsayıcı iç boşluğu |
| 14 | Kardeş kutuları geometrik olarak çakışıyor mu |
| 15 | Metin zeminine göre okunuyor mu (kontrast < 2,2:1 → bulgu) |
| **16** | **Hero sayaç satırı tam genişliğe yayılıyor mu** (hero genişliğinin %90'ı) |
| **17** | **Hero'dan sonraki ilk blok en az 20px aşağıda mı** |

15. kontrol yazılır yazılmaz iki gerçek hata yakaladı: püf detaydaki görünmez
yazar alt metni (1,21:1) ve porsiyon sayacının renksiz `+/−` butonları (1,21:1).
Foto üstü beyaz yazı ve kasten soluk durumlar (devre dışı harf, pasif fiyat
işareti) muaf.

> **Kapat/sil butonu toast'la geçiştirilmez.** Kart köşesindeki çarpı gerçekten
> silmeli, "ekle" gerçekten eklemeli. `carpi.js` eylemsiz buton bırakılmasını
> engeller — `data-rm` / `data-add` kalıbını kullan.

**"Render aldım" yetmez. Bakıp değerlendireceksin.**

## 📏 DİKEY BOŞLUK DOKTRİNİ

Bu hata dört kez çıktı. Ölçek doğru olması yetmiyor — **bağlamda doğru** olması gerekiyor.
8px ölçektedir, ama iki farklı komponent arasında 8px **yanlıştır**.

### A) Bloklar arası (kardeş komponentler)

Her blok boşluğunu kendinden **öncekiyle olan ilişkisinden** alır. Blok eklerken sor:
*"bu, üstündekinin PARÇASI mı, KOMŞUSU mu, yoksa BAŞKA BİR BÖLÜM mü?"*

| İlişki | Boşluk | Örnek |
|---|---|---|
| Aynı grubun öğeleri | 8 | çip ↔ çip, liste satırı ↔ satır |
| Etiket ↔ kendi kontrolü | 8 | "Süre" başlığı ↔ süre çipleri |
| Komşu ama farklı komponent | **16 minimum** | arama alanı ↔ çip rayı |
| Alt bölüm ↔ alt bölüm | 20–24 | filtre grubu ↔ filtre grubu |
| Bölüm ↔ bölüm | 30 | kategoriler ↔ öne çıkanlar |

> **SERT KURAL: iki farklı komponent tipi arasında 16px'ten az boşluk YASAK.**
> Input · çip rayı · kart ızgarası · buton · liste · başlık — hepsi farklı tiptir.

Sebebi: **yakınlık ilişki anlatır.** Arama alanıyla çip rayı 6px aralıkla durursa
kullanıcı çipleri arama alanının parçası sanır. Değiller.

### B) Komponent İÇİ boşluk (kart, panel, satır)

| Yer | Kural |
|---|---|
| Kart dolgusu | Her kenardan eşit. **Alt dolgu üst dolguyla aynı** |
| Başlık ↔ meta | 8 |
| Meta ↔ ikincil satır | 8 |
| Hairline öncesi/sonrası | 10 |
| Son öğe ↔ CTA butonu | **12 minimum** |
| CTA ↔ kart alt kenarı | **kart dolgusu kadar** — asla 0 |

> **SERT KURAL: hiçbir öğe kapsayıcısının kenarına yapışmayacak.**
> Buton kartın içinde yüzer; kenara değmez.

⚠️ `margin-top:auto` tuzağı: kart içerik boyundayken `auto` **0'a düşer**.
Butonu alta hizalamak için `auto`'yu bir üstteki bloğa ver, butona sabit
`margin-top` bırak — yoksa buton üstündeki satıra yapışır.

### C) Hero ve metin blokları — sabit değerler

| Yer | Boşluk |
|---|---|
| **Hero'dan sonraki ilk blok** | **20 minimum** — hero'nun alt kenarına hiçbir şey yapışmaz |
| **Input → altındaki yardım metni** | **10** |
| **Yardım metni → sonraki blok** | **20** |
| **Metin bloğu ↔ komşu bileşen** | **16 taban** (buton çifti → açıklama → kartlar → açıklama → input) |

Açıklama metinleri **ikincil renkte (`--ink-2`), 13px / 1.5 satır yüksekliği**.

Boşluk **tek yerde** verilir: hero'nun kendi `margin-bottom`'unda, yardım metninin
kendi `margin-top`'unda. Ekran ekran yama yasak — bir ekranda bozuksa hepsinde bozuktur.

### D) HERO SAYAÇ SATIRI TAM GENİŞLİĞE YAYILIR

`.mh-stat` asla sola kümelenmez. Sütunlar eşit (`flex:1 1 0`), **ilk sütun sola,
son sütun sağa, ortadakiler ortalanmış**. 2 sayaçta da 4 sayaçta da aynı davranır.
Üstündeki ince ayraç çizgisi de aynı genişlikte. Sihirbazlardaki adım göstergesi
(`.mh-step`) de aynı kurala tabi — çubuk kalan genişliği doldurur.

### E) BİR MODÜL EKRANI AÇILIYORSA HERO'SU VARDIR

**Düz beyaz başlık şeridiyle açılan modül ekranı = eksik iş.** Modül girişi olan
her ekran `.mh-hero` alır — kök sekme, itilen ekran, modal sihirbaz fark etmez.
Sihirbazda sayaç yerine **adım göstergesi** (`ADIM 1 / 4` + ilerleme çubuğu) durur;
görsel, overlay ve app bar davranışı diğerleriyle **birebir aynıdır**.

Hero'suz açılması doğru olan ekranlar `.tools/hero-denetim.js` içindeki `MUAF`
tablosunda **gerekçesiyle** yazılıdır (kendi kapak görseli olanlar, tam ekran
oynatıcı/pişirme modu, arama, form modalları). Tabloda olmayan hero'suz ekran
kırmızı döner.

### F) Denetim

`node .tools/vqa.js` **17 kontrol** yapar; boşluklarla ilgili dördü:
1. **Kardeş blok boşluğu** — ardışık kardeşlerin komponent tipi farklıysa ve boşluk < 16 ise bulgu
2. **Kapsayıcı iç boşluğu** — ilk/son çocuk ile kapsayıcının içerik kutusu arası, dolgudan azsa bulgu
3. **Hero sayaç satırı** — genişliği hero genişliğinin %90'ından azsa ya da son sütun sağ kenara 8px'ten uzaksa bulgu
4. **Hero altı ilk blok** — boşluk 20px'ten azsa bulgu

```bash
node .tools/vqa-dogrula.js   # 3 ve 4 gerçekten yakalıyor mu — kasten hata enjekte eder
node .tools/hero-denetim.js  # hero'su olması gereken ama olmayan ekran var mı
```

> Yeni bir kontrol yazdığında **kasten hata enjekte edip yakaladığını doğrula.**
> Yakalamayan kontrol, olmayan kontroldür.

## 1. Proje kuralları

- **frontend-design skill ZORUNLU** — her yeni ekran/komponent bu skill ile üretilir. Generic AI estetiğinden kaçınmak için.
- Plan onaylanmadan implement YOK.
- Onay ritmi: **faz sonu toplu onay** — bir fazın ekranları birlikte sunulur, faz onaylanmadan sonrakine geçilmez.
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
| Puan yıldızı | `#FAC045` | **Yalnız yıldız ikonu.** Zemin/buton olarak asla |

### Yeşil `#3BB77E` — durum rengi, kapsam dışı DEĞİL

`#3BB77E` / koyu `#2C9963` = **onay / tamamlandı** durum rengi. Sağlık modülü kapsam dışı
ama **bu renk kalır**. Çalışan yerler:

| Yer | Kural |
|---|---|
| Tarifler — "8/11 malzemen var" eşleşme rozeti | `.match` |
| Tarif detay — işaretlenmiş malzeme satırı | `.ig.done` — zemin `#F4F9F6`, kenar `rgba(59,183,126,.32)` |
| Tarif detay — tamamlanmış adım kartı | `.step.done .num` — numara yeşil dolu |
| Pişirme modu — son adımdaki "Tarifi Bitir" | `.cook-nav .next.fin` |

Faz 1'de **silinecek** yeşil kullanımları (bunlar Sağlık modülüne ait, durum rengi değil):
`.htile .ic` hesaplayıcı kutuları · `.dyt .eyebrow` diyetisyen paneli · `.btn.green` diyetisyen CTA'sı.

### Petrol `#006072` ve mor `#B14FC5` — kişi rengi, kapsam dışı DEĞİL

İkisi de **avatar rotasyonunun** parçası: domates · petrol · mor · koyu yeşil · ink.
Yan yana düşen avatarlar birbirinden ayrılsın diye. Marka modül rengi olarak değil,
**kişi ayırt edici** olarak kullanılıyorlar — 29 avatarda geçiyor (petrol 8, mor 6).

Tarif kartındaki **"Yeni" şeridi** de petrol (`.gcard .rib.new`) — **korunuyor**.

### Gerçekten kapsam dışı

`#009D4F` (DadaFit) — hiçbir yerde kullanılmıyor. **Bunu görüyorsan hatadır.**

**Yeni ekranlarda kural:** yeşili yalnız onay/tamamlandı için kullan; petrol ve moru yalnız
avatar rotasyonunda. Bu renklere yeni bir anlam yükleme — tek baskın aksan domates.

### 🚫 KREM — yüzey yasağı, metin değil

`#EFE5D3` ve `#F7F1E6` **hiçbir yerde `background` olamaz**. Patron kararı.

Koyu panel üzerindeki metin sıcak beyaz kalır — saf beyaz sert durur.
**Tek değer:** `--on-dark: #FFF6EA`. Ton çoğaltma; `#F2ECE2` / `#FFF8EE` gibi
varyantlar bu token'a çekildi.

### 🚫 CAM (GLASS) KULLANILMIYOR

Hiçbir yerde `backdrop-filter` / blur yüzey yok. Tüm yüzeyler düz renk.

### 🚫 Yasak renkler (kılavuz s.16)

Parlak pembe/magenta · parlak mor · saf sarı · turuncu-sarı · fıstık yeşili · açık mavi/cyan.

### ⚠️ FontAwesome alt kümesi — yeni ikon eklerken YENİLE

`assets/fonts/fa-solid-900.woff2` ve `fa-regular-400.woff2` **alt küme**dir:
yalnız `css/app.css` içinde `.i-*` olarak tanımlı kod noktalarını taşır.
181 KB → 11 KB. Orijinaller `*-full.woff2` adıyla repoda duruyor, **silme**.

**Yeni bir FA ikonu eklediğinde** `.i-yeni-ikon:before{content:"\fXXX"}` kuralını
yazdıktan sonra alt kümeyi yenilemezsen ikon **görünmez**. Yenileme komutu:

```bash
cd deploy

# 1) app.css'te tanımlı tüm kod noktalarını topla
python3 - <<'EOF' > /tmp/uni.txt
import io, re
css = io.open('css/app.css', encoding='utf-8').read()
cps = re.findall(r'\.i-[a-z0-9-]+:before\{content:"\\([0-9a-f]{4,5})"\}', css)
print(','.join('U+' + c.upper() for c in sorted(set(cps))))
EOF

# 2) orijinalden yeniden alt küme çıkar (fonttools + brotli gerekir)
cd assets/fonts
for f in fa-solid-900 fa-regular-400; do
  python3 -m fontTools.subset "$f-full.woff2" \
    --unicodes="$(cat /tmp/uni.txt)" \
    --flavor=woff2 --layout-features= --no-hinting --desubroutinize \
    --output-file="$f.woff2"
done
```

**Yenileme sonrası doğrula:** `.tools/faz0.js` ve `.tools/faz1.js` çalıştır, sonra
her ekranda `document.querySelectorAll('.fs,.fr')` içinde `offsetWidth === 0`
olan var mı bak — varsa o glif alt kümeye girmemiş demektir.

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

Ölçek: **4 · 8 · 12 · 16 · 20 · 24 · 30**. Gutter 16 · bölümler arası 30 · başlık→içerik 12 ·
kart dolgu 12 (panel 16) · ray aralığı 8 · min dokunma hedefi 44×44.
Ölçek dışı bir değer kullanıyorsan CSS'e gerekçe yorumu yaz.

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

### ⚠️ SINIF ADI SÖZLEŞMESİ — çakışma dört kez çıktı, beşinci olmayacak

Çakışan dördü: `.sec` (bölüm aralığı) · `.ig-group` (malzeme grubu) · `.gmeta` ·
`.in` (**router durum sınıfı** — `.view.pushed.in`). Dördü de **yeni bir komponentin,
zaten anlamı olan bir adı ikinci kez kullanması**yla oldu.

**Kural:** yeni bir komponent sınıfı CSS'te **tek başına seçici** olarak yazılacaksa
**2–3 harfli komponent öneki** taşır.

| | |
|---|---|
| ✅ Doğru | `.sr-head` `.ra-st` `.fm-in` `.kt-grid` `.rv-bars` `.ar-note` |
| 🚫 Yasak | `.in` `.x` `.bd` `.row` `.card` `.form` `.chk` — tek/iki harfli ya da genel ad |
| 🚫 Yasak | Router/durum sözlüğü: `on · in · behind · top · done · off · solid · show · run · one · stacked · fin · new` |
| ✅ Serbest | Önekli bir atanın **altında** scope'lanmış yardımcı ad: `.ra-st .hd`, `.lrow .tx` |

Önek komponentin kısaltmasıdır: `sr-` arama · `ra-` tarif ekle · `fm-` form ·
`kt-` kategori kutucuğu · `rv-` yorumlar · `rw-` yorum yaz · `ar-` makale ·
`cv-` dönüştürücü · `sd-` sofra düzeni · `vw-` ekran iskeleti.

**Denetim zorunlu:**

```bash
node .tools/lint-css.js          # yeni tek başına seçicileri denetler
node .tools/lint-css.js --kaydet # onaylanan sınıfları grandfathered listeye al
```

Mevcut 347 sınıf (`.btn` `.chip` `.lrow` `.sec` …) **onaylanmış tasarım sistemidir**,
grandfathered listede duruyor — dokunulmuyor. Denetim yalnız **yeni** eklenenleri yakalar.
Kırmızı dönerse commit etme, önce öneki ver.

### ⚠️ ORTAK KOMPONENT — ekrana özel kopya YAZILMAZ

Bu hata üç kez çıktı: `.gmeta` · `.cf-r` · püf detaydaki yazar satırı.
Hepsinde **zaten var olan bir komponentin ekrana özel kopyası** yazıldı ve
kopya, aslının koruma kurallarını (flex, min-width, renk) taşımadı.

**Yeni ekran yazarken sıra:**
1. Bu kalıp zaten var mı? → `css/app.css`'te ara, **varsa onu kullan**
2. Kullanırken **iç yapısını birebir kopyala** — dış sınıfı alıp içini
   uydurmak da kopya sayılır ve aynı hatayı üretir
3. Gerçekten yeni bir kalıpsa 2–3 harfli önekle yaz (bkz. sınıf adı sözleşmesi)

**Kişi satırı = `.author`.** Tarif detay · püf detay · şefler listesi ·
ansiklopedi/sözlük yazarı · video · şef kartı — hepsi bu:

```html
<div class="author">
  <span class="av">ZU</span>
  <span class="txt"><b>Ad</b><span class="sub">alt metin</span></span>
  <button class="follow">+ Takip Et</button>
</div>
```

`.txt` yerine `.tx` yazılınca `flex:1;min-width:0` uygulanmadı, alt metin
butonun altına girdi; `.sub` yazılmayınca metin `body` rengini (`#EFE9DF`)
miras alıp **beyaz kartta görünmez oldu**. İkisi de tek satırlık sapmaydı.

**Komponent kendini savunmalı:** ata seçicide `flex:none` (buton),
`min-width:0` (metin), `overflow:hidden;text-overflow:ellipsis` ve renk
tanımı bulunsun ki iç markup sapsa bile ekran bozulmasın.

### ⚠️ ŞABLON EKRAN ≠ BİTMİŞ EKRAN

`sozluk-detay` ve `puf-detay` ekranları var ve açılıyor — ama liste
satırlarının **hepsi aynı içeriği** açıyor (18 sözlük satırı hep "Al Dente").
Ekranın var olması yeterli değil; **liste satırı kendi içeriğini açmıyorsa
iş bitmemiştir.**

`ansiklopedi-detay` bu hattı kurdu, örnek alınacak yer orası: satır bir anahtar
taşır (`data-ans="karabiber"`), `ansBoya(slug)` şablonu o anahtarla doldurur,
içerik canlıdan çıkarılıp `js/ansiklopedi.js`'e (`window.ANS`) yazılır.
Üç araç sırayla: `canli-ansiklopedi.py` → `ansiklopedi-gorsel.py` →
`ansiklopedi-js.py`. Tek örnek içerikle "detay ekranı bitti" denmez —
envanterde 🔨 kalır.

**Geri yığını da içerik düzeyinde olmalı:** router aynı ekranı iki kez itemez,
o yüzden madde → ilgili madde → geri, listeye değil bir önceki maddeye döner
(`ansYigin` slug yığını).

### ⚠️ Kapat/sil butonu toast'la geçiştirilmez

Kart köşesindeki çarpı gerçekten silmeli, "ekle" gerçekten eklemeli.
`data-rm` / `data-add` kalıbını kullan. `node .tools/carpi.js` eylemsiz
kapat/sil butonu bırakılmasını engeller.

### ⚠️ Kontrastı ölç, tahmin etme

Koyu perde üzerindeki metnin okunurluğu göz kararıyla onaylanmaz.
`vqa.js` 15. kontrolü (< 2,2:1) bariz görünmezliği yakalar; hero gibi
fotoğraf üstü metinlerde render'dan **piksel örnekle** ve oranı raporda yaz.
Bu turda modül hero'ları böyle ölçüldü: alt başlık 7,85–8,44:1.

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

`Ana Sayfa · Tarifler · [FAB: Ne Pişirsem?] · Mutfak · Hesap`

Mutfak sekmesi ikonu: FA6 `lightbulb` (`\f0eb`) — ekran adı **Mutfak Sırları**, canlı sitenin
kendi bölüm adı. Sağlık sekmesi kaldırıldı, yerine bu geldi.

Her sekme **kendi scroll konumunu korur**. Aktif sekmeye tekrar dokunmak başa sarar.

### İtilen ekran (push)

Sağdan kayar `.34s cubic-bezier(.32,.72,0,1)`, alttaki ekran `−22%` geri çekilir (iOS parallax).
TabBar aşağı iner.

### Modal (sheet)

Alttan yukarı `.38s`. Ne Pişirsem sihirbazı, Pişirme Modu.

### App Drawer

Sağ üstteki hamburger → **sağdan** açılır (304px). Üstte koyu kullanıcı başlığı (avatar + seviye çubuğu),
altında **Mutfağım / Mutfak Sırları / Uygulama** grupları, en altta çıkış + sürüm.
TabBar birincil, drawer **ikincil/yönetim** katmanı.

Drawer içeriği — Store, Gourmet, Akademi, Sağlık satırları **yok**:
**Mutfağım:** Profilim · Tarif Defterim · Alışveriş Listem · Tariflerim
**Mutfak Sırları:** Püf Noktaları · Mutfak Ansiklopedisi · Video Mutfağı · Dada Route
**Uygulama:** Ayarlar · Yardım · Hakkımızda

### Alt çekmece (bottom sheet)

Filtreler, malzeme listesi. Max %82 yükseklik, üstte tutamak, dışına dokunma kapatır.

---

## 5. Ekranlar

### ✅ Prototipte var — birebir uygula

| Ekran | Tip | Not |
|---|---|---|
| Ana Sayfa | kök | Hero (arama kartı + sayaç) · hızlı erişim · kategori rayı · öne çıkanlar · dolapta ne var · mutfak sırları · videolar · günün tarifi · route · şefler · topluluk |
| Tarifler | kök | Yapışkan arama + kategori rayı · sonuç sayacı + sıralama · aktif filtre pilleri · editör seçkisi geniş kartı · **2 kolonlu ızgara** · filtre çekmecesi |
| Mutfak | kök | Ekran adı **Mutfak Sırları**. Sağlık sekmesinin yerine. Püf Noktaları · Ansiklopedi · Sözlük · Ölçü Birimleri · Sofra Düzeni · Video Mutfağı · Dada Route · Dolapta Ne Var |
| Hesap | kök | Kapak + taşkın avatar · bio · **tek** "Profili Düzenle" butonu · seviye çubuğu · rozet rayı · 3 sayaç · kaydettiklerin rayı · paylaştıkların ızgarası · menü grupları |
| Tarif Detay | push | Hero 352 · yazar · künye tek satır şerit · sekmeler (Malzemeler/Yapılışı/Yorumlar) · topluluk · benzerler · alt eylem çubuğu. **DadaStore ürün rayı kaldırılacak** |
| Ne Pişirsem | modal | Canlıdaki 4 adımlı sihirbaza yükseltilecek: Öğün/Kap → Süre → Zorluk → Damak + Yemek Modu sekmesi |
| Pişirme Modu | modal | Tam ekran koyu `#141210` · adım başlığı 25px · metin 15px · zamanlayıcı · malzeme çekmecesi |

### 🆕 Canlı sitede var, prototipte YOK — sen tasarlayacaksın

Canlı siteyi gezip içeriği oradan al:

| Ekran | Kaynak |
|---|---|
| Püf Noktaları | https://dadagastro.com/puf-noktalari — 591 madde · 11 kategori |
| Mutfak Ansiklopedisi | https://dadagastro.com/mutfak-ansiklopedisi — 1.200 madde · 26 kategori · A–Z |
| Mutfak Sözlüğü | https://dadagastro.com/mutfak-sozlugu — 765 terim · 20 kategori. **Ansiklopediden ayrı** |
| Ölçü Birimleri | https://dadagastro.com/olcu-birimleri — 4 sekmeli tam sayfa |
| Sofra Düzeni | https://dadagastro.com/sofra-duzeni — 11 kategori · 61 ipucu |
| Video Mutfağı | https://dadagastro.com/video-mutfagi — 33 video · 4 seri |
| Dolapta Ne Var | https://dadagastro.com/dolapta-ne-var |
| Dada Route | https://dadagastro.com/yol-guzergahim |
| Şefler / Liderlik / Onur Listesi | /sefler · /liderlik · /onur-listesi |
| Tarif Ekle | https://dadagastro.com/tarif-ekle (giriş gerektirir) |
| Mutfak Defterim | https://dadagastro.com/mutfak-defterim (giriş gerektirir) |
| Rozetlerim | canlı sitede giriş sonrası |
| Giriş / Üye Ol | https://dadagastro.com/giris — 4 hesap tipi |
| Kurumsal | /hakkimizda · /sss · /iletisim · /reklam-ver · /yasal/kvkk |

Canlı sitenin ana sayfa bölüm sırası (**kapsam dışı modüller çıkarılmış hâliyle**):
Hero + Hızlı Erişim · Kategoriler & Dünya Mutfakları · Tarif bul — elindekiyle ·
Bu hafta öne çıkanlar · Mutfak Sırları · İzle & Pişir · Günün Tarifi · Dada Route ·
Şefler & Yazarlar · Topluluğa Katıl.

> Canlıdaki "Sağlıklı Yaşam & Hesaplama", "DadaGourmet" ve "DadaStore" bölümleri
> **alınmayacak** — üçü de "çok yakında" durumunda. Temel kurala bak.
> Ayrıca canlıda **"Haftanın Tarifi" başlığı yok**; `Bu hafta öne çıkanlar` (prototipte zaten var)
> ve videolardan sonra küçük bir `GÜNÜN TARİFİ` bandı var.

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

1. Fazı planla → onay al
2. `frontend-design` skill ile üret
3. Playwright ile 390×844 render al, **kendin değerlendir**
4. Kabul testlerini çalıştır: kalan `data-say` sayısı + kaldırılan modül izi taraması
5. Kısa yazılı rapor: ne değiştin + kontrol sonucu
6. Faz onaylanmadan sonrakine geçme

### Soru sorma kuralı

Açık soru sorarken **her seçeneğe kendi gerekçeli önerini** yaz — hangisini neden önerdiğini tek cümleyle.
Hızlı karar vermeyi sağlar.

---

## 9. Faz sırası (HTML prototipi)

0. **İskelet** — genel ekran kaydı · sınırsız derinlikte push/pop · `#/ekran` hash yönlendirme · tam olay delegasyonu · ortak komponent seti
1. **Kök ekranları canlıya hizala** — sayaçlar · 33 kategori · Mutfak Sırları bölümü · Hızlı Erişim · **Sağlık sekmesini kaldır, Mutfak'ı koy** · kaldırılan modüllerin izlerini temizle
2. Tarif akışı (arama · kategori dizini · yorumlar · Tarif Ekle)
3. Mutfak Sırları ekranları — iki fazda
4. Ne Pişirsem yükseltmesi + Dolapta Ne Var
5. Dada Route
6. Topluluk (şefler · liderlik · onur listesi · rozetler)
7. Hesap & sistem (giriş · üye ol · ayarlar · defter · liste)
8. Kurumsal
9. Süpürme — ölü buton avı · boş durumlar · iskeletler · paylaş · onay diyalogları
10. **Mutfağa Giriş** — en sonda, tasarım verilirse

Detaylı ekran listesi: `EKRAN-ENVANTERI.md`.
