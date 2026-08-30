export function toggle<T>(items: readonly T[], value: T): T[] {
  return items.includes(value) ? items.filter(item => item !== value) : [...items, value];
}

export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}
