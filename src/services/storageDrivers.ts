import type { StorageDriver } from '@/types/storage';

export function createMemoryDriver(name = 'memory'): StorageDriver {
  const map = new Map<string, string>();
  return {
    name,
    getString: key => map.get(key),
    set: (key, value) => void map.set(key, value),
    delete: key => void map.delete(key),
    getAllKeys: () => [...map.keys()],
    clearAll: () => map.clear(),
  };
}

export function tryCreateMMKVDriver(options: { id: string; encryptionKey?: string }): StorageDriver | null {
  try {
    const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const instance = new MMKV(options);
    instance.getString('__probe__');
    return {
      name: `mmkv:${options.id}`,
      getString: key => instance.getString(key),
      set: (key, value) => instance.set(key, value),
      delete: key => instance.delete(key),
      getAllKeys: () => instance.getAllKeys(),
      clearAll: () => instance.clearAll(),
    };
  } catch {
    return null;
  }
}
