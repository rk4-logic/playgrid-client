
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "@/lib/api";
import type { TurfRecord } from "@/lib/turfApi";
import type {
  ApiResponse,
  CreatedBooking,
  TurfAvailability,
} from "@/types/api";


interface BookingSlot {
  startTime: Date;
  endTime: Date;
  label: string;
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDateLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function TurfDetailsPage() {
  const { turfId } = useParams();

  const [turf, setTurf] = useState<TurfRecord | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [availability, setAvailability] =
    useState<TurfAvailability | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] =
    useState<CreatedBooking | null>(null);

  /*
   * Load turf details.
   */
  useEffect(() => {
    if (!turfId) return;

    const fetchTurf = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get<ApiResponse<TurfRecord>>(`/turfs/${turfId}`);

        setTurf(response.data.data);
      } catch {
        setError("Unable to load this turf.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTurf();
  }, [turfId]);

  /*
   * Load availability whenever the selected date changes.
   */
  useEffect(() => {
    if (!turfId) return;

    const fetchAvailability = async () => {
      try {
        setIsLoadingAvailability(true);
        setAvailabilityError("");
        setSelectedSlot(null);

        const response = await api.get<ApiResponse<TurfAvailability>>(
          "/bookings/availability",
          {
            params: {
              turfId,
              date: formatDateForApi(selectedDate),
            },
          },
        );

        setAvailability(response.data.data);
      } catch {
        setAvailabilityError("Unable to load availability.");
        setAvailability(null);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    void fetchAvailability();
  }, [turfId, selectedDate]);

  /*
   * Generate one-hour slots.
   *
   * This is temporary until venue operating hours become
   * owner-managed backend data.
   */

  const slots = useMemo<BookingSlot[]>(() => {
    if (!availability) return [];

    return availability.availableSlots.map((slot) => {
      const startTime = new Date(slot.startTime);
      const endTime = new Date(slot.endTime);

      return {
        startTime,
        endTime,
        label: `${formatTime(startTime)} – ${formatTime(endTime)}`,
      };
    });
  }, [availability]);


  const isSlotBooked = (slot: BookingSlot) => {
    if (!availability) return true;

    return !availability.availableSlots.some(
      (availableSlot) =>
        new Date(availableSlot.startTime).getTime() ===
        slot.startTime.getTime() &&
        new Date(availableSlot.endTime).getTime() ===
        slot.endTime.getTime(),
    );
  };


  const totalAmount = selectedSlot && availability
    ? availability.availableSlots.find(
      (slot) =>
        new Date(slot.startTime).getTime() ===
        selectedSlot.startTime.getTime(),
    )?.price ?? 0
    : 0;

  const handleBooking = async () => {
    if (!turfId || !selectedSlot) return;

    try {
      setIsBooking(true);
      setError("");

      const response = await api.post<ApiResponse<CreatedBooking>>(
        "/bookings",
        {
          turfId,
          bookingDate: formatDateForApi(selectedDate),
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString(),
        },
      );

      setBookingSuccess(response.data.data);
      setSelectedSlot(null);
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        setError("Please log in to confirm your booking.");
        return;
      }

      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 409
      ) {
        setError(
          "This slot was just booked by someone else. Please choose another slot.",
        );

        return;
      }

      setError("Unable to create your booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <section className="details-loading">
        <div className="listing-loading">
          <span />
          <p>Loading turf...</p>
        </div>
      </section>
    );
  }

  if (error && !turf) {
    return (
      <section className="empty-page">
        <p className="section-eyebrow">PLAYGRID</p>
        <h1>Turf not found</h1>
        <p>{error}</p>

        <Link to="/turfs" className="primary-button">
          Browse turfs
        </Link>
      </section>
    );
  }

  if (!turf) {
    return null;
  }

  if (bookingSuccess) {
    return (
      <section className="booking-success-page">
        <div className="booking-success-card">
          <span className="booking-success-icon">✓</span>

          <p className="section-eyebrow">BOOKING CONFIRMED</p>

          <h1>Your game is officially on.</h1>

          <p>
            Your booking for <strong>{turf.name}</strong> has been
            confirmed.
          </p>

          <div className="booking-summary">
            <div>
              <span>Date</span>
              <strong>
                {new Date(
                  bookingSuccess.bookingDate,
                ).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>

            <div>
              <span>Time</span>
              <strong>
                {formatTime(new Date(bookingSuccess.startTime))} –{" "}
                {formatTime(new Date(bookingSuccess.endTime))}
              </strong>
            </div>

            <div>
              <span>Total</span>
              <strong>₹{bookingSuccess.totalAmount}</strong>
            </div>
          </div>

          <div className="booking-success-actions">
            <Link to="/bookings" className="hero-primary-button">
              View my bookings
              <span>↗</span>
            </Link>

            <Link to="/turfs" className="secondary-button">
              Find another turf
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="details-page-new">
      <section className="details-top">
        <Link to="/turfs" className="back-link">
          ← Back to turfs
        </Link>

        <div className="details-layout">
          <div className="details-visual-new">
            <div className="details-visual-letter">
              {turf.name.charAt(0)}
            </div>

            <div className="details-visual-overlay" />

            <div className="details-visual-label">
              <span>PLAYGRID VENUE</span>
              <strong>{turf.city}</strong>
            </div>
          </div>

          <div className="details-info">
            <p className="section-eyebrow">
              {turf.city}, {turf.state}
            </p>

            <h1>{turf.name}</h1>

            <p className="details-description-new">
              {turf.description ??
                "A great space for your next game with your team."}
            </p>

            <div className="details-price">
              <strong>₹{turf.pricePerHour}</strong>
              <span>/ hour</span>
            </div>

            <div className="details-address">
              <span>LOCATION</span>
              <p>
                {turf.address}
                <br />
                {turf.city}, {turf.state} — {turf.pincode}
              </p>
            </div>
          </div>
        </div>
      </section>


      <div className="turf-detail-facts">
        <div>
          <span>Venue</span>
          <strong>{turf.venue?.name ?? "Sports venue"}</strong>
        </div>

        <div>
          <span>Location</span>
          <strong>
            {turf.address}, {turf.city}, {turf.state} {turf.pincode}
          </strong>
        </div>

        <div>
          <span>Hourly rate</span>
          <strong>
            ₹{Number(turf.pricePerHour).toLocaleString("en-IN")} / hour
          </strong>
        </div>
      </div>

      {turf.sports.length > 0 && (
        <section className="turf-detail-section">
          <h2>Sports you can play</h2>
          <div className="turf-detail-tags">
            {turf.sports.map((sport) => (
              <span key={sport.id}>{sport.name}</span>
            ))}
          </div>
        </section>
      )}

      {turf.amenities.length > 0 && (
        <section className="turf-detail-section">
          <h2>Venue amenities</h2>
          <div className="turf-detail-tags">
            {turf.amenities.map((amenity) => (
              <span key={amenity.id}>{amenity.name}</span>
            ))}
          </div>
        </section>
      )}

      <section className="booking-section">
        <div className="booking-heading">
          <div>
            <p className="section-eyebrow">BOOK YOUR SLOT</p>
            <h2>Choose when you play.</h2>
          </div>

          <span>
            {turf.isActive ? "Available for booking" : "Currently unavailable"}
          </span>
        </div>

        {!turf.isActive ? (
          <div className="booking-unavailable">
            This turf is currently unavailable for booking.
          </div>
        ) : (
          <div className="booking-interface">
            <div className="date-picker">
              <div className="date-picker-heading">
                <span>Select a date</span>
                <strong>Next 7 days</strong>
              </div>

              <div className="date-options">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = new Date();
                  date.setHours(0, 0, 0, 0);
                  date.setDate(date.getDate() + index);

                  const isSelected =
                    formatDateForApi(date) ===
                    formatDateForApi(selectedDate);

                  return (
                    <button
                      key={formatDateForApi(date)}
                      type="button"
                      className={isSelected ? "selected" : ""}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span>
                        {date.toLocaleDateString("en-IN", {
                          weekday: "short",
                        })}
                      </span>

                      <strong>{date.getDate()}</strong>

                      <small>
                        {date.toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="slot-section">
              <div className="slot-section-heading">
                <div>
                  <span>AVAILABLE TIMES</span>
                  <h3>{getDateLabel(selectedDate)}</h3>
                </div>

                <span>1 hour slots</span>
              </div>

              {isLoadingAvailability ? (
                <div className="slots-loading">
                  <span />
                  <p>Checking available slots...</p>
                </div>
              ) : availabilityError ? (
                <div className="slot-error">
                  {availabilityError}
                </div>
              ) : (
                <div className="slot-grid">
                  {slots.map((slot) => {
                    const booked = isSlotBooked(slot);
                    const selected =
                      selectedSlot?.startTime.getTime() ===
                      slot.startTime.getTime();

                    return (
                      <button
                        key={slot.startTime.toISOString()}
                        type="button"
                        disabled={booked}
                        className={`slot-button ${booked ? "booked" : ""
                          } ${selected ? "selected" : ""}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <span>{slot.label}</span>
                        {booked ? (
                          <small>Booked</small>
                        ) : selected ? (
                          <small>Selected</small>
                        ) : (
                          <small>Available</small>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="booking-error">
                {error}
              </div>
            )}

            <div className="booking-checkout">
              <div>
                <span>YOUR SELECTION</span>

                {selectedSlot ? (
                  <strong>
                    {getDateLabel(selectedDate)} ·{" "}
                    {selectedSlot.label}
                  </strong>
                ) : (
                  <strong>Select a time slot</strong>
                )}
              </div>

              <div className="booking-total">
                <span>TOTAL</span>
                <strong>
                  {selectedSlot ? `₹${totalAmount}` : "—"}
                </strong>
              </div>

              <button
                type="button"
                className="hero-primary-button booking-button"
                disabled={!selectedSlot || isBooking}
                onClick={() => void handleBooking()}
              >
                {isBooking ? "Confirming..." : "Confirm booking"}
                {!isBooking && <span>↗</span>}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default TurfDetailsPage;