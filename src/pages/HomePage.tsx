import { Link } from "react-router-dom";

const sports = [
  {
    name: "Football",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Cricket",
    image:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Basketball",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Badminton",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=85",
  },
];

function HomePage() {
  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay" />

        <div className="hero-content-new">
          <div className="hero-copy">
            <p className="hero-eyebrow">PLAYGRID / FIND YOUR GAME</p>

            <h1>
              Your game
              <br />
              <span>starts here.</span>
            </h1>

            <p className="hero-subtitle">
              Discover great sports venues around you. Pick a time, grab your
              team, and get on the field.
            </p>

            <div className="hero-actions">
              <Link to="/turfs" className="hero-primary-button">
                Find a turf
                <span>↗</span>
              </Link>

              <a href="#sports" className="hero-secondary-button">
                Explore sports
              </a>
            </div>
          </div>

          <div className="hero-floating-card">
            <span className="live-dot" />
            <div>
              <strong>Ready to play?</strong>
              <p>Find available turfs near you.</p>
            </div>
            <Link to="/turfs">→</Link>
          </div>
        </div>

        <div className="hero-bottom">
          <span>01 — DISCOVER</span>
          <span>02 — BOOK</span>
          <span>03 — PLAY</span>
        </div>
      </section>

      {/* INTRO */}
      <section className="intro-section">
        <div className="intro-label">
          <span>01</span>
          <span>THE PLAYGRID EXPERIENCE</span>
        </div>

        <div className="intro-content">
          <h2>
            Less searching.
            <br />
            <em>More playing.</em>
          </h2>

          <p>
            PlayGrid makes it simple to find the right place for your next
            game. Browse venues, check live availability, and book your slot
            in a few clicks.
          </p>
        </div>
      </section>

      {/* SPORTS */}
      <section className="sports-section" id="sports">
        <div className="section-topline">
          <div>
            <p className="section-eyebrow">FIND YOUR SPORT</p>
            <h2>What are you playing?</h2>
          </div>

          <Link to="/turfs" className="text-link">
            View all turfs →
          </Link>
        </div>

        <div className="sports-grid">
          {sports.map((sport, index) => (
            <Link to="/turfs" className="sport-card" key={sport.name}>
              <img src={sport.image} alt={sport.name} />

              <div className="sport-card-overlay" />

              <div className="sport-number">0{index + 1}</div>

              <div className="sport-card-content">
                <h3>{sport.name}</h3>
                <span>Explore venues →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="intro-label">
          <span>02</span>
          <span>HOW IT WORKS</span>
        </div>

        <div className="how-heading">
          <h2>
            From idea
            <br />
            <em>to game day.</em>
          </h2>
        </div>

        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Find</h3>
            <p>
              Browse sports venues and find a turf that fits your game, place,
              and budget.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>Choose</h3>
            <p>
              Pick your date and check available time slots before making your
              decision.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>Book</h3>
            <p>
              Select your slot and confirm your booking. Your game is officially
              on.
            </p>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div>
          <p className="section-eyebrow">READY WHEN YOU ARE</p>

          <h2>
            Stop planning.
            <br />
            <em>Start playing.</em>
          </h2>

          <Link to="/turfs" className="hero-primary-button">
            Explore turfs
            <span>↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;