import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  FEATURE_FLAG_DEFAULTS,
  REMOTE_VALUE_DEFAULTS,
  type FeatureFlag,
  type RemoteConfigPayload,
  type RemoteValueKey,
} from '@/utils/featureFlags';
import type { RootState } from '@/redux/store';

interface FlagsState {
  flags: Record<FeatureFlag, boolean>;
  values: Record<RemoteValueKey, number>;
  version: number;
  fetchedAt: number | null;
}

const initialState: FlagsState = {
  flags: {
    ...FEATURE_FLAG_DEFAULTS,
  },
  values: {
    ...REMOTE_VALUE_DEFAULTS,
  },
  version: 0,
  fetchedAt: null,
};

const flagsSlice = createSlice({
  name: 'flags',
  initialState,
  reducers: {
    remoteConfigApplied(state, action: PayloadAction<RemoteConfigPayload>) {
      if (action.payload.version < state.version) return;
      state.flags = {
        ...FEATURE_FLAG_DEFAULTS,
        ...action.payload.flags,
      };
      state.values = {
        ...REMOTE_VALUE_DEFAULTS,
        ...action.payload.values,
      };
      state.version = action.payload.version;
      state.fetchedAt = Date.now();
    },
  },
});

export const { remoteConfigApplied } = flagsSlice.actions;

export const flagsReducer = flagsSlice.reducer;

export const selectFlag = (flag: FeatureFlag) => (state: RootState) => state.flags.flags[flag];

export const selectRemoteValue = (key: RemoteValueKey) => (state: RootState) => state.flags.values[key];
