import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUsers,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const AdminSidebar = () => {
  const menus = [
    {
      name: "Dashboard",
      path: "/admin/home",
      icon: <FaHome />,
    },
    {
      name: "Company Master",
      path: "/admin/company",
      icon: <FaBuilding />,
    },
    {
      name: "Demo Master",
      path: "/admin/demo",
      icon: <FaUsers />,
    },
    {
      name: "Feedback",
      path: "/admin/feedback",
      icon: <FaClipboardList />,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: <FaChartBar />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FaCog />,
    },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">

      <div className="text-center text-2xl font-bold py-6 border-b border-gray-700">
        FMS Admin
      </div>

      <nav className="flex-1 mt-5">

        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 hover:bg-amber-500 hover:text-black transition ${
                isActive ? "bg-amber-500 text-black" : ""
              }`
            }
          >
            {menu.icon}
            {menu.name}
          </NavLink>
        ))}

      </nav>

      <button className="flex items-center gap-3 px-6 py-4 hover:bg-red-500">
        <FaSignOutAlt />
        Logout
      </button>

    </div>
  );
};

export default AdminSidebar;