/**
 * ProductCard — memoized, structurally uniform card for the 2-column shop grid.
 * Enforces rigid vertical alignment, fixed image ratio, fixed title height, and anchored buttons.
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
// Calculate rigid card width for 2-column grid with 12px gap & 16px horizontal padding
const CARD_WIDTH = (width - 32 - 12) / 2;

function ProductCardBase({ product, onPress }: ProductCardProps): React.JSX.Element {
  const theme = useTheme();
  const handlePress = useCallback(() => onPress(product), [product, onPress]);

  const addToCart = useShopStore(state => state.addToCart);
  const toggleWishlist = useShopStore(state => state.toggleWishlist);
  const isWishlisted = useShopStore(state => state.wishlistIds.includes(product.id));

  const handleAddToCart = useCallback((e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    addToCart(product, 1);
  }, [product, addToCart]);

  const handleWishlist = useCallback((e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    toggleWishlist(product.id);
  }, [product.id, toggleWishlist]);

  const hasDiscount = product.discount > 0;
  const isInStock = product.inStock;

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

        {/* Anchored Bottom Action Button */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: isInStock ? theme.colors.primary : theme.colors.surfaceVariant,
              borderColor: isInStock ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={handleAddToCart}
          disabled={!isInStock}
          accessibilityLabel={`Add ${product.name} to cart`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isInStock }}
        >
          <Typography
            variant="label"
            color={isInStock ? theme.colors.textOnPrimary : theme.colors.textDisabled}
            style={styles.addBtnText}
          >
            {isInStock ? '+ Add to Cart' : 'Out of Stock'}
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
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
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
