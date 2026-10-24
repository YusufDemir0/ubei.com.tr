/**
 * schema.org verisi Admin > İletişim bilgileri'nden üretilir. Kayıtta olmayan alan (posta kodu, koordinat,
 * çalışma saati ayrıntısı) uydurulmaz; boş alanlar çıktıya hiç yazılmaz.
 */

export interface CmsContactLike {
  phone?: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  workingHours?: string;
}

/** "0532 419 41 51" / "905324194151" / "+90 532..." -> "+905324194151"; tanınmazsa '' */
export function toE164(phone?: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('90')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return '';
}

export function storeLd(contact: CmsContactLike) {
  const telephone = toE164(contact.phone);
  return {
    '@type': 'Store',
    name: 'UBEI',
    url: 'https://ubei.com.tr',
    logo: 'https://ubei.com.tr/marka/logo-koyu.svg',
    ...(telephone ? { telephone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.address ? { address: { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'TR' } } : {}),
  };
}
