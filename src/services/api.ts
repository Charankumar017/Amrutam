import { resolve } from '@/services/mock/handlers';
import { apiError, statusToCode, type ApiError } from '@/services/errors';

export interface ApiRequest {
  path: string;
  method?: 'GET' | 'POST' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  idempotencyKey?: string;
}

function toStringQuery(query: ApiRequest['query']): Record<string, string> {
  const out: Record<string, string> = {};
  if (!query) return out;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = String(value);
  }
  return out;
}

export async function callApi<T>(args: ApiRequest): Promise<T> {
  await new Promise(done => setTimeout(done, 0));
  const method = args.method ?? 'GET';
  const match = resolve(method, args.path);
  if (!match) throw apiError('not_found');
  let response;
  try {
    response = match.route.handle(
      {
        method,
        path: args.path,
        query: toStringQuery(args.query),
        body: args.body ?? null,
        headers: args.idempotencyKey
          ? {
              'Idempotency-Key': args.idempotencyKey,
            }
          : {},
      },
      match.params,
    );
  } catch {
    throw apiError('unknown');
  }
  if (response.status >= 400) throw apiError(statusToCode(response.status), response.body);
  return response.body as T;
}

export type { ApiError };
