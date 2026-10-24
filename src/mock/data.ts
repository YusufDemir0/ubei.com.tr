/**
 * UBEI mağaza verisi. Site statik yayınlandığı için ürünler, kategoriler ve CMS içerikleri
 * buradan gelir (bkz. mock/adapter.ts).
 */
import type { Category, Product } from '../types';

type Cat = { slug: string; name: string; description: string };

const CATS: Cat[] = [
  { slug: 'telefon-kiliflari', name: 'Telefon kılıfları', description: 'Şeffaf, silikon, deri ve darbe emici kılıflar.' },
  { slug: 'ekran-koruyucular', name: 'Ekran koruyucular', description: 'Kırılmaz cam, hayalet cam ve kamera lens koruyucular.' },
  { slug: 'sarj-cihazlari', name: 'Şarj cihazları', description: 'Hızlı şarj adaptörleri ve kablosuz şarj cihazları.' },
  { slug: 'kablolar', name: 'Kablolar', description: 'USB-C ve Lightning, örgü ve yüksek watt kablolar.' },
  { slug: 'powerbank', name: 'Powerbank', description: 'MagSafe uyumlu ve yüksek kapasiteli taşınabilir bataryalar.' },
  { slug: 'kulakliklar', name: 'Kulaklıklar', description: 'Kablosuz ve kablolu kulaklıklar.' },
  { slug: 'arac-aksesuarlari', name: 'Araç aksesuarları', description: 'Araç tutucular ve araç içi şarj cihazları.' },
  { slug: 'akilli-saat-aksesuarlari', name: 'Akıllı saat aksesuarları', description: 'Kayışlar ve şarj kabloları.' },
];

export const categories: Category[] = CATS.map((c, i) => ({
  id: `kat-${c.slug}`,
  slug: c.slug,
  name: c.name,
  description: c.description,
  image: `/kategoriler/${c.slug}.webp`,
  parentId: null,
  sortOrder: i,
  children: [],
}));

const catRef = (slug: string) => {
  const c = CATS.find((x) => x.slug === slug)!;
  return { id: `kat-${c.slug}`, name: c.name, slug: c.slug };
};

interface Seed {
  slug: string;
  name: string;
  cat: string;
  price: number;
  originalPrice?: number;
  stock: number;
  badge?: string;
  material: string;
  dimensions: string;
  colors?: string[];
  description: string;
  features: string[];
  salesCount: number;
}

const SEEDS: Seed[] = [
  {
    slug: 'iphone-15-pro-seffaf-magsafe-kilif', name: 'iPhone 15 Pro Şeffaf MagSafe Kılıf', cat: 'telefon-kiliflari',
    price: 549, originalPrice: 699, stock: 48, badge: 'Çok satan', material: 'Polikarbonat sırt, TPU kenar',
    dimensions: 'Uyumlu model: iPhone 15 Pro', colors: ['Şeffaf'], salesCount: 412,
    description: 'Telefonun rengini kapatmayan, sararmaya dirençli şeffaf kılıf. İçindeki mıknatıs halkası sayesinde MagSafe şarj cihazları ve tutucularla doğrudan çalışır.',
    features: ['MagSafe uyumlu mıknatıs halkası', 'Sararmaya dirençli kaplama', 'Kamera ve ekran kenarında 1 mm yükseltilmiş çerçeve', 'Kablosuz şarjı engellemez'],
  },
  {
    slug: 'iphone-15-silikon-kilif-gece-mavisi', name: 'iPhone 15 Silikon Kılıf · Gece Mavisi', cat: 'telefon-kiliflari',
    price: 399, stock: 64, material: 'Sıvı silikon, mikrofiber iç yüzey', dimensions: 'Uyumlu model: iPhone 15',
    colors: ['Gece Mavisi', 'Siyah', 'Adaçayı'], salesCount: 268,
    description: 'Elde kaymayan yumuşak dokulu silikon kılıf. İç yüzeyindeki mikrofiber kaplama telefonun kasasını çizilmeye karşı korur.',
    features: ['Kaymaz yumuşak doku', 'Mikrofiber iç astar', 'Tuşlar kılıf üzerinden rahat basılır', 'Kablosuz şarjla uyumlu'],
  },
  {
    slug: 'iphone-15-pro-darbe-emici-kilif', name: 'iPhone 15 Pro Darbe Emici Kılıf · Siyah', cat: 'telefon-kiliflari',
    price: 499, stock: 31, material: 'TPU gövde, köşelerde hava yastığı', dimensions: 'Uyumlu model: iPhone 15 Pro',
    colors: ['Siyah'], salesCount: 157,
    description: 'Köşelerindeki hava yastıklarıyla düşmelerde darbeyi emen kılıf. İnce yapısına rağmen kamera adasını tamamen çevreler.',
    features: ['Köşelerde hava yastığı', 'Kamera adasını çevreleyen çerçeve', 'Kaymayan mat yüzey', 'Kablosuz şarjla uyumlu'],
  },
  {
    slug: 'iphone-14-deri-cuzdan-kilif-taba', name: 'iPhone 14 Deri Cüzdan Kılıf · Taba', cat: 'telefon-kiliflari',
    price: 749, stock: 12, badge: 'Az kaldı', material: 'Hakiki deri', dimensions: 'Uyumlu model: iPhone 14',
    colors: ['Taba', 'Siyah'], salesCount: 88,
    description: 'Arkasındaki bölmede iki kart taşıyabilen hakiki deri kılıf. Kullandıkça deri koyulaşır ve kendine has bir doku kazanır.',
    features: ['İki kartlık arka bölme', 'Mıknatıslı kapak', 'Hakiki deri', 'Kart çıkarmadan temassız ödeme'],
  },
  {
    slug: 'iphone-15-pro-kamera-korumali-kilif-haki', name: 'iPhone 15 Pro Kamera Korumalı Kılıf · Haki', cat: 'telefon-kiliflari',
    price: 299, stock: 57, material: 'Mat sıvı silikon, metal kamera çerçevesi', dimensions: 'Uyumlu model: iPhone 15 Pro',
    colors: ['Haki', 'Siyah'], salesCount: 134,
    description: 'Kamera adasının etrafındaki yükseltilmiş metal çerçeve, telefon masaya sırtüstü konduğunda lensleri yüzeye değdirmez.',
    features: ['Yükseltilmiş metal kamera çerçevesi', 'Mat, parmak izi tutmayan yüzey', 'İnce ve hafif', 'Kablosuz şarjla uyumlu'],
  },
  {
    slug: 'iphone-15-pro-max-hayalet-cam', name: 'iPhone 15 Pro Max Hayalet Cam', cat: 'ekran-koruyucular',
    price: 349, stock: 75, material: 'Temperli cam, gizlilik filtresi', dimensions: 'Uyumlu model: iPhone 15 Pro Max',
    salesCount: 201,
    description: 'Ekranınıza yandan bakanların içeriği görmesini engelleyen gizlilik camı. Karşıdan bakınca görüntü net kalır.',
    features: ['Yandan bakışta karartma', '9H sertlik', 'Kolay uygulama aparatı kutuda', 'Yüz tanıma ile sorunsuz'],
  },
  {
    slug: 'iphone-15-kirilmaz-cam-2li', name: "iPhone 15 Kırılmaz Cam (2'li paket)", cat: 'ekran-koruyucular',
    price: 279, originalPrice: 349, stock: 90, material: 'Temperli cam', dimensions: 'Uyumlu model: iPhone 15',
    salesCount: 176,
    description: 'Kutudan iki cam çıkar; biri kırılırsa yedeği hazırdır. Kenarlara kadar uzanan kesimi kılıfla çakışmaz.',
    features: ['2 adet cam', '9H sertlik', 'Kılıfla uyumlu kesim', 'Yağ itici kaplama'],
  },
  {
    slug: 'kamera-lens-koruyucu-seti', name: 'Kamera Lens Koruyucu Seti', cat: 'ekran-koruyucular',
    price: 199, stock: 120, material: 'Safir kaplamalı cam, alüminyum çerçeve', dimensions: 'iPhone 15 Pro / 15 Pro Max',
    salesCount: 143,
    description: 'Her lense ayrı oturan cam koruyucular. Fotoğraf kalitesini düşürmeden lensleri çizik ve darbeden korur.',
    features: ['Her lens için ayrı koruyucu', 'Flaşı engellemeyen kesim', 'Alüminyum çerçeve', 'Uygulama aparatı kutuda'],
  },
  {
    slug: '20w-usb-c-hizli-sarj-adaptoru', name: '20W USB-C Hızlı Şarj Adaptörü', cat: 'sarj-cihazlari',
    price: 449, stock: 82, badge: 'Çok satan', material: 'Alev geciktirici PC kasa', dimensions: '20 W · 1 × USB-C (PD 3.0)',
    salesCount: 389,
    description: 'iPhone\'u yaklaşık 30 dakikada %50\'ye kadar şarj eden kompakt adaptör. Aşırı ısınma ve kısa devre korumalıdır.',
    features: ['USB Power Delivery 3.0', 'Aşırı ısınma ve kısa devre koruması', 'Kompakt boyut', 'iPhone, iPad ve Android ile uyumlu'],
  },
  {
    slug: '70w-gan-seyahat-sarj-cihazi', name: '70W GaN Seyahat Şarj Cihazı', cat: 'sarj-cihazlari',
    price: 1149, originalPrice: 1399, stock: 26, badge: 'İndirimde', material: 'GaN teknolojisi', dimensions: '70 W · 2 × USB-C, 2 × USB-A · değiştirilebilir fiş',
    salesCount: 97,
    description: 'Dizüstü bilgisayar, telefon ve kulaklığı tek prizden aynı anda şarj eder. Değiştirilebilir fişleriyle yurt dışında da çalışır; GaN sayesinde benzer güçteki adaptörlerden çok daha küçüktür.',
    features: ['Tek port kullanımda 70 W', 'Dört cihazı aynı anda şarj', 'AB, ABD, İngiltere ve Avustralya fişleri', 'MacBook Air ve iPad ile uyumlu'],
  },
  {
    slug: '15w-magsafe-uyumlu-kablosuz-sarj', name: '15W MagSafe Uyumlu Kablosuz Şarj', cat: 'sarj-cihazlari',
    price: 799, stock: 40, material: 'Alüminyum gövde', dimensions: '15 W · USB-C girişli',
    colors: ['Gece Grisi', 'Beyaz'], salesCount: 121,
    description: 'Telefonun arkasına mıknatısla oturan kablosuz şarj cihazı. Doğru noktayı aramanıza gerek kalmaz; şarj sırasında telefonu kullanmaya devam edebilirsiniz.',
    features: ['Mıknatısla tam hizalama', '15 W\'a kadar kablosuz şarj', '1 m örgü kablo dahil', 'Yabancı cisim algılama'],
  },
  {
    slug: '3u-1-arada-kablosuz-sarj-istasyonu', name: '3\'ü 1 Arada Kablosuz Şarj İstasyonu', cat: 'sarj-cihazlari',
    price: 1899, stock: 9, badge: 'Az kaldı', material: 'Alüminyum ve silikon', dimensions: 'Telefon 15 W · Saat 5 W · Kulaklık 5 W',
    salesCount: 64,
    description: 'Telefon, akıllı saat ve kulaklığı gece boyunca tek yerde şarj eder. Komodin ya da masa üzerinde kabloları tek kabloya indirir.',
    features: ['Üç cihaz aynı anda', 'Telefon dik ya da yatay', 'Gece için kısılabilen ışık', 'Adaptör kutuda'],
  },
  {
    slug: 'usb-c-usb-c-orgu-kablo-1m-60w', name: 'USB-C – USB-C Örgü Kablo 1 m · 60W', cat: 'kablolar',
    price: 229, stock: 150, material: 'Naylon örgü dış kılıf', dimensions: '1 m · 60 W · USB 2.0 veri',
    colors: ['Siyah'], salesCount: 302,
    description: 'Günlük kullanımda kopmaya ve dolaşmaya dayanıklı örgü kablo. Telefon, tablet ve küçük dizüstü bilgisayarlar için yeterli güç taşır.',
    features: ['10.000 bükme testinden geçmiş', '60 W\'a kadar şarj', 'Cırtlı kablo toplayıcı', 'iPhone 15 ve Android ile uyumlu'],
  },
  {
    slug: 'usb-c-lightning-kablo-2m', name: 'USB-C – Lightning Kablo 2 m', cat: 'kablolar',
    price: 279, stock: 70, material: 'TPE dış kılıf', dimensions: '2 m · hızlı şarj destekli',
    salesCount: 188,
    description: 'Yataktan ya da koltuktan telefonu rahatça kullanmanızı sağlayan uzun kablo. 20 W adaptörle hızlı şarjı destekler.',
    features: ['2 m uzunluk', 'Hızlı şarj desteği', 'iPhone 14 ve öncesi ile uyumlu', 'Sağlam uç koruması'],
  },
  {
    slug: '240w-usb-c-kablo-2m', name: '240W USB-C Kablo 2 m', cat: 'kablolar',
    price: 349, stock: 44, material: 'Naylon örgü dış kılıf', dimensions: '2 m · 240 W · USB 2.0 veri',
    colors: ['Lacivert'], salesCount: 71,
    description: 'Oyun bilgisayarı ve yüksek güçlü dizüstü bilgisayarlar için 240 W taşıyabilen kablo. Telefonda da güvenle kullanılır.',
    features: ['240 W güç desteği', 'E-Marker çip', 'Örgü dış kılıf', 'Dizüstü bilgisayar ve telefonla uyumlu'],
  },
  {
    slug: '10000-mah-magsafe-powerbank', name: '10.000 mAh MagSafe Powerbank', cat: 'powerbank',
    price: 1099, stock: 33, badge: 'Yeni', material: 'Alüminyum alaşım kasa', dimensions: '10.000 mAh · 15 W kablosuz · 20 W USB-C',
    colors: ['Beyaz'], salesCount: 115,
    description: 'Telefonun arkasına yapışıp kablosuz şarj eden ince powerbank. Bir iPhone\'u neredeyse iki kez doldurur.',
    features: ['MagSafe mıknatıs', 'Kablosuz ve USB-C ile şarj', 'Kalan şarj göstergesi', 'Uçakta taşınabilir kapasite'],
  },
  {
    slug: '20000-mah-22-5w-powerbank', name: '20.000 mAh 22.5W Powerbank', cat: 'powerbank',
    price: 899, originalPrice: 1049, stock: 58, badge: 'İndirimde', material: 'Alev geciktirici PC kasa', dimensions: '20.000 mAh · 22.5 W · 2 × USB-A, 1 × USB-C',
    colors: ['Siyah'], salesCount: 226,
    description: 'Uzun yolculuk ve kamp için yüksek kapasiteli powerbank. Üç cihazı aynı anda şarj eder.',
    features: ['22.5 W hızlı şarj', 'Üç çıkış', 'LED şarj göstergesi', 'Uçakta taşınabilir kapasite'],
  },
  {
    slug: 'kablosuz-kulak-ici-kulaklik-anc', name: 'Kablosuz Kulak İçi Kulaklık · ANC', cat: 'kulakliklar',
    price: 1499, stock: 22, badge: 'Yeni', material: 'Bluetooth 5.3', dimensions: '6 saat dinleme · kutuyla 30 saat',
    colors: ['Beyaz', 'Siyah'], salesCount: 92,
    description: 'Aktif gürültü engelleme ile metroda ve ofiste sesi kendi tarafınızda tutan kulaklık. Şeffaf mod sayesinde çıkarmadan konuşabilirsiniz.',
    features: ['Aktif gürültü engelleme', 'Şeffaf mod', 'Kablosuz şarj kutusu', 'IPX4 tere dayanıklı'],
  },
  {
    slug: 'usb-c-kablolu-kulaklik', name: 'USB-C Kablolu Kulaklık', cat: 'kulakliklar',
    price: 299, stock: 85, material: 'Dijital DAC', dimensions: '1,2 m kablo · USB-C',
    salesCount: 164,
    description: 'Şarj derdi olmayan kablolu kulaklık. Kablo üzerindeki kumandayla ses ayarı yapıp aramaları yanıtlayabilirsiniz.',
    features: ['Mikrofonlu kumanda', 'Dahili dijital ses çözücü', 'iPhone 15 ve Android ile uyumlu', 'Hafif ve kulağa oturan yapı'],
  },
  {
    slug: 'havalandirma-miknatisli-arac-tutucu', name: 'Havalandırma Mıknatıslı Araç Tutucu', cat: 'arac-aksesuarlari',
    price: 349, stock: 66, material: 'Alüminyum ve silikon', dimensions: 'Tüm telefonlarla (metal plaka dahil)',
    salesCount: 197,
    description: 'Havalandırma ızgarasına takılan, telefonu tek elle bırakıp almanızı sağlayan mıknatıslı tutucu. Yolda sarsıntıda yerinden oynamaz.',
    features: ['Güçlü neodimyum mıknatıs', '360° dönen başlık', 'Izgaraya zarar vermeyen kanca', 'MagSafe kılıflarla doğrudan uyumlu'],
  },
  {
    slug: 'arac-ici-45w-cift-port-sarj', name: 'Araç İçi 45W Çift Port Şarj', cat: 'arac-aksesuarlari',
    price: 399, stock: 49, material: 'Alüminyum kasa', dimensions: '45 W · 1 × USB-C, 1 × USB-A',
    salesCount: 109,
    description: 'Çakmaklık girişine takılan, iki telefonu aynı anda hızlı şarj eden araç şarj cihazı.',
    features: ['USB-C\'den 45 W', 'İki cihaz aynı anda', '12/24 V araçlarla uyumlu', 'Aşırı ısınma koruması'],
  },
  {
    slug: 'torpido-vantuzlu-telefon-tutucu', name: 'Torpido Vantuzlu Telefon Tutucu', cat: 'arac-aksesuarlari',
    price: 449, stock: 18, material: 'ABS ve silikon vantuz', dimensions: '4,7" – 6,9" telefonlar',
    salesCount: 58,
    description: 'Torpidoya ya da cama yapışan, navigasyonu göz hizasında tutan tutucu. Uzayan kolu sayesinde telefonu size yaklaştırabilirsiniz.',
    features: ['Yıkanabilir yapışkan vantuz', 'Uzayan kol', 'Tek tuşla bırakma', 'Kılıflı telefonlarla uyumlu'],
  },
  {
    slug: 'apple-watch-silikon-kayis-45mm', name: 'Apple Watch Silikon Kayış 45 mm', cat: 'akilli-saat-aksesuarlari',
    price: 249, stock: 95, material: 'Spor silikon', dimensions: '42 / 44 / 45 mm kasa',
    colors: ['Kiremit', 'Lacivert', 'Siyah'], salesCount: 141,
    description: 'Spor yaparken terlemeyen, gün boyu rahat yumuşak silikon kayış. Takıp çıkarmak saniyeler sürer.',
    features: ['Tere dayanıklı', 'S/M ve M/L boy kutuda', 'Kolay takılan bağlantı', 'Tüm Apple Watch serileriyle uyumlu'],
  },
  {
    slug: 'akilli-saat-sarj-kablosu-usb-c', name: 'Akıllı Saat Şarj Kablosu · USB-C', cat: 'akilli-saat-aksesuarlari',
    price: 199, stock: 60, material: 'Alüminyum mıknatıslı başlık', dimensions: '1 m · USB-C',
    salesCount: 77,
    description: 'Evde ve ofiste yedek olarak tutabileceğiniz mıknatıslı saat şarj kablosu.',
    features: ['Mıknatısla oturan başlık', 'USB-C uç', 'Apple Watch ile uyumlu', '1 m uzunluk'],
  },
];

export const products: Product[] = SEEDS.map((s, i) => {
  const images = [`/urunler/${s.slug}-1.webp`, `/urunler/${s.slug}-2.webp`];
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    category: catRef(s.cat),
    categoryId: `kat-${s.cat}`,
    price: s.price,
    originalPrice: s.originalPrice,
    stock: s.stock,
    inStock: s.stock > 0,
    image: images[0],
    images,
    badge: s.badge,
    description: s.description,
    features: s.features,
    material: s.material,
    dimensions: s.dimensions,
    colors: (s.colors || []) as unknown as Product['colors'],
    salesCount: s.salesCount,
    vatRate: 0.2,
    isPublished: true,
    createdAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
  };
});

/** Sitenin CMS içeriği (backend'de admin panelinden girilen bloklar). */
export const cms: Record<string, unknown> = {
  landing_page_config: { type: 'home' },
  ticker_items: [
    'Sipariş alımına geçici olarak ara verdik',
    'Ürünleri incelemeye ve favorilerinize eklemeye devam edebilirsiniz',
    'Sorularınız için: ubei00@gmail.com',
  ],
  ticker_style: { backgroundColor: '#111418', textColor: '#C8F25C', speedSeconds: 40 },
  contact_info: {
    phone: '+90 850 000 82 34',
    email: 'ubei00@gmail.com',
    address: 'Online mağaza · Türkiye geneline gönderim',
    whatsapp: '',
    workingHours: 'Hafta içi 09:00 – 18:00, Cumartesi 10:00 – 16:00',
  },
  social_links: { instagram: 'https://instagram.com/', tiktok: '', youtube: '', facebook: '', telegram: '', whatsapp: '' },
  campaign_popup: { enabled: false },
  page_home: {
    version: 1,
    sections: [
      {
        id: 'hero', type: 'hero', props: {
          slides: [
            {
              id: 's1', badge: 'Yeni sezon',
              title: 'Telefonunuza yakışan aksesuarlar',
              subtitle: 'Kılıftan şarj cihazına, her model için seçilmiş ürünler. 1.000 TL üzeri kargo ücretsiz.',
              image: '/kapak/kapak-1.webp', buttonText: 'Kılıflara göz atın', buttonLink: '/kategori/telefon-kiliflari',
            },
            {
              id: 's2', badge: 'Hızlı şarj',
              title: 'Yarım saatte %50 şarj',
              subtitle: 'USB-C hızlı şarj adaptörleri, GaN şarj cihazları ve kablosuz şarj istasyonları.',
              image: '/kapak/kapak-2.webp', buttonText: 'Şarj cihazları', buttonLink: '/kategori/sarj-cihazlari',
            },
            {
              id: 's3', badge: 'İndirim',
              title: 'Powerbank ve GaN şarjda indirim',
              subtitle: 'Seçili ürünlerde %20\'ye varan indirim, stoklarla sınırlı.',
              image: '/kapak/kapak-3.webp', buttonText: 'İndirimli ürünler', buttonLink: '/indirimler',
            },
          ],
        },
      },
      { id: 'categories', type: 'categories', props: { title: 'Kategoriler', subtitle: '' } },
      { id: 'curated-sets', type: 'curated_sets', hidden: true, props: {} },
      { id: 'products', type: 'product_grid', props: { title: 'Çok satanlar', subtitle: 'Bu ay en çok tercih edilen ürünler.', limit: 8 } },
      {
        id: 'how-we-work', type: 'feature_list', background: 'paper', props: {
          title: 'Nasıl çalışıyoruz',
          text: 'Türkiye\'nin her yerine gönderiyoruz. Ürünü beğenmezseniz 14 gün içinde iade edebilirsiniz.',
          items: [
            { title: 'Aynı gün kargo', text: 'Hafta içi saat 15:00\'e kadar verilen siparişler aynı gün kargoya verilir.' },
            { title: 'Ücretsiz kargo', text: '1.000 TL ve üzeri siparişlerde kargo bizden.' },
            { title: 'Kolay iade', text: '14 gün içinde, kutusu açılmış olsa bile iade edebilirsiniz.' },
          ],
          numbered: false,
          buttons: [{ label: 'Tüm ürünler', href: '/kategori', variant: 'primary' }],
        },
      },
    ],
  },
  page_contact: {
    version: 1,
    sections: [
      { id: 'header', type: 'page_header', background: 'paper', spacing: 'compact', props: { title: 'İletişim', text: 'Sipariş, iade ya da ürün uyumluluğu hakkında sorularınız için bize yazın.', buttons: [] } },
      { id: 'contact', type: 'contact_details', props: { title: '', text: '', formTitle: '' } },
    ],
  },
};
