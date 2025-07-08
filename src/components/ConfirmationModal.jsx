import { X } from "lucide-react";
import React from "react";
import { useAuth } from "../utils/idb";



const ConfirmationModal = ({ title, message, onYes, onClose }) => {
  const {theme} = useAuth();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]">
      <div className={`${theme == "dark" ? "bg-gray-300 text-white mw-dark" : "bg-white text-black"} rounded-xl shadow-xl w-full max-w-md mx-4`}>
        <div className='flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg'>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div>
            <button
            className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
            onClick={onClose} // Close modal without doing anything
          >
            <X size={15}  />
          </button>
          </div>
        </div>

        <div className="p-4">
          
          <p className={`${theme == "dark" ? "text-gray-900" : "text-gray-600"}  mb-6`}>{message}</p>
          <div className="flex justify-end gap-2">
            {/* <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Cancel
            </button> */}
            <button
              onClick={onYes}
              className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition f-11"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
