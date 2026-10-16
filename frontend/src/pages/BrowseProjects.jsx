
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const sampleProjects = [
  {
    id: 1,
    title: "Build a Responsive Business Website",
    client: "Nova Digital",
    category: "Web Development",
    budget: 250,
    duration: "2 weeks",
    skills: ["React", "CSS", "JavaScript"],
    description:
      "Create a modern, responsive website for a growing local business.",
  },
  {
    id: 2,
    title: "Design Social Media Campaign Graphics",
    client: "Creative Hub",
    category: "Design",
    budget: 120,
    duration: "1 week",
    skills: ["Figma", "Graphic Design", "Canva"],
    description:
      "Design engaging visual content for a new digital marketing campaign.",
  },
  {
    id: 3,
    title: "Analyze Customer Survey Data",
    client: "Insight Africa",
    category: "Data Analysis",
    budget: 180,
    duration: "10 days",
    skills: ["Excel", "Python", "Data Analysis"],
    description:
      "Clean survey data and prepare a clear report with useful insights.",
  },
  {
    id: 4,
    title: "Write SEO Blog Articles",
    client: "Growth Studio",
    category: "Writing",
    budget: 90,
    duration: "5 days",
    skills: ["Writing", "SEO", "Research"],
    description:
      "Write helpful, well-researched articles for a business blog.",
  },
  {
    id: 5,
    title: "Create a Mobile App Prototype",
    client: "Launch Labs",
    category: "Design",
    budget: 300,
    duration: "3 weeks",
    skills: ["Figma", "UI Design", "Prototyping"],
    description:
      "Build an interactive prototype for a new mobile application.",
  },
  {
    id: 6,
    title: "Develop a Python Automation Script",
    client: "TechBridge",
    category: "Web Development",
    budget: 200,
    duration: "1 week",
    skills: ["Python", "APIs", "Automation"],
    description:
      "Automate a repetitive business process using a simple Python tool.",
  },
];

const categories = [
  "All",
  "Web Development",
  "Design",
  "Data Analysis",
  "Writing",
];

export default function BrowseProjects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [savedProjects, setSavedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = useMemo(() => {
    const term = search.toLowerCase().trim();

    return sampleProjects.filter((project) => {
      const matchesCategory =
        category === "All" || project.category === category;

      const searchableText = [
        project.title,
        project.client,
        project.category,
        project.description,
        ...project.skills,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(term);
    });
  }, [search, category]);

  function toggleSaved(id) {
    setSavedProjects((previous) =>
      previous.includes(id)
        ? previous.filter((projectId) => projectId !== id)
        : [...previous, id]
    );
  }

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
          <Link to="/projects" className="active">Browse Projects</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/client-dashboard">Client Dashboard</Link>
        </nav>

        <Link to="/login" className="nav-login">Log out</Link>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
            <h1>Browse <span className="accent">projects.</span></h1>
            <p className="muted-text">
              Discover projects that match your skills and ambitions.
            </p>
          </div>

          <div className="heading-count">
            <strong>{filteredProjects.length}</strong>
            <span>projects found</span>
          </div>
        </div>

        <section className="project-search-panel">
          <div className="project-search-input">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search projects, skills, or clients..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="filter-label">
            <SlidersHorizontal size={17} />
            <span>Categories</span>
          </div>

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-chip ${category === item ? "selected" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="project-grid">
          {filteredProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-top">
                <span className="project-category">{project.category}</span>
                <button
                  type="button"
                  className={`save-button ${
                    savedProjects.includes(project.id) ? "saved" : ""
                  }`}
                  onClick={() => toggleSaved(project.id)}
                  aria-label={
                    savedProjects.includes(project.id)
                      ? "Remove saved project"
                      : "Save project"
                  }
                >
                  {savedProjects.includes(project.id) ? "♥" : "♡"}
                </button>
              </div>

              <h2>{project.title}</h2>
              <p className="project-client">Posted by {project.client}</p>
              <p className="project-description">{project.description}</p>

              <div className="project-skills">
                {project.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="project-meta">
                <span><Wallet size={16} /> ${project.budget}</span>
                <span><Clock3 size={16} /> {project.duration}</span>
              </div>

              <button
                className="project-action"
                type="button"
                onClick={() => setSelectedProject(project)}
              >
                View project <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </section>

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <Search size={32} />
            <h2>No projects found</h2>
            <p>Try a different search term or category.</p>
            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {selectedProject && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProject(null)}
        >
          <section
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              ×
            </button>

            <span className="project-category">
              {selectedProject.category}
            </span>
            <h2 id="project-modal-title">{selectedProject.title}</h2>
            <p className="muted-text">Client: {selectedProject.client}</p>
            <p>{selectedProject.description}</p>

            <div className="project-meta">
              <span><Wallet size={16} /> ${selectedProject.budget}</span>
              <span><Clock3 size={16} /> {selectedProject.duration}</span>
            </div>

            <div className="project-skills">
              {selectedProject.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <p className="muted-text">
              Applying to projects will be enabled when authentication and the
              application API are connected.
            </p>

            <button
              className="submit-button"
              onClick={() => setSelectedProject(null)}
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
