import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import { X } from "lucide-react";

const AssignQuery = ({ query, onClose }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]); // currently empty
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [taskTitle, setTaskTitle] = useState(
    `${query.assign_id}_${query.name}`
  );
  const [description, setDescription] = useState(
    `Email: ${query.email_id}\nWebsite: ${query.website}\nClient Name: ${
      query.name
    }\nRequirement: ${
      query.requirement_line === 1 ? query.line_format : query.paragraph_format
    }`
  );

  // Fetch Users on Mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://loopback-skci.onrender.com/api/users/all"
        );
        const data = await res.json();
        if (res.ok) {
          const userOptions =
            data?.data?.map((user) => ({
              label:
                user.fld_first_name +
                " " +
                user.fld_last_name +
                " - " +
                user.fld_email,
              value: user.id,
            })) || [];
          setUsers(userOptions);
        } else {
          toast.error(data.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching users");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setTeams([]);
      return;
    }
    setSelectedTeam(null);
    setFollowers([]);

    const fetchTeams = async () => {
      try {
        const res = await fetch(
          "https://loopback-skci.onrender.com/api/helper/myteams",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: selectedUser.value }),
          }
        );
        const data = await res.json();

        if (res.ok) {
          if (Array.isArray(data.data) && data.data.length > 0) {
            const teamOptions = data.data.map((team) => ({
              label: team.team_name,
              value: team.id,
              team_members: team.team_members,
            }));
            setTeams(teamOptions);
          } else {
            setTeams([]);
            toast.error("No teams found for this user");
          }
        } else {
          toast.error(data.message || "Failed to fetch teams");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching teams");
      }
    };

    fetchTeams();
  }, [selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple Validation
    if (!selectedUser) return toast.error("Please select a user");
    if (!dueDate) return toast.error("Please select a due date");
    if (!taskTitle.trim()) return toast.error("Please enter a task title");
    if (!description.trim()) return toast.error("Please enter a description");

    try {
      const res = await fetch(
        "https://loopback-skci.onrender.com/api/helper/assignTask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.id,
            user_type: user?.fld_admin_type,
            user_name: user?.fld_first_name + " " + user?.fld_last_name,
            assign_to: selectedUser.value,
            team: selectedTeam ? selectedTeam.value : null,
            followers,
            due_date: dueDate,
            title: taskTitle,
            description,
            query_id: query.assign_id,
            bucket_name: 55,
            task_type: "crm_query",
            isquerytask: 1,
            recurring_tasks: "No",
            benchmarks: [67, 54, 55, 16, 59, 10, 58, 57, 56, 27, 28],
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Task assigned successfully");
        onClose();
      } else {
        toast.error(data.message || "Failed to assign task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assigning task");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Assign Query</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
          >
            <X size={13} />
          </button>
        </div>
        <div className="p-4">
          <form className="space-y-4 h-xl max-h-xl overflow-y-auto">
            <div>
              <label className="block text-[13px] font-medium mb-1">
                Assign To
              </label>
              <Select
                options={users}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Select User"
                className="text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1">
                Team (optional)
              </label>
              <Select
                options={teams}
                className="text-[13px]"
                value={selectedTeam}
                onChange={(selected) => {
                  setSelectedTeam(selected);
                  if (selected && selected.team_members) {
                    const membersArray = selected.team_members
                      .split(",")
                      .map((member) => member.trim());
                    setFollowers(membersArray);

                    console.log("Selected Team:", selected);
                    console.log("Followers:", membersArray);
                  } else {
                    setFollowers([]);
                    console.log("No team selected or no members found.");
                  }
                }}
                placeholder="Select Team"
                isClearable
              />
            </div>

            <div className="flex items-center justify-between space-x-1">
              <div className="w-full">
                <label className="block text-[13px] font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                />
              </div>

              <div className="w-full">
                <label className="block text-[13px] font-medium mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-600 text-white py-1.5 px-2 rounded hover:bg-blue-700 text-[11px] leading-none flex gap-1 items-center"
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignQuery;
