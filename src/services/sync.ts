import { toApiError } from '@/services/errors';
import { createLogger } from '@/utils/logger';
import type { AppDispatch, AppThunk } from '@/redux/store';
import { selectIsOnline } from '@/redux/slices/networkSlice';
import {
  MAX_SYNC_ATTEMPTS,
  attemptFailed,
  attemptStarted,
  dequeued,
  syncFinished,
  syncStarted,
  type QueuedMutation,
} from '@/redux/slices/offlineSlice';
import { getSyncHandler } from '@/services/syncHandlers';

const log = createLogger('offline/sync');

export const drainOfflineQueue = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { offline, network } = getState();
  if (offline.isSyncing || !network.isOnline) return;
  const runnable = offline.pending.filter(item => item.status === 'queued');
  if (runnable.length === 0) return;
  dispatch(syncStarted());
  log.info('draining offline queue', {
    depth: runnable.length,
  });
  try {
    for (const item of runnable) {
      if (!selectIsOnline(getState())) break;
      await runMutation(item, dispatch as AppDispatch);
    }
  } finally {
    dispatch(syncFinished());
  }
};

const runMutation = async (item: QueuedMutation, dispatch: AppDispatch): Promise<void> => {
  const handler = getSyncHandler(item.kind);
  if (!handler) {
    log.error('no handler registered, dropping mutation', {
      kind: item.kind,
      id: item.id,
    });
    dispatch(
      attemptFailed({
        id: item.id,
        error: `No handler for "${item.kind}"`,
        giveUp: true,
        countsAsAttempt: true,
      }),
    );
    return;
  }
  dispatch(attemptStarted(item.id));
  try {
    await handler(item.payload, item, dispatch);
    dispatch(dequeued(item.id));
    log.info('mutation synced', {
      kind: item.kind,
      id: item.id,
    });
  } catch (error) {
    const failure = toApiError(error);
    const isOffline = failure.code === 'offline';
    const attempts = item.attempts + 1;
    const giveUp = !(failure.retryable || isOffline) || (!isOffline && attempts >= MAX_SYNC_ATTEMPTS);
    log.warn('mutation sync failed', {
      kind: item.kind,
      id: item.id,
      attempts,
      code: failure.code,
      giveUp,
    });
    dispatch(
      attemptFailed({
        id: item.id,
        error: failure.userMessage,
        giveUp,
        countsAsAttempt: !isOffline,
      }),
    );
  }
};
