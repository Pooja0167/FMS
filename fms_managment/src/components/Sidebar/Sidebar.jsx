import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
      width: "200px",
      height: "100vh",
      background: "#1e293b",
      color: "white",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      <h3 style={{ marginBottom: "10px" }}>Admin Panel</h3>
      <Link to="/admin/home" style={{ color: "#94a3b8", textDecoration: "none" }}>Dashboard</Link>
      <Link to="/admin/users" style={{ color: "#94a3b8", textDecoration: "none" }}>Users</Link>
      <Link to="/admin/settings" style={{ color: "#94a3b8", textDecoration: "none" }}>Settings</Link>
    </div>
  );
}

export default Sidebar;