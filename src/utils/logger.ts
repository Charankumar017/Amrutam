import { getConfig } from '@/utils/config';
import { consoleTransport } from '@/utils/logTransports';
import type { LogLevel, LogRecord, LogTransport, Logger } from '@/types/logger';

export * from '@/types/logger';

const RANK: Record<LogLevel | 'silent', number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const transports: LogTransport[] = [consoleTransport];

function emit(record: LogRecord): void {
  if (RANK[record.level] < RANK[getConfig().logLevel]) return;
  for (const t of transports) {
    try {
      t.write(record);
    } catch {}
  }
}

export function createLogger(scope: string): Logger {
  const at = (level: LogLevel) => (message: string, context?: Record<string, unknown>) =>
    emit({
      level,
      scope,
      message,
      context,
      timestamp: Date.now(),
    });
  return {
    debug: at('debug'),
    info: at('info'),
    warn: at('warn'),
    error: at('error'),
    child: (child: string) => createLogger(`${scope}/${child}`),
  };
}
