import type { LogRecord, LogTransport } from '@/types/logger';

const CONSOLE_METHOD = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const;

export const consoleTransport: LogTransport = {
  name: 'console',
  write(record) {
    const method = CONSOLE_METHOD[record.level];
    const prefix = `[${record.level.toUpperCase()}][${record.scope}]`;
    if (record.context) {
      console[method](prefix, record.message, record.context);
    } else {
      console[method](prefix, record.message);
    }
  },
};

export function createMemoryTransport(capacity = 200) {
  const buffer: LogRecord[] = [];
  return {
    transport: {
      name: 'memory',
      write(record: LogRecord) {
        buffer.push(record);
        if (buffer.length > capacity) buffer.shift();
      },
    } satisfies LogTransport,
    snapshot: (): readonly LogRecord[] => [...buffer],
    clear: () => {
      buffer.length = 0;
    },
  };
}
