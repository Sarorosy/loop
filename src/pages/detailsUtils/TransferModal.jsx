import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

export default function TransferModal({ taskId, onClose, after }) {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useAuth();

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("https://loopback-skci.onrender.com/api/users/allusers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        // Exclude current user
        const filteredUsers = data.data.filter((u) => u.id !== user?.id);
        setAllUsers(filteredUsers);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (e) {
      console.log(e);
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to transfer the task");
      return;
    }

    try {
      const response = await fetch("https://loopback-skci.onrender.com/api/helper/transferTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          newUserId: selectedUser.value,
          user_id: user?.id,
          sender_name: `${user?.fld_first_name} ${user?.fld_last_name}`,
        }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success("Task transferred");
        after();
      } else {
        toast.error(data.message || "Error while transferring task");
      }
      onClose();
    } catch (error) {
      console.error("Error transferring task:", error);
      toast.error("Error while transferring task");
    }
  };

  const options = allUsers.map((u) => ({
    value: u.id,
    label: u.fld_first_name,
  }));

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4"
      >
       

        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Transfer Task</h2>

          {/* Close Button */}
          <button
            className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
            onClick={onClose}
          >
            <X size={12} className="" />
          </button>
        </div>
        <div className="p-4">

        {/* Single Select */}
        <Select
          value={selectedUser}
          onChange={(selected) => setSelectedUser(selected)}
          options={options}
          className="mb-4 text-[13px]"
          placeholder="Select user..."
        />

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 text-[13px] rounded bg-green-600 text-white hover:bg-green-700 leading-none"
          >
            Transfer
          </button>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
