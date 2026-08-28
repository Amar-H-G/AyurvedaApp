/**
 * useProducts — infinite scroll product list with search, filter, sort.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Product, ProductFilters } from '../../../types';
import { shopApi } from '../../../services/api/shopApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { ENV } from '../../../config/env';
import { Logger } from '../../../services/logger';
import { useAppStore } from '../../../store/app/appStore';
import { storage } from '../../../services/storage';
import { STORAGE_KEYS } from '../../../constants';

const TAG = 'useProducts';

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  searchQuery: string;
  filters: ProductFilters;
  setSearchQuery: (q: string) => void;
  setFilters: (f: ProductFilters) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, ENV.SEARCH_DEBOUNCE_MS);
  const isOnline = useAppStore(state => state.isOnline);
  const loadingRef = useRef(false);

  const fetchProducts = useCallback(async (
    targetPage: number,
    search: string,
    currentFilters: ProductFilters,
    append: boolean
  ) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      if (!isOnline) {
        const cached = await storage.get<Product[]>(STORAGE_KEYS.CACHED_PRODUCTS);
        if (cached && cached.length > 0) {
          setProducts(cached.slice(0, ENV.PAGE_SIZE_PRODUCTS));
          setHasMore(false);
        } else {
          setError('You are offline and no cached product data is available.');
        }
        return;
      }

      const result = await shopApi.getProducts(targetPage, search, currentFilters);

      if (result.success) {
        const response = result.data;
        setProducts(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.hasMore);
        setPage(targetPage);

        if (targetPage === 1 && !search) {
          storage.set(STORAGE_KEYS.CACHED_PRODUCTS, response.data).catch(() => {});
        }
      } else {
        Logger.error(TAG, 'Failed to fetch products', result.error);
        setError(result.error.message);
        const cached = await storage.get<Product[]>(STORAGE_KEYS.CACHED_PRODUCTS);
        if (cached && !append) setProducts(cached.slice(0, ENV.PAGE_SIZE_PRODUCTS));
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    fetchProducts(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchProducts]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    fetchProducts(page + 1, debouncedSearch, filters, true);
  }, [hasMore, isLoadingMore, isLoading, page, debouncedSearch, filters, fetchProducts]);

  const refresh = useCallback(() => {
    fetchProducts(1, debouncedSearch, filters, false);
  }, [debouncedSearch, filters, fetchProducts]);

  return {
    products,
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
