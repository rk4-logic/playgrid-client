
import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Venue } from "@/lib/venueApi";
import type { Sport, Amenity } from "@/lib/catalogApi";

export interface TurfRecord {
  id: string;
  ownerId: string;
  venueId: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  pricePerHour: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sports: Sport[];
  amenities: Amenity[];
  venue: Venue;
  _count?: {
    bookings: number;
  };
}

export interface CreateTurfInput {
  venueId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  pricePerHour: number;
  sports: string[];
  amenities: string[];
}

export type UpdateTurfInput = Partial<
  Omit<CreateTurfInput, "venueId">
>;

export async function getMyTurfs() {
  const response = await api.get<ApiResponse<TurfRecord[]>>(
    "/turfs/mine",
  );

  return response.data.data;
}

export async function createTurf(data: CreateTurfInput) {
  const response = await api.post<ApiResponse<TurfRecord>>(
    "/turfs",
    data,
  );

  return response.data.data;
}

export async function updateTurf(
  id: string,
  data: UpdateTurfInput,
) {
  const response = await api.patch<ApiResponse<TurfRecord>>(
    `/turfs/${id}`,
    data,
  );

  return response.data.data;
}

export async function deactivateTurf(id: string) {
  await api.delete(`/turfs/${id}`);
}