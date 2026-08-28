/**
 * Feature Flags Service — Bonus Feature #1.
 *
 * Why chosen: Feature flags allow controlled rollouts, A/B testing,
 * and instant disable of features without a code release — critical for
 * a production health app where stability is paramount.
 *
 * In production: backed by Firebase Remote Config or LaunchDarkly.
 * Here: simulated with local defaults + mock "remote" refresh.
 */
import { storage } from '../storage';
import { FeatureFlags } from '../../types';
import { Logger } from '../logger';
import { useAppStore } from '../../store/app/appStore';
import { ENV } from '../../config/env';

const TAG = 'FeatureFlags';
const STORAGE_KEY = '@ayurveda/feature_flags';

// Simulated "remote" config — in production this calls a real endpoint
const REMOTE_CONFIG: FeatureFlags = {
  deepLinking: true,
  localization: true,
  performanceMonitoring: true,
  biometricAuth: false,
  crashReporting: true,
  backgroundSync: true,
};

export const featureFlagsService = {
  async initialize(): Promise<void> {
    try {
      // Try to load cached flags first
      const cached = await storage.get<FeatureFlags>(STORAGE_KEY);
      if (cached) {
        useAppStore.getState().setFeatureFlags(cached);
        Logger.info(TAG, 'Loaded cached feature flags');
      }

      // Simulate remote fetch
      await new Promise(res => setTimeout(() => res(undefined), 500));
      const remote = REMOTE_CONFIG;
      useAppStore.getState().setFeatureFlags(remote);
      await storage.set(STORAGE_KEY, remote);
      Logger.info(TAG, 'Remote feature flags loaded', remote);
    } catch (err) {
      Logger.warn(TAG, 'Failed to load remote feature flags, using defaults', err);
    }
  },

  isEnabled(flag: keyof FeatureFlags): boolean {
    return useAppStore.getState().featureFlags[flag];
  },

  startPeriodicRefresh(): () => void {
    const interval = setInterval(async () => {
      try {
        // In production: call remote config API
        Logger.debug(TAG, 'Refreshing feature flags (periodic)');
        useAppStore.getState().setFeatureFlags(REMOTE_CONFIG);
      } catch (err) {
        Logger.warn(TAG, 'Periodic flag refresh failed', err);
      }
    }, ENV.FEATURE_FLAGS_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  },
};
