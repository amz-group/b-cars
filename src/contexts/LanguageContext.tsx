import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ku' | 'ar';

const translations = {
  en: {
    // Header
    ourFleet: 'Our Fleet',
    contact: 'Contact',
    callNow: 'Call Now',
    logout: 'Logout',
    tagline: 'Premium Car Rental Service',

    // Search / Filter
    searchPlaceholder: 'Search by name or brand...',
    filter: 'Filter',
    allBrands: 'All Brands',
    brand: 'Brand',
    gear: 'Gear',
    fuel: 'Fuel',
    allGear: 'All',
    allFuel: 'All Fuel',
    maxPriceDay: 'Max Price/Day',
    noLimit: 'No limit',
    clearFilters: 'Clear all filters',
    noMatchCars: 'No matching cars found',
    noMatchDesc: 'Try adjusting your search or filters.',
    clearFiltersBtn: 'Clear filters',

    // Hero
    heroBadge: 'Premium Car Rental Experience',
    heroTitle1: 'Find Your Perfect',
    heroTitle2: 'Ride Today',
    heroDesc: 'Discover our curated selection of premium vehicles. From luxury sedans to spacious SUVs, we have the perfect car for every journey.',
    browseFleet: 'Browse Our Fleet',
    contactUs2: 'Contact Us',

    // Features
    fullyInsured: 'Fully Insured',
    fullyInsuredDesc: 'All vehicles come with comprehensive insurance coverage',
    support247: '24/7 Support',
    support247Desc: 'Round-the-clock customer service for your peace of mind',
    bestPrices: 'Best Prices',
    bestPricesDesc: 'Competitive rates with no hidden fees or surprises',
    premiumFleet: 'Premium Fleet',
    premiumFleetDesc: 'Well-maintained, latest model vehicles',

    // Cars section
    ourFleetTitle: 'Our Fleet',
    ourFleetDesc: 'Choose from our selection of well-maintained vehicles. Each car is thoroughly inspected and ready for your next adventure.',
    noCarsTitle: 'No Cars Available',
    noCarsDesc: 'Check back soon for new vehicles!',

    // CTA
    ctaTitle: 'Ready to Book Your Ride?',
    ctaDesc: 'Get in touch with us now and secure your perfect vehicle. Our team is ready to help you find the ideal car for your needs.',
    bookOnWhatsApp: 'Book Now on WhatsApp',

    // Car card
    available: 'Available',
    unavailable: 'Unavailable',
    selectPeriod: 'Select Rental Period',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    perDay: '/day',
    perWeek: '/week',
    perMonth: '/month',
    perYear: '/year',
    bookNow: 'Book Now',
    automatic: 'Automatic',
    manual: 'Manual',
    seats: 'Seats',
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
    more: 'more',

    // 3D Modal
    gallery: 'Gallery',
    exterior3D: 'Exterior 3D',
    interior3D: 'Interior 3D',

    // Booking modal
    bookNowTitle: 'Book Now',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+964 7xx xxx xxxx',
    pickupDate: 'Pickup Date',
    returnDate: 'Return Date',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    pickupLocation: 'Pickup Location',
    pickupLocationPlaceholder: 'Address or landmark',
    notes: 'Notes',
    notesPlaceholder: 'Any special requests or notes...',
    optional: 'optional',
    required: 'required',
    cancel: 'Cancel',
    bookViaWhatsApp: 'Book via WhatsApp',
    nameRequired: 'Full name is required',
    phoneRequired: 'Phone number is required',
    pickupRequired: 'Pickup date is required',
    returnRequired: 'Return date is required',
    returnAfterPickup: 'Return date must be after pickup date',

    // Footer
    contactUs: 'Contact Us',
    followUs: 'Follow Us',
    footerDesc: 'Your trusted car rental service. We offer a wide range of premium vehicles at competitive prices for all your travel needs.',
    chatOnWhatsApp: 'Chat on WhatsApp',
    allRightsReserved: 'All rights reserved.',
    comingSoon: 'Coming soon...',

    // WhatsApp message
    bookingRequest: 'CAR RENTAL BOOKING REQUEST',
    vehicle: 'Vehicle',
    transmission: 'Transmission',
    customerDetails: 'Customer Details',
    name: 'Name',
    phone: 'Phone',
    rentalPeriod: 'Rental Period',
    pricing: 'Pricing',
    pickupDateLabel: 'Pickup',
    returnDateLabel: 'Return',
    pickupLocationLabel: 'Pickup Location',
    notesLabel: 'Notes',
    confirmMessage: 'Please confirm availability and details.',
  },

  ku: {
    // Header
    ourFleet: 'ئۆتۆمبێلەکانمان',
    contact: 'پەیوەندی',
    callNow: 'ئێستا پەیوەندی بکە',
    logout: 'دەرچوون',
    tagline: 'خزمەتگوزاری کرێی ئۆتۆمبێلی پریمیوم',

    // Search / Filter
    searchPlaceholder: 'بگەرێ بە ناو یان براند...',
    filter: 'فلتەر',
    allBrands: 'هەموو براندەکان',
    brand: 'براند',
    gear: 'گێر',
    fuel: 'سووتەمەنی',
    allGear: 'هەموو',
    allFuel: 'هەموو سووتەمەنی',
    maxPriceDay: 'زیاترین نرخ/ڕۆژ',
    noLimit: 'سنور نییە',
    clearFilters: 'سڕینەوەی هەموو فلتەرەکان',
    noMatchCars: 'هیچ ئۆتۆمبێلێک نەدۆزرایەوە',
    noMatchDesc: 'گەران یان فلتەرەکانت بگۆرە.',
    clearFiltersBtn: 'سڕینەوەی فلتەرەکان',

    // Hero
    heroBadge: 'کرێی ئۆتۆمبێلی پریمیوم',
    heroTitle1: 'ئۆتۆمبێلی گونجاوت',
    heroTitle2: 'ئێستا بدۆزەرەوە',
    heroDesc: 'ئۆتۆمبێلی پریمیومی خۆمان هەڵبژێرە. لە سیدانی لوکس تا SUVی فراوان، ئۆتۆمبێلی گونجاو بۆ هەموو گەشتێک هەمانە.',
    browseFleet: 'سەیری ئۆتۆمبێلەکان بکە',
    contactUs2: 'پەیوەندیمان پێوە بکە',

    // Features
    fullyInsured: 'بیمەی تەواو',
    fullyInsuredDesc: 'هەموو ئۆتۆمبێلەکان بیمەی تەواویان هەیە',
    support247: 'پشتیوانی ٢٤/٧',
    support247Desc: 'خزمەتگوزاری کڕیار ٢٤ کاتژمێر بۆ ئارامی تۆ',
    bestPrices: 'باشترین نرخ',
    bestPricesDesc: 'نرخی پێشبەردە بەبێ موچە مشتومڕ',
    premiumFleet: 'ئۆتۆمبێلی پریمیوم',
    premiumFleetDesc: 'ئۆتۆمبێلی چاکخراو و مۆدێلی نوێ',

    // Cars section
    ourFleetTitle: 'ئۆتۆمبێلەکانمان',
    ourFleetDesc: 'لە ئۆتۆمبێلە چاکخراوەکانمان هەڵبژێرە. هەموو ئۆتۆمبێلێک باشخراوەو ئامادەی گەشتەکەتە.',
    noCarsTitle: 'هیچ ئۆتۆمبێلێک بەردەست نییە',
    noCarsDesc: 'بەزوانە ئۆتۆمبێلی نوێ دەزیادبێت!',

    // CTA
    ctaTitle: 'ئامادەی حجز کردنیت؟',
    ctaDesc: 'ئێستا پەیوەندیمان پێوە بکە و ئۆتۆمبێلی گونجاوت دامەزرێنە.',
    bookOnWhatsApp: 'حجز لە واتساپ',

    // Car card
    available: 'بەردەستە',
    unavailable: 'بەردەست نییە',
    selectPeriod: 'ماوەی کرێ هەڵبژێرە',
    daily: 'ڕۆژانە',
    weekly: 'هەفتانە',
    monthly: 'مانگانە',
    yearly: 'ساڵانە',
    perDay: '/ڕۆژ',
    perWeek: '/هەفتە',
    perMonth: '/مانگ',
    perYear: '/ساڵ',
    bookNow: 'ئێستا حجز بکە',
    automatic: 'ئۆتۆماتیک',
    manual: 'دەستی',
    seats: 'کرسی',
    petrol: 'بەنزین',
    diesel: 'گازۆیل',
    electric: 'کارەبایی',
    hybrid: 'هایبرید',
    more: 'زیاتر',

    // 3D Modal
    gallery: 'گاڵەری',
    exterior3D: 'دەرەوە',
    interior3D: 'ناوەوە',

    // Booking modal
    bookNowTitle: 'حجز بکە',
    fullName: 'ناوی تەواو',
    fullNamePlaceholder: 'ناوی تەواوت',
    phoneNumber: 'ژمارەی تەلەفۆن',
    phonePlaceholder: '٠٧xx xxx xxxx',
    pickupDate: 'بەرواری وەرگرتن',
    returnDate: 'بەرواری گەڕاندنەوە',
    email: 'ئیمێڵ',
    emailPlaceholder: 'ئیمێڵەکەت',
    pickupLocation: 'شوێنی وەرگرتن',
    pickupLocationPlaceholder: 'ناونیشان یان شوێنی ناسراو',
    notes: 'تێبینی',
    notesPlaceholder: 'هەر داواکاری تایبەت...',
    optional: 'ئارەزومەندانە',
    required: 'پێویستە',
    cancel: 'هەڵوەشاندنەوە',
    bookViaWhatsApp: 'حجز لە ڕێگەی واتساپ',
    nameRequired: 'ناوی تەواو پێویستە',
    phoneRequired: 'ژمارەی تەلەفۆن پێویستە',
    pickupRequired: 'بەرواری وەرگرتن پێویستە',
    returnRequired: 'بەرواری گەڕاندنەوە پێویستە',
    returnAfterPickup: 'بەرواری گەڕاندنەوە دەبێت دوای وەرگرتن بێت',

    // Footer
    contactUs: 'پەیوەندیمان پێوە بکە',
    followUs: 'دوامان بکەوە',
    footerDesc: 'خزمەتگوزاری کرێی ئۆتۆمبێلی متمانەپێکراو. بەشێکی فراوانی ئۆتۆمبێلی پریمیوم بە نرخی پێشبەردە پێشکەش دەکەین.',
    chatOnWhatsApp: 'گفتوگۆ لە واتساپ',
    allRightsReserved: 'هەموو مافەکان پارێزراون.',
    comingSoon: 'بەمزوانە...',

    // WhatsApp message
    bookingRequest: 'داواکاری کرێی ئۆتۆمبێل',
    vehicle: 'ئۆتۆمبێل',
    transmission: 'گێربۆکس',
    customerDetails: 'زانیاری کڕیار',
    name: 'ناو',
    phone: 'تەلەفۆن',
    rentalPeriod: 'ماوەی کرێ',
    pricing: 'نرخ',
    pickupDateLabel: 'وەرگرتن',
    returnDateLabel: 'گەڕاندنەوە',
    pickupLocationLabel: 'شوێنی وەرگرتن',
    notesLabel: 'تێبینی',
    confirmMessage: 'تکایە بەردەستبوون و وردەکاریەکان پشتڕاست بکەوە.',
  },

  ar: {
    // Header
    ourFleet: 'أسطولنا',
    contact: 'تواصل',
    callNow: 'اتصل الآن',
    logout: 'تسجيل خروج',
    tagline: 'خدمة تأجير سيارات فاخرة',

    // Search / Filter
    searchPlaceholder: 'ابحث بالاسم أو الماركة...',
    filter: 'تصفية',
    allBrands: 'جميع الماركات',
    brand: 'الماركة',
    gear: 'ناقل الحركة',
    fuel: 'الوقود',
    allGear: 'الكل',
    allFuel: 'كل الوقود',
    maxPriceDay: 'الحد الأقصى للسعر/يوم',
    noLimit: 'بلا حد',
    clearFilters: 'مسح جميع الفلاتر',
    noMatchCars: 'لا توجد سيارات مطابقة',
    noMatchDesc: 'حاول تعديل البحث أو الفلاتر.',
    clearFiltersBtn: 'مسح الفلاتر',

    // Hero
    heroBadge: 'تجربة تأجير سيارات فاخرة',
    heroTitle1: 'ابحث عن سيارتك',
    heroTitle2: 'المثالية اليوم',
    heroDesc: 'اكتشف مجموعتنا المختارة من السيارات الفاخرة. من السيدان الفارهة إلى SUV الواسع، لدينا السيارة المثالية لكل رحلة.',
    browseFleet: 'تصفح أسطولنا',
    contactUs2: 'تواصل معنا',

    // Features
    fullyInsured: 'مؤمن بالكامل',
    fullyInsuredDesc: 'جميع المركبات مؤمنة بتغطية شاملة',
    support247: 'دعم ٢٤/٧',
    support247Desc: 'خدمة عملاء على مدار الساعة لراحة بالك',
    bestPrices: 'أفضل الأسعار',
    bestPricesDesc: 'أسعار تنافسية بدون رسوم مخفية',
    premiumFleet: 'أسطول فاخر',
    premiumFleetDesc: 'سيارات محافظ عليها بأحدث الموديلات',

    // Cars section
    ourFleetTitle: 'أسطولنا',
    ourFleetDesc: 'اختر من مجموعة سياراتنا المحافظ عليها. كل سيارة مفحوصة بدقة وجاهزة لمغامرتك القادمة.',
    noCarsTitle: 'لا توجد سيارات متاحة',
    noCarsDesc: 'تحقق مرة أخرى قريباً لسيارات جديدة!',

    // CTA
    ctaTitle: 'هل أنت مستعد لحجز سيارتك؟',
    ctaDesc: 'تواصل معنا الآن واحجز سيارتك المثالية. فريقنا مستعد لمساعدتك في إيجاد السيارة المناسبة.',
    bookOnWhatsApp: 'احجز عبر واتساب',

    // Car card
    available: 'متاح',
    unavailable: 'غير متاح',
    selectPeriod: 'اختر فترة الإيجار',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    yearly: 'سنوي',
    perDay: '/يوم',
    perWeek: '/أسبوع',
    perMonth: '/شهر',
    perYear: '/سنة',
    bookNow: 'احجز الآن',
    automatic: 'أوتوماتيك',
    manual: 'يدوي',
    seats: 'مقاعد',
    petrol: 'بنزين',
    diesel: 'ديزل',
    electric: 'كهربائي',
    hybrid: 'هجين',
    more: 'المزيد',

    // 3D Modal
    gallery: 'معرض الصور',
    exterior3D: 'المظهر الخارجي',
    interior3D: 'المظهر الداخلي',

    // Booking modal
    bookNowTitle: 'احجز الآن',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'اسمك الكامل',
    phoneNumber: 'رقم الهاتف',
    phonePlaceholder: '+964 7xx xxx xxxx',
    pickupDate: 'تاريخ الاستلام',
    returnDate: 'تاريخ الإرجاع',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'بريدك@الإلكتروني.com',
    pickupLocation: 'موقع الاستلام',
    pickupLocationPlaceholder: 'العنوان أو المعلم',
    notes: 'ملاحظات',
    notesPlaceholder: 'أي طلبات خاصة أو ملاحظات...',
    optional: 'اختياري',
    required: 'مطلوب',
    cancel: 'إلغاء',
    bookViaWhatsApp: 'احجز عبر واتساب',
    nameRequired: 'الاسم الكامل مطلوب',
    phoneRequired: 'رقم الهاتف مطلوب',
    pickupRequired: 'تاريخ الاستلام مطلوب',
    returnRequired: 'تاريخ الإرجاع مطلوب',
    returnAfterPickup: 'يجب أن يكون تاريخ الإرجاع بعد تاريخ الاستلام',

    // Footer
    contactUs: 'تواصل معنا',
    followUs: 'تابعنا',
    footerDesc: 'خدمة تأجير سيارات موثوقة. نقدم مجموعة واسعة من المركبات الفاخرة بأسعار تنافسية لجميع احتياجات سفرك.',
    chatOnWhatsApp: 'تحدث على واتساب',
    allRightsReserved: 'جميع الحقوق محفوظة.',
    comingSoon: 'قريباً...',

    // WhatsApp message
    bookingRequest: 'طلب حجز سيارة',
    vehicle: 'السيارة',
    transmission: 'ناقل الحركة',
    customerDetails: 'بيانات العميل',
    name: 'الاسم',
    phone: 'الهاتف',
    rentalPeriod: 'فترة الإيجار',
    pricing: 'السعر',
    pickupDateLabel: 'الاستلام',
    returnDateLabel: 'الإرجاع',
    pickupLocationLabel: 'موقع الاستلام',
    notesLabel: 'ملاحظات',
    confirmMessage: 'يرجى تأكيد التوفر والتفاصيل.',
  },
} as const;

export type TranslationKey = keyof typeof translations['en'];

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'en';
  });

  const dir: 'ltr' | 'rtl' = lang === 'en' ? 'ltr' : 'rtl';

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = (key: TranslationKey): string => translations[lang][key] as string;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
