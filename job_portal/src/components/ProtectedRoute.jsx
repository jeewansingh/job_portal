import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user } = useUser();

  if (!isLoggedIn) {
    const recruiterOnly = allowedRoles?.length === 1 && allowedRoles.includes("recruiter");
    return <Navigate to={recruiterOnly ? "/recruiter/login" : "/login"} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role || "candidate")) {
    const fallback = user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
