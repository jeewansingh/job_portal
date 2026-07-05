import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user } = useUser();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role || "candidate")) {
    const fallback = user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
