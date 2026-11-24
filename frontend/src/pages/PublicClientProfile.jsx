
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Building2,
  MapPin,
  Globe,
  BriefcaseBusiness,
  ArrowLeft,
} from "lucide-react";
import { apiRequest } from "../services/api";
import "./PublicClientProfile.css";

export default function PublicClientProfile() {
  const { clientId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(`/clients/${clientId}`);
        setProfile(data.profile || null);
      } catch (err) {
        setError(err.message || "Unable to load this client profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [clientId]);

  if (loading) {
    return (
      <div className="public-client-page">
        <p className="public-client-message">Loading client profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-client-page">
        <div className="public-client-error">
          <h2>Profile unavailable</h2>
          <p>{error || "This client profile could not be found."}</p>
          <Link to="/clients" className="public-client-back">
            <ArrowLeft size={17} /> Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-client-page">
      <Link to="/clients" className="public-client-back">
        <ArrowLeft size={17} /> Back to Clients
      </Link>

      <section className="public-client-card">
        <div className="public-client-banner">
          <div className="public-client-avatar">
            <Building2 size={38} />
          </div>

          <div>
            <span className="public-client-eyebrow">CLIENT PROFILE</span>
            <h1>{profile.company_name || profile.name}</h1>
            <p>Managed by {profile.name}</p>
          </div>
        </div>

        <div className="public-client-details">
          {profile.industry && (
            <div className="public-client-detail">
              <BriefcaseBusiness size={19} />
              <div>
                <span>Industry</span>
                <strong>{profile.industry}</strong>
              </div>
            </div>
          )}

          {profile.location && (
            <div className="public-client-detail">
              <MapPin size={19} />
              <div>
                <span>Location</span>
                <strong>{profile.location}</strong>
              </div>
            </div>
          )}

          {profile.website && (
            <div className="public-client-detail">
              <Globe size={19} />
              <div>
                <span>Website</span>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Website
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="public-client-about">
          <h2>About the Client</h2>
          <p>
            {profile.description ||
              "This client has not added a company description yet."}
          </p>
        </div>

        <div className="public-client-footer">
          <p>Discover opportunities posted by this client on Youth Freelance Marketplace.</p>
          <Link to="/projects">Browse Projects</Link>
        </div>
      </section>
    </div>
  );
}
