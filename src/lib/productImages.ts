import type { Product, ProductImages } from '../types';

/**
 * Resolve image URLs for display.
 * /uploads/... paths are left as relative paths — Next.js rewrites in next.config.ts
 * proxy them to the backend automatically.
 * Full URLs (https://...) are returned as-is.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) return '';
  // Legacy rows may hold the backend's absolute dev origin; /uploads/* is proxied by Next.js rewrites.
  return url.trim().replace(/^https?:\/\/(localhost|127\.0\.0\.1|api_backend)(:\d+)?(?=\/uploads\/)/i, '');
}

/**
 * Standard Product Image Resolver with robust fallbacks
 */
export function getProductImage(
  product?: Product | { image?: string; images?: string[] | ProductImages; image1?: string } | null
): string {
  if (!product) {
    return '';
  }
  if (product.image && typeof product.image === 'string' && product.image.trim().length > 0) {
    return resolveImageUrl(product.image);
  }
  if ('image1' in product && typeof product.image1 === 'string' && product.image1.trim().length > 0) {
    return resolveImageUrl(product.image1);
  }
  if (product.images) {
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') {
      return resolveImageUrl(product.images[0]);
    }
    if (typeof product.images === 'object' && 'main' in product.images && typeof product.images.main === 'string') {
      return resolveImageUrl(product.images.main);
    }
  }
  return '';
}

/**
 * Multiple Product Images Resolver (Returns clean string array)
 */
export function getProductImages(
  product?: Product | { image?: string; images?: string[] | ProductImages; image1?: string; image2?: string; image3?: string } | null
): string[] {
  if (!product) {
    return [];
  }

  const list: string[] = [];

  const add = (url?: string) => {
    if (url && typeof url === 'string' && url.trim().length > 0) {
      const resolved = resolveImageUrl(url);
      if (!list.includes(resolved)) {
        list.push(resolved);
      }
    }
  };

  add(product.image);
  if ('image1' in product) add(product.image1);
  if ('image2' in product) add(product.image2);
  if ('image3' in product) add(product.image3);

  if (product.images) {
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (typeof img === 'string') add(img);
      });
    } else if (typeof product.images === 'object') {
      if ('main' in product.images && typeof product.images.main === 'string') add(product.images.main);
      if ('gallery' in product.images && Array.isArray(product.images.gallery)) {
        product.images.gallery.forEach((img) => {
          if (typeof img === 'string') add(img);
        });
      }
    }
  }

  return list;
}

export default getProductImage;


/** Seed verisindeki yer tutucu görsel: gerçek fotoğraf değildir, mağaza ve kategorilerde "görsel yok" sayılır. */
export const PLACEHOLDER_IMAGE = '/marka/simge.svg';
export const isPlaceholderImage = (src?: string | null): boolean => !!src && src.includes('default-furniture');
/** Gerçek görsel varsa adresi, yoksa '' */
export const realImage = (src?: string | null): string => (src && !isPlaceholderImage(src) ? src : '');
