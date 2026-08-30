import { getConfig } from '@/utils/config';
import { createLogger } from '@/utils/logger';
import { createStore } from '@/services/storage';
import type { Booking, Doctor, DoctorSort, Slot } from '@/types/consultations';
import type { HealthRecordType } from '@/types/healthRecords';
import type { ProductSort } from '@/types/shop';
import type { FacetValue } from '@/types';
import { generateDoctors, type DoctorRow } from '@/services/mock/doctors';
import { generateHealthRecords, type HealthRecordRow } from '@/services/mock/healthRecords';
import { generateProducts, type ProductRow } from '@/services/mock/products';
import { createRandom } from '@/services/mock/random';

const log = createLogger('mocks/db');

export interface DoctorTable {
  rows: DoctorRow[];
  order: Record<DoctorSort, Int32Array>;
  facets: Record<string, FacetValue[]>;
}

export interface ProductTable {
  rows: ProductRow[];
  order: Record<ProductSort, Int32Array>;
  facets: Record<string, FacetValue[]>;
}

export interface RecordTable {
  rows: HealthRecordRow[];
  facets: Record<string, FacetValue[]>;
}

function orderBy<T>(rows: readonly T[], compare: (a: T, b: T) => number): Int32Array {
  const idx = Array.from(
    {
      length: rows.length,
    },
    (_, i) => i,
  );
  idx.sort((a, b) => compare(rows[a] as T, rows[b] as T));
  return Int32Array.from(idx);
}

export function identityOrder(length: number): Int32Array {
  const arr = new Int32Array(length);
  for (let i = 0; i < length; i++) arr[i] = i;
  return arr;
}

function countFacet(values: Iterable<string>): FacetValue[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function lazyTable<T>(name: string, build: () => T): () => T {
  let value: T | null = null;
  return () => {
    if (value) return value;
    const startedAt = Date.now();
    value = build();
    log.info(`mock ${name} table ready`, {
      ms: Date.now() - startedAt,
    });
    return value;
  };
}

let doctorTable = makeDoctorTable();

let productTable = makeProductTable();

let recordTable = makeRecordTable();

function makeDoctorTable() {
  return lazyTable<DoctorTable>('doctors', () => {
    const { dataset } = getConfig();
    const rows = generateDoctors(dataset.doctors, dataset.seed, Date.now());
    return {
      rows,
      order: {
        relevance: identityOrder(rows.length),
        rating_desc: orderBy(
          rows,
          (a, b) => b.doctor.rating - a.doctor.rating || b.doctor.reviewCount - a.doctor.reviewCount,
        ),
        fee_asc: orderBy(rows, (a, b) => a.doctor.consultationFee - b.doctor.consultationFee),
        fee_desc: orderBy(rows, (a, b) => b.doctor.consultationFee - a.doctor.consultationFee),
        experience_desc: orderBy(rows, (a, b) => b.doctor.experienceYears - a.doctor.experienceYears),
      },
      facets: {
        specialization: countFacet(rows.map(d => d.doctor.specialization)),
        city: countFacet(rows.map(d => d.doctor.city)),
        language: countFacet(rows.flatMap(d => d.doctor.languages)),
      },
    };
  });
}

function makeProductTable() {
  return lazyTable<ProductTable>('products', () => {
    const { dataset } = getConfig();
    const rows = generateProducts(dataset.products, dataset.seed + 1, Date.now());
    return {
      rows,
      order: {
        relevance: identityOrder(rows.length),
        price_asc: orderBy(rows, (a, b) => a.product.price - b.product.price),
        price_desc: orderBy(rows, (a, b) => b.product.price - a.product.price),
        rating_desc: orderBy(
          rows,
          (a, b) => b.product.rating - a.product.rating || b.product.reviewCount - a.product.reviewCount,
        ),
        newest: orderBy(rows, (a, b) => b.product.createdAt.localeCompare(a.product.createdAt)),
      },
      facets: {
        category: countFacet(rows.map(p => p.product.category)),
        brand: countFacet(rows.map(p => p.product.brand)),
        concern: countFacet(rows.flatMap(p => p.product.concerns)),
      },
    };
  });
}

function makeRecordTable() {
  return lazyTable<RecordTable>('healthRecords', () => {
    const { dataset } = getConfig();
    const rows = generateHealthRecords(dataset.healthRecords, dataset.seed + 2, Date.now());
    return {
      rows,
      facets: {
        type: countFacet(rows.map(r => r.record.type as HealthRecordType)),
        tag: countFacet(rows.flatMap(r => r.record.tags)),
      },
    };
  });
}

export const doctors = (): DoctorTable => doctorTable();

export const products = (): ProductTable => productTable();

export const healthRecords = (): RecordTable => recordTable();

const SLOT_MINUTES = 30;

export function generateSlots(doctor: Doctor, dateISO: string): Slot[] {
  const dayStart = new Date(`${dateISO}T00:00:00`).getTime();
  if (Number.isNaN(dayStart)) return [];
  const numericId = Number.parseInt(doctor.id.slice(4), 36);
  const daySeed = Number(dateISO.replace(/-/g, ''));
  const rng = createRandom(numericId * 7919 + daySeed);
  const slots: Slot[] = [];
  for (const [startHour, endHour] of [
    [9, 12.5],
    [16, 19.5],
  ] as const) {
    for (let h = startHour; h < endHour; h += SLOT_MINUTES / 60) {
      if (rng.bool(0.25)) continue;
      const startsAt = dayStart + h * 3_600_000;
      const mode = doctor.modes.length === 1 ? doctor.modes[0]! : rng.bool(0.6) ? 'online' : 'in_person';
      const randomlyTaken = rng.bool(0.18);
      const id = `slot_${doctor.id}_${startsAt}`;
      slots.push({
        id,
        doctorId: doctor.id,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(startsAt + SLOT_MINUTES * 60_000).toISOString(),
        mode,
        isBooked: bookedSlotIds().has(id) || randomlyTaken,
      });
    }
  }
  return slots;
}

const bookingStore = createStore<Booking[]>('mock.bookings');

let bookings: Booking[] | null = null;

let bookedIds: Set<string> | null = null;

export function allBookings(): Booking[] {
  bookings ??= bookingStore.get() ?? [];
  return bookings;
}

function bookedSlotIds(): Set<string> {
  if (!bookedIds) {
    bookedIds = new Set(
      allBookings()
        .filter(b => b.status !== 'cancelled')
        .map(b => b.slotId),
    );
  }
  return bookedIds;
}

export function persistBookings(next: Booking[]): void {
  bookings = next;
  bookedIds = new Set(next.filter(b => b.status !== 'cancelled').map(b => b.slotId));
  bookingStore.set(next);
}
