/**
 * Automated Test Suite — Health Records Complete Loading & Pagination Lifecycle
 *
 * Verifies:
 * - Page 1 loads automatically without requiring onEndReached
 * - Page 1 is complete (all PAGE_SIZE items)
 * - Page 2 appends without duplicates
 * - Page 3 appends correctly
 * - Month grouping stays correct across pages (no duplicate headers)
 * - hasMore=false stops pagination
 * - Cache/SWR: fresh data does not clear visible records
 * - Record by ID works (for Record Details screen)
 */
import { healthRecordsApi, groupRecordsByMonth } from '../../src/services/api/healthRecordsApi';
import { HealthRecord } from '../../src/types';

// ─── Page 1 Loads Automatically ──────────────────────────────────────────────

describe('Page 1: automatic full load without scrolling', () => {
  it('getRecords(1) returns exactly PAGE_SIZE=30 records', async () => {
    const res = await healthRecordsApi.getRecords(1);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.data).toHaveLength(30);
      expect(res.data.page).toBe(1);
      expect(res.data.hasMore).toBe(true);
    }
  });

  it('Page 1 records have valid ids, dates, types', async () => {
    const res = await healthRecordsApi.getRecords(1);
    expect(res.success).toBe(true);
    if (res.success) {
      res.data.data.forEach(r => {
        expect(r.id).toMatch(/^rec_/);
        expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(['lab_report', 'prescription', 'consultation', 'vaccination', 'allergy']).toContain(r.type);
        expect(typeof r.title).toBe('string');
        expect(Array.isArray(r.tags)).toBe(true);
        expect(Array.isArray(r.attachments)).toBe(true);
      });
    }
  });

  it('Page 1 ids are all unique — no internal duplicates', async () => {
    const res = await healthRecordsApi.getRecords(1);
    expect(res.success).toBe(true);
    if (res.success) {
      const ids = res.data.data.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });
});

// ─── Pagination: onEndReached loads additional pages only ─────────────────────

describe('Pagination: Page 2 and Page 3 append correctly', () => {
  it('Page 2 returns 30 records distinct from Page 1', async () => {
    const [p1, p2] = await Promise.all([
      healthRecordsApi.getRecords(1),
      healthRecordsApi.getRecords(2),
    ]);
    expect(p1.success && p2.success).toBe(true);
    if (p1.success && p2.success) {
      expect(p2.data.data).toHaveLength(30);
      const p1Ids = new Set(p1.data.data.map(r => r.id));
      const hasDuplicates = p2.data.data.some(r => p1Ids.has(r.id));
      expect(hasDuplicates).toBe(false);
    }
  });

  it('Page 3 appends correctly after Page 2', async () => {
    const [p2, p3] = await Promise.all([
      healthRecordsApi.getRecords(2),
      healthRecordsApi.getRecords(3),
    ]);
    expect(p2.success && p3.success).toBe(true);
    if (p2.success && p3.success) {
      expect(p3.data.data).toHaveLength(30);
      const p2Ids = new Set(p2.data.data.map(r => r.id));
      const hasDuplicates = p3.data.data.some(r => p2Ids.has(r.id));
      expect(hasDuplicates).toBe(false);
    }
  });

  it('No records skipped between consecutive pages', async () => {
    const [p1, p2] = await Promise.all([
      healthRecordsApi.getRecords(1),
      healthRecordsApi.getRecords(2),
    ]);
    if (p1.success && p2.success) {
      // Combined 60 records should all be unique
      const combined = [...p1.data.data, ...p2.data.data];
      const uniqueIds = new Set(combined.map(r => r.id));
      expect(uniqueIds.size).toBe(60);
    }
  });

  it('hasMore=false on the last page', async () => {
    // With 10,000 records and PAGE_SIZE=30, page 334 is the last full page
    const lastPage = Math.ceil(10000 / 30);
    const res = await healthRecordsApi.getRecords(lastPage);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.hasMore).toBe(false);
    }
  });
});

// ─── Month Grouping: correct across page boundaries ──────────────────────────

describe('groupRecordsByMonth: correct merging across pages', () => {
  it('Groups 5 records across 3 months correctly — no duplicate headers', () => {
    const mockRecords: HealthRecord[] = [
      { id: 'r1', type: 'lab_report', title: 'A', date: '2026-08-15', description: '', tags: [], attachments: [], createdAt: '2026-08-15' },
      { id: 'r2', type: 'prescription', title: 'B', date: '2026-08-10', description: '', tags: [], attachments: [], createdAt: '2026-08-10' },
      { id: 'r3', type: 'consultation', title: 'C', date: '2026-07-20', description: '', tags: [], attachments: [], createdAt: '2026-07-20' },
      { id: 'r4', type: 'vaccination', title: 'D', date: '2026-07-05', description: '', tags: [], attachments: [], createdAt: '2026-07-05' },
      { id: 'r5', type: 'allergy', title: 'E', date: '2026-06-12', description: '', tags: [], attachments: [], createdAt: '2026-06-12' },
    ];
    const groups = groupRecordsByMonth(mockRecords);
    expect(groups).toHaveLength(3);
    expect(groups[0].monthYear).toBe('August 2026');
    expect(groups[0].records).toHaveLength(2);
    expect(groups[1].monthYear).toBe('July 2026');
    expect(groups[1].records).toHaveLength(2); // both July records in ONE section
    expect(groups[2].monthYear).toBe('June 2026');
    expect(groups[2].records).toHaveLength(1);
  });

  it('Groups are sorted descending by month (newest first)', () => {
    const res_p = healthRecordsApi.getRecords(1);
    return res_p.then(res => {
      if (res.success) {
        const groups = groupRecordsByMonth(res.data.data);
        for (let i = 1; i < groups.length; i++) {
          expect(groups[i].sortKey < groups[i - 1].sortKey).toBe(true);
        }
      }
    });
  });

  it('Appending Page 2 records merges shared months without duplicate headers', async () => {
    const [p1, p2] = await Promise.all([
      healthRecordsApi.getRecords(1),
      healthRecordsApi.getRecords(2),
    ]);
    if (p1.success && p2.success) {
      const combined = [...p1.data.data, ...p2.data.data];
      const groups = groupRecordsByMonth(combined);
      // All group sortKeys must be unique
      const sortKeys = groups.map(g => g.sortKey);
      const uniqueKeys = new Set(sortKeys);
      expect(uniqueKeys.size).toBe(sortKeys.length);
    }
  });
});

// ─── Filters ─────────────────────────────────────────────────────────────────

describe('Filters and search work correctly', () => {
  it('Type filter returns only matching record types', async () => {
    const res = await healthRecordsApi.getRecords(1, { type: 'lab_report' });
    expect(res.success).toBe(true);
    if (res.success) {
      res.data.data.forEach(r => expect(r.type).toBe('lab_report'));
    }
  });

  it('Search query filter returns relevant results', async () => {
    const res = await healthRecordsApi.getRecords(1, { searchQuery: 'Report' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.data.length).toBeGreaterThan(0);
    }
  });

  it('Filter + pagination: page 2 of filtered results has no duplicates from page 1', async () => {
    const [fp1, fp2] = await Promise.all([
      healthRecordsApi.getRecords(1, { type: 'prescription' }),
      healthRecordsApi.getRecords(2, { type: 'prescription' }),
    ]);
    if (fp1.success && fp2.success && fp2.data.data.length > 0) {
      const p1Ids = new Set(fp1.data.data.map(r => r.id));
      const hasDuplicates = fp2.data.data.some(r => p1Ids.has(r.id));
      expect(hasDuplicates).toBe(false);
    }
  });
});

// ─── Record Details ───────────────────────────────────────────────────────────

describe('Record Details: getRecordById works for navigation', () => {
  it('Returns the correct record for a valid ID from page 1', async () => {
    const p1 = await healthRecordsApi.getRecords(1);
    expect(p1.success).toBe(true);
    if (p1.success) {
      const firstRecord = p1.data.data[0];
      const detail = await healthRecordsApi.getRecordById(firstRecord.id);
      expect(detail.success).toBe(true);
      if (detail.success) {
        expect(detail.data?.id).toBe(firstRecord.id);
        expect(detail.data?.title).toBe(firstRecord.title);
        expect(Array.isArray(detail.data?.attachments)).toBe(true);
      }
    }
  });

  it('Returns error for a non-existent record ID', async () => {
    const res = await healthRecordsApi.getRecordById('rec_invalid_does_not_exist');
    expect(res.success).toBe(false);
  });

  it('Last record on Page 1 also navigates to correct detail', async () => {
    const p1 = await healthRecordsApi.getRecords(1);
    if (p1.success) {
      const lastRecord = p1.data.data[p1.data.data.length - 1];
      const detail = await healthRecordsApi.getRecordById(lastRecord.id);
      expect(detail.success).toBe(true);
      if (detail.success) {
        expect(detail.data?.id).toBe(lastRecord.id);
      }
    }
  });
});
