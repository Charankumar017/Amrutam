/* eslint-disable no-bitwise */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    float: (min: number, max: number, decimals = 1) => {
      const value = min + next() * (max - min);
      const factor = 10 ** decimals;
      return Math.round(value * factor) / factor;
    },
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T,
    pickMany: <T>(items: readonly T[], count: number): T[] => {
      const pool = [...items];
      const out: T[] = [];
      for (let i = 0; i < count && pool.length > 0; i++) {
        out.push(pool.splice(Math.floor(next() * pool.length), 1)[0] as T);
      }
      return out;
    },
    bool: (probability = 0.5) => next() < probability,
  };
}

export type Random = ReturnType<typeof createRandom>;
