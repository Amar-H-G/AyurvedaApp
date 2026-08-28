/**
 * App Store — global UI state: theme, toast, network, feature flags.
 */
import { create } from 'zustand';
import { ToastConfig, ThemeMode, FeatureFlags } from '../../types';
import { storage } from '../../services/storage';
import { STORAGE_KEYS } from '../../constants';
import { Logger } from '../../services/logger';

const TAG = 'AppStore';

interface AppState {
  themeMode: ThemeMode;
  toasts: ToastConfig[];
  isOnline: boolean;
  isSyncing: boolean;
  featureFlags: FeatureFlags;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  dismissToast: (id: string) => void;
  setIsOnline: (online: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  loadPersistedTheme: () => Promise<void>;
}

const DEFAULT_FLAGS: FeatureFlags = {
  deepLinking: true,
  localization: true,
  performanceMonitoring: true,
  biometricAuth: false,
  crashReporting: true,
  backgroundSync: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'light',
  toasts: [],
  isOnline: true,
  isSyncing: false,
  featureFlags: DEFAULT_FLAGS,

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    storage.set(STORAGE_KEYS.THEME_MODE, mode).catch(() => {});
    Logger.debug(TAG, `Theme set to: ${mode}`);
  },

  toggleTheme: () => {
    const current = get().themeMode;
    get().setThemeMode(current === 'light' ? 'dark' : 'light');
  },

  showToast: (config) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const toast: ToastConfig = { ...config, id, duration: config.duration ?? 3000 };
    set(state => ({ toasts: [...state.toasts, toast] }));

    // Auto-dismiss
    setTimeout(() => {
      get().dismissToast(id);
    }, toast.duration);
  },

  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  setIsOnline: (online) => {
    set({ isOnline: online });
    Logger.info(TAG, `Network status: ${online ? 'ONLINE' : 'OFFLINE'}`);
  },

  setIsSyncing: (syncing) => {
    set({ isSyncing: syncing });
  },

  setFeatureFlags: (flags) => {
    set(state => ({ featureFlags: { ...state.featureFlags, ...flags } }));
  },

  loadPersistedTheme: async () => {
    const saved = await storage.get<ThemeMode>(STORAGE_KEYS.THEME_MODE);
    if (saved) {
      set({ themeMode: saved });
    }
  },
}));
