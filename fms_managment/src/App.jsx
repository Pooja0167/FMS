import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Feedback from "./pages/customer/Feedback";
import CreateReviewform from "./pages/customer/CreateReviewform";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
 <Route path="/customer/feedback" element={<Feedback />} />
  <Route path="/customer/feedback/form" element={<CreateReviewform/>} />

    </Routes>
  );
}

export default App;






// import { Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// // import AdminDashboard from "./pages/Admin/AdminDashboard";
// // import CustomerPage from "./pages/Customer/CustomerPage";
// // import PublicRoute from "./routes/PublicRoute";
// // import ProtectedRoute from "./routes/ProtectedRoute";
// // import AdminLayout from "./components/admin/AdminLayout";

// function App() {
//   return (
//     <Routes>
//       {/* Admin Login */}
//       <Route
//         path="/"
//         element={
//           <PublicRoute>
//             <Login />
//           </PublicRoute>
//         }
//       />

//       {/* Customer Login */}
//       <Route
//         path="/customer"
//         element={
//           <PublicRoute>
//             <Login />
//           </PublicRoute>
//         }
//       />

//       {/* Everything under /admin shares ONE sidebar + topbar via AdminLayout */}
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute allowedPositions={["ADMIN"]}>
//             <AdminLayout />
//           </ProtectedRoute>
//         }
//       >
//         {/* <Route path="home" element={<AdminDashboard />} /> */}
//         {/* add more admin pages here later, e.g.: */}
//         {/* <Route path="feedback" element={<Feedback />} /> */}
//       </Route>

//       {/* <Route path="/customer/home" element={<CustomerPage />} /> */}
//     </Routes>
//   );
// }

// export default App;
