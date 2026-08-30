# Amrutam Super App

Ayurvedic super app built with React Native, TypeScript and React Navigation. Three modules
behind one shell: Consultations, Shop, Health Records.

The dataset is generated at runtime: 5,000 doctors, 20,000 products, 10,000 health records.
The app works offline and queues writes made while disconnected.

## Running it

```bash
nvm use            # Node 22. RN 0.87 needs >= 22.11, see .nvmrc
npm install
```

iOS, first time:

```bash
cd ios && pod install && cd ..
```

Then two terminals:

```bash
npm start          # terminal 1: Metro
npm run ios        # terminal 2: build, install, launch
```

`npm run ios` normally opens Metro in its own window, but not always. If the app boots to a
red "No script URL provided" screen, Metro is not running: start it with `npm start` and
press `R` in the simulator.

Android:

```bash
npm start
npm run android
```

```bash
npm run verify     # typecheck + lint
```

## Folder structure

```
src/
├── assets/          Images and fonts (empty; every visual is drawn)
├── components/      23  Reusable and feature components, plus app-level chrome
│                        (AppProviders, ErrorBoundary, ToastProvider, NetworkMonitor)
├── hooks/           15  Data hooks (useDoctors, useProducts, useCart, …) and generic
│                        ones (useDebouncedValue, useStableCallback, useNow, useTranslation)
├── navigation/       3  Navigator, param lists, tab icons
├── redux/           19  store, 11 slices, listeners, thunks
├── screens/         11  One file per screen
├── services/        13  callApi, errors, storage, sync, mock/ data layer
├── types/           10  Shared TypeScript types
└── utils/           16  Formatters, config, logger, i18n, and the pure business rules
                         (booking.ts, cart.ts, timeline.ts)
```

111 files, ~8,100 lines. Imports use the `@/` alias, so there are no `../../../` chains.

## Architectural decisions

**Business rules are pure functions.** `utils/booking.ts`, `utils/cart.ts` and
`utils/timeline.ts` hold `evaluateBooking`, `summarise` and `buildTimeline` with no React and
no I/O. Screens stay presentational: they read from hooks and dispatch to redux, and contain
no fetching or business logic.

**There is no backend.** `services/mock/` is a stand-in that runs inside the app: seeded
generators plus a route table. `callApi` resolves a path against that table and invokes the
handler as a plain function, with no transport, serialisation or parsing:

```
hook → callApi → services/mock/handlers → services/mock/db
```

The route strings (`/doctors`, `/bookings/:id`) are a convention, not URLs. `callApi` is
async only so the caller can paint a skeleton before a table generates thousands of rows;
pointing this at a real API means changing that one function.

**The mock is a small server, not fixtures.** `handlers.ts` implements cursor pagination,
server-side search/filter/sort, facet counts, and genuine booking conflict checks: expired
slot, taken slot, overlapping appointment, idempotent replay. `db.ts` builds each table
lazily on first use and precomputes a sorted index array per sort option, so a query is one
filtered walk rather than an `Array.sort` per request. Building all three tables together
cost ~840ms on the first request whichever tab you opened; split, the Consult tab pays only
for its 5,000 doctors (~125ms).

Search, filtering, sorting and pagination all happen in the handlers, not the client. That
is the decision that makes the dataset sizes tractable: the client never holds 20,000 rows.

**Dates are local everywhere.** `toDateKey`, `dateKeyOf` and `monthKey` derive calendar keys
from local time. `toISOString().slice(0, 10)` gives the UTC day, which puts a 9pm IST
appointment on tomorrow's key. Slot generation, period grouping, cache keys and invalidation
all use the same helpers so they cannot drift apart.

## State management: Redux Toolkit

One store, one set of devtools, one mental model. No data-fetching library.

| Kind of state                                                  | Where                              | Notes                                                                         |
| -------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Shared server-ish state (bookings)                             | `bookingsSlice` + thunks           | Read by two screens and merged with the sync queue, so it has to be shared    |
| Screen-local reads (doctors, products, records, facets, slots) | `useApiQuery` / `useApiPagedQuery` | Local hook state. The data is already in memory, so there is nothing to cache |
| Local durable state (cart, wishlist, flags, locale)            | Slices + redux-persist over MMKV   | Owned by the device, survives a kill                                          |
| Ephemeral UI state (filters, grouping)                         | Slices, not persisted              | Throwaway per session                                                         |
| Cross-cutting facts (connectivity, session, sync queue)        | Slices                             | One source of truth, readable from non-React code                             |

Eleven slices. Five are persisted: `cart`, `wishlist`, `flags`, `preferences`, `offline`.

**Why reads are not in redux.** The handlers run in the same process, so a read is a function
call over an array already in memory. Putting that behind a normalised cache would add
staleness tracking, invalidation and dedup to solve a problem that does not exist here.
`useApiPagedQuery` keeps the only state that genuinely accumulates: the pages fetched so far
and the cursor.

**Why bookings are the exception.** They are written, not just read; the booking screen and
the doctor detail screen both need them; and `evaluateBooking` has to see queued writes as
well as stored ones. That is shared mutable state, so it lives in a slice.

**Why the offline queue is a slice.** Pending writes are real application state. As a slice
they show up in devtools, persist for free, and are testable as a reducer. Side effects live
in listener middleware, which is the idiomatic place for them.

**Why pending bookings are derived from the queue.** `selectAllBookings` merges stored
bookings with the queue rather than writing optimistic rows into the list, so a reload cannot
drop one that has not been applied yet.

**Selectors live beside their slice.** Screens subscribe to slices, not the whole store, so
adding one cart item does not re-render the visible product list.

There is no bootstrap module. Startup work lives with whatever owns it: `redux/store.ts`
wires the store and kicks off the session and remote-config loads, features register their
sync handlers on import, and `index.js` holds the one LogBox suppression.

## Performance

**The data never arrives all at once.** Every list is cursor-paginated with server-side
filtering and sorting. Scrolling to the end holds N pages, not 20,000 rows. Page size comes
from remote config.

**Virtualised rendering.** All five long lists use FlashList. The health-records timeline is
a single flat array of header and record rows with `getItemType`, not a `SectionList`, so one
recycler pool covers the whole timeline instead of one per month.

**Memoisation that holds.** Nine components are memoised, and every callback handed to a row
goes through `useStableCallback`. Without it a keystroke in the search box produces new
handler identities and re-renders every visible row.

**Efficient updates.** Search text is debounced 300ms before it becomes a query arg, so
typing "ashwagandha" issues one request instead of eleven while the input stays instant. Chip
filters apply immediately, since those are single deliberate actions. Derived data (flattened
pages, timeline grouping, cart totals) is memoised on the page array.

**Persistence is throttled.** redux-persist writes on every action by default, which during
list scrolling means re-serialising the whole cache per frame. A 1s throttle took a measured
14s test run down to 5.5s.

**Lazy loading.** Eight detail, cart, checkout, wishlist and attachment screens are
`React.lazy`. Metro ships one bundle, so this defers module evaluation rather than download,
but code for a screen nobody opens is never executed.

## Offline strategy

**Reads always work.** The data layer is in the same process, so being offline never blocks
a read. There is no read cache to manage and nothing to rehydrate.

**Cart and wishlist.** Local-first by construction. Slices persisted to MMKV, so there is no
"sync the cart" step.

**Queued bookings.** `redux/slices/offlineSlice.ts` holds a durable FIFO queue:

1. The booking is validated locally by `evaluateBooking`, giving an instant, specific reason
   when it fails (expired, taken, duplicate, overlapping).
2. If offline, or if the request fails transiently, it is queued with a client-generated
   `clientRef`.
3. The UI shows it immediately as "Awaiting sync", derived from the queue rather than from a
   patched cache.
4. On reconnect, foreground, or next launch, the listener middleware drains the queue. The
   `clientRef` is sent as the `Idempotency-Key`, so a replay returns the original booking
   instead of creating a second one.

Attempts are capped at five. A rejection that will fail the same way next time (409 for a
slot someone else took) fails fast instead of looping. An `offline` error does not consume
the attempt budget, because "not now" is not "never".

**Connectivity has one owner.** `NetworkMonitor` feeds NetInfo into the store, and the base
query and sync engine read it from there. An earlier version read it from React state, which
lands a tick later, and that gap was enough to permanently fail a queued booking.

## Reliability

Failures are one of five `ApiErrorCode`s and feature code branches on `code`, never on a
message.

| Scenario         | Handling                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| Offline          | The base query fails before reaching the data layer; writes go to the sync queue |
| Slot conflict    | 409 becomes `conflict`, surfaced as a specific message plus a slot refresh       |
| Missing record   | `not_found`, rendered by `ErrorState` with a retry action                        |
| Unexpected throw | Caught in `callApi` and reported as `unknown` rather than crashing a render      |
| Render crash     | `ErrorBoundary` at the root and around every screen                              |

## What is implemented

**Production engineering**

- **Environment config** — one typed `AppConfig` per environment in `utils/environments.ts`,
  selected by `APP_ENV` and inlined by Babel. No `__DEV__` checks in feature code.
- **API abstraction layer** — `services/api.ts`: one `callApi` function, a shared error
  shape, and hooks that wrap it.
- **Logging** — levelled and scoped (`createLogger('cart')`), console transport, level set
  per environment so production is quiet.
- **Error boundaries** — root plus per screen. Catching a render error still requires a class
  component, so `react-error-boundary` owns that class and nothing here is one.
- **Toast** — one provider, one visible toast, optional action (used for undo), announced to
  screen readers.

**Feature flags and remote config**

`redux/slices/flagsSlice.ts` holds three flags and four tunable values, hydrated from
`GET /config/remote`, applied through a listener, and persisted so cached values survive an
offline launch. Version-guarded, and merged onto compile-time defaults so a key the server
stops sending reverts rather than sticking. They drive real behaviour:

| Value                                      | Effect                                                          |
| ------------------------------------------ | --------------------------------------------------------------- |
| `pageSize`                                 | Page size for all three infinite lists                          |
| `maxCartQuantity`, `freeShippingThreshold` | Cart clamp and shipping, via `extraReducers` on the cart slice  |
| `bookingCancellationWindowHours`           | Whether a booking shows Cancel                                  |
| `shop_wishlist`                            | Hides the heart, the wishlist header action and the save button |
| `records_year_grouping`                    | Hides the Year option in the records filter sheet               |

The third flag, `consultation_video_room`, is a dark-launch placeholder: it ships off and
nothing reads it yet, so the switch exists before the feature does.

**Localisation (English + Hindi)**

144 keys in both dictionaries, `{param}` interpolation, per-key fallback to English, device language detection, persisted preference. The switch is an `EN`/`हि` action in the Consult header.

**Accessibility**

- Every interactive element has a role and a label, and a hint where the label alone is ambiguous. Slots announce their time, mode, and why they are unavailable.
- 44pt minimum touch targets.
- `accessibilityState` reflects selected/disabled/busy. Filter chips are checkboxes, slots are radios, tabs are tabs.
- Offline banner and toasts are live regions. Decorative glyphs and skeletons are hidden.
- Nothing relies on colour alone: out-of-stock, cancelled and pending states are labelled.

## Trade-offs

**A mock data layer rather than a public API.**

**FlashList over FlatList.** An extra native dependency, bought automatic sizing and much better recycling for the heterogeneous timeline.

**MMKV over AsyncStorage.** Synchronous reads mean redux-persist rehydrates before first paint. It is a TurboModule, so `services/storage` falls back to an in-memory driver when the native module is unavailable rather than crashing at import.

**`React.lazy` without real code splitting.** Metro emits one bundle, so this defers
evaluation rather than download. Still worth it, but it is not the web's story.

**Placeholder imagery.** Deterministic colour blocks instead of remote images, so scrolling 20,000 rows issues zero image requests and the performance numbers stay about rendering.

**Styles live with their component.** Each component owns a local `StyleSheet`, which keeps a screen readable in one file. The cost is that around 20 colour values repeat across ~30 files, so changing the green is a find-and-replace.

**Drawn tab icons instead of emoji.** Emoji depend on the platform emoji font, and a
simulator runtime missing `AppleColorEmoji` rendered every tab as a "?" box.
