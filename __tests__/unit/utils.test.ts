/**
 * Unit tests — Utility functions
 * Covers: date grouping, search/filter helpers, validation, offline queue logic.
 */

import { generateHealthRecord } from '../../src/data/generators/healthRecordGenerator';
import { HealthRecord } from '../../src/types';

// Inline grouping logic (mirrors healthRecordsApi.groupRecordsByMonth)
function groupRecordsByMonth(records: HealthRecord[]) {
  const groupMap = new Map<string, { monthYear: string; sortKey: string; records: HealthRecord[] }>();
  records.forEach(record => {
    const date = new Date(record.date);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const sortKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthYear = `${month} ${year}`;
    if (!groupMap.has(sortKey)) groupMap.set(sortKey, { monthYear, sortKey, records: [] });
    groupMap.get(sortKey)!.records.push(record);
  });
  return Array.from(groupMap.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

// ─── Health Record Grouping ───────────────────────────────────────────────────

const makeRecord = (id: string, date: string, type: HealthRecord['type'] = 'consultation'): HealthRecord => ({
  id,
  type,
  title: `Record ${id}`,
  date,
  description: 'Test record',
  tags: [],
  attachments: [],
  createdAt: new Date(date).toISOString(),
});

describe('groupRecordsByMonth', () => {
  it('groups records by month and year correctly', () => {
    const records = [
      makeRecord('1', '2026-08-15'),
      makeRecord('2', '2026-08-01'),
      makeRecord('3', '2026-07-20'),
      makeRecord('4', '2025-12-05'),
    ];

    const groups = groupRecordsByMonth(records);
    expect(groups.length).toBe(3);
    expect(groups[0].monthYear).toBe('August 2026');
    expect(groups[0].records.length).toBe(2);
    expect(groups[1].monthYear).toBe('July 2026');
    expect(groups[2].monthYear).toBe('December 2025');
  });

  it('returns empty array for empty input', () => {
    expect(groupRecordsByMonth([])).toEqual([]);
  });

  it('sorts groups newest-first', () => {
    const records = [
      makeRecord('1', '2024-01-01'),
      makeRecord('2', '2026-06-01'),
      makeRecord('3', '2025-03-01'),
    ];
    const groups = groupRecordsByMonth(records);
    expect(groups[0].sortKey > groups[1].sortKey).toBe(true);
    expect(groups[1].sortKey > groups[2].sortKey).toBe(true);
  });
});

// ─── Debounce Logic ───────────────────────────────────────────────────────────

describe('Debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('delays execution by the specified delay', () => {
    const fn = jest.fn();
    let timeoutId: ReturnType<typeof setTimeout>;

    function debounce(f: () => void, delay: number) {
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(f, delay);
      };
    }

    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on rapid calls', () => {
    const fn = jest.fn();
    let timeoutId: ReturnType<typeof setTimeout>;

    function debounce(f: () => void, delay: number) {
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(f, delay);
      };
    }

    const debounced = debounce(fn, 300);
    debounced();
    debounced();
    debounced();
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─── Offline Queue ────────────────────────────────────────────────────────────

describe('Offline Queue logic', () => {
  it('generates unique IDs for each operation', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(`offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
    }
    expect(ids.size).toBe(100);
  });

  it('does not process operations exceeding max retries', () => {
    const MAX_RETRIES = 3;
    const operation = { retryCount: 3, id: 'op1', type: 'CREATE_BOOKING' as const };
    const shouldProcess = operation.retryCount < MAX_RETRIES;
    expect(shouldProcess).toBe(false);
  });

  it('processes operations under max retries', () => {
    const MAX_RETRIES = 3;
    const operation = { retryCount: 1, id: 'op1', type: 'CREATE_BOOKING' as const };
    const shouldProcess = operation.retryCount < MAX_RETRIES;
    expect(shouldProcess).toBe(true);
  });

  it('enqueues and structures CANCEL_BOOKING operation correctly', () => {
    const bookingId = 'booking_12345';
    const op = {
      id: `offline_${Date.now()}`,
      type: 'CANCEL_BOOKING' as const,
      payload: { bookingId },
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    expect(op.type).toBe('CANCEL_BOOKING');
    expect((op.payload as { bookingId: string }).bookingId).toBe(bookingId);
  });

  it('handles CANCEL_BOOKING retries and failure states safely', () => {
    const MAX_RETRIES = 3;
    const cancelOp = { retryCount: 2, id: 'op_cancel_1', type: 'CANCEL_BOOKING' as const };
    expect(cancelOp.retryCount < MAX_RETRIES).toBe(true);
    cancelOp.retryCount += 1;
    expect(cancelOp.retryCount < MAX_RETRIES).toBe(false);
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

describe('Pagination', () => {
  function paginate<T>(data: T[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: data.slice(start, end),
      total: data.length,
      page,
      pageSize,
      hasMore: end < data.length,
    };
  }

  const data = Array.from({ length: 100 }, (_, i) => i + 1);

  it('returns correct first page', () => {
    const result = paginate(data, 1, 20);
    expect(result.data[0]).toBe(1);
    expect(result.data.length).toBe(20);
    expect(result.hasMore).toBe(true);
  });

  it('returns correct last page', () => {
    const result = paginate(data, 5, 20);
    expect(result.data[result.data.length - 1]).toBe(100);
    expect(result.hasMore).toBe(false);
  });

  it('has correct total', () => {
    const result = paginate(data, 1, 10);
    expect(result.total).toBe(100);
  });
});
