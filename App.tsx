/**
 * App.tsx — Root component.
 * Initialises: theme, storage, feature flags, network sync.
 * Wraps: SafeAreaProvider, ErrorBoundary, NavigationContainer, ToastContainer, SplashScreenView.
 */
import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastContainer } from './src/components/shared/ToastContainer';
import { ErrorBoundary } from './src/components/shared/ErrorBoundary';
import { SplashScreenView } from './src/components/shared/SplashScreenView';
import { useNetworkSync } from './src/hooks/useNetworkSync';
import { useConsultationStore } from './src/store/consultations/consultationStore';
import { useShopStore } from './src/store/shop/shopStore';
import { useAppStore } from './src/store/app/appStore';
import { featureFlagsService } from './src/services/featureFlags';
import { Logger } from './src/services/logger';
import { useTheme } from './src/hooks/useTheme';

const TAG = 'App';

function AppContent(): React.JSX.Element {
  const theme = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  // Register network monitor + offline sync
  useNetworkSync();

  // Bootstrap all persistent state
  useEffect(() => {
    const bootstrap = async () => {
      Logger.info(TAG, 'Bootstrapping app...');
      await Promise.all([
        useAppStore.getState().loadPersistedTheme(),
        useConsultationStore.getState().loadFromStorage(),
        useShopStore.getState().loadFromStorage(),
      ]);
      featureFlagsService.initialize();
      Logger.info(TAG, 'Bootstrap complete');
    };

    bootstrap();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <RootNavigator />
      <ToastContainer />
      {showSplash && <SplashScreenView onFinish={() => setShowSplash(false)} />}
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
