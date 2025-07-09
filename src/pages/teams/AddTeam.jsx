import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Select from "react-select";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";

export default function AddTeam({ onClose, after }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]); // selected member ids as array
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const {user} = useAuth();

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

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if(!teamName){
      toast.error("Enter Team name!");
      return;
    }
    if(members.length == 0){
      toast.error("Please select atleast one user");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/helper/team/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: teamName,
          team_members: members.join(","),
          created_by : user?.id ?? 1
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccessMsg("Team updated successfully!");
      after(); // refresh the list
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
      className="fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="bg-gray-100 flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Add Team</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form className="p-4 space-y-4" >
        <div>
          <label className="block text-sm mb-1">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Team Members</label>
          <Select
            isMulti
            options={allUsers}
            value={allUsers.filter((user) => members.includes(user.value))}
            onChange={(selected) => setMembers(selected.map((u) => u.value))}
            className="text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Updating..." : "Update Team"}
        </button>
      </form>
    </motion.div>
  );
}
