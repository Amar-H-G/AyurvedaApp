/**
 * Health Records API — repository layer.
 */
import { mockRequest, paginate, ApiResult } from './mockApiClient';
import { HealthRecord, HealthRecordFilters, HealthRecordGroup, PaginatedResponse } from '../../types';
import { generateHealthRecords } from '../../data/generators/healthRecordGenerator';
import { ENV } from '../../config/env';
import { format, parseISO } from 'date-fns';

const ALL_RECORDS = generateHealthRecords(10000);

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

  if (filters.type) result = result.filter(r => r.type === filters.type);

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(r => filters.tags!.some(t => r.tags.includes(t)));
  }

  if (filters.startDate) {
    result = result.filter(r => r.date >= filters.startDate!);
  }

  if (filters.endDate) {
    result = result.filter(r => r.date <= filters.endDate!);
  }

  // Sort by date descending (newest first)
  result = [...result].sort((a, b) => b.date.localeCompare(a.date));

  return result;
}

export function groupRecordsByMonth(records: HealthRecord[]): HealthRecordGroup[] {
  const groupMap = new Map<string, HealthRecordGroup>();

  records.forEach(record => {
    const dateObj = parseISO(record.date);
    const sortKey = format(dateObj, 'yyyy-MM');
    const monthYear = format(dateObj, 'MMMM yyyy');

    if (!groupMap.has(sortKey)) {
      groupMap.set(sortKey, { monthYear, sortKey, records: [] });
    }
    groupMap.get(sortKey)!.records.push(record);
  });

  return Array.from(groupMap.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export const healthRecordsApi = {
  async getRecords(
    page: number,
    filters: HealthRecordFilters = {}
  ): Promise<ApiResult<PaginatedResponse<HealthRecord>>> {
    return mockRequest(() => {
      const filtered = applyFilters(ALL_RECORDS, filters);
      return paginate(filtered, page, ENV.PAGE_SIZE_RECORDS);
    });
  },

  async getRecordById(id: string): Promise<ApiResult<HealthRecord>> {
    return mockRequest(() => ALL_RECORDS.find(r => r.id === id) ?? null);
  },

  async getGroupedRecords(filters: HealthRecordFilters = {}): Promise<ApiResult<HealthRecordGroup[]>> {
    return mockRequest(() => {
      const filtered = applyFilters(ALL_RECORDS, filters);
      return groupRecordsByMonth(filtered);
    });
  },
};
