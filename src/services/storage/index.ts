/**
 * AsyncStorage wrapper — typed persistence layer.
 * All storage operations go through this, never raw AsyncStorage calls in UI.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../logger';

const TAG = 'StorageService';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      Logger.error(TAG, `Failed to get key: ${key}`, err);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      Logger.error(TAG, `Failed to set key: ${key}`, err);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (err) {
      Logger.error(TAG, `Failed to remove key: ${key}`, err);
      return false;
    }
  },

  async multiGet<T>(keys: string[]): Promise<Partial<Record<string, T>>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Partial<Record<string, T>> = {};
      pairs.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value) as T;
          } catch {
            // invalid JSON — skip
          }
        }
      });
      return result;
    } catch (err) {
      Logger.error(TAG, 'multiGet failed', err);
      return {};
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      Logger.error(TAG, 'clear failed', err);
    }
  },
};
