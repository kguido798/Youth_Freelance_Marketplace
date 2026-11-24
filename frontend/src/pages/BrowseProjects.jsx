
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  MapPin,
  Clock,
  DollarSign,
  X,
  Filter,
  LogOut,
  User,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getStoredUser, logoutUser } from "../services/api";
import "./BrowseProjects.css";

export default function BrowseProjects() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest("/projects");

      const projectList = Array.isArray(result)
        ? result
        : result.projects || [];

      setProjects(projectList);
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        projects
          .map((project) => project.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (project.title || "").toLowerCase().includes(search) ||
        (project.description || "").toLowerCase().includes(search) ||
        (project.category || "").toLowerCase().includes(search) ||
        (project.client || "").toLowerCase().includes(search) ||
        (Array.isArray(project.skills)
          ? project.skills.join(" ")
          : project.skills || ""
        )
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, selectedCategory]);

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  async function handleApply(projectId) {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "freelancer") {
      setError("Only freelancers can apply for projects.");
      return;
    }

    try {
      setApplicationLoading(true);
      setError("");
      setSuccessMessage("");

      await apiRequest(`/projects/${projectId}/applications`, {
        method: "POST",
        body: {
          cover_letter: applicationMessage,
        },
      });

      setSuccessMessage("Your application was submitted successfully!");
      setApplicationMessage("");
      setSelectedProject(null);
    } catch (err) {
      setError(err.message || "Unable to submit your application.");
    } finally {
      setApplicationLoading(false);
    }
  }

  function formatBudget(project) {
    const budget = Number(project.budget || 0);
    const currency = project.currency || "USD";

    return `${currency} ${budget.toLocaleString()}`;
  }

  function formatSkills(skills) {
    if (Array.isArray(skills)) {
      return skills;
    }

    if (typeof skills === "string" && skills.trim()) {
      try {
        const parsed = JSON.parse(skills);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return skills.split(",").map((skill) => skill.trim()).filter(Boolean);
      }
    }

    return [];
  }

  return (
    <div className="browse-projects-page">
      <header className="browse-navbar">
        <Link to="/" className="browse-brand">
          <BriefcaseBusiness size={25} />
          <span>SkillBridge</span>
        </Link>

        <nav className="browse-nav-links">
          <Link to="/">Home</Link>
          <Link to="/projects" className="active">
            Browse Projects
          </Link>

          {user?.role === "freelancer" && (
            <>
              <Link to="/profile">My Profile</Link>
              <Link to="/clients">Discover Clients</Link>
            </>
          )}

          {user?.role === "client" && (
            <>
              <Link to="/client-dashboard">Dashboard</Link>
              <Link to="/client-profile">My Company Profile</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin">Admin Dashboard</Link>
          )}
        </nav>

        <div className="browse-nav-actions">
          {user ? (
            <>
              <span className="browse-user">
                <User size={16} />
                {user.name || user.email}
              </span>

              <button
                className="browse-logout-button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="browse-login-button">
                Login
              </Link>
              <Link to="/register" className="browse-register-button">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="browse-main">
        <section className="browse-hero">
          <span className="browse-eyebrow">FIND YOUR NEXT OPPORTUNITY</span>

          <h1>
            Discover Projects.
            <br />
            <span>Showcase Your Skills.</span>
          </h1>

          <p>
            Explore opportunities, connect with clients, and find projects
            that match your skills and interests.
          </p>

          <div className="browse-search-container">
            <Search size={20} />

            <input
              type="text"
              placeholder="Search projects, skills, or clients..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                className="clear-search-button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </section>

        <section className="browse-content">
          <div className="browse-section-heading">
            <div>
              <h2>Available Projects</h2>
              <p>
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "project" : "projects"} found
              </p>
            </div>

            <div className="browse-category-filter">
              <Filter size={17} />

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="browse-error-message">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="browse-success-message">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="browse-empty-state">
              <p>Loading available projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="browse-empty-state">
              <BriefcaseBusiness size={42} />
              <h3>No projects found</h3>
              <p>
                Try changing your search or selecting a different category.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => {
                const skills = formatSkills(project.skills);

                return (
                  <article
                    className="project-card"
                    key={project.id}
                  >
                    <div className="project-card-top">
                      <span className="project-category">
                        {project.category || "General"}
                      </span>

                      <span className="project-status">
                        {project.status || "Open"}
                      </span>
                    </div>

                    <h3>{project.title}</h3>

                    <p className="project-description">
                      {project.description}
                    </p>

                    <p className="project-client">
                      Posted by{" "}
                      {project.client_id ? (
                        <Link to={`/clients/${project.client_id}`}>
                          {project.client || "View client"}
                        </Link>
                      ) : (
                        <span>
                          {project.client || "Private client"}
                        </span>
                      )}
                    </p>

                    <div className="project-details">
                      <span>
                        <DollarSign size={16} />
                        {formatBudget(project)}
                      </span>

                      <span>
                        <Clock size={16} />
                        {project.duration || "Not specified"}
                      </span>

                      {project.location && (
                        <span>
                          <MapPin size={16} />
                          {project.location}
                        </span>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div className="project-skills">
                        {skills.slice(0, 5).map((skill, index) => (
                          <span key={`${skill}-${index}`}>
                            {skill}
                          </span>
                        ))}

                        {skills.length > 5 && (
                          <span>+{skills.length - 5}</span>
                        )}
                      </div>
                    )}

                    <div className="project-card-footer">
                      <span className="project-applications">
                        {project.applications || 0} applications
                      </span>

                      <button
                        className="view-project-button"
                        onClick={() => {
                          setSelectedProject(project);
                          setApplicationMessage("");
                          setError("");
                          setSuccessMessage("");
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedProject && (
        <div
          className="project-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="project-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="project-modal-header">
              <div>
                <span className="project-category">
                  {selectedProject.category || "General"}
                </span>

                <h2>{selectedProject.title}</h2>
              </div>

              <button
                className="close-modal-button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="project-modal-body">
              <p className="muted-text">
                Client:{" "}
                {selectedProject.client_id ? (
                  <Link to={`/clients/${selectedProject.client_id}`}>
                    {selectedProject.client || "View client"}
                  </Link>
                ) : (
                  selectedProject.client || "Private client"
                )}
              </p>

              <h3>Project Description</h3>
              <p>{selectedProject.description}</p>

              <div className="project-modal-details">
                <div>
                  <DollarSign size={18} />
                  <span>
                    <strong>Budget</strong>
                    {formatBudget(selectedProject)}
                  </span>
                </div>

                <div>
                  <Clock size={18} />
                  <span>
                    <strong>Duration</strong>
                    {selectedProject.duration || "Not specified"}
                  </span>
                </div>

                <div>
                  <BriefcaseBusiness size={18} />
                  <span>
                    <strong>Experience Level</strong>
                    {selectedProject.level || "Not specified"}
                  </span>
                </div>
              </div>

              <h3>Required Skills</h3>

              <div className="project-skills">
                {formatSkills(selectedProject.skills).length > 0 ? (
                  formatSkills(selectedProject.skills).map((skill, index) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                  ))
                ) : (
                  <span>No specific skills listed</span>
                )}
              </div>

              {user?.role === "freelancer" && (
                <div className="application-section">
                  <h3>Apply for this Project</h3>

                  <textarea
                    placeholder="Introduce yourself and explain why you are suitable for this project..."
                    value={applicationMessage}
                    onChange={(event) =>
                      setApplicationMessage(event.target.value)
                    }
                    rows={5}
                  />

                  <button
                    className="apply-project-button"
                    onClick={() => handleApply(selectedProject.id)}
                    disabled={applicationLoading}
                  >
                    {applicationLoading
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>
                </div>
              )}

              {!user && (
                <div className="application-section">
                  <p>Log in as a freelancer to apply for this project.</p>

                  <Link to="/login" className="apply-project-button">
                    Login to Apply
                  </Link>
                </div>
              )}

              {user?.role === "client" && (
                <p className="muted-text">
                  You are logged in as a client. Only freelancers can apply
                  for projects.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
