/**
 * Kurumsal (Hakkımızda) sayfasının içerik modeli. Sayfadaki her metin buradan gelir ve Admin > Kurumsal sayfa'dan
 * düzenlenir (CMS anahtarı: corporate_config). Kayıtlı blok eksik alan içerebilir; `resolveCorporateConfig`
 * varsayılanlarla birleştirir ve eski şemayı (vision/mission/quality alanları) yeni kart listesine çevirir.
 */

export interface CorporateCard {
  title: string;
  text: string;
}

export interface CorporateConfig {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  /** Paragraflar boş satırla ayrılır */
  storyContent?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  /** Boş bırakılırsa rozet gösterilmez */
  experienceYears: string;
  experienceSubtitle: string;
  storyImage: string;
  /** Hikâyenin altındaki kısa güvence maddeleri */
  highlights?: string[];
  /** Değer kartları (vizyon, standart, müşteri memnuniyeti…) */
  cards?: CorporateCard[];
  kvkkBadge?: string;
  kvkkTitle?: string;
  /** KVKK bölümleri: başlık + metin */
  kvkkSections?: { heading: string; text: string }[];
  kvkkEmail?: string;
  // Eski şema (cards alanına çevrilir)
  visionTitle?: string;
  visionText?: string;
  missionTitle?: string;
  missionText?: string;
  qualityTitle?: string;
  qualityText?: string;
}

export const DEFAULT_CORPORATE_CONFIG: CorporateConfig = {
  heroBadge: 'Hakkımızda',
  heroTitle: 'Telefonunuz için gereken her şey,',
  heroHighlight: 'tek sepette.',
  heroSubtitle:
    'UBEI, telefon ve akıllı saat aksesuarlarını Türkiye’nin her yerine gönderen bir online mağazadır. Her ürünün hangi modelle uyumlu olduğunu açıkça yazarız; yanlış ürün almazsınız.',
  heroImage: '/kapak/hakkimizda-1.webp',
  storyTitle: 'Nasıl çalışıyoruz',
  storyContent:
    'Ürünleri tek tek deneyip seçiyoruz: kılıfın tuşlara rahat basıp basmadığına, şarj cihazının yazan gücü gerçekten verip vermediğine bakıyoruz.\n\nSiparişler depomuzda hazırlanır; hafta içi saat 15:00’e kadar verilen siparişler aynı gün kargoya verilir.',
  experienceYears: '',
  experienceSubtitle: '',
  storyImage: '/kapak/hakkimizda-2.webp',
  highlights: [
    'Her üründe uyumlu model bilgisi',
    'Aynı gün kargo',
    '1.000 TL üzeri ücretsiz kargo',
    '14 gün kolay iade',
  ],
  cards: [
    {
      title: 'Doğru ürün',
      text: 'Ürün sayfasında uyumlu modeli açıkça yazarız. Emin olamazsanız WhatsApp’tan sorun, telefonunuza uyanı söyleyelim.',
    },
    {
      title: 'Hızlı teslimat',
      text: 'Siparişiniz çoğu ilde 1-2 iş gününde elinizde olur. Kargo takip numarası WhatsApp ve e-postayla gelir.',
    },
    {
      title: 'Kolay iade',
      text: '14 gün içinde, kutusu açılmış olsa bile iade edebilirsiniz. Garantili ürünlerde arızayı biz takip ederiz.',
    },
  ],
  kvkkBadge: '6698 sayılı Kanun kapsamında',
  kvkkTitle: 'Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni',
  kvkkEmail: 'ubei00@gmail.com',
  kvkkSections: [
    {
      heading: 'Veri sorumlusu',
      text: 'UBEI olarak web sitemizi ziyaret eden ve bizden alışveriş yapan kullanıcılarımızın kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu’na uygun olarak işleriz.',
    },
    {
      heading: 'Hangi verileri işliyoruz',
      text: 'Sipariş verdiğinizde ad-soyad, telefon, e-posta ve teslimat adresinizi; siparişinizi hazırlamak, kargoya vermek ve sizi sipariş durumu hakkında bilgilendirmek için kullanırız. Kart bilgileriniz bizde tutulmaz.',
    },
    {
      heading: 'Sepet ve favoriler',
      text: 'Sepetiniz ve favorileriniz, siteye geri döndüğünüzde kaybolmasın diye yalnızca kendi tarayıcınızda saklanır.',
    },
    {
      heading: 'Paylaşım',
      text: 'Kişisel verileriniz satılmaz; yalnızca teslimat için kargo firmasıyla ve kanunen yetkili kurumlarla, gerektiği ölçüde paylaşılır.',
    },
    {
      heading: 'Haklarınız',
      text: 'KVKK 11. madde uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz.',
    },
  ],
};

/** Kayıtlı içeriği varsayılanlarla birleştirir; eski vision/mission/quality alanlarını kart listesine çevirir. */
export function resolveCorporateConfig(stored?: Partial<CorporateConfig> | null): CorporateConfig {
  const merged: CorporateConfig = { ...DEFAULT_CORPORATE_CONFIG, ...(stored || {}) };
  if (!stored?.cards) {
    const legacy: CorporateCard[] = [
      [stored?.visionTitle, stored?.visionText],
      [stored?.missionTitle, stored?.missionText],
      [stored?.qualityTitle, stored?.qualityText],
    ]
      .filter(([t, x]) => t && x)
      .map(([t, x]) => ({ title: String(t), text: String(x) }));
    if (legacy.length) merged.cards = legacy;
  }
  if (!merged.storyContent) {
    merged.storyContent = [stored?.storyParagraph1, stored?.storyParagraph2].filter(Boolean).join('\n\n');
  }
  return merged;
}
