'use client';

import React, { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchableCheckListProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  searchPlaceholder?: string;
}

const norm = (s: string) => s.toLocaleLowerCase('tr-TR');

/**
 * Uzun seçenek listeleri için filtre: üstte arama kutusu, altında kaydırılabilir onay listesi.
 * Seçili olanlar listenin başına alınır; kısa listelerde (≤ 6) arama kutusu gösterilmez.
 */
export const SearchableCheckList: React.FC<SearchableCheckListProps> = ({
  title,
  options,
  selected,
  onToggle,
  onClear,
  searchPlaceholder = 'Ara',
}) => {
  const [query, setQuery] = useState('');
  const id = useId();
  const selectedSet = useMemo(() => new Set(selected.map(norm)), [selected]);

  const visible = useMemo(() => {
    const q = norm(query.trim());
    const filtered = q ? options.filter((o) => norm(o).includes(q)) : options;
    return [...filtered].sort((a, b) => Number(selectedSet.has(norm(b))) - Number(selectedSet.has(norm(a))));
  }, [options, query, selectedSet]);

  if (options.length === 0) return null;

  return (
    <fieldset className="border-b border-line pb-5 space-y-2.5">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-ink">
          {title}
          {selected.length > 0 && <span className="ml-1.5 font-mono text-xs text-neutral-500">({selected.length})</span>}
        </legend>
        {selected.length > 0 && (
          <button type="button" onClick={onClear} className="text-xs text-wood hover:underline cursor-pointer">
            Temizle
          </button>
        )}
      </div>

      {options.length > 6 && (
        <div className="relative">
          <label htmlFor={`${id}-q`} className="sr-only">
            {title} içinde ara
          </label>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" aria-hidden="true" />
          <input
            id={`${id}-q`}
            type="search"
            value={query} maxLength={60}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-8 pr-8 text-sm border border-line-strong rounded-xs bg-white focus:outline-none focus:ring-2 focus:ring-wood/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1 top-1 h-7 w-7 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer"
              aria-label="Aramayı temizle"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <ul className="max-h-52 overflow-y-auto overscroll-contain -mx-1 px-1 space-y-0.5" aria-label={title}>
        {visible.length === 0 ? (
          <li className="text-sm text-neutral-500 py-2">Sonuç yok</li>
        ) : (
          visible.map((opt) => {
            const checked = selectedSet.has(norm(opt));
            return (
              <li key={opt}>
                <label
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xs cursor-pointer text-sm ${
                    checked ? 'bg-brand-soft text-ink font-medium' : 'text-neutral-700 hover:bg-paper'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(opt)}
                    className="h-4 w-4 accent-ink cursor-pointer shrink-0"
                  />
                  <span className="truncate">{opt}</span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </fieldset>
  );
};

export default SearchableCheckList;
