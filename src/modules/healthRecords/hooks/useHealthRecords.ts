/**
 * useHealthRecords — paginated timeline with grouping, search, filter.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { HealthRecord, HealthRecordFilters, HealthRecordGroup } from '../../../types';
import { healthRecordsApi, groupRecordsByMonth } from '../../../services/api/healthRecordsApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { ENV } from '../../../config/env';
import { Logger } from '../../../services/logger';
import { useAppStore } from '../../../store/app/appStore';
import { storage } from '../../../services/storage';
import { STORAGE_KEYS } from '../../../constants';

const TAG = 'useHealthRecords';

interface UseHealthRecordsReturn {
  groups: HealthRecordGroup[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: HealthRecordFilters;
  setSearchQuery: (q: string) => void;
  setFilters: (f: HealthRecordFilters) => void;
  refresh: () => void;
}

export function useHealthRecords(): UseHealthRecordsReturn {
  const [groups, setGroups] = useState<HealthRecordGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<HealthRecordFilters>({});

  const debouncedSearch = useDebounce(searchQuery, ENV.SEARCH_DEBOUNCE_MS);
  const isOnline = useAppStore(state => state.isOnline);
  const loadingRef = useRef(false);

  const fetchRecords = useCallback(async (
    search: string,
    currentFilters: HealthRecordFilters
  ) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    const effectiveFilters: HealthRecordFilters = {
      ...currentFilters,
      searchQuery: search || undefined,
    };

    try {
      if (!isOnline) {
        const cached = await storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS);
        if (cached && cached.length > 0) {
          // Simple offline grouping
          setGroups(groupRecordsByMonth(cached.slice(0, ENV.PAGE_SIZE_RECORDS)));
        } else {
          setError('You are offline and no cached data is available.');
        }
        return;
      }

      const result = await healthRecordsApi.getGroupedRecords(effectiveFilters);

      if (result.success) {
        setGroups(result.data);
        if (!search) {
          // Cache flat records for offline
          const flat = result.data.flatMap(g => g.records);
          storage.set(STORAGE_KEYS.CACHED_RECORDS, flat.slice(0, 200)).catch(() => {});
        }
      } else {
        Logger.error(TAG, 'Failed to fetch health records', result.error);
        setError(result.error.message);
        const cached = await storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS);
        if (cached) {
          setGroups(groupRecordsByMonth(cached));
        }
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    fetchRecords(debouncedSearch, filters);
  }, [debouncedSearch, filters, fetchRecords]);

  const refresh = useCallback(() => {
    fetchRecords(debouncedSearch, filters);
  }, [debouncedSearch, filters, fetchRecords]);

  return {
    groups,
    isLoading,
    error,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    refresh,
  };
}
