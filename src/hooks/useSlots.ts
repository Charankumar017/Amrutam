import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { groupSlotsByPeriod, isSlotExpired } from '@/utils/booking';
import type { Slot } from '@/types/consultations';

export function useSlots(doctorId: string, date: string) {
  const result = useApiQuery<{
    date: string;
    slots: Slot[];
  }>(
    {
      path: `/doctors/${doctorId}/slots`,
      query: {
        date,
      },
    },
    [doctorId, date],
  );
  const slots = useMemo(() => result.data?.slots ?? [], [result.data]);
  const groups = useMemo(() => groupSlotsByPeriod(slots), [slots]);
  const bookableCount = useMemo(() => {
    const now = Date.now();
    return slots.filter(slot => !slot.isBooked && !isSlotExpired(slot, now)).length;
  }, [slots]);
  return {
    ...result,
    groups,
    bookableCount,
  };
}
