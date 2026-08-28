/**
 * useHealthRecords — infinite scroll health records hook.
 * Aligned 1:1 with useDoctors.ts data fetching and lifecycle logic.
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { HealthRecord, HealthRecordFilters, HealthRecordGroup, PaginatedResponse } from '../../../types';
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
  records: HealthRecord[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  searchQuery: string;
  filters: HealthRecordFilters;
  setSearchQuery: (q: string) => void;
  setFilters: (f: HealthRecordFilters) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useHealthRecords(): UseHealthRecordsReturn {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<HealthRecordFilters>({});
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, ENV.SEARCH_DEBOUNCE_MS);
  const isOnline = useAppStore(state => state.isOnline);
  const loadingRef = useRef(false);

  const groups = useMemo(() => {
    return groupRecordsByMonth(records);
  }, [records]);

  const fetchRecords = useCallback(async (
    targetPage: number,
    search: string,
    currentFilters: HealthRecordFilters,
    append: boolean
  ) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    const effectiveFilters: HealthRecordFilters = {
      ...currentFilters,
      searchQuery: search || undefined,
    };

    try {
      if (!isOnline) {
        const cached = await storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS);
        if (cached && cached.length > 0) {
          setRecords(cached.slice(0, ENV.PAGE_SIZE_RECORDS));
          setHasMore(false);
        } else {
          setError('You are offline and no cached health records are available.');
        }
        return;
      }

      const result = await healthRecordsApi.getRecords(targetPage, effectiveFilters);

      if (result.success) {
        const response: PaginatedResponse<HealthRecord> = result.data;
        setRecords(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.hasMore);
        setPage(targetPage);

        if (targetPage === 1 && !search) {
          storage.set(STORAGE_KEYS.CACHED_RECORDS, response.data).catch(() => {});
        }
      } else {
        Logger.error(TAG, 'Failed to fetch health records', result.error);
        setError(result.error.message);
        const cached = await storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS);
        if (cached && !append) setRecords(cached.slice(0, ENV.PAGE_SIZE_RECORDS));
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS).then(cached => {
      if (cached && cached.length > 0) {
        setRecords(prev => prev.length === 0 ? cached.slice(0, ENV.PAGE_SIZE_RECORDS) : prev);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchRecords(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchRecords]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    fetchRecords(page + 1, debouncedSearch, filters, true);
  }, [hasMore, isLoadingMore, isLoading, page, debouncedSearch, filters, fetchRecords]);

  const refresh = useCallback(() => {
    fetchRecords(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchRecords]);

  return {
    groups,
    records,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    loadMore,
    refresh,
  };
}
