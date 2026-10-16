
import { useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const initialUsers = [
  { id: 1, name: "Alex Morgan", email: "alex@example.com", role: "Freelancer", status: "Active" },
  { id: 2, name: "Jordan Lee", email: "jordan@example.com", role: "Client", status: "Active" },
  { id: 3, name: "Sam Taylor", email: "sam@example.com", role: "Freelancer", status: "Pending" },
  { id: 4, name: "Casey Brown", email: "casey@example.com", role: "Client", status: "Active" },
];

const initialProjects = [
  { id: 1, title: "Responsive Business Website", owner: "Jordan Lee", category: "Web Development", status: "Open" },
  { id: 2, title: "Marketing Graphics", owner: "Casey Brown", category: "Design", status: "Open" },
  { id: 3, title: "Customer Data Report", owner: "Jordan Lee", category: "Data Analysis", status: "Review" },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(initialUsers);
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [notice, setNotice] = useState("");

  const visibleUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const visibleProjects = projects.filter((project) =>
    `${project.title} ${project.owner} ${project.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function toggleUserStatus(id) {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Pending" : "Active" }
          : user
      )
    );
    setNotice("User status updated in the demo.");
  }

  function removeProject(id) {
    setProjects((previous) => previous.filter((project) => project.id !== id));
    setNotice("Project removed from the demo.");
  }

  return (
    <div className="dashboard-page admin-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon"><ShieldCheck size={21} /></span>
          Skill<span className="accent">Bridge</span>
          <span className="admin-label">ADMIN</span>
        </Link>

        <nav className="dashboard-nav-links">
          <Link to="/admin" className="active">Overview</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/profile">Profile preview</Link>
        </nav>

        <Link to="/login" className="nav-login">Log out</Link>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PLATFORM CONTROL CENTER</p>
            <h1>Admin <span className="accent">overview.</span></h1>
            <p className="muted-text">
              Monitor activity and review marketplace content.
            </p>
          </div>

          <span className="admin-secure-label">
            <ShieldCheck size={16} /> Admin workspace
          </span>
        </div>

        {notice && <div className="dashboard-notice" role="status">{notice}</div>}

        <section className="stats-grid admin-stats">
          <article className="stat-card">
            <span className="stat-icon"><Users size={21} /></span>
            <span className="stat-label">Registered users</span>
            <strong>{users.length}</strong>
            <span className="stat-footnote">Demo accounts</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><BriefcaseBusiness size={21} /></span>
            <span className="stat-label">Projects listed</span>
            <strong>{projects.length}</strong>
            <span className="stat-footnote">Demo projects</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><CircleAlert size={21} /></span>
            <span className="stat-label">Pending users</span>
            <strong>{users.filter((user) => user.status === "Pending").length}</strong>
            <span className="stat-footnote">Require review</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><Activity size={21} /></span>
            <span className="stat-label">Open projects</span>
            <strong>{projects.filter((project) => project.status === "Open").length}</strong>
            <span className="stat-footnote">Available listings</span>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="admin-toolbar">
            <div className="admin-tabs">
              <button
                className={activeTab === "users" ? "admin-tab active" : "admin-tab"}
                onClick={() => {
                  setActiveTab("users");
                  setSearch("");
                }}
              >
                <Users size={16} /> Users
              </button>

              <button
                className={activeTab === "projects" ? "admin-tab active" : "admin-tab"}
                onClick={() => {
                  setActiveTab("projects");
                  setSearch("");
                }}
              >
                <BriefcaseBusiness size={16} /> Projects
              </button>
            </div>

            <div className="admin-search">
              <Search size={17} />
              <input
                type="search"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {activeTab === "users" ? (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <span className="table-secondary">{user.email}</span>
                      </td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`status-pill ${
                          user.status === "Active" ? "status-open" : "status-pending"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="secondary-button table-action"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === "Active" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleUsers.length === 0 && (
                    <tr><td colSpan="4">No matching users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.map((project) => (
                    <tr key={project.id}>
                      <td><strong>{project.title}</strong></td>
                      <td>{project.owner}</td>
                      <td>{project.category}</td>
                      <td>
                        <span className={`status-pill ${
                          project.status === "Open" ? "status-open" : "status-pending"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="icon-button danger-button"
                          onClick={() => removeProject(project.id)}
                          aria-label={`Remove ${project.title}`}
                          title="Remove project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleProjects.length === 0 && (
                    <tr><td colSpan="5">No matching projects found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="admin-notice">
          <CheckCircle2 size={17} />
          <p>
            <strong>Demo mode:</strong> changes only affect the current browser
            session. Protect administrative operations with server-side
            authentication and authorization before deployment.
          </p>
        </div>

        <p className="dashboard-footnote">
          <LayoutDashboard size={15} /> Statistics are based on the sample data
          in this page, not live platform records.
        </p>
      </main>
    </div>
  );
}
