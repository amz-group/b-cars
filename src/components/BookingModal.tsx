import { useState } from 'react';
import { X, User, Phone, Calendar, Mail, MapPin, MessageSquare, MessageCircle, Clock } from 'lucide-react';
import { Car, SiteSettings } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type RentalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface BookingModalProps {
  car: Car;
  settings: SiteSettings | null;
  rentalPeriod: RentalPeriod;
  price: number;
  onClose: () => void;
  minPickupDate?: string | null;
}

export default function BookingModal({ car, settings, rentalPeriod, price, onClose, minPickupDate }: BookingModalProps) {
  const { t, dir } = useLanguage();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    pickupDate: minPickupDate || '',
    returnDate: '',
    email: '',
    pickupLocation: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPreBook = !!minPickupDate;;

  const periodSuffix: Record<RentalPeriod, string> = {
    daily: t('perDay'),
    weekly: t('perWeek'),
    monthly: t('perMonth'),
    yearly: t('perYear'),
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = t('nameRequired');
    if (!form.phone.trim()) e.phone = t('phoneRequired');
    if (!form.pickupDate) e.pickupDate = t('pickupRequired');
    if (!form.returnDate) e.returnDate = t('returnRequired');
    if (form.pickupDate && form.returnDate && form.returnDate <= form.pickupDate) {
      e.returnDate = t('returnAfterPickup');
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const periodText: Record<RentalPeriod, string> = {
      daily: t('daily'),
      weekly: t('weekly'),
      monthly: t('monthly'),
      yearly: t('yearly'),
    };

    const message = encodeURIComponent(
      `🚗 *${t('bookingRequest')}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🚘 *${t('vehicle')}:* ${car.brand} ${car.name} (${car.year})\n` +
      `⚙️ *${t('transmission')}:* ${car.transmission} | ⛽ *${t('fuel')}:* ${car.fuel_type}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *${t('customerDetails')}:*\n` +
      `• ${t('name')}: ${form.fullName}\n` +
      `• ${t('phone')}: ${form.phone}\n` +
      (form.email ? `• ${t('email')}: ${form.email}\n` : '') +
      `\n📅 *${t('rentalPeriod')}:*\n` +
      `• ${t('pickupDateLabel')}: ${form.pickupDate}\n` +
      `• ${t('returnDateLabel')}: ${form.returnDate}\n` +
      (form.pickupLocation ? `• ${t('pickupLocationLabel')}: ${form.pickupLocation}\n` : '') +
      `\n💰 *${t('pricing')}:* ${periodText[rentalPeriod]} — $${price}${periodSuffix[rentalPeriod]}\n` +
      (form.notes ? `\n📝 *${t('notesLabel')}:*\n${form.notes}\n` : '') +
      `\n━━━━━━━━━━━━━━━━━━━━\n` +
      t('confirmMessage')
    );

    const phone = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '1234567890';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    onClose();
  };

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const today = new Date().toISOString().split('T')[0];
  const inputClass = (hasError?: boolean) =>
    `w-full py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
      dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'
    } ${hasError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`;
  const iconClass = `absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800" dir={dir}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('bookNowTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{car.brand} {car.name} — ${price}{periodSuffix[rentalPeriod]}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Pre-booking notice */}
          {isPreBook && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Pre-booking request</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  This car is currently rented and becomes available on <strong>{new Date(minPickupDate! + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>. Your booking request will be for that date or later.
                </p>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('fullName')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className={iconClass} />
              <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputClass(!!errors.fullName)} placeholder={t('fullNamePlaceholder')} />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('phoneNumber')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className={iconClass} />
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass(!!errors.phone)} placeholder={t('phonePlaceholder')} />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pickupDate')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <input type="date" value={form.pickupDate} min={minPickupDate || today} onChange={(e) => set('pickupDate', e.target.value)}
                  className={`w-full py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${dir === 'rtl' ? 'pr-10 pl-2' : 'pl-10 pr-2'} ${errors.pickupDate ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
              </div>
              {errors.pickupDate && <p className="text-xs text-red-500 mt-1">{errors.pickupDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('returnDate')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <input type="date" value={form.returnDate} min={form.pickupDate || today} onChange={(e) => set('returnDate', e.target.value)}
                  className={`w-full py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${dir === 'rtl' ? 'pr-10 pl-2' : 'pl-10 pr-2'} ${errors.returnDate ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
              </div>
              {errors.returnDate && <p className="text-xs text-red-500 mt-1">{errors.returnDate}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('email')} <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
            </label>
            <div className="relative">
              <Mail className={iconClass} />
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass()} placeholder={t('emailPlaceholder')} />
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('pickupLocation')} <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
            </label>
            <div className="relative">
              <MapPin className={iconClass} />
              <input type="text" value={form.pickupLocation} onChange={(e) => set('pickupLocation', e.target.value)} className={inputClass()} placeholder={t('pickupLocationPlaceholder')} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')} <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
            </label>
            <div className="relative">
              <MessageSquare className={`absolute top-3 w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                className={`w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                placeholder={t('notesPlaceholder')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {t('cancel')}
            </button>
            <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm transition-colors shadow-md">
              <MessageCircle className="w-4 h-4" />
              {t('bookViaWhatsApp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
