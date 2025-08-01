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
      <div className="font-bold mb-4 flex items-center justify-between">
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
        <div className="bg-white w-full f-13">
          <div className="overflow-x-auto h-screen">
            <div className=" rounded shadow border border-gray-200">
              <table className="min-w-full text-[13px] ">
                <thead className="bg-[#e4eaff]">
                  <tr>
                    <th className="px-4 py-2 text-left border border-[#ccc]">Title</th>
                    <th className="px-4 py-2 text-left border border-[#ccc]">Body</th>
                    <th className="px-4 py-2 text-left border border-[#ccc]">Attachments</th>
                    <th className="px-4 py-2 text-left border border-[#ccc]">Received At</th>
                    <th className="px-4 py-2 text-left border border-[#ccc]">Action</th>
                  </tr>
                </thead>
                <tbody className="">
                  {tasks.length > 0 ? (
                    tasks.map((task) => {
                      const titleWords = task.subject.split(" ");
                      const bodyWords = task.body.split(" ");
                      const hasAttachments = task.attachments !== "[]";
                      const hasProject = !!task.project_id;

                      return (
                        <tr
                          key={task.id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 border border-[#ccc]">
                            {titleWords.slice(0, 10).join(" ")}
                            {titleWords.length > 10 ? "..." : ""}
                          </td>
                          <td className="px-4 py-2 border border-[#ccc] max-w-xs truncate">
                            {bodyWords.slice(0, 15).join(" ")}
                            {bodyWords.length > 15 ? "..." : ""}
                          </td>
                          <td className="px-4 py-2 border border-[#ccc] space-x-1">
                            {hasAttachments ? (
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-[11px]">
                                Has Attachments
                              </span>
                            ) : (
                              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-[11px]">
                                No Attachments
                              </span>
                            )}
                            {hasProject && (
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-[11px]">
                                Has Project
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-left border border-[#ccc]">
                            {moment(task.received_at).format(
                              "DD MMM YYYY, hh:mm A"
                            )}
                          </td>
                          <td className="px-4 py-2 border border-[#ccc] text-center space-x-2 relative">
                            <div className="flex gap-1">
                            <div
                              className="inline-block"
                              onMouseEnter={() => setHoveredTaskId(task.id)}
                              onMouseLeave={() => setHoveredTaskId(null)}
                            >
                              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1">
                                <UserRound size={11} />
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
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[11px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
                            >
                              View & Assign
                            </button>
                            </div>
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
