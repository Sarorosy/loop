import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function AddUser({ onClose, after }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    user_type: "user",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");
      if (data.status) {
        setSuccessMsg("User added successfully!");
        setForm({ name: "", email: "", user_type: "user", password: "" });
        after();
      } else {
        setError(data.message || "Error adding user");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center"
    >
      <div className="max-w-lg w-full bg-white shadow-lg z-50 overflow-y-auto h-full fixed top-0 right-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#224d68] text-white">
          <h2 className="text-[15px] font-semibold">Add New User</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="p-4 space-y-4 text-[13px]" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
            <label className="block  mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1 border-gray-400  "
            />
          </div>

          <div>
            <label className="block  mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1 border-gray-400  "
            />
          </div>

          <div>
            <label className="block  mb-1">Password</label>
            <input
              type="text"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1 border-gray-400  "
            />
          </div>

          <div>
            <label className="block  mb-1">User Type</label>
            <select
              name="user_type"
              value={form.user_type}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 border-gray-400  "
            >
              <option value="user">User</option>
              <option value="subadmin">Subadmin</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>
          </div>

          {/* Feedback */}
          {error && <p className=" text-red-500">{error}</p>}
          {successMsg && <p className=" text-green-600">{successMsg}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 leading-none text-[12px]"
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
