import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Wraps any route that requires auth
// allowedPositions: array like ["ADMIN"] or ["CUSTOMER"] or ["ADMIN","CUSTOMER"]
function ProtectedRoute({ children, allowedPositions = [] }) {
  const { user } = useSelector((state) => state.auth);

  // Not logged in at all → go to login
  if (!user?.access) {
    return <Navigate to="/" replace />;
  }

  // Logged in but not allowed for this route → redirect to their home
  if (allowedPositions.length > 0 && !allowedPositions.includes(user.position)) {
    switch (user.position) {
      case "ADMIN":
        return <Navigate to="/admin/home" replace />;
      case "CUSTOMER":
        return <Navigate to="/customer/home" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;