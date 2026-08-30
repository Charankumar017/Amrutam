import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store';

interface NetworkState {
  isOnline: boolean;
  connectionType: string;
  isReady: boolean;
}

const initialState: NetworkState = {
  isOnline: true,
  connectionType: 'unknown',
  isReady: false,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    connectivityChanged(
      state,
      action: PayloadAction<{
        isOnline: boolean;
        connectionType: string;
      }>,
    ) {
      state.isOnline = action.payload.isOnline;
      state.connectionType = action.payload.connectionType;
      state.isReady = true;
    },
  },
});

export const { connectivityChanged } = networkSlice.actions;

export const networkReducer = networkSlice.reducer;

export const selectIsOnline = (state: RootState) => state.network.isOnline;
