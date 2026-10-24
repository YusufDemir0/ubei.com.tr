import { isAxiosError } from 'axios';

/** Sunucunun Türkçe hata mesajı; yoksa verilen yedek metin */
export function apiMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const m = (err.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(m) && m.length) return m.join(' ');
    if (typeof m === 'string' && m) return m;
  }
  return fallback;
}
