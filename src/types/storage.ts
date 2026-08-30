export interface StorageDriver {
  readonly name: string;
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  getAllKeys(): string[];
  clearAll(): void;
}

export interface TypedStore<T> {
  get(): T | undefined;
  set(value: T): void;
  remove(): void;
}
