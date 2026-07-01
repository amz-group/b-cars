import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, X, Settings, Phone, Share2, Globe, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { supabase, SiteSettings } from '../lib/supabase';
import { CarFilters } from '../App';

interface HeaderProps {
  onAdminClick: () => void;
  onShareClick: () => void;
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  brands: string[];
}

const languages: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'ku', label: 'Kurdish', native: 'KU' },
  { code: 'ar', label: 'Arabic', native: 'AR' },
];

const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

export default function Header({ onAdminClick, onShareClick, filters, onFilterChange, brands }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, logout } = useAdmin();
  const { lang, setLang, t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [adminVisible, setAdminVisible] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').maybeSingle();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const checkIpAccess = async () => {
      try {
        const { data: ips } = await supabase.from('allowed_ips').select('ip_address');
        if (!ips || ips.length === 0) { setAdminVisible(true); return; }
        const res = await fetch('https://api.ipify.org?format=json');
        const { ip } = await res.json();
        setAdminVisible(ips.some((row) => row.ip_address === ip));
      } catch {
        setAdminVisible(false);
      }
    };
    if (isAdmin) setAdminVisible(true);
    else checkIpAccess();
  }, [isAdmin]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const set = (key: keyof CarFilters, value: string | number) =>
    onFilterChange({ ...filters, [key]: value });

  const clearFilters = () =>
    onFilterChange({ search: '', brand: '', transmission: '', fuelType: '', maxPrice: 0 });

  const activeCount = [
    filters.brand, filters.transmission, filters.fuelType,
    filters.maxPrice > 0 ? 'max' : '',
  ].filter(Boolean).length;

  const isRtl = dir === 'rtl';

  // Reusable filter controls JSX
  const filterControls = (
    <div className="space-y-4 p-4">
      {/* Brand */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('brand')}</p>
        <div className="relative">
          <select
            value={filters.brand}
            onChange={(e) => set('brand', e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('allBrands')}</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Transmission */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('gear')}</p>
        <div className="flex gap-1.5">
          {(['', ...TRANSMISSIONS] as string[]).map((v) => (
            <button
              key={v || 'all'}
              onClick={() => set('transmission', v)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                filters.transmission === v
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {v ? t(v.toLowerCase() as 'automatic' | 'manual') : t('allGear')}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('fuel')}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(['', ...FUEL_TYPES] as string[]).map((v) => (
            <button
              key={v || 'all'}
              onClick={() => set('fuelType', v)}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors ${
                filters.fuelType === v
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {v ? t(v.toLowerCase() as 'petrol' | 'diesel' | 'electric' | 'hybrid') : t('allFuel')}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
          {t('maxPriceDay')}{' '}
          {filters.maxPrice > 0 && (
            <span className="text-primary-500 normal-case font-normal">(≤${filters.maxPrice})</span>
          )}
        </p>
        <input
          type="range"
          min={0}
          max={500}
          step={5}
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', Number(e.target.value))}
          className="w-full accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{t('noLimit')}</span>
          <span>$500</span>
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          {t('clearFilters')}
        </button>
      )}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={settings?.logo_url || '/WhatsApp_Image_2026-06-27_at_12.02.59_AM.jpeg'}
              alt="Logo"
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {settings?.site_name || 'B Car For Rent'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Search + Filter — desktop */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => set('search', e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400"
              />
            </div>

            {/* Filter button */}
            <div ref={filterRef} className="relative shrink-0">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  filterOpen || activeCount > 0
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t('filter')}</span>
                {activeCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-primary-700 text-xs font-bold leading-none">
                    {activeCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className={`absolute top-full mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 ${isRtl ? 'left-0' : 'right-0'}`}>
                  {filterControls}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onShareClick}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {settings?.phone_primary && (
              <a
                href={`tel:${settings.phone_primary}`}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 font-medium hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">{t('callNow')}</span>
              </a>
            )}

            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-none">
                  {languages.find((l) => l.code === lang)?.native}
                </span>
              </button>

              {langOpen && (
                <div className={`absolute top-full mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 ${isRtl ? 'left-0' : 'right-0'}`}>
                  {languages.map(({ code, label, native }) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        lang === code
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="w-8 text-xs font-bold text-center bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">{native}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <button
              onClick={onAdminClick}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Admin settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {isAdmin && (
              <button
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors font-medium"
              >
                {t('logout')}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => set('search', e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {filterControls}
          </div>
        )}
      </div>
    </header>
  );
}
