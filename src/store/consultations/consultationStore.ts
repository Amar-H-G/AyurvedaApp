/**
 * Consultation Store — bookings, upcoming consultations, offline queue state.
 */
import { create } from 'zustand';
import { Booking, BookingStatus, OfflineOperation } from '../../types';
import { storage } from '../../services/storage';
import { STORAGE_KEYS } from '../../constants';
import { Logger } from '../../services/logger';

const TAG = 'ConsultationStore';

interface ConsultationState {
  bookings: Booking[];
  offlineOperations: OfflineOperation[];
  isLoaded: boolean;

  // Actions
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setOfflineOperations: (ops: OfflineOperation[]) => void;
  addOfflineOperation: (op: OfflineOperation) => void;
  removeOfflineOperation: (opId: string) => void;
  loadFromStorage: () => Promise<void>;

  // Selectors
  getUpcomingBookings: () => Booking[];
  hasConflict: (doctorId: string, slotId: string) => boolean;
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  bookings: [],
  offlineOperations: [],
  isLoaded: false,

  addBooking: (booking) => {
    set(state => {
      const bookings = [...state.bookings, booking];
      storage.set(STORAGE_KEYS.BOOKINGS, bookings).catch(() => {});
      return { bookings };
    });
    Logger.info(TAG, `Booking added: ${booking.id}`);
  },

  cancelBooking: (bookingId) => {
    set(state => {
      const bookings = state.bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
      );
      storage.set(STORAGE_KEYS.BOOKINGS, bookings).catch(() => {});
      return { bookings };
    });
    Logger.info(TAG, `Booking cancelled: ${bookingId}`);
  },

  updateBookingStatus: (bookingId, status) => {
    set(state => {
      const bookings = state.bookings.map(b =>
        b.id === bookingId ? { ...b, status } : b
      );
      storage.set(STORAGE_KEYS.BOOKINGS, bookings).catch(() => {});
      return { bookings };
    });
  },

  setOfflineOperations: (ops) => {
    set({ offlineOperations: ops });
  },

  addOfflineOperation: (op) => {
    set(state => ({ offlineOperations: [...state.offlineOperations, op] }));
  },

  removeOfflineOperation: (opId) => {
    set(state => ({
      offlineOperations: state.offlineOperations.filter(op => op.id !== opId),
    }));
  },

  loadFromStorage: async () => {
    const [bookings, operations] = await Promise.all([
      storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS),
      storage.get<OfflineOperation[]>(STORAGE_KEYS.OFFLINE_QUEUE),
    ]);
    set({
      bookings: bookings ?? [],
      offlineOperations: operations ?? [],
      isLoaded: true,
    });
    Logger.debug(TAG, `Loaded ${bookings?.length ?? 0} bookings from storage`);
  },

  getUpcomingBookings: () => {
    const now = new Date();
    return get().bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const bookingDate = new Date(`${b.date}T${b.startTime}:00`);
      return bookingDate >= now;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}:00`);
      const dateB = new Date(`${b.date}T${b.startTime}:00`);
      return dateA.getTime() - dateB.getTime();
    });
  },

  hasConflict: (doctorId, slotId) => {
    const { bookings } = get();
    return bookings.some(
      b => b.doctorId === doctorId &&
           b.slotId === slotId &&
           b.status !== 'cancelled'
    );
  },
}));
