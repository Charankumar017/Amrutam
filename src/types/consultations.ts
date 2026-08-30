export type ConsultationMode = 'online' | 'in_person';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  city: string;
  modes: ConsultationMode[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  languages: string[];
  bio: string;
  avatarSeed: number;
  nextAvailableAt: string | null;
}

export interface Slot {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  mode: ConsultationMode;
  isBooked: boolean;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending_sync' | 'failed';

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  slotId: string;
  startsAt: string;
  endsAt: string;
  mode: ConsultationMode;
  fee: number;
  status: BookingStatus;
  createdAt: string;
  clientRef?: string;
}

export type DoctorSort = 'relevance' | 'rating_desc' | 'fee_asc' | 'fee_desc' | 'experience_desc';

export interface DoctorFilters {
  readonly query: string;
  readonly specializations: readonly string[];
  readonly cities: readonly string[];
  readonly modes: readonly ConsultationMode[];
  readonly minRating: number | null;
  readonly maxFee: number | null;
  readonly sort: DoctorSort;
}

export const EMPTY_DOCTOR_FILTERS: DoctorFilters = {
  query: '',
  specializations: [],
  cities: [],
  modes: [],
  minRating: null,
  maxFee: null,
  sort: 'relevance',
};
