import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/idb";

export default function History({ taskId }) {
  const [remarks, setRemarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeTab, setActiveTab] = useState("remarks");
  const { user } = useAuth();

  useEffect(() => {
    fetchRemarks();
    fetchHistory();
    fetchReminders();
  }, [taskId]);

  const fetchRemarks = async () => {
    const res = await fetch("http://localhost:5000/api/helper/getRemarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
    });
    const json = await res.json();
    if (json.status) setRemarks((json.data || []).reverse());
  };

  const fetchHistory = async () => {
    const res = await fetch("http://localhost:5000/api/helper/getHistory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
    });
    const json = await res.json();
    if (json.status) setHistory((json.data || []).reverse());
  };

  const fetchReminders = async () => {
    const res = await fetch("http://localhost:5000/api/helper/getReminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId, user_id: user?.id }),
    });
    const json = await res.json();
    if (json.status) setReminders((json.data || []).reverse());
  };

  const renderList = (items, renderItem) =>
    items.length === 0 ? (
      <div className="text-center text-gray-500 text-sm py-4 bg-white rounded">
        No {activeTab} found.
      </div>
    ) : (
      <div className="space-y-4 p-3 bg-white">{items.map(renderItem)}</div>
    );

  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString.replace(" ", "T")); // Make sure it's parseable

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" }); // e.g., Feb
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  }

  return (
    <div className="p-3 bg-gray-100 rounded">
      <div className="flex space-x-3 mb-3">
        {["remarks", "history", "reminders"].map((tab) => (
          <button
            key={tab}
            className={`px-2 py-1.5 rounded transition leading-none text-[14px] transition ${
              activeTab === tab
                ? "bg-orange-400 text-white shadow"
                : "bg-gray-300 text-gray-800 hover:bg-orange-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-h-[538px] overflow-y-auto space-y-1 ">
        {activeTab === "remarks" &&
          renderList(remarks, (item) => (
            <div key={item.id} className="bg-gray-50 p-2 rounded shadow-sm">
              <div className="flex justify-between f-11 text-gray-500 mb-1">
                <span>{item.added_by_name}</span>
                <span>{formatDateTime(item.fld_addedon)}</span>
              </div>
              <div
                className="f-12 text-gray-800"
                dangerouslySetInnerHTML={{ __html: item.fld_remark }}
              />
              {item.fld_benchmarks && (
                <div className="mt-2 f-11 text-green-600">
                  Benchmark: {item.fld_benchmarks}
                </div>
              )}
            </div>
          ))}

        {activeTab === "history" &&
          renderList(history, (item) => (
            <div key={item.id} className="bg-gray-50 p-2 rounded shadow-sm">
              <div className="flex justify-between f-11 text-gray-500">
                <span>{item.fld_history}</span>
                <span>{formatDateTime(item.created_at)}</span>
              </div>
            </div>
          ))}

        {activeTab === "reminders" &&
          renderList(reminders, (item) => (
            <div key={item.id} className="bg-gray-50 p-2 rounded shadow-sm">
              <div className="flex justify-between f-11 text-gray-500">
                <span>{item.notes}</span>
                <span>{formatDateTime(item.created_at)}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
