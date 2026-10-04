import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import api from "@/lib/api";
import type { ApiResponse, Booking } from "@/types/api";

type BookingFilter = "UPCOMING" | "PAST" | "CANCELLED";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isUpcoming(booking: Booking) {
  return (
    booking.status !== "CANCELLED" &&
    new Date(booking.startTime) > new Date()
  );
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingFilter>("UPCOMING");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<ApiResponse<Booking[]>>(
          "/bookings/my",
        );

        setBookings(response.data.data);
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          setError("Please log in to view your bookings.");
        } else {
          setError("Unable to load your bookings.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (filter === "CANCELLED") {
        return booking.status === "CANCELLED";
      }

      if (filter === "UPCOMING") {
        return isUpcoming(booking);
      }

      return (
        booking.status !== "CANCELLED" &&
        !isUpcoming(booking)
      );
    });
  }, [bookings, filter]);

  const handleCancel = async (bookingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setError("");

      await api.patch(`/bookings/${bookingId}/cancel`);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking,
        ),
      );
    } catch {
      setError("Unable to cancel this booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="bookings-loading-page">
        <div className="listing-loading">
          <span />
          <p>Loading your bookings...</p>
        </div>
      </section>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <section className="empty-page">
        <p className="section-eyebrow">PLAYGRID</p>
        <h1>Your bookings are waiting.</h1>
        <p>{error}</p>

        <Link to="/turfs" className="primary-button">
          Find a turf
        </Link>
      </section>
    );
  }

  return (
    <div className="bookings-page">
      <section className="bookings-hero">
        <div>
          <p className="section-eyebrow">YOUR PLAYGRID</p>

          <h1>
            My
            <br />
            <em>bookings.</em>
          </h1>
        </div>

        <p>
          Keep track of your upcoming games, revisit previous bookings,
          and manage your reservations in one place.
        </p>
      </section>

      <section className="bookings-content">
        <div className="booking-tabs">
          <button
            type="button"
            className={filter === "UPCOMING" ? "active" : ""}
            onClick={() => setFilter("UPCOMING")}
          >
            Upcoming
          </button>

          <button
            type="button"
            className={filter === "PAST" ? "active" : ""}
            onClick={() => setFilter("PAST")}
          >
            Past
          </button>

          <button
            type="button"
            className={filter === "CANCELLED" ? "active" : ""}
            onClick={() => setFilter("CANCELLED")}
          >
            Cancelled
          </button>
        </div>

        {error && (
          <div className="booking-error-light">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="bookings-empty">
            <span>○</span>

            <p className="section-eyebrow">
              {filter === "UPCOMING"
                ? "NO UPCOMING GAMES"
                : filter === "PAST"
                  ? "NO PAST BOOKINGS"
                  : "NO CANCELLED BOOKINGS"}
            </p>

            <h2>
              {filter === "UPCOMING"
                ? "Nothing booked yet."
                : "Your history is empty."}
            </h2>

            <p>
              Find a turf and get your next game on the calendar.
            </p>

            <Link to="/turfs" className="hero-primary-button">
              Find a turf
              <span>↗</span>
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking, index) => {
              const turf = booking.turf;

              return (
                <article
                  className="booking-card"
                  key={booking.id}
                >
                  <div className="booking-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="booking-card-main">
                    <div className="booking-card-top">
                      <div>
                        <span className="booking-location">
                          {turf?.city}, {turf?.state}
                        </span>

                        <h2>
                          {turf?.name ?? "PlayGrid Turf"}
                        </h2>
                      </div>

                      <span
                        className={`booking-status ${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-card-details">
                      <div>
                        <span>Date</span>
                        <strong>
                          {formatDate(booking.bookingDate)}
                        </strong>
                      </div>

                      <div>
                        <span>Time</span>
                        <strong>
                          {formatTime(booking.startTime)} –{" "}
                          {formatTime(booking.endTime)}
                        </strong>
                      </div>

                      <div>
                        <span>Total</span>
                        <strong>₹{booking.totalAmount}</strong>
                      </div>

                      <div>
                        <span>Venue</span>
                        <strong>
                          {turf?.venue?.name ?? "PlayGrid Venue"}
                        </strong>
                      </div>
                    </div>

                    {booking.status !== "CANCELLED" &&
                      isUpcoming(booking) && (
                        <div className="booking-card-actions">
                          <Link
                            to={`/turfs/${booking.turfId}`}
                            className="booking-view-link"
                          >
                            View turf →
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              void handleCancel(booking.id)
                            }
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "Cancel booking"}
                          </button>
                        </div>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default MyBookingsPage;