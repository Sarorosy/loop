import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";

export default function UpdateTaskProgress({ taskId, task, onClose, after }) {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(
    task.completedBenchmarks || []
  );
  const [remarks, setRemarks] = useState("");
  const [benchmarks, setBenchmarks] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        const res = await fetch(
          "https://loopback-skci.onrender.com/api/helper/allbenchmarks"
        ); // replace with your API endpoint
        const data = await res.json();
        if (data.status) {
          setBenchmarks(data.data); // assuming API returns [{id: 16, name: "Initial Review"}, ...]
        }
      } catch (err) {
        console.error("Error fetching benchmarks", err);
      }
    };

    fetchBenchmarks();
  }, []);

  const getBenchmarkName = (benchmarkId) => {
    return (
      benchmarks.find((b) => b.id == benchmarkId)?.fld_benchmark_name ||
      `Benchmark ${benchmarkId}`
    );
  };

  const handleCheckboxChange = (benchmark) => {
    if (task && task.task_tag == null) {
      toast.error("Please add at least one tag before selecting.");
      return;
    }
    if (selectedBenchmarks.includes(benchmark)) {
      setSelectedBenchmarks(
        selectedBenchmarks.filter((id) => id !== benchmark)
      );
    } else {
      setSelectedBenchmarks([...selectedBenchmarks, benchmark]);
    }
  };

  const handleFileChange = (e, index) => {
    const fileList = [...files];
    const file = e.target.files[0];

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setFileError("File size exceeds 25MB limit.");
        return;
      }

      fileList[index] = file;
      setFiles(fileList);
      setFileError("");
    }
  };

  const addFileInput = () => {
    if (files.length >= 3) {
      setFileError("You can upload a maximum of 3 files.");
      return;
    }
    setFiles([...files, null]);
  };

  const removeFileInput = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    setFileError(""); // Clear any previous error
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("user_id", user?.id);
    formData.append("user_type", user?.fld_admin_type);
    formData.append("task_type", task.task_type);
    formData.append("is_marked_as_ongoing", task.is_marked_as_ongoing);
    formData.append("remarks", remarks);
    if (!task.fld_benchmark_name && task.fld_benchmark_name == "") {
      formData.append("hidden_milestones", "No");
    }
    selectedBenchmarks.forEach((b) => formData.append("benchmark[]", b));
    files.forEach((f) => {
      if (f) formData.append("files[]", f);
    });

    try {
      setSubmitting(true);
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/tasks/closetask",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        onClose();
        after();
      } else {
        toast.error(data.message || "Error while updating");
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Update Task Progress</h2>
          
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {task.fld_benchmark_name && (
            <div className="form-group col-sm-12 h-48 max-h-48 overflow-y-auto">
              <label className="col-form-label">Milestones Completed</label>
              <br />

              {(() => {
                const benchmarkNameArray = (task.fld_benchmark_name || "")
                  .split(",")
                  .map(Number)
                  .filter(Boolean);

                let completedBenchmarksArray = (
                  task.fld_completed_benchmarks || ""
                )
                  .split(",")
                  .map(Number)
                  .filter(Boolean);

                // CRM query special handling for 28
                if (
                  task.task_type == "crm_query" &&
                  !completedBenchmarksArray.includes(28)
                ) {
                  const index28 = benchmarkNameArray.indexOf(28);
                  if (index28 != -1) {
                    benchmarkNameArray.splice(index28 + 1);
                  }
                }

                const uncheckedBenchmarks = benchmarkNameArray.filter(
                  (bm) => !completedBenchmarksArray.includes(bm)
                );

                const firstUnchecked = uncheckedBenchmarks[0];

                const are54and67Unchecked =
                  uncheckedBenchmarks.includes(54) &&
                  uncheckedBenchmarks.includes(67);
                const are69and70Unchecked =
                  uncheckedBenchmarks.includes(69) &&
                  uncheckedBenchmarks.includes(70);
                const are71and72Unchecked =
                  uncheckedBenchmarks.includes(71) &&
                  uncheckedBenchmarks.includes(72);

                return benchmarkNameArray.map((benchmark, index) => {
                  const benchmarkName = getBenchmarkName(benchmark);

                  const isChecked =
                    completedBenchmarksArray.includes(benchmark);
                  const isUnchecked = uncheckedBenchmarks.includes(benchmark);

                  const isDisabled =
                    isUnchecked &&
                    benchmark !== firstUnchecked &&
                    !(
                      (are54and67Unchecked &&
                        (benchmark == 54 || benchmark == 67)) ||
                      (are69and70Unchecked &&
                        (benchmark == 69 || benchmark == 70)) ||
                      (are71and72Unchecked &&
                        (benchmark == 71 || benchmark == 72))
                    );

                  const canSelect =
                    task.isquerytask == 1 || task.fld_bucket_name == "55";

                  return (
                    <div key={index} className="mb-2 ">
                      <input
                        type="checkbox"
                        name="benchmark[]"
                        className="benchmark-checkbox"
                        value={benchmark}
                        id={`checkbox_${index}`}
                        checked={
                          selectedBenchmarks.includes(benchmark) || isChecked
                        }
                        disabled={isChecked} //|| !canSelect || isDisabled
                        onChange={() => handleCheckboxChange(benchmark)}
                      />
                      <label htmlFor={`checkbox_${index}`} className="ml-2">
                        {benchmarkName}
                      </label>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          <div className="mb-4">
            <label className="text-[13px]">Remarks</label>
            <textarea
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              File Upload{" "}
              <span className="text-[11px] text-gray-500">
                (Max 25MB per file, Max 3 files)
              </span>
            </label>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".doc, .docx, .pdf, .gif, .jpeg, .jpg, .png, .xlsx, .csv, .rar, .zip, .odt"
                    onChange={(e) => handleFileChange(e, index)}
                    className="flex-1 w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeFileInput(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold border border-red-500 px-2 py-0 rounded"
                  >
                    &minus;
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addFileInput}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            >
              {files.length > 0 ? "+ Add Another File" : "+ Add File"}
            </button>

            {fileError && (
              <div className="text-red-500 text-xs mt-2">{fileError}</div>
            )}
          </div>

          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            >
              {submitting ? "Submitting" : "Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
