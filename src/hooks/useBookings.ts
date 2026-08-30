import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { useNow } from '@/hooks/useNow';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  bookConsultation,
  cancelConsultation,
  loadBookings,
  selectAllBookings,
  type BookingOutcome,
} from '@/redux/bookingThunks';
import { selectBookingsError, selectBookingsLoading } from '@/redux/slices/bookingsSlice';
import { isUpcoming, sortBookings } from '@/utils/booking';
import { toApiError } from '@/services/errors';
import type { Booking, Doctor, Slot } from '@/types/consultations';

export function useBookings() {
  const dispatch = useAppDispatch();
  const merged = useAppSelector(selectAllBookings);
  const isLoading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);
  const now = useNow(60_000);
  useEffect(() => {
    void dispatch(loadBookings());
  }, [dispatch]);
  const refetch = useCallback(() => void dispatch(loadBookings()), [dispatch]);
  const all = useMemo(() => sortBookings(merged, now), [merged, now]);
  const upcoming = useMemo(() => all.filter(booking => isUpcoming(booking, now)), [all, now]);
  const past = useMemo(() => all.filter(booking => !isUpcoming(booking, now)), [all, now]);
  return {
    bookings: all,
    upcoming,
    past,
    isLoading,
    isError: error !== undefined,
    error,
    refetch,
  };
}

export function useBookConsultation() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { t } = useTranslation();
  const [isBooking, setIsBooking] = useState(false);
  const book = useCallback(
    async (doctor: Doctor, slot: Slot): Promise<BookingOutcome> => {
      setIsBooking(true);
      const outcome = await dispatch(bookConsultation(doctor, slot)).finally(() => setIsBooking(false));
      switch (outcome.kind) {
        case 'confirmed':
          toast.show({
            message: t('doctors.bookingConfirmed'),
            tone: 'success',
          });
          break;
        case 'queued':
          toast.show({
            message: t('doctors.bookingQueued'),
            tone: 'warning',
            durationMs: 4_500,
          });
          break;
        case 'rejected':
          toast.show({
            message:
              outcome.reason === 'slot_expired'
                ? t('doctors.slotExpired')
                : outcome.reason === 'overlapping_booking'
                ? t('doctors.overlap')
                : t('doctors.slotTaken'),
            tone: 'error',
          });
          break;
        case 'failed':
          toast.show({
            message: outcome.error.userMessage,
            tone: 'error',
          });
          break;
      }
      return outcome;
    },
    [dispatch, toast, t],
  );
  return {
    book,
    isBooking,
  };
}

export function useCancelBooking() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { t } = useTranslation();
  const cancel = useCallback(
    async (booking: Booking) => {
      try {
        await dispatch(cancelConsultation(booking));
        toast.show({
          message: t('doctors.cancelled'),
          tone: 'success',
        });
      } catch (error) {
        toast.show({
          message: toApiError(error).userMessage,
          tone: 'error',
        });
      }
    },
    [dispatch, toast, t],
  );
  return {
    cancel,
  };
}
