import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/idb";
import toast from "react-hot-toast";
import TaskDetails from "./TaskDetails";
import { AnimatePresence } from "framer-motion";
import { RefreshCcw, UserRound } from "lucide-react";
import moment from "moment";
import TaskLoader from "../utils/TaskLoader";
import { motion } from "framer-motion";
import DirectTaskDetailsModal from "./DirectTaskDetailsModal";

function DirectTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Separate function outside the component
  const fetchTasks = async (user, setTasks, setLoading) => {
    //if (!user) return;

    setLoading(true);
    try {
      const res = await fetch("https://loopback-skci.onrender.com/api/direct/tasks", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });
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

  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const handleViewButtonClick = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const [reminderOpen, setReminderOpen] = useState(false);

  const resetFilters = () => {
    fetchTasks(user, setTasks, setLoading);
  };

  const openModal = (id) => {
    setSelectedTask(id);
    setDetailsOpen(true)
  };

  return (
    <div className="">
      <div className="text-xl font-bold mb-4 flex items-center justify-between">
        <h2 class="text-[16px] font-semibold">Direct Tasks</h2>
        <div className="flex gap-3">
          <button
            onClick={resetFilters}
            className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
          >
            <RefreshCcw size={11} className="text-gray-700" />
          </button>
        </div>
      </div>

      {loading ? (
        <div>
          <TaskLoader rows={10} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-2 text-gray-500 bg-red-50 ">
          No tasks found.
        </div>
      ) : (
        <div className="bg-white w-full f-13 mt-5">
          <div className="table-scrollable">
            <div className=" rounded shadow border border-gray-200">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-200 text-black text-sm">
                  <tr>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Body</th>
                    <th className="p-2 text-center">Attachments</th>
                    <th className="p-2 text-center">Received At</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {tasks.length > 0 ? (
                    tasks.map((task) => {
                      const titleWords = task.subject.split(" ");
                      const bodyWords = task.body.split(" ");
                      const hasAttachments = task.attachments !== "[]";
                      const hasProject = !!task.project_id;

                      return (
                        <tr
                          key={task.id}
                          className="border-b hover:bg-gray-100"
                        >
                          <td className="p-2">
                            {titleWords.slice(0, 10).join(" ")}
                            {titleWords.length > 10 ? "..." : ""}
                          </td>
                          <td className="p-2 max-w-xs truncate">
                            {bodyWords.slice(0, 15).join(" ")}
                            {bodyWords.length > 15 ? "..." : ""}
                          </td>
                          <td className="p-2 text-center space-x-1">
                            {hasAttachments ? (
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                                Has Attachments
                              </span>
                            ) : (
                              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                                No Attachments
                              </span>
                            )}
                            {hasProject && (
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                                Has Project
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {moment(task.received_at).format(
                              "DD MMM YYYY, hh:mm A"
                            )}
                          </td>
                          <td className="p-2 text-center space-x-2">
                            <div
                              className="relative inline-block"
                              onMouseEnter={() => setHoveredTaskId(task.id)}
                              onMouseLeave={() => setHoveredTaskId(null)}
                            >
                              <button className="text-blue-600 hover:text-blue-800">
                                <UserRound size={20} />
                              </button>

                              <AnimatePresence>
                                {hoveredTaskId === task.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-2 z-10 bg-white shadow-lg border p-3 rounded text-left text-xs w-auto"
                                  >
                                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mb-2">
                                      {task.fromname?.[0]?.toUpperCase()}
                                    </div>
                                    <p>
                                      <strong>{task.fromname}</strong>
                                    </p>
                                    <p>{task.fromemail}</p>
                                    <p>
                                      <span className="text-gray-500">To:</span>{" "}
                                      {task.toemail}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* View & Assign Button */}
                            <button
                              onClick={() =>
                                openModal(task.id)
                              }
                              className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
                            >
                              View & Assign
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-red-500 p-4">
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {detailsOpen && selectedTask && (
          <DirectTaskDetailsModal 
          taskId={selectedTask}
          onClose={()=>{setDetailsOpen(false)}}
          finalFunction={()=>{fetchTasks(user, setTasks, setLoading);}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default DirectTasks;
