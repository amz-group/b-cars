import { useState } from 'react';
import { Calendar, Fuel, Users, Settings, Check, X, MessageCircle, Maximize2, Clock } from 'lucide-react';
import { Car, SiteSettings, Rental } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import Car3DModal from './Car3DModal';
import BookingModal from './BookingModal';

type RentalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface CarCardProps {
  car: Car;
  settings: SiteSettings | null;
  activeRental?: Rental | null;
}

export default function CarCard({ car, settings, activeRental }: CarCardProps) {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('daily');
  const [show3D, setShow3D] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const getPrice = () => {
    switch (rentalPeriod) {
      case 'daily': return car.price_per_day;
      case 'weekly': return car.price_per_week;
      case 'monthly': return car.price_per_month;
      case 'yearly': return car.price_per_year;
      default: return car.price_per_day;
    }
  };

  const periodSuffix: Record<RentalPeriod, string> = {
    daily: t('perDay'),
    weekly: t('perWeek'),
    monthly: t('perMonth'),
    yearly: t('perYear'),
  };

  const periodLabel: Record<RentalPeriod, string> = {
    daily: t('daily'),
    weekly: t('weekly'),
    monthly: t('monthly'),
    yearly: t('yearly'),
  };

  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=80';

  const isAvailable = car.available && !activeRental;
  const isPreBookable = !isAvailable && !!activeRental;
  const canBook = isAvailable || isPreBookable;

  const getEarliestPickup = (): string | null => {
    if (!activeRental) return null;
    const d = new Date(activeRental.end_date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const hasPricing = {
    daily: car.price_per_day != null,
    weekly: car.price_per_week != null,
    monthly: car.price_per_month != null,
    yearly: car.price_per_year != null,
  };

  const fuelLabel: Record<string, string> = {
    Petrol: t('petrol'),
    Diesel: t('diesel'),
    Electric: t('electric'),
    Hybrid: t('hybrid'),
  };

  const transmissionLabel: Record<string, string> = {
    Automatic: t('automatic'),
    Manual: t('manual'),
  };

  return (<>
    <div
      className="card group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden aspect-[4/3] cursor-pointer"
        onClick={() => setShow3D(true)}
      >
        <img
          src={car.image_url || defaultImage}
          alt={`${car.brand} ${car.name}`}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-medium transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Maximize2 className="w-3.5 h-3.5" />
          {t('gallery')}
        </div>

        <div className="absolute top-4 right-4">
          {isAvailable ? (
            <span className="badge badge-available">
              <Check className="w-4 h-4 mr-1" />{t('available')}
            </span>
          ) : activeRental ? (
            <span className="badge badge-unavailable flex-col items-start gap-0 px-2.5 py-1.5 leading-tight">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Rented</span>
              </span>
              <span className="text-[10px] opacity-80">Until {formatDate(activeRental.end_date)}</span>
            </span>
          ) : (
            <span className="badge badge-unavailable">
              <X className="w-4 h-4 mr-1" />{t('unavailable')}
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {car.brand} {car.name}
          </h3>
          <p className="text-sm text-gray-200">{car.year}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Settings className="w-4 h-4 text-primary-500" />
            <span>{transmissionLabel[car.transmission] || car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Fuel className="w-4 h-4 text-primary-500" />
            <span>{fuelLabel[car.fuel_type] || car.fuel_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 text-primary-500" />
            <span>{car.seats} {t('seats')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>{car.year}</span>
          </div>
        </div>

        {car.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {car.features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                  {feature}
                </span>
              ))}
              {car.features.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                  +{car.features.length - 3} {t('more')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rental Period Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('selectPeriod')}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as RentalPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setRentalPeriod(period)}
                disabled={!hasPricing[period]}
                className={`px-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  rentalPeriod === period
                    ? 'bg-primary-600 text-white shadow-md'
                    : hasPricing[period]
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {periodLabel[period].slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {activeRental && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Available from {formatDate(activeRental.end_date)} — Pre-booking open
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">${getPrice()}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{periodSuffix[rentalPeriod]}</span>
          </div>

          <button
            onClick={() => canBook && setShowBooking(true)}
            disabled={!canBook}
            className={`gap-2 ${canBook ? (isPreBookable ? 'btn-secondary border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'btn-accent') : 'btn-accent opacity-50 cursor-not-allowed'}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isPreBookable ? 'Pre-Book' : t('bookNow')}</span>
          </button>
        </div>
      </div>
    </div>

    {show3D && <Car3DModal car={car} onClose={() => setShow3D(false)} />}
    {showBooking && (
      <BookingModal
        car={car}
        settings={settings}
        rentalPeriod={rentalPeriod}
        price={getPrice()}
        onClose={() => setShowBooking(false)}
        minPickupDate={getEarliestPickup()}
      />
    )}
  </>);
}
