# Amrutam Ayurvedic Super App
## Senior React Native Mobile Application

---

## 1. Project Overview

The Amrutam Ayurvedic Super App is a modular, offline-first mobile application built with React Native. It combines three core health and wellness domains into a single unified platform:

| Module | Scale | Core Features |
|--------|-------|---------------|
| **Consultations** | 5,000 doctors | Doctor discovery, debounced search, specialty filtering, detailed profile, slot selection, booking flow, slot conflict detection, upcoming appointments, and cancellation |
| **Shop** | 20,000 products | 2-column grid layout, infinite scroll pagination, debounced search, multi-filter (category, price, stock), 5-way sorting, cart management, wishlist, and checkout summary |
| **Health Records** | 10,000 records | Timeline view grouped by month and year, record type chips, search, tag filtering, and attachment previews |

---

## 2. Quick Start

### Prerequisites
- Node.js >= 18
- React Native CLI configured for Android/iOS development environment

### Installation & Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run TypeScript compilation check
npx tsc --noEmit

# 3. Run Jest test suite
npx jest --forceExit --no-coverage

# 4. Start Metro bundler
npm start

# 5. Run on Android emulator / device
npx react-native run-android
```

---

## 3. Tech Stack

| Technology | Choice | Rationale |
|-----------|--------|-----------|
| **React Native 0.74** | Core Framework | Mobile platform baseline with New Architecture compatibility |
| **TypeScript 5** | Language | Full strict type safety (`strict: true`), zero `any` types across domain models and UI |
| **React Navigation 6** | Navigation | Tab navigator for root modules with nested Native Stack navigators and deep linking support |
| **Zustand 4** | State Management | Selector-based, lightweight global state stores for UI theme, cart, and bookings |
| **AsyncStorage** | Storage | Persistent storage for shopping cart, user bookings, feature flags, and offline queue |
| **NetInfo** | Network Status | Network connectivity monitoring for automatic offline detection and sync triggers |
| **date-fns 3** | Date Formatting | Modular date manipulation and formatting utilities |
| **Jest 29** | Testing Framework | Unit and integration test runner configured with React Native preset |

---

## 4. Folder Structure

```
AyurvedaApp/
├── src/
│   ├── config/           # Environment variables, timeout thresholds, pagination constants
│   ├── types/            # Centralized TypeScript definitions and domain models
│   ├── constants/        # Storage keys, filter options, specialty options
│   ├── theme/            # Design system tokens (colors, typography, spacing) & theme objects
│   ├── services/
│   │   ├── api/          # Repository API layer & Mock Network Client with failure simulation
│   │   ├── storage/      # Typed AsyncStorage abstraction
│   │   ├── offline/      # Offline operation queue with retry logic
│   │   ├── logger/       # Level-filtered logging service & crash reporting abstraction
│   │   └── featureFlags/ # Feature flag management service
│   ├── store/
│   │   ├── app/          # Global UI state (theme, toasts, network status, feature flags)
│   │   ├── consultations/# Booking state, upcoming appointments, slot conflict detection
│   │   └── shop/         # Cart items, quantity mutations, wishlist IDs
│   ├── hooks/            # Shared hooks (useTheme, useDebounce, useNetworkSync)
│   ├── data/
│   │   └── generators/   # Deterministic mock generators (5k doctors, 20k products, 10k records)
│   ├── components/
│   │   ├── design-system/# Reusable UI tokens (Typography, Button, Card, SearchBar, Chip, StateViews)
│   │   └── shared/       # ErrorBoundary & ToastContainer
│   ├── modules/
│   │   ├── consultations/ # Module screens, hooks (useDoctors, useBooking), and DoctorCard
│   │   ├── shop/          # Module screens, hooks (useProducts), and ProductCard
│   │   └── healthRecords/ # Module screens and hooks (useHealthRecords)
│   └── navigation/       # RootNavigator (Tab bar + Stack navigators + Deep link mappings)
├── __tests__/
│   ├── unit/             # Business logic tests (generators, cart math, conflict detection, utils)
│   └── e2e/              # Logic-level E2E tests for module user journeys
└── __mocks__/            # Jest mocks for AsyncStorage and NetInfo
```

---

## 5. Architecture & Layered Design

The application enforces strict separation of concerns across a 4-tier layer structure:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│      React Native Screens & Design System Components        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain Hook Layer                        │
│   useDoctors, useBooking, useProducts, useHealthRecords      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Repository API Layer                       │
│    consultationApi, shopApi, healthRecordsApi               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             Mock Client & Infrastructure                    │
│   mockApiClient (Latency/Jitter) & Generator Singletons      │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Principles
- **Clean Component Boundaries**: Screens delegate state management, side-effects, and data fetching to custom domain hooks. Screens focus exclusively on layout and user interaction.
- **Backend Decoupling**: API repository classes (`consultationApi`, `shopApi`, `healthRecordsApi`) isolate the presentation layer from backend implementation details. Swapping the mock layer for production REST/GraphQL endpoints requires zero UI changes.
- **Explicit Imports**: Modules import cleanly from dedicated domain directories without circular dependencies.

---

## 6. State Management Architecture

State is partitioned according to scope and persistence requirements:

| State Scope | Technology | Purpose | Persistence |
|-------------|------------|---------|-------------|
| **Global UI** | Zustand (`appStore`) | Theme mode (Light/Dark), toast alerts, network connection state, feature flags | Theme and feature flags stored to AsyncStorage |
| **Consultation State** | Zustand (`consultationStore`) | Active bookings, pending appointments, slot conflict checking | Persisted to AsyncStorage |
| **Cart & Wishlist** | Zustand (`shopStore`) | Cart items, quantity updates, total calculation, wishlist item IDs | Persisted to AsyncStorage |
| **Offline Operation Queue** | `offlineQueue` Service | Queued booking and mutation requests generated while offline | Persisted to AsyncStorage |
| **Server/Screen State** | React `useState` / `useReducer` inside custom hooks | Search queries, selected filter values, active page numbers, loading/error states | Transient (reset on unmount) |

### Why Zustand?
- **Selector Optimization**: Components re-render only when their specific slice of state changes (e.g., subscribing strictly to `cartItemCount`).
- **Framework Agnostic Access**: Zustand stores can be inspected and mutated directly outside React component render trees (e.g., inside offline sync handlers).
- **Minimal Overhead**: Eliminates Redux boilerplate actions and reducer hierarchy while avoiding React Context re-render cascades.

---

## 7. Performance Strategy

To handle high-volume datasets (5,000 doctors, 20,000 products, and 10,000 health records), the application implements the following techniques:

### Virtualization & List Optimization
- **Doctor List (5,000 items)**: Single-column `FlatList` utilizing `getItemLayout` with a fixed item height (148px) to bypass dynamic measurement passes. Configured with `removeClippedSubviews`, `maxToRenderPerBatch={10}`, `windowSize={10}`, and `initialNumToRender={8}`.
- **Product Grid (20,000 items)**: 2-column `FlatList` (`numColumns={2}`) with initial batching (`initialNumToRender={6}`), windowing (`windowSize={10}`), and on-demand pagination (20 items per page).
- **Health Records Timeline (10,000 items)**: `SectionList` grouped by Month/Year with sticky headers, item virtualization, and clipping enabled.

### Component Memoization & Rendering Efficiency
- **Pure Component Rendering**: `React.memo` wraps list item components (`DoctorCard`, `ProductCard`, `RecordCard`, `Chip`, `Typography`, `Button`).
- **Stable References**: `useCallback` wraps all list item event handlers (`onPress`, `onAddToCart`, `onToggleWishlist`) to prevent callback reference changes across renders.
- **Search Debouncing**: `useDebounce` delays search query updates by 300ms before executing search filtering routines, preventing execution on every keystroke.
- **Singleton Generators**: Data generation algorithms run once per session and cache results in memory via singleton instances.

---

## 8. Offline-First Architecture

### Offline Cache & Fallback
1. **Network Monitoring**: `useNetworkSync` listens to real-time network connectivity transitions using NetInfo.
2. **Read Caching**: Initial pages fetched while online are automatically stored in AsyncStorage. When offline, API repositories detect the network status and return cached data along with an offline indicator banner.

### Offline Storage & Queue System
1. **Cart Operations**: Cart additions, quantity updates, and item removals are immediately stored in AsyncStorage. The shopping cart remains fully functional offline.
2. **Offline Booking Queue**:
   - Booking attempts made while offline are saved to an offline queue in AsyncStorage and marked as `status: 'queued'`.
   - The UI immediately displays the appointment in the "Upcoming Consultations" screen with a "Queued (Offline)" badge.
   - Upon network restoration, `useNetworkSync` detects connectivity and invokes `offlineQueue.processQueue()`.
   - Each operation is retried with an exponential backoff policy (up to `SYNC_RETRY_MAX=3`).
   - Successful operations are dequeued, and a synchronization toast notification informs the user.

---

## 9. Failure Handling & Resilience

Network and API failures are simulated via `mockApiClient.ts`:

| Simulated Condition | Client Engine Behavior | Presentation Layer Handling |
|---------------------|------------------------|-----------------------------|
| **Normal Latency** | 800ms base delay + 0–400ms jitter | Standard `LoadingState` activity indicator |
| **Slow Network** | 3–5 second artificial delay | Extended loading indicator with user feedback |
| **API Timeout** | Aborts request after 10,000ms threshold | Displays `ErrorState` with retry button |
| **Random 500 Failure** | 5% probabilistic failure injection | Shows error toast banner + retry button |
| **Empty Response** | Returns zero items | Displays `EmptyState` component with action callout |
| **Partial Response** | Returns first 50% of page data | Displays available items with pagination retry |
| **Uncaught Exception** | React component render crash | Captured by `ErrorBoundary` with fallback crash screen |

---

## 10. Selected Bonus Features

### 1. Feature Flags Service (`src/services/featureFlags/`)
- **Purpose**: Simulates a remote configuration service (similar to Firebase Remote Config or LaunchDarkly) with local persistence and periodic refresh.
- **Value**: Allows toggling experimental features, deep links, or specific flows dynamically without requiring a binary app store update.

### 2. Deep Linking Configuration (`src/navigation/RootNavigator.tsx`)
- **Purpose**: Configures React Navigation linking specs for URL schemes (`ayurveda://`) and universal web links (`https://ayurvedaapp.in`).
- **Value**: Enables direct navigation to specific doctor profiles (`ayurveda://doctors/doc_00001`) or shop products (`ayurveda://shop/prod_000001`) from push notifications and external links.

### 3. Centralized Crash Reporting Abstraction (`src/services/logger/`)
- **Purpose**: Provides a unified `Logger.captureException` entry point that routes errors through level filtering.
- **Value**: Prepares the application for Sentry or Crashlytics integration by isolating error logging to a single service call rather than scattering SDK invocations across screens.

---

## 11. Testing & Quality Assurance

### Testing Infrastructure
- **Framework**: Jest with `@testing-library/react-native` and custom AsyncStorage/NetInfo mocks.
- **Execution**: Run `npx jest --forceExit --no-coverage` from the project root.

### Verified Test Results (49 Passed)
The complete test suite has been executed and verified:

```
PASS __tests__/unit/businessLogic.test.ts
PASS __tests__/unit/utils.test.ts
PASS __tests__/e2e/consultationFlow.test.ts

Test Suites: 3 passed, 3 total
Tests:       49 passed, 49 total
Snapshots:   0 total
Time:        1.771 s
```

### Coverage Breakdown
1. **`businessLogic.test.ts` (24 tests)**: Tests dataset generator output validity, cart pricing math, slot conflict detection algorithms, and multi-filter/sorting functions.
2. **`utils.test.ts` (11 tests)**: Tests health record month/year grouping algorithms, search debounce timers, offline queue retry rules, and pagination helpers.
3. **`consultationFlow.test.ts` (14 tests)**: End-to-end logic test covering the full consultation booking journey, product listing/cart flow, and health record timeline filtering across large datasets.

---

## 12. Environment Configuration

Application environment variables and runtime thresholds are managed in `src/config/env.ts`:

- **API Settings**: Base URLs, network timeouts (10,000ms), and failure rates.
- **Debounce & Pagination**: Search debounce delay (300ms) and default page sizes (20 items).
- **Offline Sync**: Maximum retry attempts (3) and retry delays (2,000ms).

In a production deployment, these values would be populated via `react-native-config` using environment `.env` files per stage (Development, Staging, Production).

---

## 13. Engineering Trade-offs

| Engineering Decision | Advantage | Trade-off |
|----------------------|-----------|-----------|
| **Zustand over Redux Toolkit** | Eliminates boilerplate; lightweight footprint; fast selector performance | Less standardized devtools compared to Redux DevTools |
| **In-Memory Mock API** | Enables fast, self-contained development without external server dependencies | Does not simulate actual HTTP network stack overhead or socket states |
| **System Emojis over Native Vectors** | Zero native icon library linking overhead; reliable cross-platform rendering | Less visual customizability than custom SVG icon sets |
| **Logic-Level E2E Tests** | Extremely fast execution speed (~1.7s); zero emulator dependencies in CI | Does not automate actual touch events on native UI layers (requires Detox/Maestro for UI E2E) |

---

## 14. Future Production Enhancements

- [ ] **Native UI E2E Automation**: Integrate Detox or Maestro for end-to-end UI interaction testing.
- [ ] **High-Performance Storage Engine**: Migrate from AsyncStorage to `react-native-mmkv` for faster synchronous key-value storage.
- [ ] **Server State Management**: Introduce TanStack Query (React Query) for automated background revalidation and cache management.
- [ ] **Advanced Image Caching**: Implement `react-native-fast-image` for disk caching of doctor avatars and product images.
- [ ] **Internationalization (i18n)**: Add multi-language translation support via `react-i18next`.
