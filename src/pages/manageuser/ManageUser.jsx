import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EditIcon, Plus, RefreshCcw, Trash, Trash2, Trash2Icon, X } from "lucide-react";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";

export default function ManageUser({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddopen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all users

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/users/all", {
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

  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to delete");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/delete/${selectedUser?.id}`,
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
    <div className=" bg-[#F3F3F3] min-h-[82.8vh]">
      <div className=" max-w-[1250px] mx-auto py-5">
        <div className=" bg-white py-4 px-4">
          {/* Header */}
          <div className="flex items-center justify-between ">
            <h2 className="text-lg font-semibold">Manage Users</h2>
            <div className="flex items-center justify-end space-x-2 ">
              <button
                className="bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 flex items-center text-[13px] leading-none"
                onClick={fetchUsers}
              >
                <RefreshCcw size={11} className="mr-1" /> Refresh
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 rounded px-2 py-1 flex items-center text-[13px] leading-none text-gray-50"
                onClick={() => {
                  setAddopen(true);
                }}
              >
                <Plus size={13} className="mr-0.5" /> Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white  border-t-2 border-blue-400 rounded w-full f-13 mt-4 pt-4 p-1">
            
            {loading ? (
              <p className="text-center text-[12px] text-gray-500">
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <p className="text-center text-[12px] text-gray-500">
                No users found.
              </p>
            ) : (
              <div className="overflow-x-auto px-1">
                <table className="min-w-full text-[12px] border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left border border-gray-200">Name</th>
                      <th className="px-4 py-2 text-left border border-gray-200">Role</th>
                      <th className="px-4 py-2 text-left border border-gray-200">
                        Access Type
                      </th>
                      <th className="px-4 py-2 text-left border border-gray-200">Email Id</th>
                      <th className="px-4 py-2 text-left border border-gray-200">Password</th>
                      <th className="px-4 py-2 text-left border border-gray-200">Added On</th>
                      <th className="px-4 py-2 text-left border border-gray-200">Status</th>
                      <th className="px-4 py-2 text-left border border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr
                        key={user._id || idx}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 border border-gray-200">
                          {user.fld_first_name + " " + user.fld_last_name}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {user.fld_admin_type}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {user.fld_access_type}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">{user.fld_email}</td>
                        <td className="px-4 py-2 border border-gray-200">
                          {user.fld_decrypt_password}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">{user.fld_addedon}</td>
                        <td className="px-4 py-2 border border-gray-200">{user.status}</td>
                        <td className="px-4 py-2 border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <button
                              className="bg-yellow-500 hover:bg-yellow-600 rounded px-1 py-1 flex items-center leading-none"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditOpen(true);
                              }}
                            >
                              <EditIcon size={13} />
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 rounded px-1 py-1 flex items-center leading-none text-gray-100"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteOpen(true);
                              }}
                              
                            >
                              <Trash2 size={13} />
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
              <ConfirmationModal
                title="Are you sure want to delete?"
                message="This action is irreversible."
                onYes={handleDelete}
                onClose={() => {
                  setDeleteOpen(false);
                }}
              />
            )}
          </AnimatePresence>
          {/* </motion.div> */}
        </div>
      </div>
    </div>
  );
}
