/**
 * Mock API Client — simulates realistic network behaviour.
 *
 * All real API calls would go here, replaced by mock implementations
 * that can simulate: latency, failures, timeouts, empty/partial responses.
 *
 * Architecture: UI → Hooks/Services → MockApiClient → Generated Data
 * Replacing this with a real backend requires only changes here.
 */
import { ENV } from '../../config/env';
import { Logger } from '../logger';
import { ApiError, PaginatedResponse } from '../../types';

const TAG = 'MockApiClient';

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export type MockScenario = 'normal' | 'slow' | 'timeout' | 'failure' | 'empty' | 'partial';

let _currentScenario: MockScenario = 'normal';

export function setMockScenario(scenario: MockScenario): void {
  _currentScenario = scenario;
  Logger.info(TAG, `Mock scenario changed to: ${scenario}`);
}

export function getMockScenario(): MockScenario {
  return _currentScenario;
}

async function simulateNetwork(): Promise<void> {
  switch (_currentScenario) {
    case 'slow':
      await delay(3000 + Math.random() * 2000);
      break;
    case 'timeout':
      await delay(ENV.API_TIMEOUT_MS + 1000);
      break;
    case 'normal':
    default:
      await delay(ENV.MOCK_API_LATENCY_MS + Math.random() * 400);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldFail(): boolean {
  return Math.random() < ENV.MOCK_FAILURE_RATE;
}

function makeError(code: string, message: string, statusCode?: number): ApiError {
  return { code, message, statusCode };
}

/**
 * Core mock request handler.
 * T = the type of the successful response data.
 */
export async function mockRequest<T>(
  factory: () => T | null,
  options: {
    scenario?: MockScenario;
    parseJson?: boolean;
  } = {}
): Promise<ApiResult<T>> {
  const effectiveScenario = options.scenario ?? _currentScenario;

  Logger.debug(TAG, `Request starting, scenario=${effectiveScenario}`);

  try {
    // Simulate network
    if (effectiveScenario === 'timeout') {
      await delay(ENV.API_TIMEOUT_MS + 500);
      return { success: false, error: makeError('TIMEOUT', 'Request timed out', 408) };
    }

    await delay(
      effectiveScenario === 'slow'
        ? 3000 + Math.random() * 2000
        : ENV.MOCK_API_LATENCY_MS + Math.random() * 300
    );

    if (effectiveScenario === 'failure' || shouldFail()) {
      Logger.warn(TAG, 'Simulated random failure');
      return { success: false, error: makeError('SERVER_ERROR', 'Internal server error', 500) };
    }

    if (effectiveScenario === 'empty') {
      Logger.debug(TAG, 'Returning empty response');
      return { success: true, data: ([] as unknown) as T };
    }

    const data = factory();

    if (data === null) {
      return { success: false, error: makeError('NOT_FOUND', 'Resource not found', 404) };
    }

    if (effectiveScenario === 'partial') {
      // Simulate partial response by truncating arrays
      if (Array.isArray(data)) {
        const partial = data.slice(0, Math.floor(data.length / 2));
        Logger.warn(TAG, 'Returning partial response');
        return { success: true, data: (partial as unknown) as T };
      }
    }

    Logger.debug(TAG, 'Request successful');
    return { success: true, data };
  } catch (err) {
    Logger.error(TAG, 'Unexpected error in mock request', err);
    return {
      success: false,
      error: makeError('UNKNOWN', 'An unexpected error occurred'),
    };
  }
}

/**
 * Paginate an in-memory dataset.
 */
export function paginate<T>(
  data: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = data.slice(start, end);
  return {
    data: slice,
    total: data.length,
    page,
    pageSize,
    hasMore: end < data.length,
  };
}
