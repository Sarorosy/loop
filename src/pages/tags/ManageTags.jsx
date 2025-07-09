import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddTag from "./AddTag";
import EditTag from "./EditTag";

export default function ManageTags({ onClose }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/helper/alltags", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status) {
        setTags(data.data);
      } else {
        toast.error(data.message || "Failed to fetch tags");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async () => {
    if (!selectedTag) {
      toast.error("Please select a tag to delete");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/helper/tag/delete/${selectedTag?.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Deleted!");
        fetchTags();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting tag");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Tags</h2>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchTags}
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

        {/* Content */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No tags found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Tag Name</th>
                  <th className="px-4 py-2 text-left border">Created By</th>
                  <th className="px-4 py-2 text-left border">Created On</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, idx) => (
                  <tr key={tag.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{tag.tag_name}</td>
                    <td className="px-4 py-2 border">{tag.fld_first_name + " " + tag.fld_last_name}</td>
                    <td className="px-4 py-2 border">{tag.created_at}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center space-x-2">
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedTag(tag);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedTag(tag);
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
          <AddTag
            onClose={() => setAddOpen(false)}
            after={fetchTags}
          />
        )}
        {editOpen && (
          <EditTag
            onClose={() => setEditOpen(false)}
            tagData={selectedTag}
            onUpdate={fetchTags}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this tag?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
