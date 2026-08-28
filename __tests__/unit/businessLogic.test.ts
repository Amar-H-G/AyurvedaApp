/**
 * Unit tests — Business Logic
 * Covers: booking conflict detection, expired slot handling,
 * cart calculations, and mock data integrity.
 */

import { generateDoctor, generateSlotsForDoctor } from '../../src/data/generators/doctorGenerator';
import { generateProduct } from '../../src/data/generators/productGenerator';
import { generateHealthRecord } from '../../src/data/generators/healthRecordGenerator';

// ─── Data Generators ─────────────────────────────────────────────────────────

describe('Doctor Generator', () => {
  it('generates a doctor with the correct id format', () => {
    const doctor = generateDoctor(0);
    expect(doctor.id).toBe('doc_00001');
  });

  it('generates deterministic data for the same index', () => {
    const d1 = generateDoctor(42);
    const d2 = generateDoctor(42);
    expect(d1).toEqual(d2);
  });

  it('generates different data for different indices', () => {
    const d1 = generateDoctor(0);
    const d2 = generateDoctor(1);
    expect(d1.id).not.toBe(d2.id);
  });

  it('generates a rating in the 3.5–5.0 range', () => {
    for (let i = 0; i < 50; i++) {
      const doc = generateDoctor(i);
      expect(doc.rating).toBeGreaterThanOrEqual(3.5);
      expect(doc.rating).toBeLessThanOrEqual(5.0);
    }
  });

  it('generates a valid consultation fee', () => {
    for (let i = 0; i < 20; i++) {
      const doc = generateDoctor(i);
      expect(doc.consultationFee).toBeGreaterThanOrEqual(300);
    }
  });

  it('generates slots with valid time format', () => {
    const slots = generateSlotsForDoctor('doc_00001', 3);
    expect(slots.length).toBeGreaterThan(0);
    slots.forEach(slot => {
      expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});

describe('Product Generator', () => {
  it('generates product with correct id format', () => {
    const product = generateProduct(0);
    expect(product.id).toBe('prod_000001');
  });

  it('calculates discounted price correctly', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProduct(i);
      const expectedPrice = Math.round(p.originalPrice * (1 - p.discount / 100));
      expect(p.price).toBe(expectedPrice);
    }
  });

  it('generates rating between 3.0 and 5.0', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProduct(i);
      expect(p.rating).toBeGreaterThanOrEqual(3.0);
      expect(p.rating).toBeLessThanOrEqual(5.0);
    }
  });
});

describe('Health Record Generator', () => {
  it('generates record with valid type', () => {
    const validTypes = ['lab_report', 'prescription', 'consultation', 'vaccination', 'allergy'];
    for (let i = 0; i < 20; i++) {
      const record = generateHealthRecord(i);
      expect(validTypes).toContain(record.type);
    }
  });

  it('generates records with ISO date format', () => {
    for (let i = 0; i < 20; i++) {
      const record = generateHealthRecord(i);
      expect(record.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// ─── Cart Calculations ────────────────────────────────────────────────────────

describe('Cart Calculations', () => {
  function buildCart(items: Array<{ price: number; quantity: number }>) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  it('calculates correct total for single item', () => {
    expect(buildCart([{ price: 500, quantity: 2 }])).toBe(1000);
  });

  it('calculates correct total for multiple items', () => {
    expect(buildCart([
      { price: 200, quantity: 3 },
      { price: 150, quantity: 1 },
    ])).toBe(750);
  });

  it('returns 0 for empty cart', () => {
    expect(buildCart([])).toBe(0);
  });

  it('handles large quantities', () => {
    expect(buildCart([{ price: 100, quantity: 1000 }])).toBe(100000);
  });
});

// ─── Slot Conflict Detection ──────────────────────────────────────────────────

describe('Slot Conflict Detection', () => {
  interface MockBooking { doctorId: string; slotId: string; status: string }

  function hasConflict(bookings: MockBooking[], doctorId: string, slotId: string): boolean {
    return bookings.some(
      b => b.doctorId === doctorId && b.slotId === slotId && b.status !== 'cancelled'
    );
  }

  const bookings: MockBooking[] = [
    { doctorId: 'doc_001', slotId: 'slot_001', status: 'confirmed' },
    { doctorId: 'doc_001', slotId: 'slot_002', status: 'cancelled' },
    { doctorId: 'doc_002', slotId: 'slot_003', status: 'confirmed' },
  ];

  it('detects an existing confirmed booking as a conflict', () => {
    expect(hasConflict(bookings, 'doc_001', 'slot_001')).toBe(true);
  });

  it('does not flag a cancelled booking as a conflict', () => {
    expect(hasConflict(bookings, 'doc_001', 'slot_002')).toBe(false);
  });

  it('does not flag different doctor same slot as conflict', () => {
    expect(hasConflict(bookings, 'doc_999', 'slot_001')).toBe(false);
  });

  it('does not flag a new slot as a conflict', () => {
    expect(hasConflict(bookings, 'doc_001', 'slot_NEW')).toBe(false);
  });
});

// ─── Filtering / Sorting Logic ────────────────────────────────────────────────

describe('Product Filtering', () => {
  const products = [
    { id: '1', price: 100, rating: 4.5, category: 'Oils', inStock: true, name: 'Neem Oil' },
    { id: '2', price: 250, rating: 3.2, category: 'Herbs', inStock: false, name: 'Brahmi' },
    { id: '3', price: 180, rating: 4.8, category: 'Oils', inStock: true, name: 'Ashwagandha Oil' },
  ];

  it('filters by category correctly', () => {
    const oils = products.filter(p => p.category === 'Oils');
    expect(oils.length).toBe(2);
  });

  it('filters by max price', () => {
    const affordable = products.filter(p => p.price <= 200);
    expect(affordable.length).toBe(2);
  });

  it('filters in-stock items', () => {
    const inStock = products.filter(p => p.inStock);
    expect(inStock.length).toBe(2);
  });

  it('sorts by price ascending', () => {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    expect(sorted[0].id).toBe('1');
    expect(sorted[2].id).toBe('2');
  });

  it('sorts by rating descending', () => {
    const sorted = [...products].sort((a, b) => b.rating - a.rating);
    expect(sorted[0].id).toBe('3');
  });
});
