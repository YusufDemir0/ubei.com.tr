'use client';

import { useCMSStore } from '../stores/useCMSStore';

/**
 * Her türlü girişi ("+90 532 419 41 51", "0532 419 41 51", "5324194151") wa.me'nin istediği
 * uluslararası rakam biçimine ("905324194151") çevirir. Geçersiz ya da boşsa '' döner; çağıran buton gizlenir
 * (koda gömülü yedek numara yoktur, sitedeki her numara Admin > İletişim bilgileri'nden gelir).
 */
export function normalizeWhatsappNumber(raw?: string | null): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('90') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return '';
}

/**
 * Sitedeki TÜM WhatsApp butonlarının tek kaynağı. Öncelik: Admin > İletişim Bilgileri > "Resmi WhatsApp" alanı,
 * sonra sosyal medya ayarı. İkisi de boşsa ''.
 */
export function useWhatsappNumber(): string {
  const contactWhatsapp = useCMSStore((s) => s.contactInfo?.whatsapp);
  const socialWhatsapp = useCMSStore((s) => s.socialLinks?.whatsapp);
  return normalizeWhatsappNumber(contactWhatsapp || socialWhatsapp);
}

export function buildWhatsappUrl(number: string, message?: string): string {
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
