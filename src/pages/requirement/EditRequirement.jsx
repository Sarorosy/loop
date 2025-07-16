import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronsRightIcon, X } from "lucide-react";
import toast from "react-hot-toast";

export default function EditRequirement({ onClose, requirementData, onUpdate }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PhD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form with existing requirement data
  useEffect(() => {
    if (requirementData) {
      setName(requirementData.name || "");
      setCategory(requirementData.category || "PhD");
    }
  }, [requirementData]);

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
      const res = await fetch(`http://localhost:5000/api/helper/requirement/update/${requirementData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || "Update failed");

      toast.success("Requirement updated successfully!");
      onUpdate();
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000c2] flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto"
      >
      <div className="flex items-center justify-between px-4 py-3 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Edit Requirement</h2>
        <button
          className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
          onClick={onClose}>
            <X size={13} />
          </button>
      </div>

      <form className="p-4 space-y-4">
        <div>
          <label className="block text-[13px] mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          >
            <option value="PhD">PhD</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div>
          <label className="block text-[13px] mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
            placeholder="Requirement Name"
          />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-1.5 px-2 rounded hover:bg-blue-700 text-[11px] leading-none flex gap-1 items-center"
          >
            {loading ? "Updating..." : "Update Requirement"}<ChevronsRightIcon size={11} className="" />
          </button>
        </div>
      </form>
    </motion.div>
    </motion.div>
  );
}
