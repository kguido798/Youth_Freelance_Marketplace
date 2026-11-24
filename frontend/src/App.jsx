
import { Navigate, Route, Routes } from "react-router-dom";

// Main pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Freelancer pages
import BrowseProjects from "./pages/BrowseProjects";
import FreelancerProfile from "./pages/FreelancerProfile";

// Client pages
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientDirectory from "./pages/ClientDirectory";
import PublicClientProfile from "./pages/PublicClientProfile";

// Admin page
import AdminDashboard from "./pages/AdminDashboard";

// Authentication protection
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/projects" element={<BrowseProjects />} />

      {/* Freelancer-only pages */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["freelancer"]} />
        }
      >
        <Route
          path="/profile"
          element={<FreelancerProfile />}
        />
      </Route>

      {/* Client-only pages */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["client"]} />
        }
      >
        <Route
          path="/client-dashboard"
          element={<ClientDashboard />}
        />

        <Route
          path="/client-profile"
          element={<ClientProfile />}
        />
      </Route>

      {/* Authenticated users can discover public clients */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["freelancer", "client", "admin"]}
          />
        }
      >
        <Route
          path="/clients"
          element={<ClientDirectory />}
        />

        <Route
          path="/clients/:clientId"
          element={<PublicClientProfile />}
        />
      </Route>

      {/* Admin-only page */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} />
        }
      >
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Route>

      {/* Redirect unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
