/**
 * Turkish Character Aware URL Slug Generator
 * Converts Turkish characters (ğ, ü, ş, ı, ö, ç, İ, Ğ, Ü, Ş, Ö, Ç)
 * cleanly into standard URL-safe slugs without dropping letters.
 */
export function slugifyTurkish(text: string): string {
  if (!text) return '';

  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  const normalized = text
    .split('')
    .map((char) => trMap[char] || char)
    .join('');

  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Normalizes Turkish text for comparison, handling the dotless/dotted I/İ pitfall safely.
 */
export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .trim();
}
