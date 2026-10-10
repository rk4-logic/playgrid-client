
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "@/lib/api";
import { getPublicTurfs } from "@/lib/turfApi";
import type { TurfRecord } from "@/lib/turfApi";
import type { ApiResponse } from "@/types/api";
import type { Sport } from "@/lib/catalogApi";

function TurfListPage() {
  const [turfs, setTurfs] = useState<TurfRecord[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadTurfs() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getPublicTurfs({ limit: 50 });

        if (!cancelled) {
          setTurfs(result.items);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load turfs. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTurfs();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadSports() {
      try {
        const response = await api.get<ApiResponse<Sport[]>>("/sports");

        if (!cancelled) {
          setSports(response.data.data);
        }
      } catch {
        // Keep turf browsing available even if the catalog fails.
        if (!cancelled) {
          setSports([]);
        }
      }
    }

    void loadSports();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTurfs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return turfs.filter((turf) => {
      const matchesSearch =
        !query ||
        turf.name.toLowerCase().includes(query) ||
        turf.city.toLowerCase().includes(query) ||
        turf.state.toLowerCase().includes(query) ||
        turf.address.toLowerCase().includes(query) ||
        turf.venue?.name?.toLowerCase().includes(query);

      const matchesSport =
        !selectedSportId ||
        turf.sports.some((sport) => sport.id === selectedSportId);

      return matchesSearch && matchesSport;
    });
  }, [turfs, search, selectedSportId]);

  if (isLoading) {
    return (
      <section className="listing-page">
        <div className="listing-loading">
          <span />
          <p>Finding places to play...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="empty-page">
        <p className="section-eyebrow">SOMETHING WENT WRONG</p>
        <h1>We couldn't load the turfs.</h1>
        <p>{error}</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => setRetryKey((key) => key + 1)}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <div className="listing-page">
      <section className="listing-hero">
        <div>
          <p className="section-eyebrow">EXPLORE PLAYGRID</p>
          <h1>
            Find your
            <br />
            <em>next game.</em>
          </h1>
        </div>

        <p className="listing-intro">
          Explore sports venues, compare hourly prices, and find a place for
          your next game.
        </p>
      </section>

      <section className="turf-discovery">
        <div className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search by turf, venue, address or city..."
            aria-label="Search turfs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="sport-filters" aria-label="Filter by sport">
          <button
            type="button"
            className={selectedSportId === "" ? "active" : ""}
            aria-pressed={selectedSportId === ""}
            onClick={() => setSelectedSportId("")}
          >
            All sports
          </button>

          {sports.map((sport) => (
            <button
              key={sport.id}
              type="button"
              className={selectedSportId === sport.id ? "active" : ""}
              aria-pressed={selectedSportId === sport.id}
              onClick={() => setSelectedSportId(sport.id)}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </section>

      <section className="listing-results">
        <div className="results-header">
          <div>
            <p className="section-eyebrow">EXPLORE VENUES</p>
            <h2>
              {filteredTurfs.length}{" "}
              {filteredTurfs.length === 1 ? "place" : "places"} to play
            </h2>
          </div>

          <span>
            {selectedSportId
              ? `Filtered by ${sports.find((sport) => sport.id === selectedSportId)?.name ?? "sport"}`
              : "Real venue listings"}
          </span>
        </div>

        {filteredTurfs.length === 0 ? (
          <div className="empty-state">
            <h2>No turfs found</h2>
            <p>
              Try another search or select a different sport.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setSelectedSportId("");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="premium-turf-grid">
            {filteredTurfs.map((turf, index) => (
              <article className="premium-turf-card" key={turf.id}>
                <Link
                  to={`/turfs/${turf.id}`}
                  className="turf-visual"
                  aria-label={`View ${turf.name} details`}
                >
                  <div className={`turf-placeholder turf-image-${index % 4}`}>
                    <span>{turf.name.charAt(0).toUpperCase()}</span>
                  </div>

                  <div className="turf-card-tag">VENUE</div>
                  <div className="turf-card-arrow" aria-hidden="true">
                    ↗
                  </div>
                </Link>

                <div className="premium-turf-content">
                  <div className="turf-card-location">
                    {turf.city}, {turf.state}
                  </div>

                  <div className="premium-turf-heading">
                    <h3>{turf.name}</h3>
                  </div>

                  <p>
                    {turf.description ||
                      turf.venue?.name ||
                      "View venue details and booking options."}
                  </p>

                  {turf.sports.length > 0 && (
                    <div className="turf-card-sports">
                      {turf.sports.map((sport) => (
                        <span key={sport.id}>{sport.name}</span>
                      ))}
                    </div>
                  )}

                  <div className="premium-turf-footer">
                    <div>
                      <strong>
                        ₹{Number(turf.pricePerHour).toLocaleString("en-IN")}
                      </strong>
                      <span>/ hour</span>
                    </div>

                    <Link to={`/turfs/${turf.id}`}>
                      View details →
                    </Link>
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

export default TurfListPage;