import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EditIcon, Plus, RefreshCcw, Trash2, Users, X } from "lucide-react";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import DeleteOrTransferModal from "./DeleteOrTransferModal";

export default function ManageUser({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddopen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserName, setDeleteUserName] = useState("");
  const { user } = useAuth();

  // Fetch all users

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://loopback-r9kf.onrender.com/api/users/all", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status) {
        const sortedUsers = data.data.sort((a, b) =>
          a.fld_first_name.localeCompare(b.fld_first_name)
        );
        setUsers(sortedUsers);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const [transferring, setTransferring] = useState(false);
  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to delete");
      return;
    }
    try {
      setTransferring(true)
      const response = await fetch(
        `https://loopback-r9kf.onrender.com/api/users/delete/${selectedUser?.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Deleted!");
        fetchUsers();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "failed to delete");
      }
    } catch (e) {
      console.log(e);
    }finally{
      setTransferring(false)
    }
  };

  
  const handleTransferTasks = async (transferUserId) => {
    try {
      setTransferring(true)
      const response = await fetch(
        `https://loopback-r9kf.onrender.com/api/helper/transfer-tasks`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            fromUserId: selectedUser.id,
            toUserId: transferUserId,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Tasks transferred!");
        fetchUsers();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to transfer tasks");
      }
    } catch (e) {
      console.error(e);
    }finally{
      setTransferring(false)
    }
  };

  return (
    // <motion.div
    //   initial={{ x: "100%" }}
    //   animate={{ x: 0 }}
    //   exit={{ x: "100%" }}
    //   transition={{ duration: 0.3 }}
    //   className="fixed top-0 right-0 w-full h-full bg-white shadow-lg z-50 overflow-y-auto"
    // >
    <div className="">
      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-end gap-2">
          <Users size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold leading-none"> Manage Users</h2>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={fetchUsers}
          >
            <RefreshCcw size={11} className="" />
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={() => {
              setAddopen(true);
            }}
          >
           Add<Plus size={11} className="" /> 
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white w-full f-13 mt-5 pt-5">
        
        {loading ? (
          <p className="text-center text-[13px] text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] ">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Role</th>
                  <th className="px-4 py-2 text-left border">Access Type</th>
                  <th className="px-4 py-2 text-left border">Email Id</th>
                  {(user?.fld_admin_type == "SUPERADMIN" ||
                    user?.fld_admin_type == "SUBADMIN") && (
                    <th className="px-4 py-2 text-left border">Password</th>
                  )}
                  <th className="px-4 py-2 text-left border">Added On</th>
                  <th className="px-4 py-2 text-left border">Status</th>
                  {(user?.fld_admin_type == "SUPERADMIN" ||
                    user?.fld_admin_type == "SUBADMIN") && (
                    <th className="px-4 py-2 text-left border">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u._id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">
                      {u.fld_first_name + " " + u.fld_last_name}
                    </td>
                    <td className="px-4 py-2 border">{u.fld_admin_type}</td>
                    <td className="px-4 py-2 border">{u.fld_access_type}</td>
                    <td className="px-4 py-2 border">{u.fld_email}</td>
                    {(user?.fld_admin_type == "SUPERADMIN" ||
                      user?.fld_admin_type == "SUBADMIN") && (
                      <td className="px-4 py-2 border">
                        {u.fld_decrypt_password}
                      </td>
                    )}
                    <td className="px-4 py-2 border">{u.fld_addedon}</td>
                    <td className="px-4 py-2 border">{u.status}</td>
                    {(user?.fld_admin_type == "SUPERADMIN" ||
                      user?.fld_admin_type == "SUBADMIN") && (
                      <td className="px-4 py-2 border">
                        <div className="flex items-center space-x-2">
                          <button
                          className="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                            onClick={() => {
                              setSelectedUser(u);
                              setEditOpen(true);
                            }}
                          >
                            <EditIcon size={13} />
                          </button>
                          <button
                            className="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                            onClick={() => {
                              setSelectedUser(u);
                              setDeleteOpen(true);
                              setDeleteUserName(
                                u.fld_first_name + " " + u.fld_last_name
                              );
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AnimatePresence>
        {addOpen && (
          <AddUser
            onClose={() => {
              setAddopen(false);
            }}
            after={fetchUsers}
          />
        )}
        {editOpen && (
          <EditUser
            onClose={() => {
              setEditOpen(false);
            }}
            userData={selectedUser}
            onUpdate={fetchUsers}
          />
        )}
        {deleteOpen && (
          <DeleteOrTransferModal
          transferring={transferring}
            userName={deleteUserName}
            allUsers={users}
            currentUserId={selectedUser.id}
            onClose={() => setDeleteOpen(false)}
            onDelete={handleDelete}
            onTransfer={handleTransferTasks}
          />
        )}
      </AnimatePresence>
      {/* </motion.div> */}
    </div>
  );
}
