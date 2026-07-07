import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// For pages like Login — if already logged in, skip straight to their dashboard
function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (user?.access && user?.position) {
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

export default PublicRoute;