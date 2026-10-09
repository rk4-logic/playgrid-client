
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import {
  createTurf,
  deactivateTurf,
  getMyTurfs,
  updateTurf,
  type CreateTurfInput,
  type TurfRecord,
  type UpdateTurfInput,
} from "@/lib/turfApi";
import { getMyVenues, type Venue } from "@/lib/venueApi";
import {
  getAmenities,
  getSports,
  type Amenity,
  type Sport,
} from "@/lib/catalogApi";

interface TurfFormState {
  venueId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  pricePerHour: string;
  sports: string[];
  amenities: string[];
}

const emptyForm: TurfFormState = {
  venueId: "",
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  pricePerHour: "",
  sports: [],
  amenities: [],
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 401) {
      return "Please log in before managing turfs.";
    }

    if (status === 403) {
      return "Your account does not have permission to manage these turfs.";
    }

    if (status === 400 && typeof serverMessage === "string") {
      return serverMessage;
    }

    if (status === 404) {
      return "The requested turf or venue could not be found.";
    }

    if (typeof serverMessage === "string") {
      return serverMessage;
    }
  }

  return fallback;
}

function AdminTurfsPage() {
  const [turfs, setTurfs] = useState<TurfRecord[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const [form, setForm] = useState<TurfFormState>(emptyForm);
  const [editingTurf, setEditingTurf] = useState<TurfRecord | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTurfId, setBusyTurfId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [turfData, venueData, sportData, amenityData] =
        await Promise.all([
          getMyTurfs(),
          getMyVenues(),
          getSports(),
          getAmenities(),
        ]);

      setTurfs(turfData);
      setVenues(venueData);
      setSports(sportData);
      setAmenities(amenityData);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to load turf management data."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateField = <K extends keyof TurfFormState>(
    field: K,
    value: TurfFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateForm = () => {
    setEditingTurf(null);
    setForm({
      ...emptyForm,
      venueId: venues.find((venue) => venue.isActive)?.id ?? "",
    });
    setError("");
    setNotice("");
    setIsFormOpen(true);
  };

  const openEditForm = (turf: TurfRecord) => {
    setEditingTurf(turf);
    setForm({
      venueId: turf.venueId,
      name: turf.name,
      description: turf.description ?? "",
      address: turf.address,
      city: turf.city,
      state: turf.state,
      pincode: turf.pincode,
      latitude: turf.latitude?.toString() ?? "",
      longitude: turf.longitude?.toString() ?? "",
      pricePerHour: turf.pricePerHour.toString(),
      sports: turf.sports.map((sport) => sport.id),
      amenities: turf.amenities.map((amenity) => amenity.id),
    });
    setError("");
    setNotice("");
    setIsFormOpen(true);
  };

  const toggleSelection = (
    field: "sports" | "amenities",
    id: string,
    checked: boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: checked
        ? [...current[field], id]
        : current[field].filter((selectedId) => selectedId !== id),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (form.sports.length === 0) {
      setError("Select at least one sport for this turf.");
      return;
    }

    const pricePerHour = Number(form.pricePerHour);
    const latitude = form.latitude.trim() ? Number(form.latitude) : undefined;
    const longitude = form.longitude.trim() ? Number(form.longitude) : undefined;

    if (!Number.isFinite(pricePerHour) || pricePerHour <= 0) {
      setError("Enter a valid hourly price greater than zero.");
      return;
    }

    if (latitude !== undefined && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (longitude !== undefined && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    if (!editingTurf && !form.venueId) {
      setError("Create an active venue before adding a turf.");
      return;
    }

    const commonFields = {
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      pricePerHour,
      sports: form.sports,
      amenities: form.amenities,
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
    };

    try {
      setIsSubmitting(true);

      if (editingTurf) {
        const payload: UpdateTurfInput = commonFields;
        const updated = await updateTurf(editingTurf.id, payload);

        setTurfs((current) =>
          current.map((turf) => (turf.id === updated.id ? updated : turf)),
        );
        setNotice("Turf updated successfully.");
      } else {
        const payload: CreateTurfInput = {
          ...commonFields,
          venueId: form.venueId,
        };
        const created = await createTurf(payload);

        setTurfs((current) => [created, ...current]);
        setNotice("Turf created successfully.");
      }

      setForm(emptyForm);
      setEditingTurf(null);
      setIsFormOpen(false);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          editingTurf ? "Unable to update this turf." : "Unable to create this turf.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (turf: TurfRecord) => {
    const confirmed = window.confirm(
      `Deactivate "${turf.name}"? It will no longer appear in public listings. Booking history will be preserved.`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setBusyTurfId(turf.id);

    try {
      await deactivateTurf(turf.id);

      setTurfs((current) =>
        current.map((item) =>
          item.id === turf.id ? { ...item, isActive: false } : item,
        ),
      );

      setNotice(`${turf.name} was deactivated.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to deactivate this turf."));
    } finally {
      setBusyTurfId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="admin-loading-page">
        <div className="listing-loading">
          <span />
          <p>Loading turfs...</p>
        </div>
      </section>
    );
  }

  const activeVenues = venues.filter((venue) => venue.isActive);

  return (
    <main className="admin-turfs-page">
      <section className="admin-turfs-hero">
        <div>
          <p className="section-eyebrow">PLAYGRID MANAGEMENT</p>
          <h1>
            Your
            <br />
            <em>turfs.</em>
          </h1>
        </div>

        <div className="admin-turfs-hero-copy">
          <p>
            Manage your courts, prices, sports and facilities from one place.
            Changes are saved to the PlayGrid database.
          </p>

          <button
            type="button"
            className="hero-primary-button"
            onClick={openCreateForm}
            disabled={activeVenues.length === 0}
          >
            Add a turf <span>+</span>
          </button>

          {activeVenues.length === 0 && (
            <small>Create an active venue before adding a turf.</small>
          )}
        </div>
      </section>

      {error && <div className="admin-catalog-error" role="alert">{error}</div>}
      {notice && <div className="admin-turf-notice" role="status">{notice}</div>}

      {isFormOpen && (
        <section className="turf-form-section">
          <div className="turf-form-header">
            <div>
              <p className="section-eyebrow">
                {editingTurf ? "UPDATE TURF" : "NEW TURF"}
              </p>
              <h2>{editingTurf ? "Edit turf details" : "Create a turf"}</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingTurf(null);
                setForm(emptyForm);
                setError("");
              }}
            >
              Close
            </button>
          </div>

          <form className="turf-form" onSubmit={handleSubmit}>
            {!editingTurf && (
              <label className="turf-form-full">
                <span>Venue</span>
                <select
                  value={form.venueId}
                  onChange={(event) => {
                    const venue = venues.find((item) => item.id === event.target.value);
                    setForm((current) => ({
                      ...current,
                      venueId: event.target.value,
                      ...(venue
                        ? {
                            address: venue.address,
                            city: venue.city,
                            state: venue.state,
                            pincode: venue.pincode,
                            latitude: venue.latitude?.toString() ?? "",
                            longitude: venue.longitude?.toString() ?? "",
                          }
                        : {}),
                    }));
                  }}
                  required
                >
                  <option value="">Select a venue</option>
                  {activeVenues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} — {venue.city}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {editingTurf && (
              <p className="turf-form-full turf-current-venue">
                Venue: <strong>{editingTurf.venue.name}</strong>. Venue reassignment
                is not supported by the current backend update API.
              </p>
            )}

            <div className="turf-form-grid">
              <label>
                <span>Turf name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Football Court 1"
                  minLength={3}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                <span>Price per hour (₹)</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.pricePerHour}
                  onChange={(event) => updateField("pricePerHour", event.target.value)}
                  placeholder="e.g. 1200"
                  required
                />
              </label>

              <label className="turf-form-full">
                <span>Description</span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe the court and its facilities"
                />
              </label>

              <label className="turf-form-full">
                <span>Address</span>
                <input
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  minLength={5}
                  maxLength={300}
                  required
                />
              </label>

              <label>
                <span>City</span>
                <input
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  minLength={2}
                  required
                />
              </label>

              <label>
                <span>State</span>
                <input
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  minLength={2}
                  required
                />
              </label>

              <label>
                <span>Pincode</span>
                <input
                  value={form.pincode}
                  onChange={(event) => updateField("pincode", event.target.value)}
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </label>

              <label>
                <span>Latitude (optional)</span>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={form.latitude}
                  onChange={(event) => updateField("latitude", event.target.value)}
                />
              </label>

              <label>
                <span>Longitude (optional)</span>
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={form.longitude}
                  onChange={(event) => updateField("longitude", event.target.value)}
                />
              </label>
            </div>

            <fieldset className="turf-selection-group">
              <legend>Sports <span>(select at least one)</span></legend>
              {sports.length === 0 ? (
                <p>No sports available. Add sports in Admin Catalog first.</p>
              ) : (
                <div className="turf-checkbox-grid">
                  {sports.map((sport) => (
                    <label key={sport.id} className="turf-checkbox">
                      <input
                        type="checkbox"
                        checked={form.sports.includes(sport.id)}
                        onChange={(event) =>
                          toggleSelection("sports", sport.id, event.target.checked)
                        }
                      />
                      <span>{sport.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="turf-selection-group">
              <legend>Amenities <span>(optional)</span></legend>
              {amenities.length === 0 ? (
                <p>No amenities available yet.</p>
              ) : (
                <div className="turf-checkbox-grid">
                  {amenities.map((amenity) => (
                    <label key={amenity.id} className="turf-checkbox">
                      <input
                        type="checkbox"
                        checked={form.amenities.includes(amenity.id)}
                        onChange={(event) =>
                          toggleSelection("amenities", amenity.id, event.target.checked)
                        }
                      />
                      <span>{amenity.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="turf-form-actions">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingTurf(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>

              <button type="submit" disabled={isSubmitting || sports.length === 0}>
                {isSubmitting
                  ? "Saving..."
                  : editingTurf
                    ? "Save changes"
                    : "Create turf"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-turfs-list-section">
        <div className="admin-turfs-list-header">
          <div>
            <p className="section-eyebrow">YOUR INVENTORY</p>
            <h2>{turfs.length} {turfs.length === 1 ? "turf" : "turfs"}</h2>
          </div>
          <button type="button" onClick={() => void loadData()}>
            Refresh
          </button>
        </div>

        {turfs.length === 0 ? (
          <div className="admin-turfs-empty">
            <span>01</span>
            <h3>No turfs yet.</h3>
            <p>Create your first turf and assign its sports and amenities.</p>
            {activeVenues.length > 0 && (
              <button type="button" onClick={openCreateForm}>
                Create your first turf →
              </button>
            )}
          </div>
        ) : (
          <div className="admin-turfs-list">
            {turfs.map((turf, index) => (
              <article className="admin-turf-card" key={turf.id}>
                <div className="admin-turf-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="admin-turf-main">
                  <div className="admin-turf-heading">
                    <div>
                      <span>{turf.venue.name} · {turf.city}</span>
                      <h3>{turf.name}</h3>
                    </div>
                    <span className={`venue-status ${turf.isActive ? "active" : "inactive"}`}>
                      {turf.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {turf.description && <p>{turf.description}</p>}

                  <div className="admin-turf-meta">
                    <div>
                      <span>Hourly rate</span>
                      <strong>₹{turf.pricePerHour.toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                      <span>Bookings</span>
                      <strong>{turf._count?.bookings ?? 0}</strong>
                    </div>
                  </div>

                  <div className="admin-turf-tags">
                    {turf.sports.map((sport) => (
                      <span key={sport.id}>{sport.name}</span>
                    ))}
                    {turf.amenities.map((amenity) => (
                      <span key={amenity.id} className="amenity-tag">
                        {amenity.name}
                      </span>
                    ))}
                  </div>

                  <div className="admin-turf-actions">
                    {turf.isActive && (
                      <>
                        <button type="button" onClick={() => openEditForm(turf)}>
                          Edit turf
                        </button>
                        <button
                          type="button"
                          className="danger-action"
                          disabled={busyTurfId === turf.id}
                          onClick={() => void handleDeactivate(turf)}
                        >
                          {busyTurfId === turf.id ? "Deactivating..." : "Deactivate"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminTurfsPage;