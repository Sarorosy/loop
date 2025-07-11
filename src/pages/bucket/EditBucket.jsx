import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Select from "react-select";

export default function EditBucket({ onClose, bucketData, onUpdate }) {
  const [bucketName, setBucketName] = useState("");
  const [fixedDescription, setFixedDescription] = useState(false);
  const [bucketDescription, setBucketDescription] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [needComments, setNeedComments] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all milestones
  useEffect(() => {
    fetch("https://loopback-r9kf.onrender.com/api/helper/allbenchmarks")
      .then(res => res.json())
      .then(data => setMilestones(data.data))
      .catch(err => console.error("Failed to fetch milestones", err));
  }, []);

  // Pre-fill form data
  useEffect(() => {
    if (bucketData) {
      setBucketName(bucketData.fld_bucket_name || "");
      setBucketDescription(bucketData.fld_default_description || "");
      setNeedComments(!!bucketData.need_comments);
      setFixedDescription(!!bucketData.fld_default_description);

      const defaultBenchmarkIds = bucketData.fld_default_benchmark
        ? bucketData.fld_default_benchmark.split(",").map(id => parseInt(id))
        : [];
      const defaultMilestoneOptions = milestones
        .filter(m => defaultBenchmarkIds.includes(m.id))
        .map(m => ({ value: m.id, label: m.fld_benchmark_name }));

      setSelectedMilestones(defaultMilestoneOptions);
    }
  }, [bucketData, milestones]);

//   useEffect(()=>{
//     console.log(mile)
//   })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`https://loopback-r9kf.onrender.com/api/helper/bucket/update/${bucketData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fld_bucket_name: bucketName,
          fld_default_description: fixedDescription ? bucketDescription : "",
          fld_default_benchmark: selectedMilestones.map(opt => opt.value).join(","),
          need_comments: needComments ? 1 : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccessMsg("Bucket updated successfully!");
      onUpdate();
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
      className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 overflow-y-auto"
    >
      <div className="bg-gray-100 flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Edit Bucket</h2>
        <button onClick={onClose}><X size={20} /></button>
      </div>

      <form className="p-4 space-y-4" >
        {/* Bucket Name */}
        <div>
          <label className="block text-sm font-medium">Bucket Name</label>
          <input
            type="text"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mt-1"
          />
        </div>

        {/* Fixed Description */}
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fixedDescription} onChange={() => setFixedDescription(!fixedDescription)} />
            <span className="text-sm">Fixed Description</span>
          </label>
          {fixedDescription && (
            <textarea
              value={bucketDescription}
              onChange={(e) => setBucketDescription(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          )}
        </div>

        {/* Milestones */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Milestones</label>
          <Select
            options={milestoneOptions}
            value={selectedMilestones}
            onChange={setSelectedMilestones}
            isMulti
            placeholder="Select Milestones..."
            className="text-sm"
          />
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

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Updating..." : "Update Bucket"}
        </button>
      </form>
    </motion.div>
  );
}
