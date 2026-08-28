/**
 * useHealthRecords — infinite scroll health records hook.
 * Mirrors the proven useProducts.ts data-loading pattern exactly.
 *
 * Key design decisions:
 * - isLoading starts as TRUE so skeleton shows on first render immediately
 * - cache hydration runs fire-and-forget before the API call
 * - loadingRef prevents duplicate concurrent requests
 * - all state updates after await are batched by React 18 automatically
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  // Start isLoading=true so skeleton renders immediately on mount.
  // This prevents the 1-frame flash of an empty SectionList before useEffect fires.
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
  // Single ref guards against any concurrent fetch regardless of callback identity
  const loadingRef = useRef(false);

  // Derive grouped month sections from accumulated records array.
  // groupRecordsByMonth is O(N) string-slicing — no date parsing.
  const groups = useMemo(() => {
    return groupRecordsByMonth(records);
  }, [records]);

  // Core fetch function — mirrors useProducts.fetchProducts exactly
  const fetchRecords = useCallback(async (
    targetPage: number,
    search: string,
    currentFilters: HealthRecordFilters,
    append: boolean
  ) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!append) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
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
        const response = result.data;
        // React 18 batches all these setStates into a single re-render
        setRecords(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.hasMore);
        setPage(targetPage);

        // Cache Page 1 for offline / instant next launch
        if (targetPage === 1 && !search) {
          storage.set(STORAGE_KEYS.CACHED_RECORDS, response.data).catch(() => {});
        }
      } else {
        Logger.error(TAG, 'Failed to fetch health records', result.error);
        setError(result.error.message);
        // Fall back to cache on error (only for initial load)
        if (!append) {
          const cached = await storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS);
          if (cached && cached.length > 0) {
            setRecords(cached.slice(0, ENV.PAGE_SIZE_RECORDS));
          }
        }
      }
    } finally {
      // Always clear loading flags so UI never gets stuck
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [isOnline]);

  // On mount: hydrate from disk cache BEFORE API call so the SectionList
  // can paint cached records while the fresh fetch is in flight.
  // This runs once and does not depend on filters/search.
  useEffect(() => {
    storage.get<HealthRecord[]>(STORAGE_KEYS.CACHED_RECORDS).then(cached => {
      if (cached && cached.length > 0) {
        // Only hydrate if no records yet (fresh mount, not a filter change)
        setRecords(prev => prev.length === 0 ? cached.slice(0, ENV.PAGE_SIZE_RECORDS) : prev);
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger page 1 fetch whenever search or filters change (same as useProducts)
  useEffect(() => {
    fetchRecords(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchRecords]);

  // Load additional pages — only called by SectionList onEndReached
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    fetchRecords(page + 1, debouncedSearch, filters, true);
  }, [hasMore, isLoadingMore, isLoading, page, debouncedSearch, filters, fetchRecords]);

  // Manual pull-to-refresh
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
