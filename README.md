# DadaGastro — Mobil Uygulama Arayüz Prototipi

Tıklanabilir HTML prototip. Onay sonrası Flutter'a çevrilecek.

## Yapı

```
index.html          tüm ekranların markup'ı (tek sayfa, view tabanlı)
css/app.css         token'lar + tüm komponent stilleri
js/app.js           router, etkileşimler, pişirme modu, filtreler
assets/fonts/       Gilroy (3 ağırlık) + FontAwesome 6.5.2 woff2
assets/img/         yemek fotoğrafları (webp), logo
assets/ing/         malzeme ikonları (png)
```

## Geliştirme

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

`file://` ile açma — fontlar CORS'a takılır. Her zaman sunucu üzerinden aç.

## Deploy

Bu klasörün tamamı GitHub Pages'e gider. `.nojekyll` dosyası şart.
