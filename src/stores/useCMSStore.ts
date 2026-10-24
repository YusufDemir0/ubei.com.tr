import { create } from 'zustand';
import type { Product, Category, StoreItem, SocialLinksConfig } from '../types';
import apiClient from '../services/api';
import { isAxiosError } from 'axios';
import { toast } from './useToastStore';
import { DEFAULT_CORPORATE_CONFIG, resolveCorporateConfig, type CorporateConfig } from '../lib/corporateContent';

/**
 * CMS kayıtları iyimser (optimistic) yapılır; sunucu reddederse admin "kaydedildi" sanmasın diye görünür hata gösterilir.
 */
/** Sunucu hata yanıtını kullanıcıya gösterilecek tek cümleye çevirir (zod alan hataları dahil) */
export const describeApiError = (err: unknown, fallback: string): string => {
  if (!isAxiosError(err)) return fallback;
  const data = err.response?.data as { message?: string; errors?: { field: string; message: string }[] } | undefined;
  if (data?.errors?.length) return data.errors.map((e) => e.message).join(' ');
  return data?.message || fallback;
};

/** Sunucu hatasını, alan hatalarını taşıyan bir Error'a çevirir (formlar alanların yanında gösterir). */
export const withFieldErrors = (err: unknown, fallback: string): Error & { fieldErrors?: { field: string; message: string }[] } => {
  const e = new Error(describeApiError(err, fallback)) as Error & { fieldErrors?: { field: string; message: string }[] };
  if (isAxiosError(err)) e.fieldErrors = (err.response?.data as { errors?: { field: string; message: string }[] } | undefined)?.errors;
  return e;
};

const reportCmsSaveError = (label: string) => (err: unknown) => {
  console.warn(`${label} kaydetme hatası:`, err);
  const serverMsg = isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined;
  toast.error('Kaydedilemedi', `${label} sunucuya kaydedilemedi. ${serverMsg || 'Lütfen sayfayı yenileyip tekrar deneyiniz.'}`);
};

export interface CampaignPopupConfig {
  enabled: boolean;
  popupType?: 'coupon' | 'collection' | 'announcement';
  title: string;
  subtitle: string;
  discountCode: string;
  badgeText: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface ContactInfoConfig {
  phone: string;
  /** İkinci hat (iletişim sayfasında gösterilir) */
  phoneSecondary?: string;
  fax: string;
  email: string;
  address: string;
  whatsapp: string;
  showroom: string;
  workingHours?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface HomeConfig {
  heroSlides: HeroSlide[];
  featuredTitle: string;
  featuredSubtitle: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
}

export type { CorporateConfig } from '../lib/corporateContent';

/** Duyuru bandı görünümü (CMS anahtarı: ticker_style) */
export interface TickerStyleConfig {
  backgroundColor: string;
  textColor: string;
  /** Bir tam turun süresi (sn); küçük değer daha hızlı kayar */
  speedSeconds: number;
}

export const DEFAULT_TICKER_STYLE: TickerStyleConfig = {
  backgroundColor: '#FECC00', // logo sarısı
  textColor: '#161514',
  speedSeconds: 35,
};

export interface LandingPageConfig {
  type: 'home' | 'category' | 'catalog';
  targetSlug?: string;
  targetTitle?: string;
}

interface CMSState {
  tickerItems: string[];
  tickerStyle: TickerStyleConfig;
  campaignPopup: CampaignPopupConfig;
  contactInfo: ContactInfoConfig;
  landingPageConfig: LandingPageConfig;
  products: Product[];
  categories: Category[];
  stores: StoreItem[];
  homeConfig: HomeConfig;
  corporateConfig: CorporateConfig;
  isLoading: boolean;
  /** CMS blokları ilk kez yanıtlandı (başarılı ya da hatalı). İskeletler buna göre kalkar. */
  cmsLoaded: boolean;
  /** Ürün ve kategori listesi ilk kez yanıtlandı (başarılı ya da hatalı). */
  catalogLoaded: boolean;

  // Actions
  fetchCmsBlocks: () => Promise<void>;
  /** includeDrafts: yalnızca admin paneli; taslak/yayında olmayan ürünleri de yükler. */
  fetchProductsAndCategories: (options?: { includeDrafts?: boolean }) => Promise<void>;
  updateLandingPageConfig: (config: LandingPageConfig) => Promise<void>;

  setTickerItems: (items: string[]) => void;
  updateTickerStyle: (style: Partial<TickerStyleConfig>) => Promise<void>;
  addTickerItem: (item: string) => void;
  removeTickerItem: (index: number) => void;

  updateCampaignPopup: (config: Partial<CampaignPopupConfig>) => void;
  updateContactInfo: (config: Partial<ContactInfoConfig>) => void;

  // Category CRUD
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message: string }>;
  reorderCategories: (items: { id: string; parentId?: string | null; sortOrder: number }[]) => Promise<{ success: boolean; message: string }>;

  // Product CRUD
  /** Sunucunun yayın durumu mesajını döndürür (ör. "Taslakta: görsel eklenince yayına girer.") */
  addProduct: (product: Product) => Promise<string | undefined>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<string | undefined>;
  deleteProduct: (id: string) => Promise<void>;
  resetProductsToDefault: () => void;

  // Store CRUD
  /** includeInactive: yalnızca admin paneli; pasif mağazaları da yükler (aksi halde pasife alınan mağaza panelden kaybolur). */
  fetchStores: (options?: { includeInactive?: boolean }) => Promise<void>;
  addStore: (store: StoreItem) => Promise<void>;
  updateStore: (id: string, store: Partial<StoreItem>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;

  // Home & Corporate CMS Actions
  updateHomeConfig: (config: Partial<HomeConfig>) => void;
  updateCorporateConfig: (config: Partial<CorporateConfig>) => void;

  // Social Links
  socialLinks: SocialLinksConfig;
  updateSocialLinks: (config: Partial<SocialLinksConfig>) => void;
}

/*
 * Başlangıç değerleri boştur: sitede yalnız Admin'den girilen veri görünür. CMS yanıtı gelene kadar ilgili bölümler
 * gizlenir ya da iskelet gösterir; koda gömülü telefon, adres, duyuru veya kampanya yoktur.
 */
export const EMPTY_SOCIAL_LINKS: SocialLinksConfig = {
  instagram: '',
  youtube: '',
  telegram: '',
  whatsapp: '',
  facebook: '',
  tiktok: '',
};

const EMPTY_POPUP: CampaignPopupConfig = {
  enabled: false,
  popupType: 'announcement',
  title: '',
  subtitle: '',
  discountCode: '',
  badgeText: '',
  image: '',
  buttonText: '',
  buttonLink: '',
};

const EMPTY_CONTACT: ContactInfoConfig = {
  phone: '',
  fax: '',
  email: '',
  address: '',
  whatsapp: '',
  showroom: '',
};

const EMPTY_HOME_CONFIG: HomeConfig = {
  heroSlides: [],
  featuredTitle: '',
  featuredSubtitle: '',
  categoriesTitle: '',
  categoriesSubtitle: '',
};

export const DEFAULT_CATEGORIES: Category[] = [];

// Admin paneli taslaklar dahil tam kataloğu yüklediğinde true olur (bkz. fetchProductsAndCategories)
let adminCatalogMode = false;
// Admin paneli pasif mağazalar dahil tüm listeyi yüklediğinde true olur (bkz. fetchStores)
let adminStoresMode = false;

export const useCMSStore = create<CMSState>()((set, get) => ({
      tickerItems: [],
      tickerStyle: DEFAULT_TICKER_STYLE,
      campaignPopup: EMPTY_POPUP,
      contactInfo: EMPTY_CONTACT,
      // Sunucu tarafı varsayılanıyla aynı (services/landingService.ts): tercih kaydedilmemişse FAZ 15 kararı
      landingPageConfig: { type: 'category', targetSlug: 'aksesuar-ve-diger' } as LandingPageConfig,
      products: [],
      categories: [],
      stores: [], // Yalnız API'den gelen mağazalar
      homeConfig: EMPTY_HOME_CONFIG,
      corporateConfig: DEFAULT_CORPORATE_CONFIG,
      socialLinks: EMPTY_SOCIAL_LINKS,
      isLoading: false,
      cmsLoaded: false,
      catalogLoaded: false,

      fetchCmsBlocks: async () => {
        set({ isLoading: true });
        try {
          const res = await apiClient.get('/cms');
          if (res.data?.success && res.data.cms) {
            const cms = res.data.cms;
            set({
              // Kayıt yoksa boş: duyuru bandı, kampanya ve iletişim alanları gizlenir
              tickerItems: Array.isArray(cms.ticker_items) ? cms.ticker_items : [],
              tickerStyle: cms.ticker_style
                ? { ...DEFAULT_TICKER_STYLE, ...(cms.ticker_style as Partial<TickerStyleConfig>) }
                : get().tickerStyle,
              campaignPopup: cms.campaign_popup ? { ...EMPTY_POPUP, ...cms.campaign_popup } : EMPTY_POPUP,
              contactInfo: { ...EMPTY_CONTACT, ...(cms.contact_info || cms.contact || {}) },
              landingPageConfig: (cms.landing_page_config as LandingPageConfig) || get().landingPageConfig,
              socialLinks: cms.social_links
                ? { ...EMPTY_SOCIAL_LINKS, ...(cms.social_links as SocialLinksConfig) }
                : EMPTY_SOCIAL_LINKS,
              homeConfig: cms.home_config
                ? { ...EMPTY_HOME_CONFIG, ...cms.home_config }
                : cms.home_hero
                ? { ...EMPTY_HOME_CONFIG, heroSlides: Array.isArray(cms.home_hero) ? cms.home_hero : [cms.home_hero] }
                : EMPTY_HOME_CONFIG,
              // Kayıtlı blok eksik alan içerebilir; varsayılanların üzerine birleştirilir
              corporateConfig: resolveCorporateConfig(cms.corporate_config as Partial<CorporateConfig> | undefined),
            });
          }
        } catch (err) {
          console.warn('REST API CMS blokları çekme uyarısı:', err);
        } finally {
          set({ isLoading: false, cmsLoaded: true });
        }
      },

      updateLandingPageConfig: async (config) => {
        set({ landingPageConfig: config });
        try {
          await apiClient.put('/cms/landing_page_config', { content: config });
        } catch (e) {
          console.warn('Açılış sayfası ayarı API kayıt hatası:', e);
        }
      },

      updateSocialLinks: (config) => {
        set((state) => {
          const updated = { ...state.socialLinks, ...config };
          apiClient.put('/cms/social_links', { content: updated }).catch(reportCmsSaveError('Sosyal medya bağlantıları'));
          return { socialLinks: updated };
        });
      },

      fetchProductsAndCategories: async (options) => {
        try {
          const [prodRes, catRes] = await Promise.all([
            apiClient.get('/products', options?.includeDrafts ? { params: { includeUnpublished: 'true', limit: 1000 } } : undefined).catch(() => ({ data: { success: false, products: [] } })),
            apiClient.get('/categories').catch(() => ({ data: { success: false, categories: [] } })),
          ]);

          if (options?.includeDrafts) adminCatalogMode = true;
          // Admin tam kataloğu yüklendiyse, geç dönen vitrin isteği (yalnızca yayındakiler) listeyi ezmesin
          const isStalePublicResult = adminCatalogMode && !options?.includeDrafts;
          if (!isStalePublicResult && prodRes.data?.success && Array.isArray(prodRes.data.products)) {
            set({ products: prodRes.data.products });
          }

          if (catRes.data?.success && Array.isArray(catRes.data.categories)) {
            set({ categories: catRes.data.categories });
          }
        } catch (err) {
          console.warn('REST API ürün/kategori çekme uyarısı:', err);
        } finally {
          set({ catalogLoaded: true });
        }
      },

      updateTickerStyle: async (style) => {
        const updated = { ...get().tickerStyle, ...style };
        set({ tickerStyle: updated });
        await apiClient.put('/cms/ticker_style', { content: updated }).catch(reportCmsSaveError('Duyuru bandı rengi'));
      },

      setTickerItems: (items) => {
        set({ tickerItems: items });
        apiClient.put('/cms/ticker_items', { content: items }).catch(reportCmsSaveError('Duyuru bandı'));
      },

      addTickerItem: (item) => {
        const updated = [...get().tickerItems, item];
        set({ tickerItems: updated });
        apiClient.put('/cms/ticker_items', { content: updated }).catch(reportCmsSaveError('Duyuru bandı'));
      },

      removeTickerItem: (index) => {
        const updated = get().tickerItems.filter((_, i) => i !== index);
        set({ tickerItems: updated });
        apiClient.put('/cms/ticker_items', { content: updated }).catch(reportCmsSaveError('Duyuru bandı'));
      },

      updateCampaignPopup: (config) => {
        const updated = { ...get().campaignPopup, ...config };
        set({ campaignPopup: updated });
        apiClient.put('/cms/campaign_popup', { content: updated }).catch(reportCmsSaveError('Kampanya popup'));
      },

      updateContactInfo: (config) => {
        const updated = { ...get().contactInfo, ...config };
        set({ contactInfo: updated });
        apiClient.put('/cms/contact_info', { content: updated }).catch(reportCmsSaveError('İletişim bilgileri'));
      },

      addCategory: async (category) => {
        set((state) => ({ categories: [category, ...state.categories] }));
        try {
          const res = await apiClient.post('/categories', category);
          if (res.data?.success && res.data.category) {
            get().fetchProductsAndCategories({ includeDrafts: true });
          }
        } catch (e) {
          console.warn('Kategori ekleme hatası:', e);
        }
      },

      updateCategory: async (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c))
        }));
        try {
          await apiClient.put(`/categories/${id}`, category);
        } catch (e) {
          console.warn('Kategori güncelleme hatası:', e);
        }
      },

      deleteCategory: async (id) => {
        try {
          const res = await apiClient.delete(`/categories/${id}`);
          if (res.data?.success) {
            set((state) => ({
              categories: state.categories.filter((c) => c.id !== id)
            }));
            await get().fetchProductsAndCategories({ includeDrafts: true });
            return { success: true, message: res.data.message || 'Kategori silindi.' };
          }
          return { success: false, message: res.data?.message || 'Kategori silinemedi.' };
        } catch (e: unknown) {
          const msg = e && typeof e === 'object' && 'response' in e
            ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Kategori silinemedi.')
            : (e instanceof Error ? e.message : 'Kategori silinirken bir hata oluştu.');
          console.warn('Kategori silme hatası:', msg);
          return { success: false, message: msg };
        }
      },

      reorderCategories: async (items) => {
        try {
          const res = await apiClient.put('/categories/reorder', { items });
          if (res.data?.success && Array.isArray(res.data.categories)) {
            set({ categories: res.data.categories });
            return { success: true, message: res.data.message || 'Sıralama güncellendi.' };
          }
          return { success: false, message: res.data?.message || 'Sıralama kaydedilemedi.' };
        } catch (e: unknown) {
          const msg = e && typeof e === 'object' && 'response' in e
            ? ((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Sıralama güncellenemedi.')
            : (e instanceof Error ? e.message : 'Sıralama kaydedilemedi.');
          return { success: false, message: msg };
        }
      },

      addProduct: async (product) => {
        try {
          const res = await apiClient.post('/products', product);
          await get().fetchProductsAndCategories({ includeDrafts: true });
          return res.data?.message as string | undefined;
        } catch (e: unknown) {
          throw withFieldErrors(e, 'Ürün eklenemedi.');
        }
      },

      updateProduct: async (id, product) => {
        try {
          const res = await apiClient.put(`/products/${id}`, product);
          await get().fetchProductsAndCategories({ includeDrafts: true });
          return res.data?.message as string | undefined;
        } catch (e) {
          throw withFieldErrors(e, 'Ürün güncellenemedi.');
        }
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        }));
        try {
          await apiClient.delete(`/products/${id}`);
        } catch (e) {
          console.warn('Ürün silme hatası:', e);
        }
      },

      resetProductsToDefault: () => {},

      fetchStores: async (options) => {
        try {
          const res = await apiClient.get('/stores', options?.includeInactive ? { params: { all: 'true' } } : undefined);
          if (options?.includeInactive) adminStoresMode = true;
          // Admin tüm mağazaları yüklediyse, geç dönen vitrin isteği (yalnızca aktifler) listeyi ezmesin
          const isStalePublicResult = adminStoresMode && !options?.includeInactive;
          if (!isStalePublicResult && res.data?.success && Array.isArray(res.data.stores)) {
            set({ stores: res.data.stores });
          }
        } catch (e) {
          console.warn('Mağazalar API üzerinden yüklenemedi:', e);
        }
      },

      // Mağaza kaydı sunucu onayından sonra listeye yansır; hata sessizce yutulmaz, sunucu mesajıyla fırlatılır
      addStore: async (store) => {
        try {
          await apiClient.post('/stores', store);
          await get().fetchStores({ includeInactive: true });
        } catch (e) {
          throw new Error(describeApiError(e, 'Mağaza eklenemedi.'));
        }
      },

      updateStore: async (id, updatedFields) => {
        try {
          await apiClient.put(`/stores/${id}`, updatedFields);
          await get().fetchStores({ includeInactive: true });
        } catch (e) {
          throw new Error(describeApiError(e, 'Mağaza güncellenemedi.'));
        }
      },

      deleteStore: async (id) => {
        set((state) => ({
          stores: state.stores.filter((s) => s.id !== id)
        }));
        try {
          const res = await apiClient.delete(`/stores/${id}`);
          // Geçmiş talebi olan mağaza silinmez, pasife alınır: admin'e bunu söyle ve gerçek listeyi geri yükle
          if (typeof res.data?.message === 'string' && res.data.message.includes('pasife')) {
            toast.info('Mağaza Pasife Alındı', res.data.message);
          }
          await get().fetchStores({ includeInactive: true });
        } catch (e) {
          reportCmsSaveError('Mağaza silme')(e);
          await get().fetchStores({ includeInactive: true });
        }
      },

      updateHomeConfig: (config) => {
        const updated = { ...get().homeConfig, ...config };
        set({ homeConfig: updated });
        apiClient.put('/cms/home_hero', { content: updated.heroSlides || [] }).catch(reportCmsSaveError('Ana sayfa slaytları'));
        apiClient.put('/cms/home_config', { content: updated }).catch(reportCmsSaveError('Ana sayfa ayarları'));
      },

      updateCorporateConfig: (config) => {
        const updated = { ...get().corporateConfig, ...config };
        set({ corporateConfig: updated });
        apiClient.put('/cms/corporate_config', { content: updated }).catch(reportCmsSaveError('Kurumsal sayfa'));
      }
    })
);
