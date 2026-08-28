/**
 * Shop Store — cart, wishlist, local persistence.
 */
import { create } from 'zustand';
import { Cart, CartItem, Product } from '../../types';
import { storage } from '../../services/storage';
import { STORAGE_KEYS } from '../../constants';
import { Logger } from '../../services/logger';

const TAG = 'ShopStore';

interface ShopState {
  cart: Cart;
  wishlistIds: string[];
  isLoaded: boolean;

  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Selectors
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getCartItem: (productId: string) => CartItem | undefined;

  loadFromStorage: () => Promise<void>;
}

function persistCart(cart: Cart): void {
  storage.set(STORAGE_KEYS.CART, cart).catch(() => {});
}

function persistWishlist(ids: string[]): void {
  storage.set(STORAGE_KEYS.WISHLIST, ids).catch(() => {});
}

const EMPTY_CART: Cart = { items: [], updatedAt: new Date().toISOString() };

export const useShopStore = create<ShopState>((set, get) => ({
  cart: EMPTY_CART,
  wishlistIds: [],
  isLoaded: false,

  addToCart: (product, quantity = 1) => {
    set(state => {
      const existingIndex = state.cart.items.findIndex(i => i.product.id === product.id);
      let newItems: CartItem[];

      if (existingIndex >= 0) {
        newItems = state.cart.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.cart.items, { product, quantity }];
      }

      const cart: Cart = { items: newItems, updatedAt: new Date().toISOString() };
      persistCart(cart);
      Logger.debug(TAG, `Added ${product.name} to cart`);
      return { cart };
    });
  },

  removeFromCart: (productId) => {
    set(state => {
      const cart: Cart = {
        items: state.cart.items.filter(i => i.product.id !== productId),
        updatedAt: new Date().toISOString(),
      };
      persistCart(cart);
      return { cart };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set(state => {
      const cart: Cart = {
        items: state.cart.items.map(i =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
        updatedAt: new Date().toISOString(),
      };
      persistCart(cart);
      return { cart };
    });
  },

  clearCart: () => {
    const cart = EMPTY_CART;
    set({ cart });
    persistCart(cart);
  },

  toggleWishlist: (productId) => {
    set(state => {
      const wishlistIds = state.wishlistIds.includes(productId)
        ? state.wishlistIds.filter(id => id !== productId)
        : [...state.wishlistIds, productId];
      persistWishlist(wishlistIds);
      Logger.debug(TAG, `Wishlist toggled: ${productId}`);
      return { wishlistIds };
    });
  },

  isInWishlist: (productId) => {
    return get().wishlistIds.includes(productId);
  },

  getCartTotal: () => {
    return get().cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    return get().cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartItem: (productId) => {
    return get().cart.items.find(i => i.product.id === productId);
  },

  loadFromStorage: async () => {
    const [cart, wishlistIds] = await Promise.all([
      storage.get<Cart>(STORAGE_KEYS.CART),
      storage.get<string[]>(STORAGE_KEYS.WISHLIST),
    ]);
    set({
      cart: cart ?? EMPTY_CART,
      wishlistIds: wishlistIds ?? [],
      isLoaded: true,
    });
    Logger.debug(TAG, `Loaded cart (${cart?.items.length ?? 0} items) from storage`);
  },
}));
