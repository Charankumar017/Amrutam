import type { Storage } from 'redux-persist';
import { storage } from '@/services/storage';

export const mmkvStorage: Storage = {
  getItem: key => Promise.resolve(storage().getString(key) ?? null),
  setItem: (key, value) => {
    storage().set(key, value);
    return Promise.resolve();
  },
  removeItem: key => {
    storage().delete(key);
    return Promise.resolve();
  },
};
