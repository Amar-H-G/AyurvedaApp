/**
 * ProductCard — memoized, structurally uniform card for the 2-column shop grid.
 * Enforces rigid vertical alignment, fixed image ratio, fixed title height, and anchored buttons.
 * Add to Cart button state is derived dynamically from global useShopStore cart state.
 * When product is in cart, button is set to '✓ Added' and disabled (non-clickable).
 */
import React, { memo, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Product } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { useShopStore } from '../../../store/shop/shopStore';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 12) / 2;

function ProductCardBase({ product, onPress }: ProductCardProps): React.JSX.Element {
  const theme = useTheme();
  const handlePress = useCallback(() => onPress(product), [product, onPress]);

  const addToCart = useShopStore(state => state.addToCart);
  const toggleWishlist = useShopStore(state => state.toggleWishlist);
  const isWishlisted = useShopStore(state => state.wishlistIds.includes(product.id));
  
  // Real cart state selector from Zustand global store
  const cartItem = useShopStore(state => state.getCartItem(product.id));
  const isInCart = !!cartItem && cartItem.quantity > 0;

  const handleAddToCart = useCallback((e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    if (isInCart) return; // Prevent any action if already added
    addToCart(product, 1);
  }, [product, addToCart, isInCart]);

  const handleWishlist = useCallback((e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    toggleWishlist(product.id);
  }, [product.id, toggleWishlist]);

  const hasDiscount = product.discount > 0;
  const isInStock = product.inStock;

  const isBtnDisabled = !isInStock || isInCart;

  const buttonBgColor = !isInStock
    ? theme.colors.surfaceVariant
    : isInCart
    ? '#10B981'
    : theme.colors.primary;

  const buttonTextColor = !isInStock
    ? theme.colors.textDisabled
    : '#FFFFFF';

  const buttonLabel = !isInStock
    ? 'Out of Stock'
    : isInCart
    ? '✓ Added'
    : '+ Add to Cart';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={styles.wrapper}
      accessibilityLabel={`${product.name}, ₹${product.price}${hasDiscount ? `, ${product.discount}% off` : ''}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view product details"
    >
      <Card style={styles.cardContainer} variant="elevated" padding="none">
        {/* Fixed Height Image Area */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityElementsHidden
          />
          
          {/* Discount Badge (Top-Left) */}
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: theme.colors.error }]}>
              <Typography variant="caption" color="#FFFFFF" style={styles.discountText}>
                {product.discount}% OFF
              </Typography>
            </View>
          )}

          {/* Wishlist Button (Top-Right) */}
          <TouchableOpacity
            style={[styles.wishlistBtn, { backgroundColor: theme.colors.surface }]}
            onPress={handleWishlist}
            accessibilityLabel={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            accessibilityRole="button"
          >
            <Typography variant="body">{isWishlisted ? '❤️' : '🤍'}</Typography>
          </TouchableOpacity>
        </View>

        {/* Info Content Area */}
        <View style={styles.infoContent}>
          {/* Fixed Height Title Box */}
          <View style={styles.titleContainer}>
            <Typography
              variant="label"
              numberOfLines={2}
              color={theme.colors.textPrimary}
              style={styles.titleText}
            >
              {product.name}
            </Typography>
          </View>

          {/* Fixed Category Line */}
          <Typography
            variant="caption"
            color={theme.colors.primary}
            numberOfLines={1}
            style={styles.categoryText}
          >
            {product.category}
          </Typography>

          {/* Fixed Price Row */}
          <View style={styles.priceRow}>
            <Typography variant="h4" color={theme.colors.textPrimary} style={styles.priceText}>
              ₹{product.price}
            </Typography>
            {hasDiscount && (
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.originalPriceText}>
                ₹{product.originalPrice}
              </Typography>
            )}
          </View>

          {/* Fixed Rating & Stock Row */}
          <View style={styles.ratingRow}>
            <View style={styles.starRatingGroup}>
              <Typography variant="caption" color={theme.colors.warning} style={styles.starText}>
                ★ {product.rating}
              </Typography>
              <Typography variant="caption" color={theme.colors.textTertiary}>
                ({product.reviewCount})
              </Typography>
            </View>

            {!isInStock && (
              <Typography variant="caption" color={theme.colors.error} style={styles.outOfStockBadge}>
                Out of stock
              </Typography>
            )}
          </View>
        </View>

        {/* Anchored Bottom Action Button with Non-clickable 'Added' State */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: buttonBgColor,
              borderColor: buttonBgColor,
            },
          ]}
          onPress={handleAddToCart}
          disabled={isBtnDisabled}
          accessibilityLabel={buttonLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: isBtnDisabled }}
          testID={`add-to-cart-btn-${product.id}`}
        >
          <Typography
            variant="label"
            color={buttonTextColor}
            style={styles.addBtnText}
          >
            {buttonLabel}
          </Typography>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  cardContainer: {
    height: 310,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  imageContainer: {
    height: 135,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F5F7F5',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    flex: 1,
  },
  titleContainer: {
    height: 36,
    justifyContent: 'flex-start',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  categoryText: {
    fontSize: 11,
    height: 16,
    marginBottom: 4,
  },
  priceRow: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPriceText: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starRatingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    fontWeight: '600',
    fontSize: 11,
  },
  outOfStockBadge: {
    fontSize: 10,
    fontWeight: '600',
  },
  addBtn: {
    height: 38,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 'auto',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export const ProductCard = memo(ProductCardBase);
