export const HEALTH_RECORD_TYPES = [
  'lab_report',
  'prescription',
  'consultation',
  'vaccination',
  'allergy',
] as const;

export type HealthRecordType = (typeof HEALTH_RECORD_TYPES)[number];

export interface Attachment {
  id: string;
  kind: 'image' | 'pdf';
  name: string;
  sizeKb: number;
  thumbSeed: number;
  pageCount?: number;
}

export interface HealthRecord {
  id: string;
  type: HealthRecordType;
  title: string;
  summary: string;
  recordedAt: string;
  provider: string;
  tags: string[];
  attachments: Attachment[];
  severity: 'low' | 'moderate' | 'high' | null;
}

export interface HealthRecordFilters {
  readonly query: string;
  readonly types: readonly HealthRecordType[];
  readonly tags: readonly string[];
  readonly from: string | null;
  readonly to: string | null;
}

export const EMPTY_RECORD_FILTERS: HealthRecordFilters = {
  query: '',
  types: [],
  tags: [],
  from: null,
  to: null,
};

export interface TimelineSection {
  readonly key: string;
  readonly label: string;
  readonly count: number;
}

export type TimelineRow =
  | {
      readonly kind: 'header';
      readonly key: string;
      readonly section: TimelineSection;
    }
  | {
      readonly kind: 'record';
      readonly key: string;
      readonly record: HealthRecord;
    };
