/**
 * useBooking — handles slot booking, conflict detection, offline queuing.
 */
import { useState, useCallback } from 'react';
import { Booking, TimeSlot } from '../../../types';
import { consultationApi } from '../../../services/api/consultationApi';
import { useConsultationStore } from '../../../store/consultations/consultationStore';
import { offlineQueue } from '../../../services/offline/offlineQueue';
import { useAppStore } from '../../../store/app/appStore';
import { Logger } from '../../../services/logger';

const TAG = 'useBooking';

interface UseBookingReturn {
  isBooking: boolean;
  bookingError: string | null;
  book: (doctor: { id: string; name: string; consultationFee: number }, slot: TimeSlot) => Promise<boolean>;
  cancel: (bookingId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useBooking(): UseBookingReturn {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { addBooking, cancelBooking, addOfflineOperation, hasConflict } = useConsultationStore();
  const { isOnline, showToast } = useAppStore();

  const book = useCallback(async (
    doctor: { id: string; name: string; consultationFee: number },
    slot: TimeSlot
  ): Promise<boolean> => {
    setBookingError(null);

    // Edge case: slot already expired
    if (slot.isExpired) {
      setBookingError('This slot has already expired. Please choose another slot.');
      return false;
    }

    // Edge case: slot already booked
    if (slot.isBooked) {
      setBookingError('This slot is no longer available. Please choose another slot.');
      return false;
    }

    // Edge case: double booking (same doctor, same slot)
    if (hasConflict(doctor.id, slot.id)) {
      setBookingError('You have already booked this slot.');
      return false;
    }

    setIsBooking(true);

    const bookingPayload: Omit<Booking, 'id' | 'createdAt'> = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      slotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: isOnline ? 'confirmed' : 'queued',
      consultationFee: doctor.consultationFee,
    };

    try {
      if (!isOnline) {
        // Queue for later sync
        const op = await offlineQueue.enqueue('CREATE_BOOKING', bookingPayload);
        addOfflineOperation(op);

        const offlineBooking: Booking = {
          ...bookingPayload,
          id: `local_${Date.now()}`,
          createdAt: new Date().toISOString(),
          queuedAt: new Date().toISOString(),
          status: 'queued',
        };
        addBooking(offlineBooking);

        showToast({
          type: 'info',
          message: 'You are offline. Booking queued and will sync when connected.',
        });
        Logger.info(TAG, 'Booking queued (offline)');
        return true;
      }

      const result = await consultationApi.createBooking(bookingPayload);

      if (result.success) {
        addBooking(result.data);
        showToast({ type: 'success', message: 'Consultation booked successfully!' });
        Logger.info(TAG, `Booking confirmed: ${result.data.id}`);
        return true;
      } else {
        setBookingError(result.error.message);
        Logger.error(TAG, 'Booking failed', result.error);
        return false;
      }
    } catch (err) {
      setBookingError('An unexpected error occurred. Please try again.');
      Logger.error(TAG, 'Booking exception', err);
      return false;
    } finally {
      setIsBooking(false);
    }
  }, [isOnline, addBooking, addOfflineOperation, hasConflict, showToast]);

  const cancel = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsBooking(true);
    try {
      if (!isOnline) {
        cancelBooking(bookingId);
        const op = await offlineQueue.enqueue('CANCEL_BOOKING', { bookingId });
        addOfflineOperation(op);
        showToast({ type: 'info', message: 'Cancellation queued and will sync when connected.' });
        return true;
      }

      const result = await consultationApi.cancelBooking(bookingId);
      if (result.success) {
        cancelBooking(bookingId);
        showToast({ type: 'success', message: 'Booking cancelled successfully.' });
        return true;
      } else {
        setBookingError(result.error.message);
        return false;
      }
    } catch (err) {
      setBookingError('Failed to cancel booking. Please try again.');
      return false;
    } finally {
      setIsBooking(false);
    }
  }, [isOnline, cancelBooking, addOfflineOperation, showToast]);

  return {
    isBooking,
    bookingError,
    book,
    cancel,
    clearError: () => setBookingError(null),
  };
}
