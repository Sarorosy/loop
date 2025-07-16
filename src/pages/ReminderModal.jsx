import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../utils/idb";
import toast from "react-hot-toast";

const ReminderModal = ({ taskId, taskUniqueId, onClose }) => {
  const [reminderDate, setReminderDate] = useState("");
  const [notes, setNotes] = useState("");
  const {user} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reminderDate) return toast.error("Reminder date is required");

    const reminderData = {
      taskId,
      taskUniqueId,
      reminderDate,
      notes,
      user_id: user?.id
    };
    try{
        const response = await fetch("https://loopback-n3to.onrender.com/api/helper/add_reminder",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify(reminderData)
        });
        const data = await response.json();
        if(data.status){
            toast.success("Reminder added successfully");
            onClose();
        }else{
            toast.error(data.message || "Failed to add reminder");
        }

    }catch(e){
        console.log(e);
    }
    
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setSeconds(0, 0); // remove seconds/milliseconds
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Set Reminder</h2>
        <form  className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              min={getMinDateTime()}
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="flex justify-end">

          <button
            type="button"
            onClick={handleSubmit}
            className="w-24 bg-orange-600 text-white py-1 f-11 rounded-md hover:bg-orange-700 transition"
          >
            Save Reminder
          </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReminderModal;
