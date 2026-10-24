# UBEI · örnek telefon aksesuarı mağazası

Türkiye geneline satış yapan bir telefon aksesuarı mağazası senaryosuyla hazırlanmış e-ticaret ön yüzü.
Arayüz gerçek bir müşteri projesinin ticaret tarafından alındı; backend yok, ürünler ve içerik örnek veridir.

- Canlı: https://ubei.com.tr
- Hazırlayan: [Yusuf Demir](https://yusufdemir.com.tr)

## Nasıl çalışır

- Next.js 15 (App Router) + Tailwind CSS 4, `output: 'export'` ile tamamen statik.
- `src/mock/data.ts`: kategoriler, ürünler ve sayfa içerikleri (CMS blokları).
- `src/mock/adapter.ts`: API istemcisinin altına takılan sahte adaptör. Bileşenler gerçek backend'le
  konuşuyormuş gibi çalışır; istekler ağa çıkmaz.
- Ürün görselleri `scripts/urun-gorselleri.py` ile üretilen SVG çizimlerdir.

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statik çıktı: out/
```

## Yayın

`main` dalına her push'ta `.github/workflows/pages.yml` siteyi derleyip GitHub Pages'e yükler.
Repo ayarlarında **Pages → Source: GitHub Actions** seçilmeli; özel alan adı (`ubei.com.tr`) aynı
sayfadan girilir.
