import { useAuth } from "../utils/idb.jsx";
import { useLocation, useNavigate } from "react-router-dom";
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
  AtSign,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ManageUser from "../pages/manageuser/ManageUser.jsx";
import logo from "../assets/logo-new.png";
import TaskDetails from "../pages/TaskDetails.jsx";

import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase-config.js";
import { onMessage } from "firebase/messaging";

import notificationIcon from '../assets/notification.png';
import reminderIconIcon from '../assets/reminder.png';

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

  const [commentsOpen, setCommentsOpen] = useState(false);
  const commentsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (commentsRef.current && !commentsRef.current.contains(e.target))
        setCommentsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentsRef.current && !commentsRef.current.contains(event.target)) {
        setCommentsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        "https://loopback-n3to.onrender.com/api/helper/notifications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user?.id }),
        }
      );
      const data = await res.json();
      if (data.status) setNotifications(data.data);
      else console.error("Error fetching notifications:", data.message);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
    }
  };

  const { pathname } = useLocation();

  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

  useEffect(() => {
  const markNotificationAsRead = async () => {
    if (!selectedNotificationId) return;

    try {
      const res = await fetch("https://loopback-n3to.onrender.com/api/helper/read-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: selectedNotificationId }),
      });

      const data = await res.json();
      if (!data.status) {
        console.error("Failed to mark notification as read:", data.message);
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  markNotificationAsRead();
}, [selectedNotificationId]);


const [permissionGranted, setPermissionGranted] = useState(false);
  const requestPermission = async () => {
    try {
      // Check if notification permission is already granted
      const permission = Notification.permission;

      if (permission === "granted") {
        console.log("Notification permission already granted.");

        // Register the service worker with the correct scope
        if ("serviceWorker" in navigator) {
          // Register the service worker manually with the correct path
          const registration = await navigator.serviceWorker.register(
            "/v2/firebase-messaging-sw.js"
          );
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );

          // Now, get the token with the custom service worker registration
          const currentToken = await getToken(messaging, {
            vapidKey: "BLTlcJPRE9x4nAGIrupccptg5ZLehvbNlZ9aKAYHWrRWPq-XP_2GSKRMkgq_iiAzs660ARca9GdzyTkVoKfu_GM",
            //vapidKey:
            //  "BJjfdYHLOsWrNn6I2ii3nyKW_tzzIi94tL2cprgJzM9uqcG2-wr-udlPkiJxgltAhyPaoEWV3WvjYkxuhmLsDs8", // Your VAPID key here 
            serviceWorkerRegistration: registration, // Pass the custom service worker registration
          });

          if (currentToken && user && user.id) {
            console.log("FCM Token:", currentToken);
            const requestData = {
              user_id: user.id,
              token: currentToken,
            };

            const response = await fetch(
              "https://loopback-n3to.onrender.com/api/saveFcmToken",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
              }
            );

            if (response.ok) {
              const result = await response.json();
              console.log("FCM token successfully saved:", result);
            } else {
              console.error(
                "Failed to save FCM token:",
                response.status,
                response.statusText
              );
            }
          } else {
            console.log("No registration token available.");
          }
        } else {
          console.error("Service Workers are not supported in this browser.");
        }
      } else if (permission === "default") {
        // Request permission if not already granted
        const permissionRequest = await Notification.requestPermission();
        if (permissionRequest === "granted") {
          console.log("Notification permission granted.");
          setPermissionGranted(true);
          requestPermission(); // Re-run the permission request logic after granting
        } else {
          console.log("Notification permission denied.");
        }
      } else {
        console.log("Notification permission denied.");
      }
    } catch (error) {
      console.error("Error getting notification permission or token:", error);
    }
  };

  useEffect(() => {
    requestPermission();

    onMessage(messaging, (payload) => {
      console.log("Message received: ", payload.data);

     
    });
  }, []);

  const [notificationClickUser, setNotificationClickUser] = useState(null);
  useEffect(() => {
    const handleMsg = (event) => {
      if (event.data?.type === "open_task") {
        const data = event.data.payload;
        console.log(data);
        setSelectedTaskId(data.task_id);
        console.log(notificationClickUser);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMsg);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMsg);
    };
  }, []);


  return (
    <header className="bg-white text-[#092e46] shadow-md">
      <div className="flex items-center justify-between py-3 max-w-[1250px] mx-auto ">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <img src={logo} className="h-7 w-auto" />
        </div>

        {user ? (
          <div className="flex items-end gap-4 text-[14px]">
            <div className="relative flex items-center gap-2" ref={userRef}>
              {/* COMMENT BUTTON */}
              <div className="relative">
                <button
                  onClick={() => setCommentsOpen(!commentsOpen)}
                  className="relative p-2 rounded hover:bg-gray-100 border border-gray-200"
                >
                  <AtSign
                    size={15}
                    className="text-gray-600 hover:text-gray-800"
                  />
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                </button>

                {/* COMMENT BOX */}
                {commentsOpen && (
                  <div
                    ref={commentsRef}
                    className="absolute -right-48 mt-2 w-96 bg-white border border-gray-300 rounded shadow z-50 p-3 text-[13px]"
                  >
                    <div className="font-semibold text-gray-800 mb-2">
                      Comments
                    </div>
                    <ul className="space-y-2 max-h-60 overflow-y-auto px-1">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const formattedTime = new Date(
                            notification.created_at
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                          return (
                            <li
                              key={notification.id}
                              onClick={() => {
                                setSelectedTaskId(notification.task_id);
                                setSelectedNotificationId(notification.id);
                                setNotifications((prev) =>
                                  prev.filter((n) => n.id !== notification.id)
                                );
                              }}
                              className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-150 rounded-md px-3 py-2 cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 leading-snug">
                                    <span className="font-semibold text-gray-900">
                                      {notification.user_name}
                                    </span>{" "}
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                  {formattedTime}
                                </div>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-sm text-gray-500 px-3 py-2 bg-gray-50 border border-dashed border-gray-200 rounded-md text-center">
                          No notifications found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* USER DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center px-2 py-2 rounded gap-1 hover:bg-gray-100"
                >
                  <CircleUserRound className="" size={18} />
                  <span className="leading-none">
                    Welcome -{" "}
                    <span className="text-orange-600 font-bold">
                      {user.fld_first_name + " " + user?.fld_last_name}
                    </span>
                  </span>
                  <ChevronDown className="" size={15} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-300 rounded shadow text-[13px] z-50">
                      <div className="px-3 py-2">
                        <p className="font-semibold text-gray-800 text-center">
                          {user.fld_first_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate w-full text-center">
                          {user.fld_email}
                        </p>
                      </div>
                      <ul>
                        <li
                          className="flex items-center px-3 py-2 bg-red-100 hover:bg-red-500 hover:text-white cursor-pointer text-[13px]"
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
              label="AskScope Requirement"
              icon={ClipboardList}
              onClick={() => navigate("/manage/requirement")}
            />
            <TabLink
              label="AskScope Currency"
              icon={BadgeDollarSign}
              onClick={() => navigate("/manage/currency")}
            />
            <TabLink
              label="AskScope Tags"
              icon={Tag}
              onClick={() => navigate("/manage/othertags")}
            />
          </TabDropdown>

          <button
            onClick={() =>
              window.open(
                `https://apacvault.com/askforscope/${encodeURIComponent(
                  user?.fld_email
                )}/GEKREWR977FXC86VCXV89XCV6VCX`,
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

        {selectedTaskId && (
          <TaskDetails
            taskId={selectedTaskId}
            onClose={() => {
              setSelectedTaskId(null);
            }}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
