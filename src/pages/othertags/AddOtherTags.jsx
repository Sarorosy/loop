import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

export default function AddOtherTags({ onClose, after }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PhD");
  const [tagType, setTagType] = useState("Primary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {user} = useAuth();


  const validateForm = () => {
    if (!name.trim()) return "Tag name is required.";
    if (!category) return "Category is required.";
    if (!tagType) return "Tag type is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/helper/othertags/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_name : name, category, tag_type : tagType, user_id: user?.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || "Failed to add tag");

      toast.success("Tag added successfully!");
      after();
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
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
      <div className="bg-gray-100 flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Add Tag</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form  className="p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="PhD">PhD</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tag Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Tag Name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tag Type</label>
          <select
            value={tagType}
            onChange={(e) => setTagType(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Adding..." : "Add Tag"}
        </button>
      </form>
    </motion.div>
  );
}
