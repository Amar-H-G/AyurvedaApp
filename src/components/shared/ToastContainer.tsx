/**
 * Global Toast Container — subscribes to app store toasts and renders them.
 */
import React, { memo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppStore } from '../../store/app/appStore';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../design-system/Typography';
import { ToastConfig } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOAST_COLORS: Record<ToastConfig['type'], string> = {
  success: '#4CAF50',
  error: '#EF5350',
  info: '#2196F3',
  warning: '#FF9800',
};

const TOAST_ICONS: Record<ToastConfig['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

interface ToastItemProps {
  toast: ToastConfig;
  onDismiss: (id: string) => void;
}

const ToastItem = memo(({ toast, onDismiss }: ToastItemProps) => {
  const theme = useTheme();
  const bgColor = TOAST_COLORS[toast.type];

  return (
    <View
      style={[styles.toast, { backgroundColor: bgColor }]}
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      accessibilityLabel={toast.message}
    >
      <Typography variant="label" color="#FFF" style={styles.icon}>
        {TOAST_ICONS[toast.type]}
      </Typography>
      <Typography variant="bodySmall" color="#FFF" style={styles.message}>
        {toast.message}
      </Typography>
    </View>
  );
});

export const ToastContainer = memo(() => {
  const toasts = useAppStore(state => state.toasts);
  const dismissToast = useAppStore(state => state.dismissToast);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  icon: {
    marginRight: 8,
    fontSize: 14,
  },
  message: {
    flex: 1,
  },
});
