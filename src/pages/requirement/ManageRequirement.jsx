import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddRequirement from "./AddRequirement";
import EditRequirement from "./EditRequirement";

export default function ManageRequirement({ onClose }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all requirements
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/helper/allrequirements", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status) {
        setRequirements(data.data);
      } else {
        toast.error(data.message || "Failed to fetch requirements");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleDelete = async () => {
    if (!selectedRequirement) {
      toast.error("Please select a requirement to delete");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/helper/requirement/delete/${selectedRequirement.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Requirement deleted!");
        fetchRequirements();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete requirement");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting requirement");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Manage Requirements</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
            onClick={fetchRequirements}
          >
            <RefreshCcw size={13} className="" /> Refresh
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={13} className="" /> Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white  border-t-2 border-blue-400 rounded w-full f-13 mt-5 p-1 pt-5">
        

        {/* Table */}
        {loading ? (
          <p className="text-center text-[13px] text-gray-500">Loading requirements...</p>
        ) : requirements.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500">No requirements found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Category</th>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((requirement, idx) => (
                  <tr key={requirement.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{requirement.category}</td>
                    <td className="px-4 py-2 border">{requirement.name}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center space-x-2">
                        <button
                          className="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedRequirement(requirement);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedRequirement(requirement);
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

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <AddRequirement
            onClose={() => setAddOpen(false)}
            after={fetchRequirements}
          />
        )}
        {editOpen && (
          <EditRequirement
            onClose={() => setEditOpen(false)}
            requirementData={selectedRequirement}
            onUpdate={fetchRequirements}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this requirement?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
