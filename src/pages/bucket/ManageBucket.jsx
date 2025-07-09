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
      const response = await fetch("http://localhost:5000/api/helper/allbuckets", {
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
        `http://localhost:5000/api/helper/bucket/delete/${selectedBucket?.id}`,
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
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Buckets</h2>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchBuckets}
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
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedBucket(bucket);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
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
