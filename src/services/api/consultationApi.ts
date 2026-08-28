/**
 * Consultation API — repository layer for the Consultations module.
 * UI → Consultation hooks → consultationApi (this file) → Mock client → Data
 */
import { mockRequest, paginate, ApiResult } from './mockApiClient';
import { Doctor, TimeSlot, Booking, ConsultationFilters, PaginatedResponse } from '../../types';
import { generateDoctors, generateSlotsForDoctor } from '../../data/generators/doctorGenerator';
import { ENV } from '../../config/env';

// Pre-generate dataset once (singleton pattern)
const ALL_DOCTORS = generateDoctors(5000);

function filterDoctors(doctors: Doctor[], filters: ConsultationFilters, search: string): Doctor[] {
  return doctors.filter(doc => {
    if (search) {
      const q = search.toLowerCase();
      if (!doc.name.toLowerCase().includes(q) &&
          !doc.specialty.toLowerCase().includes(q) &&
          !doc.location.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.specialty && doc.specialty !== filters.specialty) return false;
    if (filters.maxFee && doc.consultationFee > filters.maxFee) return false;
    if (filters.minRating && doc.rating < filters.minRating) return false;
    if (filters.availableToday && !doc.availableToday) return false;
    if (filters.language && !doc.languages.includes(filters.language)) return false;
    return true;
  });
}

export const consultationApi = {
  async getDoctors(
    page: number,
    search: string = '',
    filters: ConsultationFilters = {}
  ): Promise<ApiResult<PaginatedResponse<Doctor>>> {
    return mockRequest(() => {
      const filtered = filterDoctors(ALL_DOCTORS, filters, search);
      return paginate(filtered, page, ENV.PAGE_SIZE_DOCTORS);
    });
  },

  async getDoctorById(id: string): Promise<ApiResult<Doctor>> {
    return mockRequest(() => ALL_DOCTORS.find(d => d.id === id) ?? null);
  },

  async getSlots(doctorId: string): Promise<ApiResult<TimeSlot[]>> {
    return mockRequest(() => generateSlotsForDoctor(doctorId, 7));
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<ApiResult<Booking>> {
    return mockRequest(() => ({
      ...booking,
      id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    }));
  },

  async cancelBooking(bookingId: string): Promise<ApiResult<{ bookingId: string }>> {
    return mockRequest(() => ({ bookingId }));
  },
};
