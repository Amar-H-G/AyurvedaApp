# Amrutam Senior React Native Assignment
## Ayurveda Super App — Production-Ready Implementation

---

## 1. Project Overview

A production-oriented Ayurvedic Super App with three independent modules:

| Module | Scale | Key Features |
|--------|-------|--------------|
| **Consultations** | 5,000 doctors | Booking, slots, conflict detection, offline queue |
| **Shop** | 20,000 products | Infinite scroll, cart, wishlist, multi-filter, checkout |
| **Health Records** | 10,000 records | Timeline, grouped by month/year, attachments, tags |

---

## 2. Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run on Android
npx react-native run-android

# Run tests
npx jest --forceExit --no-coverage

# TypeScript check
npx tsc --noEmit
```

---

## 3. Tech Stack

| Technology | Choice | Rationale |
|-----------|--------|-----------|
| **React Native 0.74** | Core framework | Assignment requirement |
| **TypeScript 5** | Language | Assignment requirement; full type safety |
| **React Navigation 6** | Navigation | Assignment requirement; stack + tab navigator |
| **Zustand 4** | State management | See decision below |
| **AsyncStorage** | Local persistence | Cart, bookings, cache, offline queue |
| **NetInfo** | Network detection | Offline detection → sync trigger |
| **date-fns 3** | Date utilities | Lightweight, tree-shakeable |
| **Jest 29** | Testing | React Native preset |

---

## 4. Folder Structure

```
AyurvedaApp/
├── src/
│   ├── config/           # ENV constants, API config
│   ├── types/            # All TypeScript interfaces (single source)
│   ├── constants/        # Storage keys, labels, magic values
│   ├── theme/
│   │   ├── tokens.ts     # Design tokens (colour, spacing, typography)
│   │   └── themes.ts     # Light + dark theme objects
│   ├── services/
│   │   ├── api/          # Repository layer (mockApiClient, consultationApi, shopApi, healthRecordsApi)
│   │   ├── storage/      # Typed AsyncStorage wrapper
│   │   ├── offline/      # Offline queue with retry logic
│   │   ├── logger/       # Centralised logger + crash-reporting abstraction
│   │   └── featureFlags/ # Feature flag service (Bonus #1)
│   ├── store/
│   │   ├── app/          # Theme, toast, network, feature flags
│   │   ├── consultations/# Bookings, offline ops, conflict detection
│   │   └── shop/         # Cart, wishlist, persistence
│   ├── hooks/            # useTheme, useDebounce, useNetworkSync
│   ├── data/
│   │   └── generators/   # Deterministic data: doctors, products, records
│   ├── components/
│   │   ├── design-system/# Typography, Button, Card, SearchBar, Chip, StateViews
│   │   └── shared/       # ErrorBoundary, ToastContainer
│   ├── modules/
│   │   ├── consultations/ # hooks/, components/, screens/
│   │   ├── shop/          # hooks/, components/, screens/
│   │   └── healthRecords/ # hooks/, components/, screens/
│   └── navigation/       # RootNavigator (tabs + stacks + deep links)
├── __tests__/
│   ├── unit/             # businessLogic.test.ts, utils.test.ts
│   └── e2e/              # consultationFlow.test.ts
└── __mocks__/            # AsyncStorage, NetInfo mocks
```

---

## 5. Architecture

### Layered Separation

```
UI (Screens)
    ↓
Module Hooks (useDoctors, useProducts, useHealthRecords, useBooking)
    ↓
API Repository Layer (consultationApi, shopApi, healthRecordsApi)
    ↓
Mock API Client (latency simulation, failure injection)
    ↓
Deterministic Data Generators (doctorGenerator, productGenerator, recordGenerator)
```

**Replacing the mock backend** with a real API requires only changing the API repository layer — all hooks and UI are decoupled.

### Key Decisions

- **No God Components**: Each screen delegates to a focused hook; screens are pure UI.
- **No barrel imports**: Each module explicitly imports from its own layer.
- **Memo everywhere that matters**: FlatList items, card components, tab bar icons.

---

## 6. State Management Decision

**Chosen: Zustand** over Redux Toolkit / React Context / MobX.

| Concern | Solution |
|---------|----------|
| Server/UI data | Module hooks (local useState) |
| App-global UI | `useAppStore` (theme, toasts, network, flags) |
| Bookings | `useConsultationStore` (persisted to AsyncStorage) |
| Cart + Wishlist | `useShopStore` (persisted to AsyncStorage) |
| Offline queue | `offlineQueue` service (persisted to AsyncStorage) |
| Health records | Local hook state (no global store needed) |

**Why Zustand over Redux:** Zero boilerplate, built-in selectors prevent unnecessary re-renders, tiny bundle, easy async actions. Each store is independent — no single global slice.

**Why not Context:** Context re-renders all consumers on every change. Unsuitable for high-frequency state (cart item count, toasts).

---

## 7. Performance Strategy

### Large Dataset Handling

| Dataset | Strategy |
|---------|----------|
| 5,000 doctors | Paginated (20/page), `FlatList` with `getItemLayout`, `removeClippedSubviews`, `maxToRenderPerBatch=10` |
| 20,000 products | Paginated (20/page), 2-column `FlatList`, `windowSize=10`, `initialNumToRender=6` |
| 10,000 records | Grouped, `SectionList`, sticky section headers, `maxToRenderPerBatch=10` |

### Component-Level

- `React.memo` on all list items (`DoctorCard`, `ProductCard`, `RecordCard`, `BookingCard`)
- `useCallback` for all event handlers passed as props
- `useMemo` for derived data (slot grouping, filter panels, section headers)
- `useDebounce(300ms)` on all search inputs — prevents per-keystroke API calls
- `getItemLayout` on doctor list — enables O(1) scroll position calculation
- `loadingRef` guard in hooks — prevents concurrent page fetches

### Data Generation

- All 5k/20k/10k datasets generated **once** (module-level singleton cache)
- Deterministic: same index always produces same data — no randomness overhead
- Filtering/sorting operates on in-memory arrays — sub-millisecond for 20k products

---

## 8. Offline-First Strategy

### Architecture

```
Network Available → API call → cache first page to AsyncStorage
Network Unavailable → read from AsyncStorage cache
```

### Offline Cart
Cart is **always** written to AsyncStorage on every mutation (`addToCart`, `updateQuantity`, `removeFromCart`). The cart works 100% offline.

### Offline Booking Queue

1. Booking attempted while offline → `offlineQueue.enqueue()` stores op to AsyncStorage
2. Local booking created with `status: 'queued'`
3. Upcoming screen shows "Queued (Offline)" badge
4. On network reconnect (`useNetworkSync`) → `offlineQueue.processQueue()` fires
5. Each op retried up to `SYNC_RETRY_MAX=3` times
6. Success: op dequeued; Failure: kept with error, retry count incremented
7. Toast shown with sync result

### Automatic Sync

`useNetworkSync` subscribes to NetInfo. Detects offline→online transition. Prevents duplicate sync via `wasOfflineRef`. Shows toast with result count.

---

## 9. Reliability

All API calls flow through `mockApiClient.mockRequest()` which simulates:

| Scenario | Behaviour |
|----------|-----------|
| `normal` | 800ms + 0–400ms jitter |
| `slow` | 3–5 second latency |
| `timeout` | Returns error after API_TIMEOUT_MS |
| `failure` | Returns 500 error |
| `empty` | Returns empty array |
| `partial` | Returns first 50% of data |

Plus a configurable 5% random failure rate on top of the scenario.

UI always shows: loading state → success/error/empty state → retry button.

---

## 10. Bonus Features Selected

### Bonus 1 — Feature Flags
**Why:** A health app must be able to disable features instantly without a release. Flags control deep linking, localization, biometric auth, background sync. In production: backed by Firebase Remote Config.

### Bonus 2 — Deep Linking
**Why:** Direct links to doctor profiles (`ayurveda://doctors/doc_00001`) or products are critical for push notification actions and marketing campaigns. Implemented via React Navigation's `linking` config.

### Bonus 3 — Crash Reporting Abstraction
**Why:** `Logger.captureException()` is the single integration point. In production, one line change connects it to Sentry or Crashlytics — no scattered SDK calls across the codebase.

---

## 11. Testing

### Test Results: 49/49 PASS ✅

```
Test Suites: 3 passed
Tests:       49 passed
Time:        ~1.5s
```

| Test File | Coverage |
|-----------|----------|
| `unit/businessLogic.test.ts` | Data generators, cart math, conflict detection, filtering/sorting |
| `unit/utils.test.ts` | Date grouping, debounce, offline queue logic, pagination |
| `e2e/consultationFlow.test.ts` | Full booking flow, shop flow, health records — all 3 modules |

---

## 12. Environment Configuration

All configuration lives in `src/config/env.ts`. In production, use `react-native-config` to inject values from `.env` files per environment. No secrets in source code.

---

## 13. Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Zustand over Redux | Less ecosystem tooling (DevTools less mature), but far less boilerplate |
| In-memory mock API | No real network testing; replaced by `MockScenario` simulation |
| `react-native-vector-icons` replaced with emoji | Simpler setup, no native linking needed for assignment |
| Logic-level E2E tests | No Detox UI automation (requires physical device/emulator in CI) |
| In-memory product sort | Sorts entire filtered set; for 20k+ with complex sorts, server-side would be better |

---

## 14. Future Improvements

- [ ] Real backend integration (replace mock API client only)
- [ ] Detox / Maestro UI E2E tests
- [ ] `react-native-mmkv` for faster storage
- [ ] React Query / TanStack Query for server state caching
- [ ] Optimistic updates for cart and bookings
- [ ] Image caching via `react-native-fast-image`
- [ ] Biometric authentication (LocalAuthentication)
- [ ] Multi-language (i18n) with `react-i18next`
- [ ] Performance monitoring (React Native Performance API + Flipper)

---

## 15. Requirement Verification

| PDF Requirement | Implementation | Status |
|----------------|---------------|--------|
| Doctor listing | `DoctorListScreen` + `useDoctors` | ✅ Done |
| Doctor search | Debounced search in `useDoctors` | ✅ Done |
| Doctor filters | Specialty, fee, rating, availability | ✅ Done |
| Doctor details | `DoctorDetailScreen` | ✅ Done |
| Available slots | `generateSlotsForDoctor` → slot grid | ✅ Done |
| Booking flow | `useBooking` → `consultationApi.createBooking` | ✅ Done |
| Upcoming consultations | `UpcomingConsultationsScreen` | ✅ Done |
| Cancel booking | `useBooking.cancel` + confirmation dialog | ✅ Done |
| Slot conflicts | `hasConflict()` in `consultationStore` | ✅ Done |
| Expired slots | `isExpired` flag, disabled in UI | ✅ Done |
| Double booking | Prevented by `hasConflict` pre-check | ✅ Done |
| Product listing | `ProductListScreen` + `useProducts` | ✅ Done |
| Infinite scroll | `onEndReached` + `loadMore` pagination | ✅ Done |
| Product search | Debounced, filter through 20k products | ✅ Done |
| Multi-filter | Category, price, rating, in-stock | ✅ Done |
| Sorting | 5 sort options via `ProductFilters.sortBy` | ✅ Done |
| Product details | Screen + `shopApi.getProductById` | ✅ Done |
| Cart | `shopStore` with persist | ✅ Done |
| Quantity updates | `updateQuantity` with remove-on-zero | ✅ Done |
| Wishlist | `toggleWishlist` + `isInWishlist` | ✅ Done |
| Checkout summary | `CartScreen` order summary + `shopApi.checkoutCart` | ✅ Done |
| Cart persistence | AsyncStorage via `shopStore.loadFromStorage` | ✅ Done |
| Timeline view | `SectionList` grouped by month/year | ✅ Done |
| Record filters | Type filter chips | ✅ Done |
| Record search | Debounced search on title/description/tags | ✅ Done |
| Record tags | Chip display per record | ✅ Done |
| Attachment preview | Image thumbnail + PDF open via Linking | ✅ Done |
| Group by month/year | `groupRecordsByMonth` + sticky headers | ✅ Done |
| React Native | RN 0.74.7 | ✅ Done |
| TypeScript | Full strict typing, no `any` | ✅ Done |
| React Navigation | v6, stack + tabs + deep links | ✅ Done |
| No boilerplate | Initialized from scratch, architecture designed here | ✅ Done |
| 5,000 doctors | Generated + paginated, tested in E2E | ✅ Done |
| 20,000 products | Generated + paginated, tested in E2E | ✅ Done |
| 10,000 records | Generated + SectionList, tested in E2E | ✅ Done |
| Virtualization | FlatList + SectionList with all perf props | ✅ Done |
| Memoization | `React.memo` on all list items and headers | ✅ Done |
| Lazy loading | Pagination + `onEndReached` | ✅ Done |
| Cached API responses | First page cached to AsyncStorage | ✅ Done |
| Offline cart | Always persisted, works offline | ✅ Done |
| Offline booking queue | `offlineQueue` service | ✅ Done |
| Automatic sync | `useNetworkSync` on reconnect | ✅ Done |
| Slow network | `MockScenario.slow` (3–5s) | ✅ Done |
| API timeout | `MockScenario.timeout` | ✅ Done |
| Random failures | 5% MOCK_FAILURE_RATE | ✅ Done |
| Empty responses | `MockScenario.empty` | ✅ Done |
| Partial responses | `MockScenario.partial` | ✅ Done |
| Error boundary | `ErrorBoundary` class component | ✅ Done |
| Clean architecture | Layered: UI → Hooks → API → Data | ✅ Done |
| Modular code | 3 independent modules with own hooks/components/screens | ✅ Done |
| Reusable components | Design system: Typography, Button, Card, Chip, SearchBar, StateViews | ✅ Done |
| Strong typing | All types in `src/types/index.ts` | ✅ Done |
| Env config | `src/config/env.ts` | ✅ Done |
| API abstraction | Repository layer isolates mock from UI | ✅ Done |
| Logging | `Logger` service with levels + crash abstraction | ✅ Done |
| Global toast | `useAppStore.showToast` + `ToastContainer` | ✅ Done |
| Theme support | `lightTheme` + `darkTheme` | ✅ Done |
| Dark mode | Toggle via header button, persisted | ✅ Done |
| Accessibility | `accessibilityLabel`, `accessibilityRole`, `accessibilityState` throughout | ✅ Done |
| Business logic tests | 24 tests in `businessLogic.test.ts` | ✅ Done |
| Custom hook tests | Debounce, queue logic in `utils.test.ts` | ✅ Done |
| Utility tests | Pagination, grouping, date in `utils.test.ts` | ✅ Done |
| E2E flow test | Full booking + shop + records in `consultationFlow.test.ts` | ✅ Done |
| Feature Flags (Bonus) | `featureFlagsService` with remote refresh | ✅ Done |
| Deep Linking (Bonus) | Navigation `linking` config | ✅ Done |
| Crash Reporting (Bonus) | `Logger.captureException` abstraction | ✅ Done |
| README | This document | ✅ Done |
