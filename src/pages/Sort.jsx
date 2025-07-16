import React from "react";

const Sort = ({ setTasks }) => {
  const handleSortChange = (e) => {
    const value = e.target.value;
    const [type, order] = value.split("-");

    const sortField = type === "created" ? "fld_addedon" : "fld_due_date";

    setTasks((prevTasks) => {
      const sortedTasks = [...prevTasks].sort((a, b) => {
        const dateA = new Date(a[sortField]);
        const dateB = new Date(b[sortField]);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });

      return sortedTasks;
    });
  };

  return (
    <select
  className="text-[11px] px-2 py-1 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
  onChange={handleSortChange}
>
  <option value="created-desc" defaultValue>
    Newest : Created Date
  </option>
  <option value="created-asc">Oldest : Created Date</option>
  <option value="due-desc">Newest : Due Date</option>
  <option value="due-asc">Oldest : Due Date</option>
</select>

  );
};

export default Sort;
