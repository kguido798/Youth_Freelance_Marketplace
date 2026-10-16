
import { useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CirclePlus,
  Clock3,
  DollarSign,
  FolderOpen,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const initialProjects = [
  {
    id: 1,
    title: "Company Website Redesign",
    category: "Web Development",
    budget: 400,
    duration: "3 weeks",
    status: "Open",
    applications: 8,
  },
  {
    id: 2,
    title: "Social Media Content Package",
    category: "Design",
    budget: 180,
    duration: "1 week",
    status: "In progress",
    applications: 5,
  },
];

export default function ClientDashboard() {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "Web Development",
    description: "",
    budget: "",
    duration: "",
  });

  const totalBudget = projects.reduce(
    (total, project) => total + Number(project.budget),
    0
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setNotice("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.duration.trim() ||
      Number(formData.budget) <= 0
    ) {
      setNotice("Please complete all fields and enter a budget above zero.");
      return;
    }

    const newProject = {
      ...formData,
      id: Date.now(),
      budget: Number(formData.budget),
      status: "Open",
      applications: 0,
    };

    setProjects((previous) => [newProject, ...previous]);
    setFormData({
      title: "",
      category: "Web Development",
      description: "",
      budget: "",
      duration: "",
    });
    setShowForm(false);
    setNotice("Project added to this dashboard.");
  }

  function deleteProject(id) {
    setProjects((previous) => previous.filter((project) => project.id !== id));
    setNotice("Project removed from this dashboard.");
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon"><BriefcaseBusiness size={21} /></span>
          Skill<span className="accent">Bridge</span>
        </Link>

        <nav className="dashboard-nav-links">
          <Link to="/projects">Browse Projects</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/client-dashboard" className="active">Client Dashboard</Link>
        </nav>

        <Link to="/login" className="nav-login">Log out</Link>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CLIENT WORKSPACE</p>
            <h1>Manage your <span className="accent">projects.</span></h1>
            <p className="muted-text">
              Publish opportunities and organize your freelance work.
            </p>
          </div>

          <button
            className="submit-button compact-button"
            onClick={() => setShowForm((previous) => !previous)}
          >
            <CirclePlus size={17} />
            {showForm ? "Cancel" : "Post a project"}
          </button>
        </div>

        {notice && (
          <div className="dashboard-notice" role="status">{notice}</div>
        )}

        {showForm && (
          <section className="dashboard-panel project-form-panel">
            <div className="panel-heading">
              <h2><CirclePlus size={19} /> Create a project</h2>
            </div>

            <form className="project-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="project-title">Project title</label>
                <input
                  className="dark-input"
                  id="project-title"
                  name="title"
                  placeholder="e.g. Build a business website"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="project-category">Category</label>
                <select
                  className="dark-input"
                  id="project-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option>Web Development</option>
                  <option>Design</option>
                  <option>Data Analysis</option>
                  <option>Writing</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label htmlFor="project-description">Description</label>
                <textarea
                  className="dark-input dark-textarea"
                  id="project-description"
                  name="description"
                  placeholder="Describe the work, expectations, and required skills..."
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="project-budget">Budget (USD)</label>
                <input
                  className="dark-input"
                  id="project-budget"
                  name="budget"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="250"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="project-duration">Estimated duration</label>
                <input
                  className="dark-input"
                  id="project-duration"
                  name="duration"
                  placeholder="e.g. 2 weeks"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions full-width">
                <button className="submit-button" type="submit">
                  Publish project <ArrowUpRight size={17} />
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon"><FolderOpen size={21} /></span>
            <span className="stat-label">Total projects</span>
            <strong>{projects.length}</strong>
            <span className="stat-footnote">In this dashboard</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><Users size={21} /></span>
            <span className="stat-label">Applications</span>
            <strong>
              {projects.reduce((sum, project) => sum + project.applications, 0)}
            </strong>
            <span className="stat-footnote">Across sample projects</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><DollarSign size={21} /></span>
            <span className="stat-label">Combined budgets</span>
            <strong>${totalBudget.toLocaleString()}</strong>
            <span className="stat-footnote">USD, all listed projects</span>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2><BriefcaseBusiness size={19} /> Your projects</h2>
            <span className="panel-count">{projects.length} listed</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={30} />
              <h2>No projects yet</h2>
              <p>Create your first project to start finding talent.</p>
            </div>
          ) : (
            <div className="client-project-list">
              {projects.map((project) => (
                <article className="client-project-row" key={project.id}>
                  <div className="client-project-icon">
                    <BriefcaseBusiness size={21} />
                  </div>

                  <div className="client-project-info">
                    <h3>{project.title}</h3>
                    <p>{project.category} · {project.duration}</p>
                    <div className="client-project-meta">
                      <span><DollarSign size={14} /> ${project.budget}</span>
                      <span><Users size={14} /> {project.applications} applications</span>
                    </div>
                  </div>

                  <span
                    className={`status-pill ${
                      project.status === "Open" ? "status-open" : "status-progress"
                    }`}
                  >
                    {project.status}
                  </span>

                  <button
                    className="icon-button danger-button"
                    type="button"
                    onClick={() => deleteProject(project.id)}
                    aria-label={`Remove ${project.title}`}
                    title="Remove project"
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="dashboard-footnote">
          <Clock3 size={15} /> Demo data only. Projects will be stored in the
          database after backend integration.
        </p>
      </main>
    </div>
  );
}
