import Sidebar from "../../components/Sidebar/Sidebar";

const AdminDashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1 }}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin!</p>
      </div>
    </div>
  );
};

export default AdminDashboard;