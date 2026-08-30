import type { Booking, DoctorSort } from '@/types/consultations';
import type { HealthRecordType } from '@/types/healthRecords';
import type { ProductSort } from '@/types/shop';
import type { Page } from '@/types';
import { dateKeyOf } from '@/utils';
import {
  allBookings,
  doctors,
  generateSlots,
  healthRecords,
  identityOrder,
  persistBookings,
  products,
} from '@/services/mock/db';

export interface MockRequest {
  readonly method: string;
  readonly path: string;
  readonly query: Record<string, string>;
  readonly body: unknown;
  readonly headers: Record<string, string>;
}

export interface MockResponse {
  readonly status: number;
  readonly body: unknown;
}

const DEFAULT_LIMIT = 20;

const MAX_LIMIT = 50;

function list(query: Record<string, string>, key: string): string[] {
  const raw = query[key];
  return raw ? raw.split(',').filter(Boolean) : [];
}

function num(query: Record<string, string>, key: string): number | null {
  const raw = query[key];
  if (raw === undefined || raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function paginate<T>(
  order: Int32Array,
  cursor: number,
  limit: number,
  matches: (index: number) => boolean,
  project: (index: number) => T,
): Page<T> {
  const items: T[] = [];
  let scanned = cursor;
  let matched = 0;
  for (let i = 0; i < order.length; i++) {
    const index = order[i] as number;
    if (!matches(index)) continue;
    matched++;
    if (matched <= cursor) continue;
    if (items.length < limit) {
      items.push(project(index));
      scanned = matched;
    }
  }
  return {
    items,
    total: matched,
    nextCursor: scanned < matched ? String(scanned) : null,
  };
}

function clampLimit(query: Record<string, string>): number {
  return Math.min(MAX_LIMIT, Math.max(1, num(query, 'limit') ?? DEFAULT_LIMIT));
}

function cursorOf(query: Record<string, string>): number {
  return Math.max(0, num(query, 'cursor') ?? 0);
}

function listDoctors(req: MockRequest): MockResponse {
  const { rows: doctorRows, order: doctorOrder } = doctors();
  const q = (req.query.query ?? '').trim().toLowerCase();
  const specializations = new Set(list(req.query, 'specializations'));
  const cities = new Set(list(req.query, 'cities'));
  const modes = new Set(list(req.query, 'modes'));
  const minRating = num(req.query, 'minRating');
  const maxFee = num(req.query, 'maxFee');
  const sort = (req.query.sort ?? 'relevance') as DoctorSort;
  const order = doctorOrder[sort] ?? doctorOrder.relevance;
  const matches = (i: number): boolean => {
    const row = doctorRows[i]!;
    if (q && !row.search.includes(q)) return false;
    if (specializations.size && !specializations.has(row.doctor.specialization)) return false;
    if (cities.size && !cities.has(row.doctor.city)) return false;
    if (modes.size && !row.doctor.modes.some(m => modes.has(m))) return false;
    if (minRating !== null && row.doctor.rating < minRating) return false;
    if (maxFee !== null && row.doctor.consultationFee > maxFee) return false;
    return true;
  };
  return {
    status: 200,
    body: paginate(order, cursorOf(req.query), clampLimit(req.query), matches, i => doctorRows[i]!.doctor),
  };
}

function listProducts(req: MockRequest): MockResponse {
  const { rows: productRows, order: productOrder } = products();
  const q = (req.query.query ?? '').trim().toLowerCase();
  const categories = new Set(list(req.query, 'categories'));
  const brands = new Set(list(req.query, 'brands'));
  const concerns = new Set(list(req.query, 'concerns'));
  const minRating = num(req.query, 'minRating');
  const maxPrice = num(req.query, 'maxPrice');
  const inStockOnly = req.query.inStockOnly === 'true';
  const sort = (req.query.sort ?? 'relevance') as ProductSort;
  const order = productOrder[sort] ?? productOrder.relevance;
  const matches = (i: number): boolean => {
    const row = productRows[i]!;
    if (q && !row.search.includes(q)) return false;
    if (categories.size && !categories.has(row.product.category)) return false;
    if (brands.size && !brands.has(row.product.brand)) return false;
    if (concerns.size && !row.product.concerns.some(c => concerns.has(c))) return false;
    if (minRating !== null && row.product.rating < minRating) return false;
    if (maxPrice !== null && row.product.price > maxPrice) return false;
    if (inStockOnly && !row.product.inStock) return false;
    return true;
  };
  return {
    status: 200,
    body: paginate(order, cursorOf(req.query), clampLimit(req.query), matches, i => productRows[i]!.product),
  };
}

function listHealthRecords(req: MockRequest): MockResponse {
  const { rows: records } = healthRecords();
  const q = (req.query.query ?? '').trim().toLowerCase();
  const types = new Set(list(req.query, 'types') as HealthRecordType[]);
  const tags = new Set(list(req.query, 'tags'));
  const from = req.query.from ? Date.parse(req.query.from) : null;
  const to = req.query.to ? Date.parse(req.query.to) : null;
  const order = identityOrder(records.length);
  const matches = (i: number): boolean => {
    const row = records[i]!;
    if (q && !row.search.includes(q)) return false;
    if (types.size && !types.has(row.record.type)) return false;
    if (tags.size && !row.record.tags.some(t => tags.has(t))) return false;
    if (from !== null && row.recordedAtMs < from) return false;
    if (to !== null && row.recordedAtMs > to) return false;
    return true;
  };
  return {
    status: 200,
    body: paginate(order, cursorOf(req.query), clampLimit(req.query), matches, i => records[i]!.record),
  };
}

function createBooking(req: MockRequest): MockResponse {
  const payload = req.body as {
    doctorId?: string;
    slotId?: string;
    clientRef?: string;
  } | null;
  if (!payload?.doctorId || !payload.slotId) {
    return {
      status: 400,
      body: {
        error: 'doctorId and slotId are required',
      },
    };
  }
  const idempotencyKey = req.headers['Idempotency-Key'] ?? req.headers['idempotency-key'];
  const existing = allBookings();
  if (idempotencyKey) {
    const replay = existing.find(b => b.clientRef === idempotencyKey);
    if (replay)
      return {
        status: 200,
        body: replay,
      };
  }
  const doctorRow = doctors().rows.find(d => d.doctor.id === payload.doctorId);
  if (!doctorRow)
    return {
      status: 404,
      body: {
        error: 'Doctor not found',
      },
    };
  const dateISO = payload.slotId.split('_').pop();
  const slotStart = Number(dateISO);
  if (!Number.isFinite(slotStart)) {
    return {
      status: 400,
      body: {
        error: 'Malformed slot id',
      },
    };
  }
  if (slotStart < Date.now()) {
    return {
      status: 409,
      body: {
        error: 'slot_expired',
      },
    };
  }
  const day = dateKeyOf(slotStart);
  const slot = generateSlots(doctorRow.doctor, day).find(s => s.id === payload.slotId);
  if (!slot)
    return {
      status: 404,
      body: {
        error: 'Slot not found',
      },
    };
  if (slot.isBooked)
    return {
      status: 409,
      body: {
        error: 'slot_taken',
      },
    };
  const start = Date.parse(slot.startsAt);
  const end = Date.parse(slot.endsAt);
  const overlaps = existing.some(
    b => b.status !== 'cancelled' && Date.parse(b.startsAt) < end && start < Date.parse(b.endsAt),
  );
  if (overlaps)
    return {
      status: 409,
      body: {
        error: 'overlapping_booking',
      },
    };
  const booking: Booking = {
    id: `bkg_${slot.id}`,
    doctorId: doctorRow.doctor.id,
    doctorName: doctorRow.doctor.name,
    specialization: doctorRow.doctor.specialization,
    slotId: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    mode: slot.mode,
    fee: doctorRow.doctor.consultationFee,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    ...(idempotencyKey
      ? {
          clientRef: idempotencyKey,
        }
      : {}),
  };
  persistBookings([...existing, booking]);
  return {
    status: 201,
    body: booking,
  };
}

function cancelBooking(id: string): MockResponse {
  const existing = allBookings();
  const target = existing.find(b => b.id === id);
  if (!target)
    return {
      status: 404,
      body: {
        error: 'Booking not found',
      },
    };
  if (target.status === 'cancelled')
    return {
      status: 200,
      body: target,
    };
  const cancelled: Booking = {
    ...target,
    status: 'cancelled',
  };
  persistBookings(existing.map(b => (b.id === id ? cancelled : b)));
  return {
    status: 200,
    body: cancelled,
  };
}

type Handler = (req: MockRequest, params: Record<string, string>) => MockResponse;

interface Route {
  readonly method: string;
  readonly segments: readonly string[];
  readonly handle: Handler;
}

function route(method: string, pattern: string, handle: Handler): Route {
  return {
    method,
    segments: pattern.split('/').filter(Boolean),
    handle,
  };
}

const ROUTES: readonly Route[] = [
  route('GET', '/doctors', listDoctors),
  route('GET', '/doctors/facets', () => ({
    status: 200,
    body: doctors().facets,
  })),
  route('GET', '/doctors/:id', (_req, params) => {
    const row = doctors().rows.find(d => d.doctor.id === params.id);
    return row
      ? {
          status: 200,
          body: row.doctor,
        }
      : {
          status: 404,
          body: {
            error: 'Doctor not found',
          },
        };
  }),
  route('GET', '/doctors/:id/slots', (req, params) => {
    const row = doctors().rows.find(d => d.doctor.id === params.id);
    if (!row)
      return {
        status: 404,
        body: {
          error: 'Doctor not found',
        },
      };
    const date = req.query.date ?? dateKeyOf(Date.now());
    return {
      status: 200,
      body: {
        date,
        slots: generateSlots(row.doctor, date),
      },
    };
  }),
  route('GET', '/bookings', () => ({
    status: 200,
    body: {
      items: allBookings(),
      nextCursor: null,
      total: allBookings().length,
    },
  })),
  route('POST', '/bookings', createBooking),
  route('DELETE', '/bookings/:id', (_req, params) => cancelBooking(params.id!)),
  route('GET', '/products', listProducts),
  route('GET', '/products/facets', () => ({
    status: 200,
    body: products().facets,
  })),
  route('GET', '/products/:id', (_req, params) => {
    const row = products().rows.find(p => p.product.id === params.id);
    return row
      ? {
          status: 200,
          body: row.product,
        }
      : {
          status: 404,
          body: {
            error: 'Product not found',
          },
        };
  }),
  route('GET', '/health-records', listHealthRecords),
  route('GET', '/health-records/facets', () => ({
    status: 200,
    body: healthRecords().facets,
  })),
  route('GET', '/health-records/:id', (_req, params) => {
    const row = healthRecords().rows.find(r => r.record.id === params.id);
    return row
      ? {
          status: 200,
          body: row.record,
        }
      : {
          status: 404,
          body: {
            error: 'Record not found',
          },
        };
  }),
  route('GET', '/config/remote', () => ({
    status: 200,
    body: {
      version: 3,
      flags: {
        shop_wishlist: true,
        records_year_grouping: true,
        consultation_video_room: false,
      },
      values: {
        pageSize: 20,
        maxCartQuantity: 10,
        freeShippingThreshold: 999,
        bookingCancellationWindowHours: 4,
      },
    },
  })),
  route('POST', '/auth/refresh', () => ({
    status: 200,
    body: {
      token: `tok_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      user: {
        id: 'usr_demo',
        name: 'Aarav Menon',
        email: 'aarav@example.com',
      },
    },
  })),
];

export function resolve(
  method: string,
  path: string,
): {
  route: Route;
  params: Record<string, string>;
} | null {
  const parts = path.split('/').filter(Boolean);
  for (const candidate of ROUTES) {
    if (candidate.method !== method) continue;
    if (candidate.segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < parts.length; i++) {
      const seg = candidate.segments[i]!;
      if (seg.startsWith(':')) params[seg.slice(1)] = parts[i]!;
      else if (seg !== parts[i]) {
        matched = false;
        break;
      }
    }
    if (matched)
      return {
        route: candidate,
        params,
      };
  }
  return null;
}
