import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import {
  createVenue,
  deleteVenue,
  getMyVenues,
  type CreateVenueInput,
  type Venue,
} from "@/lib/venueApi";

const initialForm: CreateVenueInput = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);

  const [form, setForm] =
    useState<CreateVenueInput>(initialForm);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadVenues = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getMyVenues();

        setVenues(data);
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          setError(
            "You need to be logged in to manage venues.",
          );
        } else if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 403
        ) {
          setError(
            "Only an owner or admin can manage venues.",
          );
        } else {
          setError("Unable to load your venues.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadVenues();
  }, []);

  const updateField = (
    field: keyof CreateVenueInput,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateVenue = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const venue = await createVenue({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      setVenues((current) => [venue, ...current]);

      setForm(initialForm);
      setIsFormOpen(false);
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 400
      ) {
        setError(
          requestError.response.data?.message ??
            "Please check the venue details.",
        );
      } else if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        setError(
          "You need to be logged in to create a venue.",
        );
      } else if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 403
      ) {
        setError(
          "Only an owner or admin can create a venue.",
        );
      } else {
        setError("Unable to create the venue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVenue = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this venue? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteVenue(id);

      setVenues((current) =>
        current.filter((venue) => venue.id !== id),
      );
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 409
      ) {
        setError(
          "This venue cannot be deleted because it still has turfs.",
        );
      } else {
        setError("Unable to delete the venue.");
      }
    }
  };

  if (isLoading) {
    return (
      <section className="admin-loading-page">
        <div className="listing-loading">
          <span />
          <p>Loading venues...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="admin-venues-page">
      <section className="admin-venues-hero">
        <div>
          <p className="section-eyebrow">
            PLAYGRID MANAGEMENT
          </p>

          <h1>
            Your
            <br />
            <em>venues.</em>
          </h1>
        </div>

        <div className="admin-venues-hero-copy">
          <p>
            Create the physical locations where your
            turfs operate. Each venue can contain
            multiple courts and turfs.
          </p>

          <button
            type="button"
            className="hero-primary-button"
            onClick={() => {
              setError("");
              setIsFormOpen(true);
            }}
          >
            Add a venue
            <span>+</span>
          </button>
        </div>
      </section>

      {error && (
        <div className="admin-catalog-error">
          {error}
        </div>
      )}

      {isFormOpen && (
        <section className="venue-form-section">
          <div className="venue-form-header">
            <div>
              <p className="section-eyebrow">
                NEW LOCATION
              </p>

              <h2>Create a venue</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setForm(initialForm);
              }}
            >
              Close
            </button>
          </div>

          <form
            className="venue-form"
            onSubmit={handleCreateVenue}
          >
            <div className="venue-form-grid">
              <label>
                <span>Venue name</span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. PlayGrid Sports Arena"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                <span>City</span>

                <input
                  type="text"
                  value={form.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Vadodara"
                  required
                />
              </label>

              <label className="venue-form-full">
                <span>Description</span>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Describe the venue..."
                  rows={4}
                  maxLength={500}
                />
              </label>

              <label className="venue-form-full">
                <span>Address</span>

                <input
                  type="text"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value,
                    )
                  }
                  placeholder="Full venue address"
                  required
                />
              </label>

              <label>
                <span>State</span>

                <input
                  type="text"
                  value={form.state}
                  onChange={(event) =>
                    updateField(
                      "state",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Gujarat"
                  required
                />
              </label>

              <label>
                <span>Pincode</span>

                <input
                  type="text"
                  value={form.pincode}
                  onChange={(event) =>
                    updateField(
                      "pincode",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. 390001"
                  required
                  maxLength={10}
                />
              </label>
            </div>

            <div className="venue-form-actions">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setForm(initialForm);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating..."
                  : "Create venue"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="venues-section">
        <div className="venues-section-header">
          <div>
            <p className="section-eyebrow">
              LOCATIONS
            </p>

            <h2>
              {venues.length}{" "}
              {venues.length === 1
                ? "venue"
                : "venues"}
            </h2>
          </div>
        </div>

        {venues.length === 0 ? (
          <div className="venues-empty">
            <span>01</span>

            <h3>No venues yet.</h3>

            <p>
              Create your first venue before adding
              turfs.
            </p>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
            >
              Create your first venue →
            </button>
          </div>
        ) : (
          <div className="venues-list">
            {venues.map((venue, index) => (
              <article
                className="venue-card"
                key={venue.id}
              >
                <div className="venue-card-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="venue-card-main">
                  <div className="venue-card-heading">
                    <div>
                      <span>
                        {venue.city},{" "}
                        {venue.state}
                      </span>

                      <h3>{venue.name}</h3>
                    </div>

                    <span
                      className={`venue-status ${
                        venue.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {venue.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>
                  </div>

                  {venue.description && (
                    <p className="venue-card-description">
                      {venue.description}
                    </p>
                  )}

                  <div className="venue-card-details">
                    <div>
                      <span>Address</span>
                      <strong>
                        {venue.address}
                      </strong>
                    </div>

                    <div>
                      <span>Pincode</span>
                      <strong>
                        {venue.pincode}
                      </strong>
                    </div>
                  </div>

                  <div className="venue-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        void handleDeleteVenue(
                          venue.id,
                        )
                      }
                    >
                      Delete venue
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminVenuesPage;