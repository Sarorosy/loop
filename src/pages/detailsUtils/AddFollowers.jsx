import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

export default function AddFollowers({ taskId, followers = [], onClose , after}) {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const {user} = useAuth();

  // Example: fetch all possible followers (replace this with your API call)
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
        setAllUsers(data.data);
      } else {
        toast.error("failed to fetch users");
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const loadUsers = async () => {
      fetchAllUsers();

      // Pre-select followers if passed
      const preselected = followers.map((follower) => ({
        value: follower.id,
        label: follower.name, // or follower.fld_first_name, based on your data
      }));

      setSelectedFollowers(preselected);
    };

    loadUsers();
  }, [followers]);

  const handleSave = async () => {
    const followerIds = selectedFollowers.map((f) => f.value);
    console.log("Saving followers for task:", taskId, followerIds);

    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/helper/updateFollower",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId, followerIds, user_id : user?.id, sender_name : user?.fld_first_name + " " + user?.fld_last_name }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Followers saved");
        after()
      }else{

          toast.error(data.message || "Error while saving followers");
      }
      onClose();
    } catch (error) {
      console.error("Error saving followers:", error);
    }
  };

  const options = allUsers.map((user) => ({
    value: user.id,
    label: user.fld_first_name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000073]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white text-black rounded shadow-xl w-full max-w-md mx-4"
      >
        
        <div className="flex justify-between items-center px-4 py-3 bg-[#224d68]  rounded-t">
          <h2 className="text-[15px] font-semibold text-white">Add Followers</h2>
          {/* Close Button */}
          <button
            className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
            onClick={onClose}
          >
            <X size={12} className="" />
          </button>

        </div>
        <div className="p-4">
        

        {/* Select */}
        <Select
          isMulti
          value={selectedFollowers}
          onChange={(selected) => setSelectedFollowers(selected)}
          options={options}
          className="mb-4 text-[13px]"
          placeholder="Select followers..."
        />

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          
          <button
            onClick={handleSave}
            className="px-2 py-1 text-[13px] rounded bg-green-600 text-white hover:bg-green-700 leading-none"
          >
            Save
          </button>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
