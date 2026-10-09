import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface Venue {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueInput {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export async function getMyVenues() {
  const response = await api.get<ApiResponse<Venue[]>>(
    "/venues/mine",
  );

  return response.data.data;
}

export async function createVenue(data: CreateVenueInput) {
  const response = await api.post<ApiResponse<Venue>>(
    "/venues",
    data,
  );

  return response.data.data;
}

export async function deleteVenue(id: string) {
  await api.delete(`/venues/${id}`);
}