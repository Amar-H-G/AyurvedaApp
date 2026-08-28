/**
 * ProductCard — memoized card for the shop product grid/list.
 */
import React, { memo, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { useShopStore } from '../../../store/shop/shopStore';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

function ProductCardBase({ product, onPress }: ProductCardProps): React.JSX.Element {
  const theme = useTheme();
  const handlePress = useCallback(() => onPress(product), [product, onPress]);

  const addToCart = useShopStore(state => state.addToCart);
  const toggleWishlist = useShopStore(state => state.toggleWishlist);
  const isWishlisted = useShopStore(state => state.wishlistIds.includes(product.id));

  const handleAddToCart = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation?.();
    addToCart(product, 1);
  }, [product, addToCart]);

  const handleWishlist = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation?.();
    toggleWishlist(product.id);
  }, [product.id, toggleWishlist]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={styles.wrapper}
      accessibilityLabel={`${product.name}, ₹${product.price}${product.discount > 0 ? `, ${product.discount}% off` : ''}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view product details"
    >
      <Card style={styles.card} variant="elevated" padding="none">
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityElementsHidden
          />
          {product.discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: theme.colors.error }]}>
              <Typography variant="caption" color="#FFF">{product.discount}%</Typography>
            </View>
          )}
          <TouchableOpacity
            style={[styles.wishlistBtn, { backgroundColor: theme.colors.surface }]}
            onPress={handleWishlist}
            accessibilityLabel={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            accessibilityRole="button"
          >
            <Typography variant="body">{isWishlisted ? '❤️' : '🤍'}</Typography>
          </TouchableOpacity>
        </View>
        <View style={styles.info}>
          <Typography variant="label" numberOfLines={2} color={theme.colors.textPrimary}>
            {product.name}
          </Typography>
          <Typography variant="caption" color={theme.colors.primary} style={styles.category}>
            {product.category}
          </Typography>
          <View style={styles.priceRow}>
            <Typography variant="h4" color={theme.colors.textPrimary}>₹{product.price}</Typography>
            {product.discount > 0 && (
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.originalPrice}>
                ₹{product.originalPrice}
              </Typography>
            )}
          </View>
          <View style={styles.ratingRow}>
            <Typography variant="caption" color={theme.colors.warning}>★ {product.rating}</Typography>
            <Typography variant="caption" color={theme.colors.textTertiary}> ({product.reviewCount})</Typography>
          </View>
          {!product.inStock && (
            <Typography variant="caption" color={theme.colors.error}>Out of stock</Typography>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: product.inStock ? theme.colors.primary : theme.colors.textDisabled },
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
          accessibilityLabel={`Add ${product.name} to cart`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !product.inStock }}
        >
          <Typography variant="caption" color={theme.colors.textOnPrimary}>+ Add</Typography>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 6,
  },
  card: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  info: {
    padding: 10,
    gap: 2,
  },
  category: {
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
  },
  addBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export const ProductCard = memo(ProductCardBase);
