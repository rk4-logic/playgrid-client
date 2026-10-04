export interface Turf {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  pricePerHour: number;
  isActive: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
}

export interface Booking {
  id: string;
  userId: string;
  turfId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  turf?: Turf & {
    venue?: Venue;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AvailabilityBooking {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED";
}

export interface TurfAvailability {
  turf: {
    id: string;
    name: string;
    pricePerHour: number;
  };
  date: string;
  bookings: AvailabilityBooking[];
}

export interface CreatedBooking {
  id: string;
  userId: string;
  turfId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  turf?: Turf & {
    venue?: Venue;
  };
}