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
  Pencil,
  Eye,
  X,
  Check,
  UserRound,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
const navigate = useNavigate();

function handleLogout() {
  logoutUser();
  navigate("/login");
}
const initialProjects = [
  {
    id: 1,
    title: "Company Website Redesign",
    category: "Web Development",
    description: "Redesign a responsive company website with modern layouts.",
    budget: 400,
    duration: "3 weeks",
    status: "Open",
    applications: 2,
  },
  {
    id: 2,
    title: "Social Media Content Package",
    category: "Design",
    description: "Create social media graphics and promotional content.",
    budget: 180,
    duration: "1 week",
    status: "In progress",
    applications: 1,
  },
];

const initialApplications = [
  {
    id: 1,
    projectId: 1,
    name: "Alice Uwase",
    email: "alice@example.com",
    skills: "React, JavaScript, CSS",
    status: "Pending",
  },
  {
    id: 2,
    projectId: 1,
    name: "David Mugisha",
    email: "david@example.com",
    skills: "HTML, CSS, UI Design",
    status: "Pending",
  },
  {
    id: 3,
    projectId: 2,
    name: "Sarah Mutoni",
    email: "sarah@example.com",
    skills: "Graphic Design, Canva",
    status: "Pending",
  },
];

const emptyForm = {
  title: "",
  category: "Web Development",
  description: "",
  budget: "",
  duration: "",
};

export default function ClientDashboard() {
  const [projects, setProjects] = useState(initialProjects);
  const [applications, setApplications] = useState(initialApplications);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notice, setNotice] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const totalBudget = projects.reduce(
    (total, project) => total + Number(project.budget),
    0
  );

  const totalApplications = applications.length;

  const openProjects = projects.filter(
    (project) => project.status === "Open"
  ).length;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setNotice("");
  }

  function openCreateForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setSelectedProject(null);
    setNotice("");
  }

  function openEditForm(project) {
    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      budget: String(project.budget),
      duration: project.duration,
    });

    setEditingId(project.id);
    setShowForm(true);
    setSelectedProject(null);
    setNotice("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.duration.trim() ||
      !formData.budget ||
      Number(formData.budget) <= 0
    ) {
      setNotice("Please complete all fields and enter a budget above zero.");
      return;
    }

    if (editingId !== null) {
      setProjects((previous) =>
        previous.map((project) =>
          project.id === editingId
            ? {
                ...project,
                ...formData,
                budget: Number(formData.budget),
              }
            : project
        )
      );

      setNotice("Project updated successfully.");
    } else {
      const newProject = {
        ...formData,
        id: Date.now(),
        budget: Number(formData.budget),
        status: "Open",
        applications: 0,
      };

      setProjects((previous) => [newProject, ...previous]);
      setNotice("Project created successfully.");
    }

    closeForm();
  }

  function deleteProject(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setProjects((previous) =>
      previous.filter((project) => project.id !== id)
    );

    setApplications((previous) =>
      previous.filter((application) => application.projectId !== id)
    );

    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }

    setNotice("Project deleted successfully.");
  }

  function updateApplicationStatus(applicationId, status) {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? { ...application, status }
          : application
      )
    );

    setNotice(`Application ${status.toLowerCase()} successfully.`);
  }

  const projectApplications = selectedProject
    ? applications.filter(
        (application) => application.projectId === selectedProject.id
      )
    : [];

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <BriefcaseBusiness size={21} />
          </span>
          Skill<span className="accent">Bridge</span>
        </Link>


      <nav className="dashboard-nav-links">
        <Link to="/projects">Browse Projects</Link>

        <Link to="/client-profile">
          Client Profile
        </Link>

        <Link to="/client-dashboard" className="active">
          Client Dashboard
        </Link>
      </nav>

      <button
        type="button"
        className="nav-login"
        onClick={handleLogout}
      >
        Log out
      </button>

      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CLIENT WORKSPACE</p>
            <h1>
              Manage your <span className="accent">projects.</span>
            </h1>
            <p className="muted-text">
              Publish opportunities and organize your freelance work.
            </p>
          </div>

          <button
            className="submit-button compact-button"
            type="button"
            onClick={openCreateForm}
          >
            <CirclePlus size={17} />
            Post a project
          </button>
        </div>

        {notice && (
          <div className="dashboard-notice" role="status">
            {notice}
          </div>
        )}

        {showForm && (
          <section className="dashboard-panel project-form-panel">
            <div className="panel-heading">
              <h2>
                {editingId ? <Pencil size={19} /> : <CirclePlus size={19} />}
                {editingId ? "Edit project" : "Create a project"}
              </h2>

              <button
                className="icon-button"
                type="button"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
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
                <label htmlFor="project-duration">
                  Estimated duration
                </label>
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
                  {editingId ? "Save changes" : "Publish project"}
                  <ArrowUpRight size={17} />
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon">
              <FolderOpen size={21} />
            </span>
            <span className="stat-label">Total projects</span>
            <strong>{projects.length}</strong>
            <span className="stat-footnote">Projects you have posted</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon">
              <Users size={21} />
            </span>
            <span className="stat-label">Applications</span>
            <strong>{totalApplications}</strong>
            <span className="stat-footnote">Across all your projects</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon">
              <DollarSign size={21} />
            </span>
            <span className="stat-label">Combined budgets</span>
            <strong>${totalBudget.toLocaleString()}</strong>
            <span className="stat-footnote">USD, all listed projects</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon">
              <BriefcaseBusiness size={21} />
            </span>
            <span className="stat-label">Open projects</span>
            <strong>{openProjects}</strong>
            <span className="stat-footnote">Currently accepting work</span>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2>
              <BriefcaseBusiness size={19} />
              Your projects
            </h2>
            <span className="panel-count">{projects.length} listed</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={30} />
              <h2>No projects yet</h2>
              <p>Create your first project to start finding talent.</p>
              <button
                className="submit-button"
                type="button"
                onClick={openCreateForm}
              >
                Post your first project
              </button>
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
                    <p>
                      {project.category} · {project.duration}
                    </p>

                    <div className="client-project-meta">
                      <span>
                        <DollarSign size={14} />
                        ${project.budget}
                      </span>
                      <span>
                        <Users size={14} />
                        {projectApplicationsCount(project.id, applications)} applications
                      </span>
                    </div>
                  </div>

                  <span
                    className={`status-pill ${
                      project.status === "Open"
                        ? "status-open"
                        : "status-progress"
                    }`}
                  >
                    {project.status}
                  </span>

                  <div className="project-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      title="View applications"
                      aria-label={`View applications for ${project.title}`}
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEditForm(project)}
                      title="Edit project"
                      aria-label={`Edit ${project.title}`}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      className="icon-button danger-button"
                      type="button"
                      onClick={() => deleteProject(project.id)}
                      title="Delete project"
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedProject && (
          <section className="dashboard-panel applications-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PROJECT APPLICATIONS</p>
                <h2>{selectedProject.title}</h2>
              </div>

              <button
                className="icon-button"
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close applications"
              >
                <X size={19} />
              </button>
            </div>

            {projectApplications.length === 0 ? (
              <div className="empty-state">
                <Users size={30} />
                <h2>No applications yet</h2>
                <p>Freelancer applications will appear here.</p>
              </div>
            ) : (
              <div className="client-project-list">
                {projectApplications.map((application) => (
                  <article
                    className="client-project-row"
                    key={application.id}
                  >
                    <div className="client-project-icon">
                      <UserRound size={21} />
                    </div>

                    <div className="client-project-info">
                      <h3>{application.name}</h3>
                      <p>{application.email}</p>
                      <div className="client-project-meta">
                        <span>{application.skills}</span>
                      </div>
                    </div>

                    <span className="status-pill status-open">
                      {application.status}
                    </span>

                    {application.status === "Pending" && (
                      <div className="project-actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Accept application"
                          aria-label={`Accept ${application.name}`}
                          onClick={() =>
                            updateApplicationStatus(
                              application.id,
                              "Accepted"
                            )
                          }
                        >
                          <Check size={17} />
                        </button>

                        <button
                          className="icon-button danger-button"
                          type="button"
                          title="Reject application"
                          aria-label={`Reject ${application.name}`}
                          onClick={() =>
                            updateApplicationStatus(
                              application.id,
                              "Rejected"
                            )
                          }
                        >
                          <X size={17} />
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <p className="dashboard-footnote">
          <Clock3 size={15} />
          Demo data only. Changes are temporary until backend integration.
        </p>
      </main>
    </div>
  );
}

function projectApplicationsCount(projectId, applications) {
  return applications.filter(
    (application) => application.projectId === projectId
  ).length;
}
