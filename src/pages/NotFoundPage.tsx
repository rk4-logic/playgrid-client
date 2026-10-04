import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="empty-page">
      <h1>Page not found</h1>

      <p>The page you're looking for doesn't exist.</p>

      <Link to="/" className="primary-button">
        Go home
      </Link>
    </section>
  );
}

export default NotFoundPage;