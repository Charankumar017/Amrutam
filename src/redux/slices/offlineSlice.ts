import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store';

export type QueuedMutationStatus = 'queued' | 'in_flight' | 'failed';

export interface QueuedMutation<TPayload = unknown> {
  id: string;
  kind: string;
  payload: TPayload;
  createdAt: number;
  attempts: number;
  status: QueuedMutationStatus;
  lastError?: string;
}

export const MAX_SYNC_ATTEMPTS = 5;

interface OfflineState {
  pending: QueuedMutation[];
  isSyncing: boolean;
  lastSyncedAt: number | null;
}

const initialState: OfflineState = {
  pending: [],
  isSyncing: false,
  lastSyncedAt: null,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    enqueued: {
      reducer(state, action: PayloadAction<QueuedMutation>) {
        state.pending.push(action.payload);
      },
      prepare(kind: string, payload: unknown, id: string) {
        return {
          payload: {
            id,
            kind,
            payload,
            createdAt: Date.now(),
            attempts: 0,
            status: 'queued' as const,
          },
        };
      },
    },
    dequeued(state, action: PayloadAction<string>) {
      state.pending = state.pending.filter(item => item.id !== action.payload);
    },
    syncStarted(state) {
      state.isSyncing = true;
    },
    syncFinished(state) {
      state.isSyncing = false;
      state.lastSyncedAt = Date.now();
    },
    attemptStarted(state, action: PayloadAction<string>) {
      const item = state.pending.find(entry => entry.id === action.payload);
      if (!item) return;
      item.status = 'in_flight';
      item.attempts += 1;
    },
    attemptFailed(
      state,
      action: PayloadAction<{
        id: string;
        error: string;
        giveUp: boolean;
        countsAsAttempt: boolean;
      }>,
    ) {
      const item = state.pending.find(entry => entry.id === action.payload.id);
      if (!item) return;
      item.status = action.payload.giveUp ? 'failed' : 'queued';
      item.lastError = action.payload.error;
      if (!action.payload.countsAsAttempt) item.attempts = Math.max(0, item.attempts - 1);
    },
    rehydrated(state) {
      for (const item of state.pending) {
        if (item.status === 'in_flight') item.status = 'queued';
      }
      state.isSyncing = false;
    },
  },
});

export const { enqueued, dequeued, syncStarted, syncFinished, attemptStarted, attemptFailed, rehydrated } =
  offlineSlice.actions;

export const offlineReducer = offlineSlice.reducer;

export const selectPendingMutations = (state: RootState) => state.offline.pending;

export const selectUnsyncedCount = (state: RootState) =>
  state.offline.pending.filter(item => item.status !== 'failed').length;
