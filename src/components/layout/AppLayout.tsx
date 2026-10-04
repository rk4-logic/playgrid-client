import { Link, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          PlayGrid
        </Link>

        <nav className="site-nav">
          <Link to="/turfs">Find a turf</Link>
          <Link to="/bookings">My bookings</Link>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>PlayGrid — Book your game.</p>
      </footer>
    </div>
  );
}

export default AppLayout;