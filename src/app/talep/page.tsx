'use client';

import OrderPauseNotice from '../../components/OrderPauseNotice';
import { ORDERS_PAUSED } from '../../lib/storeStatus';
import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { requestService, QuoteResponseItem } from '../../services/requestService';
import apiClient from '../../services/api';
import { TURKEY_CITIES, getDistrictsByCityName } from '../../lib/turkeyData';
import type { StoreItem } from '../../types';
import { InlineSkeleton } from '../../components/Skeleton';
import { PhoneInput } from '../../components/form/PhoneInput';
import { EmailInput, EMAIL_RE } from '../../components/form/EmailInput';
import { isValidTckn, isValidVkn } from '@/lib/taxId';
import { isValidTrPhone } from '../../lib/phone';

type FieldKey = 'name' | 'phone' | 'email' | 'company' | 'taxNumber' | 'taxOffice' | 'city' | 'district' | 'store' | 'kvkk';

const FIELD_ORDER: { key: FieldKey; id: string }[] = [
  { key: 'name', id: 'talep-name' },
  { key: 'phone', id: 'talep-phone' },
  { key: 'email', id: 'talep-email' },
  { key: 'company', id: 'talep-company' },
  { key: 'taxNumber', id: 'talep-tax-number' },
  { key: 'taxOffice', id: 'talep-tax-office' },
  { key: 'city', id: 'talep-city' },
  { key: 'district', id: 'talep-district' },
  { key: 'store', id: 'talep-store' },
  { key: 'kvkk', id: 'talep-kvkk' },
];

const inputClass = (hasError?: boolean) =>
  `w-full bg-white border rounded-xs px-3.5 py-2.5 text-base sm:text-sm text-ink placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-wood/30 focus:border-wood transition-colors disabled:bg-paper disabled:text-neutral-500 ${
    hasError ? 'border-signal' : 'border-line-strong'
  }`;

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} className="text-sm text-signal mt-1.5 flex items-start gap-1.5">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  ) : null;

export default function OrderRequestPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const totalCartAmount = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  // Fatura: bireysel (TCKN) ya da kurumsal (unvan, VKN, vergi dairesi)
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [preference, setPreference] = useState<'WHATSAPP' | 'STORE_VISIT'>('WHATSAPP');
  const [preferredStoreId, setPreferredStoreId] = useState<string>('');
  const [note, setNote] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // UI & Loading States
  const [isQuoting, setIsQuoting] = useState(true);
  const [quoteItems, setQuoteItems] = useState<QuoteResponseItem[]>([]);
  const [verifiedSubtotal, setVerifiedSubtotal] = useState(totalCartAmount);
  const [quoteWarning, setQuoteWarning] = useState<string | null>(null);

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [disabledCities, setDisabledCities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Alan bazlı doğrulama hataları: mesaj ilgili alanın altında gösterilir, ilk hatalı alana odaklanılır
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const clearFieldError = (key: FieldKey) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const [showKvkkModal, setShowKvkkModal] = useState(false);

  // Stable session idempotency key
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  const availableDistricts = city ? getDistrictsByCityName(city) : [];
  // İller plaka sırasıyla geliyor; kullanıcı alfabetik arar
  const sortedCities = [...TURKEY_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  // 1. Fetch stores and delivery zones
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [storesList, geoRes] = await Promise.allSettled([
          requestService.getStores(),
          apiClient.get('/geo/delivery-zones'),
        ]);

        if (isMounted) {
          if (storesList.status === 'fulfilled') {
            setStores(storesList.value);
            if (storesList.value.length > 0) {
              setPreferredStoreId(storesList.value[0].id);
            }
          }
          if (geoRes.status === 'fulfilled') {
            const zonesData = geoRes.value.data?.zones || geoRes.value.data?.data;
            if (zonesData?.disabledCityNames) {
              setDisabledCities(zonesData.disabledCityNames);
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Quote current cart items from server DB
  useEffect(() => {
    let isMounted = true;

    async function verifyQuote() {
      if (cartItems.length === 0) {
        setIsQuoting(false);
        return;
      }

      setIsQuoting(true);
      setQuoteWarning(null);

      try {
        const itemsPayload = cartItems.map((item) => ({
          productId: item.product.id,
          colorKey: item.product.selectedColor || null,
          quantity: item.quantity,
        }));

        const quoteRes = await requestService.quoteCart(itemsPayload);

        if (isMounted && quoteRes.success && quoteRes.quote) {
          setQuoteItems(quoteRes.quote.items);
          setVerifiedSubtotal(quoteRes.quote.subtotal);

          if (Math.abs(quoteRes.quote.subtotal - totalCartAmount) > 0.01) {
            setQuoteWarning('Sepetinizdeki bazı ürünlerin katalog fiyatı güncellenmiş. Özetteki satırlar güncel fiyatla gösteriliyor.');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Katalog fiyatları doğrulanamadı.';
          setQuoteWarning(msg);
        }
      } finally {
        if (isMounted) {
          setIsQuoting(false);
        }
      }
    }

    verifyQuote();

    return () => {
      isMounted = false;
    };
  }, [cartItems, totalCartAmount]);

  // Handle city change
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    // İlçe otomatik seçilmez: fark edilmeyen yanlış ilçe hatalı teslimat planlamasına yol açar
    setDistrict('');
  };

  const isCityDisabled = disabledCities.some(
    (c) => c.toLocaleLowerCase('tr-TR') === city.toLocaleLowerCase('tr-TR')
  );
  // Teslimat bölgeleri kargoladığımız illerdir; mağazaya gelecek müşteri her ilden talep gönderebilir
  const deliveryBlocked = isCityDisabled && preference !== 'STORE_VISIT';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price).replace('TRY', 'TL');
  };

  // 3. Submit Order Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Bot trap check
    if (honeypot.trim().length > 0) {
      router.push('/');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Sepetinizde ürün yok.');
      return;
    }

    const errors: Partial<Record<FieldKey, string>> = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.name = 'Ad ve soyadınızı eksiksiz yazın.';
    }
    // Phone validation
    if (!isValidTrPhone(customerPhone, { mobile: true })) {
      errors.phone = 'Cep telefonu numaranızı 10 hane olarak yazın (5XX XXX XX XX).';
    }
    if (customerEmail.trim() && !EMAIL_RE.test(customerEmail.trim())) {
      errors.email = 'E-posta adresini kontrol edin (ör. ad@gmail.com).';
    }
    if (customerType === 'CORPORATE') {
      if (companyName.trim().length < 2) errors.company = 'Firma unvanını yazın.';
      if (!isValidVkn(taxNumber)) errors.taxNumber = 'Vergi kimlik numarasını kontrol edin (10 hane).';
      if (taxOffice.trim().length < 2) errors.taxOffice = 'Vergi dairesini yazın.';
    } else if (taxNumber && !isValidTckn(taxNumber)) {
      errors.taxNumber = 'T.C. kimlik numarasını kontrol edin (11 hane) ya da boş bırakın.';
    }
    if (!city) errors.city = 'İl seçin.';
    if (city && !district) errors.district = 'İlçe seçin.';
    if (deliveryBlocked) {
      errors.city = `Şu anda ${city} iline teslimat yapmıyoruz. Bu il için WhatsApp'tan yazabilirsiniz.`;
    }
    if (preference === 'STORE_VISIT' && !preferredStoreId) {
      errors.store = 'Mağaza seçin.';
    }
    if (!kvkkAccepted) {
      errors.kvkk = 'Devam etmek için KVKK aydınlatma metnini okuduğunuzu onaylayın.';
    }
    setFieldErrors(errors);
    const firstInvalid = FIELD_ORDER.find((f) => errors[f.key]);
    if (firstInvalid) {
      const el = document.getElementById(firstInvalid.id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        colorKey: item.product.selectedColor || null,
        colorLabel: item.product.selectedColor || null,
        quantity: item.quantity,
      }));

      const res = await requestService.createRequest(
        {
          items: itemsPayload,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          customerType,
          companyName: customerType === 'CORPORATE' ? companyName.trim() : undefined,
          taxNumber: taxNumber || undefined,
          taxOffice: customerType === 'CORPORATE' ? taxOffice.trim() : undefined,
          city: city.trim(),
          district: district.trim(),
          addressLine: addressLine.trim() || undefined,
          preference,
          preferredStoreId: preference === 'STORE_VISIT' ? preferredStoreId : undefined,
          note: note.trim() || undefined,
          kvkkNoticeAcknowledged: true,
          marketingConsent,
          website: honeypot,
        },
        idempotencyKey
      );

      if (res.success && res.publicToken) {
        clearCart();
        router.push('/');
      } else {
        setFormError(res.message || 'Sipariş oluşturulamadı. Lütfen tekrar deneyiniz.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sipariş gönderilirken bir hata oluştu.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is completely empty
  if (!isQuoting && cartItems.length === 0) {
    return (
      <div className="w-full bg-canvas min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-paper border border-line rounded-xs p-10">
            <ShoppingBag className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">Sepetiniz boş</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Siparişi tamamlamak için sepete en az bir ürün ekleyin.
            </p>
            <Link
              href="/kategori"
              className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors"
            >
              Ürünleri gör
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-canvas min-h-screen py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-wood transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/sepet" className="hover:text-wood transition-colors">Sepet</Link>
          <span>/</span>
          <span className="text-neutral-700 font-normal">Siparişi tamamla</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-line pb-6 mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
            Siparişi tamamla
          </h1>
          <p className="text-sm text-neutral-600 mt-1.5 max-w-2xl">
            Teslimat bilgilerinizi girin; siparişinizi onaylayıp ödeme bağlantısını gönderelim.
          </p>
        </div>

        <div className="mb-8"><OrderPauseNotice /></div>

        {quoteWarning && (
          <div role="status" className="mb-8 p-4 bg-paper border-l-4 border-signal flex items-center gap-3 text-ink text-sm">
            <Info className="h-5 w-5 text-signal flex-shrink-0" />
            <span>{quoteWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Honeypot Input for Bot Suppression */}
          <input
            type="text"
            name="website"
            value={honeypot} maxLength={200}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* LEFT COLUMN: Customer Info, Location, Preference (8 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mobil: kısa özet; tam özet ve gönder düğmesi formun sonunda */}
            <a href="#talep-ozet" className="lg:hidden flex items-center justify-between gap-3 bg-paper border border-line rounded-xs px-4 py-3 text-sm">
              <span className="text-neutral-700">{cartItems.length} kalem · tahmini</span>
              <span className="font-mono font-semibold text-ink tabular-nums-all">{isQuoting ? <InlineSkeleton className="h-4 w-20" /> : formatPrice(verifiedSubtotal)}</span>
            </a>
            
            {/* 1. İletişim Bilgileri */}
            <fieldset className="bg-white rounded-xs border border-line p-5 sm:p-7">
              <legend className="sr-only">İletişim bilgileri</legend>
              <h2 className="flex items-baseline gap-3 text-base font-semibold text-ink border-b border-line pb-3 mb-5">
                <span className="font-mono text-sm text-wood tabular-nums-all">01</span>
                <span>İletişim bilgileri</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="talep-name" className="block text-sm font-medium text-ink mb-1.5">
                    Ad Soyad <span className="text-signal" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="talep-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={customerName} maxLength={100}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      clearFieldError('name');
                    }}
                    placeholder="Örn: Ahmet Yılmaz"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'talep-name-error' : undefined}
                    className={inputClass(!!fieldErrors.name)}
                  />
                  <FieldError id="talep-name-error" message={fieldErrors.name} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="talep-phone" className="block text-sm font-medium text-ink mb-1.5">
                      Telefon Numarası <span className="text-signal" aria-hidden="true">*</span>
                    </label>
                    <PhoneInput
                      id="talep-phone"
                      name="tel"
                      required
                      mobile
                      value={customerPhone}
                      onChange={(v) => {
                        setCustomerPhone(v);
                        clearFieldError('phone');
                      }}
                      invalid={fieldErrors.phone ? true : undefined}
                      aria-describedby={fieldErrors.phone ? 'talep-phone-error' : undefined}
                      className="h-11"
                    />
                  <FieldError id="talep-phone-error" message={fieldErrors.phone} />
                    <p className="text-xs text-neutral-500 mt-1">WhatsApp veya telefon görüşmesi için kullanılır.</p>
                  </div>

                  <div>
                    <label htmlFor="talep-email" className="block text-sm font-medium text-ink mb-1.5">
                      E-posta Adresi <span className="text-neutral-500 font-normal">(isteğe bağlı)</span>
                    </label>
                    <EmailInput
                      id="talep-email"
                      maxLength={100}
                      name="email"
                      value={customerEmail}
                      onChange={(v) => {
                        setCustomerEmail(v);
                        clearFieldError('email');
                      }}
                      placeholder="ad@ornek.com"
                      invalid={fieldErrors.email ? true : undefined}
                      aria-describedby={fieldErrors.email ? 'talep-email-error' : undefined}
                      className={inputClass(!!fieldErrors.email)}
                    />
                    <FieldError id="talep-email-error" message={fieldErrors.email} />
                  </div>
                </div>

                {/* Fatura bilgisi: bireysel / kurumsal */}
                <div role="radiogroup" aria-labelledby="talep-invoice-label">
                  <p id="talep-invoice-label" className="block text-sm font-medium text-ink mb-1.5">
                    Fatura türü <span className="text-signal" aria-hidden="true">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['INDIVIDUAL', 'Bireysel (şahıs)'],
                      ['CORPORATE', 'Kurumsal (firma)'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={customerType === value}
                        onClick={() => {
                          setCustomerType(value);
                          setTaxNumber('');
                          clearFieldError('taxNumber');
                        }}
                        className={`h-11 rounded-xs border text-sm font-medium transition-colors cursor-pointer ${
                          customerType === value ? 'border-wood bg-wood/10 text-ink' : 'border-line-strong bg-white text-neutral-600 hover:border-wood'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {customerType === 'CORPORATE' && (
                  <div>
                    <label htmlFor="talep-company" className="block text-sm font-medium text-ink mb-1.5">
                      Firma unvanı <span className="text-signal" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="talep-company"
                      type="text"
                      autoComplete="organization"
                      maxLength={150}
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        clearFieldError('company');
                      }}
                      placeholder="Örn: Yılmaz Teknoloji Ltd. Şti."
                      aria-invalid={!!fieldErrors.company}
                      aria-describedby={fieldErrors.company ? 'talep-company-error' : undefined}
                      className={inputClass(!!fieldErrors.company)}
                    />
                    <FieldError id="talep-company-error" message={fieldErrors.company} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="talep-tax-number" className="block text-sm font-medium text-ink mb-1.5">
                      {customerType === 'CORPORATE' ? (
                        <>Vergi kimlik no (VKN) <span className="text-signal" aria-hidden="true">*</span></>
                      ) : (
                        <>T.C. kimlik no <span className="text-neutral-500 font-normal">(isteğe bağlı)</span></>
                      )}
                    </label>
                    <input
                      id="talep-tax-number"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={customerType === 'CORPORATE' ? 10 : 11}
                      value={taxNumber}
                      onChange={(e) => {
                        setTaxNumber(e.target.value.replace(/\D/g, '').slice(0, customerType === 'CORPORATE' ? 10 : 11));
                        clearFieldError('taxNumber');
                      }}
                      placeholder={customerType === 'CORPORATE' ? '10 hane' : '11 hane'}
                      aria-invalid={!!fieldErrors.taxNumber}
                      aria-describedby={fieldErrors.taxNumber ? 'talep-tax-number-error' : 'talep-tax-number-hint'}
                      className={inputClass(!!fieldErrors.taxNumber)}
                    />
                    <FieldError id="talep-tax-number-error" message={fieldErrors.taxNumber} />
                    <p id="talep-tax-number-hint" className="text-xs text-neutral-500 mt-1">Yalnız faturanızı kesmek için kullanılır.</p>
                  </div>
                  {customerType === 'CORPORATE' && (
                    <div>
                      <label htmlFor="talep-tax-office" className="block text-sm font-medium text-ink mb-1.5">
                        Vergi dairesi <span className="text-signal" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="talep-tax-office"
                        type="text"
                        maxLength={100}
                        value={taxOffice}
                        onChange={(e) => {
                          setTaxOffice(e.target.value);
                          clearFieldError('taxOffice');
                        }}
                        placeholder="Örn: Kadıköy"
                        aria-invalid={!!fieldErrors.taxOffice}
                        aria-describedby={fieldErrors.taxOffice ? 'talep-tax-office-error' : undefined}
                        className={inputClass(!!fieldErrors.taxOffice)}
                      />
                      <FieldError id="talep-tax-office-error" message={fieldErrors.taxOffice} />
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {/* 2. Teslimat & Lokasyon Bilgileri */}
            <fieldset className="bg-white rounded-xs border border-line p-5 sm:p-7">
              <legend className="sr-only">Teslimat yeri</legend>
              <h2 className="flex items-baseline gap-3 text-base font-semibold text-ink border-b border-line pb-3 mb-5">
                <span className="font-mono text-sm text-wood tabular-nums-all">02</span>
                <span>Teslimat yeri</span>
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="talep-city" className="block text-sm font-medium text-ink mb-1.5">
                      İl <span className="text-signal" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="talep-city"
                      name="address-level1"
                      autoComplete="address-level1"
                      required
                      value={city}
                      onChange={(e) => {
                        handleCityChange(e.target.value);
                        clearFieldError('city');
                      }}
                      aria-invalid={!!fieldErrors.city}
                    aria-describedby={fieldErrors.city ? 'talep-city-error' : undefined}
                    className={inputClass(!!fieldErrors.city)}
                    >
                      <option value="" disabled>İl seçiniz</option>
                      {sortedCities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  <FieldError id="talep-city-error" message={fieldErrors.city} />
                  </div>

                  <div>
                    <label htmlFor="talep-district" className="block text-sm font-medium text-ink mb-1.5">
                      İlçe <span className="text-signal" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="talep-district"
                      name="address-level2"
                      autoComplete="address-level2"
                      required
                      disabled={!city}
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        clearFieldError('district');
                      }}
                      aria-invalid={!!fieldErrors.district}
                    aria-describedby={fieldErrors.district ? 'talep-district-error' : undefined}
                    className={inputClass(!!fieldErrors.district)}
                    >
                      <option value="" disabled>{city ? 'İlçe seçiniz' : 'Önce il seçiniz'}</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  <FieldError id="talep-district-error" message={fieldErrors.district} />
                  </div>
                </div>

                {isCityDisabled && (
                  <div className={`p-3 bg-paper border-l-4 text-ink text-sm ${deliveryBlocked ? 'border-signal' : 'border-wood'}`}>
                    {deliveryBlocked
                      ? <>Şu anda {city} iline teslimat yapmıyoruz. Ürünü mağazamızdan teslim almak isterseniz aşağıda &quot;Mağazaya geleceğim&quot; seçeneğini işaretleyin.</>
                      : <>{city} iline teslimat yapmıyoruz; ürünü mağazamızdan teslim alırsınız.</>}
                  </div>
                )}

                <div>
                  <label htmlFor="talep-address" className="block text-sm font-medium text-ink mb-1.5">
                    Açık Adres / Semt <span className="text-neutral-500 font-normal">(isteğe bağlı)</span>
                  </label>
                  <input
                    id="talep-address"
                    name="street-address"
                    type="text"
                    autoComplete="street-address"
                    value={addressLine} maxLength={255}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Mahalle, cadde, sokak veya site adı"
                    className={inputClass()}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Kargo teslimatı için kullanılır.</p>
                </div>
              </div>
            </fieldset>

            {/* 3. Talep Tamamlama Tercihi */}
            <fieldset className="bg-white rounded-xs border border-line p-5 sm:p-7">
              <legend className="sr-only">Onay ve ödeme</legend>
              <h2 className="flex items-baseline gap-3 text-base font-semibold text-ink border-b border-line pb-3 mb-5">
                <span className="font-mono text-sm text-wood tabular-nums-all">03</span>
                <span>Onay ve ödeme</span>
              </h2>

              <div role="radiogroup" aria-label="İletişim tercihi" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {([
                  {
                    value: 'WHATSAPP' as const,
                    title: 'WhatsApp’tan onay',
                    text: 'Siparişinizi WhatsApp’tan onaylarız; kartla ödeme bağlantısı ya da havale bilgisi gönderilir.',
                    Icon: MessageSquare,
                  },
                ]).map(({ value, title, text, Icon }) => {
                  const checked = preference === value;
                  return (
                    <label
                      key={value}
                      className={`relative p-4 rounded-xs border cursor-pointer transition-colors flex gap-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-wood/40 ${
                        checked ? 'border-ink bg-paper' : 'border-line-strong hover:border-neutral-500 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preference"
                        value={value}
                        checked={checked}
                        onChange={() => setPreference(value)}
                        className="mt-1 h-4 w-4 accent-ink shrink-0"
                      />
                      <span className="space-y-1">
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <Icon className="h-4 w-4 text-neutral-600" aria-hidden="true" />
                          {title}
                        </span>
                        <span className="block text-sm text-neutral-600 leading-relaxed">{text}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Note input */}
              <div className="mt-6">
                <label htmlFor="talep-note" className="block text-sm font-medium text-ink mb-1.5">
                  Notunuz <span className="text-neutral-500 font-normal">(isteğe bağlı)</span>
                </label>
                <textarea
                  id="talep-note"
                  name="note"
                  rows={3}
                  value={note} maxLength={500}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Kapı numarası, teslimat saati tercihi ya da hediye paketi notu"
                  className={`${inputClass()} resize-none`}
                />
              </div>
            </fieldset>

          </div>

          {/* RIGHT COLUMN: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div id="talep-ozet" className="bg-paper rounded-xs border border-line p-5 sm:p-6 lg:sticky lg:top-24 scroll-mt-24">
              <h2 className="flex items-baseline justify-between text-base font-semibold text-ink border-b border-line pb-3 mb-2">
                <span>Sipariş özeti</span>
                <span className="font-mono text-xs font-normal text-neutral-600">{cartItems.length} kalem</span>
              </h2>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-line pr-1 mb-4">
                {cartItems.map((item) => {
                  const key = item.itemKey || item.product.id;
                  // Sunucunun doğruladığı satır (aynı ürün + renk); yoksa sepet fiyatı gösterilir
                  const quoted = quoteItems.find(
                    (q) => q.productId === item.product.id && (q.colorKey || null) === (item.product.selectedColor || null)
                  );
                  const unitPrice = quoted ? quoted.unitPrice : item.product.price;
                  const priceChanged = !!quoted && Math.abs(quoted.unitPrice - item.product.price) > 0.01;
                  return (
                    <div key={key} className="py-3 flex gap-3 items-start">
                      <div className="h-16 w-14 rounded-xs overflow-hidden bg-white border border-line flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-ink line-clamp-2">
                          {item.product.name}
                        </h3>
                        {item.product.selectedColor && (
                          <p className="text-xs text-neutral-600">Renk: {item.product.selectedColor}</p>
                        )}
                        <p className="text-xs text-neutral-600 font-mono tabular-nums-all">
                          {item.quantity} × {formatPrice(unitPrice)}
                          {priceChanged && (
                            <span className="ml-1.5 text-neutral-500 line-through">{formatPrice(item.product.price)}</span>
                          )}
                        </p>
                        {priceChanged && <p className="text-xs text-signal">Katalog fiyatı güncellendi</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-semibold text-ink tabular-nums-all">
                          {formatPrice(quoted ? quoted.lineTotal : unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <dl className="border-t border-line pt-4 space-y-2 mb-5 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <dt>Ara toplam</dt>
                  <dd className="font-mono text-ink tabular-nums-all">{formatPrice(verifiedSubtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>KDV (%20)</dt>
                  <dd className="text-ink">Dahil</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Kargo</dt>
                  <dd className="text-ink">{verifiedSubtotal >= 1000 ? 'Ücretsiz' : formatPrice(79)}</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-line text-base font-semibold text-ink">
                  <dt>Toplam</dt>
                  <dd className="font-mono tabular-nums-all">{isQuoting ? <InlineSkeleton className="h-5 w-24" /> : formatPrice(verifiedSubtotal >= 1000 ? verifiedSubtotal : verifiedSubtotal + 79)}</dd>
                </div>
              </dl>

            <div className="space-y-3 mb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  id="talep-kvkk"
                  type="checkbox"
                  aria-invalid={!!fieldErrors.kvkk}
                  aria-describedby={fieldErrors.kvkk ? 'talep-kvkk-error' : undefined}
                  checked={kvkkAccepted}
                  onChange={(e) => {
                    setKvkkAccepted(e.target.checked);
                    clearFieldError('kvkk');
                  }}
                  className="mt-0.5 h-4 w-4 accent-ink shrink-0 cursor-pointer"
                />
                <span className="text-sm text-neutral-700 leading-relaxed">
                  <button
                    type="button"
                    onClick={() => setShowKvkkModal(true)}
                    className="text-ink font-medium underline hover:text-wood cursor-pointer"
                  >
                    KVKK aydınlatma metnini
                  </button>{' '}
                  okudum; siparişimin hazırlanması ve benimle iletişime geçilmesi için bilgilerimin işleneceği konusunda bilgilendirildim. <span className="text-signal" aria-hidden="true">*</span>
                </span>
              </label>
              <FieldError id="talep-kvkk-error" message={fieldErrors.kvkk} />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-ink shrink-0 cursor-pointer"
                />
                <span className="text-sm text-neutral-600 leading-relaxed">
                  Yeni ürün ve kampanyalardan haberdar olmak istiyorum (isteğe bağlı).
                </span>
              </label>
            </div>

              {formError && (
                <div role="alert" className="mb-4 p-3.5 bg-white border-l-4 border-signal text-ink text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={ORDERS_PAUSED || isSubmitting || isQuoting || deliveryBlocked}
                className="w-full h-12 flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold transition-colors rounded-xs cursor-pointer disabled:bg-neutral-300 disabled:text-neutral-600 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gönderiliyor…</span>
                  </>
                ) : isQuoting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fiyatlar doğrulanıyor…</span>
                  </>
                ) : ORDERS_PAUSED ? (
                  <span>Sipariş alımı geçici olarak kapalı</span>
                ) : deliveryBlocked ? (
                  <span>Seçilen ile teslimat yapılamıyor</span>
                ) : (
                  <>
                    <span>Siparişi gönder</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-neutral-600 leading-relaxed">
                Hafta içi 15:00&apos;e kadar onaylanan siparişler aynı gün kargoya verilir. Ürünü 14 gün içinde iade edebilirsiniz.
              </p>
            </div>
          </div>

        </form>
      </div>

      {/* KVKK Modal */}
      {showKvkkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowKvkkModal(false)}
              aria-label="Kapat"
              className="absolute top-3 right-3 h-11 w-11 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-ink mb-4">
              KVKK aydınlatma metni
            </h3>
            <div className="text-sm text-neutral-700 space-y-3 leading-relaxed">
              <p>
                <strong>UBEI</strong> olarak kişisel verilerinizi yalnızca siparişinizi hazırlamak ve size ulaştırmak için kullanırız.
              </p>
              <p>
                <strong>İşlenen Veriler:</strong> Adınız, soyadınız, telefon numaranız, e-posta adresiniz ve talep ettiğiniz teslimat ili/ilçesi.
              </p>
              <p>
                <strong>İşlenme Amacı:</strong> Gerçek bir mağazada: siparişin hazırlanması, kargoya verilmesi ve sipariş durumuyla ilgili bilgilendirme.
              </p>
              <p>
                <strong>Aktarım:</strong> Kişisel verileriniz hiçbir üçüncü şahsa veya reklam platformuna satılmaz. Gerçek bir mağazada yalnızca kargo firmasıyla, teslimat için gereken ölçüde paylaşılır.
              </p>
            </div>
            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => {
                  setKvkkAccepted(true);
                  clearFieldError('kvkk');
                  setShowKvkkModal(false);
                }}
                className="bg-ink hover:bg-neutral-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xs cursor-pointer"
              >
                Okudum, onaylıyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
