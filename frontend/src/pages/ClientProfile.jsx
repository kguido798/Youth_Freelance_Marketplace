
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./ClientProfile.css";

const initialProfile = {
  company_name: "",
  industry: "",
  location: "",
  website: "",
  description: "",
  is_public: true,
};

export default function ClientProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiRequest("/client-profile/me");
        setProfile({
          ...initialProfile,
          ...data.profile,
        });
      } catch (err) {
        setError(err.message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest("/client-profile/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      });

      setProfile({
        ...initialProfile,
        ...data.profile,
      });

      setSuccess("Your client profile has been saved successfully.");
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="client-profile-loading">
        Loading your client profile...
      </div>
    );
  }

  return (
    <div className="client-profile-page">
      <header className="client-profile-header">
        <div>
          <Link to="/client-dashboard" className="back-link">
            ← Back to Dashboard
          </Link>

          <p className="profile-eyebrow">ACCOUNT SETTINGS</p>
          <h1>Client Profile</h1>

          <p className="profile-subtitle">
            Tell freelancers about your business and the opportunities
            you offer.
          </p>
        </div>
      </header>

      <div className="client-profile-layout">
        <main className="client-profile-form-card">
          <div className="profile-card-heading">
            <div>
              <h2>Business Information</h2>
              <p>Keep your business details accurate and up to date.</p>
            </div>
            <span className="profile-icon">✦</span>
          </div>

          {error && (
            <div className="profile-message error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="profile-message success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="profile-form-group">
              <label htmlFor="company_name">Company / Organization Name</label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                value={profile.company_name}
                onChange={handleChange}
                placeholder="Enter your company name"
                maxLength={120}
              />
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label htmlFor="industry">Industry</label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  value={profile.industry}
                  onChange={handleChange}
                  placeholder="e.g. Technology"
                  maxLength={100}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="e.g. Kigali, Rwanda"
                  maxLength={120}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="website">Company Website</label>
              <input
                id="website"
                name="website"
                type="url"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                maxLength={255}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="description">About Your Organization</label>
              <textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleChange}
                placeholder="Describe your organization, what you do, and the kind of freelancers you want to work with..."
                rows={6}
                maxLength={2000}
              />
              <small>{profile.description.length}/2000 characters</small>
            </div>

            <div className="profile-visibility">
              <div>
                <h3>Public Profile</h3>
                <p>
                  Allow authenticated freelancers and other users to
                  discover your organization through search and projects.
                </p>
              </div>

              <label className="visibility-switch">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={Boolean(profile.is_public)}
                  onChange={handleChange}
                />
                <span className="visibility-slider"></span>
              </label>
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="save-profile-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>

        <aside className="client-profile-sidebar">
          <div className="profile-preview-card">
            <span className="preview-label">PROFILE PREVIEW</span>

            <div className="preview-avatar">
              {(profile.company_name || "C").charAt(0).toUpperCase()}
            </div>

            <h2>{profile.company_name || "Your Company Name"}</h2>

            <p className="preview-industry">
              {profile.industry || "Your Industry"}
            </p>

            <div className="preview-detail">
              <span>⌖</span>
              {profile.location || "Your Location"}
            </div>

            {profile.website && (
              <div className="preview-detail">
                <span>↗</span>
                {profile.website}
              </div>
            )}

            <div className="preview-description">
              {profile.description ||
                "Your organization description will appear here."}
            </div>

            <div className="preview-status">
              <span
                className={
                  profile.is_public ? "status-dot public" : "status-dot private"
                }
              ></span>
              {profile.is_public ? "Public profile" : "Private profile"}
            </div>
          </div>

          <div className="profile-tip-card">
            <h3>Build trust with freelancers</h3>
            <p>
              Complete your profile to help freelancers understand
              your organization and the opportunities you offer.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
