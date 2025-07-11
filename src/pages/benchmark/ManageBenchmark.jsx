import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddBenchmark from "./AddBenchmark";
import EditBenchmark from "./EditBenchmark";

export default function ManageBenchmark({ onClose }) {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedBenchmark, setSelectedBenchmark] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all benchmarks
  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://loopback-r9kf.onrender.com/api/helper/allbenchmarks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status) {
        setBenchmarks(data.data);
      } else {
        toast.error(data.message || "Failed to fetch milestones");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching milestones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const handleDelete = async () => {
    if (!selectedBenchmark) {
      toast.error("Please select a milestone to delete");
      return;
    }
    try {
      const response = await fetch(
        `https://loopback-r9kf.onrender.com/api/helper/benchmark/delete/${selectedBenchmark.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Deleted!");
        fetchBenchmarks();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete milestone");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting milestone");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Milestones</h2>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchBenchmarks}
          >
            <RefreshCcw size={14} className="mr-1" /> Refresh
          </button>
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} className="mr-1" /> Add
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading milestones...</p>
        ) : benchmarks.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No milestones found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Milestone Name</th>
                  <th className="px-4 py-2 text-left border">Milestone Creator</th>
                  <th className="px-4 py-2 text-left border">Added On</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((benchmark) => (
                  <tr key={benchmark.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{benchmark.fld_benchmark_name}</td>
                    <td className="px-4 py-2 border">{benchmark.milestone_creator}</td>
                    <td className="px-4 py-2 border">{benchmark.fld_addedon}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center space-x-2">
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedBenchmark(benchmark);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedBenchmark(benchmark);
                            setDeleteOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <AddBenchmark
            onClose={() => setAddOpen(false)}
            after={fetchBenchmarks}
          />
        )}
        {editOpen && (
          <EditBenchmark
            onClose={() => setEditOpen(false)}
            benchmarkData={selectedBenchmark}
            onUpdate={fetchBenchmarks}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this milestone?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
