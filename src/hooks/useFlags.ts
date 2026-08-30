import { useAppSelector } from '@/redux/hooks';
import { selectFlag, selectRemoteValue } from '@/redux/slices/flagsSlice';
import type { FeatureFlag, RemoteValueKey } from '@/utils/featureFlags';

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useAppSelector(selectFlag(flag));
}

export function useRemoteValue(key: RemoteValueKey): number {
  return useAppSelector(selectRemoteValue(key));
}
