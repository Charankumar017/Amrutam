import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { drainOfflineQueue } from '@/services/sync';
import '@/redux/bookingSync';
import type { AppDispatch, RootState } from '@/redux/store';
import { connectivityChanged } from '@/redux/slices/networkSlice';
import { enqueued, rehydrated } from '@/redux/slices/offlineSlice';

export const listenerMiddleware = createListenerMiddleware();

const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

startAppListening({
  matcher: isAnyOf(connectivityChanged, enqueued),
  effect: async (_action, api) => {
    if (!api.getState().network.isOnline) return;
    api.cancelActiveListeners();
    await api.delay(150);
    await api.dispatch(drainOfflineQueue());
  },
});

startAppListening({
  predicate: action => action.type === REHYDRATE,
  effect: async (_action, api) => {
    api.dispatch(rehydrated());
    await api.dispatch(drainOfflineQueue());
  },
});
