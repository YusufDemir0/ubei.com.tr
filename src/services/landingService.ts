import apiClient from './api';

export interface LandingConfig {
  type: 'home' | 'category' | 'catalog';
  targetSlug?: string;
}

/** FAZ 15 kararı: tercih kaydedilmemişse kök URL bu kategoriyi gösterir. */
export const DEFAULT_LANDING_CATEGORY = 'aksesuar-ve-diger';

/** Admin "Açılış Sayfası Tercihi" (CMS: landing_page_config). Kayıt yoksa FAZ 15 varsayılanı döner. */
export async function getLandingPageConfig(): Promise<LandingConfig> {
  try {
    const res = await apiClient.get('/cms/landing_page_config');
    const content = res.data?.content as Partial<LandingConfig> | undefined;
    if (content && (content.type === 'home' || content.type === 'category' || content.type === 'catalog')) {
      return { type: content.type, targetSlug: content.targetSlug || undefined };
    }
  } catch {
    // 404 (henüz kaydedilmemiş) veya API hatası: varsayılana düş
  }
  return { type: 'category', targetSlug: DEFAULT_LANDING_CATEGORY };
}
