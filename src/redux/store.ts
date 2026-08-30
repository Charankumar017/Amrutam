import {
  combineReducers,
  configureStore,
  type Action,
  type Reducer,
  type ThunkAction,
} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { loadRemoteConfig } from '@/redux/configThunks';
import { readStoredSession, refreshSession } from '@/redux/sessionThunks';
import { doctorFiltersReducer } from '@/redux/slices/doctorFiltersSlice';
import { recordFiltersReducer } from '@/redux/slices/recordFiltersSlice';
import { cartReducer } from '@/redux/slices/cartSlice';
import { productFiltersReducer } from '@/redux/slices/productFiltersSlice';
import { wishlistReducer } from '@/redux/slices/wishlistSlice';
import { listenerMiddleware } from '@/redux/listeners';
import { mmkvStorage } from '@/redux/mmkvStorage';
import { bookingsReducer } from '@/redux/slices/bookingsSlice';
import { flagsReducer } from '@/redux/slices/flagsSlice';
import { networkReducer } from '@/redux/slices/networkSlice';
import { offlineReducer } from '@/redux/slices/offlineSlice';
import { preferencesReducer } from '@/redux/slices/preferencesSlice';
import { sessionReceived, sessionReducer } from '@/redux/slices/sessionSlice';

const rootReducer = combineReducers({
  bookings: bookingsReducer,
  cart: cartReducer,
  flags: flagsReducer,
  wishlist: wishlistReducer,
  network: networkReducer,
  session: sessionReducer,
  offline: offlineReducer,
  preferences: preferencesReducer,
  doctorFilters: doctorFiltersReducer,
  productFilters: productFiltersReducer,
  recordFilters: recordFiltersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer<RootState>(
  {
    key: 'amrutam',
    version: 5,
    storage: mmkvStorage,
    throttle: 1_000,
    whitelist: ['cart', 'wishlist', 'flags', 'preferences', 'offline'],
  },
  rootReducer as Reducer<RootState>,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);

const storedSession = readStoredSession();

if (storedSession) store.dispatch(sessionReceived(storedSession));
else void store.dispatch(refreshSession());

export type AppDispatch = typeof store.dispatch;

export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, Action>;

void store.dispatch(loadRemoteConfig());
