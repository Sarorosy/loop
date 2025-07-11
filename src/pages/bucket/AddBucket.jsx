// Add this in your import section
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

export default function AddBucket({ onClose, after }) {
  const [bucketName, setBucketName] = useState("");
  const [fixedDescription, setFixedDescription] = useState(false);
  const [bucketDescription, setBucketDescription] = useState("");
  const [fixedMilestones, setFixedMilestones] = useState(false); // <-- new state
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [needComments, setNeedComments] = useState(false);

  const {user} = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("https://loopback-r9kf.onrender.com/api/helper/allbenchmarks")
      .then(res => res.json())
      .then(data => setMilestones(data.data))
      .catch(err => console.error("Failed to fetch milestones", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!bucketName) {
      toast.error("Enter Bucket Name");
      setLoading(false);
      return;
    }

    if (fixedDescription && !bucketDescription) {
      toast.error("Pls enter description");
      setLoading(false);
      return;
    }
    if(fixedMilestones && selectedMilestones.length == 0){
      toast.error("Pls select atleast one milestone");
      return;
    }

    try {
      const res = await fetch(`https://loopback-r9kf.onrender.com/api/helper/bucket/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fld_added_by : user?.id,
          fld_bucket_name: bucketName,
          fld_default_description: fixedDescription ? bucketDescription : "",
          fld_default_benchmark: fixedMilestones ? selectedMilestones.map(opt => opt.value).join(",") : "",
          need_comments: needComments ? 1 : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Adding failed");

      setSuccessMsg("Bucket added successfully!");
      after();
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const milestoneOptions = milestones.map(m => ({
    value: m.id,
    label: m.fld_benchmark_name,
  }));

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Add Bucket</h2>
        <button onClick={onClose}><X size={20} /></button>
      </div>

      <form className="p-4 space-y-4">
        {/* Bucket Name */}
        <div>
          <label className="block text-sm font-medium">Bucket Name</label>
          <input
            type="text"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600 mt-1"
          />
        </div>

        {/* Fixed Description */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fixedDescription}
              onChange={() => setFixedDescription(!fixedDescription)}
            />
            <span className="text-sm">Fixed Description</span>
          </label>
          {fixedDescription && (
            <textarea
              value={bucketDescription}
              onChange={(e) => setBucketDescription(e.target.value)}
              rows={4}
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600 mt-1"
            />
          )}
        </div>

        {/* Fixed Milestones */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fixedMilestones}
              onChange={() => setFixedMilestones(!fixedMilestones)}
            />
            <span className="text-sm">Fixed Milestones</span>
          </label>
          {fixedMilestones && (
            <div className="mt-2">
              <Select
                options={milestoneOptions}
                value={selectedMilestones}
                onChange={setSelectedMilestones}
                isMulti
                placeholder="Select Milestones..."
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Need Comments */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needComments}
              onChange={() => setNeedComments(!needComments)}
            />
            <span className="text-sm">Need Comments</span>
          </label>
        </div>

        {/* Error & Success */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
        <div className="text-end">
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 text-[13px] leading-none"
        >
          {loading ? "Adding..." : "Add Bucket"}
        </button>
        </div>
      </form>
    </motion.div>
  );
}
