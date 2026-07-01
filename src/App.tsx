import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Sparkles, Car, Shield, Clock, DollarSign } from 'lucide-react';
import { supabase, Car as CarType, SiteSettings, Rental } from './lib/supabase';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

export interface CarFilters {
  search: string;
  brand: string;
  transmission: string;
  fuelType: string;
  maxPrice: number;
}
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CarCard from './components/CarCard';
import SocialShare from './components/SocialShare';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [cars, setCars] = useState<CarType[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({ search: '', brand: '', transmission: '', fuelType: '', maxPrice: 0 });

  const brands = useMemo(() => [...new Set(cars.map((c) => c.brand).filter(Boolean))].sort(), [cars]);

  const filteredCars = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return cars.filter((car) => {
      if (q && !car.name.toLowerCase().includes(q) && !car.brand.toLowerCase().includes(q)) return false;
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.fuelType && car.fuel_type !== filters.fuelType) return false;
      if (filters.maxPrice > 0 && car.price_per_day > filters.maxPrice) return false;
      return true;
    });
  }, [cars, filters]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [carsRes, settingsRes, rentalsRes] = await Promise.all([
      supabase.from('cars').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').maybeSingle(),
      supabase.from('rentals').select('*').eq('status', 'active').gte('end_date', today),
    ]);
    if (carsRes.data) setCars(carsRes.data);
    if (settingsRes.data) setSettings(settingsRes.data);
    if (rentalsRes.data) setActiveRentals(rentalsRes.data);
    setLoading(false);
  };

  const getActiveRental = (carId: string): Rental | null => {
    const today = new Date().toISOString().split('T')[0];
    return activeRentals.find(
      (r) => r.car_id === carId && r.start_date <= today && r.end_date >= today
    ) ?? null;
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setShowAdminDashboard(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header
        onAdminClick={handleAdminClick}
        onShareClick={() => setShowShare(true)}
        filters={filters}
        onFilterChange={setFilters}
        brands={brands}
      />

      {/* Hero Section */}
      {(() => {
        const heroBg = theme === 'dark' ? settings?.hero_bg_dark : settings?.hero_bg_light;
        return (
          <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
            {heroBg ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${heroBg})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              </>
            )}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${heroBg ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'}`}>
                  <Sparkles className="w-4 h-4" />
                  {t('heroBadge')}
                </div>

                <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${heroBg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {t('heroTitle1')}
                  <span className="block gradient-text">{t('heroTitle2')}</span>
                </h1>

                <p className={`max-w-2xl mx-auto text-lg md:text-xl leading-relaxed ${heroBg ? 'text-white/85' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('heroDesc')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a href="#cars" className="btn-primary gap-2 text-lg px-8 py-4">
                    <Car className="w-5 h-5" />
                    {t('browseFleet')}
                  </a>
                  <a href="#contact" className={`gap-2 text-lg px-8 py-4 rounded-xl font-semibold transition-all inline-flex items-center ${heroBg ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30' : 'btn-secondary'}`}>
                    {t('contactUs2')}
                  </a>
                </div>

                <a
                  href="#cars"
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all animate-bounce mt-8 ${heroBg ? 'bg-white/20 backdrop-blur-sm' : 'bg-white dark:bg-gray-800'}`}
                >
                  <ChevronDown className={`w-6 h-6 ${heroBg ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                </a>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: t('fullyInsured'), description: t('fullyInsuredDesc') },
              { icon: Clock, title: t('support247'), description: t('support247Desc') },
              { icon: DollarSign, title: t('bestPrices'), description: t('bestPricesDesc') },
              { icon: Sparkles, title: t('premiumFleet'), description: t('premiumFleetDesc') },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 mb-4">
                  <feature.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cars Section */}
      <section id="cars" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('ourFleetTitle')}
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {t('ourFleetDesc')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
                  <div className="p-5 space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-16">
              <Car className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {cars.length === 0 ? t('noCarsTitle') : t('noMatchCars')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {cars.length === 0 ? t('noCarsDesc') : t('noMatchDesc')}
              </p>
              {cars.length > 0 && (
                <button
                  onClick={() => setFilters({ search: '', brand: '', transmission: '', fuelType: '', maxPrice: 0 })}
                  className="mt-4 px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  {t('clearFiltersBtn')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} settings={settings} activeRental={getActiveRental(car.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t('ctaDesc')}
          </p>
          <a
            href={`https://wa.me/${settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '1234567890'}?text=${encodeURIComponent('Hi! I\'d like to book a car rental. Please share available options.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 font-semibold text-lg rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('bookOnWhatsApp')}
          </a>
        </div>
      </section>

      <Footer />

      <SocialShare isOpen={showShare} onClose={() => setShowShare(false)} />
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
