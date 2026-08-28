/**
 * ProductDetailScreen — Dynamic, production-quality details page for ANY product in the shop.
 * Displays full product details, image preview, pricing, discount, quantity selector,
 * description, ingredients chips, tags, and sticky cart/buy action controls.
 * Add to Cart button state is derived dynamically from global useShopStore cart state.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '../../../types';
import { shopApi } from '../../../services/api/shopApi';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Chip } from '../../../components/design-system/Chip';
import { ErrorState } from '../../../components/design-system/StateViews';
import { useShopStore } from '../../../store/shop/shopStore';
import { useAppStore } from '../../../store/app/appStore';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void; goBack: () => void };
  route: { params: { productId: string } };
}

export function ProductDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const addToCart = useShopStore(state => state.addToCart);
  const toggleWishlist = useShopStore(state => state.toggleWishlist);
  const isWishlisted = useShopStore(state => state.wishlistIds.includes(productId));
  const cartItemCount = useShopStore(state => state.getCartItemCount());
  
  // Real cart state selector from Zustand global store
  const cartItem = useShopStore(state => state.getCartItem(productId));
  const cartQty = cartItem?.quantity ?? 0;
  
  const showToast = useAppStore(state => state.showToast);

  const loadProductDetails = useCallback(async () => {
    if (!productId) {
      setError('Invalid Product ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await shopApi.getProductById(productId);
      if (res.success && res.data) {
        setProduct(res.data);
      } else {
        setError(res.success ? 'Product not found' : res.error.message);
      }
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProductDetails();
  }, [loadProductDetails]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, selectedQuantity);
    showToast({
      message: `Added ${selectedQuantity}x ${product.name} to Cart`,
      type: 'success',
    });
  }, [product, selectedQuantity, addToCart, showToast]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    addToCart(product, selectedQuantity);
    navigation.navigate('Cart');
  }, [product, selectedQuantity, addToCart, navigation]);

  const handleWishlistToggle = useCallback(() => {
    toggleWishlist(productId);
    showToast({
      message: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      type: 'info',
    });
  }, [productId, isWishlisted, toggleWishlist, showToast]);

  if (isLoading) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading Product Details...
        </Typography>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ErrorState
          message={error ?? 'Product Not Found'}
          onRetry={loadProductDetails}
        />
      </View>
    );
  }

  const hasDiscount = product.discount > 0;
  const savingsAmount = hasDiscount ? product.originalPrice - product.price : 0;
  const totalPrice = product.price * selectedQuantity;

  const buttonBgColor = !product.inStock
    ? theme.colors.surfaceVariant
    : cartQty > 0
    ? '#10B981'
    : theme.colors.primary;

  const buttonLabel = !product.inStock
    ? 'Out of Stock'
    : cartQty > 0
    ? `✓ Added (${cartQty}) in Cart • +${selectedQuantity} (₹${totalPrice})`
    : `+ Add to Cart • ₹${totalPrice}`;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Container */}
        <View style={styles.imageBox}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Top Bar Header Icons */}
          <View style={[styles.imageTopBar, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity
              style={[styles.iconCircle, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Typography variant="h4">←</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconCircle, { backgroundColor: theme.colors.surface }]}
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

          {/* Discount Badge */}
          {hasDiscount && (
            <View style={[styles.discountTag, { backgroundColor: theme.colors.error }]}>
              <Typography variant="caption" color="#FFFFFF" style={styles.discountTagText}>
                {product.discount}% OFF
              </Typography>
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.contentContainer}>
          {/* Category & Stock Row */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: theme.colors.primary + '15' }]}>
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                {product.category}
              </Typography>
            </View>

            <View style={[
              styles.stockPill,
              { backgroundColor: product.inStock ? '#D1FAE5' : '#FEE2E2' }
            ]}>
              <Typography
                variant="caption"
                color={product.inStock ? '#065F46' : '#991B1B'}
                style={{ fontWeight: '700' }}
              >
                {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
              </Typography>
            </View>
          </View>

          {/* Product Title */}
          <Typography variant="h3" color={theme.colors.textPrimary} style={styles.productTitle}>
            {product.name}
          </Typography>

          {/* Rating & Review */}
          <View style={styles.ratingRow}>
            <Typography variant="body" color={theme.colors.warning} style={styles.ratingText}>
              ★ {product.rating}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              ({product.reviewCount} verified customer reviews)
            </Typography>
          </View>

          {/* Pricing Box */}
          <View style={[styles.pricingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.priceRow}>
              <Typography variant="h2" color={theme.colors.primary} style={{ fontWeight: '800' }}>
                ₹{product.price}
              </Typography>
              {hasDiscount && (
                <Typography variant="body" color={theme.colors.textTertiary} style={styles.originalPrice}>
                  ₹{product.originalPrice}
                </Typography>
              )}
            </View>

            {hasDiscount && (
              <Typography variant="caption" color={theme.colors.success} style={styles.savingsText}>
                 You save ₹{savingsAmount} ({product.discount}% discount)
              </Typography>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Typography variant="label" color={theme.colors.textPrimary}>
              Select Quantity:
            </Typography>
            <View style={[styles.quantityControl, { borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setSelectedQuantity(q => Math.max(1, q - 1))}
                disabled={selectedQuantity <= 1}
              >
                <Typography variant="h4" color={selectedQuantity <= 1 ? theme.colors.textDisabled : theme.colors.textPrimary}>
                  -
                </Typography>
              </TouchableOpacity>

              <Typography variant="h4" color={theme.colors.textPrimary} style={styles.qtyText}>
                {selectedQuantity}
              </Typography>

              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setSelectedQuantity(q => q + 1)}
              >
                <Typography variant="h4" color={theme.colors.textPrimary}>
                  +
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
              Product Overview
            </Typography>
            <Typography variant="body" color={theme.colors.textSecondary} style={styles.descriptionText}>
              {product.description || 'Authentic Ayurvedic formulation crafted with pure herbal ingredients following traditional Vedic methods to support holistic wellness.'}
            </Typography>
          </View>

          {/* Key Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <View style={styles.section}>
              <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
                Key Ingredients
              </Typography>
              <View style={styles.chipGrid}>
                {product.ingredients.map(ing => (
                  <Chip key={ing} label={`🌿 ${ing}`} selected={false} style={styles.ingredientChip} />
                ))}
              </View>
            </View>
          )}

          {/* Tags & Highlights */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.section}>
              <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
                Highlights & Tags
              </Typography>
              <View style={styles.chipGrid}>
                {product.tags.map(tag => (
                  <Chip key={tag} label={`✨ ${tag}`} selected={false} style={styles.tagChip} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar with Dynamic Cart State */}
      <View style={[
        styles.bottomBar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        }
      ]}>
        {/* Wishlist Button */}
        <TouchableOpacity
          style={[styles.wishlistCircle, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleWishlistToggle}
          accessibilityLabel={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          accessibilityRole="button"
        >
          <Typography variant="h3">{isWishlisted ? '❤️' : '🤍'}</Typography>
        </TouchableOpacity>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: buttonBgColor },
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
          accessibilityLabel={buttonLabel}
          accessibilityRole="button"
          testID="product-detail-add-to-cart-btn"
        >
          <Typography variant="label" color={product.inStock ? '#FFFFFF' : theme.colors.textDisabled} style={styles.btnText}>
            {buttonLabel}
          </Typography>
        </TouchableOpacity>

        {/* Buy Now Button */}
        {product.inStock && (
          <TouchableOpacity
            style={[styles.buyNowButton, { backgroundColor: theme.colors.secondary }]}
            onPress={handleBuyNow}
            accessibilityLabel="Buy Now"
            accessibilityRole="button"
          >
            <Typography variant="label" color="#FFFFFF" style={styles.btnText}>
              Buy Now
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageBox: {
    width: '100%',
    height: 320,
    position: 'relative',
    backgroundColor: '#F5F7F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageTopBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800' },
  discountTag: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountTagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productTitle: {
    fontWeight: '800',
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: { fontWeight: '700' },
  pricingCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontWeight: '700',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    width: 40,
    textAlign: 'center',
    fontWeight: '700',
  },
  section: {
    marginTop: 12,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  descriptionText: {
    lineHeight: 22,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: { marginRight: 0 },
  tagChip: { marginRight: 0 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  wishlistCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowButton: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
