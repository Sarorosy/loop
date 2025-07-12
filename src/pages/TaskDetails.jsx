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
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Paperclip,
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

  const [showRemarksInput, setShowRemarksInput] = useState(false);
  const [taskRemarks, setTaskRemarks] = useState("");

  // Example submit handler
  const submitRemarks = async () => {
    if (!taskRemarks) {
      toast.error("Pls enter Comments");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/helper/addremarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          remarks: taskRemarks,
          user_id: user?.id,
        }),
      });
      const data = await res.json();
      if (data.status) {
        fetchTaskDetails();
        toast.success("Added!");
        setShowRemarksInput(false);
        setTaskRemarks("");
      } else {
        toast.error(data.message || "Error adding remarks");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const [showFollowers, setShowFollowers] = useState(true);
  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
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



  if (!task) {
    return (
      <div className="text-center text-red-500 text-[13px] font-medium">
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

    if (
      task.fld_task_status == "Updated" ||
      task.fld_task_status == "Completed"
    ) {
      totalPercent = 100;
    } else if (task.fld_benchmark_name && task.fld_benchmark_name !== "") {
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
  const progressLabel =
    progress >= 100 ? "Completed" : `${Math.round(progress)}% Completed`;
  // console.log(task.fld_benchmark_name);


function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    const hasTime =
        dateString.includes(' ') || dateString.includes('T'); // detect if time part exists

    if (hasTime) {
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).replace(',', '');
    } else {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
}


  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 w-full h-full bg-white z-50 overflow-y-auto"
    >
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader className="animate-spin w-6 h-6 text-blue-600" />
        </div>
      ) : (
        <div className="bg-gray-100 py-5">
          <div className="max-w-[1250px] mx-auto bg-white">
            <div className="bg-[#e4eaff] w-full px-4 py-3">
              <div className="flex justify-between items-start w-full space-x-2">
                {/* Left Side */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Target size={13} className="text-white" />
                  </div> */}
                    <div>
                      <h1 className="text-[15px] font-semibold text-gray-900">
                        View Details - {task.fld_title}
                      </h1>
                      <p className="text-[13px] text-gray-600">
                        {task.fld_unique_task_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-1 py-0.5 rounded border text-[12px] font-medium ${getStatusColor(
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
                <div className="flex items-end flex-col gap-9 justify-between">
                  <button
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-800 px-1 py-1 rounded flex items-center justify-center gap-1 text-gray-100 text-[11px] leading-none"
                  >
                    <ArrowLeft size={12} className="" /> Back
                  </button>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-1 leading-none">
                      {task.tag_names &&
                        task.tag_names
                          .split(",")
                          .map((tag) => (
                            <span className="bg-orange-500 text-white f-11 rounded px-2 py-1">
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
                                className="px-2 py-1 f-11 bg-green-600 text-white rounded flex items-center leading-none"
                              >
                                <CheckCircle size={13} className="mr-1" /> Mark
                                As Complete
                              </button>
                            )}
                          {task.ongoing_by_name ? (
                            <span className="bg-orange-600 text-white f-11 rounded px-2 py-1 leading-none">
                              {task.ongoing_by_name + " Marked as ongoing"}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            handleMarkAsOnGoing();
                          }}
                          className="px-2 py-1 f-11 bg-green-600 text-white rounded leading-none"
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
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="Transfer"
                          className="px-2 py-1 f-11 bg-yellow-600 text-white rounded flex items-center leading-none"
                        >
                          <RefreshCcw size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setAddTagsOpen(true);
                        }}
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Add tags"
                        className="px-2 py-1 f-11 bg-blue-600 text-white rounded flex items-center leading-none"
                      >
                        <Hash size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setAddFollowersOpen(true);
                        }}
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Add Follower(s)"
                        className="px-2 py-1 f-11 bg-orange-600 text-white rounded flex items-center leading-none"
                      >
                        <UserPlus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-3">
              <div className="w-[70%] bg-gray-100 p-2 rounded flex flex-col justify-between gap-3">
                {/* Timestamps */}
                <div className="bg-white border border-gray-200 rounded p-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-gray-600" />
                    <h4 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
                      Timeline :
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-gray-600 ">
                    {task.fld_recurring_tasks && (
                      <>
                        <div>
                          <span className="font-medium leading-none">
                            Recurring Tasks :
                          </span>
                          <span className="text-gray-900 ml-1 leading-none">
                            {task.fld_recurring_tasks}
                          </span>
                        </div>
                        <span className="text-gray-400 leading-none">|</span>
                      </>
                    )}

                    <div>
                      <span className="font-medium leading-none">
                        Created :
                      </span>
                      <span className="text-gray-900 ml-1 leading-none">
                        {formatDate(task.fld_addedon)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded p-3 flex-1  flex flex-col">
                  <div className="flex items-end gap-1 mb-3">
                    <FileText size={16} className="text-indigo-600" />
                    <h4 className="text-[15px] font-semibold text-gray-900 flex items-end leading-none">
                      Task Description
                    </h4>
                  </div>
                  <div
                    className="bg-gray-100 p-2 rounded text-gray-800 text-[13px] leading-relaxed flex-1"
                    dangerouslySetInnerHTML={{
                      __html:
                        task.fld_description ||
                        "<p class='text-gray-500 italic'>No description provided</p>",
                    }}
                  />
                </div>
                <div className="gap-3">
                  {task.fld_task_status !== "updated" &&
                    task.fld_task_status !== "Completed" &&
                    (task.fld_assign_to == user?.id ||
                      task.fld_follower?.split(",").includes(user?.id)) && (
                      <>
                        {!showRemarksInput ? (
                          <button
                            className="bg-blue-500 text-white text-xs py-1 px-3 rounded hover:bg-blue-600"
                            onClick={() => setShowRemarksInput(true)}
                          >
                            Add Remarks
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={4}
                              className="border border-gray-300 rounded p-2 text-[13px] bg-white"
                              placeholder="Enter your remarks here..."
                              value={taskRemarks}
                              onChange={(e) => setTaskRemarks(e.target.value)}
                            ></textarea>
                            <div className="flex gap-2">
                              <button
                                className="bg-green-500 text-white text-xs py-1 px-3 rounded hover:bg-green-600"
                                onClick={submitRemarks}
                              >
                                Submit
                              </button>
                              <button
                                className="bg-gray-300 text-gray-800 text-xs py-1 px-3 rounded hover:bg-gray-400"
                                onClick={() => {
                                  setShowRemarksInput(false);
                                  setTaskRemarks("");
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </div>

                <div className="flex gap-3">
                  {/* DOC link */}
                  {task.fld_google_sheets_or_docs_link && (
                    <div className="bg-white border border-gray-200 rounded p-2 min-w-[50%] truncate">
                      <div className=" gap-3 text-[13px]">
                        <div className="flex items-end">
                          <span className="font-medium leading-none flex items-end gap-1">
                            {" "}
                            <FileText size={15} className="text-blue-600" />
                            DOCS :
                          </span>
                          <span className="text-blue-900 ml-2 leading-none whitespace-nowrap truncate w-100">
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

                  {/* ASANA URL */}
                  {task.fld_asana_link && (
                    <div className="bg-white border border-gray-200 rounded- p-2 truncate">
                      <div className="gap-3 text-[13px]">
                        <div className="flex items-end">
                          <span className="font-medium text-orange-600 flex items-end gap-1 leading-none">
                            {" "}
                            <Link size={15} className="text-blue-600" /> ASANA
                            URL :
                          </span>
                          <span className="text-blue-900 ml-2 leading-none truncate">
                            <a href={task.fld_asana_link} target="_blank">
                              {task.fld_asana_link}
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <h3 className="text-[13px] font-semibold text-gray-800">
                      Attachments
                    </h3>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>

                  {task.fld_file_upload && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {task.fld_file_upload.split(",").map((file, index) => {
                        const isFullUrl = file.startsWith("http");
                        const fileUrl = isFullUrl
                          ? file
                          : `https://www.apacvault.com/assets/taskfileuploads/${file}`;
                        const fileName = file.split("/").pop();

                        return (
                          <a
                            key={index}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition shadow-sm"
                          >
                            <Paperclip className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-700 break-all">
                              {fileName}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-[30%] flex flex-col gap-3">
                {/* Right Side */}
                <div className="flex flex-col items-end gap-3">
                  {/* Progress */}
                  <div className="bg-white border border-gray-200 rounded p-2 w-full">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-start gap-1">
                        <CheckCircle size={13} className="text-green-600" />
                        <h3 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
                          Task Progress
                        </h3>
                      </div>
                      {task.fld_assign_to == user?.id &&
                        task.fld_task_status != "Updated" &&
                        task.fld_task_status != "Completed" && (
                          <div className="flex justify-end items-center">
                            <button
                              onClick={() => {
                                setUpdateTaskModalOpen(true);
                              }}
                              className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-[10px] leading-none"
                            >
                              Update Task Progress
                            </button>
                          </div>
                        )}
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-300 rounded-full h-4">
                        <div
                          className="bg-green-600 h-4 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-gray-50 absolute top-[1px] left-3">
                        {progressLabel}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Assigned To */}
                <div className="bg-white border border-gray-200 rounded p-2 w-full">
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1">
                      <User size={13} className="text-blue-600" />
                      <h4 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
                        Assigned To :
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[13px] text-gray-900 items-end">
                      <span className="text-[13px] leading-none">
                        {task.assigned_to_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div className="bg-white border border-gray-200 rounded p-2 w-full">
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-red-600" />
                      <h4 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
                        Due Date :
                      </h4>
                    </div>
                    <div className="flex text-[13px] text-gray-900 ">
                      <span className="leading-none">
                        {formatDate(task.fld_due_date) || "No due date"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Added By */}
                <div className="bg-white border border-gray-200 rounded p-2 w-full">
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1">
                      <User size={13} className="text-blue-600" />
                      <h4 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
                        Added By :
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[13px] text-gray-900 items-end">
                      <span className="text-[13px] leading-none">
                        {task.added_by_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ongoing By */}
                <div className="bg-white border border-gray-200 rounded p-2 w-full">
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-orange-600" />
                      <h4 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
                        Ongoing By :
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[13px] text-gray-900 items-end">
                      <span className="text-[13px] leading-none">
                        {task.ongoing_by_name || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Followers */}
                {task.followers?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded w-full">
                    <div
                      className="flex justify-between items-center gap-1 p-2 "
                      onClick={() => {
                        setShowFollowers(!showFollowers);
                      }}
                    >
                      <h4 className="text-[13px] font-semibold text-gray-900 flex items-center gap-1 leading-none">
                        <Users size={13} className="text-green-600" />
                        Followers ({task.followers.length ?? 0})
                      </h4>
                      <button className="bg-blue-600 p-0.5 text-gray-100 rounded">
                        {showFollowers ? (
                          <ChevronDown size={15} />
                        ) : (
                          <ChevronUp size={15} />
                        )}
                      </button>
                    </div>
                    <div
                      className={`${
                        showFollowers
                          ? "hidden"
                          : "flex flex-col gap-3 max-h-[150px] overflow-y-auto bg-gray-100 p-2 m-2 mt-0"
                      }`}
                    >
                      {task.followers.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center gap-1"
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded leading-none flex items-center justify-center text-white text-[10px] font-medium">
                            {follower.name.charAt(0)}
                          </div>
                          <div className="flex items-center flex-wrap gap-2 text-[13px] text-gray-900">
                            <span className="text-[13px] leading-none">
                              {follower.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {task.fld_benchmark_name && (
                  <div className="bg-white border border-gray-200 rounded p-2 ">
                    <MilestoneInfo taskId={taskId} />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full flex p-3 gap-2">
              <div className="w-1/2 flex">
                <History taskId={taskId} />
              </div>
              <div className="w-1/2">
                <iframe
                  className=""
                  src={iframeSrc}
                  style={{
                    padding: "0px 10px 10px",
                    border: "1px solid #dbdbdb",
                    width: "100%",
                    height: "600px",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
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
            onClose={() => {
              setUpdateTaskModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
