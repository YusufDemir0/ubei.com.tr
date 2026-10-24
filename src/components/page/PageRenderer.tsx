'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react';
import { renderSection, BARE_SECTIONS, type PageData } from './Sections';
import { SECTION_META, type PageDoc, type PageKey, type PageSection } from '../../lib/pageLayout';

/**
 * Bir CMS sayfasını bölüm sırasıyla çizer.
 *
 * Admin düzenleyicisi sayfayı `?cms-preview=1` ile bir iframe içinde açar. Bu modda sayfa:
 * - taslak düzeni üst pencereden alır (postMessage, yalnız aynı origin),
 * - bölümleri tıklanabilir yapar; tıklanan bölüm düzenleyicide seçilir,
 * - seçili bölümün üstünde sıralama ve gizleme düğmeleri gösterir,
 * - bağlantıların sayfadan çıkmasını engeller.
 */

export const PREVIEW_SOURCE = 'ubei-cms-preview';
export const EDITOR_SOURCE = 'ubei-cms-editor';

export type PreviewAction = 'up' | 'down' | 'toggle-hidden';

export type EditorMessage =
  | { source: typeof EDITOR_SOURCE; type: 'doc'; pageKey: PageKey; doc: PageDoc }
  | { source: typeof EDITOR_SOURCE; type: 'select'; id: string | null; scroll?: boolean };

export type PreviewMessage =
  | { source: typeof PREVIEW_SOURCE; type: 'ready'; pageKey: PageKey }
  | { source: typeof PREVIEW_SOURCE; type: 'select'; id: string }
  | { source: typeof PREVIEW_SOURCE; type: 'action'; id: string; action: PreviewAction };

const BG: Record<string, string> = {
  white: 'bg-white',
  canvas: 'bg-canvas',
  paper: 'bg-paper border-y border-line',
  ink: 'bg-ink',
};

const PAD: Record<string, string> = {
  compact: 'py-8 md:py-10',
  normal: 'py-12 md:py-16',
  roomy: 'py-16 md:py-24',
};

interface PageRendererProps {
  pageKey: PageKey;
  initialDoc: PageDoc;
  data: PageData;
}

export default function PageRenderer({ pageKey, initialDoc, data }: PageRendererProps) {
  const [doc, setDoc] = useState<PageDoc>(initialDoc);
  const [preview, setPreview] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const post = useCallback((msg: PreviewMessage) => {
    window.parent.postMessage(msg, window.location.origin);
  }, []);

  // Önizleme modu yalnız aynı origin'den açılmış bir iframe içinde etkinleşir
  useEffect(() => {
    let inFrame = false;
    try {
      inFrame = window.parent !== window && window.parent.location.origin === window.location.origin;
    } catch {
      inFrame = false;
    }
    // Yönlendirmede sorgu kaybolabilir (/anasayfa -> /); iframe adı korunduğu için o da kabul edilir
    const flagged = new URLSearchParams(window.location.search).has('cms-preview') || window.name === 'ubei-cms-preview';
    if (!inFrame || !flagged) return;
    setPreview(true);

    const onMessage = (event: MessageEvent<EditorMessage>) => {
      if (event.origin !== window.location.origin || event.data?.source !== EDITOR_SOURCE) return;
      if (event.data.type === 'doc' && event.data.pageKey === pageKey) setDoc(event.data.doc);
      if (event.data.type === 'select') {
        setSelectedId(event.data.id);
        if (event.data.scroll && event.data.id) {
          document.querySelector(`[data-cms-section="${CSS.escape(event.data.id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    window.addEventListener('message', onMessage);
    post({ source: PREVIEW_SOURCE, type: 'ready', pageKey });

    // Önizlemede bağlantılar ve form gönderimleri sayfadan çıkarmaz
    const blockNav = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (a) e.preventDefault();
    };
    const blockSubmit = (e: Event) => e.preventDefault();
    document.addEventListener('click', blockNav, true);
    document.addEventListener('submit', blockSubmit, true);
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('click', blockNav, true);
      document.removeEventListener('submit', blockSubmit, true);
    };
  }, [pageKey, post]);

  const visible = useMemo(() => doc.sections.filter((s) => preview || !s.hidden), [doc.sections, preview]);
  const firstHeaderId = pageKey === 'page_home' ? null : visible.find((s) => s.type === 'page_header' && !s.hidden)?.id ?? null;

  return (
    <div className="w-full bg-white text-ink" data-cms-page={pageKey}>
      {visible.map((s, index) => (
        <SectionShell
          key={s.id}
          section={s}
          preview={preview}
          selected={preview && selectedId === s.id}
          isFirst={index === 0}
          canMoveUp={index > 0}
          canMoveDown={index < visible.length - 1}
          onSelect={() => {
            setSelectedId(s.id);
            post({ source: PREVIEW_SOURCE, type: 'select', id: s.id });
          }}
          onAction={(action) => post({ source: PREVIEW_SOURCE, type: 'action', id: s.id, action })}
        >
          {renderSection(s, data, { dark: s.background === 'ink', isFirst: s.id === firstHeaderId })}
        </SectionShell>
      ))}
    </div>
  );
}

interface SectionShellProps {
  section: PageSection;
  preview: boolean;
  selected: boolean;
  isFirst: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onAction: (action: PreviewAction) => void;
  children: React.ReactNode;
}

function SectionShell({ section: s, preview, selected, canMoveUp, canMoveDown, onSelect, onAction, children }: SectionShellProps) {
  const bare = BARE_SECTIONS.has(s.type);
  const dark = s.background === 'ink';
  const bg = BG[s.background || 'white'] || BG.white;
  const pad = bare ? '' : PAD[s.spacing || 'normal'] || PAD.normal;
  const label = s.label?.trim();

  const previewCls = preview
    ? `relative cursor-pointer outline-offset-[-2px] ${selected ? 'outline outline-2 outline-brand' : 'hover:outline hover:outline-2 hover:outline-brand/60'} ${s.hidden ? 'opacity-40' : ''}`
    : '';

  return (
    <section
      id={s.anchor || undefined}
      data-cms-section={s.id}
      className={`${bg} ${pad} ${s.anchor ? 'scroll-mt-28' : ''} ${previewCls}`}
      onClickCapture={preview ? onSelect : undefined}
    >
      {preview && selected && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-ink text-white text-xs rounded-xs shadow-lg p-1" onClick={(e) => e.stopPropagation()}>
          <span className="px-2 font-medium">{SECTION_META[s.type]?.name}</span>
          <button type="button" disabled={!canMoveUp} onClick={() => onAction('up')} className="h-7 w-7 flex items-center justify-center hover:bg-white/15 disabled:opacity-30 rounded-xs" aria-label="Yukarı taşı">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" disabled={!canMoveDown} onClick={() => onAction('down')} className="h-7 w-7 flex items-center justify-center hover:bg-white/15 disabled:opacity-30 rounded-xs" aria-label="Aşağı taşı">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onAction('toggle-hidden')} className="h-7 w-7 flex items-center justify-center hover:bg-white/15 rounded-xs" aria-label={s.hidden ? 'Göster' : 'Gizle'}>
            {s.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {preview && s.hidden && (
        <span className="absolute top-2 left-2 z-50 bg-signal text-white text-xs font-semibold px-2 py-1 rounded-xs">Gizli: sitede görünmez</span>
      )}
      {label && (
        <div className={`${s.type === 'rich_text' ? 'max-w-3xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 ${bare ? 'pt-8 -mb-6 md:-mb-10 relative z-10' : 'mb-3'}`}>
          <span className={`inline-flex items-center gap-2 text-sm font-medium ${dark ? 'text-brand' : 'text-wood'}`}>
            <span className="h-px w-6 bg-brand" aria-hidden="true" />
            {label}
          </span>
        </div>
      )}
      {children}
    </section>
  );
}
