
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseProjects from "./pages/BrowseProjects";
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientProfile from "./pages/ClientProfile";
import ClientDirectory from "./pages/ClientDirectory";
import PublicClientProfile from "./pages/PublicClientProfile";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/projects" element={<BrowseProjects />} />
      <Route element={<ProtectedRoute allowedRoles={["freelancer"]} />}>
        <Route path="/profile" element={<FreelancerProfile />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route
          path="/client-dashboard"
          element={<ClientDashboard />}
        />

        <Route
          path="/client-profile"
          element={<ClientProfile />}
        />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
