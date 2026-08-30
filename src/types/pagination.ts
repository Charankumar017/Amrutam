export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly total: number;
}

export interface FacetValue {
  readonly value: string;
  readonly count: number;
}

export interface Facets {
  readonly [group: string]: readonly FacetValue[];
}
