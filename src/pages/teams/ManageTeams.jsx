import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, RefreshCcw, X } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddTeam from './AddTeam';
import EditTeam from './EditTeam';

export default function ManageTeams({ onClose }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddopen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all users

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/helper/allteams",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setTeams(data.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team to delete");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/helper/team/delete/${selectedTeam?.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Deleted!");
        fetchUsers();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "failed to delete");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    // <motion.div
    //   initial={{ x: "100%" }}
    //   animate={{ x: 0 }}
    //   exit={{ x: "100%" }}
    //   transition={{ duration: 0.3 }}
    //   className="fixed top-0 right-0 w-full h-full bg-white shadow-lg z-50 overflow-y-auto"
    // >
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Teams</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchUsers}
          >
            <RefreshCcw size={14} className="mr-1" /> Refresh
          </button>
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={() => {
              setAddopen(true);
            }}
          >
            <Plus size={14} className="mr-1" /> Add
          </button>
        </div>
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No teams found.</p>
        ) : (
          <div className="overflow-x-auto">
           <table className="min-w-full text-sm border border-gray-200">
  <thead className="bg-gray-100">
    <tr>
      <th className="px-4 py-2 text-left border">Team Name</th>
      <th className="px-4 py-2 text-left border">Team Members</th>
      <th className="px-4 py-2 text-left border">Created By</th>
      <th className="px-4 py-2 text-left border">Added On</th>
      <th className="px-4 py-2 text-left border">Actions</th>
    </tr>
  </thead>
  <tbody className="f-12">
    {teams.map((team, idx) => (
      <tr key={team.id || idx} className="border-t hover:bg-gray-50">
        <td className="px-4 py-2 border">{team.team_name}</td>
        <td className="px-4 py-2 border">
          {team.team_members_details?.join(", ") || "No Members"}
        </td>
        <td className="px-4 py-2 border">{team.created_by_name}</td>
        <td className="px-4 py-2 border">{team.created_on}</td>
        <td className="px-4 py-2 border">
          <div className="flex items-center space-x-2">
            <button
              className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
              onClick={() => {
                setSelectedTeam(team);
                setEditOpen(true);
              }}
            >
              Edit
            </button>
            <button
              className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
              onClick={() => {
                setSelectedTeam(team);
                setDeleteOpen(true);
              }}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        )}
      </div>
      <AnimatePresence>
        {addOpen && (
          <AddTeam
            onClose={() => {
              setAddopen(false);
            }}
            after={fetchUsers}
          />
        )}
        {editOpen && (
          <EditTeam
            onClose={() => {
              setEditOpen(false);
            }}
            teamData={selectedTeam}
            onUpdate={fetchUsers}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure want to delete?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => {
              setDeleteOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      {/* </motion.div> */}
    </div>
  );
}
