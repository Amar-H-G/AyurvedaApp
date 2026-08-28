/**
 * CartScreen — cart management, quantity updates, checkout summary.
 * Replaces native OS Alert with custom animated OrderSuccessModal.
 */
import React, { useCallback, useState, memo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShopStore } from '../../../store/shop/shopStore';
import { CartItem } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Button } from '../../../components/design-system/Button';
import { EmptyState } from '../../../components/design-system/StateViews';
import { shopApi } from '../../../services/api/shopApi';
import { useAppStore } from '../../../store/app/appStore';
import { OrderSuccessModal } from '../components/OrderSuccessModal';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

interface CartItemRowProps { item: CartItem }

const CartItemRow = memo(({ item }: CartItemRowProps) => {
  const theme = useTheme();
  const updateQuantity = useShopStore(s => s.updateQuantity);
  const removeFromCart = useShopStore(s => s.removeFromCart);

  return (
    <Card style={styles.itemCard} variant="elevated">
      <View style={styles.itemRow}>
        <Image source={{ uri: item.product.imageUrl }} style={styles.thumbnail} />
        <View style={styles.itemInfo}>
          <Typography variant="label" numberOfLines={2} color={theme.colors.textPrimary}>
            {item.product.name}
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary}>{item.product.category}</Typography>
          <Typography variant="h4" color={theme.colors.primary}>₹{item.product.price}</Typography>
        </View>
        <View style={styles.quantityCol}>
          <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
          >
            <Typography variant="h4" color={theme.colors.textPrimary}>−</Typography>
          </TouchableOpacity>
          <Typography variant="h4" color={theme.colors.textPrimary} align="center" style={styles.qty}>
            {item.quantity}
          </Typography>
          <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
          >
            <Typography variant="h4" color={theme.colors.textOnPrimary}>+</Typography>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item.product.id)}
        style={styles.removeBtn}
        accessibilityLabel={`Remove ${item.product.name} from cart`}
        accessibilityRole="button"
      >
        <Typography variant="caption" color={theme.colors.error}>Remove</Typography>
      </TouchableOpacity>
    </Card>
  );
});

function CartScreenBase({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cart = useShopStore(s => s.cart);
  const getCartTotal = useShopStore(s => s.getCartTotal);
  const clearCart = useShopStore(s => s.clearCart);
  const showToast = useAppStore(s => s.showToast);

  const [orderModal, setOrderModal] = useState({
    visible: false,
    orderId: '',
    total: 0,
    count: 0,
  });

  const total = getCartTotal();

  const handleCheckout = useCallback(async () => {
    const items = cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
    const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const result = await shopApi.checkoutCart(items);
    if (result.success) {
      setOrderModal({
        visible: true,
        orderId: result.data.orderId,
        total: result.data.total || total,
        count: totalCount,
      });
    } else {
      showToast({ type: 'error', message: 'Checkout failed. Please try again.' });
    }
  }, [cart.items, total, showToast]);

  const handleContinueShopping = useCallback(() => {
    setOrderModal(prev => ({ ...prev, visible: false }));
    clearCart();
  }, [clearCart]);

  const handleViewHealthRecords = useCallback(() => {
    setOrderModal(prev => ({ ...prev, visible: false }));
    clearCart();
    navigation.navigate('Health');
  }, [clearCart, navigation]);

  const renderItem = useCallback(({ item }: { item: CartItem }) => (
    <CartItemRow item={item} />
  ), []);

  const keyExtractor = useCallback((item: CartItem) => item.product.id, []);

  const Summary = (
    <Card style={styles.summary} variant="outlined">
      <Typography variant="h4" color={theme.colors.textPrimary}>Order Summary</Typography>
      <View style={styles.summaryRow}>
        <Typography variant="body" color={theme.colors.textSecondary}>Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})</Typography>
        <Typography variant="body" color={theme.colors.textPrimary}>₹{total}</Typography>
      </View>
      <View style={styles.summaryRow}>
        <Typography variant="body" color={theme.colors.textSecondary}>Delivery</Typography>
        <Typography variant="body" color={theme.colors.success}>Free</Typography>
      </View>
      <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
        <Typography variant="h3" color={theme.colors.textPrimary}>Total</Typography>
        <Typography variant="h3" color={theme.colors.primary}>₹{total}</Typography>
      </View>
      <Button label="Proceed to Checkout" onPress={handleCheckout} fullWidth style={styles.checkoutBtn} testID="checkout-btn" />
    </Card>
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyState emoji="🛒" title="Your Cart is Empty" subtitle="Add products to get started" />
        }
        ListFooterComponent={cart.items.length > 0 ? Summary : null}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, flexGrow: 1 }}
        removeClippedSubviews
        maxToRenderPerBatch={10}
      />

      <OrderSuccessModal
        visible={orderModal.visible}
        orderId={orderModal.orderId}
        totalAmount={orderModal.total}
        itemCount={orderModal.count}
        onContinueShopping={handleContinueShopping}
        onViewHealthRecords={handleViewHealthRecords}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  itemCard: { margin: 16, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: { width: 72, height: 72, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1, gap: 2 },
  quantityCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 24 },
  removeBtn: { marginTop: 8, alignSelf: 'flex-end' },
  summary: { margin: 16, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, marginTop: 4, borderTopWidth: 1 },
  checkoutBtn: { marginTop: 8 },
});

export const CartScreen = memo(CartScreenBase);
