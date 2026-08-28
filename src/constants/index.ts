/**
 * App-wide constants — all magic numbers/strings live here.
 */

export const STORAGE_KEYS = {
  CART: '@ayurveda/cart',
  WISHLIST: '@ayurveda/wishlist',
  BOOKINGS: '@ayurveda/bookings',
  OFFLINE_QUEUE: '@ayurveda/offline_queue',
  CACHED_DOCTORS: '@ayurveda/cached_doctors',
  CACHED_PRODUCTS: '@ayurveda/cached_products',
  CACHED_RECORDS: '@ayurveda/cached_records',
  THEME_MODE: '@ayurveda/theme_mode',
  LANGUAGE: '@ayurveda/language',
  APP_LAST_SYNC: '@ayurveda/last_sync',
} as const;

export const SPECIALTIES = [
  'Ayurvedic General',
  'Panchakarma',
  'Herbal Medicine',
  'Yoga & Naturopathy',
  'Nutritional Therapy',
  'Skin & Hair',
  'Joint & Spine',
] as const;

export const PRODUCT_CATEGORIES = [
  'Oils',
  'Herbs',
  'Supplements',
  'Skincare',
  'Haircare',
  'Immunity',
  'Digestive',
  'Joint Care',
  'Stress Relief',
  'Weight Management',
] as const;

export const RECORD_TYPES = [
  'lab_report',
  'prescription',
  'consultation',
  'vaccination',
  'allergy',
] as const;

export const RECORD_TYPE_LABELS: Record<string, string> = {
  lab_report: 'Lab Report',
  prescription: 'Prescription',
  consultation: 'Consultation',
  vaccination: 'Vaccination',
  allergy: 'Allergy',
};

export const RECORD_TYPE_ICONS: Record<string, string> = {
  lab_report: 'flask',
  prescription: 'file-medical',
  consultation: 'user-md',
  vaccination: 'syringe',
  allergy: 'allergies',
};

export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'newest', label: 'Newest First' },
] as const;

export const LANGUAGES = ['English', 'Hindi', 'Sanskrit', 'Tamil', 'Telugu', 'Kannada'] as const;

export const AYURVEDIC_TAGS = [
  'Vata', 'Pitta', 'Kapha', 'Tridosha', 'Organic', 'Herbal', 'Natural',
  'Cold Pressed', 'GMP Certified', 'AYUSH Approved', 'Detox', 'Immunity',
  'Anti-inflammatory', 'Adaptogen', 'Rasayana',
] as const;

export const TIMING_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
] as const;
