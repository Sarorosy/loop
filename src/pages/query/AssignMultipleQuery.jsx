import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useAuth } from "../../utils/idb";

const AssignMultipleQuery = ({ queries, onClose, after }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd

  console.log(queries);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://loopback-n3to.onrender.com/api/users/all");
        const data = await res.json();
        if (res.ok) {
          const options =
            data?.data?.map((user) => ({
              label: `${user.fld_first_name} ${user.fld_last_name} - ${user.fld_email}`,
              value: user.id,
            })) || [];
          setUsers(options);
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

  // Fetch teams when user changes
  useEffect(() => {
    if (!selectedUser) {
      setTeams([]);
      return;
    }
    setSelectedTeam(null);
    setFollowers([]);

    const fetchTeams = async () => {
      try {
        const res = await fetch("https://loopback-n3to.onrender.com/api/helper/myteams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: selectedUser.value }),
        });
        const data = await res.json();

        if (res.ok) {
          const teamOptions =
            data?.data?.map((team) => ({
              label: team.team_name,
              value: team.id,
              team_members: team.team_members,
            })) || [];
          setTeams(teamOptions);
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

  const handleSubmit = async () => {
    if (!selectedUser) return toast.error("Please select a user");
    if (!dueDate) return toast.error("Please select a due date");

    const assignTasks = async () => {
      for (const query of queries) {
        const title = `${query.assign_id}_${query.name}`;
        const description = `Email: ${query.email_id}\nWebsite: ${
          query.website
        }\nClient Name: ${query.name}\nRequirement: ${
          query.requirement_line === 1
            ? query.line_format
            : query.paragraph_format
        }`;

        const response = await fetch(
          "https://loopback-n3to.onrender.com/api/helper/assignTask",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user?.id,
              user_type: user?.fld_admin_type,
              user_name: `${user?.fld_first_name} ${user?.fld_last_name}`,
              assign_to: selectedUser.value,
              team: selectedTeam ? selectedTeam.value : null,
              followers,
              due_date: dueDate,
              title,
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

        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.message || `Failed to assign task for query ${query.assign_id}`
          );
      }
    };

    toast
      .promise(assignTasks(), {
        loading: "Assigning queries...",
        success: "All queries assigned successfully",
        error: (err) => err.message || "Failed to assign queries",
      })
      .then(() => {
        onClose();
        after(); 
      })
      .catch(console.error);
  };

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <h2 className="text-xl font-semibold mb-4">Assign Multiple Queries</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1">Assign To</label>
            <Select
              options={users}
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder="Select User"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1">
              Team (optional)
            </label>
            <Select
              options={teams}
              value={selectedTeam}
              onChange={(selected) => {
                setSelectedTeam(selected);
                setFollowers(
                  selected?.team_members
                    ? selected.team_members
                        .split(",")
                        .map((member) => member.trim())
                    : []
                );
              }}
              placeholder="Select Team"
              isClearable
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Assign All
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignMultipleQuery;
