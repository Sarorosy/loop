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
        const response = await fetch("https://loopback-skci.onrender.com/api/helper/add_reminder",{
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Set Reminder</h2>
          <div className="">
            <button onClick={onClose} className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded">
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="p-4">
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
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
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
              className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
            />
          </div>
          <div className="flex justify-end">

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-1.5 px-2 rounded hover:bg-blue-700 text-[11px] leading-none flex gap-1 items-center"
          >
            Save Reminder
          </button>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ReminderModal;
