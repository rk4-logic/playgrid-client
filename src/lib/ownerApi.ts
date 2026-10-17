
import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface OwnerDashboardStats {
  totalVenues: number;
  activeVenues: number;
  totalTurfs: number;
  activeTurfs: number;
  totalBookings: number;
  upcomingBookings: number;
  cancelledBookings: number;
  confirmedBookingValue: number;
}

export interface OwnerDashboardBooking {
  id: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  user?: {
    fullName: string;
  };
  turf?: {
    name: string;
    venue?: {
      name: string;
    };
  };
}

export interface OwnerDashboardVenue {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
  _count?: {
    turfs: number;
  };
}

export interface OwnerDashboard {
  stats: OwnerDashboardStats;
  upcomingBookings: OwnerDashboardBooking[];
  recentBookings: OwnerDashboardBooking[];
  venues: OwnerDashboardVenue[];
}

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  const response = await api.get<ApiResponse<OwnerDashboard>>(
    "/owner/dashboard",
  );

  return response.data.data;
}
