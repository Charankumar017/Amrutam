export const FEATURE_FLAG_DEFAULTS = {
  shop_wishlist: true,
  records_year_grouping: true,
  consultation_video_room: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAG_DEFAULTS;

export const REMOTE_VALUE_DEFAULTS = {
  pageSize: 20,
  maxCartQuantity: 10,
  freeShippingThreshold: 999,
  bookingCancellationWindowHours: 4,
} as const;

export type RemoteValueKey = keyof typeof REMOTE_VALUE_DEFAULTS;

export interface RemoteConfigPayload {
  version: number;
  flags: Partial<Record<FeatureFlag, boolean>>;
  values: Partial<Record<RemoteValueKey, number>>;
}
