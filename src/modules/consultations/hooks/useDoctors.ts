/**
 * useDoctors — paginated, searchable, filterable doctor list with offline caching.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Doctor, ConsultationFilters, PaginatedResponse } from '../../../types';
import { consultationApi } from '../../../services/api/consultationApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { ENV } from '../../../config/env';
import { Logger } from '../../../services/logger';
import { storage } from '../../../services/storage';
import { STORAGE_KEYS } from '../../../constants';
import { useAppStore } from '../../../store/app/appStore';

const TAG = 'useDoctors';

interface UseDoctorsReturn {
  doctors: Doctor[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  searchQuery: string;
  filters: ConsultationFilters;
  setSearchQuery: (q: string) => void;
  setFilters: (f: ConsultationFilters) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useDoctors(): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ConsultationFilters>({});
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, ENV.SEARCH_DEBOUNCE_MS);
  const isOnline = useAppStore(state => state.isOnline);
  const loadingRef = useRef(false);

  const fetchDoctors = useCallback(async (
    targetPage: number,
    search: string,
    currentFilters: ConsultationFilters,
    append: boolean
  ) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      if (!isOnline) {
        // Load from cache
        const cached = await storage.get<Doctor[]>(STORAGE_KEYS.CACHED_DOCTORS);
        if (cached && cached.length > 0) {
          setDoctors(cached.slice(0, ENV.PAGE_SIZE_DOCTORS));
          setHasMore(false);
        } else {
          setError('You are offline and no cached data is available.');
        }
        return;
      }

      const result = await consultationApi.getDoctors(targetPage, search, currentFilters);

      if (result.success) {
        const response: PaginatedResponse<Doctor> = result.data;
        setDoctors(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.hasMore);
        setPage(targetPage);

        // Cache first page for offline use
        if (targetPage === 1 && !search) {
          storage.set(STORAGE_KEYS.CACHED_DOCTORS, response.data).catch(() => {});
        }
      } else {
        Logger.error(TAG, 'Failed to fetch doctors', result.error);
        setError(result.error.message);
        // Fallback to cache
        const cached = await storage.get<Doctor[]>(STORAGE_KEYS.CACHED_DOCTORS);
        if (cached && !append) setDoctors(cached.slice(0, ENV.PAGE_SIZE_DOCTORS));
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [isOnline]);

  // Re-fetch on search/filter change
  useEffect(() => {
    fetchDoctors(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchDoctors]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    fetchDoctors(page + 1, debouncedSearch, filters, true);
  }, [hasMore, isLoadingMore, isLoading, page, debouncedSearch, filters, fetchDoctors]);

  const refresh = useCallback(() => {
    fetchDoctors(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchDoctors]);

  return {
    doctors,
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
