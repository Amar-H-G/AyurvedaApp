/**
 * Root Navigation — Tab Navigator wrapping the three module stacks.
 * Deep linking (Bonus #2) is configured here.
 */
import React, { memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/app/appStore';

// Screens — Consultations
import { DoctorListScreen } from '../modules/consultations/screens/DoctorListScreen';
import { DoctorDetailScreen } from '../modules/consultations/screens/DoctorDetailScreen';
import { UpcomingConsultationsScreen } from '../modules/consultations/screens/UpcomingConsultationsScreen';

// Screens — Shop
import { ProductListScreen } from '../modules/shop/screens/ProductListScreen';
import { CartScreen } from '../modules/shop/screens/CartScreen';

// Screens — Health Records
import { HealthRecordsScreen } from '../modules/healthRecords/screens/HealthRecordsScreen';

// Type definitions for navigation params
export type ConsultationStackParams = {
  DoctorList: undefined;
  DoctorDetail: { doctorId: string };
  UpcomingConsultations: undefined;
};

export type ShopStackParams = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
};

export type HealthStackParams = {
  HealthRecords: undefined;
  RecordDetail: { recordId: string };
};

const ConsultationStack = createNativeStackNavigator<ConsultationStackParams>();
const ShopStack = createNativeStackNavigator<ShopStackParams>();
const HealthStack = createNativeStackNavigator<HealthStackParams>();
const Tab = createBottomTabNavigator();

// Deep linking config (Bonus #2)
const linking = {
  prefixes: ['ayurveda://', 'https://ayurvedaapp.in'],
  config: {
    screens: {
      Consultations: {
        screens: {
          DoctorList: 'doctors',
          DoctorDetail: 'doctors/:doctorId',
          UpcomingConsultations: 'upcoming',
        },
      },
      Shop: {
        screens: {
          ProductList: 'shop',
          ProductDetail: 'shop/:productId',
          Cart: 'cart',
        },
      },
      Health: {
        screens: {
          HealthRecords: 'health',
          RecordDetail: 'health/:recordId',
        },
      },
    },
  },
};

function ConsultationNavigator() {
  const theme = useTheme();
  return (
    <ConsultationStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ConsultationStack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{ title: '🌿 Find a Doctor' }}
      />
      <ConsultationStack.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{ title: 'Doctor Profile' }}
      />
      <ConsultationStack.Screen
        name="UpcomingConsultations"
        component={UpcomingConsultationsScreen}
        options={{ title: 'Upcoming Consultations' }}
      />
    </ConsultationStack.Navigator>
  );
}

function ShopNavigator() {
  const theme = useTheme();
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ShopStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: '🛒 Ayurveda Shop' }}
      />
      <ShopStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'My Cart' }}
      />
    </ShopStack.Navigator>
  );
}

function HealthNavigator() {
  const theme = useTheme();
  return (
    <HealthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <HealthStack.Screen
        name="HealthRecords"
        component={HealthRecordsScreen}
        options={{ title: '🏥 Health Records' }}
      />
    </HealthStack.Navigator>
  );
}

function TabBarIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export function RootNavigator(): React.JSX.Element {
  const theme = useTheme();
  const toggleTheme = useAppStore(state => state.toggleTheme);
  const themeMode = useAppStore(state => state.themeMode);

  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '700' },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleTheme}
              style={{ marginRight: 16 }}
              accessibilityLabel={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 20 }}>{themeMode === 'dark' ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Tab.Screen
          name="Consultations"
          component={ConsultationNavigator}
          options={{
            tabBarLabel: 'Consult',
            tabBarIcon: ({ focused }) => <TabBarIcon emoji="👨‍⚕️" focused={focused} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Shop"
          component={ShopNavigator}
          options={{
            tabBarLabel: 'Shop',
            tabBarIcon: ({ focused }) => <TabBarIcon emoji="🌿" focused={focused} />,
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Health"
          component={HealthNavigator}
          options={{
            tabBarLabel: 'Records',
            tabBarIcon: ({ focused }) => <TabBarIcon emoji="🏥" focused={focused} />,
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
