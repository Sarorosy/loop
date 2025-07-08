import React, { useEffect, useState } from "react";
import {
  Loader,
  X,
  User,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  Target,
  File,
  Link,
  RefreshCcw,
  Hash,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import History from "./History";
import { useAuth } from "../utils/idb";
import AddFollowers from "./detailsUtils/AddFollowers";
import AddTags from "./detailsUtils/AddTags";
import toast from "react-hot-toast";
import MilestoneInfo from "./detailsUtils/MilestoneInfo";
import TransferModal from "./detailsUtils/TransferModal";
import UpdateTaskProgress from "./UpdateTaskProgress";

export default function TaskDetails({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [addFollowersOpen, setAddFollowersOpen] = useState(false);
  const [addTagsOpen, setAddTagsOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [updateTaskModalOpen, setUpdateTaskModalOpen] = useState(false);
  const fetchTaskDetails = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      });
      const data = await res.json();
      if (data.status) setTask(data.data);
      else console.error("Error fetching task:", data.message);
    } catch (err) {
      console.error("Failed to fetch task details", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const handleMarkAsOnGoing = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/helper/markAsOngoing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task_id: taskId,
            user_id: user?.id,
            sender_name: user?.fld_first_name + " " + user?.fld_last_name,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Marked");
        fetchTaskDetails();
      } else {
        toast.error(data.message || "Error while Marking");
      }
    } catch (error) {
      console.error("Error marking", error);
      toast.error("Error while marking");
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/helper/markAsCompleted",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task_id: taskId,
            user_id: user?.id,
            sender_name: user?.fld_first_name + " " + user?.fld_last_name,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Done");
        fetchTaskDetails();
      } else {
        toast.error(data.message || "Error while completing task");
      }
    } catch (error) {
      console.error("Error completing task", error);
      toast.error("Error while completing task");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin w-6 h-6 text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center text-red-500 text-sm font-medium">
        Failed to load task details.
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const base64Encode = (str) => {
    return btoa(str.toString());
  };

  // Example: Replace these with your actual values
  const adminId = user?.id || "";

  const iframeSrc = `https://apacvault.com/loop_chatapp/?userid=${base64Encode(
    adminId
  )}&taskid=${base64Encode(taskId)}`;

  const calculateTaskProgress = (task) => {
    let totalPercent = 0;

    if(task.fld_task_status == "Updated" || task.fld_task_status == "Completed"){
      totalPercent = 100;
    }
    else if (task.fld_benchmark_name && task.fld_benchmark_name !== "") {
      const benchmarkNames = task.fld_benchmark_name.split(","); // e.g., ['6', '7', '8']
      const completedBenchmarks = task.fld_completed_benchmarks
        ? task.fld_completed_benchmarks.split(",")
        : []; // e.g., ['6', '7']

      let filteredBenchmarkNames = [...benchmarkNames];

      if (task.task_type === "crm_query") {
        if (!completedBenchmarks.includes("28")) {
          const index28 = benchmarkNames.indexOf("28");
          if (index28 !== -1) {
            filteredBenchmarkNames = benchmarkNames.slice(0, index28 + 1);
          }
        }
      }

      const totalBenchmarks = filteredBenchmarkNames.length;

      if (totalBenchmarks > 0) {
        const progressPerBenchmark = 100 / totalBenchmarks;

        filteredBenchmarkNames.forEach((benchmark) => {
          if (completedBenchmarks.includes(benchmark)) {
            totalPercent += progressPerBenchmark;
          }
        });
      }
    } else {
      totalPercent =
        task.fld_task_status == "Updated" || task.fld_task_status == "Completed"
          ? 100
          : 0;
    }

    return Math.min(totalPercent, 100); // Make sure it doesn't exceed 100
  };

  const progress = calculateTaskProgress(task);
  console.log(task.fld_benchmark_name);
  const progressLabel =
    progress >= 100 ? "Completed" : `${Math.round(progress)}% Completed`;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 w-full h-full bg-white z-50 overflow-y-auto"
    >
      <div className="bg-gray-100">
        <div className="max-w-5xl mx-auto p-4 bg-white">
          <div className="bg-white border-b border-gray-200 pb-4 mb-4 w-full">
            <div className="flex justify-between items-start w-full space-x-2">
              {/* Left Side */}
              <div className="w-1/2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {task.fld_title}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {task.fld_unique_task_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(
                        task.fld_task_status
                      )}`}
                    >
                      {task.fld_task_status}
                    </span>
                    {task.fld_reopen == 1 && (
                      <span
                        className={`px-2 py-1 text-gray-600 rounded text-xs font-medium border border-gray-200`}
                      >
                        Re-Opened
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Bucket:</span>
                    <span className="font-medium text-blue-600">
                      {task.bucket_display_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex flex-col items-end gap-3 w-1/2">
                {/* Progress */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      Task Progress
                      {task.fld_assign_to == user?.id &&
                        (task.fld_task_status != "Updated" &&
                          task.fld_task_status != "Completed") && (
                          <button
                          onClick={()=>{setUpdateTaskModalOpen(true)}}
                          className="flex items-center bg-yellow-500 text-white ml-2 px-1 py-0.5 rounded f-12">
                            Update Task Progress
                          </button>
                        )}
                    </h3>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{progressLabel}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between my-2 space-x-2">
            <div className="flex items-center space-x-1">
              {task.tag_names &&
                task.tag_names
                  .split(",")
                  .map((tag) => (
                    <span className="bg-orange-500 text-white f-11 rounded px-1 py-0.5">
                      # {tag}
                    </span>
                  ))}
            </div>
            <div className="flex items-center space-x-2">
              {task.is_marked_as_ongoing == 1 ? (
                <div className="flex items-center space-x-2">
                  {user?.id == task.marked_as_ongoing_by &&
                    task.fld_task_status != "Completed" && (
                      <button
                        onClick={handleMarkAsCompleted}
                        className="px-1 py-0.5 f-11 bg-green-600 text-white rounded flex items-center"
                      >
                        <CheckCircle size={13} className="mr-2" /> Mark As
                        Complete
                      </button>
                    )}
                  {task.ongoing_by_name ? (
                    <span className="bg-orange-600 text-white f-11 rounded px-1 py-0.5">
                      {task.ongoing_by_name + " Marked as ongoing"}
                    </span>
                  ) : null}
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleMarkAsOnGoing();
                  }}
                  className="px-1 py-0.5 f-11 bg-green-600 text-white rounded"
                >
                  Mark As Ongoing
                </button>
              )}
              {(task.fld_assign_to == user?.id ||
                task.fld_added_by == user?.id) && (
                <button
                  onClick={() => {
                    setTransferModalOpen(true);
                  }}
                  className="px-1 py-0.5 f-11 bg-yellow-600 text-white rounded flex items-center"
                >
                  <RefreshCcw size={13} className="mr-2" /> Transfer
                </button>
              )}

              <button
                onClick={() => {
                  setAddTagsOpen(true);
                }}
                className="px-1 py-0.5 f-11 bg-blue-600 text-white rounded flex items-center"
              >
                <Hash size={13} className="mr-2" /> Add tags
              </button>
              <button
                onClick={() => {
                  setAddFollowersOpen(true);
                }}
                className="px-1 py-0.5 f-11 bg-orange-600 text-white rounded flex items-center"
              >
                <UserPlus size={13} className="mr-2" /> Add Follower(s)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Assigned To */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Assigned To
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-900">
                <span className="font-medium">{task.assigned_to_name}</span>
                <span className="text-gray-500">|</span>
                <span className="text-xs text-gray-600">
                  {task.assigned_to_email}
                </span>
              </div>
            </div>

            {/* Due Date */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Due Date
                </h4>
              </div>
              <div className="flex text-sm text-gray-900">
                <span className="font-medium">
                  {task.fld_due_date || "No due date"}
                </span>
              </div>
            </div>

            {/* Added By */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Added By
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-900">
                <span className="font-medium">{task.added_by_name}</span>
                <span className="text-gray-500">|</span>
                <span className="text-xs text-gray-600">
                  {task.added_by_email}
                </span>
              </div>
            </div>

            {/* Ongoing By */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Ongoing By
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-gray-900">
                <span className="font-medium">
                  {task.ongoing_by_name || "Not assigned"}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-xs text-gray-600">
                  {task.ongoing_by_email || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Followers */}
          {task.followers?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Followers
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.followers.map((follower) => (
                  <div
                    key={follower.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {follower.name.charAt(0)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-900">
                      <span className="font-medium">{follower.name}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-xs text-gray-600">
                        {follower.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex items-start justify-between mb-2">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Task Description
                </h4>
              </div>
              <div
                className="bg-gray-50 p-3 rounded-lg text-gray-800 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    task.fld_description ||
                    "<p class='text-gray-500 italic'>No description provided</p>",
                }}
              />
            </div>

            {task.fld_benchmark_name && (
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 ">
                <MilestoneInfo taskId={taskId} />
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-900">Timeline</h4>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {task.fld_recurring_tasks && (
                <>
                  <div>
                    <span className="font-medium">Recurring Tasks:</span>
                    <span className="text-gray-900 ml-1">
                      {task.fld_recurring_tasks}
                    </span>
                  </div>
                  <span className="text-gray-400">|</span>
                </>
              )}

              <div>
                <span className="font-medium">Created:</span>
                <span className="text-gray-900 ml-1">{task.fld_addedon}</span>
              </div>
              <span className="text-gray-400">|</span>

              <div>
                <span className="font-medium">Completed:</span>
                <span className="text-gray-900 ml-1">
                  {task.fld_completed_at || "Not completed"}
                </span>
              </div>
            </div>
          </div>
          {task.fld_google_sheets_or_docs_link && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className=" gap-3 text-sm">
                <div className="flex items-start">
                  <span className="font-medium  flex items-center">
                    {" "}
                    <FileText size={15} className="text-blue-600 mr-1" />
                    DOCS
                  </span>
                  <span className="text-blue-900 ml-2">
                    <a
                      href={task.fld_google_sheets_or_docs_link}
                      target="_blank"
                    >
                      {task.fld_google_sheets_or_docs_link}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          )}
          {task.fld_asana_link && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-orange-600 flex items-center">
                    {" "}
                    <Link size={15} /> ASANA URL
                  </span>
                  <span className="text-blue-900 ml-2">
                    <a href={task.fld_asana_link} target="_blank">
                      {task.fld_asana_link}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex ">
            <div className="w-1/2">
              <History taskId={taskId} />
            </div>
            <iframe
              className=""
              src={iframeSrc}
              style={{
                padding: "0px 10px 10px",
                border: "1px solid #dbdbdb",
                width: "600px",
                height: "600px",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {addFollowersOpen && (
          <AddFollowers
            taskId={taskId}
            followers={task?.followers ?? []}
            onClose={() => {
              setAddFollowersOpen(false);
            }}
            after={fetchTaskDetails}
          />
        )}

        {addTagsOpen && (
          <AddTags
            taskId={taskId}
            tags={task?.task_tag?.split(",") ?? []}
            onClose={() => {
              setAddTagsOpen(false);
            }}
            after={fetchTaskDetails}
          />
        )}
        {transferModalOpen && (
          <TransferModal
            taskId={taskId}
            onClose={() => {
              setTransferModalOpen(false);
            }}
            after={fetchTaskDetails}
          />
        )}
        {updateTaskModalOpen && (
          <UpdateTaskProgress 
          taskId={taskId}
          task={task}
          after={fetchTaskDetails}
          onClose={()=>{setUpdateTaskModalOpen(false)}}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
