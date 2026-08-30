export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
  readonly level: LogLevel;
  readonly scope: string;
  readonly message: string;
  readonly context?: Record<string, unknown>;
  readonly timestamp: number;
}

export interface LogTransport {
  readonly name: string;
  write(record: LogRecord): void;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(scope: string): Logger;
}
