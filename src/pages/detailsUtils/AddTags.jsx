import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

export default function AddTags({ taskId, tags = [], onClose, after }) {
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const {user} = useAuth();
  // console.log(tags)
  // Fetch all tags from the server
  const fetchTags = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/helper/alltags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        setAllTags(data.data);
      } else {
        toast.error("Failed to fetch tags");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching tags");
    }
  };

  useEffect(() => {
    const loadTags = async () => {
      await fetchTags();
    };
    loadTags();
  }, []);

  // Populate pre-selected tags after fetching all tags
  useEffect(() => {
    const preselected = allTags
      .filter((tag) => tags.includes(String(tag.id)) || tags.includes(tag.id))
      .map((tag) => ({
        value: tag.id,
        label: tag.tag_name,
      }));
    setSelectedTags(preselected);
  }, [allTags, tags]);

  const handleSave = async () => {
    const tagIds = selectedTags.map((t) => t.value);
    console.log("Saving tags for task:", taskId, tagIds);

    try {
      const response = await fetch(
        "http://localhost:5000/api/helper/updateTags", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId, tagIds, user_id : user?.id, sender_name : user?.fld_first_name + " " + user?.fld_last_name }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Tags saved");
        after(data);
        onClose();
      } else {
        toast.error(data.message || "Error while saving tags");
      }
    } catch (error) {
      console.error("Error saving tags:", error);
      toast.error("Error while saving tags");
    }
  };

  const options = allTags.map((tag) => ({
    value: tag.id,
    label: tag.tag_name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Add Tags</h2>
          {/* Close Button */}
          <button
            className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
            onClick={onClose}
          >
            <X size={11} className="" />
          </button>

        </div>
        <div className="p-4">

        {/* Select */}
        <Select
          isMulti
          value={selectedTags}
          onChange={(selected) => setSelectedTags(selected)}
          options={options}
          className="mb-4 text-[13px]"
          placeholder="Select tags..."
        />

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          
          <button
            onClick={handleSave}
            className="px-2 py-1 text-[13px] rounded bg-green-600 text-white hover:bg-green-700 leading-none"
          >
            Save
          </button>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
