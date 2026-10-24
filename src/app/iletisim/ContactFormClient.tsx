'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { isAxiosError } from 'axios';
import { contactFormSchema } from '../../lib/validations';
import apiClient from '../../services/api';
import { PhoneInput } from '../../components/form/PhoneInput';
import { EmailInput } from '../../components/form/EmailInput';

export default function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Sipariş ve kargo',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Bot tuzağı (honeypot): gerçek kullanıcılar bu alanı görmez ve doldurmaz
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const valRes = contactFormSchema.safeParse({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
    });

    if (!valRes.success) {
      setErrorMsg(valRes.error.issues[0]?.message || 'Lütfen bilgilerinizi kontrol ediniz.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await apiClient.post('/contact', { ...valRes.data, website });
      // Onay, kullanıcı yeni mesaja geçene kadar kalır (4 saniyede kaybolan onay kaçırılıyordu)
      setFormData({ name: '', email: '', phone: '', subject: 'Sipariş ve kargo', message: '' });
      setSubmitted(true);
    } catch (err) {
      const serverMsg = isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined;
      setErrorMsg(serverMsg || 'Mesajınız iletilemedi. Lütfen tekrar deneyiniz veya WhatsApp hattımızdan bize ulaşınız.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-neutral-800 p-6 md:p-8 rounded-xs border border-line">
      <h2 className="text-sm font-bold text-neutral-900 mb-6 border-b border-line pb-3">
        Bize Ulaşın / Mesaj Gönderin
      </h2>

      {submitted ? (
        <div className="bg-ok-soft border border-ok/25 p-6 rounded-xs text-center space-y-2 animate-fade-in">
          <CheckCircle2 className="h-10 w-10 text-ok mx-auto" />
          <h3 className="text-sm font-bold text-ok">Mesajınız Alındı</h3>
          <p className="text-xs text-ok">
            Müşteri temsilcilerimiz en kısa sürede sizinle iletişime geçecektir.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-2 inline-flex items-center h-10 px-4 text-sm font-semibold border border-ok/40 text-ok rounded-xs hover:bg-white cursor-pointer"
          >
            Yeni mesaj yaz
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {errorMsg && (
            <div className="bg-signal/5 border border-signal/40 text-signal p-3 rounded-xs text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <div>
            <label htmlFor="cf-name" className="text-sm font-medium text-neutral-700 block mb-1">
              Adınız / Soyadınız
            </label>
            <input
              id="cf-name"
              autoComplete="name"
              type="text"
              required
              value={formData.name} maxLength={100}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[0-9]/g, '') })}
              placeholder="Adınız Soyadınız"
              className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cf-email" className="text-sm font-medium text-neutral-700 block mb-1">
                E-Posta Adresiniz
              </label>
              <EmailInput
                id="cf-email"
                required
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                placeholder="ad@ornek.com"
                className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cf-phone" className="text-sm font-medium text-neutral-700 block mb-1">
                Telefon Numaranız
              </label>
              <PhoneInput
                id="cf-phone"
                required
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
                className="h-[46px]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Konu
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none"
            >
              <option value="Sipariş ve kargo">Sipariş ve kargo</option>
              <option value="İade ve değişim">İade ve değişim</option>
              <option value="Ürün uyumluluğu">Telefonuma uyar mı?</option>
              <option value="Toplu alım">Toplu alım</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">
              Mesajınız
            </label>
            <textarea
              required
              rows={5}
              value={formData.message} maxLength={3000}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Sipariş numaranız, telefon modeliniz ya da sorunuz..."
              className="w-full bg-white border border-line-strong text-ink text-base sm:text-sm p-3 rounded-xs focus:ring-2 focus:ring-wood/30 focus:border-wood focus:outline-none resize-none"
            />
          </div>

          <div aria-hidden="true" className="absolute -left-[10000px] h-0 w-0 overflow-hidden">
            <label>
              Web siteniz
              <input type="text" tabIndex={-1} autoComplete="off" value={website} maxLength={200} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ink hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-8 rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
