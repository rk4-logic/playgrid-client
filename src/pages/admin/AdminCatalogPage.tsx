import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import {
  createAmenity,
  createSport,
  deleteAmenity,
  deleteSport,
  getAmenities,
  getSports,
  type Amenity,
  type Sport,
} from "@/lib/catalogApi";

type CatalogSection = "sports" | "amenities";

function AdminCatalogPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const [sportName, setSportName] = useState("");
  const [amenityName, setAmenityName] = useState("");

  const [activeForm, setActiveForm] =
    useState<CatalogSection | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [sportsData, amenitiesData] = await Promise.all([
          getSports(),
          getAmenities(),
        ]);

        setSports(sportsData);
        setAmenities(amenitiesData);
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          setError(
            "You need to be logged in to manage the catalog.",
          );
        } else {
          setError("Unable to load the catalog.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const handleCreateSport = async (event: FormEvent) => {
    event.preventDefault();

    const name = sportName.trim();

    if (!name) return;

    try {
      setIsSubmitting(true);
      setError("");

      const sport = await createSport(name);

      setSports((current) =>
        [...current, sport].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setSportName("");
      setActiveForm(null);
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 409
      ) {
        setError("This sport already exists.");
      } else if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        setError("You need to be logged in as an admin.");
      } else {
        setError("Unable to create the sport.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAmenity = async (event: FormEvent) => {
    event.preventDefault();

    const name = amenityName.trim();

    if (!name) return;

    try {
      setIsSubmitting(true);
      setError("");

      const amenity = await createAmenity(name);

      setAmenities((current) =>
        [...current, amenity].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setAmenityName("");
      setActiveForm(null);
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 409
      ) {
        setError("This amenity already exists.");
      } else if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        setError("You need to be logged in as an admin.");
      } else {
        setError("Unable to create the amenity.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSport = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this sport?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSport(id);

      setSports((current) =>
        current.filter((sport) => sport.id !== id),
      );
    } catch {
      setError(
        "Unable to delete this sport.",
      );
    }
  };

  const handleDeleteAmenity = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this amenity?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteAmenity(id);

      setAmenities((current) =>
        current.filter(
          (amenity) => amenity.id !== id,
        ),
      );
    } catch {
      setError(
        "Unable to delete this amenity.",
      );
    }
  };

  if (isLoading) {
    return (
      <section className="admin-loading-page">
        <div className="listing-loading">
          <span />
          <p>Loading catalog...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="admin-catalog-page">
      <section className="admin-catalog-hero">
        <div>
          <p className="section-eyebrow">
            PLAYGRID ADMIN
          </p>

          <h1>
            Manage the
            <br />
            <em>catalog.</em>
          </h1>
        </div>

        <p>
          Manage the sports and amenities that owners
          can assign to their venues and turfs.
        </p>
      </section>

      {error && (
        <div className="admin-catalog-error">
          {error}
        </div>
      )}

      <section className="admin-catalog-grid">
        <article className="admin-catalog-panel">
          <div className="admin-panel-header">
            <div>
              <span>01</span>
              <h2>Sports</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveForm(
                  activeForm === "sports"
                    ? null
                    : "sports",
                )
              }
            >
              {activeForm === "sports"
                ? "Close"
                : "+ Add sport"}
            </button>
          </div>

          {activeForm === "sports" && (
            <form
              className="admin-add-form"
              onSubmit={handleCreateSport}
            >
              <input
                type="text"
                value={sportName}
                onChange={(event) =>
                  setSportName(event.target.value)
                }
                placeholder="e.g. Football"
                maxLength={50}
                autoFocus
              />

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !sportName.trim()
                }
              >
                {isSubmitting
                  ? "Adding..."
                  : "Add sport"}
              </button>
            </form>
          )}

          <div className="admin-catalog-list">
            {sports.length === 0 ? (
              <div className="admin-empty-state">
                No sports added yet.
              </div>
            ) : (
              sports.map((sport, index) => (
                <div
                  className="admin-catalog-item"
                  key={sport.id}
                >
                  <div>
                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <strong>{sport.name}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDeleteSport(
                        sport.id,
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="admin-catalog-panel">
          <div className="admin-panel-header">
            <div>
              <span>02</span>
              <h2>Amenities</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveForm(
                  activeForm === "amenities"
                    ? null
                    : "amenities",
                )
              }
            >
              {activeForm === "amenities"
                ? "Close"
                : "+ Add amenity"}
            </button>
          </div>

          {activeForm === "amenities" && (
            <form
              className="admin-add-form"
              onSubmit={handleCreateAmenity}
            >
              <input
                type="text"
                value={amenityName}
                onChange={(event) =>
                  setAmenityName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Floodlights"
                maxLength={50}
                autoFocus
              />

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !amenityName.trim()
                }
              >
                {isSubmitting
                  ? "Adding..."
                  : "Add amenity"}
              </button>
            </form>
          )}

          <div className="admin-catalog-list">
            {amenities.length === 0 ? (
              <div className="admin-empty-state">
                No amenities added yet.
              </div>
            ) : (
              amenities.map((amenity, index) => (
                <div
                  className="admin-catalog-item"
                  key={amenity.id}
                >
                  <div>
                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <strong>{amenity.name}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDeleteAmenity(
                        amenity.id,
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

export default AdminCatalogPage;