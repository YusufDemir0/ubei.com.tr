'use client';

import React, { useId, useMemo, useState } from 'react';

const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'yandex.com', 'hotmail.com.tr', 'outlook.com.tr'];

interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  /** Firma alan adları gibi ek öneriler (ör. "firmaniz.com.tr") */
  extraDomains?: string[];
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * E-posta alanı: "@" yazılınca yaygın alan adlarını önerir (gmail.com, icloud.com …). Ok tuşları ve Enter/Tab ile
 * seçilir, Esc kapatır. Boşluk girilemez; değer küçük harfe çevrilir.
 */
export const EmailInput: React.FC<EmailInputProps> = ({ value, onChange, invalid, extraDomains = [], className = '', ...rest }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const suggestions = useMemo(() => {
    const at = value.indexOf('@');
    if (at < 1) return [];
    const local = value.slice(0, at);
    const typed = value.slice(at + 1).toLowerCase();
    return [...extraDomains, ...DOMAINS]
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .filter((d) => d.startsWith(typed) && d !== typed)
      .slice(0, 6)
      .map((d) => `${local}@${d}`);
  }, [value, extraDomains]);

  const show = open && suggestions.length > 0;
  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
  };
  const showInvalid = invalid ?? (value.length > 0 && !open && !EMAIL_RE.test(value));

  return (
    <div className="relative">
      <input
        {...rest}
        type="email"
        inputMode="email"
        autoComplete={rest.autoComplete ?? 'email'}
        spellCheck={false}
        role="combobox"
        aria-expanded={show}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={show ? `${id}-opt-${active}` : undefined}
        aria-invalid={showInvalid || undefined}
        value={value}
        maxLength={rest.maxLength ?? 150}
        onChange={(e) => {
          onChange(e.target.value.replace(/\s/g, '').toLowerCase());
          setOpen(true);
          setActive(0);
        }}
        onFocus={(e) => {
          setOpen(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          // Öneriye tıklama blur'dan önce işlensin
          setTimeout(() => setOpen(false), 120);
          rest.onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (show) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => (a + 1) % suggestions.length);
              return;
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
              return;
            }
            if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
              e.preventDefault();
              pick(suggestions[active]);
              return;
            }
            if (e.key === 'Escape') {
              setOpen(false);
              return;
            }
          }
          rest.onKeyDown?.(e);
        }}
        className={`${className} ${showInvalid ? '!border-signal' : ''}`}
      />
      {show && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-30 left-0 right-0 mt-1 bg-white border border-line rounded-xs shadow-lg py-1 max-h-60 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={s}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`px-3 py-2 text-sm cursor-pointer truncate ${i === active ? 'bg-paper text-ink' : 'text-neutral-700'}`}
            >
              {s.split('@')[0]}
              <span className="text-neutral-500">@</span>
              <span className="font-medium">{s.split('@')[1]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmailInput;
