import { ENVIRONMENTS } from '@/utils/environments';
import type { AppConfig, AppEnvironment } from '@/types/config';

export * from '@/types/config';

const VALID: readonly AppEnvironment[] = ['development', 'staging', 'production'];

function resolveEnvironment(): AppEnvironment {
  const raw = process.env.APP_ENV;
  if (raw && (VALID as readonly string[]).includes(raw)) {
    return raw as AppEnvironment;
  }
  return __DEV__ ? 'development' : 'production';
}

export function getConfig(): AppConfig {
  return ENVIRONMENTS[resolveEnvironment()];
}

export const config = new Proxy({} as AppConfig, {
  get: (_t, prop: string) => getConfig()[prop as keyof AppConfig],
});
