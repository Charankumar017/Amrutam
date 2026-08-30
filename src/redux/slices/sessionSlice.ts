import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@/types/auth';
import type { RootState } from '@/redux/store';

interface SessionState {
  session: Session | null;
  isRefreshing: boolean;
}

const initialState: SessionState = {
  session: null,
  isRefreshing: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    refreshStarted(state) {
      state.isRefreshing = true;
    },
    sessionReceived(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.isRefreshing = false;
    },
    refreshFailed(state) {
      state.isRefreshing = false;
    },
  },
});

export const { refreshStarted, sessionReceived, refreshFailed } = sessionSlice.actions;

export const sessionReducer = sessionSlice.reducer;

export const selectSession = (state: RootState) => state.session.session;
