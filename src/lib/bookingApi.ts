
import api from "@/lib/api";
import type { ApiResponse, Booking } from "@/types/api";

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  price: number;
}

export interface AvailabilityResult {
  turf: {
    id: string;
    name: string;
    pricePerHour: number;
  };
  date: string;
  availableSlots: AvailableSlot[];
}

export async function getAvailability(
  turfId: string,
  date: string,
): Promise<AvailabilityResult> {
  const response = await api.get<ApiResponse<AvailabilityResult>>(
    "/bookings/availability",
    { params: { turfId, date } },
  );

  return response.data.data;
}

export async function createBooking(input: {
  turfId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}): Promise<Booking> {
  const response = await api.post<ApiResponse<Booking>>(
    "/bookings",
    input,
  );

  return response.data.data;
}