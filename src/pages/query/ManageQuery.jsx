import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import { AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import "./query.css";
import Select from "react-select";
import AssignQuery from "./AssignQuery";
import AssignMultipleQuery from "./AssignMultipleQuery";

function ManageQuery() {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [totalRows, setTotalRows] = useState(1);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const [page, setPage] = useState(1);
  const [websites, setWebsites] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedQueries, setSelectedQueries] = useState([]);
  const [filters, setFilters] = useState({
    filter_string: "",
    user_id: "",
    website: [],
    filter_by_days: "",
    from_date: "",
    to_date: "",
  });

  DataTable.use(DT);

  // Separate function outside the component
  const fetchTasks = async (
    user,
    setQueries,
    setLoading,
    page,
    filters,
    setTotalRows
  ) => {
    setLoading(true);
    try {
      const res = await fetch("https://loopback-r9kf.onrender.com/api/query/queries", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          user_id: filters.user_id,
          website: filters.website,
          filter_string: filters.filter_string,
          page: page,
          from_date: filters.from_date,
          to_date: filters.to_date,
          filter_by_days: filters.filter_by_days,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQueries(data?.result || []);
        setTotalRows(data?.total_rows ?? 1);
      } else {
        toast.error(data.message || "Failed to fetch queries");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(totalRows / 50)) return;
    setPage(newPage);
  };

  useEffect(() => {
    if (!user) return;
    fetchTasks(user, setQueries, setLoading, page, filters, setTotalRows);
  }, [user, page]);

  const Pagination = () => {
    const perPage = 50;
    const totalPages = Math.ceil(totalRows / perPage);
    const startRow = (page - 1) * perPage + 1;
    const endRow = Math.min(page * perPage, totalRows);

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pageNumbers = [];
      const start = Math.max(2, page - 3);
      const end = Math.min(totalPages - 1, page + 3);

      if (page > 5) {
        pageNumbers.push(
          <span key="start-dots" className="px-2">
            ...
          </span>
        );
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(
          <button
            key={i}
            className={`px-2 py-1 mx-1 ${
              page === i ? "bg-blue-500 text-white" : "bg-white border"
            } rounded`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      if (page < totalPages - 4) {
        pageNumbers.push(
          <span key="end-dots" className="px-2">
            ...
          </span>
        );
      }

      return pageNumbers;
    };

    return (
      <div className="flex justify-between items-center p-2">
        <p className="text-xs">
          Displaying {startRow} - {endRow} out of {totalRows} rows
        </p>
        <div className="flex items-center text-sm">
          <button
            className={`px-2 py-1 mx-1 ${
              page === 1 ? "opacity-50 cursor-not-allowed" : "bg-white border"
            } rounded`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>

          <button
            className={`px-2 py-1 mx-1 ${
              page === 1 ? "bg-blue-500 text-white" : "bg-white border"
            } rounded`}
            onClick={() => handlePageChange(1)}
          >
            1
          </button>

          {renderPageNumbers()}

          {totalPages > 1 && (
            <button
              className={`px-2 py-1 mx-1 ${
                page === totalPages
                  ? "bg-blue-500 text-white"
                  : "bg-white border"
              } rounded`}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          )}

          <button
            className={`px-2 py-1 mx-1 ${
              page === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "bg-white border"
            } rounded`}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .dt-paging {
        display: none;
      }
      .dt-info {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style); // cleanup
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        fetch("https://loopback-r9kf.onrender.com/api/query/websites"),
        fetch("https://loopback-r9kf.onrender.com/api/query/users"),
      ]);
      setWebsites((await projectsRes.json())?.data || []);
      setUsers((await usersRes.json())?.data || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const handleSelectAllChange = (e) => {
  const isChecked = e.target.checked;
  if (isChecked) {
    setSelectedQueries(queries); // store entire query objects
    $(".row-checkbox").prop("checked", true);
  } else {
    setSelectedQueries([]);
    $(".row-checkbox").prop("checked", false);
  }
};


 const handleRowCheckboxChange = (e) => {
  const id = parseInt(e.target.getAttribute("data-id"));
  const isChecked = e.target.checked;
  const queryObj = queries.find((q) => q.id === id); // find the whole query object

  setSelectedQueries((prev) => {
    if (isChecked) {
      // Add the full query if not already added
      const isAlreadyAdded = prev.some((q) => q.id === id);
      return isAlreadyAdded ? prev : [...prev, queryObj];
    } else {
      // Remove the query from the selected list
      return prev.filter((q) => q.id !== id);
    }
  });
};


  const columns = [
    {
      title: `<input type='checkbox' id='select-all' />`,
      data: null,
      orderable: false,
      className: "text-center",
      render: (data, type, row) =>
        `<input type="checkbox" class="row-checkbox" data-id="${row.id}" />`,
    },
    {
      title: "RefId",
      data: "assign_id",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "CRM Name",
      data: "insta_user_name",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "Client Name",
      data: "name",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "Email Id",
      data: "email_id",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "Website",
      data: "website",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "Contact No",
      data: "phone",
      orderable: false,
      render: (data) => data || "-",
    },
    {
      title: "Requirement",
      data: "requirement",
      orderable: false,
      render: (data, type, row) =>
        row.requirement_line == 1
          ? row.line_format
          : row.paragraph_format || "-",
    },
    {
      title: "Added On",
      data: "date",
      orderable: true,
      render: (data) => {
        return data ? data : "-";
      },
    },
    {
      title: "Action",
      data: null,
      orderable: false,
      render: (data, type, row) => `
      <button class="assign-btn px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm" data-id="${row.id}">
        Assign
      </button>
    `,
    },
  ];

  const [selectedQuery, setSelectedQuery] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const handleViewButtonClick = (query) => {
    setSelectedQuery(query);
    setAssignOpen(true);
  };

  // Initialize DataTable
  useEffect(() => {
    if (!queries.length) return;

    const table = $(tableRef.current).DataTable({
      destroy: true,
      responsive: true,
      data: queries,
      columns: columns,
      order: [[6, "desc"]],
    });

    return () => {
      table.destroy();
    };
  }, [queries]);

  const resetFilters = () => {
    setFilters({
      filter_string: "",
      user_id: "",
      website: [],
      filter_by_days: "",
      from_date: "",
      to_date: "",
    });
    setPage(1);
    setSelectedQueries([])
    fetchTasks(user, setQueries, setLoading, page, filters, setTotalRows);
  };

  const [multipleAssignOpen, setMultipleAssignOpen] = useState(false);
  const handleAsssignMultiple = () => {
    if (selectedQueries.length == 0) {
      toast.error("please select atleast one query");
      return;
    }
    setMultipleAssignOpen(true);
  };

  return (
        <div className="">
          <div className="text-xl font-bold mb-4 flex items-center justify-between">
            Dashboard
            <div className="flex gap-3">
              <button
                onClick={handleAsssignMultiple}
                className="p-1 rounded bg-orange-600 text-white f-11"
              >
                Assign Multiple
              </button>
              <button
                onClick={resetFilters}
                className="p-1 rounded hover:bg-gray-100"
              >
                <RefreshCcw size={14} className="text-gray-700" />
              </button>
            </div>
          </div>

          <div className="block bg-gray-100 rounded border-blue-400 p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 text-[11px]">
              {/* Search String */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-gray-600 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by Name / Email / Ref ID"
                  className="px-2 py-2.5 border rounded bg-white border-gray-300"
                  value={filters.filter_string}
                  onChange={(e) =>
                    setFilters({ ...filters, filter_string: e.target.value })
                  }
                />
              </div>

              {/* User Dropdown */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-gray-600 mb-1">
                  User
                </label>
                <Select
                  classNamePrefix="query-filter"
                  value={
                    users.find((u) => u.id == filters.user_id)
                      ? {
                          value: filters.user_id,
                          label: users.find((u) => u.id == filters.user_id)
                            ?.name,
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setFilters({
                      ...filters,
                      user_id: selectedOption?.value || "",
                    })
                  }
                  options={[
                    { value: "", label: "Select User" },
                    ...users.map((u) => ({
                      value: u.id,
                      label: u.name,
                    })),
                  ]}
                />
              </div>

              {/* Website Multi-select (max 3) */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-gray-600 mb-1">
                  Websites
                </label>
                <Select
                  classNamePrefix="query-filter"
                  isMulti
                  value={filters.website
                    .map((id) => {
                      const w = websites.find((web) => web.id == id);
                      return w ? { value: w.id, label: w.website } : null;
                    })
                    .filter(Boolean)}
                  onChange={(selectedOptions) => {
                    const selected = selectedOptions
                      .map((opt) => opt.value)
                      .slice(0, 3);
                    setFilters({ ...filters, website: selected });
                  }}
                  options={websites.map((web) => ({
                    value: web.id,
                    label: web.website,
                  }))}
                />
              </div>

              {/* Filter By Days */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-gray-600 mb-1">
                  Time Range
                </label>
                <select
                  className="px-2 py-2.5 border rounded bg-white border-gray-300"
                  value={filters.filter_by_days}
                  onChange={(e) =>
                    setFilters({ ...filters, filter_by_days: e.target.value })
                  }
                >
                  <option value="">Select Time Range</option>
                  <option value="today">Today</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 1 Month</option>
                  <option value="90">Last 3 Months</option>
                  <option value="365">Last 1 Year</option>
                </select>
              </div>

              {/* From Date */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-gray-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  className="px-2 py-2.5 border rounded bg-white border-gray-300"
                  value={filters.from_date}
                  onChange={(e) =>
                    setFilters({ ...filters, from_date: e.target.value })
                  }
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-gray-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  className="px-2 py-2.5 border rounded bg-white border-gray-300"
                  value={filters.to_date}
                  onChange={(e) =>
                    setFilters({ ...filters, to_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="w-full flex items-center justify-end">
              <button
                onClick={() =>
                  fetchTasks(
                    user,
                    setQueries,
                    setLoading,
                    page,
                    filters,
                    setTotalRows
                  )
                }
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div>Loading queries...</div>
          ) : queries.length === 0 ? (
            <div>No queries found.</div>
          ) : (
            <div className="bg-white  border-t-2 border-blue-400 rounded w-full f-13 mt-5 p-1">
              <div className="table-scrollable">
                <DataTable
                  data={queries}
                  columns={columns}
                  options={{
                    pageLength: 50,
                    ordering: false,
                    createdRow: (row, data) => {
                      $(row)
                        .find(".assign-btn")
                        .on("click", () => handleViewButtonClick(data));

                      // Attach row checkbox handler
                      $(row)
                        .find(".row-checkbox")
                        .on("change", handleRowCheckboxChange);
                    },
                    initComplete: () => {
                      // Attach Select All checkbox handler
                      $("#select-all").on("change", handleSelectAllChange);
                    },
                  }}
                />
              </div>
              <Pagination />
            </div>
          )}
          <AnimatePresence>
            {selectedQuery && assignOpen && (
              <AssignQuery
                query={selectedQuery}
                onClose={() => {
                  setAssignOpen(false);
                }}
              />
            )}
            {selectedQueries && multipleAssignOpen && (
              <AssignMultipleQuery
                queries={selectedQueries}
                onClose={() => {
                  setMultipleAssignOpen(false);
                }}
                after={()=>{setSelectedQueries([])}}
              />
            )}
          </AnimatePresence>
        </div>
  );
}

export default ManageQuery;
