import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
