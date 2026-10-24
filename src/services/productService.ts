import { cache } from 'react';
import type { Product, Category } from '../types';
import apiClient from './api';
import { isAxiosError } from 'axios';

export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  async getProducts(paramsOrCategory?: ProductQueryParams | string, search?: string): Promise<Product[]> {
    try {
      const params = typeof paramsOrCategory === 'object' && paramsOrCategory !== null
        ? paramsOrCategory
        : { category: paramsOrCategory, search };

      const response = await apiClient.get('/products', { params });

      if (response.data?.success && Array.isArray(response.data.products)) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.warn('REST API Ürün Yükleme Uyarısı (Sunucuya ulaşılamadı):', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response.data?.success && response.data.product) {
        return response.data.product;
      }
      return null;
    } catch (error) {
      console.warn('REST API Ürün Detay Uyarısı (Sunucuya ulaşılamadı):', error);
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/categories');
      if (response.data?.success && Array.isArray(response.data.categories)) {
        return response.data.categories;
      }
      return [];
    } catch (error) {
      console.warn('REST API Kategori Uyarısı (Sunucuya ulaşılamadı):', error);
      return [];
    }
  },

  async getSaleProducts(): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      return products.filter((p) => p.originalPrice && p.originalPrice > p.price);
    } catch (e) {
      return [];
    }
  },
};

export type ProductLookup =
  | { status: 'found'; product: Product }
  | { status: 'not_found' }
  | { status: 'error' };

/**
 * Server-Side deduplicated product fetcher using React's cache().
 * Prevents redundant HTTP requests between generateMetadata and Page component in Next.js App Router.
 * Distinguishes a real 404 (render notFound) from a transient API error (let the client retry).
 */
export const getProductByIdCached = cache(async (id: string): Promise<ProductLookup> => {
  try {
    const response = await apiClient.get(`/products/${encodeURIComponent(id)}`);
    if (response.data?.success && response.data.product) {
      return { status: 'found', product: response.data.product };
    }
    return { status: 'not_found' };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return { status: 'not_found' };
    }
    console.warn('REST API Ürün Detay Uyarısı (Sunucuya ulaşılamadı):', error);
    return { status: 'error' };
  }
});
