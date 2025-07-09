import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Layout from "../layouts/Layout";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../utils/idb";
import { useEffect } from "react";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import AddTask from "../pages/AddTask";
import EditTask from "../pages/EditTask";
import ManageUser from "../pages/manageuser/ManageUser";



export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks/add" element={<AddTask />} />
            <Route path="/tasks/edit/:taskId" element={<EditTask />} />


            <Route path="/team/members" element={<ManageUser />} />
          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
