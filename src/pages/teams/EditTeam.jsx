import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Select from "react-select";

export default function EditTeam({ onClose, teamData, onUpdate }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]); // selected member ids as array
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/all", {
          method: "GET",
          headers: { "Content-type": "application/json" },
        });
        const data = await response.json();
        if (response.ok) {
          setAllUsers(
            data.data.map((user) => ({
              value: user.id,
              label: `${user.fld_first_name} ${user.fld_last_name}`,
            }))
          );
        } else {
          throw new Error(data.message || "Failed to load users");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // Pre-fill form with team data
  useEffect(() => {
    if (teamData) {
      setTeamName(teamData.team_name || "");
      setMembers(
        (teamData.team_members || "")
          .split(",")
          .filter((id) => id)
          .map((id) => parseInt(id))
      );
    }
  }, [teamData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`http://localhost:5000/api/helper/team/update/${teamData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: teamName,
          team_members: members.join(","),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccessMsg("Team updated successfully!");
      onUpdate(); // refresh the list
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Edit Team</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form className="p-4 space-y-4" >
        <div>
          <label className="block text-[13px] mb-1">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-[13px] mb-1">Team Members</label>
          <Select
            isMulti
            options={allUsers}
            value={allUsers.filter((user) => members.includes(user.value))}
            onChange={(selected) => setMembers(selected.map((u) => u.value))}
            className="text-[13px]"
          />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        {successMsg && <p className="text-[13px] text-green-600">{successMsg}</p>}

        <div className="text-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 text-[13px] leading-none"
          >
            {loading ? "Updating..." : "Update Team"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
