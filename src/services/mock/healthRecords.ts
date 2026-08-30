import type { Attachment, HealthRecord, HealthRecordType } from '@/types/healthRecords';
import { HEALTH_RECORD_TYPES } from '@/types/healthRecords';
import { createRandom, type Random } from '@/services/mock/random';
import {
  ALLERGENS,
  FIRST_NAMES,
  LAB_PANELS,
  LAST_NAMES,
  PRODUCT_NOUNS,
  RECORD_TAGS,
  SPECIALIZATIONS,
  VACCINES,
} from '@/services/mock/vocab';

export interface HealthRecordRow {
  readonly record: HealthRecord;
  readonly search: string;
  readonly recordedAtMs: number;
}

function titleFor(
  type: HealthRecordType,
  rng: Random,
): {
  title: string;
  summary: string;
} {
  switch (type) {
    case 'lab_report': {
      const panel = rng.pick(LAB_PANELS);
      return {
        title: panel,
        summary: `${panel} - ${rng.int(
          1,
          4,
        )} markers outside the reference range, repeat advised in ${rng.int(4, 24)} weeks.`,
      };
    }
    case 'prescription': {
      const herb = rng.pick(PRODUCT_NOUNS);
      return {
        title: `${herb} regimen`,
        summary: `${herb} ${rng.int(1, 2)} tsp twice daily after meals for ${rng.int(
          2,
          12,
        )} weeks, with dietary adjustments.`,
      };
    }
    case 'consultation': {
      const spec = rng.pick(SPECIALIZATIONS);
      return {
        title: `${spec} consultation`,
        summary: `Reviewed prakriti and current symptoms; advised ${rng.pick([
          'abhyanga',
          'nasya',
          'shirodhara',
          'basti',
        ])} and a ${rng.int(2, 8)} week follow-up.`,
      };
    }
    case 'vaccination': {
      const vaccine = rng.pick(VACCINES);
      return {
        title: `${vaccine} vaccination`,
        summary: `Dose ${rng.int(1, 3)} administered, batch ${rng.int(
          10_000,
          99_999,
        )}. No adverse reaction observed.`,
      };
    }
    case 'allergy': {
      const allergen = rng.pick(ALLERGENS);
      return {
        title: `${allergen} allergy`,
        summary: `Reaction: ${rng.pick([
          'urticaria',
          'rhinitis',
          'wheezing',
          'GI upset',
        ])}. Avoidance advised; antihistamine on hand.`,
      };
    }
  }
}

function attachmentsFor(type: HealthRecordType, id: string, rng: Random): Attachment[] {
  const count = type === 'lab_report' ? rng.int(1, 3) : rng.int(0, 2);
  const out: Attachment[] = [];
  for (let i = 0; i < count; i++) {
    const kind = rng.bool(type === 'lab_report' ? 0.25 : 0.6) ? 'image' : 'pdf';
    out.push({
      id: `${id}_att_${i}`,
      kind,
      name: `${type}_${i + 1}.${kind === 'pdf' ? 'pdf' : 'jpg'}`,
      sizeKb: rng.int(48, 4_800),
      thumbSeed: rng.int(0, 9_999),
      ...(kind === 'pdf'
        ? {
            pageCount: rng.int(1, 12),
          }
        : {}),
    });
  }
  return out;
}

export function generateHealthRecords(count: number, seed: number, now: number): HealthRecordRow[] {
  const rng = createRandom(seed);
  const rows: HealthRecordRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const type = rng.pick(HEALTH_RECORD_TYPES);
    const id = `rec_${i.toString(36).padStart(4, '0')}`;
    const { title, summary } = titleFor(type, rng);
    const recordedAtMs = now - rng.int(0, 2_190) * 86_400_000 - rng.int(0, 86_399) * 1_000;
    const provider = `Dr. ${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    const tags = rng.pickMany(RECORD_TAGS, rng.int(1, 3));
    const record: HealthRecord = {
      id,
      type,
      title,
      summary,
      recordedAt: new Date(recordedAtMs).toISOString(),
      provider,
      tags,
      attachments: attachmentsFor(type, id, rng),
      severity: type === 'allergy' ? rng.pick(['low', 'moderate', 'high'] as const) : null,
    };
    rows[i] = {
      record,
      recordedAtMs,
      search: `${title} ${summary} ${provider} ${tags.join(' ')}`.toLowerCase(),
    };
  }
  rows.sort((a, b) => b.recordedAtMs - a.recordedAtMs);
  return rows;
}
