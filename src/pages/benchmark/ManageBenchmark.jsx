import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Edit2Icon, EditIcon, Plus, RefreshCcw, Trash2 } from "lucide-react";
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
      const response = await fetch("https://loopback-n3to.onrender.com/api/helper/allbenchmarks", {
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
        `https://loopback-n3to.onrender.com/api/helper/benchmark/delete/${selectedBenchmark.id}`,
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
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Manage Milestones</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={fetchBenchmarks}
          >
            <RefreshCcw size={11} className="" />
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={() => setAddOpen(true)}
          >
           Add<Plus size={11} className="" /> 
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white w-full f-13 mt-5 pt-5">
        

        {/* Table */}
        {loading ? (
          <p className="text-center text-[13px] text-gray-500">Loading milestones...</p>
        ) : benchmarks.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500">No milestones found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] border border-gray-200">
              <thead className="bg-[#e4eaff]">
                <tr>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Milestone Name</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Milestone Creator</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Added On</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((benchmark) => (
                  <tr key={benchmark.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border border-[#ccc]">{benchmark.fld_benchmark_name}</td>
                    <td className="px-4 py-2 border border-[#ccc]">{benchmark.milestone_creator}</td>
                    <td className="px-4 py-2 border border-[#ccc]">{benchmark.fld_addedon}</td>
                    <td className="px-4 py-2 border border-[#ccc]">
                      <div className="flex items-center space-x-2">
                        <button
                          className="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedBenchmark(benchmark);
                            setEditOpen(true);
                          }}
                        >
                          <EditIcon size={13} />
                        </button>
                        <button
                          className="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedBenchmark(benchmark);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
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
