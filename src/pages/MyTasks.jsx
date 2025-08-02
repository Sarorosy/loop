import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/idb";
import toast from "react-hot-toast";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import TaskDetails from "./TaskDetails";
import { AnimatePresence } from "framer-motion";
import { Filter, Layers2, RefreshCcw, User2 } from "lucide-react";
import {
  Tag,
  User,
  Flag,
  CheckCircle,
  CalendarDays,
  Layers,
  ClipboardList,
  ShieldCheck,
  Briefcase,
  Info,
  Wallet,
} from "lucide-react";
import Select from "react-select";
import { formatDate, calculateTaskProgress } from "../helpers/CommonHelper";
import AddTags from "./detailsUtils/AddTags";
import TaskLoader from "../utils/TaskLoader";
import Sort from "./Sort";
import ReminderModal from "./ReminderModal";

function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const [buckets, setBuckets] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    taskNameOrId: "",
    assignedTo: "",
    milestone: "",
    milestoneStatus: "",
    milestoneCompletionStatus: "",
    createdDate: "", // stores today/yesterday/7days/etc. or "custom"
    fromDate: "", // for custom filter
    toDate: "",
    days: "",
    dueDate: "",
    bucketName: "",
    taskStatus: "",
    assignedBy: "",
    projectId: "",
    queryStatus: "",
    paymentRange: "",
  });

  DataTable.use(DT);

  // Separate function outside the component
  const fetchTasks = async (user, setTasks, setLoading, filterParam) => {
    //if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(
        "https://loopback-skci.onrender.com/api/tasks/getmytasks",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            user_type: user?.fld_admin_type,
            assigned_team: user?.fld_assigned_team,
            filters: filterParam,
          }),
        }
      );
      const data = await res.json();
      if (data.status) {
        setTasks(data?.data);
      } else {
        toast.error(data.message || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksCount = async (
    user,
    setAllTasks,
    setLoading,
    filterParam
  ) => {
    //if (!user) return;

    try {
      const res = await fetch(
        "https://loopback-skci.onrender.com/api/tasks/getmytasks",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            user_type: user?.fld_admin_type,
            assigned_team: user?.fld_assigned_team,
            filters: filterParam,
          }),
        }
      );
      const data = await res.json();
      if (data.status) {
        setAllTasks(data?.data);
      } else {
        toast.error(data.message || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Usage inside the component
  useEffect(() => {
    fetchTasks(user, setTasks, setLoading, filters);
    fetchTasksCount(user, setAllTasks, setLoading, {
      taskNameOrId: "",
      assignedTo: "",
      milestone: "",
      milestoneStatus: "",
      milestoneCompletionStatus: "",
      createdDate: "",
      fromDate: "",
      toDate: "",
      days: "",
      dueDate: "",
      bucketName: "",
      taskStatus: "",
      assignedBy: "",
      projectId: "",
      queryStatus: "",
      paymentRange: "",
    });
  }, [user]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [bucketsRes, milestonesRes, projectsRes, usersRes] =
        await Promise.all([
          fetch("https://loopback-skci.onrender.com/api/helper/allbuckets"),
          fetch("https://loopback-skci.onrender.com/api/helper/allbenchmarks"),
          fetch("https://loopback-skci.onrender.com/api/helper/allprojects"),
          fetch("https://loopback-skci.onrender.com/api/users/allusers"),
        ]);
      setBuckets((await bucketsRes.json())?.data || []);
      setMilestones((await milestonesRes.json())?.data || []);
      setProjects((await projectsRes.json())?.data || []);
      setUsers((await usersRes.json())?.data || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  // Columns Definition
  const columns = [
    {
      title: "Task",
      data: "fld_title",
      orderable: false,
      render: (data, type, row) => `
        <div class="truncate !w-50">
          <div class="flex justify-between items-center">
            <div class="leading-none">
              <small class="text-[12px]">${
                row.fld_unique_task_id || "-"
              }</small>
              <span 
                class="copy-btn cursor-pointer text-gray-500 hover:text-black text-[10px] ml-1 rounded hover:bg-gray-100 transition"
              >
                <i class="fa fa-clone" aria-hidden="true"></i>
              </span>
               <span 
            class="copy-task-link cursor-pointer text-blue-500 hover:text-black text-[10px] ml-1 rounded hover:bg-gray-100 transition"
            data-tasklinkid="${row.id}"
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Copy Task Link"
          >
            <i class="fa fa-link" aria-hidden="true"></i>
          </span>
            </div>
            
              ${
                row.fld_reopen == 1
                  ? `<span class="inline-block leading-none bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Reopened</span>`
                  : ""
              }
           
          </div>

          
          <div class="view-btn hover:cursor-pointer hover:underline text-blue-700 text-[12px] truncate mt-1.5">
          ${row.fld_title || "-"}
          </div>
            
        </div>
      `,
    },
    {
      title: "Assigned To",
      data: "assigned_to_name",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "Bucket Name",
      data: "bucket_display_name",
      orderable: false,
      render: (data) => {
        if (!data) return "-";

        return `
      <button class="bucket-btn cursor-pointer" style="font-size: 11px; color: #2563EB;text-align:left;">
        ${data}
      </button>
    `;
      },
    },
    {
      title: "Progress",
      data: null,
      orderable: false,
      render: (data, type, row) => {
        const progress = calculateTaskProgress(row);
        const displayText = progress >= 100 ? "✔" : `${Math.round(progress)}%`;

        const size = 35; // Circle size
        const strokeWidth = 3;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const progressOffset = circumference * (1 - progress / 100);

        return `
      <div style="position: relative; margin:auto; width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" >
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke="${displayText == "0%" ? "#FF0000FF" : "#e0e0e0ff"}"
            stroke-width="${strokeWidth}"
            fill="none"
          />
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke="#0C7733FF"
            stroke-width="${strokeWidth}"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${progressOffset}"
            transform="rotate(-90 ${size / 2} ${size / 2})"
          />
        </svg>
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: ${displayText == "0%" ? "#FF0000FF" : "#0C7733FF"};
          font-weight: bold;
        ">
          ${displayText}
        </div>
      </div>
    `;
      },
    },
    {
      title: "Due Date & Time",
      data: null,
      orderable: false,
      render: (data, type, row) => {
        const dueDate = row.fld_due_date || "-";
        const dueTime = row.fld_due_time || "";
        return `<div class="text-[11px]">${formatDate(
          dueDate
        )} ${dueTime}</div>`.trim();
      },
    },
    {
      title: "Tag",
      data: "tag_names",
      orderable: false,
      render: (data, type, rowData) => {
        const tagsHtml = data
          ? data
              .split(",")
              .map(
                (tag) => `
              <span class="bg-orange-100 text-[9px] py-1 px-1.5 rounded whitespace-nowrap">#${tag.trim()}</span>
            `
              )
              .join("")
          : "";

        const buttonLabel = data ? "Edit Tags" : "Add Tag";

        // Add a button with a data attribute to identify the row
        const buttonHtml = `
      <button class="tag-btn bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px]" >
        ${buttonLabel}
      </button>
    `;

        return `<div class="flex flex-wrap gap-1 items-end">${buttonHtml}${tagsHtml}</div>`;
      },
    },
    {
      title: "Status",
      data: "fld_task_status",
      orderable: false,
      render: (data) => {
        const status = data || "-";
        let color = "#6B7280"; // default gray
        if (status === "Completed") color = "#10B981";
        else if (status === "Pending") color = "#EF4444";
        return `<span class="text-[11px]" style="color: ${color}; font-weight: bold;">${status}</span>`;
      },
    },
    {
      title: "Created Date",
      data: "fld_addedon",
      orderable: true,
      render: (data) => {
        if (!data) return "-";

        const date = new Date(data);
        if (isNaN(date)) return "-";

        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = (hours % 12 || 12).toString();

        return `<div class="text-[11px]">${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}</div>`;
      },
    },
    {
      title: "Assigned By",
      data: null,
      orderable: false,
      render: (data, type, row) => `
      <div class="flex items-center">
      ${(row.hasReminder && row.hasReminder == 1) ? 
        `
        <div class=" hover:cursor-pointer hover:underline text-white bg-orange-500 p-1 rounded  text-[11px] truncate flex items-center justify-center mr-2">
        <svg width="15px" height="15px" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:none;stroke:#FFFFFFFF;stroke-miterlimit:10;stroke-width:1.91px;}</style></defs><path class="cls-1" d="M20.59,14.86V10.09A8.6,8.6,0,0,0,12,1.5h0a8.6,8.6,0,0,0-8.59,8.59v4.77L1.5,16.77v1.91h21V16.77Z"/><path class="cls-1" d="M14.69,18.68a2.55,2.55,0,0,1,.17,1,2.86,2.86,0,0,1-5.72,0,2.55,2.55,0,0,1,.17-1"/><polyline class="cls-1" points="14.7 8.34 10.57 12.48 8.34 10.25"/></svg>
        </div>
        ` : 
        `
        <div class="reminder-btn hover:cursor-pointer hover:underline text-white bg-orange-500 p-1 rounded  text-[11px] truncate flex items-center justify-center mr-2"><i class="fa fa-bell" aria-hidden="true"></i></div>
        `}
        <div>
          ${row.added_by_name || "-"}
        </div>
        </div>
      `,
    },
  ];

  const [selectedTags, setSelectedTags] = useState("");
  const [updateTagModalOpen, setUpdateTagModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const handleViewButtonClick = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };
  const [reminderOpen, setReminderOpen] = useState(false);
  const handleReminderButtonClick = (task) => {
    setSelectedTask(task);
    setReminderOpen(true);
  };

  const handleCopyButtonClick = (task) => {
    navigator.clipboard
      .writeText(task.fld_unique_task_id)
      .then(() => {
        toast.success("Copied!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Copy failed.");
      });
  };

  const handleCopyLink = (task) => {
    if (!task?.task_id) {
      toast.error("Task ID is missing.");
      return;
    }

    const taskIdToCopyUrl = task.task_id;

    const encodeBase64Url = (str) => {
      return btoa(str)
        .replace(/\+/g, "-") // URL safe
        .replace(/\//g, "_") // URL safe
        .replace(/=+$/, ""); // remove padding
    };

    const encodedId = encodeBase64Url(String(taskIdToCopyUrl));
    const link = `https://www.apacvault.com/admin/view_details/${encodedId}`;

    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        toast.error("Copy failed.");
      });
  };

  const [filtersVisible, setFiltersVisible] = useState(false);

  // Initialize DataTable
  useEffect(() => {
    if (!tasks.length) return;

    const table = $(tableRef.current).DataTable({
      destroy: true,
      responsive: true,
      data: tasks,
      columns: columns,
      order: [[6, "desc"]],
    });

    return () => {
      table.destroy();
    };
  }, [tasks]);

  const resetFilters = () => {
    setFilters({
      taskNameOrId: "",
      assignedTo: "",
      milestone: "",
      milestoneStatus: "",
      milestoneCompletionStatus: "",
      createdDate: "", // stores today/yesterday/7days/etc. or "custom"
      fromDate: "", // for custom filter
      toDate: "",
      days: "",
      dueDate: "",
      bucketName: "",
      taskStatus: "",
      assignedBy: "",
      projectId: "",
      queryStatus: "",
      paymentRange: "",
    });
    fetchTasks(user, setTasks, setLoading, {
      taskNameOrId: "",
      assignedTo: "",
      milestone: "",
      milestoneStatus: "",
      milestoneCompletionStatus: "",
      createdDate: "", // stores today/yesterday/7days/etc. or "custom"
      fromDate: "", // for custom filter
      toDate: "",
      days: "",
      dueDate: "",
      bucketName: "",
      taskStatus: "",
      assignedBy: "",
      projectId: "",
      queryStatus: "",
      paymentRange: "",
    });
    fetchTasksCount(user, setAllTasks, setLoading, {
      taskNameOrId: "",
      assignedTo: "",
      milestone: "",
      milestoneStatus: "",
      milestoneCompletionStatus: "",
      createdDate: "", // stores today/yesterday/7days/etc. or "custom"
      fromDate: "", // for custom filter
      toDate: "",
      days: "",
      dueDate: "",
      bucketName: "",
      taskStatus: "",
      assignedBy: "",
      projectId: "",
      queryStatus: "",
      paymentRange: "",
    });
  };

  return (
    <div className="">
      <div className="text-xl font-bold mb-4 flex items-center justify-between">
        <h2 class="text-[16px] font-semibold">My Tasks</h2>
        <div className="flex gap-3">
          <Sort setTasks={setTasks} />
          <button
            onClick={resetFilters}
            className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
          >
            <RefreshCcw size={11} className="text-gray-700" />
          </button>

          <p
            onClick={() => {
              setFiltersVisible(!filtersVisible);
            }}
            className=" flex items-center gap-1 bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 text-xs rounded cursor-pointer "
          >
            <Filter size={11} /> Filter
          </p>
        </div>
      </div>

      <div
        className={`${
          filtersVisible
            ? "block bg-gray-100 rounded   border-blue-400 p-3"
            : "hidden"
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4 text-[11px] ">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Tag size={13} className="text-gray-500" />
              Task Title / ID
            </label>
            <input
              type="text"
              placeholder="Task Title / ID"
              className="px-2 py-2.5 border rounded bg-white border-gray-300"
              value={filters.taskNameOrId}
              onChange={(e) =>
                setFilters({ ...filters, taskNameOrId: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Flag size={13} className="text-gray-500" />
              Milestone
            </label>
            <Select
              classNamePrefix="task-filter"
              value={
                milestones
                  .map((m) => ({
                    value: m.id,
                    label: m.fld_benchmark_name,
                  }))
                  .find((o) => o.value === filters.milestone) || null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  milestone: selectedOption?.value || "",
                })
              }
              options={[
                { value: "", label: "Milestone" },
                ...milestones.map((m) => ({
                  value: m.id,
                  label: m.fld_benchmark_name,
                })),
              ]}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <CheckCircle size={13} className="text-gray-500" />
              Milestone Completion Status
            </label>
            <Select
              classNamePrefix="task-filter"
              value={
                [
                  { value: "", label: "Select Completion Status" },
                  { value: "overdue1", label: "Overdue" },
                  { value: "not_completed", label: "Not Completed" },
                  { value: "on_time", label: "Completed on Time" },
                  { value: "overdue", label: "Completed as Overdue" },
                ].find((o) => o.value === filters.milestoneCompletionStatus) ||
                null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  milestoneCompletionStatus: selectedOption?.value || "",
                })
              }
              options={[
                { value: "", label: "Select Completion Status" },
                { value: "overdue1", label: "Overdue" },
                { value: "not_completed", label: "Not Completed" },
                { value: "on_time", label: "Completed on Time" },
                { value: "overdue", label: "Completed as Overdue" },
              ]}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <CalendarDays size={13} className="text-gray-500" />
              Created Date
            </label>
            <input
              type="date"
              className="px-2 py-2.5 border rounded bg-white border-gray-300"
              value={filters.createdDate}
              onChange={(e) =>
                setFilters({ ...filters, createdDate: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <CalendarDays size={13} className="text-gray-500" />
              Due Date
            </label>
            <input
              type="date"
              className="px-2 py-2.5 border rounded bg-white border-gray-300"
              value={filters.dueDate}
              onChange={(e) =>
                setFilters({ ...filters, dueDate: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Layers2 size={13} className="text-gray-500" />
              Bucket Name
            </label>
            <Select
              classNamePrefix="task-filter"
              value={
                buckets
                  .map((b) => ({
                    value: b.id,
                    label: b.fld_bucket_name,
                  }))
                  .find((o) => o.value === filters.bucketName) || null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  bucketName: selectedOption?.value || "",
                })
              }
              options={[
                { value: "", label: "Bucket Name" },
                ...buckets.map((b) => ({
                  value: b.id,
                  label: b.fld_bucket_name,
                })),
              ]}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <ClipboardList size={13} className="text-gray-500" />
              Task Status
            </label>
            <Select
              classNamePrefix="task-filter"
              value={
                [
                  { value: "", label: "Select Status" },
                  { value: "Open", label: "Open" },
                  { value: "Updated", label: "Updated" },
                  { value: "Overdue", label: "Overdue" },
                  { value: "Today", label: "Today" },
                  { value: "Late but closed", label: "Late but closed" },
                  { value: "Completed", label: "Completed" },
                ].find((o) => o.value === filters.taskStatus) || null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  taskStatus: selectedOption?.value || "",
                })
              }
              options={[
                { value: "", label: "Select Status" },
                { value: "Open", label: "Open" },
                { value: "Updated", label: "Updated" },
                { value: "Overdue", label: "Overdue" },
                { value: "Today", label: "Today" },
                { value: "Late but closed", label: "Late but closed" },
                { value: "Completed", label: "Completed" },
              ]}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-600 mb-1 flex items-center gap-1">
              <User2 size={13} className="text-gray-500" />
              Assigned By
            </label>
            <Select
              classNamePrefix="task-filter"
              value={
                users
                  .map((u) => ({
                    value: u.id,
                    label: `${u.fld_first_name} ${u.fld_last_name}`,
                  }))
                  .find((o) => o.value === filters.assignedBy) || null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  assignedBy: selectedOption?.value || "",
                })
              }
              options={[
                { value: "", label: "Assigned By" },
                ...users.map((u) => ({
                  value: u.id,
                  label: `${u.fld_first_name} ${u.fld_last_name}`,
                })),
              ]}
            />
          </div>

          {/* Status Filter - Radio Buttons */}
          <div className="p-3 bg-gray-100 rounded-md shadow-sm">
            <label className="text-[11px] font-medium text-gray-700 mb-2 flex items-center gap-1">
              <ClipboardList size={13} className="text-gray-600" />
              Filter by Task Status
            </label>

            <div className="flex flex-col gap-2 text-[12px]">
              {Object.entries(
                allTasks.reduce((acc, task) => {
                  const status = task.fld_task_status || "Unknown";
                  acc[status] = (acc[status] || 0) + 1;
                  return acc;
                }, {})
              ).map(([status, count]) => (
                <label
                  key={status}
                  className={`flex items-center justify-between px-1 py-0.5 rounded-md cursor-pointer
          ${
            filters.taskStatus === status
              ? "bg-gray-300 text-gray-900"
              : "bg-white text-gray-800 hover:bg-gray-200"
          }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="statusFilter"
                      value={status}
                      checked={filters.taskStatus === status}
                      onChange={(e) => {
                        setFilters({ ...filters, taskStatus: e.target.value });
                        fetchTasks(user, setTasks, setLoading, {
                          ...filters,
                          taskStatus: e.target.value,
                        });
                      }}
                      className="accent-black"
                    />
                    <span className="capitalize font-medium">{status}</span>
                  </div>
                  <span className="w-5 h-5 flex items-center justify-center text-[11px] font-semibold text-orange-600 border border-orange-500 rounded-full">
                    {count}
                  </span>
                </label>
              ))}

              {/* Clear Filter */}
              <label
                className={`flex items-center justify-between px-1 py-0.5 rounded-md cursor-pointer 
        ${
          filters.taskStatus === ""
            ? "bg-gray-300 text-gray-900"
            : "bg-white text-gray-800 hover:bg-gray-200"
        }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="statusFilter"
                    value=""
                    checked={filters.taskStatus === ""}
                    onChange={(e) => {
                      setFilters({ ...filters, taskStatus: "" });
                      fetchTasks(user, setTasks, setLoading, {
                        ...filters,
                        taskStatus: "",
                      });
                    }}
                    className="accent-black"
                  />
                  <span className="capitalize font-medium">All</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-end">
          <button
            onClick={() => fetchTasks(user, setTasks, setLoading, filters)}
            className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] leading-none"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div>
          <TaskLoader rows={10} />
        </div>
      ) : tasks.length === 0 ? (
        <div>No tasks found.</div>
      ) : (
        <div className="bg-white w-full f-13 mt-5">
          <div className="table-scrollable">
            <DataTable
              data={tasks}
              columns={columns}
              options={{
                pageLength: 50,
                ordering: false,
                createdRow: (row, data) => {
                  if (data.fld_task_status === "Late") {
                    $(row).css("background-color", "#fee2e2"); // light red (same as Tailwind bg-red-100)
                  }
                  if (data.fld_task_status === "Completed") {
                    $(row).css("background-color", "#DFF7C5FF"); // light red (same as Tailwind bg-red-100)
                  }

                  $(row)
                    .find(".view-btn")
                    .on("click", () => handleViewButtonClick(data));

                  $(row)
                    .find(".reminder-btn")
                    .on("click", () => handleReminderButtonClick(data));

                  $(row)
                    .find(".copy-btn")
                    .on("click", () => handleCopyButtonClick(data));

                  $(row)
                    .find(".copy-task-link")
                    .on("click", () => handleCopyLink(data));

                  $(row)
                    .find(".tag-btn")
                    .on("click", () => {
                      setSelectedTags(data.task_tag || "");
                      setSelectedTask(data);
                      setUpdateTagModalOpen(true);
                    });

                  $(row)
                    .find(".bucket-btn")
                    .on("click", () => {
                      setFilters({
                        ...filters,
                        bucketName: data?.fld_bucket_name || "",
                      });
                      setTimeout(() => {
                        fetchTasks(user, setTasks, setLoading, {
                          ...filters,
                          bucketName: data?.fld_bucket_name || "",
                        });
                      }, 300);
                    });
                },
              }}
            />
          </div>
        </div>
      )}
      <AnimatePresence>
        {detailsOpen && selectedTask && (
          <TaskDetails
            taskId={selectedTask?.task_id}
            onClose={() => {
              setDetailsOpen(false);
            }}
          />
        )}

        {selectedTask && reminderOpen && (
          <ReminderModal
            taskId={selectedTask.task_id}
            taskUniqueId={selectedTask.fld_unique_task_id}
            onClose={() => {
              setReminderOpen(false);
            }}
          />
        )}

        {updateTagModalOpen && selectedTask && (
          <AddTags
            taskId={selectedTask.task_id}
            tags={selectedTags?.split(",") ?? []}
            onClose={() => {
              setUpdateTagModalOpen(false);
            }}
            after={(response) => {
              // response.tag_names contains the updated tag names
              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task.task_id == selectedTask.task_id
                    ? {
                        ...task,
                        tag_names: response.tag_names,
                        task_tag: response.tag_ids,
                      }
                    : task
                )
              );
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyTasks;
