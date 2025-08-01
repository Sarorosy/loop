import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CheckCircle, X } from "lucide-react";
import Select from "react-select";

const DirectTaskDetailsModal = ({ taskId, onClose, finalFunction }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [buckets, setBuckets] = useState([]);

  const [assignedTo, setAssignedTo] = useState("");
  const [follower, setFollower] = useState([]);
  const [bucketName, setBucketName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [projectDisabled, setProjectDisabled] = useState(false)

  // Fetch task, users, buckets, projects
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const res = await fetch(
          `https://loopback-skci.onrender.com/api/direct/task/${taskId}`
        );
        const data = await res.json();
        if (data.status) setTask(data.data);
        else toast.error(data.message || "Failed to fetch task");
      } catch (err) {
        toast.error("Error fetching task");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      const res = await fetch(`https://loopback-skci.onrender.com/api/users/allusers`);
      const data = await res.json();
      if (data.status) setUsers(data.data);
    };

    const fetchProjects = async () => {
      const res = await fetch(`https://loopback-skci.onrender.com/api/helper/allprojects`);
      const data = await res.json();
      if (data.status) setProjects(data.data);
    };

    const fetchBuckets = async () => {
      const res = await fetch(`https://loopback-skci.onrender.com/api/helper/allbuckets`);
      const data = await res.json();
      if (data.status) setBuckets(data.data);
    };

    fetchTaskDetails();
    fetchUsers();
    fetchProjects();
    fetchBuckets();
  }, [taskId]);

  useEffect(()=>{
    if(task && task.project_id){
        setProjectName(task.project_id);
        setProjectDisabled(true);
    }
  },[task])

  const handleAssignSubmit = async () => {
    if(!assignedTo){
        toast.error("Please select a user to assign");
        return;
    }

    if(!bucketName){
        toast.error("Please select a bucket to assign");
        return;
    }
    if(!projectName){
        toast.error("Please select a project to assign");
        return;
    }

    
    try {
      const res = await fetch(`https://loopback-skci.onrender.com/api/direct/task/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          assigned_to: assignedTo,
          follower,
          bucket_name: bucketName,
          project_name: projectName,
          due_date: dueDate,
          due_time: dueTime,
        }),
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Task Assigned");
        finalFunction();
        onClose();
      } else toast.error(data.message || "Assignment failed");
    } catch (err) {
      toast.error("Error assigning task");
      console.error(err);
    }
  };

  if (!task || loading) {
    return (
      <div className="fixed inset-0 bg-[#0000005c] flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow ">Loading...</div>
      </div>
    );
  }

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.fld_first_name} ${u.fld_last_name}`,
  }));

  const followerOptions = users.map((u) => ({
    value: u.id,
    label: `${u.fld_first_name} ${u.fld_last_name}`,
  }));

  const bucketOptions = buckets.map((b) => ({
    value: b.id,
    label: b.fld_bucket_name,
  }));

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.fld_project_name,
  }));

  return (
    <div className="fixed inset-0 bg-[#0000005c] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3 }}
        className="bg-white text-black rounded shadow-xl w-full max-w-2xl mx-4"
      >
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
            <h2 className="text-[15px] font-semibold text-white">View & Assign </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
            >
              <X size={13} />
            </button>
          </div>
          <div className="p-4 text-[13px]">
        

        {/* Tabs */}
        <div className="flex gap-1 font-medium">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-4 py-2 rounded-t leading-none ${
              activeTab === "view"
                ? "text-white  bg-orange-600"
                : "text-gray-500 hover:bg-orange-200 hover:text-black"
            }`}
          >
            View
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-4 py-2 rounded-t leading-none ${
              activeTab === "assign"
                ? "text-white  bg-orange-600"
                : "text-gray-500 hover:bg-orange-200 hover:text-black"
            }`}
          >
            Assign
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "view" && (
          <div className="space-y-3 p-4 border border-orange-600">
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-semibold">Subject:</div> {task.subject}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-semibold">Body:</div>
              <div
                className=""
                dangerouslySetInnerHTML={{ __html: task.body }}
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-semibold">From:</div> {task.fromname} ({task.fromemail})
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-semibold">To:</div> {task.toemail}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-semibold">Project:</div> {task.fld_project_name || "N/A"}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="font-semibold">Received:</div>{" "}
              {new Date(task.received_at).toLocaleString()}
            </div>
          </div>
        )}

        {activeTab === "assign" && (
          <div className="space-y-4 p-4 border border-orange-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Assign To</label>
                <Select
                  classNamePrefix="task-filter"
                  options={userOptions}
                  value={
                    userOptions.find((opt) => opt.value === assignedTo) || null
                  }
                  onChange={(selectedOption) =>
                    setAssignedTo(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Select User"
                />
              </div>

              <div>
                <label>Follower</label>
                <Select
                  classNamePrefix="task-filter"
                  isMulti
                  options={followerOptions}
                  value={followerOptions.filter((opt) =>
                    follower.includes(opt.value)
                  )}
                  onChange={(selectedOptions) =>
                    setFollower(
                      selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : []
                    )
                  }
                  placeholder="Select Followers"
                />
              </div>

              <div>
                <label>Bucket Name</label>
                <Select
                  classNamePrefix="task-filter"
                  options={bucketOptions}
                  value={
                    bucketOptions.find((opt) => opt.value === bucketName) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    setBucketName(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Select Bucket"
                />
              </div>

              <div>
                <label>Project Name</label>
                <Select
                  classNamePrefix="task-filter"
                  options={projectOptions}
                  isDisabled={projectDisabled}
                  value={
                    projectOptions.find((opt) => opt.value === projectName) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    setProjectName(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Select Project"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-2 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                />
              </div>
              <div>
                <label>Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-2 py-2 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAssignSubmit}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center"
              >
                Assign Task <CheckCircle size={13} className="ml-1" />
              </button>
            </div>
          </div>
        )}
         </div>
      </motion.div>
    </div>
  );
};

export default DirectTaskDetailsModal;
