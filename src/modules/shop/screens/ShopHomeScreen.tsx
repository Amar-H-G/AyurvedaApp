/**
 * ShopHomeScreen — Premium Amrutam Ayurveda Shop Landing Screen.
 * Displays hero banners, category discovery, featured products, popular bestsellers,
 * curated Ayurvedic collections, and quick navigation to ProductListScreen.
 */
import React, { useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useShopStore } from '../../../store/shop/shopStore';
import { Product, ProductCategory } from '../../../types';
import { PRODUCT_CATEGORIES } from '../../../constants';
import { ProductGridSkeleton } from '../../../components/skeletons/ProductCardSkeleton';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 48;

const CATEGORY_EMOJIS: Record<ProductCategory, string> = {
  Oils: '🧴',
  Herbs: '🌿',
  Supplements: '💊',
  Skincare: '✨',
  Haircare: '💆',
  Immunity: '🛡️',
  Digestive: '🍵',
  'Joint Care': '🦴',
  'Stress Relief': '🧘',
  'Weight Management': '🏃',
};

const HERO_BANNERS = [
  {
    id: 'hero_1',
    title: '100% Pure Authentic Ayurveda',
    subtitle: 'Handcrafted Formulations & Vedic Tailas',
    tag: 'AYURVEDIC CARE',
    bgGradient: '#124734',
    badge: '30% OFF',
    category: 'Oils' as ProductCategory,
  },
  {
    id: 'hero_2',
    title: 'Nari Soundarya Beauty Oils',
    subtitle: 'Nourish Skin & Hair with Herbal Extracts',
    tag: 'BESTSELLER',
    bgGradient: '#2D6A4F',
    badge: 'NEW FORMULA',
    category: 'Skincare' as ProductCategory,
  },
  {
    id: 'hero_3',
    title: 'Daily Immunity & Vitality',
    subtitle: 'Authentic Chyawanprash & Herbal Tonics',
    tag: 'DAILY WELLNESS',
    bgGradient: '#1B4332',
    badge: 'PREMIUM',
    category: 'Immunity' as ProductCategory,
  },
];

const COLLECTIONS = [
  {
    id: 'coll_1',
    title: 'Soundarya & Glow Routine',
    subtitle: 'Kumi, Hair & Skin Oils for radiance',
    emoji: '✨',
    category: 'Skincare' as ProductCategory,
  },
  {
    id: 'coll_2',
    title: 'Panchakarma & Joint Relief',
    subtitle: 'Deep tissue & joint pain relief oils',
    emoji: '🦴',
    category: 'Joint Care' as ProductCategory,
  },
  {
    id: 'coll_3',
    title: 'Mind, Stress & Sleep Support',
    subtitle: 'Calming Ashwagandha & Brahmi blends',
    emoji: '🧘',
    category: 'Stress Relief' as ProductCategory,
  },
];

export function ShopHomeScreen({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cartItemCount = useShopStore(state => state.getCartItemCount());

  const { products, isLoading } = useProducts();

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const popularProducts = useMemo(() => products.slice(4, 8), [products]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  const handleCategoryPress = useCallback((cat: ProductCategory) => {
    navigation.navigate('ProductList', { initialCategory: cat });
  }, [navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header & Search Bar Row */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Typography variant="h3" color={theme.colors.primary} style={styles.brandTitle}>
              🌿 Amrutam Shop
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              Pure Vedic Health & Wellness Formulations
            </Typography>
          </View>

          <TouchableOpacity
            style={[styles.cartBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Cart')}
            accessibilityLabel={`Cart with ${cartItemCount} items`}
            accessibilityRole="button"
            testID="shop-home-cart-btn"
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

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProductList')}
          style={styles.searchTouchable}
        >
          <SearchBar
            value=""
            onChangeText={() => {}}
            editable={false}
            placeholder="Search 20,000+ Ayurvedic products..."
            style={styles.searchBar}
            testID="shop-home-search-bar"
          />
        </TouchableOpacity>
      </View>

      {/* 2. Hero Banners Carousel */}
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heroScrollContent}
        snapToInterval={HERO_CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {HERO_BANNERS.map(banner => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            onPress={() => handleCategoryPress(banner.category)}
            style={[styles.heroCard, { backgroundColor: banner.bgGradient }]}
          >
            <View style={styles.heroBadge}>
              <Typography variant="caption" color="#FFF" style={styles.heroBadgeText}>
                {banner.badge}
              </Typography>
            </View>

            <Typography variant="caption" color="#A3E635" style={styles.heroTag}>
              {banner.tag}
            </Typography>
            <Typography variant="h3" color="#FFFFFF" style={styles.heroTitle}>
              {banner.title}
            </Typography>
            <Typography variant="bodySmall" color="#D1FAE5" style={styles.heroSubtitle}>
              {banner.subtitle}
            </Typography>

            <View style={styles.heroCtaRow}>
              <Typography variant="label" color="#FFFFFF" style={styles.heroCtaText}>
                Explore Collection →
              </Typography>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. Shop by Category */}
      <View style={styles.sectionHeaderRow}>
        <Typography variant="h4" color={theme.colors.textPrimary}>
          Explore Categories
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
          <Typography variant="label" color={theme.colors.primary}>
            View All →
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {PRODUCT_CATEGORIES.map(cat => {
          const emoji = CATEGORY_EMOJIS[cat] ?? '🌿';
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(cat)}
              style={[styles.categoryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.categoryEmojiCircle, { backgroundColor: theme.colors.primary + '12' }]}>
                <Typography variant="h3">{emoji}</Typography>
              </View>
              <Typography variant="label" color={theme.colors.textPrimary} style={styles.categoryName} numberOfLines={1}>
                {cat}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Featured Products */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithBadge}>
          <Typography variant="h4" color={theme.colors.textPrimary}>
            Featured Formulations
          </Typography>
          <View style={[styles.featuredTag, { backgroundColor: theme.colors.primary + '18' }]}>
            <Typography variant="caption" color={theme.colors.primary} style={styles.featuredTagText}>
              TOP PICK
            </Typography>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
          <Typography variant="label" color={theme.colors.primary}>
            See All →
          </Typography>
        </TouchableOpacity>
      </View>

      {isLoading && featuredProducts.length === 0 ? (
        <ProductGridSkeleton count={2} />
      ) : (
        <View style={styles.productGrid}>
          {featuredProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} onPress={handleProductPress} />
          ))}
        </View>
      )}

      {/* 5. Ayurvedic Collections */}
      <View style={styles.sectionHeaderRow}>
        <Typography variant="h4" color={theme.colors.textPrimary}>
          Curated Collections
        </Typography>
      </View>

      <View style={styles.collectionsContainer}>
        {COLLECTIONS.map(coll => (
          <TouchableOpacity
            key={coll.id}
            activeOpacity={0.85}
            onPress={() => handleCategoryPress(coll.category)}
            style={[styles.collectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <View style={[styles.collectionIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <Typography variant="h2">{coll.emoji}</Typography>
            </View>
            <View style={styles.collectionInfo}>
              <Typography variant="h4" color={theme.colors.textPrimary}>
                {coll.title}
              </Typography>
              <Typography variant="bodySmall" color={theme.colors.textSecondary}>
                {coll.subtitle}
              </Typography>
            </View>
            <Typography variant="h4" color={theme.colors.primary}>
              ›
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* 6. Popular Bestsellers */}
      <View style={styles.sectionHeaderRow}>
        <Typography variant="h4" color={theme.colors.textPrimary}>
          Popular Bestsellers
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
          <Typography variant="label" color={theme.colors.primary}>
            View All →
          </Typography>
        </TouchableOpacity>
      </View>

      {isLoading && popularProducts.length === 0 ? (
        <ProductGridSkeleton count={2} />
      ) : (
        <View style={styles.productGrid}>
          {popularProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} onPress={handleProductPress} />
          ))}
        </View>
      )}

      {/* 7. Explore All Products Action Banner */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigation.navigate('ProductList')}
        style={[styles.exploreAllBanner, { backgroundColor: theme.colors.primary }]}
        testID="explore-all-products-btn"
      >
        <Typography variant="h4" color="#FFFFFF" style={styles.exploreBtnText}>
          Explore All 20,000+ Products →
        </Typography>
        <Typography variant="caption" color="#D1FAE5">
          Filter by price, category, rating, & stock availability
        </Typography>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
  },
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
  badgeText: { fontSize: 9, fontWeight: '800' },
  searchTouchable: {
    width: '100%',
  },
  searchBar: { flex: 1 },

  // Hero Carousel
  heroScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
    padding: 20,
    borderRadius: 20,
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800' },
  heroTag: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  heroSubtitle: { fontSize: 13, marginBottom: 8 },
  heroCtaRow: { marginTop: 4 },
  heroCtaText: { fontSize: 13, fontWeight: '700' },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredTagText: { fontSize: 9, fontWeight: '800' },

  // Categories
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  categoryCard: {
    width: 88,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  categoryEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  // Collections
  collectionsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  collectionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionInfo: {
    flex: 1,
    gap: 2,
  },

  // Explore All Banner
  exploreAllBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  exploreBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
