import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toggle } from '@/utils';
import type { RootState } from '@/redux/store';
import {
  EMPTY_DOCTOR_FILTERS,
  type ConsultationMode,
  type DoctorFilters,
  type DoctorSort,
} from '@/types/consultations';

const doctorFiltersSlice = createSlice({
  name: 'doctorFilters',
  initialState: EMPTY_DOCTOR_FILTERS as DoctorFilters,
  reducers: {
    queryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    specializationToggled(state, action: PayloadAction<string>) {
      state.specializations = toggle(state.specializations, action.payload);
    },
    cityToggled(state, action: PayloadAction<string>) {
      state.cities = toggle(state.cities, action.payload);
    },
    modeToggled(state, action: PayloadAction<ConsultationMode>) {
      state.modes = toggle(state.modes, action.payload);
    },
    minRatingSet(state, action: PayloadAction<number | null>) {
      state.minRating = action.payload;
    },
    maxFeeSet(state, action: PayloadAction<number | null>) {
      state.maxFee = action.payload;
    },
    sortChanged(state, action: PayloadAction<DoctorSort>) {
      state.sort = action.payload;
    },
    filtersReset(state) {
      return {
        ...EMPTY_DOCTOR_FILTERS,
        query: state.query,
      };
    },
  },
});

export const doctorFilterActions = doctorFiltersSlice.actions;

export const doctorFiltersReducer = doctorFiltersSlice.reducer;

export const selectDoctorFilters = (state: RootState) => state.doctorFilters;

export const selectDoctorQuery = (state: RootState) => state.doctorFilters.query;

export function countActiveDoctorFilters(filters: DoctorFilters): number {
  return (
    filters.specializations.length +
    filters.cities.length +
    filters.modes.length +
    (filters.minRating === null ? 0 : 1) +
    (filters.maxFee === null ? 0 : 1)
  );
}
