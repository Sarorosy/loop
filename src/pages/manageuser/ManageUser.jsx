import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, RefreshCcw, X } from "lucide-react";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from "react-hot-toast";

export default function ManageUser({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddopen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  const handleDelete = async () =>{
    if(!selectedUser){
      toast.error('Please select a user to delete')
      return
    }
    try{
      const response = await fetch(`http://localhost:5000/api/users/delete/${selectedUser?.id}`,{
        method: 'DELETE',
        headers : {
          "Content-type" : "application/json"
        }
      });
      const data = await response.json()
      if(data.status){
        toast.success("Deleted!");
        fetchUsers();
        setDeleteOpen(false)
      }else{
        toast.error(data.message || "failed to delete")
      }
    }catch(e){
      console.log(e)
    }
  }

  return (
    // <motion.div
    //   initial={{ x: "100%" }}
    //   animate={{ x: 0 }}
    //   exit={{ x: "100%" }}
    //   transition={{ duration: 0.3 }}
    //   className="fixed top-0 right-0 w-full h-full bg-white shadow-lg z-50 overflow-y-auto"
    // >
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Users</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
            <button
          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchUsers}
          >
            <RefreshCcw size={14} className="mr-1" /> Refresh
          </button>
          <button
          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={() => {
              setAddopen(true);
            }}
          >
            <Plus size={14} className="mr-1" /> Add
          </button>
        </div>
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Role</th>
                  <th className="px-4 py-2 text-left border">Access Type</th>
                  <th className="px-4 py-2 text-left border">Email Id</th>
                  <th className="px-4 py-2 text-left border">Password</th>
                  <th className="px-4 py-2 text-left border">Added On</th>
                  <th className="px-4 py-2 text-left border">Status</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user._id || idx}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 border">{user.fld_first_name + " " + user.fld_last_name}</td>
                    <td className="px-4 py-2 border">{user.fld_admin_type}</td>
                    <td className="px-4 py-2 border">{user.fld_access_type}</td>
                    <td className="px-4 py-2 border">{user.fld_email}</td>
                    <td className="px-4 py-2 border">{user.fld_decrypt_password}</td>
                    <td className="px-4 py-2 border">{user.fld_addedon}</td>
                    <td className="px-4 py-2 border">
                      
                    </td>
                    <td className="px-4 py-2 border">
                        <div className="flex items-center space-x-2">
                            <button
                            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                            onClick={()=>{
                                setSelectedUser(user);
                                setEditOpen(true);
                            }}
                            >
                                Edit
                            </button>
                            <button
                            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                            onClick={()=>{
                                setSelectedUser(user);
                                setDeleteOpen(true)
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
      <AnimatePresence>

      
      {addOpen && (
        <AddUser onClose={()=>{setAddopen(false)}} after={fetchUsers}/>
      )}
      {editOpen && (
        <EditUser onClose={()=>{setEditOpen(false)}} userData={selectedUser} onUpdate={fetchUsers} />
      )}
      {deleteOpen && (
        <ConfirmationModal 
        title="Are you sure want to delete?"
        message="This action is irreversible."
        onYes={handleDelete}
        onClose={()=>{
          setDeleteOpen(false);
        }}
        />
      )}

      </AnimatePresence>
     {/* </motion.div> */}
    </div>
  );
}
