import { Link } from "react-router-dom";
import "../styles/NotFound.css";

export default function NotFoundPage() {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1>404</h1>
        <p>Oops... this invite link doesn't exist or has expired.</p>

        <Link to="/" className="back-btn">
          Go back home
        </Link>
      </div>
    </div>
  );
}
