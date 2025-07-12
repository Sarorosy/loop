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
          "http://localhost:5000/api/helper/allbenchmarks"
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
        "http://localhost:5000/api/tasks/closetask",
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
    <div className="fixed inset-0 bg-[#0000007d] flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="p-6 bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <h2 className="text-xl font-semibold mb-4">Update Task Progress</h2>
        <form onSubmit={handleSubmit}>
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
            <label className="font-medium">Remarks</label>
            <textarea
              className="w-full p-2 border rounded"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              File Upload{" "}
              <span className="text-xs text-gray-500">
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
                    className="flex-1 text-[13px] border rounded p-1 "
                  />
                  <button
                    type="button"
                    onClick={() => removeFileInput(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold border border-red-500 px-2 rounded"
                  >
                    &minus;
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addFileInput}
              className="mt-2 text-blue-600 text-[13px] hover:underline"
            >
              {files.length > 0 ? "+ Add Another File" : "+ Add File"}
            </button>

            {fileError && (
              <div className="text-red-500 text-xs mt-2">{fileError}</div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {submitting ? "Submitting" : "Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
