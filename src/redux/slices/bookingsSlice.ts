import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toApiError, type ApiError } from '@/services/errors';
import type { Booking } from '@/types/consultations';
import type { RootState } from '@/redux/store';

interface BookingsState {
  items: Booking[];
  isLoading: boolean;
  error: ApiError | undefined;
}

const initialState: BookingsState = {
  items: [],
  isLoading: true,
  error: undefined,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    loadStarted(state) {
      state.isLoading = true;
      state.error = undefined;
    },
    loaded(state, action: PayloadAction<Booking[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = undefined;
    },
    loadFailed(state, action: PayloadAction<unknown>) {
      state.isLoading = false;
      state.error = toApiError(action.payload);
    },
  },
});

export const { loadStarted, loaded, loadFailed } = bookingsSlice.actions;

export const bookingsReducer = bookingsSlice.reducer;

export const selectServerBookings = (state: RootState) => state.bookings.items;

export const selectBookingsLoading = (state: RootState) => state.bookings.isLoading;

export const selectBookingsError = (state: RootState) => state.bookings.error;
