/**
 * Master Skeleton Loading System — Unit & Logic Tests
 */
import { LoadingVariant } from '../../src/components/design-system/StateViews';

function resolveLoadingVariant(message?: string, explicitVariant?: LoadingVariant): LoadingVariant {
  if (explicitVariant) return explicitVariant;
  if (!message) return 'generic';

  const lower = message.toLowerCase();
  if (lower.includes('doctor profile')) return 'doctor-detail';
  if (lower.includes('doctor')) return 'doctor-list';
  if (lower.includes('product')) return 'product-grid';
  if (lower.includes('health') || lower.includes('record')) return 'health-timeline';
  if (lower.includes('cart')) return 'cart';
  if (lower.includes('slot')) return 'slots';
  if (lower.includes('consultation')) return 'upcoming';
  return 'generic';
}

describe('Master Skeleton Loading System — Variant Resolution', () => {
  it('resolves explicit variant directly', () => {
    expect(resolveLoadingVariant('any text', 'doctor-list')).toBe('doctor-list');
    expect(resolveLoadingVariant(undefined, 'product-grid')).toBe('product-grid');
  });

  it('infers doctor-list from doctor loading message', () => {
    expect(resolveLoadingVariant('Finding doctors...')).toBe('doctor-list');
  });

  it('infers doctor-detail from doctor profile loading message', () => {
    expect(resolveLoadingVariant('Loading doctor profile...')).toBe('doctor-detail');
  });

  it('infers product-grid from products loading message', () => {
    expect(resolveLoadingVariant('Loading products...')).toBe('product-grid');
  });

  it('infers health-timeline from health records loading message', () => {
    expect(resolveLoadingVariant('Loading health records...')).toBe('health-timeline');
  });

  it('infers slots from slots loading message', () => {
    expect(resolveLoadingVariant('Loading slots...')).toBe('slots');
  });

  it('defaults to generic for unknown message', () => {
    expect(resolveLoadingVariant('Please wait...')).toBe('generic');
  });
});
