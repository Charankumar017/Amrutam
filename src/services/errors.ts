export type ApiErrorCode = 'offline' | 'not_found' | 'conflict' | 'invalid' | 'unknown';

const USER_MESSAGE: Record<ApiErrorCode, string> = {
  offline: "You're offline. We'll retry once you're back.",
  not_found: "We couldn't find what you were looking for.",
  conflict: 'That slot was just taken. Please pick another.',
  invalid: "That request couldn't be completed.",
  unknown: 'Something went wrong. Please try again.',
};

export interface ApiError {
  readonly code: ApiErrorCode;
  readonly userMessage: string;
  readonly retryable: boolean;
  readonly details?: unknown;
}

export function apiError(code: ApiErrorCode, details?: unknown): ApiError {
  return {
    code,
    userMessage: USER_MESSAGE[code],
    retryable: code === 'offline',
    ...(details === undefined
      ? {}
      : {
          details,
        }),
  };
}

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as {
    code?: unknown;
    userMessage?: unknown;
  };
  return typeof candidate.userMessage === 'string' && typeof candidate.code === 'string';
}

export function toApiError(error: unknown): ApiError {
  return isApiError(error) ? error : apiError('unknown');
}

export function statusToCode(status: number): ApiErrorCode {
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status >= 400 && status < 500) return 'invalid';
  return 'unknown';
}
