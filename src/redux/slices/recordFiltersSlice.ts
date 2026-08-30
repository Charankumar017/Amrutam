import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toggle } from '@/utils';
import type { RootState } from '@/redux/store';
import type { TimelineGrouping } from '@/utils/timeline';
import { EMPTY_RECORD_FILTERS, type HealthRecordFilters, type HealthRecordType } from '@/types/healthRecords';

interface RecordFilterState {
  filters: HealthRecordFilters;
  grouping: TimelineGrouping;
}

const initialState: RecordFilterState = {
  filters: EMPTY_RECORD_FILTERS,
  grouping: 'month',
};

const recordFiltersSlice = createSlice({
  name: 'recordFilters',
  initialState,
  reducers: {
    queryChanged(state, action: PayloadAction<string>) {
      state.filters.query = action.payload;
    },
    typeToggled(state, action: PayloadAction<HealthRecordType>) {
      state.filters.types = toggle(state.filters.types, action.payload);
    },
    tagToggled(state, action: PayloadAction<string>) {
      state.filters.tags = toggle(state.filters.tags, action.payload);
    },
    rangeSet(
      state,
      action: PayloadAction<{
        from: string | null;
        to: string | null;
      }>,
    ) {
      state.filters.from = action.payload.from;
      state.filters.to = action.payload.to;
    },
    groupingChanged(state, action: PayloadAction<TimelineGrouping>) {
      state.grouping = action.payload;
    },
    filtersReset(state) {
      state.filters = {
        ...EMPTY_RECORD_FILTERS,
        query: state.filters.query,
        types: [],
        tags: [],
      };
    },
  },
});

export const recordFilterActions = recordFiltersSlice.actions;

export const recordFiltersReducer = recordFiltersSlice.reducer;

export const selectRecordFilters = (state: RootState) => state.recordFilters.filters;

export const selectRecordQuery = (state: RootState) => state.recordFilters.filters.query;

export const selectRecordGrouping = (state: RootState) => state.recordFilters.grouping;
