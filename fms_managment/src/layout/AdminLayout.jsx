import Sidebar from "../components/Sidebar/Sidebar";

function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      
      {/* Sidebar always visible */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>

    </div>
  );
}

export default AdminLayout;