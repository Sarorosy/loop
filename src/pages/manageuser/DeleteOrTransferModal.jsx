import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Select from "react-select";

export default function DeleteOrTransferModal({
    transferring,
  onClose,
  onDelete,
  onTransfer,
  userName,
  allUsers,
  currentUserId,
}) {
  const [actionType, setActionType] = useState("delete");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSubmit = () => {
    if (actionType === "delete") {
      onDelete();
    } else if (actionType === "transfer") {
      if (!selectedUser) return toast.error("Please select a user to transfer tasks to.");
      onTransfer(selectedUser.value);
    }
  };

  const userOptions = allUsers
    .filter((user) => user.id !== currentUserId) // Disable current user from options
    .map((user) => ({
      value: user.id,
      label: `${user.fld_first_name} ${user.fld_last_name}`,
    }));

  return (
    <div className="fixed inset-0 bg-[#00000077] flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-bold mb-4 f-12">
          Delete or Transfer tasks of <span className="text-lg">{userName}</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="action"
              value="delete"
              checked={actionType === "delete"}
              onChange={() => setActionType("delete")}
            />
            Delete all tasks
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="action"
              value="transfer"
              checked={actionType === "transfer"}
              onChange={() => setActionType("transfer")}
            />
            Transfer all tasks
          </label>

          {actionType === "transfer" && (
            <Select
              options={userOptions}
              placeholder="Select a user"
              value={selectedUser}
              onChange={(selected) => setSelectedUser(selected)}
              className="text-[13px]"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-1 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
          disabled={transferring}
            className="px-4 py-1 bg-red-500 text-white rounded"
            onClick={handleSubmit}
          >
            {transferring ? "Submitting" : "Submit" }
          </button>
        </div>
      </motion.div>
    </div>
  );
}
