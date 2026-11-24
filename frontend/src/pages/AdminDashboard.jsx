import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, BriefcaseBusiness, CheckCircle2, CircleAlert, LayoutDashboard,
  Search, ShieldCheck, Trash2, Users, LogOut
} from "lucide-react";
import { apiRequest, getStoredUser, logoutUser } from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOverview() {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/admin/overview");
      setUsers(data.users || []);
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOverview(); }, []);

  const visibleUsers = useMemo(() => users.filter((item) =>
    `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);
  const visibleProjects = useMemo(() => projects.filter((item) =>
    `${item.title} ${item.client} ${item.category}`.toLowerCase().includes(search.toLowerCase())
  ), [projects, search]);

  async function toggleUserStatus(target) {
    try {
      const nextStatus = !Boolean(target.is_active);
      const data = await apiRequest(`/admin/users/${target.id}/status`, {
        method: "PATCH", body: JSON.stringify({ is_active: nextStatus })
      });
      setNotice(data.message || "User status updated.");
      await loadOverview();
    } catch (err) {
      setError(err.message || "Could not update user.");
    }
  }

  async function removeProject(projectId) {
    if (!window.confirm("Permanently delete this project?")) return;
    try {
      const data = await apiRequest(`/admin/projects/${projectId}`, { method: "DELETE" });
      setNotice(data.message || "Project deleted.");
      await loadOverview();
    } catch (err) {
      setError(err.message || "Could not delete project.");
    }
  }

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page admin-page">
      <header className="dashboard-navbar">
        <Link to="/" className="brand"><span className="brand-icon"><ShieldCheck size={21}/></span>Skill<span className="accent">Bridge</span><span className="admin-label">ADMIN</span></Link>
        <nav className="dashboard-nav-links">
          <Link to="/admin" className="active">Overview</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/clients">Client profiles</Link>
        </nav>
        <button className="nav-login" onClick={handleLogout}><LogOut size={15}/> Log out</button>
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div><p className="eyebrow">PLATFORM CONTROL CENTER</p><h1>Admin <span className="accent">overview.</span></h1><p className="muted-text">Monitor registered accounts and marketplace projects.</p></div>
          <span className="admin-secure-label"><ShieldCheck size={16}/> Admin workspace</span>
        </div>
        {notice && <div className="dashboard-notice">{notice}</div>}
        {error && <div className="profile-message error-message">{error}</div>}

        <section className="stats-grid admin-stats">
          <article className="stat-card"><span className="stat-icon"><Users size={21}/></span><span className="stat-label">Registered users</span><strong>{users.length}</strong><span className="stat-footnote">All account roles</span></article>
          <article className="stat-card"><span className="stat-icon"><BriefcaseBusiness size={21}/></span><span className="stat-label">Projects listed</span><strong>{projects.length}</strong><span className="stat-footnote">All project statuses</span></article>
          <article className="stat-card"><span className="stat-icon"><CircleAlert size={21}/></span><span className="stat-label">Inactive users</span><strong>{users.filter((item)=>!item.is_active).length}</strong><span className="stat-footnote">Access disabled</span></article>
          <article className="stat-card"><span className="stat-icon"><Activity size={21}/></span><span className="stat-label">Open projects</span><strong>{projects.filter((item)=>item.status==="open").length}</strong><span className="stat-footnote">Accepting applications</span></article>
        </section>

        <section className="dashboard-panel">
          <div className="admin-toolbar">
            <div className="admin-tabs">
              <button className={activeTab==="users"?"active":""} onClick={()=>setActiveTab("users")}><Users size={16}/> Users</button>
              <button className={activeTab==="projects"?"active":""} onClick={()=>setActiveTab("projects")}><BriefcaseBusiness size={16}/> Projects</button>
            </div>
            <div className="project-search-input"><Search size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search records..."/></div>
          </div>

          {loading ? <p className="muted-text">Loading platform data...</p> : activeTab==="users" ? (
            <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{visibleUsers.map((item)=><tr key={item.id}>
                <td>{item.name}</td><td>{item.email}</td><td className="capitalize">{item.role}</td>
                <td><span className={`user-status ${item.is_active?"active":"inactive"}`}>{item.is_active?"Active":"Inactive"}</span></td>
                <td><button className="secondary-button small" disabled={item.id===user?.id} onClick={()=>toggleUserStatus(item)}>{item.is_active?"Deactivate":"Activate"}</button></td>
              </tr>)}</tbody>
            </table>{visibleUsers.length===0&&<p className="muted-text">No users match your search.</p>}</div>
          ) : (
            <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>Project</th><th>Client</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{visibleProjects.map((item)=><tr key={item.id}>
                <td>{item.title}</td><td>{item.client}</td><td>{item.category}</td><td><span className="user-status active">{item.status}</span></td>
                <td><button className="icon-button danger" onClick={()=>removeProject(item.id)} aria-label="Delete project"><Trash2 size={16}/></button></td>
              </tr>)}</tbody>
            </table>{visibleProjects.length===0&&<p className="muted-text">No projects match your search.</p>}</div>
          )}
        </section>
      </main>
    </div>
  );
}
