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
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import { formatDate, calculateTaskProgress } from "../helpers/CommonHelper";
import AddTags from "./detailsUtils/AddTags";
import TaskLoader from "../utils/TaskLoader";

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
        "http://localhost:5000/api/tasks/getmycreatedtasks",
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
          fetch("http://localhost:5000/api/helper/allbuckets"),
          fetch("http://localhost:5000/api/helper/allbenchmarks"),
          fetch("http://localhost:5000/api/helper/allprojects"),
          fetch("http://localhost:5000/api/users/allusers"),
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
          <small>${row.fld_unique_task_id || "-"}</small>
          <br>
           <strong class="view-btn hover:cursor-pointer hover:underline ">${
             row.fld_title || "-"
           }</strong>
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
          <div style="position: relative; width: ${size}px; height: ${size}px;">
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
        return `${formatDate(dueDate)} ${dueTime}`.trim();
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
              <span style="color: #3B82F6; margin-right: 4px; font-size: 11px;">#${tag.trim()}</span>
            `
              )
              .join("")
          : "";

        const buttonLabel = data ? "Edit Tags" : "Add Tag";

        // Add a button with a data attribute to identify the row
        const buttonHtml = `
      <button class="tag-btn" style="margin-left: 8px; font-size: 10px; background-color: #E5E7EB; border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer;">
        ${buttonLabel}
      </button>
    `;

        return `${tagsHtml}${buttonHtml}`;
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
        return `<span style="color: ${color}; font-weight: bold;">${status}</span>`;
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

        return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
      },
    },
    {
      title: "Assigned By",
      data: null,
      orderable: false,
      render: (data, type, row) => `
        <div>
          ${row.added_by_name || "-"}<br>
          <small>${row.added_by_email || "-"}</small>
        </div>
      `,
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => `
      <div class="flex gap-2">
        <button class="edit-btn text-blue-600 hover:underline">Edit</button>
        <button class="delete-btn text-red-600 hover:underline">Delete</button>
      </div>
    `,
    },
  ];

  const [selectedTags, setSelectedTags] = useState("");
  const [updateTagModalOpen, setUpdateTagModalOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleViewButtonClick = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
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
      const response = await fetch("http://localhost:5000/api/tasks/delete", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          task_id: selectedTask?.task_id,
        }),
      });
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
          <button
            onClick={resetFilters}
            className="p-1 rounded hover:bg-gray-100"
          >
            <RefreshCcw size={14} className="text-gray-700" />
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
            <div className="flex flex-col gap-2 mt-2">
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
          <div><TaskLoader rows={10} /></div>
        ) : tasks.length === 0 ? (
          <div>No tasks found.</div>
        ) : (
          <div className="bg-white  border-t-2 border-blue-400 rounded w-full f-13 mt-5 p-1">
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
        <div><TaskLoader rows={10} /></div>
      ) : tasks.length === 0 ? (
        <div>No tasks found.</div>
      ) : (
        <div className="bg-white  border-t-2 border-blue-400 rounded w-full f-13 mt-5 p-1">
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
                    .find(".edit-btn")
                    .on("click", () => handleEditButtonClick(data)); // <-- Edit button

                  $(row)
                    .find(".delete-btn")
                    .on("click", () => handleDeleteButtonClick(data));
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
      </AnimatePresence>
    </div>
  );
}

export default TasksCreatedByMe;
