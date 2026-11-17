
import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser, getToken } from "../services/api";

export default function ProtectedRoute({ allowedRoles }) {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const destinations = {
      freelancer: "/profile",
      client: "/client-dashboard",
      admin: "/admin",
    };

    return (
      <Navigate
        to={destinations[user.role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}
