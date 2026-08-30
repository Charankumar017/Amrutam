import { monthKey, monthLabel, yearKey } from '@/utils';
import type { HealthRecord, HealthRecordType, TimelineRow, TimelineSection } from '@/types/healthRecords';

export const RECORD_TYPE_LABEL: Record<HealthRecordType, string> = {
  lab_report: 'Lab report',
  prescription: 'Prescription',
  consultation: 'Consultation',
  vaccination: 'Vaccination',
  allergy: 'Allergy',
};

export const RECORD_TYPE_GLYPH: Record<HealthRecordType, string> = {
  lab_report: '🧪',
  prescription: '📝',
  consultation: '🩺',
  vaccination: '💉',
  allergy: '⚠️',
};

export type TimelineGrouping = 'month' | 'year';

export function buildTimeline(
  records: readonly HealthRecord[],
  grouping: TimelineGrouping = 'month',
): {
  rows: TimelineRow[];
  stickyIndices: number[];
  sections: TimelineSection[];
} {
  const rows: TimelineRow[] = [];
  const stickyIndices: number[] = [];
  const sections: TimelineSection[] = [];
  let currentKey: string | null = null;
  let currentSection: {
    key: string;
    label: string;
    count: number;
  } | null = null;
  for (const record of records) {
    const key = grouping === 'year' ? yearKey(record.recordedAt) : monthKey(record.recordedAt);
    if (key !== currentKey) {
      currentKey = key;
      currentSection = {
        key,
        label: grouping === 'year' ? key : monthLabel(key),
        count: 0,
      };
      sections.push(currentSection as TimelineSection);
      stickyIndices.push(rows.length);
      rows.push({
        kind: 'header',
        key: `header_${key}`,
        section: currentSection as TimelineSection,
      });
    }
    if (currentSection) currentSection.count += 1;
    rows.push({
      kind: 'record',
      key: record.id,
      record,
    });
  }
  return {
    rows,
    stickyIndices,
    sections,
  };
}

export function countActiveRecordFilters(filters: {
  types: readonly string[];
  tags: readonly string[];
  from: string | null;
  to: string | null;
}): number {
  return filters.types.length + filters.tags.length + (filters.from ? 1 : 0) + (filters.to ? 1 : 0);
}

export function attachmentSummary(record: HealthRecord): string {
  const images = record.attachments.filter(a => a.kind === 'image').length;
  const pdfs = record.attachments.length - images;
  const parts: string[] = [];
  if (images) parts.push(`${images} image${images > 1 ? 's' : ''}`);
  if (pdfs) parts.push(`${pdfs} PDF${pdfs > 1 ? 's' : ''}`);
  return parts.join(' · ');
}
