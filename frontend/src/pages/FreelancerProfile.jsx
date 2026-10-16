
import { useState } from "react";
import {
  BriefcaseBusiness,
  Camera,
  Check,
  Code2,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FreelancerProfile() {
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [profile, setProfile] = useState({
    name: "Guido Kayigamba",
    title: "ALU Software Developer",
    location: "Kigali, Rwanda",
    bio: "Aspiring software developer passionate about building useful digital products, solving problems, and learning through practical projects.",
    education: "Bachelor of Science",
    skills: ["React", "JavaScript", "Python", "CSS"],
    portfolio: [
      {
        name: "Personal Portfolio Website",
        description: "A responsive website showcasing projects and skills.",
      },
      {
        name: "Task Management App",
        description: "A simple task tracker built to practice CRUD operations.",
      },
    ],
  });

  function updateField(event) {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  }

  function addSkill(event) {
    event.preventDefault();
    const skill = skillInput.trim();

    if (
      skill &&
      !profile.skills.some(
        (existing) => existing.toLowerCase() === skill.toLowerCase()
      )
    ) {
      setProfile((previous) => ({
        ...previous,
        skills: [...previous.skills, skill],
      }));
    }

    setSkillInput("");
  }

  function removeSkill(skillToRemove) {
    setProfile((previous) => ({
      ...previous,
      skills: previous.skills.filter((skill) => skill !== skillToRemove),
    }));
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon"><Code2 size={21} /></span>
          Skill<span className="accent">Bridge</span>
        </Link>

        <nav className="dashboard-nav-links">
          <Link to="/projects">Browse Projects</Link>
          <Link to="/profile" className="active">My Profile</Link>
          <Link to="/client-dashboard">Client Dashboard</Link>
        </nav>

        <Link to="/login" className="nav-login">Log out</Link>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR PROFESSIONAL IDENTITY</p>
            <h1>Freelancer <span className="accent">profile.</span></h1>
            <p className="muted-text">
              Show clients what you can do and what makes you different.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => setEditing((previous) => !previous)}
          >
            {editing ? <Check size={16} /> : <Pencil size={16} />}
            {editing ? "Finish editing" : "Edit profile"}
          </button>
        </div>

        <section className="profile-layout">
          <aside className="profile-sidebar dashboard-panel">
            <div className="avatar-circle">
              {profile.name.trim().charAt(0).toUpperCase() || "U"}
              <span className="avatar-camera"><Camera size={15} /></span>
            </div>

            {editing ? (
              <div className="form-field">
                <label htmlFor="profile-name">Full name</label>
                <input
                  className="dark-input"
                  id="profile-name"
                  name="name"
                  value={profile.name}
                  onChange={updateField}
                />
              </div>
            ) : (
              <h2>{profile.name || "Your name"}</h2>
            )}

            {editing ? (
              <div className="form-field">
                <label htmlFor="profile-title">Professional title</label>
                <input
                  className="dark-input"
                  id="profile-title"
                  name="title"
                  value={profile.title}
                  onChange={updateField}
                />
              </div>
            ) : (
              <p className="muted-text">{profile.title}</p>
            )}

            <div className="profile-detail">
              <MapPin size={16} />
              {editing ? (
                <input
                  className="dark-input"
                  aria-label="Location"
                  name="location"
                  value={profile.location}
                  onChange={updateField}
                />
              ) : (
                <span>{profile.location}</span>
              )}
            </div>

            <div className="profile-detail">
              <GraduationCap size={16} />
              <span>{profile.education}</span>
            </div>

            <div className="profile-progress">
              <div>
                <span>Profile strength</span>
                <strong>75%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: "75%" }} />
              </div>
              <p>Add more experience and portfolio items to improve your profile.</p>
            </div>

            <Link to="/projects" className="submit-button profile-browse">
              Explore projects
            </Link>
          </aside>

          <div className="profile-main">
            <section className="dashboard-panel">
              <div className="panel-heading">
                <h2><UserRound size={19} /> About me</h2>
              </div>

              {editing ? (
                <div className="form-field">
                  <label htmlFor="profile-bio">Professional biography</label>
                  <textarea
                    className="dark-input dark-textarea"
                    id="profile-bio"
                    name="bio"
                    value={profile.bio}
                    onChange={updateField}
                    rows={5}
                  />
                </div>
              ) : (
                <p className="profile-bio">{profile.bio}</p>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <h2><Code2 size={19} /> Skills</h2>
              </div>

              <div className="profile-skills">
                {profile.skills.map((skill) => (
                  <span className="profile-skill" key={skill}>
                    {skill}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {editing && (
                <form className="add-skill-form" onSubmit={addSkill}>
                  <input
                    className="dark-input"
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                  />
                  <button className="secondary-button" type="submit">
                    <Plus size={16} /> Add
                  </button>
                </form>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <h2><BriefcaseBusiness size={19} /> Portfolio projects</h2>
                <span className="panel-count">{profile.portfolio.length} projects</span>
              </div>

              <div className="portfolio-list">
                {profile.portfolio.map((project, index) => (
                  <article className="portfolio-item" key={project.name}>
                    <div className="portfolio-icon"><Code2 size={22} /></div>
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                    </div>
                    <span className="portfolio-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </article>
                ))}
              </div>

              <p className="muted-text portfolio-note">
                Portfolio upload and permanent profile saving can be connected
                to the backend later.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
