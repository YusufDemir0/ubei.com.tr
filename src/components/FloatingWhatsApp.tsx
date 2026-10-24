'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useWhatsappNumber } from '../lib/whatsapp';

// Talep formu ve fiş sayfasında gizlenir: form ortasında kayıtsız kanala çağırmasın, fişte zaten kendi WhatsApp adımı var.
const HIDDEN_PREFIXES = ['/talep', '/admin'];

export const FloatingWhatsApp: React.FC = () => {
  // Önceden CMS boşsa sahte "0532 000 00 00" numarasına düşüyordu
  const formattedNumber = useWhatsappNumber();
  const pathname = usePathname() || '';

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  const message = encodeURIComponent(
    'Merhaba UBEI, web sitenizdeki ürünler hakkında bilgi almak istiyorum.'
  );

  return (
    <a
      hidden={!formattedNumber} href={`https://wa.me/${formattedNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 z-40 h-12 w-12 ${pathname.startsWith('/urun/') ? 'bottom-20 lg:bottom-4' : 'bottom-4'} rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white flex items-center justify-center shadow-xl transition-colors print:hidden`}
      aria-label="WhatsApp ile yazın"
      title="WhatsApp ile yazın"
    >
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>
    </a>
  );
};

export default FloatingWhatsApp;
