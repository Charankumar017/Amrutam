import type { AppConfig, AppEnvironment } from '@/types/config';

const DATASET = {
  doctors: 5_000,
  products: 20_000,
  healthRecords: 10_000,
  seed: 20260828,
} as const;

const CACHE = {
  staleTimeMs: 60_000,
  gcTimeMs: 10 * 60_000,
  maxHydrationAgeMs: 7 * 24 * 60 * 60_000,
} as const;

export const ENVIRONMENTS: Record<AppEnvironment, AppConfig> = {
  development: {
    env: 'development',
    logLevel: 'debug',
    cache: CACHE,
    dataset: DATASET,
  },
  staging: {
    env: 'staging',
    logLevel: 'info',
    cache: CACHE,
    dataset: DATASET,
  },
  production: {
    env: 'production',
    logLevel: 'warn',
    cache: CACHE,
    dataset: DATASET,
  },
};
