import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Pencil, Check, Plus, X, LogOut } from "lucide-react";
import { apiRequest, getStoredUser, logoutUser } from "../services/api";

const emptyProfile = { title: "", location: "", bio: "", education: "", skills: [], portfolio: [] };

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [profile, setProfile] = useState(emptyProfile);
  const [applications, setApplications] = useState([]);
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profileData, applicationData] = await Promise.all([
          apiRequest("/freelancer-profile/me"),
          apiRequest("/my-applications"),
        ]);
        setProfile({ ...emptyProfile, ...profileData.profile });
        setApplications(applicationData.applications || []);
      } catch (err) {
        setError(err.message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  }

  function addSkill(event) {
    event.preventDefault();
    const skill = skillInput.trim();
    if (skill && !profile.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setProfile((previous) => ({ ...previous, skills: [...previous.skills, skill] }));
    }
    setSkillInput("");
  }

  function addPortfolio(event) {
    event.preventDefault();
    if (!portfolioTitle.trim()) return;
    setProfile((previous) => ({
      ...previous,
      portfolio: [...previous.portfolio, { name: portfolioTitle.trim(), description: portfolioDescription.trim() }],
    }));
    setPortfolioTitle("");
    setPortfolioDescription("");
  }

  async function saveProfile() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest("/freelancer-profile/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setSuccess("Your freelancer profile has been saved.");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  if (loading) return <div className="dashboard-page dashboard-content">Loading your profile...</div>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand"><span className="brand-icon"><Code2 size={21}/></span>Youth<span className="accent">FreelanceMarketplace</span></Link>
        <nav className="dashboard-nav-links">
          <Link to="/projects">Browse Projects</Link>
          <Link to="/clients">Discover Clients</Link>
          <Link to="/profile" className="active">My Profile</Link>
        </nav>
        <button className="nav-login" onClick={handleLogout}><LogOut size={15}/> Log out</button>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div><p className="eyebrow">YOUR PROFESSIONAL IDENTITY</p><h1>Freelancer <span className="accent">profile.</span></h1><p className="muted-text">Show clients what you can do and what makes you different.</p></div>
          {!editing ? (
            <button className="secondary-button" onClick={() => setEditing(true)}><Pencil size={16}/> Edit profile</button>
          ) : (
            <button className="submit-button" disabled={saving} onClick={saveProfile}><Check size={16}/> {saving ? "Saving..." : "Save profile"}</button>
          )}
        </div>
        {error && <div className="profile-message error-message">{error}</div>}
        {success && <div className="dashboard-notice">{success}</div>}

        <section className="profile-layout">
          <aside className="profile-sidebar dashboard-panel">
            <div className="avatar-circle">{(user?.name || "F").charAt(0).toUpperCase()}</div>
            <h2>{user?.name || "Freelancer"}</h2>
            {editing ? (
              <>
                <div className="form-field"><label htmlFor="title">Professional title</label><input id="title" name="title" className="dark-input" value={profile.title} onChange={updateField} placeholder="e.g. Frontend Developer"/></div>
                <div className="form-field"><label htmlFor="location">Location</label><input id="location" name="location" className="dark-input" value={profile.location} onChange={updateField} placeholder="City, Country"/></div>
              </>
            ) : (
              <><p className="profile-role">{profile.title || "Add a professional title"}</p><p className="muted-text">{profile.location || "Add your location"}</p></>
            )}
            <span className="profile-completion-label">Youth Freelance Marketplace Freelancer</span>
          </aside>

          <div className="profile-main">
            <section className="dashboard-panel">
              <div className="panel-heading"><div><p className="eyebrow">INTRODUCTION</p><h2>About me</h2></div></div>
              {editing ? (
                <div className="form-field"><label htmlFor="bio">Professional bio</label><textarea id="bio" name="bio" className="dark-input" rows="5" maxLength="2000" value={profile.bio} onChange={updateField}/></div>
              ) : <p className="profile-bio">{profile.bio || "Add a short introduction about yourself."}</p>}
              <div className="form-field">
                <label htmlFor="education">Education</label>
                {editing ? <input id="education" name="education" className="dark-input" value={profile.education} onChange={updateField} placeholder="Your education"/> : <p>{profile.education || "Not added yet"}</p>}
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading"><div><p className="eyebrow">WHAT I CAN DO</p><h2>Skills</h2></div></div>
              <div className="project-skills">
                {profile.skills.map((skill) => <span key={skill}>{skill}{editing && <button type="button" onClick={() => setProfile((p) => ({...p,skills:p.skills.filter((s)=>s!==skill)}))} aria-label={`Remove ${skill}`}><X size={12}/></button>}</span>)}
                {profile.skills.length === 0 && <p className="muted-text">Add your skills to help clients find you.</p>}
              </div>
              {editing && <form className="inline-add-form" onSubmit={addSkill}><input className="dark-input" value={skillInput} onChange={(e)=>setSkillInput(e.target.value)} placeholder="Add a skill"/><button className="secondary-button" type="submit"><Plus size={15}/> Add</button></form>}
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>My applications</h2></div></div>
              {applications.length === 0 ? (
                <p className="muted-text">You have not applied to any projects yet. <Link to="/projects">Browse available projects</Link>.</p>
              ) : applications.map((application) => (
                <article className="portfolio-item" key={application.id}>
                  <div>
                    <h3>{application.title}</h3>
                    <p>{application.client} · {application.category} · {application.currency || "USD"} {Number(application.budget || 0).toLocaleString()}</p>
                    <span className={`application-status ${application.status}`}>{application.status}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading"><div><p className="eyebrow">WORK SAMPLES</p><h2>Portfolio</h2></div></div>
              {profile.portfolio.length ? profile.portfolio.map((item,index) => (
                <article className="portfolio-item" key={`${item.name}-${index}`}>
                  <div><h3>{item.name}</h3><p>{item.description}</p></div>
                  {editing && <button className="icon-button danger" onClick={()=>setProfile((p)=>({...p,portfolio:p.portfolio.filter((_,i)=>i!==index)}))} aria-label="Remove portfolio item"><X size={16}/></button>}
                </article>
              )) : <p className="muted-text">No portfolio items added yet.</p>}
              {editing && <form className="portfolio-add-form" onSubmit={addPortfolio}>
                <div className="form-field"><label htmlFor="portfolio-title">Project name</label><input className="dark-input" id="portfolio-title" value={portfolioTitle} onChange={(e)=>setPortfolioTitle(e.target.value)} required/></div>
                <div className="form-field"><label htmlFor="portfolio-description">Description</label><textarea className="dark-input" id="portfolio-description" rows="2" value={portfolioDescription} onChange={(e)=>setPortfolioDescription(e.target.value)}/></div>
                <button className="secondary-button" type="submit"><Plus size={15}/> Add portfolio item</button>
              </form>}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
