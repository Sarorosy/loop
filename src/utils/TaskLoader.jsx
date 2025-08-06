import React from "react";
import InfinityLoader from "./InfinityLoader";

const TaskLoader = ({ rows = 5 }) => {
  return (
    <div className="relative">
      {/* Infinity Loader Overlay */}
      <div className="absolute top-[20%] right-[47%] z-10 flex items-center justify-center bg-white/70 pointer-events-none">
        <InfinityLoader />
      </div>
    <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
      

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-100 text-xs text-left font-semibold text-gray-700">
          <tr>
            <th className="px-3 py-2">Task</th>
            <th className="px-3 py-2">Assigned To</th>
            <th className="px-3 py-2">Bucket Name</th>
            <th className="px-3 py-2">Progress</th>
            <th className="px-3 py-2">Due Date & Time</th>
            <th className="px-3 py-2">Tag</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Created Date</th>
            <th className="px-3 py-2">Assigned By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-[13px] ">
          
          {Array.from({ length: rows }).map((_, idx) => (
            <tr key={idx} className="animate-pulse">
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9
              ].map((cell, i) => (
                <td key={i} className="px-3 py-8">
                  <div className="h-8 bg-gray-300 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default TaskLoader;
