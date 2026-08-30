export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppConfig {
  readonly env: AppEnvironment;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  readonly cache: CacheConfig;
  readonly dataset: DatasetConfig;
}

export interface CacheConfig {
  readonly staleTimeMs: number;
  readonly gcTimeMs: number;
  readonly maxHydrationAgeMs: number;
}

export interface DatasetConfig {
  readonly doctors: number;
  readonly products: number;
  readonly healthRecords: number;
  readonly seed: number;
}
