import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EditIcon, Plus, RefreshCcw, Trash2, Users, X } from "lucide-react";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import DeleteOrTransferModal from "./DeleteOrTransferModal";
import SearchBar from "../../components/SearchBar";
import { formatDate } from "../../helpers/CommonHelper";

export default function ManageUser({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddopen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Fetch all users

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/users/all",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
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
      setTransferring(true);
      const response = await fetch(
        `https://loopback-skci.onrender.com/api/users/delete/${selectedUser?.id}`,
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
    } finally {
      setTransferring(false);
    }
  };

  const handleTransferTasks = async (transferUserId) => {
    try {
      setTransferring(true);
      const response = await fetch(
        `https://loopback-skci.onrender.com/api/helper/transfer-tasks`,
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
    } finally {
      setTransferring(false);
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
            Add
            <Plus size={11} className="" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-end gap-2 mt-2">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search User"
        />
      </div>
      {/* Content */}
      <div className="bg-white w-full f-13 pt-5">
        {loading ? (
          <div className="flex justify-center">
          <p className="text-center text-[13px] text-gray-500 flex items-center gap-2 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f16639"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="infinity"
            >
              <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8" />
            </svg>
            Loading users...
          </p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] ">
              <thead className="bg-[#e4eaff]">
                <tr>
                  <th className="px-4 py-2 text-left border border-[#ccc]">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">
                    Access Type
                  </th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">
                    Email Id
                  </th>
                  {(user?.fld_admin_type == "SUPERADMIN" ||
                    user?.fld_admin_type == "SUBADMIN") && (
                    <th className="px-4 py-2 text-left border border-[#ccc]">
                      Password
                    </th>
                  )}
                  <th className="px-4 py-2 text-left border border-[#ccc]">
                    Added On
                  </th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">
                    Status
                  </th>
                  {(user?.fld_admin_type == "SUPERADMIN" ||
                    user?.fld_admin_type == "SUBADMIN") && (
                    <th className="px-4 py-2 text-left border border-[#ccc]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(
                    (u) =>
                      u.fld_first_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      u.fld_last_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      u.fld_email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((u, idx) => (
                    <tr
                      key={u._id || idx}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 border border-[#ccc] break-all">
                        {u.fld_first_name + " " + u.fld_last_name}
                      </td>
                      <td className="px-4 py-2 border border-[#ccc]">
                        {u.fld_admin_type}
                      </td>
                      <td className="px-4 py-2 border border-[#ccc]">
                        {u.fld_access_type}
                      </td>
                      <td className="px-4 py-2 border border-[#ccc]">
                        {u.fld_email}
                      </td>
                      {(user?.fld_admin_type == "SUPERADMIN" ||
                        user?.fld_admin_type == "SUBADMIN") && (
                        <td className="px-4 py-2 border border-[#ccc]">
                          {u.fld_decrypt_password}
                        </td>
                      )}
                      <td className="px-4 py-2 border border-[#ccc]">
                        {formatDate(u.fld_addedon)}
                      </td>
                      <td className="px-4 py-2 border border-[#ccc]">
                        {u.status}
                      </td>
                      {(user?.fld_admin_type == "SUPERADMIN" ||
                        user?.fld_admin_type == "SUBADMIN") && (
                        <td className="px-4 py-2 border border-[#ccc]">
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
