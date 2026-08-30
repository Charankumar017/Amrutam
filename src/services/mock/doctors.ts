import type { Doctor } from '@/types/consultations';
import { createRandom } from '@/services/mock/random';
import {
  CITIES,
  FIRST_NAMES,
  LANGUAGES,
  LAST_NAMES,
  QUALIFICATIONS,
  SPECIALIZATIONS,
} from '@/services/mock/vocab';

export interface DoctorRow {
  readonly doctor: Doctor;
  readonly search: string;
}

export function generateDoctors(count: number, seed: number, now: number): DoctorRow[] {
  const rng = createRandom(seed);
  const rows: DoctorRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const name = `Dr. ${first} ${last}`;
    const specialization = rng.pick(SPECIALIZATIONS);
    const city = rng.pick(CITIES);
    const online = rng.bool(0.8);
    const inPerson = rng.bool(0.7);
    const modes =
      online && inPerson
        ? (['online', 'in_person'] as const)
        : online
        ? (['online'] as const)
        : (['in_person'] as const);
    const experienceYears = rng.int(2, 32);
    const doctor: Doctor = {
      id: `doc_${i.toString(36).padStart(4, '0')}`,
      name,
      specialization,
      qualifications: rng.pickMany(QUALIFICATIONS, rng.int(1, 3)),
      city,
      modes: [...modes],
      experienceYears,
      rating: rng.float(3.2, 5, 1),
      reviewCount: rng.int(4, 2_400),
      consultationFee: rng.int(6, 40) * 50,
      languages: rng.pickMany(LANGUAGES, rng.int(1, 4)),
      bio: `${name} has ${experienceYears} years of clinical practice in ${specialization}, focusing on root-cause diagnosis and personalised dinacharya for patients in ${city}.`,
      avatarSeed: rng.int(0, 9_999),
      nextAvailableAt: new Date(now + rng.int(1, 14 * 24) * 3_600_000).toISOString(),
    };
    rows[i] = {
      doctor,
      search: `${name} ${specialization} ${city} ${doctor.languages.join(' ')}`.toLowerCase(),
    };
  }
  return rows;
}
