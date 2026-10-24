'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { usePathname } from 'next/navigation';
import { useCMSStore } from '../stores/useCMSStore';
import { useWhatsappNumber } from '../lib/whatsapp';

/** "905324194151" -> "+90 532 419 41 51" (tanınmayan biçimler olduğu gibi döner) */
function formatTrPhone(digits: string): string {
  const m = digits.match(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : digits;
}

export const Footer: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const currentYear = new Date().getFullYear();
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const socialLinks = useCMSStore((state) => state.socialLinks);
  const categories = useCMSStore((state) => state.categories);

  const pathname = usePathname() || '';
  if (pathname.startsWith('/admin')) return null;

  const assurances = [
    { title: 'Aynı gün kargo', text: 'Hafta içi 15:00’e kadar verilen siparişler aynı gün kargoya verilir.' },
    { title: 'Ücretsiz kargo', text: '1.000 TL ve üzeri siparişlerde kargo ücreti alınmaz.' },
    { title: '14 gün iade', text: 'Kutusu açılmış olsa bile 14 gün içinde iade edebilirsiniz.' },
    { title: '2 yıl garanti', text: 'Şarj cihazı, powerbank ve kulaklıklar 2 yıl garantilidir.' },
  ];

  return (
    <footer id="main-footer" className="bg-ink text-neutral-300 text-sm mt-auto print:hidden">
      {/* Güvenceler */}
      <div className="border-b border-neutral-800">
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assurances.map((item, idx) => (
            <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-2">
              <span className="font-mono text-xs text-wood-light pt-0.5 tabular-nums-all">{String(idx + 1).padStart(2, '0')}</span>
              <div>
                <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                <p className="text-neutral-400 text-xs mt-1 leading-relaxed">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Bağlantılar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <BrandLogo variant="onDark" className="h-12 w-auto" />
            <p className="text-wood-light text-xs">Telefon ve akıllı saat aksesuarları</p>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
            Kılıftan şarj cihazına, telefonunuz için gereken aksesuarları Türkiye’nin her yerine gönderiyoruz.
          </p>
          <dl className="space-y-1.5 text-xs text-neutral-300">
            {contactInfo?.address && (
              <div><dt className="inline text-neutral-400">Adres: </dt><dd className="inline">{contactInfo.address}</dd></div>
            )}
            {waNumber && <div>
              <dt className="inline text-neutral-400">WhatsApp: </dt>
              <dd className="inline">
                <a hidden={!waNumber} href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-2 hover:underline font-mono">
                  {formatTrPhone(waNumber)}
                </a>
              </dd>
            </div>}
            {contactInfo?.email && (
              <div><dt className="inline text-neutral-400">E-posta: </dt><dd className="inline"><a href={`mailto:${contactInfo.email}`} className="hover:text-white">{contactInfo.email}</a></dd></div>
            )}
          </dl>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Kategoriler</h4>
          <ul className="space-y-2.5 text-sm text-neutral-300">
            {categories && categories.length > 0 ? (
              categories.filter((cat) => !cat.parentId).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/kategori/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : null}
            <li><Link href="/indirimler" className="text-wood-light hover:text-white transition-colors">İndirimli ürünler →</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Kurumsal</h4>
          <ul className="space-y-2.5 text-sm text-neutral-300">
            <li><Link href="/kurumsal" className="hover:text-white transition-colors">Hakkımızda</Link></li>
            <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
            <li><Link href="/kurumsal#kvkk" className="hover:text-white transition-colors">KVKK aydınlatma metni</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white text-sm font-semibold">Yardım</h4>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Siparişiniz, iade ya da telefonunuza uyan ürün hakkında sorunuz varsa WhatsApp’tan yazabilirsiniz.
          </p>
          <a
            hidden={!waNumber} href={`https://wa.me/${waNumber}?text=Merhaba%2C%20UBEI%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xs transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp’tan yazın</span>
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>© {currentYear} UBEI</div>
          <div>
            Bu site <a href="https://yusufdemir.com.tr/projeler/#ubei" className="underline underline-offset-2 hover:text-white">Yusuf Demir</a>’in hazırladığı örnek bir mağazadır; ürünler ve fiyatlar örnektir, siparişler işleme alınmaz.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
