import { createLogger } from '@/utils/logger';
import { createMemoryDriver, tryCreateMMKVDriver } from '@/services/storageDrivers';
import type { StorageDriver, TypedStore } from '@/types/storage';

export * from '@/types/storage';

export { createMemoryDriver } from '@/services/storageDrivers';

const log = createLogger('storage');

function resolveDriver(id: string): StorageDriver {
  const mmkv = tryCreateMMKVDriver({
    id,
  });
  if (mmkv) return mmkv;
  log.warn('MMKV unavailable, falling back to in-memory storage', {
    id,
  });
  return createMemoryDriver(`memory:${id}`);
}

let appDriver: StorageDriver | null = null;

export function storage(): StorageDriver {
  appDriver ??= resolveDriver('amrutam.app');
  return appDriver;
}

export function createStore<T>(
  key: string,
  options: {
    version?: number;
  } = {},
): TypedStore<T> {
  const { version = 1 } = options;
  const driver = storage;
  const namespacedKey = `v${version}:${key}`;
  return {
    get() {
      const raw = driver().getString(namespacedKey);
      if (raw === undefined) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch (error) {
        log.warn('dropping corrupt storage entry', {
          key: namespacedKey,
          error: String(error),
        });
        driver().delete(namespacedKey);
        return undefined;
      }
    },
    set(value) {
      try {
        driver().set(namespacedKey, JSON.stringify(value));
      } catch (error) {
        log.error('failed to persist value', {
          key: namespacedKey,
          error: String(error),
        });
      }
    },
    remove() {
      driver().delete(namespacedKey);
    },
  };
}
