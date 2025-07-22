import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/idb";
import toast from "react-hot-toast";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import TaskDetails from "./TaskDetails";
import { AnimatePresence } from "framer-motion";
import { Filter, Layers2, Plus, RefreshCcw, User2, X } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import { formatDate, calculateTaskProgress } from "../helpers/CommonHelper";
import AddTags from "./detailsUtils/AddTags";
import TaskLoader from "../utils/TaskLoader";
import Sort from "./Sort";
import ReminderModal from "./ReminderModal";

function TasksCreatedByMe() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
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
        "https://loopback-skci.onrender.com/api/tasks/getmycreatedtasks",
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

  // Usage inside the component
  useEffect(() => {
    fetchTasks(user, setTasks, setLoading, filters);
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
              <small class="text-[12px]">${row.fld_unique_task_id || "-"}</small>
              <span 
                class="copy-btn cursor-pointer text-gray-500 hover:text-black text-[10px] ml-1 rounded hover:bg-gray-100 transition"
              >
                <i class="fa fa-clone" aria-hidden="true"></i>
              </span>
            </div>
            
              ${
                row.fld_reopen == 1
                ? `<span class="inline-block leading-none bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Reopened</span>`
                : ""
              }
           
          </div>

          
          <div class="view-btn hover:cursor-pointer hover:underline text-blue-700 text-[12px] truncate mt-1.5">
          ${
            row.fld_title || "-"
          }
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

        const size = 28; // Circle size
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
                stroke="${displayText == "0%" ? "#FF0000FF" : "#FFFFFFFF"}"
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
              font-size: 8px;
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
        return `<div class="text-[11px] whitespace-nowrap">${formatDate(dueDate)} ${dueTime}</div>`.trim();
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

        return `<div class="text-[11px] whitespace-nowrap">${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}</di>`;
      },
    },
    {
      title: "Assigned By",
      data: null,
      orderable: false,
      render: (data, type, row) => `
      <div class="flex items-center">
      <div class="reminder-btn hover:cursor-pointer hover:underline text-white bg-orange-500 p-1 rounded  text-[11px] truncate flex items-center justify-center mr-2"><i class="fa fa-bell" aria-hidden="true"></i></div>
        <div class="text-[12px]">
          ${row.added_by_name || "-"}
        </div>
        </div>
      `,
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => {
        const showReopen = row.fld_task_status == "Completed";
        return `
          <div class="flex gap-2 items-center">
            
            <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium">Edit</button>
            <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">Delete</button>
            ${
              showReopen
                ? `<button class="reopen-btnnn bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">Reopen</button>`
                : ""
            }
          </div>
        `;
      },
    },
  ];

  const [selectedTags, setSelectedTags] = useState("");
  const [updateTagModalOpen, setUpdateTagModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [reopenOption, setReopenOption] = useState("open_all");
  const [selectedMilestones, setSelectedMilestones] = useState([""]);
  const [selectedReopenMilestone, setSelectedReopenMilestone] = useState("");

  const handleReopenModalOpen = (task) => {
    setSelectedReopenMilestone(task.fld_benchmark_name||[]);
   // console.log("Selected Reopen Milestone:", task);
    setSelectedTaskId(task.task_id);
    setReopenModalOpen(true);
  };

const ReopenModal = ({ isOpen, onClose, taskid, milestones = [], taskMilestone = [] }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedMilestones, setSelectedMilestones] = useState([""]);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    setSelectedMilestones([...selectedMilestones, ""]);
  };

  const handleMilestoneChange = (value, index) => {
    const updated = [...selectedMilestones];
    updated[index] = value;
    setSelectedMilestones(updated);
  };

  const handleReopenSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    if (taskMilestone.length > 0) {
      if (!selectedOption) {
        toast.error("Please select a reopen option.");
        return;
      }

      if (selectedOption === "custom") {
        const isValid = selectedMilestones.every((ms) => ms !== "");
        if (!isValid) {
          toast.error("Please select all milestone(s).");
          return;
        }
      }
    }

    const payload = {
      user_id: user?.id,
      taskId: taskid,
      option: selectedOption,
      milestones: selectedOption === "custom" ? selectedMilestones : [],
      reopen_comments: comment.trim(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/tasks/reopen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reopen task");
      }

      const result = await response.json();
      toast.success("Task reopened successfully!");
      
      onClose();
      fetchTasks(user, setTasks, setLoading, filters);
    } catch (error) {
      console.error("Reopen Error:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]">
      <div className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68] rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Reopen Task</h2>
          <button
            className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
            onClick={onClose}
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 text-[13px] flex flex-col gap-4">
          {taskMilestone.length > 0 ? (
            <>
              {/* Reopen Options */}
              <div className="flex flex-col gap-2">
                {[
                  { value: "all", label: "Open All Milestones" },
                  { value: "last", label: "Open Last Milestone" },
                  { value: "custom", label: "Open with Additional Milestone(s)" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reopenOption"
                      value={opt.value}
                      checked={selectedOption === opt.value}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* Custom Milestone Selectors */}
              {selectedOption === "custom" && (
                <div className="mt-2">
                  {selectedMilestones.map((selected, index) => (
                    <select
                      key={index}
                      value={selected}
                      onChange={(e) => handleMilestoneChange(e.target.value, index)}
                      className="w-full border border-gray-300 rounded px-2 py-1 mb-2 text-sm"
                    >
                      <option value="">Select Milestone</option>
                      {milestones.map((ms) => (
                        <option key={ms.id} value={ms.id}>
                          {ms.fld_benchmark_name}
                        </option>
                      ))}
                    </select>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="flex items-center text-blue-600 hover:underline text-sm mt-1"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Milestone
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No milestones found. Only comment required.</p>
          )}

          {/* Comment Box */}
          <div>
            <label className="block mb-1 text-sm font-medium">Comment</label>
            <textarea
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter reason for reopening..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-2 gap-2">
            <button
              onClick={handleReopenSubmit}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



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

  const navigate = useNavigate();
  const handleEditButtonClick = (task) => {
    navigate(`/tasks/edit/${task.task_id}`);
  };

  const handleDeleteButtonClick = (task) => {
    setSelectedTask(task);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTask) {
      setDeleteOpen(false);
      return;
    }
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/tasks/delete",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            task_id: selectedTask?.task_id,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success(data.message || "Task Deleted Succesfully");
        setDeleteOpen(false);
        fetchTasks(user, setTasks, setLoading, filters);
      } else {
        toast.error(data.message || "Error deleting task");
      }
    } catch (e) {
      console.log(e);
    }
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
  };

  return (
    <div className="">
      <div className="text-xl font-bold mb-4 flex items-center justify-between">
        Tasks Created By Me
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
              <CalendarDays size={13} className="text-gray-500" />
              Created Date
            </label>
            <Select
              classNamePrefix="task-filter"
              value={
                [
                  { value: "", label: "Select Date Range" },
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "7days", label: "Last 7 Days" },
                  { value: "30days", label: "Last 30 Days" },
                  { value: "90days", label: "Last 90 Days" },
                  { value: "custom", label: "Custom" },
                ].find((o) => o.value === filters.createdDate) || null
              }
              onChange={(selectedOption) =>
                setFilters({
                  ...filters,
                  createdDate: selectedOption?.value || "",
                  fromDate: "", // reset when option changes
                  toDate: "",
                })
              }
              options={[
                { value: "", label: "Select Date Range" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "7days", label: "Last 7 Days" },
                { value: "30days", label: "Last 30 Days" },
                { value: "90days", label: "Last 90 Days" },
                { value: "custom", label: "Custom" },
              ]}
            />
          </div>
          {filters.createdDate === "custom" && (
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-gray-600 mb-1">
                From Date
              </label>
              <input
                type="date"
                className="px-2 py-2.5 border rounded bg-white border-gray-300"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
              />
            </div>
          )}
          {filters.createdDate === "custom" && (
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-gray-600 mb-1">
                To Date
              </label>
              <input
                type="date"
                className="px-2 py-2.5 border rounded bg-white border-gray-300"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
              />
            </div>
          )}

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
                      .find(".reopen-btnnn")
                      .on("click", () => handleReopenModalOpen(data));

                    $(row)
                      .find(".reminder-btn")
                      .on("click", () => handleReminderButtonClick(data));

                    $(row)
                      .find(".edit-btn")
                      .on("click", () => handleEditButtonClick(data)); // <-- Edit button

                    $(row)
                      .find(".delete-btn")
                      .on("click", () => handleDeleteButtonClick(data));

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

          {deleteOpen && selectedTask && (
            <ConfirmationModal
              title="Delete Task"
              message={`Are you sure you want to delete? This action cannot be undone.`}
              onYes={handleDelete}
              onClose={() => {
                setDeleteOpen(false);
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
                      ? { ...task, tag_names: response.tag_names }
                      : task
                  )
                );
              }}
            />
          )}
        </AnimatePresence>
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
                    .find(".reopen-btnnn")
                    .on("click", () => handleReopenModalOpen(data));

                  $(row)
                    .find(".edit-btn")
                    .on("click", () => handleEditButtonClick(data)); // <-- Edit button

                  $(row)
                    .find(".delete-btn")
                    .on("click", () => handleDeleteButtonClick(data));

                  $(row)
                    .find(".copy-btn")
                    .on("click", () => handleCopyButtonClick(data));

                  $(row)
                    .find(".tag-btn")
                    .on("click", () => {
                      setSelectedTags(data.task_tag || "");
                      setSelectedTask(data);
                      setUpdateTagModalOpen(true);
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

        {deleteOpen && selectedTask && (
          <ConfirmationModal
            title="Delete Task"
            message={`Are you sure you want to delete? This action cannot be undone.`}
            onYes={handleDelete}
            onClose={() => {
              setDeleteOpen(false);
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

      <ReopenModal
  isOpen={reopenModalOpen}
  onClose={() => setReopenModalOpen(false)}
  taskid={selectedTaskId}
  milestones={milestones}
 taskMilestone={
    typeof selectedReopenMilestone === 'string' && selectedReopenMilestone.trim() !== ''
      ? selectedReopenMilestone.split(',').map((b) => b.trim()).filter(Boolean)
      : []
  }
/>

    </div>
  );
}

export default TasksCreatedByMe;