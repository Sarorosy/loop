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
import ManageTeams from "../pages/teams/ManageTeams";
import ManageTags from "../pages/tags/ManageTags";
import ManageBucket from "../pages/bucket/ManageBucket";
import ManageBenchmark from "../pages/benchmark/ManageBenchmark";
import Manageprojects from "../pages/project/ManageProjects";
import ManageRequirement from "../pages/requirement/ManageRequirement";
import ManageCurrency from "../pages/currency/ManageCurrency";
import ManageOtherTags from "../pages/othertags/ManageOtherTags";



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
            <Route path="/team/manage" element={<ManageTeams />} />

            <Route path="/manage/tags" element={<ManageTags />} />
            <Route path="/manage/bucket" element={<ManageBucket />} />
            <Route path="/manage/milestone" element={<ManageBenchmark />} />
            <Route path="/manage/projects" element={<Manageprojects />} />
            <Route path="/manage/requirement" element={<ManageRequirement />} />
            <Route path="/manage/currency" element={<ManageCurrency />} />
            <Route path="/manage/othertags" element={<ManageOtherTags />} />

          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
