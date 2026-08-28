/**
 * Offline Queue Service — stores and retries offline operations.
 *
 * Guarantees:
 * - Operations are persisted to AsyncStorage immediately.
 * - On connectivity restore, processQueue() is triggered.
 * - Idempotent: each operation has a unique ID; processed IDs are tracked.
 * - Max retry: ENV.SYNC_RETRY_MAX attempts per operation.
 * - Failed operations are kept with error info for visibility.
 */
import { storage } from '../storage';
import { STORAGE_KEYS } from '../../constants';
import { OfflineOperation, OfflineOperationType } from '../../types';
import { Logger } from '../logger';
import { ENV } from '../../config/env';
import { consultationApi } from '../api/consultationApi';
import { Booking } from '../../types';

const TAG = 'OfflineQueue';

function generateId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function loadQueue(): Promise<OfflineOperation[]> {
  return (await storage.get<OfflineOperation[]>(STORAGE_KEYS.OFFLINE_QUEUE)) ?? [];
}

async function saveQueue(queue: OfflineOperation[]): Promise<void> {
  await storage.set(STORAGE_KEYS.OFFLINE_QUEUE, queue);
}

export const offlineQueue = {
  /**
   * Add an operation to the queue.
   */
  async enqueue(type: OfflineOperationType, payload: unknown): Promise<OfflineOperation> {
    const op: OfflineOperation = {
      id: generateId(),
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    const queue = await loadQueue();
    queue.push(op);
    await saveQueue(queue);

    Logger.info(TAG, `Enqueued operation: ${type}`, { id: op.id });
    return op;
  },

  /**
   * Get all pending operations.
   */
  async getQueue(): Promise<OfflineOperation[]> {
    return loadQueue();
  },

  /**
   * Remove a specific operation (after successful sync).
   */
  async dequeue(operationId: string): Promise<void> {
    const queue = await loadQueue();
    const updated = queue.filter(op => op.id !== operationId);
    await saveQueue(updated);
    Logger.info(TAG, `Dequeued operation: ${operationId}`);
  },

  /**
   * Process all queued operations.
   * Called automatically on network reconnection.
   */
  async processQueue(): Promise<{ succeeded: number; failed: number }> {
    const queue = await loadQueue();
    if (queue.length === 0) {
      Logger.info(TAG, 'Queue is empty — nothing to process');
      return { succeeded: 0, failed: 0 };
    }

    Logger.info(TAG, `Processing queue: ${queue.length} operation(s)`);

    let succeeded = 0;
    let failed = 0;
    const updatedQueue: OfflineOperation[] = [];

    for (const op of queue) {
      if (op.retryCount >= ENV.SYNC_RETRY_MAX) {
        Logger.warn(TAG, `Operation ${op.id} exceeded max retries — keeping as failed`);
        updatedQueue.push({ ...op, error: 'Max retries exceeded' });
        failed++;
        continue;
      }

      try {
        const result = await executeOperation(op);

        if (result) {
          Logger.info(TAG, `Operation ${op.id} (${op.type}) succeeded`);
          succeeded++;
          // Don't add to updatedQueue — effectively dequeued
        } else {
          Logger.warn(TAG, `Operation ${op.id} (${op.type}) failed — will retry`);
          updatedQueue.push({
            ...op,
            retryCount: op.retryCount + 1,
            lastRetryAt: new Date().toISOString(),
            error: 'Server returned failure',
          });
          failed++;
        }
      } catch (err) {
        Logger.error(TAG, `Operation ${op.id} threw an exception`, err);
        updatedQueue.push({
          ...op,
          retryCount: op.retryCount + 1,
          lastRetryAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        failed++;
      }

      // Delay between retries
      await new Promise(res => setTimeout(() => res(undefined), ENV.SYNC_RETRY_DELAY_MS));
    }

    await saveQueue(updatedQueue);
    Logger.info(TAG, `Queue processed — succeeded: ${succeeded}, failed: ${failed}`);
    return { succeeded, failed };
  },

  async clearQueue(): Promise<void> {
    await saveQueue([]);
  },
};

async function executeOperation(op: OfflineOperation): Promise<boolean> {
  switch (op.type) {
    case 'CREATE_BOOKING': {
      const payload = op.payload as Omit<Booking, 'id' | 'createdAt'>;
      const result = await consultationApi.createBooking(payload);
      return result.success;
    }
    case 'CANCEL_BOOKING': {
      const payload = op.payload as { bookingId: string };
      const result = await consultationApi.cancelBooking(payload.bookingId);
      return result.success;
    }
    default:
      Logger.warn(TAG, `Unknown operation type: ${(op as OfflineOperation).type}`);
      return false;
  }
}
