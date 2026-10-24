import { isAxiosError } from 'axios';
import apiClient from '../services/api';

/**
 * Normalizes an uploaded media URL to a host-relative path ("/uploads/x.webp").
 * Absolute URLs pointing at the backend (e.g. http://localhost:5000/uploads/...) must never be persisted:
 * they break as soon as the site runs under its real domain or inside Docker.
 */
export function toRelativeUploadUrl(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/i);
  return match ? match[1] : trimmed;
}

/**
 * Enterprise Secure File Upload (Magic bytes & Binary Image validation)
 * Throws on failure so callers can surface the error instead of silently saving a base64 preview.
 */
export async function uploadProductImage(file: File, isPrivate: boolean = false): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  if (isPrivate) {
    formData.append('isPrivate', 'true');
  }

  try {
    const res = await apiClient.post(`/upload${isPrivate ? '?isPrivate=1' : ''}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data?.success && typeof res.data?.url === 'string') {
      return toRelativeUploadUrl(res.data.url);
    }
    throw new Error(res.data?.message || 'Görsel yüklenemedi.');
  } catch (err) {
    const serverMsg = isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined;
    throw new Error(serverMsg || (err instanceof Error ? err.message : 'Görsel yüklenemedi.'));
  }
}
