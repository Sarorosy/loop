import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronsRightIcon, X } from "lucide-react";
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
    fetch("http://localhost:5000/api/helper/allbenchmarks")
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
      const res = await fetch(`http://localhost:5000/api/helper/bucket/update/${bucketData.id}`, {
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
        <h2 className="text-[16px] font-semibold">Edit Bucket</h2>
        <button
          className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
          onClick={onClose}>
            <X size={13} />
          </button>
      </div>

      <form className="p-4 space-y-4" >
        {/* Bucket Name */}
        <div>
          <label className="block text-[13px] font-medium">Bucket Name</label>
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
            <input type="checkbox" checked={fixedDescription} onChange={() => setFixedDescription(!fixedDescription)} />
            <span className="text-[13px]">Fixed Description</span>
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

        {/* Milestones */}
        <div>
          <label className="block text-[13px] font-medium mb-1">Select Milestones</label>
          <Select
            options={milestoneOptions}
            value={selectedMilestones}
            onChange={setSelectedMilestones}
            isMulti
            placeholder="Select Milestones..."
            className="text-[13px]"
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
            <span className="text-[13px]">Need Comments</span>
          </label>
        </div>

        {/* Error & Success */}
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        {successMsg && <p className="text-[13px] text-green-600">{successMsg}</p>}
        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-1.5 px-2 rounded hover:bg-blue-700 text-[11px] leading-none flex gap-1 items-center"
          >
            {loading ? "Updating..." : "Update Bucket"}<ChevronsRightIcon size={11} className="" />
          </button>
        </div>
      </form>
    </motion.div>
    </motion.div>
  );
}
