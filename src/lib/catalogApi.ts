import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface Sport {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getSports() {
  const response = await api.get<ApiResponse<Sport[]>>("/sports");

  return response.data.data;
}

export async function createSport(name: string) {
  const response = await api.post<ApiResponse<Sport>>("/sports", {
    name,
  });

  return response.data.data;
}

export async function deleteSport(id: string) {
  await api.delete(`/sports/${id}`);
}

export async function getAmenities() {
  const response =
    await api.get<ApiResponse<Amenity[]>>("/amenities");

  return response.data.data;
}

export async function createAmenity(
  name: string,
  icon?: string,
) {
  const response = await api.post<ApiResponse<Amenity>>(
    "/amenities",
    {
      name,
      icon,
    },
  );

  return response.data.data;
}

export async function deleteAmenity(id: string) {
  await api.delete(`/amenities/${id}`);
}