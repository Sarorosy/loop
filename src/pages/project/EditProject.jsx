import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProject({ onClose, projectData, onUpdate }) {
  const [projectName, setProjectName] = useState("");
  const [requireEmail, setRequireEmail] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form with existing project data
  useEffect(() => {
    if (projectData) {
      setProjectName(projectData.fld_project_name || "");
      setRequireEmail(projectData.require_email == 1);
      setEmailId(projectData.email_id || "");
    }
  }, [projectData]);

  const validateForm = () => {
    if (!projectName.trim()) {
      return "Project name is required.";
    }
    if (requireEmail && !emailId.trim()) {
      return "Email is required when 'Require Email' is checked.";
    }
    if (requireEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
      return "Please enter a valid email address.";
    }
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
      const res = await fetch(`https://loopback-r9kf.onrender.com/api/helper/project/update/${projectData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          require_email: requireEmail ? 1 : 0,
          email_id: requireEmail ? emailId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Project updated successfully!");
      onUpdate();
      setTimeout(() => onClose(), 800);
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
      <div className="flex items-center justify-between p-4 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Edit Project</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form  className="p-4 space-y-4">
        <div>
          <label className="block text-[13px] mb-1">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={requireEmail}
            onChange={(e) => setRequireEmail(e.target.checked)}
          />
          <label className="text-[13px]">Require Email</label>
        </div>

        {requireEmail && (
          <div>
            <label className="block text-[13px] mb-1">Email</label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
              required={requireEmail}
            />
          </div>
        )}

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <div className="text-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 text-[13px] leading-none"
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
