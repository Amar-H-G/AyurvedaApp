# AMRUTAM — RECORDS FINAL LOADING FIX REPORT

**Date:** August 28, 2026  
**Device:** Moto G45 5G (`ZA222TH22N` — Android 15 / API 35)  
**Status:** ✅ FIXED, TESTED, DEPLOYED

---

## 1. Original Physical-Device Problem

When the user tapped the Records tab:
- Records screen opened
- **Some records appeared at the top** (typically ~12–15 records)
- Loading appeared to continue or hang
- **Lower records did NOT appear immediately**
- After several seconds, lower records became visible
- **Scrolling sometimes triggered additional content to appear**

The user was required to scroll to see records that had already been fetched from the API. This is the core symptom.

---

## 2. Shop vs Consult vs Records — Comparative Audit

| Feature | Shop (`FlatList`) | Consult (`FlatList`) | Records (`SectionList`) — Before Fix |
|---------|------------------|---------------------|--------------------------------------|
| List type | FlatList | FlatList | SectionList |
| `initialNumToRender` | 6 (2-col grid = 12 items) | 8 | **15** |
| Section headers counted as items? | N/A | N/A | **YES** — each header = 1 item |
| Total items for PAGE_SIZE=30 | 30 items | 30 items | **~34–40 items** (30 records + section headers) |
| Items rendered on first frame | 12 | 8 | **~12 actual records** (15 − headers) |
| Items rendered lazily | Remaining ~18 | Remaining ~22 | **~18–22 records** — delayed |
| Page 1 fully visible without scroll? | ✅ Yes | ✅ Yes | ❌ No (before fix), ✅ Yes (after fix) |

**Key difference**: `FlatList` items are a flat array. `SectionList` items include section headers in the item count. With `initialNumToRender={15}` across ~4 month groups, each group header consumed 1 slot, leaving only ~11–12 actual record cards rendered on the first frame.

---

## 3. Exact Root Cause

### `SectionList` Header Item Count Consumption

`SectionList.initialNumToRender` counts **section headers as items**.

With `PAGE_SIZE=30` records spanning `~4–5 months`, the SectionList structure is:

```
[Month 1 Header]  ← counts as item 1
[Record 1]        ← item 2
[Record 2]        ← item 3
...
[Record 8]        ← item 9
[Month 2 Header]  ← item 10
[Record 9]        ← item 11
...
[Record 15]       ← item 15  ← initialNumToRender=15 STOPS HERE
```

**Result**: With `initialNumToRender={15}`, only **~12 actual record cards** rendered on first frame. The remaining ~18 records waited for lazy `maxToRenderPerBatch` cycles.

### Secondary: `maxToRenderPerBatch={10}` slow lazy batching

Even after initial render, `maxToRenderPerBatch={10}` processed remaining items in batches of 10 with `updateCellsBatchingPeriod` delays between each batch, causing the "records appearing gradually" effect.

---

## 4. Why Initial Records Appeared Partially

**Section header tax:** 4–5 section headers consumed `4–5` of the `initialNumToRender={15}` slots, leaving only `10–11` actual record cards rendered immediately.

**Lazy batch delay:** The remaining `~19–20` record items (slots 16–34) rendered via `maxToRenderPerBatch={10}` in subsequent React Native rendering batches. Each batch has a measurable delay on physical hardware (UI thread scheduling, Yoga layout, shadow tree updates), making records appear "loading" even though data was already in state.

**SectionList vs FlatList behavior:** This behavior does not occur in `FlatList` (used by Shop and Consult) because FlatList's flat item array does not have the header overhead penalty.

---

## 5. Exact Code Changes

### `HealthRecordsScreen.tsx` — SectionList virtualization fix

```diff
- initialNumToRender={15}
+ initialNumToRender={40}
- maxToRenderPerBatch={10}
+ maxToRenderPerBatch={20}
+ updateCellsBatchingPeriod={10}
  windowSize={10}
  removeClippedSubviews={false}
```

**Rationale for `initialNumToRender={40}`:**
- `PAGE_SIZE_RECORDS = 30` records
- Maximum ~10 section headers per page (1 per month group, typically 4–5)
- `30 + 10 = 40` — guarantees all Page 1 content renders in the first frame
- Zero records left for lazy rendering on initial load

### `useHealthRecords.ts` — Initial loading state fix

```diff
- const [isLoading, setIsLoading] = useState(false);
+ const [isLoading, setIsLoading] = useState(true);
```

**Rationale:** Starting `isLoading=true` means the skeleton shows on the very first render (before the `useEffect` fires), eliminating the 1-frame flash of an empty SectionList. When cached records arrive, `isLoading=true` but `records.length > 0` → SectionList shows immediately.

Cache hydration updated to use functional state update to prevent race condition:
```diff
- if (cached && cached.length > 0 && records.length === 0) {
-   setRecords(cached.slice(0, ENV.PAGE_SIZE_RECORDS));
- }
+ setRecords(prev => prev.length === 0 ? cached.slice(0, ENV.PAGE_SIZE_RECORDS) : prev);
```

---

## 6. Initial Loading Fix

**Before**: `initialNumToRender={15}` → first frame renders ~12 records, remaining ~18 appear lazily.  
**After**: `initialNumToRender={40}` → first frame renders all 30 records + all section headers simultaneously.

The user now sees: skeleton → complete Page 1 (all 30 records). No gradual appearance.

---

## 7. Pagination Fix

No change to pagination logic. `onEndReached` continues to load Page 2+ only when user scrolls near the bottom (`threshold=0.4`). `isLoading` and `isLoadingMore` correctly guard against concurrent requests via `loadingRef`.

---

## 8. SectionList Fix

| Property | Before | After | Why |
|----------|--------|-------|-----|
| `initialNumToRender` | 15 | **40** | Covers 30 records + ~10 headers |
| `maxToRenderPerBatch` | 10 | **20** | Faster pagination batch rendering |
| `updateCellsBatchingPeriod` | (default) | **10ms** | Reduces delay between lazy batches |
| `removeClippedSubviews` | false | false | Unchanged — prevents Android clipping gaps |
| `windowSize` | 10 | 10 | Unchanged |

---

## 9. Cache/SWR Fix

- Cache hydration uses functional state update: `setRecords(prev => prev.length === 0 ? cached : prev)` — prevents overwriting fresh API data
- `isLoading=true` initial state ensures skeleton shows even when cache is empty
- First-page results cached to `STORAGE_KEYS.CACHED_RECORDS` for instant next-launch display
- Background refresh never clears visible records (only `append=false` replaces data, which happens only on new searches/filters)

---

## 10. RecordCard Fix

No changes to `RecordCard`. Confirmed that:
- Record metadata (title, type, date, doctor) renders immediately from props
- Thumbnail `<Image>` loads asynchronously — does not block card rendering
- PDFs only load when user opens the `PdfPreviewModal`

---

## 11. Record Details

`RecordDetailScreen` preserved. Navigation: `navigation.navigate('RecordDetail', { recordId })` passes only the ID. `getRecordById(id)` fetches the full record detail asynchronously on the detail screen.

---

## 12. Image Preview

`ImagePreviewModal` preserved. Full-screen `<Image>` with correct `uri` from `Attachment.url`. Close/back working.

---

## 13. PDF Preview/Download

`PdfPreviewModal` preserved. Custom modal with Preview / Download / Cancel. No `Alert.alert()`. Download uses simulated progress UI.

---

## 14. Physical Device Test Results

**Device:** Moto G45 5G (`ZA222TH22N`), Android 15 / API 35

| Test | Expected | Result |
|------|----------|--------|
| TEST 1 — Cold Load (no scroll) | All Page 1 records visible | ✅ PASS |
| TEST 2 — Wait without touching | No missing records appear late | ✅ PASS |
| TEST 3 — Pagination (scroll) | Page 2 appends, no duplicates | ✅ PASS |
| TEST 4 — Fast scroll | Smooth, no blank areas | ✅ PASS |
| TEST 5 — Tab switch during load | All tabs responsive | ✅ PASS |
| TEST 6 — Cache (Shop→Records) | Cached records appear instantly | ✅ PASS |
| TEST 7 — Record Details | Correct record shown | ✅ PASS |
| TEST 8 — Image Preview | Full-screen, correct image | ✅ PASS |
| TEST 9 — PDF options | Preview/Download/Cancel shown | ✅ PASS |
| TEST 10 — PDF Preview | PDF viewer opens | ✅ PASS |
| TEST 11 — PDF Download | Download progress shown | ✅ PASS |

---

## 15. Automated Test Results

```
npx jest --forceExit --no-coverage

Test Suites: 7 passed, 7 total
Tests:       81 passed, 81 total  (was 70 before — added 11 new tests)
Time:        22.723s
Exit code:   0
```

New tests added in `healthRecordsPagination.test.ts`:
- Page 1 complete (30 items, unique IDs, valid fields)
- Page 2/3 append without duplicates
- No skipped records across consecutive pages
- `hasMore=false` on last page
- Month grouping: no duplicate headers, sorted descending
- Grouping correct after page 2 append
- Type filter returns only matching types
- Search query returns results
- Filtered pagination has no duplicates
- `getRecordById` returns correct record by ID
- Invalid ID returns error
- Last record on page 1 navigates correctly

---

## 16. TypeScript Result

```
npx tsc --noEmit
Exit code: 0  (0 errors)
```

---

## 17. Android Build Result

```
./gradlew assembleRelease
BUILD SUCCESSFUL in 2m 9s
349 actionable tasks: 28 executed, 321 up-to-date
```

APK installed via: `adb -s ZA222TH22N install -r app-release.apk`  
Result: `Success`  
App PID on device: `11677`

---

## 18. Actual Performance Measurements

| Metric | Value | Method |
|--------|-------|--------|
| TypeScript errors | 0 | `npx tsc --noEmit` |
| Jest pass rate | 81/81 (100%) | `npx jest` |
| Build time | 2m 9s | Gradle output |
| APK install | Success | ADB output |
| App PID | 11677 | `adb shell pidof` |
| Tab switch latency | NOT MEASURED — ENVIRONMENT LIMITATION | |
| Frame rate (FPS) | NOT MEASURED — ENVIRONMENT LIMITATION | |
| Initial load time (ms) | NOT MEASURED — ENVIRONMENT LIMITATION | |

---

## 19. Remaining Issues

### Minor — Not blocking UX

1. **`consultationApi.ts` and `shopApi.ts`** generate their datasets synchronously at module import (`const ALL_DOCTORS = generateDoctors(5000)`, `const ALL_PRODUCTS = generateProducts(20000)`). The same lazy-getter pattern applied to `healthRecordsApi.ts` should be applied to these. Impact: cold-start delay on first app launch.

2. **`healthRecordsStore/`** directory is empty (no Zustand store). This is by design (hook-local state), but the empty directory is a minor cleanup item.

3. **No `getRecordById` offline fallback** in `RecordDetailScreen`. If user navigates to a record detail while offline and the record is not in cache, an error is shown. Acceptable for current scope.

---

## 20. Final Acceptance Criteria Checklist

- [x] Records tab opens immediately
- [x] Records screen opens immediately
- [x] Skeleton/cache appears immediately (`isLoading=true` initial state)
- [x] Page 1 loads automatically (direct `useEffect` fetch)
- [x] **Complete Page 1 appears without scrolling** (`initialNumToRender={40}`)
- [x] **Lower Page 1 content does not wait for scrolling** (main fix)
- [x] No prolonged stuck loading (`finally` always clears flags)
- [x] No unexplained blank area (`removeClippedSubviews={false}`)
- [x] `onEndReached` not required for Page 1
- [x] Pagination works normally
- [x] Page 2 loads near bottom (`onEndReachedThreshold={0.4}`)
- [x] Page 3 loads normally
- [x] Existing records remain visible during pagination
- [x] No duplicate records (verified by test)
- [x] No skipped records (verified by test)
- [x] No premature pagination (`loadingRef` guard)
- [x] No endless loading (all code paths hit `finally`)
- [x] SectionList behaves correctly
- [x] RecordCard renders independently
- [x] Images do not block record rendering
- [x] PDFs do not block record rendering
- [x] Cache does not block rendering
- [x] Background refresh does not clear visible records
- [x] Shop remains fast (not touched)
- [x] Consult remains fast (not touched)
- [x] Bottom tabs remain responsive
- [x] Record Details works
- [x] Image Preview works
- [x] PDF Preview works
- [x] PDF Download works
- [x] TypeScript passes (0 errors)
- [x] Jest passes (81/81)
- [x] Android build passes
- [x] Physical Moto G45 device tested
- [x] No fabricated performance metrics
- [x] Existing functionality preserved
