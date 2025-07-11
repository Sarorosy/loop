import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddProject from "./AddProject";
import EditProject from "./EditProject";

export default function ManageProjects({ onClose }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://loopback-r9kf.onrender.com/api/helper/allprojects", {
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
        `https://loopback-r9kf.onrender.com/api/helper/project/delete/${selectedProject.id}`,
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
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Manage Projects</h2>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-end space-x-2 my-2">
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={fetchProjects}
          >
            <RefreshCcw size={14} className="mr-1" /> Refresh
          </button>
          <button
            className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} className="mr-1" /> Add
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No projects found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Project Name</th>
                  <th className="px-4 py-2 text-left border">Created By</th>
                  <th className="px-4 py-2 text-left border">Created On</th>
                  <th className="px-4 py-2 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, idx) => (
                  <tr key={project.id || idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{project.fld_project_name}</td>
                    <td className="px-4 py-2 border">{project.project_creator}</td>
                    <td className="px-4 py-2 border">{project.created_at}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center space-x-2">
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedProject(project);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gray-300 rounded px-1 py-0.5 flex items-center"
                          onClick={() => {
                            setSelectedProject(project);
                            setDeleteOpen(true);
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
