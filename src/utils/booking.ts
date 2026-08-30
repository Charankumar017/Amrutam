import { err, ok, type Result } from '@/types';
import type { Booking, Slot } from '@/types/consultations';

export type BookingRejection = 'slot_expired' | 'slot_taken' | 'duplicate_booking' | 'overlapping_booking';

const isActive = (booking: Booking): boolean =>
  booking.status === 'confirmed' || booking.status === 'pending_sync';

export function isSlotExpired(slot: Pick<Slot, 'startsAt'>, now: number): boolean {
  return Date.parse(slot.startsAt) <= now;
}

export function overlaps(
  a: {
    startsAt: string;
    endsAt: string;
  },
  b: {
    startsAt: string;
    endsAt: string;
  },
): boolean {
  return Date.parse(a.startsAt) < Date.parse(b.endsAt) && Date.parse(b.startsAt) < Date.parse(a.endsAt);
}

export function evaluateBooking(input: {
  slot: Slot;
  existingBookings: readonly Booking[];
  now: number;
}): Result<Slot, BookingRejection> {
  const { slot, existingBookings, now } = input;
  if (isSlotExpired(slot, now)) return err('slot_expired');
  const active = existingBookings.filter(isActive);
  if (active.some(booking => booking.slotId === slot.id)) return err('duplicate_booking');
  if (slot.isBooked) return err('slot_taken');
  if (active.some(booking => overlaps(booking, slot))) return err('overlapping_booking');
  return ok(slot);
}

export function canCancel(booking: Booking, now: number, windowHours: number): boolean {
  if (!isActive(booking)) return false;
  return Date.parse(booking.startsAt) - now > windowHours * 3_600_000;
}

export function isUpcoming(booking: Booking, now: number): boolean {
  return isActive(booking) && Date.parse(booking.endsAt) > now;
}

export function sortBookings(bookings: readonly Booking[], now: number): Booking[] {
  return [...bookings].sort((a, b) => {
    const aUpcoming = isUpcoming(a, now);
    const bUpcoming = isUpcoming(b, now);
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    const delta = Date.parse(a.startsAt) - Date.parse(b.startsAt);
    return aUpcoming ? delta : -delta;
  });
}

export type SlotPeriod = 'morning' | 'afternoon' | 'evening';

function periodOf(slot: Pick<Slot, 'startsAt'>): SlotPeriod {
  const hour = new Date(slot.startsAt).getHours();
  if (hour < 12) return 'morning';
  if (hour < 16) return 'afternoon';
  return 'evening';
}

export function groupSlotsByPeriod(slots: readonly Slot[]): readonly {
  period: SlotPeriod;
  slots: readonly Slot[];
}[] {
  const buckets: Record<SlotPeriod, Slot[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const slot of slots) buckets[periodOf(slot)].push(slot);
  return (['morning', 'afternoon', 'evening'] as const)
    .filter(period => buckets[period].length > 0)
    .map(period => ({
      period,
      slots: buckets[period],
    }));
}
