import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function AddRequirement({ onClose, after }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PhD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

  const validateForm = () => {
    if (!name.trim()) return "Name is required.";
    if (!category) return "Category is required.";
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
      const res = await fetch(`http://localhost:5000/api/helper/requirement/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || "Add failed");

      toast.success("Requirement Added successfully!");
      after();
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
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
      <div className="bg-gray-100 flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Add Requirement</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form className="p-4 space-y-4">
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
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Requirement Name"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Adding..." : "Add Requirement"}
        </button>
      </form>
    </motion.div>
  );
}
