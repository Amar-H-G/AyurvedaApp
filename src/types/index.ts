/**
 * All global TypeScript types for the application.
 * Separated by domain for clarity.
 */

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

// ─── Consultation Types ───────────────────────────────────────────────────────

export type DoctorSpecialty =
  | 'Ayurvedic General'
  | 'Panchakarma'
  | 'Herbal Medicine'
  | 'Yoga & Naturopathy'
  | 'Nutritional Therapy'
  | 'Skin & Hair'
  | 'Joint & Spine';

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  qualification: string;
  experience: number; // years
  rating: number; // 0-5
  reviewCount: number;
  consultationFee: number; // INR
  languages: string[];
  imageUrl: string;
  location: string;
  availableToday: boolean;
  bio: string;
  tags: string[];
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isBooked: boolean;
  isExpired: boolean;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending' | 'queued';

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  consultationFee: number;
  createdAt: string;
  queuedAt?: string; // set if created offline
  syncedAt?: string; // set after successful sync
}

export interface ConsultationFilters {
  specialty?: DoctorSpecialty;
  maxFee?: number;
  minRating?: number;
  availableToday?: boolean;
  language?: string;
}

// ─── Shop Types ───────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'Oils'
  | 'Herbs'
  | 'Supplements'
  | 'Skincare'
  | 'Haircare'
  | 'Immunity'
  | 'Digestive'
  | 'Joint Care'
  | 'Stress Relief'
  | 'Weight Management';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // INR
  originalPrice: number;
  discount: number; // percentage
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  ingredients: string[];
  tags: string[];
  inStock: boolean;
  quantity: number; // available stock
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

export interface Wishlist {
  productIds: Set<string>;
  updatedAt: string;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'name_asc'
  | 'newest';

export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  tags?: string[];
  sortBy?: SortOption;
}

// ─── Health Record Types ──────────────────────────────────────────────────────

export type RecordType =
  | 'lab_report'
  | 'prescription'
  | 'consultation'
  | 'vaccination'
  | 'allergy';

export interface Attachment {
  id: string;
  type: 'image' | 'pdf';
  url: string;
  fileName: string;
  thumbnailUrl?: string;
}

export interface HealthRecord {
  id: string;
  type: RecordType;
  title: string;
  date: string; // ISO date
  doctorName?: string;
  hospitalName?: string;
  description: string;
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
}

export interface HealthRecordFilters {
  type?: RecordType;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface HealthRecordGroup {
  monthYear: string; // "August 2026"
  sortKey: string;   // "2026-08"
  records: HealthRecord[];
}

// ─── Offline Queue Types ──────────────────────────────────────────────────────

export type OfflineOperationType = 'CREATE_BOOKING' | 'CANCEL_BOOKING';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  payload: unknown;
  createdAt: string;
  retryCount: number;
  lastRetryAt?: string;
  error?: string;
}

// ─── App / UI Types ───────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';

export interface ToastConfig {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface FeatureFlags {
  deepLinking: boolean;
  localization: boolean;
  performanceMonitoring: boolean;
  biometricAuth: boolean;
  crashReporting: boolean;
  backgroundSync: boolean;
}
