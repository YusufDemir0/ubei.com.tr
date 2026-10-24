import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from '../../../components/ProductDetailClient';
import { getProductByIdCached } from '../../../services/productService';


import { products } from '../../../mock/data';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ id: p.slug || p.id }));
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lookup = await getProductByIdCached(id);
  const product = lookup.status === 'found' ? lookup.product : null;

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | UBEI',
      description: 'Aradığınız ürün bulunamadı veya satıştan kaldırılmış.',
    };
  }

  const categoryName = typeof product.category === 'object' && product.category !== null ? product.category.name : String(product.category);
  const title = `${product.name} - ${categoryName} | UBEI`;
  const description = `${product.name} ${categoryName}. ${product.description || ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://ubei.com.tr/urun/${product.slug || product.id}`,
      siteName: 'UBEI',
      images: [
        {
          url: product.image || '/marka/simge.svg',
          width: 1200,
          height: 800,
          alt: product.name,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
    alternates: {
      canonical: `https://ubei.com.tr/urun/${product.slug || product.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const lookup = await getProductByIdCached(id);

  // Gerçek 404: HTTP 404 dön (soft 404 SEO'ya zarar verir). Geçici API hatasında istemci tekrar dener.
  if (lookup.status === 'not_found') {
    notFound();
  }

  return <ProductDetailClient id={id} initialProduct={lookup.status === 'found' ? lookup.product : undefined} />;
}
