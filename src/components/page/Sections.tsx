'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Mail, MapPin, Phone } from 'lucide-react';
import Hero from '../Hero';
import CategoryList from '../CategoryList';
import CuratedSets from '../CuratedSets';
import ProductGridClient from '../../app/ProductGridClient';
import ContactFormClient from '../../app/iletisim/ContactFormClient';
import type { HeroSlide } from '../../stores/useCMSStore';
import type { Product } from '../../types';
import {
  arr,
  safeHrefOr,
  safeImage,
  str,
  type PageButton,
  type PageItem,
  type PageSection,
  type RichBlock,
} from '../../lib/pageLayout';
import { formatTrPhone, toE164 } from '../../lib/phone';

export interface ContactData {
  phones: string[];
  email: string;
  address: string;
  workingHours: string;
}

/** Sayfa verisi (sunucuda bir kez çekilir, bölümlere dağıtılır) */
export interface PageData {
  products?: Product[];
  contact?: ContactData;
}

/** Koyu zeminde metin renkleri ters çevrilir */
const tone = (dark: boolean) => ({
  heading: dark ? 'text-white' : 'text-ink',
  body: dark ? 'text-neutral-300' : 'text-neutral-600',
  strong: dark ? 'text-white' : 'text-ink',
  rule: dark ? 'border-white/15' : 'border-line',
  accent: dark ? 'text-brand' : 'text-wood',
});

const Container: React.FC<{ children: React.ReactNode; narrow?: boolean; className?: string }> = ({ children, narrow, className = '' }) => (
  <div className={`${narrow ? 'max-w-3xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const Buttons: React.FC<{ buttons: PageButton[]; dark: boolean }> = ({ buttons, dark }) => {
  const list = buttons.filter((b) => b && str(b.label));
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {list.map((b, i) => {
        const href = safeHrefOr(b.href, '/');
        const primary = b.variant !== 'secondary';
        const cls = primary
          ? 'bg-brand hover:bg-brand-dark text-ink'
          : dark
            ? 'border border-white text-white hover:bg-white hover:text-ink'
            : 'border border-ink text-ink hover:bg-ink hover:text-white';
        const external = href.startsWith('https://');
        return (
          <Link
            key={i}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`${cls} text-sm font-semibold py-3 px-5 rounded-xs transition-colors`}
          >
            {b.label}
          </Link>
        );
      })}
    </div>
  );
};

/** Her satır ayrı paragraftır; e-posta adresleri bağlantıya dönüşür */
const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const Linkified: React.FC<{ text: string; dark: boolean }> = ({ text, dark }) => (
  <>
    {text.split(EMAIL_RE).map((part, i) =>
      i % 2 === 1 ? (
        <a key={i} href={`mailto:${part}`} className={`${dark ? 'text-brand' : 'text-wood'} underline underline-offset-2`}>
          {part}
        </a>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    )}
  </>
);

const Paragraphs: React.FC<{ text: string; className: string; dark: boolean }> = ({ text, className, dark }) => (
  <>
    {text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, i) => (
        <p key={i} className={className}>
          <Linkified text={p} dark={dark} />
        </p>
      ))}
  </>
);

// ── Serbest bölümler ──────────────────────────────────────────────────────────

const PageHeader: React.FC<{ s: PageSection; dark: boolean; isFirst: boolean }> = ({ s, dark, isFirst }) => {
  const t = tone(dark);
  const image = safeImage(s.props.image);
  const Heading = isFirst ? 'h1' : 'h2';
  return (
    <Container>
      <div className={`grid grid-cols-1 gap-8 items-center ${image ? 'lg:grid-cols-12' : ''}`}>
        <div className={`space-y-4 ${image ? 'lg:col-span-7' : 'max-w-3xl'}`}>
          {str(s.props.badge) && (
            <span className={`inline-block text-sm px-3 py-1 rounded-xs border ${dark ? 'border-white/20 text-brand' : 'bg-paper text-wood-dark border-line'}`}>
              {str(s.props.badge)}
            </span>
          )}
          <Heading className={`text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight ${t.heading}`}>
            {str(s.props.title)} {str(s.props.highlight) && <span className={t.accent}>{str(s.props.highlight)}</span>}
          </Heading>
          {str(s.props.text) && <Paragraphs text={str(s.props.text)} className={`text-base leading-relaxed ${t.body}`} dark={dark} />}
          <Buttons buttons={arr<PageButton>(s.props.buttons)} dark={dark} />
        </div>
        {image && (
          <div className="lg:col-span-5 aspect-[4/3] bg-paper rounded-xs overflow-hidden border border-line">
            <img src={image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </Container>
  );
};

const ImageText: React.FC<{ s: PageSection; dark: boolean }> = ({ s, dark }) => {
  const t = tone(dark);
  const image = safeImage(s.props.image);
  const imageLeft = s.props.imagePosition === 'left';
  const bullets = arr<string>(s.props.bullets).filter(Boolean);
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {image && (
          <div className={`lg:col-span-5 relative ${imageLeft ? '' : 'lg:order-2'}`}>
            <div className="aspect-[4/3] rounded-xs overflow-hidden border border-line bg-paper">
              <img src={image} alt={str(s.props.title)} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            {str(s.props.statValue) && (
              <div className="absolute -bottom-6 right-4 sm:-right-6 flex flex-col bg-brand text-ink p-5 rounded-xs shadow-xl max-w-xs">
                <span className="text-3xl font-display font-extrabold">{str(s.props.statValue)}</span>
                {str(s.props.statLabel) && <span className="text-sm font-medium mt-1">{str(s.props.statLabel)}</span>}
              </div>
            )}
          </div>
        )}
        <div className={`${image ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl'} space-y-5`}>
          {str(s.props.title) && (
            <h2 className={`text-2xl md:text-3xl font-display font-bold tracking-tight border-l-4 border-brand pl-4 ${t.heading}`}>{str(s.props.title)}</h2>
          )}
          <Paragraphs text={str(s.props.body)} className={`text-base leading-relaxed ${t.body}`} dark={dark} />
          {bullets.length > 0 && (
            <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t ${t.rule}`}>
              {bullets.map((b, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm font-medium ${t.strong}`}>
                  <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${t.accent}`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          <Buttons buttons={arr<PageButton>(s.props.buttons)} dark={dark} />
        </div>
      </div>
    </Container>
  );
};

const FeatureList: React.FC<{ s: PageSection; dark: boolean }> = ({ s, dark }) => {
  const t = tone(dark);
  const items = arr<PageItem>(s.props.items).filter((i) => i && (i.title || i.text));
  const numbered = s.props.numbered === true;
  const ListTag = numbered ? 'ol' : 'ul';
  return (
    <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5 space-y-4">
        {str(s.props.title) && (
          <h2 className={`font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight ${t.heading}`}>{str(s.props.title)}</h2>
        )}
        {str(s.props.text) && <Paragraphs text={str(s.props.text)} className={`text-sm leading-relaxed max-w-md ${t.body}`} dark={dark} />}
        <Buttons buttons={arr<PageButton>(s.props.buttons)} dark={dark} />
      </div>
      {items.length > 0 && (
        <ListTag className={`lg:col-span-7 divide-y border-y ${dark ? 'divide-white/15 border-white/15' : 'divide-line border-line'}`}>
          {items.map((item, idx) => (
            <li key={idx} className={`grid gap-4 py-5 ${numbered ? 'grid-cols-[3rem_1fr]' : 'grid-cols-1'}`}>
              {numbered && <span className={`font-mono text-sm tabular-nums-all ${t.accent}`}>{String(idx + 1).padStart(2, '0')}</span>}
              <div className="space-y-1">
                <h3 className={`text-base font-semibold ${t.strong}`}>{item.title}</h3>
                {item.text && <p className={`text-sm leading-relaxed ${t.body}`}>{item.text}</p>}
              </div>
            </li>
          ))}
        </ListTag>
      )}
    </Container>
  );
};

const Cards: React.FC<{ s: PageSection; dark: boolean }> = ({ s, dark }) => {
  const t = tone(dark);
  const items = arr<PageItem>(s.props.items).filter((i) => i && (i.title || i.text));
  const cols = items.length >= 3 ? 'md:grid-cols-3' : items.length === 2 ? 'md:grid-cols-2' : '';
  return (
    <Container className="space-y-8">
      {(str(s.props.title) || str(s.props.text)) && (
        <div className="space-y-2 max-w-2xl">
          {str(s.props.title) && <h2 className={`font-display text-2xl md:text-3xl font-bold tracking-tight ${t.heading}`}>{str(s.props.title)}</h2>}
          {str(s.props.text) && <p className={`text-sm leading-relaxed ${t.body}`}>{str(s.props.text)}</p>}
        </div>
      )}
      {items.length > 0 && (
        <div className={`grid grid-cols-1 gap-6 ${cols}`}>
          {items.map((card, i) => (
            <div key={i} className={`p-8 rounded-xs border border-t-4 border-t-brand ${dark ? 'bg-white/5 border-white/15' : 'bg-white border-line'}`}>
              <h3 className={`text-lg font-display font-semibold mb-2 ${t.strong}`}>{card.title}</h3>
              {card.text && <p className={`text-sm leading-relaxed ${t.body}`}>{card.text}</p>}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

const RichText: React.FC<{ s: PageSection; dark: boolean }> = ({ s, dark }) => {
  const t = tone(dark);
  const blocks = arr<RichBlock>(s.props.blocks);
  return (
    <Container narrow>
      <div className={`space-y-4 text-[15px] leading-relaxed ${t.body}`}>
        {str(s.props.title) && <h2 className={`text-2xl md:text-3xl font-display font-bold tracking-tight mb-2 ${t.heading}`}>{str(s.props.title)}</h2>}
        {blocks.map((b, i) => {
          if (!b || typeof b !== 'object') return null;
          switch (b.type) {
            case 'heading':
              return (
                <h3 key={i} className={`text-lg font-semibold pt-3 ${t.strong}`}>
                  {b.text}
                </h3>
              );
            case 'paragraph':
              return <Paragraphs key={i} text={b.text || ''} className="" dark={dark} />;
            case 'list':
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5">
                  {arr<string>(b.items).filter(Boolean).map((it, j) => (
                    <li key={j}>
                      <Linkified text={it} dark={dark} />
                    </li>
                  ))}
                </ul>
              );
            case 'quote':
              return (
                <blockquote key={i} className={`border-l-4 border-brand pl-4 italic ${t.strong}`}>
                  {b.text}
                </blockquote>
              );
            default:
              return null;
          }
        })}
      </div>
    </Container>
  );
};

const Cta: React.FC<{ s: PageSection; dark: boolean }> = ({ s, dark }) => {
  const t = tone(dark);
  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h2 className={`font-display text-2xl md:text-3xl font-bold tracking-tight ${t.heading}`}>{str(s.props.title)}</h2>
          {str(s.props.text) && <p className={`text-sm leading-relaxed ${t.body}`}>{str(s.props.text)}</p>}
        </div>
        <Buttons buttons={arr<PageButton>(s.props.buttons)} dark={dark} />
      </div>
    </Container>
  );
};

// ── Sisteme bağlı bölümler ────────────────────────────────────────────────────


const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white text-neutral-800 p-5 rounded-xs border border-line flex items-start gap-4">
    <div className="p-3 bg-wood/10 border border-wood/30 rounded-xs text-wood flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-xs font-bold text-neutral-500">{title}</h3>
      {children}
    </div>
  </div>
);

const ContactDetails: React.FC<{ s: PageSection; dark: boolean; contact?: ContactData }> = ({ s, dark, contact }) => {
  const t = tone(dark);
  const c = contact || { phones: [], email: '', address: '', workingHours: '' };
  return (
    <Container className="space-y-8">
      {(str(s.props.title) || str(s.props.text)) && (
        <div className="space-y-2 max-w-2xl">
          {str(s.props.title) && <h2 className={`font-display text-2xl md:text-3xl font-bold tracking-tight ${t.heading}`}>{str(s.props.title)}</h2>}
          {str(s.props.text) && <p className={`text-sm leading-relaxed ${t.body}`}>{str(s.props.text)}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          {str(s.props.formTitle) && <h3 className={`text-lg font-semibold ${t.strong}`}>{str(s.props.formTitle)}</h3>}
          <ContactFormClient />
        </div>
        <div className="lg:col-span-5 space-y-4">
          {c.phones.length > 0 && (
            <InfoCard icon={<Phone className="h-6 w-6" />} title="Telefon">
              {c.phones.map((phone) => (
                <a key={phone} href={`tel:${toE164(phone)}`} className="block text-sm font-semibold text-neutral-900 mt-1 hover:text-wood">
                  {formatTrPhone(phone)}
                </a>
              ))}
            </InfoCard>
          )}
          {c.workingHours && (
            <InfoCard icon={<Clock className="h-6 w-6" />} title="Çalışma saatleri">
              <p className="text-sm font-semibold text-neutral-900 mt-1">{c.workingHours}</p>
            </InfoCard>
          )}
          {c.email && (
            <InfoCard icon={<Mail className="h-6 w-6" />} title="E-posta">
              <a href={`mailto:${c.email}`} className="block text-sm font-semibold text-neutral-900 mt-1 hover:text-wood">
                {c.email}
              </a>
            </InfoCard>
          )}
          {c.address && (
            <InfoCard icon={<MapPin className="h-6 w-6" />} title="Adres">
              <p className="text-sm text-neutral-700 mt-1 leading-relaxed">{c.address}</p>
            </InfoCard>
          )}
        </div>
      </div>
    </Container>
  );
};

// ── Kayıt: tip -> bileşen ─────────────────────────────────────────────────────

/** Kendi dış boşluğunu yöneten (tam genişlik) bölümler */
export const BARE_SECTIONS = new Set(['hero', 'categories', 'curated_sets']);

export function renderSection(s: PageSection, data: PageData, ctx: { dark: boolean; isFirst: boolean }): React.ReactNode {
  const { dark, isFirst } = ctx;
  switch (s.type) {
    case 'hero':
      return <Hero slides={arr<HeroSlide>(s.props.slides)} />;
    case 'categories':
      return <CategoryList title={str(s.props.title) || 'Kategoriler'} subtitle={str(s.props.subtitle)} />;
    case 'curated_sets':
      return <CuratedSets title={str(s.props.title)} subtitle={str(s.props.subtitle)} />;
    case 'product_grid': {
      const limit = typeof s.props.limit === 'number' ? Math.min(24, Math.max(4, s.props.limit)) : 8;
      return <ProductGridClient initialProducts={data.products || []} featuredTitle={str(s.props.title) || 'Ürünler'} subtitle={str(s.props.subtitle)} limit={limit} />;
    }
    case 'contact_details':
      return <ContactDetails s={s} dark={dark} contact={data.contact} />;
    case 'page_header':
      return <PageHeader s={s} dark={dark} isFirst={isFirst} />;
    case 'image_text':
      return <ImageText s={s} dark={dark} />;
    case 'feature_list':
      return <FeatureList s={s} dark={dark} />;
    case 'cards':
      return <Cards s={s} dark={dark} />;
    case 'rich_text':
      return <RichText s={s} dark={dark} />;
    case 'cta':
      return <Cta s={s} dark={dark} />;
    default:
      return null;
  }
}
