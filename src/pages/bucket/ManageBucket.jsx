import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddBucket from "./AddBucket";
import EditBucket from "./EditBucket";

export default function ManageBucket({ onClose }) {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all buckets
  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://loopback-r9kf.onrender.com/api/helper/allbuckets", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status) {
        setBuckets(data.data);
      } else {
        toast.error(data.message || "Failed to fetch buckets");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching buckets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const handleDelete = async () => {
    if (!selectedBucket) {
      toast.error("Please select a bucket to delete");
      return;
    }
    try {
      const response = await fetch(
        `https://loopback-r9kf.onrender.com/api/helper/bucket/delete/${selectedBucket?.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Deleted!");
        fetchBuckets();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting bucket");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Manage Buckets</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
            onClick={fetchBuckets}
          >
            <RefreshCcw size={13} className="" /> Refresh
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={13} className="" /> Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white  border-t-2 border-blue-400 rounded w-full f-13 mt-5 p-1 pt-5">
        

        {/* Content */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading buckets...</p>
        ) : buckets.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No buckets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Bucket Name</th>
                  <th className="px-4 py-2 text-left border">Bucket Creator</th>
                  <th className="px-4 py-2 text-left border">Added On</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((bucket, idx) => (
                  <tr key={bucket.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{bucket.fld_bucket_name}</td>
                    <td className="px-4 py-2 border">{bucket.bucket_creator}</td>
                    <td className="px-4 py-2 border">{bucket.fld_addedon}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center space-x-2">
                        <button
                          className="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedBucket(bucket);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedBucket(bucket);
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
          <AddBucket
            onClose={() => setAddOpen(false)}
            after={fetchBuckets}
          />
        )}
        {editOpen && (
          <EditBucket
            onClose={() => setEditOpen(false)}
            bucketData={selectedBucket}
            onUpdate={fetchBuckets}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this bucket?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
