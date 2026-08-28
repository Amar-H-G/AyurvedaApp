/**
 * Root Navigation — Tab Navigator wrapping the three module stacks.
 * Deep linking (Bonus #2) is configured here.
 */
import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/app/appStore';
import { useConsultationStore } from '../store/consultations/consultationStore';

// Screens — Consultations
import { DoctorListScreen } from '../modules/consultations/screens/DoctorListScreen';
import { DoctorDetailScreen } from '../modules/consultations/screens/DoctorDetailScreen';
import { UpcomingConsultationsScreen } from '../modules/consultations/screens/UpcomingConsultationsScreen';

// Screens — Shop
import { ShopHomeScreen } from '../modules/shop/screens/ShopHomeScreen';
import { ProductListScreen } from '../modules/shop/screens/ProductListScreen';
import { ProductDetailScreen } from '../modules/shop/screens/ProductDetailScreen';
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
  ShopHome: undefined;
  ProductList: { initialCategory?: string; initialSearch?: string } | undefined;
  ProductDetail: { productId: string };
  ProductDetails: { productId: string };
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
const linking: LinkingOptions<any> = {
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
          ShopHome: 'shop',
          ProductList: 'shop/products',
          ProductDetail: 'shop/:productId',
          ProductDetails: 'shop/details/:productId',
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

function HeaderUpcomingButton({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const upcomingCount = useConsultationStore(state => state.getUpcomingBookings().length);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('UpcomingConsultations')}
      style={[styles.headerBtn, { backgroundColor: theme.colors.primary + '14', borderColor: theme.colors.primary + '30' }]}
      accessibilityLabel={`View ${upcomingCount} upcoming consultations`}
      accessibilityRole="button"
      testID="header-upcoming-bookings-btn"
    >
      <Text style={styles.headerBtnIcon}>📅</Text>
      <Text style={[styles.headerBtnText, { color: theme.colors.primary }]}>Bookings</Text>
      {upcomingCount > 0 && (
        <View style={[styles.headerBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.headerBadgeText}>{upcomingCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ConsultationNavigator() {
  const theme = useTheme();

  return (
    <ConsultationStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '700' },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ConsultationStack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={({ navigation }) => ({
          title: '🌿 Find a Doctor',
          headerRight: () => <HeaderUpcomingButton navigation={navigation} />,
        })}
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
      initialRouteName="ShopHome"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '700' },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ShopStack.Screen
        name="ShopHome"
        component={ShopHomeScreen}
        options={{ title: '🌿 Amrutam Shop' }}
      />
      <ShopStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: 'All Products' }}
      />
      <ShopStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <ShopStack.Screen
        name="ProductDetails"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
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
        headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '700' },
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
  const upcomingCount = useConsultationStore(state => state.getUpcomingBookings().length);

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
            tabBarBadge: upcomingCount > 0 ? upcomingCount : undefined,
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

const styles = StyleSheet.create({
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    gap: 4,
  },
  headerBtnIcon: {
    fontSize: 14,
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerBadge: {
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
