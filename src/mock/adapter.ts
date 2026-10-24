/**
 * Backend yerine çalışan axios adaptörü. İstekler ağa çıkmaz; mock/data.ts'ten yanıtlanır.
 * Yanıt biçimleri asıl projenin backend'iyle aynıdır, böylece bileşenler değişmeden çalışır.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { categories, cms, products } from './data';

const searchText = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '');

function ok(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: 'OK', headers: {}, config };
}

function fail(config: InternalAxiosRequestConfig, status: number, message: string): never {
  const response = ok(config, { success: false, message }, status);
  throw new AxiosError(message, String(status), config, null, response);
}

function listProducts(params: Record<string, unknown>) {
  let list = [...products];
  const category = String(params.category || '');
  if (category && category !== 'all' && category !== 'hepsi') {
    list = list.filter((p) => typeof p.category === 'object' && (p.category.slug === category || p.category.id === category));
  }
  if (params.search) {
    const q = searchText(String(params.search));
    list = list.filter((p) => searchText(`${p.name} ${p.description} ${p.dimensions}`).includes(q));
  }
  if (params.minPrice) list = list.filter((p) => p.price >= Number(params.minPrice));
  if (params.maxPrice) list = list.filter((p) => p.price <= Number(params.maxPrice));
  if (params.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
  if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
  if (params.sort === 'popular') list.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  const limit = Math.min(1000, Number(params.limit) || 24);
  const page = Math.max(1, Number(params.page) || 1);
  return {
    success: true,
    products: list.slice((page - 1) * limit, page * limit),
    total: list.length,
    page,
    totalPages: Math.max(1, Math.ceil(list.length / limit)),
  };
}

let requestSeq = 1040;

export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/v1/, '').split('?')[0];
  const params = (config.params || {}) as Record<string, unknown>;
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};

  if (method === 'get') {
    if (url === '/products') return ok(config, listProducts(params));
    let m = url.match(/^\/products\/(.+)$/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      const product = products.find((p) => p.id === id || p.slug === id);
      return product ? ok(config, { success: true, product }) : fail(config, 404, 'Ürün bulunamadı.');
    }
    if (url === '/categories') return ok(config, { success: true, categories });
    m = url.match(/^\/categories\/(.+)$/);
    if (m) {
      const category = categories.find((c) => c.slug === decodeURIComponent(m![1]));
      return category ? ok(config, { success: true, category }) : fail(config, 404, 'Kategori bulunamadı.');
    }
    if (url === '/cms') return ok(config, { success: true, cms });
    m = url.match(/^\/cms\/(?:pages\/)?(.+)$/);
    if (m) {
      const key = m[1] === 'contact' ? 'contact_info' : m[1];
      return key in cms ? ok(config, { success: true, content: cms[key] }) : fail(config, 404, 'Kayıt yok.');
    }
    if (url === '/stores') return ok(config, { success: true, stores: [] });
    if (url === '/geo/delivery-zones') return ok(config, { success: true, zones: [], allProvinces: true });
    return fail(config, 404, 'Bulunamadı.');
  }

  if (method === 'post') {
    if (url === '/cart/quote') {
      const items = (body.items || []).map((it: { productId: string; colorKey?: string | null; quantity: number }) => {
        const p = products.find((x) => x.id === it.productId || x.slug === it.productId);
        const unitPrice = p?.price || 0;
        return {
          productId: it.productId, name: p?.name || '', slug: p?.slug || '', image: p?.image || '',
          colorKey: it.colorKey ?? null, unitPrice, quantity: it.quantity, lineTotal: unitPrice * it.quantity,
          inStock: (p?.stock || 0) > 0, leadTimeDays: 0,
        };
      });
      const subtotal = items.reduce((t: number, i: { lineTotal: number }) => t + i.lineTotal, 0);
      return ok(config, {
        success: true,
        quote: { items, subtotal, itemCount: items.length, totalUnits: items.reduce((t: number, i: { quantity: number }) => t + i.quantity, 0), quotedAt: new Date().toISOString() },
      });
    }
    if (url === '/requests') {
      requestSeq += 1;
      return ok(config, {
        success: true, code: `UBEI-${requestSeq}`, publicToken: `demo-${requestSeq}`, status: 'NEW',
        message: 'Bu bir örnek mağazadır; talebiniz kaydedilmedi.',
      }, 201);
    }
    if (url === '/contact') return ok(config, { success: true, message: 'Bu bir örnek mağazadır; mesajınız gönderilmedi.' });
  }

  return fail(config, 405, 'Bu örnek mağazada bu işlem yapılamaz.');
};
