import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Siparişi tamamla | UBEI',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function TalepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
