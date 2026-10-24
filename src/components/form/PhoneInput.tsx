'use client';

import React from 'react';
import { digitsFromValue, formatNational, isValidTrPhone, nationalDigits } from '../../lib/phone';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** E.164 ("+905324194151") ya da eski biçimli kayıt; kısmi girişte "+90532" gibi */
  value: string;
  /** Her zaman "+90" + girilen haneler (en fazla 10) ya da boş metin */
  onChange: (e164: string) => void;
  /** Yalnız cep telefonu (5 ile başlar) */
  mobile?: boolean;
  invalid?: boolean;
  /** Dış sarmalayıcının sınıfları (yükseklik, kenarlık) */
  className?: string;
}

/**
 * Türkiye telefon alanı: "+90" önek sabit, yalnız rakam girilir (harf ve sembol yazılamaz), yazarken
 * "532 419 41 51" biçimlenir. Yapıştırılan "+90 …", "0532 …" gibi değerler otomatik düzeltilir.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, mobile, invalid, className = '', placeholder, ...rest },
  ref
) {
  const digits = digitsFromValue(value);
  const showInvalid = invalid ?? (digits.length > 0 && !isValidTrPhone(digits, { mobile }));

  // Kutudaki metin yalnız ulusal haneleri içerir (önek ayrı); yapıştırılan metin "+90…/0…" olabilir
  const emit = (raw: string, pasted = false) => {
    const d = pasted ? nationalDigits(raw) : raw.replace(/\D/g, '').replace(/^0/, '').slice(0, 10);
    onChange(d ? `+90${d}` : '');
  };

  return (
    <div
      className={`flex items-stretch border ${showInvalid ? 'border-signal' : 'border-line-strong'} rounded-xs bg-white focus-within:ring-2 focus-within:ring-wood/30 focus-within:border-wood overflow-hidden ${className}`}
    >
      <span className="flex items-center px-3 bg-paper text-sm text-neutral-700 border-r border-line select-none" aria-hidden="true">
        +90
      </span>
      <input
        ref={ref}
        {...rest}
        type="tel"
        inputMode="numeric"
        autoComplete={rest.autoComplete ?? 'tel-national'}
        value={formatNational(digits)}
        placeholder={placeholder ?? (mobile ? '5XX XXX XX XX' : 'XXX XXX XX XX')}
        maxLength={13}
        aria-invalid={showInvalid || undefined}
        onKeyDown={(e) => {
          // Harf ve sembol tuşları hiç yazılmaz (kısayollar ve gezinme tuşları serbest)
          if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
          rest.onKeyDown?.(e);
        }}
        onChange={(e) => emit(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          emit(e.clipboardData.getData('text'), true);
        }}
        className="flex-1 min-w-0 h-full px-3 text-sm bg-transparent focus:outline-none tabular-nums-all"
      />
    </div>
  );
});

export default PhoneInput;
