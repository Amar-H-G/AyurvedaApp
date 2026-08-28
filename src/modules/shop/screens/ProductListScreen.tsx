/**
 * ProductListScreen — 2-column product grid with search, sort, category filtering & infinite scroll.
 * Handles initial category and search params passed from ShopHomeScreen.
 */
import React, { useCallback, useMemo, useState, useEffect, memo } from 'react';
import {
  View, FlatList, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product, ProductFilters, SortOption } from '../../../types';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { useTheme } from '../../../hooks/useTheme';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { Typography } from '../../../components/design-system/Typography';
import { Chip } from '../../../components/design-system/Chip';
import { ErrorState, EmptyState } from '../../../components/design-system/StateViews';
import { ProductGridSkeleton } from '../../../components/skeletons/ProductCardSkeleton';
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from '../../../constants';
import { useShopStore } from '../../../store/shop/shopStore';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
  route?: { params?: { initialCategory?: string; initialSearch?: string } };
}

const keyExtractor = (item: Product) => item.id;
const NUM_COLUMNS = 2;

function ProductListScreenBase({ navigation, route }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [showFilters, setShowFilters] = useState(false);

  const {
    products, isLoading, isLoadingMore, error,
    searchQuery, filters, setSearchQuery, setFilters, loadMore, refresh,
  } = useProducts();

  const cartItemCount = useShopStore(state => state.getCartItemCount());

  // Listen to initial route params from ShopHomeScreen
  useEffect(() => {
    if (route?.params?.initialCategory) {
      setFilters({ category: route.params.initialCategory as ProductFilters['category'] });
      setShowFilters(true);
    }
    if (route?.params?.initialSearch) {
      setSearchQuery(route.params.initialSearch);
    }
  }, [route?.params?.initialCategory, route?.params?.initialSearch, setFilters, setSearchQuery]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  const handleSort = useCallback((sort: SortOption) => {
    setFilters({ ...filters, sortBy: filters.sortBy === sort ? undefined : sort });
  }, [filters, setFilters]);

  const handleCategoryFilter = useCallback((cat: string) => {
    setFilters({
      ...filters,
      category: filters.category === cat ? undefined : (cat as ProductFilters['category']),
    });
  }, [filters, setFilters]);

  const handleInStockToggle = useCallback(() => {
    setFilters({ ...filters, inStockOnly: !filters.inStockOnly });
  }, [filters, setFilters]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  ), [handleProductPress]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return <ProductGridSkeleton count={2} />;
  }, [isLoadingMore]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={styles.topBar}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          style={styles.searchBar}
          testID="product-search-bar"
        />
        <TouchableOpacity
          style={[styles.cartBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Cart')}
          accessibilityLabel={`Cart with ${cartItemCount} items`}
          accessibilityRole="button"
        >
          <Typography variant="body">🛒</Typography>
          {cartItemCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: theme.colors.error }]}>
              <Typography variant="caption" color="#FFF" style={styles.badgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter toggle */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(v => !v)}
        accessibilityRole="button"
        accessibilityLabel="Toggle filters and sort"
      >
        <Typography variant="label" color={theme.colors.primary}>
          {showFilters ? '▲ Hide Filters' : '▼ Filters & Sort'}
        </Typography>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Typography variant="overline" color={theme.colors.textTertiary}>Sort By</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {SORT_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={filters.sortBy === opt.value}
                onPress={() => handleSort(opt.value as SortOption)}
                style={styles.chip}
              />
            ))}
          </ScrollView>

          <Typography variant="overline" color={theme.colors.textTertiary} style={styles.filterLabel}>
            Category
          </Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {PRODUCT_CATEGORIES.map(cat => (
              <Chip
                key={cat}
                label={cat}
                selected={filters.category === cat}
                onPress={() => handleCategoryFilter(cat)}
                style={styles.chip}
              />
            ))}
          </ScrollView>

          <Chip label="In Stock Only" selected={!!filters.inStockOnly} onPress={handleInStockToggle} />
        </View>
      )}

      <Typography variant="caption" color={theme.colors.textTertiary} style={styles.resultCount}>
        {products.length > 0 ? `${products.length.toLocaleString()} products` : ''}
      </Typography>
    </View>
  ), [
    searchQuery, showFilters, filters, cartItemCount, products.length, theme,
    setSearchQuery, handleSort, handleCategoryFilter, handleInStockToggle, navigation,
  ]);

  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <ProductGridSkeleton count={6} />
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <ErrorState message={error} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            emoji="🌿"
            title="No Products Found"
            subtitle="Try different search terms or filters"
            actionLabel="Clear Filters"
            onAction={() => { setSearchQuery(''); setFilters({}); }}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={isLoading}
        onRefresh={refresh}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    gap: 8,
  },
  searchBar: { flex: 1 },
  cartBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9 },
  filterToggle: { paddingHorizontal: 16, paddingBottom: 8 },
  filterPanel: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chipRow: { marginBottom: 4 },
  chip: { marginRight: 8 },
  filterLabel: { marginTop: 8 },
  resultCount: { paddingHorizontal: 16, paddingBottom: 4 },
  columnWrapper: { justifyContent: 'space-between' },
});

export const ProductListScreen = memo(ProductListScreenBase);
