
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  MapPin,
  ArrowUpRight,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "../services/api";
import "./ClientDirectory.css";

export default function ClientDirectory() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchClients(searchTerm = "") {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        `/clients?q=${encodeURIComponent(searchTerm)}`
      );

      setClients(result.clients || []);
    } catch (err) {
      setError(err.message || "Could not load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchClients(search.trim());
  }

  function clearSearch() {
    setSearch("");
    fetchClients("");
  }

  return (
    <main className="discover-page">
      <nav className="discover-navbar">
        <Link to="/" className="discover-brand">
          Skill<span>Bridge</span>
        </Link>

        <div className="discover-nav-links">
          <Link to="/projects">Browse Projects</Link>
          <Link to="/clients" className="active">Discover Clients</Link>
          <Link to="/profile">My Profile</Link>
        </div>
      </nav>

      <section className="discover-hero">
        <div className="discover-hero-content">
          <span className="discover-tag">BUILD MEANINGFUL CONNECTIONS</span>
          <h1>
            Discover <span>Clients</span>
          </h1>
          <p>
            Explore companies, connect with organizations, and discover
            opportunities to showcase your skills and grow professionally.
          </p>

          <form className="discover-search" onSubmit={handleSearch}>
            <Search size={21} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, industries or locations..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="discover-content">
        <div className="discover-heading">
          <div>
            <h2>Explore Organizations</h2>
            <p>Discover clients with public profiles on SkillBridge.</p>
          </div>

          <span className="discover-count">
            {clients.length} {clients.length === 1 ? "Client" : "Clients"}
          </span>
        </div>

        {loading && (
          <div className="discover-state">
            <RefreshCw className="loading-icon" size={25} />
            <p>Finding clients...</p>
          </div>
        )}

        {!loading && error && (
          <div className="discover-state discover-error">
            <p>{error}</p>
            <button onClick={() => fetchClients(search)}>Try Again</button>
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className="discover-state">
            <Building2 size={42} />
            <h3>No clients found</h3>
            <p>Try a different search or check back later.</p>
            {search && (
              <button onClick={clearSearch}>Clear Search</button>
            )}
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="discover-grid">
            {clients.map((client) => (
              <article
                className="discover-card"
                key={client.user_id}
              >
                <div className="discover-card-top">
                  <div className="discover-company-icon">
                    <Building2 size={27} />
                  </div>
                  <span className="public-label">Public Profile</span>
                </div>

                <h3>{client.company_name || client.name}</h3>

                <p className="discover-owner">
                  Managed by {client.name}
                </p>

                {client.industry && (
                  <div className="discover-detail">
                    <BriefcaseBusiness size={16} />
                    <span>{client.industry}</span>
                  </div>
                )}

                {client.location && (
                  <div className="discover-detail">
                    <MapPin size={16} />
                    <span>{client.location}</span>
                  </div>
                )}

                <p className="discover-description">
                  {client.description ||
                    "This organization has not added a description yet."}
                </p>

                <Link
                  to={`/clients/${client.user_id}`}
                  className="discover-view-link"
                >
                  View Client Profile
                  <ArrowUpRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
