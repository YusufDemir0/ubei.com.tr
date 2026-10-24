/**
 * Türkiye telefon numaraları uluslararası E.164 biçiminde tutulur: "+905324194151".
 * Arayüz ulusal 10 haneyi alır ("532 419 41 51"), ülke kodu sabit "+90" olarak gösterilir.
 * Backend aynı kuralı uygular (backend/src/validations/common.ts > trPhone).
 */

/** Herhangi bir girişten ulusal 10 haneyi çıkarır: "+90 532…", "0532…", "90532…", "532…" */
export function nationalDigits(raw?: string | null): string {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('90') && d.length > 10) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}

/**
 * Bileşen değerinden ulusal haneleri okur. Değer "+90" önekliyse önek kesin olarak ayrılır; böylece kısmi girişte
 * ("+90532") ülke kodu ulusal numaraya karışmaz. Eski biçimli kayıtlar ("0532 …") nationalDigits ile okunur.
 */
export function digitsFromValue(value?: string | null): string {
  const v = String(value || '').trim();
  if (v.startsWith('+90')) return v.slice(3).replace(/\D/g, '').slice(0, 10);
  return nationalDigits(v);
}

/** Ulusal 10 haneden E.164; eksikse '' */
export function toE164(raw?: string | null): string {
  const d = digitsFromValue(raw);
  return d.length === 10 ? `+90${d}` : '';
}

/** Geçerli Türkiye numarası mı? mobile: yalnız 5 ile başlayan cep numaraları */
export function isValidTrPhone(raw: string | null | undefined, opts: { mobile?: boolean } = {}): boolean {
  const d = digitsFromValue(raw);
  if (d.length !== 10) return false;
  if (opts.mobile) return d.startsWith('5');
  // 2xx-4xx sabit hat, 5xx cep, 850 kurumsal hat
  return /^[2-5]/.test(d) || d.startsWith('850');
}

/** "5324194151" -> "532 419 41 51" (yazarken kısmi biçimleme) */
export function formatNational(d: string): string {
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean);
  return p.join(' ');
}

/** Görüntüleme: "+90 532 419 41 51"; tanınmayan değer olduğu gibi döner */
export function formatTrPhone(raw?: string | null): string {
  const d = nationalDigits(raw);
  return d.length === 10 ? `+90 ${formatNational(d)}` : String(raw || '');
}

/** wa.me için "905324194151"; geçersizse '' */
export function toWhatsappDigits(raw?: string | null): string {
  const e = toE164(raw);
  return e ? e.slice(1) : '';
}
