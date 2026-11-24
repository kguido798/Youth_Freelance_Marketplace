import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness, CirclePlus, Clock3, DollarSign, FolderOpen,
  Trash2, Users, Pencil, Eye, X, Check, LogOut
} from "lucide-react";
import { apiRequest, logoutUser, getStoredUser } from "../services/api";

const emptyForm = {
  title: "", category: "Web Development", description: "",
  budget: "", duration: "", skills: ""
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const rows = await apiRequest("/projects?mine=1");
      const ownProjects = Array.isArray(rows) ? rows : [];
      setProjects(ownProjects);
      const applicationGroups = await Promise.all(
        ownProjects.map(async (project) => {
          try {
            const data = await apiRequest(`/projects/${project.id}/applications`);
            return data.applications || [];
          } catch {
            return [];
          }
        })
      );
      setApplications(applicationGroups.flat());
    } catch (err) {
      setError(err.message || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  const totalBudget = useMemo(
    () => projects.reduce((total, project) => total + Number(project.budget || 0), 0),
    [projects]
  );
  const openProjects = projects.filter((project) => project.status === "open").length;

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  function openCreateForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setSelectedProject(null);
    setNotice("");
    setError("");
  }

  function openEditForm(project) {
    setFormData({
      title: project.title || "",
      category: project.category || "Web Development",
      description: project.description || "",
      budget: String(project.budget ?? ""),
      duration: project.duration || "",
      skills: (project.skills || []).join(", "),
    });
    setEditingId(project.id);
    setShowForm(true);
    setSelectedProject(null);
    setNotice("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...formData,
      budget: Number(formData.budget),
      skills: formData.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    };
    try {
      const path = editingId ? `/projects/${editingId}` : "/projects";
      const data = await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setNotice(data.message || (editingId ? "Project updated." : "Project created."));
      setShowForm(false);
      setFormData(emptyForm);
      setEditingId(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(projectId) {
    if (!window.confirm("Delete this project and its applications?")) return;
    try {
      const data = await apiRequest(`/projects/${projectId}`, { method: "DELETE" });
      setNotice(data.message || "Project deleted.");
      if (selectedProject?.id === projectId) setSelectedProject(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not delete project.");
    }
  }

  async function updateApplication(applicationId, status) {
    try {
      const data = await apiRequest(`/applications/${applicationId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setNotice(data.message || "Application updated.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not update application.");
    }
  }

  const projectApplications = selectedProject
    ? applications.filter((application) => application.project_id === selectedProject.id)
    : [];

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon"><BriefcaseBusiness size={21} /></span>
          Skill<span className="accent">Bridge</span>
        </Link>
        <nav className="dashboard-nav-links">
          <Link to="/projects">Browse Projects</Link>
          <Link to="/clients">Discover Clients</Link>
          <Link to="/client-profile">Client Profile</Link>
          <Link to="/client-dashboard" className="active">Dashboard</Link>
        </nav>
        <button type="button" className="nav-login" onClick={handleLogout}><LogOut size={15} /> Log out</button>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CLIENT WORKSPACE</p>
            <h1>Welcome back, <span className="accent">{user?.name || "Client"}.</span></h1>
            <p className="muted-text">Manage your projects and review freelancer applications.</p>
          </div>
          <button className="submit-button" onClick={openCreateForm}><CirclePlus size={17} /> Post a project</button>
        </div>

        {notice && <div className="dashboard-notice" role="status">{notice}</div>}
        {error && <div className="profile-message error-message" role="alert">{error}</div>}

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon"><FolderOpen size={21} /></span>
            <span className="stat-label">Total projects</span>
            <strong>{projects.length}</strong>
            <span className="stat-footnote">Your listings</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon"><BriefcaseBusiness size={21} /></span>
            <span className="stat-label">Open projects</span>
            <strong>{openProjects}</strong>
            <span className="stat-footnote">Accepting applications</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon"><Users size={21} /></span>
            <span className="stat-label">Applications</span>
            <strong>{applications.length}</strong>
            <span className="stat-footnote">From freelancers</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon"><DollarSign size={21} /></span>
            <span className="stat-label">Combined budget</span>
            <strong>${totalBudget.toLocaleString()}</strong>
            <span className="stat-footnote">Across your projects</span>
          </article>
        </section>

        {showForm && (
          <section className="dashboard-panel project-form-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{editingId ? "UPDATE LISTING" : "NEW OPPORTUNITY"}</p>
                <h2>{editingId ? "Edit project" : "Post a project"}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close form"><X /></button>
            </div>
            <form className="project-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="project-title">Project title</label>
                <input className="dark-input" id="project-title" required maxLength="150"
                  value={formData.title} onChange={(e) => setFormData({...formData,title:e.target.value})} />
              </div>
              <div className="form-field">
                <label htmlFor="project-category">Category</label>
                <select className="dark-input" id="project-category" value={formData.category}
                  onChange={(e) => setFormData({...formData,category:e.target.value})}>
                  {["Web Development","Design","Data Analysis","Writing","Marketing","Other"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="project-description">Description</label>
                <textarea className="dark-input" id="project-description" rows="5" required maxLength="5000"
                  value={formData.description} onChange={(e) => setFormData({...formData,description:e.target.value})} />
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="project-budget">Budget (USD)</label>
                  <input className="dark-input" id="project-budget" type="number" min="0" step="0.01" required
                    value={formData.budget} onChange={(e) => setFormData({...formData,budget:e.target.value})} />
                </div>
                <div className="form-field">
                  <label htmlFor="project-duration">Duration</label>
                  <input className="dark-input" id="project-duration" placeholder="e.g. 2 weeks"
                    value={formData.duration} onChange={(e) => setFormData({...formData,duration:e.target.value})} />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="project-skills">Required skills (comma separated)</label>
                <input className="dark-input" id="project-skills" placeholder="React, CSS, JavaScript"
                  value={formData.skills} onChange={(e) => setFormData({...formData,skills:e.target.value})} />
              </div>
              <div className="form-actions">
                <button className="submit-button" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Publish project"}</button>
                <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </section>
        )}

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">YOUR LISTINGS</p><h2>Manage projects</h2></div>
            <button className="secondary-button" onClick={openCreateForm}><CirclePlus size={16} /> New project</button>
          </div>
          {loading ? <p className="muted-text">Loading your projects...</p> : projects.length === 0 ? (
            <div className="empty-state"><FolderOpen size={30}/><h3>No projects posted yet</h3><p>Create your first listing to start receiving applications.</p></div>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <article className="project-list-item" key={project.id}>
                  <div className="project-list-main">
                    <span className="project-category">{project.category}</span>
                    <h3>{project.title}</h3>
                    <p className="muted-text">{project.description}</p>
                    <div className="project-meta">
                      <span><DollarSign size={15}/> ${Number(project.budget).toLocaleString()}</span>
                      <span><Clock3 size={15}/> {project.duration || "Not specified"}</span>
                      <span><Users size={15}/> {applications.filter((a) => a.project_id === project.id).length} applications</span>
                    </div>
                  </div>
                  <div className="project-list-actions">
                    <button className="secondary-button" onClick={() => setSelectedProject(project)}><Eye size={15}/> Applications</button>
                    <button className="icon-button" onClick={() => openEditForm(project)} aria-label="Edit project"><Pencil size={16}/></button>
                    <button className="icon-button danger" onClick={() => deleteProject(project.id)} aria-label="Delete project"><Trash2 size={16}/></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedProject && (
        <div className="modal-backdrop" onClick={() => setSelectedProject(null)}>
          <section className="project-modal application-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)} aria-label="Close"><X/></button>
            <p className="eyebrow">FREELANCER RESPONSES</p>
            <h2>Applications for {selectedProject.title}</h2>
            {projectApplications.length === 0 ? <p className="muted-text">No applications received yet.</p> : (
              <div className="application-list">
                {projectApplications.map((application) => (
                  <article className="application-card" key={application.id}>
                    <h3>{application.name}</h3>
                    <p className="muted-text">{application.email} {application.title ? `• ${application.title}` : ""}</p>
                    <p>{application.cover_letter || "No cover letter provided."}</p>
                    <span className={`application-status ${application.status}`}>{application.status}</span>
                    {application.status === "pending" && (
                      <div className="form-actions">
                        <button className="submit-button" onClick={() => updateApplication(application.id,"accepted")}><Check size={15}/> Accept</button>
                        <button className="secondary-button" onClick={() => updateApplication(application.id,"rejected")}>Reject</button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
