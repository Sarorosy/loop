import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddCurrency from "./AddCurrency";
import EditCurrency from "./EditCurrency";

export default function ManageCurrency({ onClose }) {
  const [currency, setCurrency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all requirements
  const fetchCurrency = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/helper/allcurrency", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status) {
        setCurrency(data.data);
      } else {
        toast.error(data.message || "Failed to fetch requirements");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  const handleDelete = async () => {
    if (!selectedCurrency) {
      toast.error("Please select a currency to delete");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/helper/currency/delete/${selectedCurrency.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Currency deleted!");
        fetchCurrency();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete currency");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting currency");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Currency</h2>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchCurrency}
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
          <p className="text-center text-sm text-gray-500">Loading requirements...</p>
        ) : currency.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No requirements found.</p>
        ) : (
          <div className="overflow-x-auto mx-auto  max-w-2xl">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currency.map((currency, idx) => (
                  <tr key={currency.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{currency.name}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center space-x-2">
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedCurrency(currency);
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
          <AddCurrency
            onClose={() => setAddOpen(false)}
            after={fetchCurrency}
          />
        )}
        {editOpen && (
          <EditCurrency
            onClose={() => setEditOpen(false)}
            currencyData={selectedCurrency}
            onUpdate={fetchCurrency}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this requirement?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
