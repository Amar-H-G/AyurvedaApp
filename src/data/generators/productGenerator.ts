/**
 * Deterministic product data generator — 20,000 products.
 */
import { Product, ProductCategory } from '../../types';
import { PRODUCT_CATEGORIES, AYURVEDIC_TAGS } from '../../constants';

const PRODUCT_PREFIXES = [
  'Ashwagandha', 'Brahmi', 'Triphala', 'Neem', 'Tulsi', 'Shatavari',
  'Guduchi', 'Amalaki', 'Haritaki', 'Vibhitaki', 'Arjuna', 'Shankhpushpi',
  'Gokshura', 'Punarnava', 'Vidanga', 'Chitrak', 'Pippali', 'Trikatu',
  'Dashmool', 'Mahanarayan', 'Dhanvantari', 'Chyawanprash', 'Hingwashtak',
  'Talisadi', 'Sitopaladi', 'Avipattikar', 'Kanchanar', 'Lashunadi',
];

const PRODUCT_SUFFIXES = [
  'Oil', 'Capsules', 'Tablet', 'Powder', 'Syrup', 'Churna', 'Kwath',
  'Ghee', 'Avaleha', 'Bhasma', 'Asava', 'Arishta', 'Tailam', 'Lepa',
  'Vati', 'Gutika', 'Mandur', 'Lauh', 'Parpati', 'Rasa',
];

const DESCRIPTIONS = [
  'A traditional Ayurvedic formulation crafted from the finest herbs, supporting overall wellness and vitality.',
  'Time-tested herbal blend prepared according to classical Ayurvedic texts for optimal therapeutic benefit.',
  'Carefully selected ingredients processed using traditional methods to preserve therapeutic potency.',
  'Natural formulation free from artificial additives, supporting the body\'s innate healing processes.',
  'Sourced from certified organic farms and processed in GMP-certified facilities.',
];

const INGREDIENT_POOL = [
  'Ashwagandha root', 'Brahmi extract', 'Amalaki fruit', 'Haritaki fruit',
  'Vibhitaki fruit', 'Neem leaves', 'Tulsi leaves', 'Ginger root',
  'Black pepper', 'Long pepper', 'Guggul resin', 'Shilajit', 'Saffron',
  'Cardamom seeds', 'Cinnamon bark', 'Turmeric rhizome', 'Licorice root',
];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pickN<T>(arr: readonly T[], index: number, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const item = arr[(index * 3 + i * 11) % arr.length];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

export function generateProduct(index: number): Product {
  const id = `prod_${String(index + 1).padStart(6, '0')}`;
  const prefix = pick(PRODUCT_PREFIXES, index);
  const suffix = pick(PRODUCT_SUFFIXES, index + 5);
  const category = pick(PRODUCT_CATEGORIES, index) as ProductCategory;
  const originalPrice = 99 + (index % 200) * 10; // 99–2099
  const discountPct = [0, 5, 10, 15, 20, 25, 30][index % 7];
  const price = Math.round(originalPrice * (1 - discountPct / 100));
  const rating = Number((3.0 + ((index * 41) % 20) / 10).toFixed(1)); // 3.0–5.0
  const reviewCount = 5 + (index * 17) % 995;
  const inStock = index % 10 !== 0;

  return {
    id,
    name: `${prefix} ${suffix}`,
    category,
    price,
    originalPrice,
    discount: discountPct,
    rating,
    reviewCount,
    imageUrl: `https://picsum.photos/seed/${id}/300/300`,
    description: pick(DESCRIPTIONS, index),
    ingredients: pickN(INGREDIENT_POOL, index, 3 + (index % 3)),
    tags: pickN(AYURVEDIC_TAGS as unknown as readonly string[], index, 3),
    inStock,
    quantity: inStock ? 1 + (index % 100) : 0,
  };
}

let _cachedProducts: Product[] | null = null;

export function generateProducts(count: number = 20000): Product[] {
  if (_cachedProducts && _cachedProducts.length === count) {
    return _cachedProducts;
  }
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    products.push(generateProduct(i));
  }
  _cachedProducts = products;
  return products;
}
