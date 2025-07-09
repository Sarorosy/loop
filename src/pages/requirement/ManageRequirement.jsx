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
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Requirements</h2>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchRequirements}
          >
            <RefreshCcw size={14} className="mr-1" /> Refresh
          </button>
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} className="mr-1" /> Add
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading requirements...</p>
        ) : requirements.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No requirements found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
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
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedRequirement(requirement);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
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
