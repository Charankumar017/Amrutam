import type { AppDispatch } from '@/redux/store';
import type { QueuedMutation } from '@/redux/slices/offlineSlice';

export type SyncHandler<TPayload = any> = (
  payload: TPayload,
  mutation: QueuedMutation<TPayload>,
  dispatch: AppDispatch,
) => Promise<void>;

const handlers = new Map<string, SyncHandler>();

export function registerSyncHandler(kind: string, handler: SyncHandler): void {
  handlers.set(kind, handler);
}

export function getSyncHandler(kind: string): SyncHandler | undefined {
  return handlers.get(kind);
}
