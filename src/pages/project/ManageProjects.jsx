import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { EditIcon, Plus, RefreshCcw, Trash2 } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddProject from "./AddProject";
import EditProject from "./EditProject";
import SearchBar from "../../components/SearchBar";
import { formatDate } from "../../helpers/CommonHelper";

export default function ManageProjects({ onClose }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://loopback-skci.onrender.com/api/helper/allprojects", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status) {
        setProjects(data.data);
      } else {
        toast.error(data.message || "Failed to fetch projects");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (!selectedProject) {
      toast.error("Please select a project to delete");
      return;
    }
    try {
      const response = await fetch(
        `https://loopback-skci.onrender.com/api/helper/project/delete/${selectedProject.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Deleted!");
        fetchProjects();
        setDeleteOpen(false);
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting project");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Manage Projects</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={fetchProjects}
          >
            <RefreshCcw size={11} className="" />
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
            onClick={() => setAddOpen(true)}
          >
           Add<Plus size={11} className="" /> 
          </button>
        </div>
      </div>

       <div className="flex items-end justify-end gap-2 mt-2">
        <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by Project Name"
      />
      </div>

      {/* Actions */}
      <div className="bg-white w-full f-13  pt-5">
        

        {/* Content */}
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
            Loading projects...
          </p>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500">No projects found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] border border-gray-200">
              <thead className="bg-[#e4eaff]">
                <tr>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Project Name</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Created By</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Created On</th>
                  <th className="px-4 py-2 text-left border border-[#ccc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects
                .filter((project) =>
                    project.fld_project_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                .map((project, idx) => (
                  <tr key={project.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border border-[#ccc]">{project.fld_project_name}</td>
                    <td className="px-4 py-2 border border-[#ccc]">{project.project_creator}</td>
                    <td className="px-4 py-2 border border-[#ccc]">{formatDate(project.created_at)}</td>
                    <td className="px-4 py-2 border border-[#ccc]">
                      <div className="flex items-center space-x-2">
                        <button
                          className="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedProject(project);
                            setEditOpen(true);
                          }}
                        >
                          <EditIcon size={13} />
                        </button>
                        <button
                          className="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                          onClick={() => {
                            setSelectedProject(project);
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

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <AddProject
            onClose={() => setAddOpen(false)}
            after={fetchProjects}
          />
        )}
        {editOpen && (
          <EditProject
            onClose={() => setEditOpen(false)}
            projectData={selectedProject}
            onUpdate={fetchProjects}
          />
        )}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this project?"
            message="This action is irreversible."
            onYes={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
