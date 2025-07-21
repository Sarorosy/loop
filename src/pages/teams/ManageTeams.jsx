import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, RefreshCcw, X, Users, User, Calendar, Settings } from "lucide-react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import AddTeam from "./AddTeam";
import EditTeam from "./EditTeam";

export default function ManageTeams({ onClose }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddopen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const tableRef = useRef(null);

  // Initialize DataTable
  DataTable.use(DT);

  // Memoized fetch function
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      if (tableRef.current && $.fn.dataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

      const response = await fetch(
        "https://loopback-skci.onrender.com/api/helper/allteams",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setTeams(data.data);
      } else {
        toast.error(data.message || "Failed to fetch teams");
      }
    } catch (e) {
      console.error("Error fetching teams:", e);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  // DataTable columns definition
  const columns = [
    {
      title: "Team Name",
      data: "team_name",
      orderable: true,
      render: (data) => `
        <div class="flex items-center gap-2">
          
          <span class="font-medium">${data || "-"}</span>
        </div>
      `,
    },
    {
      title: "Team Members",
      data: "team_members_details",
      orderable: false,
      render: (data) => {
        if (!data || data.length === 0) {
          return '<span class="text-gray-500 italic">No Members</span>';
        }
        const members = Array.isArray(data) ? data : [data];
        const displayMembers = members.join(", ");
        
        return `
          <div class="max-w-xs">
            <span class="text-[13px]">${displayMembers}</span>}
          </div>
        `;
      },
    },
    {
      title: "Created By",
      data: "created_by_name",
      orderable: true,
      render: (data) => `
        <div class="flex items-center gap-2">
          
          <span class="text-[13px]">${data || "-"}</span>
        </div>
      `,
    },
    {
      title: "Created On",
      data: "created_on",
      orderable: true,
      render: (data) => {
        if (!data) return "-";
        const date = new Date(data);
        return `
          <div class="flex items-center gap-2">
           
            <span class="text-[13px]">${date.toLocaleDateString()}</span>
          </div>
        `;
      },
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => `
        <div class="flex items-center gap-2">
          <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1">
            
            Edit
          </button>
          <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1">
            
            Delete
          </button>
        </div>
      `,
    },
  ];

  // Initialize DataTable when teams data changes
  useEffect(() => {
    if (!teams.length) return;

    const table = $(tableRef.current).DataTable({
      destroy: true,
      responsive: true,
      data: teams,
      columns: columns,
      order: [[3, "desc"]], // Sort by created date descending
      pageLength: 25,
      language: {
        emptyTable: "No teams found",
        info: "Showing _START_ to _END_ of _TOTAL_ teams",
        infoEmpty: "Showing 0 to 0 of 0 teams",
        search: "Search teams:",
        lengthMenu: "Show _MENU_ teams per page",
      },
      createdRow: (row, data) => {
        // Add event listeners for action buttons
        $(row)
          .find(".edit-btn")
          .on("click", (e) => {
            e.stopPropagation();
            handleEditClick(data);
          });

        $(row)
          .find(".delete-btn")
          .on("click", (e) => {
            e.stopPropagation();
            handleDeleteClick(data);
          });
      },
    });

    return () => {
      table.destroy();
    };
  }, [teams]);

  // Action handlers
  const handleEditClick = useCallback((team) => {
    setSelectedTeam(team);
    setEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback((team) => {
    setSelectedTeam(team);
    setDeleteOpen(true);
  }, []);

  const handleDelete = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team to delete");
      return;
    }
    
    try {
      const response = await fetch(
        `https://loopback-skci.onrender.com/api/helper/team/delete/${selectedTeam?.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      
      if (data.status) {
        toast.success("Team deleted successfully!");
        fetchUsers();
        setDeleteOpen(false);
        setSelectedTeam(null);
      } else {
        toast.error(data.message || "Failed to delete team");
      }
    } catch (e) {
      console.error("Error deleting team:", e);
      toast.error("Failed to delete team");
    }
  };

  // Close handlers
  const handleAddClose = useCallback(() => {
    setAddopen(false);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditOpen(false);
    setSelectedTeam(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteOpen(false);
    setSelectedTeam(null);
  }, []);

  return (

    <div className="">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-2">
            {/* <Users size={20} className="text-blue-600" /> */}
            <h2 className="text-[16px] font-semibold text-gray-800 leading-none">Manage Teams</h2>
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-600 leading-none">
                  {teams.length} team{teams.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="bg-gray-50 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
              onClick={fetchUsers}
              disabled={loading}
            >
              <RefreshCcw size={11} className={` ${loading ? 'animate-spin' : ''}`} />
              
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 leading-none"
              onClick={() => setAddopen(true)}
            >
              
              Add Team<Plus size={11}  className="" />
            </button>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white w-full f-13 mt-5">
        

        {/* DataTable */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-[13px] text-gray-600">Loading teams...</span>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No teams found.</p>
            <button
              className="mt-2 text-blue-600 hover:text-blue-800 text-[13px] font-medium"
              onClick={() => setAddopen(true)}
            >
              Create +
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table ref={tableRef} className="w-full text-[13px]">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Team Members</th>
                    <th>Created By</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* DataTable will populate this */}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          
            <AddTeam
              onClose={handleAddClose}
              after={fetchUsers}
            />
          
        )}
        
        {editOpen && selectedTeam && (
          
            <EditTeam
              onClose={handleEditClose}
              teamData={selectedTeam}
              onUpdate={fetchUsers}
            />
          
        )}
        
        {deleteOpen && selectedTeam && (
          <ConfirmationModal
            title="Delete Team"
            message={`Are you sure you want to delete "${selectedTeam.team_name}"? This action cannot be undone.`}
            onYes={handleDelete}
            onClose={handleDeleteClose}
          />
        )}
      </AnimatePresence>
    </div>

  );
}