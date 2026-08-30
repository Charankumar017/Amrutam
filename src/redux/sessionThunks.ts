import { createLogger } from '@/utils/logger';
import { createStore } from '@/services/storage';
import type { AppThunk } from '@/redux/store';
import { refreshFailed, refreshStarted, sessionReceived } from '@/redux/slices/sessionSlice';
import { callApi } from '@/services/api';
import type { Session } from '@/types/auth';

const log = createLogger('session');

const sessionStore = createStore<Session>('auth.session');

export function readStoredSession(): Session | null {
  return sessionStore.get() ?? null;
}

let inFlight: Promise<boolean> | null = null;

export const refreshSession = (): AppThunk<Promise<boolean>> => dispatch => {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    dispatch(refreshStarted());
    try {
      const next = await callApi<Session>({
        path: '/auth/refresh',
        method: 'POST',
      });
      sessionStore.set(next);
      dispatch(sessionReceived(next));
      return true;
    } catch (error) {
      log.warn('session refresh failed', {
        error: String(error),
      });
      dispatch(refreshFailed());
      return false;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
};
