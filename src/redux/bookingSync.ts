import { registerSyncHandler } from '@/services/syncHandlers';
import { callApi } from '@/services/api';
import type { Booking } from '@/types/consultations';

export const BOOKING_SYNC_KIND = 'consultation.booking.create';

export const CANCEL_SYNC_KIND = 'consultation.booking.cancel';

registerSyncHandler(BOOKING_SYNC_KIND, async (booking: Booking, mutation, dispatch) => {
  await callApi<Booking>({
    path: '/bookings',
    method: 'POST',
    body: {
      doctorId: booking.doctorId,
      slotId: booking.slotId,
      clientRef: mutation.id,
    },
    idempotencyKey: mutation.id,
  });
  const { loadBookings } = await import('@/redux/bookingThunks');
  await dispatch(loadBookings());
});

registerSyncHandler(
  CANCEL_SYNC_KIND,
  async (
    payload: {
      bookingId: string;
    },
    _mutation,
    dispatch,
  ) => {
    await callApi<Booking>({
      path: `/bookings/${payload.bookingId}`,
      method: 'DELETE',
    });
    const { loadBookings } = await import('@/redux/bookingThunks');
    await dispatch(loadBookings());
  },
);
