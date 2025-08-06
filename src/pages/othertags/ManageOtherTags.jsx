import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { EditIcon, Plus, RefreshCcw, Trash2 } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddOtherTags from "./AddOtherTags";
import EditOtherTags from "./EditOtherTags";
import SearchBar from "../../components/SearchBar";

export default function ManageOtherTags({ onClose }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://loopback-skci.onrender.com/api/helper/allothertags", {
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
      toast.error("No tag selected");
      return;
    }
    try {
      const response = await fetch(
        `https://loopback-skci.onrender.com/api/helper/othertags/delete/${selectedTag.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Tag deleted!");
        fetchTags();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete tag");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting tag");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Manage Other Tags</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={fetchTags}
          >
            <RefreshCcw size={11} className="" />
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={() => setAddOpen(true)}
          >
            Add<Plus size={11} className="" /> 
          </button>
        </div>
      </div>

      <div className="flex items-end justify-end gap-2 mt-2">
        <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by Category and Name"
      />
      </div>

      {/* Actions */}
      <div className="bg-white w-full f-13 pt-5">
        

        {/* Table */}
        {loading ? (
          <div className="flex justify-center">
          <p className="text-center text-[13px] text-gray-500 flex items-center gap-2 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f16639"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="infinity"
            >
              <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8" />
            </svg>
            Loading tags...
          </p>
          </div>
          
        ) : tags.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500">No tags found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] border border-gray-200">
              <thead className="bg-[#e4eaff]">
                <tr>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Category</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Tag Name</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Tag Type</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags
                 .filter((tag) =>
                    tag.category
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                     tag.tag_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) 
                  ).map((tag, idx) => (
                  <tr key={tag.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border border-[#ccc]">{tag.category}</td>
                    <td className="px-4 py-2 border border-[#ccc]">{tag.tag_name}</td>
                    <td className="px-4 py-2 border border-[#ccc]">{tag.tag_type}</td>
                    <td className="px-4 py-2 border border-[#ccc]">
                      <div className="flex items-center space-x-2">
                        <button
                          className="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedTag(tag);
                            setEditOpen(true);
                          }}
                        >
                          <EditIcon size={13} />
                        </button>
                        <button
                          className="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedTag(tag);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
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
          <AddOtherTags onClose={() => setAddOpen(false)} after={fetchTags} />
        )}
        {editOpen && (
          <EditOtherTags
            onClose={() => setEditOpen(false)}
            requirementData={selectedTag}
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
