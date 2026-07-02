import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Heart, Navigation } from 'lucide-react';
import { supabase, SiteSettings } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings?.logo_url || '/WhatsApp_Image_2026-06-27_at_12.02.59_AM.jpeg'}
                alt="Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="text-xl font-bold text-white">
                {settings?.site_name || 'B Car For Rent'}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{t('contactUs')}</h3>
            <div className="space-y-3">
              {settings?.phone_primary && (
                <a
                  href={`tel:${settings.phone_primary}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {settings.phone_primary}
                </a>
              )}
              {settings?.phone_secondary && (
                <a
                  href={`tel:${settings.phone_secondary}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {settings.phone_secondary}
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {settings.email}
                </a>
              )}
              {!settings?.email && (
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4" />
                  info@bcarforrent.com
                </div>
              )}
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="space-y-1.5">
                  <span>{settings?.address || 'B.CAR COMPANY'}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'B.CAR COMPANY')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-primary-600 rounded-lg transition-colors text-gray-300 hover:text-white text-xs font-medium w-fit"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{t('followUs')}</h3>
            <div className="flex gap-3">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-800 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-800 rounded-xl hover:bg-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-800 rounded-xl hover:bg-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                  </svg>
                </a>
              )}
              {!settings?.facebook_url && !settings?.instagram_url && !settings?.tiktok_url && (
                <p className="text-sm text-gray-500">{t('comingSoon')}</p>
              )}
            </div>
            <WhatsAppButton settings={settings} />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            © {currentYear} AMZ GROUP. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" />. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton({ settings }: { settings: SiteSettings | null }) {
  const { t } = useLanguage();
  if (!settings?.whatsapp_number) return null;

  const phone = settings.whatsapp_number.replace(/[^0-9]/g, '');

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent('Hi! I\'m interested in renting a car. Could you provide more information?')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-colors text-white font-medium text-sm"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {t('chatOnWhatsApp')}
    </a>
  );
}
