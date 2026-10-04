import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "@/lib/api";
import type { ApiResponse, Turf } from "@/types/api";

const sports = ["All", "Football", "Cricket", "Basketball", "Badminton"];

function TurfListPage() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [selectedSport, setSelectedSport] = useState("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await api.get<ApiResponse<Turf[]>>("/turfs");
        setTurfs(response.data.data);
      } catch {
        setError("Unable to load turfs.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTurfs();
  }, []);

  const filteredTurfs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return turfs.filter((turf) => {
      const matchesSearch =
        !query ||
        turf.name.toLowerCase().includes(query) ||
        turf.city.toLowerCase().includes(query) ||
        turf.state.toLowerCase().includes(query);

      // Sport filtering will become data-driven when the API exposes
      // turf sports in the response.
      const matchesSport = selectedSport === "All";

      return matchesSearch && matchesSport;
    });
  }, [turfs, search, selectedSport]);

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
        <h1>We couldn't find the turfs.</h1>
        <p>{error}</p>
        <Link to="/" className="primary-button">
          Go home
        </Link>
      </section>
    );
  }

  return (
    <div className="listing-page">
      {/* INTRO */}
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
          Browse sports venues, compare prices, and find a time that works for
          your team.
        </p>
      </section>

      {/* SEARCH */}
      <section className="turf-discovery">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by turf or city..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="sport-filters">
          {sports.map((sport) => (
            <button
              key={sport}
              type="button"
              className={selectedSport === sport ? "active" : ""}
              onClick={() => setSelectedSport(sport)}
            >
              {sport}
            </button>
          ))}
        </div>
      </section>

      {/* RESULTS */}
      <section className="listing-results">
        <div className="results-header">
          <div>
            <p className="section-eyebrow">AVAILABLE NOW</p>
            <h2>{filteredTurfs.length} places to play</h2>
          </div>

          <span>Sorted by availability</span>
        </div>

        {filteredTurfs.length === 0 ? (
          <div className="empty-state">
            <h2>No turfs found</h2>
            <p>
              Try a different city or search term.
            </p>
          </div>
        ) : (
          <div className="premium-turf-grid">
            {filteredTurfs.map((turf, index) => (
              <article className="premium-turf-card" key={turf.id}>
                <Link to={`/turfs/${turf.id}`} className="turf-visual">
                  <div className={`turf-placeholder turf-image-${index % 4}`}>
                    <span>{turf.name.charAt(0)}</span>
                  </div>

                  <div className="turf-card-tag">AVAILABLE</div>

                  <div className="turf-card-arrow">↗</div>
                </Link>

                <div className="premium-turf-content">
                  <div className="turf-card-location">
                    {turf.city}, {turf.state}
                  </div>

                  <div className="premium-turf-heading">
                    <h3>{turf.name}</h3>
                    <span>★ 4.8</span>
                  </div>

                  <p>
                    {turf.description ??
                      "A great space for your next game with your team."}
                  </p>

                  <div className="premium-turf-footer">
                    <div>
                      <strong>₹{turf.pricePerHour}</strong>
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