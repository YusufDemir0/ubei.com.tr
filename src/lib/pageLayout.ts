/**
 * Sayfa düzeni modeli (CMS anahtarları: page_home, page_corporate, page_contact).
 *
 * Bir sayfa sıralı bölümlerden oluşur. Admin "Tasarım"da bölümleri sıralar, gizler, etiket ve zemin seçer, yeni bölüm
 * ekler; "İçerik"te bölümün metinlerini düzenler. Bölümlerin iç yerleşimi tasarım sisteminden gelir, böylece sayfa
 * her düzenlemede sitenin genel görünümünü korur.
 *
 * Alan limitleri backend/src/validations/cms.ts ile aynıdır; biri değişirse diğeri de güncellenmelidir.
 */

import type { HeroSlide } from '../stores/useCMSStore';
import { resolveCorporateConfig, type CorporateConfig } from './corporateContent';

export type PageKey = 'page_home' | 'page_corporate' | 'page_contact';

export type SectionType =
  | 'hero'
  | 'categories'
  | 'curated_sets'
  | 'product_grid'
  | 'contact_details'
  | 'page_header'
  | 'image_text'
  | 'feature_list'
  | 'cards'
  | 'rich_text'
  | 'cta';

export type SectionBackground = 'white' | 'canvas' | 'paper' | 'ink';
export type SectionSpacing = 'compact' | 'normal' | 'roomy';

export interface PageButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface PageItem {
  title: string;
  text: string;
}

export type RichBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string };

export interface PageSection {
  id: string;
  type: SectionType;
  hidden?: boolean;
  label?: string;
  anchor?: string;
  background?: SectionBackground;
  spacing?: SectionSpacing;
  // Tip başına alanlar (aşağıdaki SECTION_FIELDS); serbest anahtar-değer olarak tutulur
  props: Record<string, unknown>;
}

export interface PageDoc {
  version: 1;
  sections: PageSection[];
}

// ── Alan tanımları: içerik formu bu listeden üretilir ─────────────────────────

export type FieldDef =
  | { key: string; label: string; kind: 'line'; max: number; required?: boolean; placeholder?: string; help?: string }
  | { key: string; label: string; kind: 'text'; max: number; rows?: number; required?: boolean; help?: string }
  | { key: string; label: string; kind: 'image'; help?: string }
  | { key: string; label: string; kind: 'select'; options: { value: string; label: string }[] }
  | { key: string; label: string; kind: 'number'; min: number; max: number }
  | { key: string; label: string; kind: 'toggle'; help?: string }
  | { key: string; label: string; kind: 'buttons'; maxItems: number }
  | { key: string; label: string; kind: 'items'; maxItems: number; titleMax: number; textMax: number }
  | { key: string; label: string; kind: 'bullets'; maxItems: number; itemMax: number }
  | { key: string; label: string; kind: 'blocks'; maxItems: number }
  | { key: string; label: string; kind: 'slides'; maxItems: number };

export const LIMITS = {
  label: 40,
  anchor: 40,
  buttonLabel: 40,
  href: 500,
  heading: 160,
  paragraph: 3000,
  listItem: 400,
  quote: 600,
  slideTitle: 120,
  slideSubtitle: 300,
  slideBadge: 60,
} as const;

export interface SectionMeta {
  name: string;
  description: string;
  /** Canlı veriye bağlı bölüm: gizlenebilir, sıralanabilir ama silinemez */
  system: boolean;
  fields: FieldDef[];
}

export const SECTION_META: Record<SectionType, SectionMeta> = {
  hero: {
    name: 'Kapak slaytı',
    description: 'Sayfanın en üstündeki büyük görselli slaytlar.',
    system: true,
    fields: [{ key: 'slides', label: 'Slaytlar', kind: 'slides', maxItems: 8 }],
  },
  categories: {
    name: 'Kategori bandı',
    description: 'Kategorilerin görselli, kayan balonları. Kategoriler Ürün > Kategoriler’den gelir.',
    system: true,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 120 },
      { key: 'subtitle', label: 'Alt metin', kind: 'text', max: 300, rows: 2 },
    ],
  },
  curated_sets: {
    name: 'Setler',
    description: 'Birlikte satılan set ürünleri. Ürün listesinden otomatik gelir.',
    system: true,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 120 },
      { key: 'subtitle', label: 'Alt metin', kind: 'text', max: 300, rows: 2 },
    ],
  },
  product_grid: {
    name: 'Ürün vitrini',
    description: 'Yayındaki ürünlerden bir seçki.',
    system: true,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 120 },
      { key: 'subtitle', label: 'Alt metin', kind: 'text', max: 300, rows: 2 },
      { key: 'limit', label: 'Gösterilecek ürün sayısı', kind: 'number', min: 4, max: 24 },
    ],
  },
  contact_details: {
    name: 'İletişim bilgileri ve form',
    description: 'Telefon, e-posta ve adres kartları ile mesaj formu. Bilgiler İçerik > İletişim bilgileri’nden gelir.',
    system: true,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 120 },
      { key: 'text', label: 'Açıklama', kind: 'text', max: 600, rows: 2 },
      { key: 'formTitle', label: 'Form başlığı', kind: 'line', max: 120 },
    ],
  },
  page_header: {
    name: 'Sayfa başlığı',
    description: 'Büyük başlık, kısa açıklama ve isteğe bağlı görsel.',
    system: false,
    fields: [
      { key: 'badge', label: 'Üst etiket', kind: 'line', max: 60 },
      { key: 'title', label: 'Başlık', kind: 'line', max: 160, required: true },
      { key: 'highlight', label: 'Vurgulu devam (renkli)', kind: 'line', max: 160, help: 'Başlığın devamı, marka renginde gösterilir.' },
      { key: 'text', label: 'Açıklama', kind: 'text', max: 1000, rows: 3 },
      { key: 'image', label: 'Görsel', kind: 'image' },
      { key: 'buttons', label: 'Butonlar', kind: 'buttons', maxItems: 2 },
    ],
  },
  image_text: {
    name: 'Görsel ve metin',
    description: 'Yan yana görsel ve metin; madde listesi ve bir sayı rozeti eklenebilir.',
    system: false,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 160 },
      { key: 'body', label: 'Metin', kind: 'text', max: 6000, rows: 6, help: 'Her satır ayrı paragraf olarak gösterilir.' },
      { key: 'image', label: 'Görsel', kind: 'image' },
      {
        key: 'imagePosition',
        label: 'Görselin yeri',
        kind: 'select',
        options: [
          { value: 'left', label: 'Solda' },
          { value: 'right', label: 'Sağda' },
        ],
      },
      { key: 'statValue', label: 'Rozet sayısı', kind: 'line', max: 20, placeholder: 'Örn: 25+' },
      { key: 'statLabel', label: 'Rozet açıklaması', kind: 'line', max: 80, placeholder: 'Örn: yıllık tecrübe' },
      { key: 'bullets', label: 'Madde listesi', kind: 'bullets', maxItems: 12, itemMax: 200 },
      { key: 'buttons', label: 'Butonlar', kind: 'buttons', maxItems: 2 },
    ],
  },
  feature_list: {
    name: 'Özellik listesi',
    description: 'Solda başlık ve açıklama, sağda başlıklı maddeler.',
    system: false,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 160 },
      { key: 'text', label: 'Açıklama', kind: 'text', max: 1000, rows: 3 },
      { key: 'items', label: 'Maddeler', kind: 'items', maxItems: 12, titleMax: 100, textMax: 600 },
      { key: 'numbered', label: 'Maddeleri numarala', kind: 'toggle', help: 'Yalnız sıralı adımlar için (ör. sipariş süreci).' },
      { key: 'buttons', label: 'Butonlar', kind: 'buttons', maxItems: 2 },
    ],
  },
  cards: {
    name: 'Kartlar',
    description: 'Başlık ve metinden oluşan kart dizisi.',
    system: false,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 160 },
      { key: 'text', label: 'Açıklama', kind: 'text', max: 1000, rows: 2 },
      { key: 'items', label: 'Kartlar', kind: 'items', maxItems: 12, titleMax: 100, textMax: 600 },
    ],
  },
  rich_text: {
    name: 'Serbest metin',
    description: 'Ara başlık, paragraf, liste ve alıntılardan dilediğiniz kadar. Yasal metinler için uygundur.',
    system: false,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 200 },
      { key: 'blocks', label: 'Metin blokları', kind: 'blocks', maxItems: 80 },
    ],
  },
  cta: {
    name: 'Çağrı',
    description: 'Kısa başlık, bir cümle ve butonlar.',
    system: false,
    fields: [
      { key: 'title', label: 'Başlık', kind: 'line', max: 160, required: true },
      { key: 'text', label: 'Metin', kind: 'text', max: 600, rows: 2 },
      { key: 'buttons', label: 'Butonlar', kind: 'buttons', maxItems: 2 },
    ],
  },
};

export const FREE_SECTION_TYPES: SectionType[] = ['page_header', 'image_text', 'feature_list', 'cards', 'rich_text', 'cta'];

export const PAGE_INFO: Record<PageKey, { name: string; path: string; required: SectionType[]; allowed: SectionType[] }> = {
  page_home: {
    name: 'Ana sayfa',
    path: '/anasayfa',
    required: ['hero', 'categories', 'curated_sets', 'product_grid'],
    allowed: ['hero', 'categories', 'curated_sets', 'product_grid', ...FREE_SECTION_TYPES],
  },
  page_corporate: { name: 'Kurumsal', path: '/kurumsal', required: [], allowed: FREE_SECTION_TYPES },
  page_contact: {
    name: 'İletişim',
    path: '/iletisim',
    required: ['contact_details'],
    allowed: ['contact_details', ...FREE_SECTION_TYPES],
  },
};

export const BACKGROUND_OPTIONS: { value: SectionBackground; label: string; swatch: string }[] = [
  { value: 'white', label: 'Beyaz', swatch: '#FFFFFF' },
  { value: 'canvas', label: 'Krem', swatch: '#FBF8F1' },
  { value: 'paper', label: 'Sepya', swatch: '#F3ECDE' },
  { value: 'ink', label: 'Koyu', swatch: '#161514' },
];

export const SPACING_OPTIONS: { value: SectionSpacing; label: string }[] = [
  { value: 'compact', label: 'Sıkı' },
  { value: 'normal', label: 'Normal' },
  { value: 'roomy', label: 'Geniş' },
];

// ── Güvenlik: bağlantılar ─────────────────────────────────────────────────────

const SAFE_HREF = /^(\/(?!\/)[^\s]*|#[A-Za-z0-9_-]+|https:\/\/[^\s]+|tel:\+?[0-9\s()-]{3,20}|mailto:[^\s@]+@[^\s@]+)$/;

/** Backend aynı kuralı uygular; burada da script/data bağlantıları render edilmez. */
export const isSafeHref = (href: string): boolean => SAFE_HREF.test(href.trim()) && href.length <= LIMITS.href;
export const safeHrefOr = (href: unknown, fallback = '#'): string =>
  typeof href === 'string' && isSafeHref(href) ? href.trim() : fallback;

export const SAFE_IMAGE = /^(\/(?!\/)[^\s]*|https:\/\/[^\s]+)$/;
export const safeImage = (src: unknown): string => (typeof src === 'string' && SAFE_IMAGE.test(src.trim()) ? src.trim() : '');

// ── Yardımcılar ───────────────────────────────────────────────────────────────

export const newSectionId = (type: SectionType): string =>
  `${type.replace(/_/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

export const str = (v: unknown): string => (typeof v === 'string' ? v : '');
export const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Yeni eklenen bölümün boş/başlangıç içeriği (uydurma metin yok; admin kendi yazar). */
export function emptySection(type: SectionType): PageSection {
  const base: PageSection = { id: newSectionId(type), type, background: 'white', spacing: 'normal', props: {} };
  switch (type) {
    case 'page_header':
      return { ...base, props: { title: 'Yeni başlık', buttons: [] } };
    case 'image_text':
      return { ...base, props: { title: '', body: '', image: '', imagePosition: 'right', bullets: [], buttons: [] } };
    case 'feature_list':
      return { ...base, background: 'paper', props: { title: '', text: '', items: [{ title: 'Yeni madde', text: '' }], numbered: false, buttons: [] } };
    case 'cards':
      return { ...base, props: { title: '', items: [{ title: 'Yeni kart', text: '' }] } };
    case 'rich_text':
      return { ...base, props: { title: 'Yeni metin', blocks: [{ type: 'paragraph', text: 'Metninizi buraya yazın.' }] } };
    case 'cta':
      return { ...base, background: 'paper', props: { title: 'Yeni çağrı', text: '', buttons: [] } };
    default:
      return base;
  }
}

/** Bozuk/eksik kayıtları düzeltir: bilinmeyen tipleri atar, zorunlu sistem bölümlerini geri ekler. */
export function normalizePageDoc(key: PageKey, raw: unknown, fallback: PageDoc): PageDoc {
  const info = PAGE_INFO[key];
  const doc = raw as Partial<PageDoc> | null;
  if (!doc || !Array.isArray(doc.sections)) return fallback;
  const seen = new Set<string>();
  const sections = doc.sections.filter((s): s is PageSection => {
    if (!s || typeof s !== 'object' || typeof s.id !== 'string' || seen.has(s.id)) return false;
    if (!info.allowed.includes(s.type)) return false;
    seen.add(s.id);
    return true;
  }).map((s) => ({ ...s, props: s.props && typeof s.props === 'object' ? s.props : {} }));
  for (const req of info.required) {
    if (!sections.some((s) => s.type === req)) {
      const fromFallback = fallback.sections.find((s) => s.type === req);
      if (fromFallback) sections.push(fromFallback);
    }
  }
  return { version: 1, sections };
}

// ── Varsayılan sayfalar (mevcut CMS içeriğinden türetilir) ──────────────────────

interface LegacyHome {
  heroSlides?: HeroSlide[];
  categoriesTitle?: string;
  categoriesSubtitle?: string;
  featuredTitle?: string;
  featuredSubtitle?: string;
}

export function defaultHomePage(legacy?: LegacyHome | null, slides?: HeroSlide[] | null): PageDoc {
  return {
    version: 1,
    sections: [
      { id: 'hero', type: 'hero', props: { slides: slides && slides.length ? slides : legacy?.heroSlides || [] } },
      {
        id: 'categories',
        type: 'categories',
        props: { title: legacy?.categoriesTitle || 'Kategoriler', subtitle: legacy?.categoriesSubtitle || '' },
      },
      {
        id: 'curated-sets',
        type: 'curated_sets',
        background: 'paper',
        props: {
          title: 'Setler',
          subtitle: 'Birlikte alınan ürünler.',
        },
      },
      {
        id: 'products',
        type: 'product_grid',
        props: { title: legacy?.featuredTitle || 'Ürünler', subtitle: legacy?.featuredSubtitle || '', limit: 8 },
      },
      {
        id: 'how-we-work',
        type: 'feature_list',
        background: 'paper',
        props: {
          title: 'Siparişiniz bugün kargoda',
          text: 'Türkiye’nin her yerine gönderiyoruz. Ürünü beğenmezseniz 14 gün içinde iade edebilirsiniz.',
          items: [
            { title: 'Aynı gün kargo', text: 'Hafta içi 15:00’e kadar verilen siparişler aynı gün kargoya verilir.' },
            { title: 'Ücretsiz kargo', text: '1.000 TL ve üzeri siparişlerde kargo bizden.' },
            { title: 'Kolay iade', text: '14 gün içinde, kutusu açılmış olsa bile iade edebilirsiniz.' },
          ],
          numbered: false,
          buttons: [
            { label: 'Tüm ürünler', href: '/kategori', variant: 'primary' },
          ],
        },
      },
    ],
  };
}

/** Eski "Kurumsal sayfa" alanlarını bölümlere çevirir (ilk geçişte içerik kaybolmasın). */
export function defaultCorporatePage(stored?: Partial<CorporateConfig> | null): PageDoc {
  const c = resolveCorporateConfig(stored);
  const sections: PageSection[] = [
    {
      id: 'header',
      type: 'page_header',
      props: { badge: c.heroBadge, title: c.heroTitle, highlight: c.heroHighlight, text: c.heroSubtitle, image: c.heroImage, buttons: [] },
    },
    {
      id: 'story',
      type: 'image_text',
      props: {
        title: c.storyTitle,
        body: c.storyContent || '',
        image: c.storyImage,
        imagePosition: 'left',
        statValue: c.experienceYears,
        statLabel: c.experienceSubtitle,
        bullets: (c.highlights || []).filter(Boolean),
        buttons: [],
      },
    },
  ];
  const cards = (c.cards || []).filter((x) => x.title || x.text);
  if (cards.length) {
    sections.push({ id: 'values', type: 'cards', background: 'canvas', props: { title: '', items: cards } });
  }
  const kvkk = (c.kvkkSections || []).filter((s) => s.heading || s.text);
  if (kvkk.length) {
    const blocks: RichBlock[] = [];
    kvkk.forEach((s) => {
      if (s.heading) blocks.push({ type: 'heading', text: s.heading });
      if (s.text) blocks.push({ type: 'paragraph', text: s.text });
    });
    if (c.kvkkEmail) blocks.push({ type: 'paragraph', text: `Başvurularınızı ${c.kvkkEmail} adresine iletebilirsiniz.` });
    sections.push({ id: 'kvkk', type: 'rich_text', anchor: 'kvkk', label: c.kvkkBadge || '', props: { title: c.kvkkTitle || '', blocks } });
  }
  return { version: 1, sections };
}

export function defaultContactPage(): PageDoc {
  return {
    version: 1,
    sections: [
      {
        id: 'header',
        type: 'page_header',
        background: 'paper',
        spacing: 'compact',
        props: { title: 'İletişim', text: 'Sipariş, iade ya da ürün uyumluluğu hakkında sorularınız için bize yazın.', buttons: [] },
      },
      { id: 'contact', type: 'contact_details', props: { title: '', text: '', formTitle: '' } },
    ],
  };
}

/** Tüm CMS bloklarından ilgili sayfanın düzenini çıkarır (kayıt yoksa eski alanlardan türetir). */
export function resolvePageDoc(key: PageKey, cms: Record<string, unknown> | null | undefined): PageDoc {
  const blocks = cms || {};
  let fallback: PageDoc;
  if (key === 'page_home') {
    fallback = defaultHomePage(blocks.home_config as LegacyHome, blocks.home_hero as HeroSlide[]);
  } else if (key === 'page_corporate') {
    fallback = defaultCorporatePage(blocks.corporate_config as Partial<CorporateConfig>);
  } else {
    fallback = defaultContactPage();
  }
  return normalizePageDoc(key, blocks[key], fallback);
}
