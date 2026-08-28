/**
 * Shop API — repository layer.
 */
import { mockRequest, paginate, ApiResult } from './mockApiClient';
import { Product, ProductFilters, PaginatedResponse } from '../../types';
import { generateProducts } from '../../data/generators/productGenerator';
import { ENV } from '../../config/env';

const ALL_PRODUCTS = generateProducts(20000);

function applyFiltersAndSort(products: Product[], filters: ProductFilters, search: string): Product[] {
  let result = products;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.category) result = result.filter(p => p.category === filters.category);
  if (filters.minPrice != null) result = result.filter(p => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter(p => p.price <= filters.maxPrice!);
  if (filters.minRating != null) result = result.filter(p => p.rating >= filters.minRating!);
  if (filters.inStockOnly) result = result.filter(p => p.inStock);
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(p => filters.tags!.some(t => p.tags.includes(t)));
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price_asc': result = [...result].sort((a, b) => a.price - b.price); break;
    case 'price_desc': result = [...result].sort((a, b) => b.price - a.price); break;
    case 'rating_desc': result = [...result].sort((a, b) => b.rating - a.rating); break;
    case 'name_asc': result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'newest': result = [...result].sort((a, b) => a.id.localeCompare(b.id)); break;
    default: break;
  }

  return result;
}

export const shopApi = {
  async getProducts(
    page: number,
    search: string = '',
    filters: ProductFilters = {}
  ): Promise<ApiResult<PaginatedResponse<Product>>> {
    return mockRequest(() => {
      const filtered = applyFiltersAndSort(ALL_PRODUCTS, filters, search);
      return paginate(filtered, page, ENV.PAGE_SIZE_PRODUCTS);
    });
  },

  async getProductById(id: string): Promise<ApiResult<Product>> {
    return mockRequest(() => ALL_PRODUCTS.find(p => p.id === id) ?? null);
  },

  async checkoutCart(items: { productId: string; quantity: number }[]): Promise<ApiResult<{ orderId: string; total: number }>> {
    return mockRequest(() => ({
      orderId: `order_${Date.now()}`,
      total: items.reduce((sum, item) => {
        const product = ALL_PRODUCTS.find(p => p.id === item.productId);
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0),
    }));
  },
};
