# UBEI · telefon aksesuarı e-ticaret sitesi

Telefon ve akıllı saat aksesuarları satan, Türkiye geneline gönderim yapan bir online mağaza için
hazırlanmış e-ticaret ön yüzü: kategori ve filtreler, ürün sayfaları, hızlı önizleme, favoriler,
sepet ve sipariş adımı.

- Canlı: https://ubei.com.tr
- Geliştiren: [Yusuf Demir](https://yusufdemir.com.tr)

## Teknik

- Next.js 15 (App Router) + Tailwind CSS 4, `output: 'export'` ile tamamen statik.
- `src/mock/data.ts`: kategoriler, ürünler ve sayfa içerikleri (CMS blokları).
- `src/mock/adapter.ts`: API istemcisinin altına takılan adaptör; bileşenler bir backend'le konuşur
  gibi çalışır, istekler bu veriden yanıtlanır. Gerçek bir API'ye bağlamak için adaptörü kaldırmak yeterli.
- `src/lib/storeStatus.ts`: sipariş alımını açıp kapatan anahtar (`ORDERS_PAUSED`).
- Fotoğraflar Unsplash lisansıyla kullanılmıştır, kaynaklar `GORSELLER.md` dosyasında.

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statik çıktı: out/
```

## Yayın

`main` dalına her push'ta `.github/workflows/pages.yml` siteyi derleyip GitHub Pages'e yükler.
