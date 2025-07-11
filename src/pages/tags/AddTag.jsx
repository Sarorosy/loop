import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../../utils/idb";

export default function AddTag({ onClose, after }) {
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const {user} = useAuth();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`http://localhost:5000/api/helper/tag/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag_name: tagName,
          created_by : user?.id
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Adding failed");

      setSuccessMsg("Tag Added successfully!");
      after();
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
      className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Add Tag</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form className="p-4 space-y-4" o>
        <div>
          <label className="block text-sm mb-1">Tag Name</label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
        <div className="text-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 text-[13px] leading-none"
          >
            {loading ? "Adding..." : "Add Tag"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
