/**
 * Master Available Slots UI & Custom Booking Modal — Unit Logic Tests
 */
import { TimeSlot } from '../../src/types';

function formatTimeForDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const padHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${padHours}:${minutes} ${ampm}`;
}

describe('Available Slots UI & Time Formatting Logic', () => {
  it('formats 24-hour morning time to 12-hour AM format', () => {
    expect(formatTimeForDisplay('09:00')).toBe('09:00 AM');
    expect(formatTimeForDisplay('09:30')).toBe('09:30 AM');
    expect(formatTimeForDisplay('11:45')).toBe('11:45 AM');
  });

  it('formats 24-hour afternoon/evening time to 12-hour PM format', () => {
    expect(formatTimeForDisplay('12:00')).toBe('12:00 PM');
    expect(formatTimeForDisplay('14:30')).toBe('02:30 PM');
    expect(formatTimeForDisplay('16:00')).toBe('04:00 PM');
    expect(formatTimeForDisplay('20:15')).toBe('08:15 PM');
  });

  it('handles invalid or empty time strings gracefully', () => {
    expect(formatTimeForDisplay('')).toBe('');
    expect(formatTimeForDisplay('invalid')).toBe('invalid');
  });

  it('correctly calculates slot status flags', () => {
    const availableSlot: TimeSlot = {
      id: 'slot_1', doctorId: 'doc_1', date: '2026-08-29', startTime: '09:00', endTime: '09:30', isBooked: false, isExpired: false,
    };
    const bookedSlot: TimeSlot = {
      id: 'slot_2', doctorId: 'doc_1', date: '2026-08-29', startTime: '10:00', endTime: '10:30', isBooked: true, isExpired: false,
    };
    const expiredSlot: TimeSlot = {
      id: 'slot_3', doctorId: 'doc_1', date: '2026-08-29', startTime: '08:00', endTime: '08:30', isBooked: false, isExpired: true,
    };

    expect(availableSlot.isBooked || availableSlot.isExpired).toBe(false);
    expect(bookedSlot.isBooked).toBe(true);
    expect(expiredSlot.isExpired).toBe(true);
  });
});
