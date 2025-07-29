import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronsRightIcon, X } from "lucide-react";
import Select from "react-select";

export default function EditUser({ onClose, userData, onUpdate }) {
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
    scopeadmin: false,
    scopetagaccess: false,
    feasibility_access: false,
    tl: false,
    transferaccess: false,
    tl_type: "",
    selectedTlUsers: [],
  });

  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Fetch teams
  useEffect(() => {
    fetch("https://loopback-skci.onrender.com/api/helper/allteams")
      .then((res) => res.json())
      .then((data) => setTeams(data.data || []))
      .catch((err) => console.error("Error fetching teams:", err));
  }, []);

  // Fetch all users
  useEffect(() => {
    fetch("https://loopback-skci.onrender.com/api/users/all")
      .then((res) => res.json())
      .then((data) => setAllUsers(data.data || []))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Populate form with userData
  useEffect(() => {
    if (userData) {
      setForm((prev) => ({
        ...prev,
        first_name: userData.fld_first_name || "",
        last_name: userData.fld_last_name || "",
        email: userData.fld_email || "",
        password: userData.fld_decrypt_password || "",
        role: userData.fld_admin_type || "TEAM MEMBER",
        team: userData.team || "",
        addprojectaccess: userData.canaddproject == 1,
        team_access_type: userData.fld_team_access_type || "",
        selectedTeams: userData.fld_assigned_team?.split(",").map(Number) || [],
        addquery_access: userData.fld_access_to_addquery == 1 ? "1" : "",
        scopeadmin: userData.scopeadmin == 1,
        scopetagaccess: userData.scopetagaccess == 1,
        feasibility_access: userData.feasibility_access == 1,
        tl: userData.tl == 1,
        transferaccess: userData.transferaccess == 1,
        tl_type: userData.tl_type ? String(userData.tl_type) : "",
        selectedTlUsers: userData.tl_users
          ? userData.tl_users.split(",").map(Number)
          : [],
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.team_name,
  }));

  const tlUserOptions = allUsers.map((u) => ({
    value: u.id,
    label: `${u.fld_first_name} ${u.fld_last_name}`,
  }));

  const shouldShowTlUsers =
    form.feasibility_access || form.tl || form.transferaccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.first_name.trim()) return setError("First name is required");
    if (!form.last_name.trim()) return setError("Last name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Please enter a valid email address");

    if (form.role === "TEAM MEMBER" && !form.team)
      return setError("Please select a team");

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

      if(form.tl && !form.tl_type){
        setError("Pls select Tl Type")
        return;
      }
      if((form.tl || form.feasibility_access || form.transferaccess) && form.selectedTlUsers.length == 0){
        setError("Pls select users");
        return;
      }
    }

    setLoading(true);

    const payload = {
      ...form,
      selectedTeams:
        form.role === "SUBADMIN" && form.team_access_type === "All team access"
          ? teams.map((team) => team.id)
          : form.selectedTeams,
      scopeadmin: form.scopeadmin ? 1 : 0,
      scopetagaccess: form.scopetagaccess ? 1 : 0,
      feasibility_access: form.feasibility_access ? 1 : 0,
      tl: form.tl ? 1 : 0,
      transferaccess: form.transferaccess ? 1 : 0,
      tl_type: form.tl ? form.tl_type : "",
      tl_users: shouldShowTlUsers ? form.selectedTlUsers.join(",") : "",
    };

    try {
      const res = await fetch(
        `https://loopback-skci.onrender.com/api/users/update/${userData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.status)
        throw new Error(data.message || "Something went wrong");

      setSuccessMsg("User updated successfully!");
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000c2] flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto"
      >
      <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-[#224d68] text-white">
        <h2 className="text-[16px] font-semibold">Edit User</h2>
        <button
          className="text-white bg-red-600 hover:bg-red-700 py-1 px-1 rounded"
          onClick={onClose}>
            <X size={13} />
          </button>
      </div>
      

      <form className="p-4 space-y-4">
        {/* Basic Details */}
        <InputField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
        <InputField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
        <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <InputField label="Password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep existing password" />

        {/* Role Selection */}
        <div>
          <label className="block text-[13px] mb-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600">
            <option value="TEAM MEMBER">TEAM MEMBER</option>
            <option value="SUBADMIN">SUBADMIN</option>
          </select>
        </div>

        {/* TEAM MEMBER Options */}
        {form.role === "TEAM MEMBER" && (
          <>
            <SelectTeam teams={teams} form={form} handleChange={handleChange} />
            <Checkbox name="addprojectaccess" checked={form.addprojectaccess} onChange={handleChange} label="Assign Project Management Access" />
          </>
        )}

        {/* SUBADMIN Options */}
        {form.role === "SUBADMIN" && (
          <>
            <TeamAccess form={form} handleChange={handleChange} teamOptions={teamOptions} />
          </>
        )}

        {/* 5 Access Checkboxes */}
        <Checkbox name="scopeadmin" checked={form.scopeadmin} onChange={handleChange} label="Ask for Scope Admin Access" />
        <Checkbox name="addquery_access" checked={form.addquery_access} onChange={handleChange} label="Query Access" />
        <Checkbox name="scopetagaccess" checked={form.scopetagaccess} onChange={handleChange} label="Ask for Scope Tag Access" />
        <Checkbox name="feasibility_access" checked={form.feasibility_access} onChange={handleChange} label="Feasibility Access" />
        <Checkbox name="tl" checked={form.tl} onChange={handleChange} label="Team Leader" />
        <Checkbox name="transferaccess" checked={form.transferaccess} onChange={handleChange} label="Transfer Access" />

        {/* TL Type Radio Buttons */}
        {form.tl && (
          <div>
            <label className="block text-[13px] mb-1">Team Leader Type</label>
            <div className="flex space-x-3">
              <RadioButton name="tl_type" value="1" checked={form.tl_type === "1"} onChange={handleChange} label="CRM Team Leader" />
              <RadioButton name="tl_type" value="2" checked={form.tl_type === "2"} onChange={handleChange} label="Ops Team Leader" />
              <RadioButton name="tl_type" value="3" checked={form.tl_type === "3"} onChange={handleChange} label="CRM & Ops Team Leader" />
            </div>
          </div>
        )}

        {/* Select TL Users */}
        {shouldShowTlUsers && (
          <div>
            <label className="block text-[13px] mb-1">Select TL Users</label>
            <Select
              isMulti
              options={tlUserOptions}
              value={tlUserOptions.filter((u) => form.selectedTlUsers.includes(u.value))}
              onChange={(selected) => {
                setForm((prev) => ({
                  ...prev,
                  selectedTlUsers: selected.map((u) => u.value),
                }));
              }}
              className="text-[13px]"
              classNamePrefix="react-select"
            />
          </div>
        )}

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        {successMsg && <p className="text-[13px] text-green-600">{successMsg}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-1.5 px-2 rounded hover:bg-blue-700 text-[11px] leading-none flex gap-1 items-center"
          >
            {loading ? "Updating..." : "Update User"}<ChevronsRightIcon size={11} className="" />
          </button>
        </div>
      </form>
      </div>
    </motion.div>
    </motion.div>
  );
}

// Reusable Components
const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-[13px] mb-1">{label}</label>
    <input {...props} className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600" />
  </div>
);

const Checkbox = ({ label, ...props }) => (
  <div className="flex items-center space-x-2">
    <input type="checkbox" {...props} />
    <label className="text-[13px]">{label}</label>
  </div>
);

const RadioButton = ({ label, ...props }) => (
  <label className="text-[13px] flex items-center space-x-1">
    <input type="radio" {...props} />
    <span>{label}</span>
  </label>
);

const SelectTeam = ({ teams, form, handleChange }) => (
  <div>
    <label className="block text-[13px] mb-1">Select Team</label>
    <select name="team" value={form.team} onChange={handleChange} className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600">
      <option value="">Select a Team</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.team_name}
        </option>
      ))}
    </select>
  </div>
);

const TeamAccess = ({ form, handleChange, teamOptions }) => (
  <>
    <div>
      <label className="block text-[13px] mb-1">Team Access Type</label>
      <select name="team_access_type" value={form.team_access_type} onChange={handleChange} className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600">
        <option value="">Select Access Type</option>
        <option value="All team access">All team access</option>
        <option value="Specific team access">Specific team access</option>
      </select>
    </div>

    {form.team_access_type === "Specific team access" && (
      <div>
        <label className="block text-[13px] mb-1">Select Teams</label>
        <Select
          isMulti
          options={teamOptions}
          value={teamOptions.filter((option) => form.selectedTeams.includes(option.value))}
          onChange={(selected) => {
            const selectedValues = selected.map((option) => option.value);
            handleChange({ target: { name: "selectedTeams", value: selectedValues } });
          }}
          className="text-[13px]"
          classNamePrefix="react-select"
        />
      </div>
    )}
  </>
);
