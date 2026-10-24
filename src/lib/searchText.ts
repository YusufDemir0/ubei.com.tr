/**
 * Aramada karşılaştırma biçimi: Türkçe küçük harfe çevirir ve Türkçe harfleri sadeleştirir.
 * "TOPLANTI", "toplantı" ve Türkçe klavyesiz yazılan "toplanti" aynı ürünü bulur.
 */
const FOLD: Record<string, string> = { ı: 'i', ş: 's', ç: 'c', ğ: 'g', ö: 'o', ü: 'u', â: 'a', î: 'i', û: 'u' };

export const searchFold = (value: unknown): string =>
  typeof value === 'string' ? value.toLocaleLowerCase('tr-TR').replace(/[ışçğöüâîû]/g, (ch) => FOLD[ch]) : '';
