import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CustomerPage from "./pages/Customer/CustomerPage";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Admin Login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Customer Login */}
      <Route
        path="/customer"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/admin/home"
        element={
          <ProtectedRoute allowedPositions={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/home"
        element={
          <ProtectedRoute allowedPositions={["CUSTOMER"]}>
            <CustomerPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;