import apiClient from './api';
import type { PageConfig } from '../types/cms';
import type { StoreItem } from '../types';

export const cmsService = {
  /** Tüm CMS blokları tek istekte (sayfa düzenleri bunlardan çözülür). Hata olursa boş nesne. */
  async getAllBlocks(): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.get('/cms');
      if (response.data?.success && response.data.cms && typeof response.data.cms === 'object') {
        return response.data.cms as Record<string, unknown>;
      }
    } catch {
      // Sayfa varsayılan düzenle çizilir
    }
    return {};
  },

  async getPageConfig(slug: string): Promise<PageConfig | null> {
    try {
      const response = await apiClient.get<PageConfig>(`/cms/pages/${slug}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getCorporateConfig(): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiClient.get('/cms');
      if (response.data?.success && response.data.cms?.corporate_config) {
        return response.data.cms.corporate_config;
      }
    } catch {
      // Fallback to default
    }
    return null;
  },

  async getStores(): Promise<StoreItem[]> {
    try {
      const response = await apiClient.get('/stores');
      if (response.data?.success && Array.isArray(response.data.stores) && response.data.stores.length > 0) {
        return response.data.stores;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async getContactConfig(): Promise<{ phone?: string; whatsapp?: string; email?: string; address?: string }> {
    try {
      const response = await apiClient.get('/cms/contact');
      const data = response.data?.content || response.data;
      if (data && typeof data === 'object') {
        return data as { phone?: string; whatsapp?: string; email?: string; address?: string };
      }
    } catch {
      // Fallback
    }
    // Kayıt yoksa boş döner; sayfalar ilgili bağlantıyı gizler (koda gömülü iletişim bilgisi yok)
    return {};
  },
};


