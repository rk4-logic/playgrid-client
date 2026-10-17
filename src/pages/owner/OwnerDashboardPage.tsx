
import { useEffect, useState } from "react";
import axios from "axios";
import {
  getOwnerDashboard,
  type OwnerDashboard,
  type OwnerDashboardBooking,
} from "@/lib/ownerApi";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(value: number) {
  return currency.format(value);
}

function BookingList({
  bookings,
  emptyMessage,
}: {
  bookings: OwnerDashboardBooking[];
  emptyMessage: string;
}) {
  if (bookings.length === 0) {
    return <p className="owner-dashboard-empty">{emptyMessage}</p>;
  }

  return (
    <div className="owner-dashboard-bookings">
      {bookings.map((booking) => (
        <article className="owner-dashboard-booking" key={booking.id}>
          <div>
            <h3>{booking.turf?.name ?? "Turf booking"}</h3>
            <p>
              {booking.turf?.venue?.name ?? "Venue not available"}
              {" · "}
              {booking.user?.fullName ?? "Player"}
            </p>
            <time dateTime={booking.startTime}>
              {formatDate(booking.startTime)}
            </time>
          </div>

          <div className="owner-dashboard-booking-meta">
            <strong>{formatAmount(booking.totalAmount)}</strong>
            <span
              className={`owner-dashboard-status ${booking.status.toLowerCase()}`}
            >
              {booking.status}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function OwnerDashboardPage() {
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getOwnerDashboard();

        if (isMounted) {
          setDashboard(data);
        }
      } catch (requestError) {
        if (!isMounted) return;

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          setError("Please log in to view your owner dashboard.");
        } else if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 403
        ) {
          setError("This dashboard is available to owners and admins only.");
        } else {
          setError("Unable to load the dashboard. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="owner-dashboard-page">
        <div className="listing-loading">
          <span />
          <p>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (error || !dashboard) {
    return (
      <section className="owner-dashboard-page">
        <div className="owner-dashboard-error" role="alert">
          {error || "Dashboard data is unavailable."}
        </div>
        <button
          type="button"
          className="owner-dashboard-retry"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </section>
    );
  }

  const { stats } = dashboard;

  const metrics = [
    { label: "Total venues", value: stats.totalVenues },
    { label: "Active venues", value: stats.activeVenues },
    { label: "Total turfs", value: stats.totalTurfs },
    { label: "Active turfs", value: stats.activeTurfs },
    { label: "All bookings", value: stats.totalBookings },
    { label: "Upcoming bookings", value: stats.upcomingBookings },
    { label: "Cancelled bookings", value: stats.cancelledBookings },
    {
      label: "Confirmed booking value",
      value: formatAmount(stats.confirmedBookingValue),
    },
  ];

  return (
    <main className="owner-dashboard-page">
      <section className="owner-dashboard-hero">
        <div>
          <p className="section-eyebrow">PLAYGRID MANAGEMENT</p>
          <h1>
            Your
            <br />
            <em>dashboard.</em>
          </h1>
          <p className="owner-dashboard-intro">
            Track your venues, courts, and bookings from one place.
          </p>
        </div>
      </section>

      <section className="owner-dashboard-metrics" aria-label="Business summary">
        {metrics.map((metric) => (
          <article className="owner-dashboard-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="owner-dashboard-section">
        <div className="owner-dashboard-section-heading">
          <div>
            <p className="section-eyebrow">WHAT'S NEXT</p>
            <h2>Upcoming bookings</h2>
          </div>
          <span>{dashboard.upcomingBookings.length} shown</span>
        </div>

        <BookingList
          bookings={dashboard.upcomingBookings}
          emptyMessage="No upcoming bookings at the moment."
        />
      </section>

      <section className="owner-dashboard-section">
        <div className="owner-dashboard-section-heading">
          <div>
            <p className="section-eyebrow">LATEST ACTIVITY</p>
            <h2>Recent bookings</h2>
          </div>
          <span>{dashboard.recentBookings.length} shown</span>
        </div>

        <BookingList
          bookings={dashboard.recentBookings}
          emptyMessage="Your recent bookings will appear here."
        />
      </section>

      <section className="owner-dashboard-section">
        <div className="owner-dashboard-section-heading">
          <div>
            <p className="section-eyebrow">YOUR LOCATIONS</p>
            <h2>Venues</h2>
          </div>
          <span>{dashboard.venues.length} shown</span>
        </div>

        {dashboard.venues.length === 0 ? (
          <p className="owner-dashboard-empty">
            No venues found. Create a venue to get started.
          </p>
        ) : (
          <div className="owner-dashboard-venues">
            {dashboard.venues.map((venue) => (
              <article className="owner-dashboard-venue" key={venue.id}>
                <div>
                  <h3>{venue.name}</h3>
                  <p>
                    {venue.city}, {venue.state}
                  </p>
                  <span>
                    {venue._count?.turfs ?? 0}{" "}
                    {(venue._count?.turfs ?? 0) === 1 ? "turf" : "turfs"}
                  </span>
                </div>

                <span
                  className={`owner-dashboard-status ${
                    venue.isActive ? "active" : "inactive"
                  }`}
                >
                  {venue.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default OwnerDashboardPage;
