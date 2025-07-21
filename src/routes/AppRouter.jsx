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
import MyTasks from "../pages/MyTasks";
import TeamTasks from "../pages/TeamTasks";
import TasksCreatedByMe from "../pages/TasksCreatedByMe";
import TasksFollowing from "../pages/TasksFollowing";
import ManageQuery from "../pages/query/ManageQuery";
import SetPassword from "../pages/manageuser/SetPassword";
import ForgotPassword from "../pages/ForgotPassword";



export default function AppRouter() {
  return (
    <Router >
      <ScrollToTop />
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/set_password/:token" element={<SetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>

            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/view_details/:task_id" element={<Dashboard />} />

            
            <Route path="/tasks/my" element={<MyTasks />} />
            <Route path="/tasks/team" element={<TeamTasks />} />
            <Route path="/tasks/created-by-me" element={<TasksCreatedByMe />} />
            <Route path="/tasks/following" element={<TasksFollowing />} />


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

            <Route path="/manage/queries" element={<ManageQuery />} />

            


          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
