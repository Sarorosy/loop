import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/idb";
import toast from "react-hot-toast";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import TaskDetails from "./TaskDetails";
import { AnimatePresence } from "framer-motion";
import { Filter, Layers2, RefreshCcw, User2 } from "lucide-react";

import { formatDate } from "../helpers/CommonHelper";

function TasksFollowing() {
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
    createdDate: "",
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
  const fetchTasks = async (user, setTasks, setLoading) => {
    //if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/tasks/following",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            user_type: user?.fld_admin_type,
            assigned_team: user?.fld_assigned_team,
            filters: filters,
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
    fetchTasks(user, setTasks, setLoading);
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
      render: (data) => data || "-",
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
      render: (data) => {
        if (!data) return "-";
        return data
          .split(",")
          .map(
            (tag) => `
          <span style="color: #3B82F6; margin-right: 4px; font-size: 11px;">#${tag.trim()}</span>
        `
          )
          .join("");
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
        return data ? new Date(data).toLocaleString() : "-";
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
  ];

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const handleViewButtonClick = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
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
      createdDate: "",
      days: "",
      dueDate: "",
      bucketName: "",
      taskStatus: "",
      assignedBy: "",
      projectId: "",
      queryStatus: "",
      paymentRange: "",
    });
    fetchTasks(user, setTasks, setLoading);
  };

  return (
        <div className="">
          <div className="text-xl font-bold mb-4 flex items-center justify-between">
            Following Tasks
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="p-1 rounded hover:bg-gray-100"
              >
                <RefreshCcw size={14} className="text-gray-700" />
              </button>
            </div>
          </div>

          {loading ? (
            <div>Loading tasks...</div>
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
          </AnimatePresence>
        </div>
  );
}

export default TasksFollowing;
