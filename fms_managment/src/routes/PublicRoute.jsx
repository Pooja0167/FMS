import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Wraps Login. If the user already has a valid session, skip the login
// screen and send them straight to their home page.
const PublicRoute = ({ children }) => {
  const token = Cookies.get("access_token");
  const position = Cookies.get("position");

  if (token) {
    if (position === "ADMIN") return <Navigate to="/admin/home" replace />;
    if (position === "CUSTOMER") return <Navigate to="/customer/home" replace />;
  }

  return children;
};

export default PublicRoute;
