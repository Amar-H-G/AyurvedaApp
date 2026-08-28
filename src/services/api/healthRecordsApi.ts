/**
 * Health Records API — repository layer.
 * Lazy dataset initialization so top-level module load is 0ms.
 */
import { mockRequest, paginate, ApiResult } from './mockApiClient';
import { HealthRecord, HealthRecordFilters, HealthRecordGroup, PaginatedResponse } from '../../types';
import { generateHealthRecords } from '../../data/generators/healthRecordGenerator';
import { ENV } from '../../config/env';

let _recordsCache: HealthRecord[] | null = null;

/**
 * Lazy getter for 10,000 health records.
 * Built on demand in background, taking 0ms during top-level module import.
 */
function getAllRecords(): HealthRecord[] {
  if (!_recordsCache) {
    _recordsCache = generateHealthRecords(10000);
  }
  return _recordsCache;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function applyFilters(records: HealthRecord[], filters: HealthRecordFilters): HealthRecord[] {
  let result = records;

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      (r.doctorName?.toLowerCase().includes(q) ?? false)
    );
  }

  if (filters.type) {
    result = result.filter(r => r.type === filters.type);
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(r => filters.tags!.some(t => r.tags.includes(t)));
  }

  if (filters.startDate) {
    result = result.filter(r => r.date >= filters.startDate!);
  }

  if (filters.endDate) {
    result = result.filter(r => r.date <= filters.endDate!);
  }

  return result;
}

export function groupRecordsByMonth(records: HealthRecord[]): HealthRecordGroup[] {
  const groupMap = new Map<string, HealthRecordGroup>();

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const sortKey = record.date.substring(0, 7);
    let group = groupMap.get(sortKey);

    if (!group) {
      const [yearStr, monthStr] = sortKey.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const monthYear = `${MONTH_NAMES[monthIdx]} ${yearStr}`;
      group = { monthYear, sortKey, records: [] };
      groupMap.set(sortKey, group);
    }
    group.records.push(record);
  }

  return Array.from(groupMap.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export const healthRecordsApi = {
  async getRecords(
    page: number,
    filters: HealthRecordFilters = {}
  ): Promise<ApiResult<PaginatedResponse<HealthRecord>>> {
    return mockRequest(() => {
      const all = getAllRecords();
      const filtered = applyFilters(all, filters);
      return paginate(filtered, page, ENV.PAGE_SIZE_RECORDS);
    });
  },

  async getRecordById(id: string): Promise<ApiResult<HealthRecord>> {
    return mockRequest(() => {
      const all = getAllRecords();
      return all.find(r => r.id === id) ?? null;
    });
  },

  async getGroupedRecords(filters: HealthRecordFilters = {}): Promise<ApiResult<HealthRecordGroup[]>> {
    return mockRequest(() => {
      const all = getAllRecords();
      const filtered = applyFilters(all, filters);
      return groupRecordsByMonth(filtered);
    });
  },
};
