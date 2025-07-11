import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Select from "react-select";

export default function AddUser({ onClose, after }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "TEAM MEMBER",
    team: "",
    addprojectaccess: false,
    team_access_type: "",
    selectedTeams: [],
    addquery_access: "",
  });

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Fetch teams
  useEffect(() => {
    fetch("http://localhost:5000/api/helper/allteams")
      .then((res) => res.json())
      .then((data) => setTeams(data.data || []))
      .catch((err) => console.error("Error fetching teams:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectedTeamsChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setForm((prev) => ({ ...prev, selectedTeams: selectedOptions }));
  };

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.team_name,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMsg("");

    // Basic validations
    if (!form.first_name.trim()) return setError("First name is required");
    if (!form.last_name.trim()) return setError("Last name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Please enter a valid email address");
    if (!form.password.trim()) return setError("Password is required");

    if (form.role === "TEAM MEMBER") {
      if (!form.team) return setError("Please select a team");
    }

    if (form.role === "SUBADMIN") {
      if (!form.team_access_type)
        return setError("Please select a team access type");

      if (
        form.team_access_type === "Specific team access" &&
        form.selectedTeams.length === 0
      ) {
        return setError("Please select at least one team");
      }

      if (!form.addquery_access) return setError("Please select query access");
    }
    setLoading(true);

    const payload = {
      ...form,
      // If subadmin & "All team access", auto-assign all team IDs
      selectedTeams:
        form.role === "SUBADMIN" && form.team_access_type === "All team access"
          ? teams.map((team) => team.id)
          : form.selectedTeams,
    };

    try {
      const res = await fetch("http://localhost:5000/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.status)
        throw new Error(data.message || "Something went wrong");

      setSuccessMsg("User added successfully!");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "TEAM MEMBER",
        team: "",
        addprojectaccess: false,
        team_access_type: "",
        selectedTeams: [],
        addquery_access: "",
      });
      after();
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
      <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg ">
      <div className="flex items-center justify-between p-4 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Add New User</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-x-3">
        <div>
          <label className="block text-[13px] mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-[13px] mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-[13px] mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-[13px] mb-1">Password</label>
          <input
            type="text"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[13px] mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
          >
            <option value="TEAM MEMBER">TEAM MEMBER</option>
            <option value="SUBADMIN">SUBADMIN</option>
          </select>
        </div>

        {/* TEAM MEMBER specific fields */}
        {form.role === "TEAM MEMBER" && (
          <div className="md:col-span-2">
            <div >
              <label className="block text-[13px] mb-1">Select Team</label>
              <select
                name="team"
                value={form.team}
                onChange={handleChange}
                className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                required
              >
                <option value="">Select a Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 my-3">
              <input
                type="checkbox"
                name="addprojectaccess"
                checked={form.addprojectaccess}
                onChange={handleChange}
              />
              <label className="text-[13px]">
                Assign Project Management Access
              </label>
            </div>
          </div>
        )}

        {/* SUBADMIN specific fields */}
        {form.role === "SUBADMIN" && (
          <>
            <div>
              <label className="block text-[13px] mb-1">Team Access Type</label>
              <select
                name="team_access_type"
                value={form.team_access_type}
                onChange={handleChange}
                className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                required
              >
                <option value="">Select Access Type</option>
                <option value="All team access">All team access</option>
                <option value="Specific team access">
                  Specific team access
                </option>
              </select>
            </div>

            {form.team_access_type === "Specific team access" && (
              <div>
                <label className="block text-[13px] mb-1">Select Teams</label>
                <Select
                  isMulti
                  options={teamOptions}
                  value={teamOptions.filter((option) =>
                    form.selectedTeams.includes(option.value)
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    setForm((prev) => ({
                      ...prev,
                      selectedTeams: selectedValues,
                    }));
                  }}
                  className="text-[13px]"
                  classNamePrefix="react-select"
                />
              </div>
            )}

            <div>
              <label className="block text-[13px] mb-1">Add Query Access</label>
              <select
                name="addquery_access"
                value={form.addquery_access}
                onChange={handleChange}
                className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
                required
              >
                <option value="">Select Access</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
          </>
        )}

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        {successMsg && <p className="text-[13px] text-green-600">{successMsg}</p>}

        <div className="text-end md:col-span-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 px-2 rounded hover:bg-blue-700 text-[13px] leading-none"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
      </div>
    </motion.div>
  );
}
