import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { deviceLocale, type Locale } from '@/utils/i18n';
import type { RootState } from '@/redux/store';

interface PreferencesState {
  locale: Locale;
}

const initialState: PreferencesState = {
  locale: deviceLocale(),
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    localeChanged(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { localeChanged } = preferencesSlice.actions;

export const preferencesReducer = preferencesSlice.reducer;

export const selectLocale = (state: RootState) => state.preferences.locale;
