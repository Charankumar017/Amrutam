import { createSelector } from '@reduxjs/toolkit';
import { callApi } from '@/services/api';
import { toApiError, type ApiError } from '@/services/errors';
import { loadFailed, loadStarted, loaded, selectServerBookings } from '@/redux/slices/bookingsSlice';
import { dequeued, enqueued, selectPendingMutations } from '@/redux/slices/offlineSlice';
import { BOOKING_SYNC_KIND, CANCEL_SYNC_KIND } from '@/redux/bookingSync';
import { evaluateBooking, type BookingRejection } from '@/utils/booking';
import { clientId } from '@/utils/id';
import type { AppThunk } from '@/redux/store';
import type { Booking, Doctor, Slot } from '@/types/consultations';

export type BookingOutcome =
  | {
      kind: 'confirmed';
      booking: Booking;
    }
  | {
      kind: 'queued';
      booking: Booking;
    }
  | {
      kind: 'rejected';
      reason: BookingRejection;
    }
  | {
      kind: 'failed';
      error: ApiError;
    };

const selectPendingBookings = createSelector([selectPendingMutations], pending =>
  pending
    .filter(item => item.kind === BOOKING_SYNC_KIND)
    .map(item => ({
      ...(item.payload as Booking),
      status: item.status === 'failed' ? ('failed' as const) : ('pending_sync' as const),
    })),
);

export const selectAllBookings = createSelector(
  [selectServerBookings, selectPendingBookings],
  (confirmed, pending) => {
    const syncedRefs = new Set(confirmed.map(booking => booking.clientRef).filter(Boolean));
    return [...confirmed, ...pending.filter(booking => !syncedRefs.has(booking.clientRef))];
  },
);

export const loadBookings = (): AppThunk<Promise<void>> => async dispatch => {
  dispatch(loadStarted());
  try {
    const response = await callApi<{
      items: Booking[];
    }>({
      path: '/bookings',
    });
    dispatch(loaded(response.items));
  } catch (error) {
    dispatch(loadFailed(error));
  }
};

export const bookConsultation =
  (doctor: Doctor, slot: Slot): AppThunk<Promise<BookingOutcome>> =>
  async (dispatch, getState) => {
    const state = getState();
    const verdict = evaluateBooking({
      slot,
      existingBookings: selectAllBookings(state),
      now: Date.now(),
    });
    if (!verdict.ok)
      return {
        kind: 'rejected',
        reason: verdict.error,
      };
    const ref = clientId('bkgref');
    const optimistic: Booking = {
      id: `pending_${ref}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      slotId: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      mode: slot.mode,
      fee: doctor.consultationFee,
      status: 'pending_sync',
      createdAt: new Date().toISOString(),
      clientRef: ref,
    };
    if (!state.network.isOnline) {
      dispatch(enqueued(BOOKING_SYNC_KIND, optimistic, ref));
      return {
        kind: 'queued',
        booking: optimistic,
      };
    }
    try {
      const confirmed = await callApi<Booking>({
        path: '/bookings',
        method: 'POST',
        body: {
          doctorId: doctor.id,
          slotId: slot.id,
          clientRef: ref,
        },
        idempotencyKey: ref,
      });
      await dispatch(loadBookings());
      return {
        kind: 'confirmed',
        booking: confirmed,
      };
    } catch (error) {
      const failure = toApiError(error);
      if (failure.retryable) {
        dispatch(enqueued(BOOKING_SYNC_KIND, optimistic, ref));
        return {
          kind: 'queued',
          booking: optimistic,
        };
      }
      if (failure.code === 'conflict') {
        const reason = (
          failure.details as
            | {
                error?: string;
              }
            | undefined
        )?.error;
        return {
          kind: 'rejected',
          reason:
            reason === 'slot_expired'
              ? 'slot_expired'
              : reason === 'overlapping_booking'
              ? 'overlapping_booking'
              : 'slot_taken',
        };
      }
      return {
        kind: 'failed',
        error: failure,
      };
    }
  };

export const cancelConsultation =
  (booking: Booking): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (booking.clientRef && booking.status !== 'confirmed') {
      dispatch(dequeued(booking.clientRef));
      return;
    }
    if (!getState().network.isOnline) {
      dispatch(
        enqueued(
          CANCEL_SYNC_KIND,
          {
            bookingId: booking.id,
          },
          clientId('cancel'),
        ),
      );
      return;
    }
    try {
      await callApi<Booking>({
        path: `/bookings/${booking.id}`,
        method: 'DELETE',
      });
      await dispatch(loadBookings());
    } catch (error) {
      const failure = toApiError(error);
      if (failure.retryable) {
        dispatch(
          enqueued(
            CANCEL_SYNC_KIND,
            {
              bookingId: booking.id,
            },
            clientId('cancel'),
          ),
        );
        return;
      }
      throw failure;
    }
  };
