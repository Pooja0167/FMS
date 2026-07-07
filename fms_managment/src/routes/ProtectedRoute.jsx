import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Wraps any page/layout that needs a logged-in user with the right role.
// Usage: <ProtectedRoute allowedPositions={["ADMIN"]}><AdminLayout /></ProtectedRoute>
const ProtectedRoute = ({ children, allowedPositions = [] }) => {
  const token = Cookies.get("access_token");
  const position = Cookies.get("position");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedPositions.length && !allowedPositions.includes(position)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
