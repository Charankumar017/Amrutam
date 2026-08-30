import { callApi } from '@/services/api';
import { createLogger } from '@/utils/logger';
import { remoteConfigApplied } from '@/redux/slices/flagsSlice';
import type { AppThunk } from '@/redux/store';
import type { RemoteConfigPayload } from '@/utils/featureFlags';

const log = createLogger('remote-config');

export const loadRemoteConfig = (): AppThunk<Promise<void>> => async dispatch => {
  try {
    const payload = await callApi<RemoteConfigPayload>({
      path: '/config/remote',
    });
    dispatch(remoteConfigApplied(payload));
  } catch (error) {
    log.warn('remote config unavailable, keeping cached values', {
      error: String(error),
    });
  }
};
