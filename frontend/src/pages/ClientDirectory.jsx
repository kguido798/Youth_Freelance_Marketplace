
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, MapPin, ArrowRight } from "lucide-react";
import { apiRequest } from "../services/api";
import "./ClientDirectory.css";

export default function ClientDirectory() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClients(searchTerm = "") {
    try {
      setLoading(true);
      setError("");

      const endpoint = `/clients?q=${encodeURIComponent(searchTerm)}`;
      const data = await apiRequest(endpoint);

      setClients(data.clients || []);
    } catch (err) {
      setError(err.message || "Unable to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    loadClients(query.trim());
  }

  return (
    <div className="client-directory-page">
      <header className="directory-header">
        <div>
          <span className="directory-eyebrow">SKILLBRIDGE NETWORK</span>
          <h1>Discover Clients</h1>
          <p>
            Explore organizations and clients looking to work with talented
            freelancers.
          </p>
        </div>

        <Link to="/projects" className="directory-back-link">
          Browse Projects <ArrowRight size={17} />
        </Link>
      </header>

      <form className="client-search-form" onSubmit={handleSearch}>
        <Search size={20} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by company, name, industry, or location..."
        />
        <button type="submit">Search</button>
      </form>

      <div className="directory-results-heading">
        <h2>Public Client Profiles</h2>
        <span>{clients.length} found</span>
      </div>

      {loading && <p className="directory-message">Loading clients...</p>}

      {!loading && error && (
        <p className="directory-error">{error}</p>
      )}

      {!loading && !error && clients.length === 0 && (
        <div className="directory-empty">
          <Building2 size={35} />
          <h3>No clients found</h3>
          <p>
            Try another search term. Only clients with public profiles appear
            here.
          </p>
        </div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="client-directory-grid">
          {clients.map((client) => (
            <article className="client-directory-card" key={client.user_id}>
              <div className="client-card-icon">
                <Building2 size={25} />
              </div>

              <h3>{client.company_name || client.name}</h3>

              <p className="client-card-owner">
                Profile managed by {client.name}
              </p>

              {client.industry && (
                <span className="client-industry">
                  {client.industry}
                </span>
              )}

              {client.location && (
                <p className="client-location">
                  <MapPin size={15} />
                  {client.location}
                </p>
              )}

              {client.description && (
                <p className="client-card-description">
                  {client.description}
                </p>
              )}

              <Link
                to={`/clients/${client.user_id}`}
                className="view-client-link"
              >
                View Profile <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
