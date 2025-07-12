import { useAuth } from "../utils/idb.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  CircleUserRound,
  LayoutDashboard,
  Users,
  UserPlus,
  Tag,
  Folder,
  Flag,
  ClipboardList,
  ListTodo,
  MessageCircleQuestion,
  Wrench,
  BadgeDollarSign,
  FileQuestion,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ManageUser from "../pages/manageuser/ManageUser.jsx";
import logo from "../assets/logo-new.png";

// Dropdown Tab Component
function TabDropdown({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-white  py-4 hover:text-[#ccc] rounded"
      >
        <Icon size={12} />
        <span>{title}</span>
        <ChevronDown size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <div className="absolute left-0  w-56 bg-white border border-gray-300 rounded shadow text-[13px] z-50">
            <ul className="py-1 text-gray-700">{children}</ul>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dropdown Tab Link
function TabLink({ label, icon: Icon, onClick }) {
  return (
    <li
      className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <Icon size={13} className="mr-2" />
      {label}
    </li>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openedTab, setOpenedTab] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white text-[#092e46] shadow-md">
      <div className="flex items-center justify-between py-3 max-w-[1250px] mx-auto ">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <img src={logo} className="h-7 w-auto" />
        </div>

        {user ? (
          <div className="flex items-center gap-4 text-[13px]">
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center px-2 py-1 rounded  text-black"
              >
                <CircleUserRound className="mr-1" size={15} />
                <span>
                  Welcome , {user.fld_first_name + " " + user?.fld_last_name}
                </span>
                <ChevronDown className="mt-0.5" size={15} />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <div className="absolute right-3 mt-1 w-52 bg-white border border-gray-300 rounded shadow text-[13px] z-50">
                    <div className="px-3 py-2">
                      <p className="font-semibold text-gray-800 text-center">
                        {user.fld_first_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate w-full">
                        {user.fld_email}
                      </p>
                    </div>
                    <ul>
                      <li
                        className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                      >
                        <LogOut className="mr-2" size={14} />
                        Sign Out
                      </li>
                    </ul>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          navigate("/login")
        )}
      </div>

      {/* Tabs */}
      <div className="w-full bg-[#224d68] text-[13px]">
        <div className="max-w-[1250px] mx-auto flex items-center space-x-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-white  py-4 hover:text-[#ccc] rounded"
          >
            <LayoutDashboard size={12} /> Dashboard
          </button>

          <TabDropdown title="Team" icon={Users}>
            {(user?.fld_admin_type == "SUPERADMIN" ||
              user?.fld_admin_type == "SUBADMIN") && (
              <TabLink
                label="Manage Team"
                icon={Users}
                onClick={() => navigate("/team/manage")}
              />
            )}
            <TabLink
              label="Manage Team Member"
              icon={UserPlus}
              onClick={() => navigate("/team/members")}
            />
          </TabDropdown>

          <TabDropdown title="Additional" icon={Wrench}>
            <TabLink
              label="Manage Tags"
              icon={Tag}
              onClick={() => navigate("/manage/tags")}
            />
            <TabLink
              label="Manage Bucket"
              icon={Folder}
              onClick={() => navigate("/manage/bucket")}
            />
            <TabLink
              label="Manage Milestone"
              icon={Flag}
              onClick={() => navigate("/manage/milestone")}
            />
            <TabLink
              label="Manage Projects"
              icon={ClipboardList}
              onClick={() => navigate("/manage/projects")}
            />
          </TabDropdown>

          <TabDropdown title="Tasks" icon={ListTodo}>
            <TabLink
              label="Add Task"
              icon={ListTodo}
              onClick={() => navigate("/tasks/add")}
            />
            <TabLink
              label="My Task"
              icon={ListTodo}
              onClick={() => navigate("/tasks/my")}
            />
            {(user?.fld_admin_type == "SUBADMIN" ||
              user?.fld_admin_type == "SUPERADMIN") && (
              <TabLink
                label="Team Task"
                icon={ListTodo}
                onClick={() => navigate("/tasks/team")}
              />
            )}
            <TabLink
              label="Tasks Created by Me"
              icon={ListTodo}
              onClick={() => navigate("/tasks/created-by-me")}
            />
            <TabLink
              label="Following"
              icon={ListTodo}
              onClick={() => navigate("/tasks/following")}
            />
          </TabDropdown>
          {(user?.fld_admin_type == "SUPERADMIN" ||
            (user?.fld_admin_type == "SUBADMIN" &&
              user?.fld_access_to_addquery == 1)) && (
            <button
              onClick={() => navigate("/manage/queries")}
              className="flex items-center gap-1 text-white  py-4 hover:text-[#ccc] rounded"
            >
              <MessageCircleQuestion size={12} /> Manage Query
            </button>
          )}

          <TabDropdown title="Others" icon={Wrench}>
            <TabLink
              label="Requirement"
              icon={ClipboardList}
              onClick={() => navigate("/manage/requirement")}
            />
            <TabLink
              label="Currency"
              icon={BadgeDollarSign}
              onClick={() => navigate("/manage/currency")}
            />
            <TabLink
              label="Other Tags"
              icon={Tag}
              onClick={() => navigate("/manage/othertags")}
            />
          </TabDropdown>

          <button
            onClick={() =>
              window.open(
                `https://apacvault.com/askforscope/${encodeURIComponent(
                  user?.fld_email
                )}`,
                "_blank"
              )
            }
            className="flex items-center gap-1 text-white py-4 hover:text-[#ccc] rounded"
          >
            <FileQuestion size={12} /> Ask For Scope
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openedTab === "users" && (
          <ManageUser onClose={() => setOpenedTab(null)} />
        )}
      </AnimatePresence>
    </header>
  );
}
