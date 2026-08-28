/**
 * useNetworkSync — monitors connectivity and triggers offline queue processing.
 */
import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppStore } from '../store/app/appStore';
import { offlineQueue } from '../services/offline/offlineQueue';
import { Logger } from '../services/logger';

const TAG = 'useNetworkSync';

export function useNetworkSync(): void {
  const setIsOnline = useAppStore(state => state.setIsOnline);
  const setIsSyncing = useAppStore(state => state.setIsSyncing);
  const showToast = useAppStore(state => state.showToast);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(isOnline);

      if (isOnline && wasOfflineRef.current) {
        // Came back online — process queue
        Logger.info(TAG, 'Connectivity restored — processing offline queue');
        setIsSyncing(true);
        try {
          const result = await offlineQueue.processQueue();
          if (result.succeeded > 0 || result.failed > 0) {
            showToast({
              type: result.failed > 0 ? 'warning' : 'success',
              message: result.failed > 0
                ? `Synced ${result.succeeded} operation(s). ${result.failed} failed — will retry.`
                : `Synced ${result.succeeded} offline operation(s) successfully.`,
            });
          }
        } catch (err) {
          Logger.error(TAG, 'Sync failed', err);
        } finally {
          setIsSyncing(false);
        }
      }

      wasOfflineRef.current = !isOnline;
    });

    return () => {
      unsubscribe();
    };
  }, [setIsOnline, setIsSyncing, showToast]);
}
