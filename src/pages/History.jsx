import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/idb";
import { getSocket } from "../utils/Socket";

export default function History({ taskId, fetchAgain }) {
  const [remarks, setRemarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeTab, setActiveTab] = useState("remarks");
  const { user } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    fetchRemarks();
    fetchHistory();
    fetchReminders();
  }, [taskId, fetchAgain]);

  const fetchRemarks = async () => {
    const res = await fetch("https://loopback-skci.onrender.com/api/helper/getRemarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
    });
    const json = await res.json();
    if (json.status) setRemarks((json.data || []).reverse());
  };

  const fetchHistory = async () => {
    const res = await fetch("https://loopback-skci.onrender.com/api/helper/getHistory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
    });
    const json = await res.json();
    if (json.status) setHistory((json.data || []).reverse());
  };

  const fetchReminders = async () => {
    const res = await fetch("https://loopback-skci.onrender.com/api/helper/getReminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId, user_id: user?.id }),
    });
    const json = await res.json();
    if (json.status) setReminders((json.data || []).reverse());
  };

  const renderList = (items, renderItem) =>
    items.length === 0 ? (
      <div className="text-center text-gray-500 text-[13px] py-4 bg-white rounded">
        No {activeTab} found.
      </div>
    ) : (
      <div className="p-3 bg-white">{items.map(renderItem)}</div>
    );

  function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString.replace(" ", "T"));

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}

useEffect(() => {

  const handleRemarksAdded = (data) => {
      if (data.fld_task_id == taskId) {
      setRemarks((prev) => [
        {
          id: data.remarkId,
          fld_task_id: taskId,
          fld_admin_type: data.fld_admin_type,
          fld_remark: data.fld_remark,
          fld_file: data.fld_file,
          fld_addedon: data.fld_addedon,
          added_by_name: "User",
        },
        ...prev,
      ]);
    }
    };

  socket.on("remarksAdded", handleRemarksAdded);

  return () => {
    socket.off("remarksAdded", handleRemarksAdded); // Clean up on component unmount
  };
}, [taskId]);


  return (
    <div className="p-2 bg-gray-100 rounded w-full">
      <div className="flex space-x-3 mb-3">
        {["remarks", "history", "reminders"].map((tab) => (
          <button
            key={tab}
            className={`px-2 py-1 rounded transition leading-none text-[13px] transition border border-orange-400 ${
              activeTab === tab
                ? "bg-orange-400 text-white shadow"
                : "bg-orange-100 text-orange-800 hover:bg-orange-400 hover:text-white"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-h-[490px] overflow-y-auto ">
        {activeTab === "remarks" &&
          renderList(remarks, (item) => (
            <div key={item.id} className="relative pl-4 pt-2 pb-0 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-gray-300">
              <span class="absolute left-[-6.5px] top-2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></span>
              <div className="bg-gray-100 p-2 rounded">
                <div className="flex justify-between text-[12px]  mb-1">
                  <span>Added by : {item.added_by_name}</span>
                  <span className="text-[10px] text-gray-500">{formatDateTime(item.fld_addedon)}</span>
                </div>
              <div
                className="!text-[12px] text-gray-600 inner-content break-all"
                dangerouslySetInnerHTML={{ __html: item.fld_remark }}
              />
              {item.fld_file && (
                <div className="mt-2 space-y-1">
                  {item.fld_file.split(",").map((file, index) => {
                    const isFullUrl = file.startsWith("http");
                    const fileUrl = isFullUrl
                      ? file
                      : `https://www.apacvault.com/assets/closedtaskfileuploads/${file}`;
                    const fileName = file.split("/").pop(); // Just show the file name

                    return (
                      <div key={index}>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-xs underline break-all"
                        >
                          {fileName}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {item.benchmark_names && (
                <div className="mt-1 f-11 ">
                  Milestone: {item.benchmark_names.split(",").map((name,index,arr) =>(
                    <small key={index} className=" text-green-800  rounded f-11">{name} {index !== arr.length - 1 ? "|" : ""} </small>
                  ))}
                </div>
              )}
            </div>
              </div>
          ))}

        {activeTab === "history" &&
          renderList(history, (item) => (
            <div key={item.id} className="relative pl-4 pt-2 pb-0 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-gray-300">
              <span class="absolute left-[-6.5px] top-2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></span>
              <div className="bg-gray-100 p-2 rounded">
                <div className="flex justify-between f-11 text-gray-500 flex-wrap gap-1">
                  <span className="w-full text-gray-900">{item.fld_history}</span>
                  <span className="text-[10px] text-end w-full">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "reminders" &&
          renderList(reminders, (item) => (
            <div key={item.id} className="bg-gray-50 p-2 rounded shadow-sm">
              <div className="flex justify-between f-11 text-gray-500">
                <span>{item.notes}</span>
                <span className="text-[10px]">{formatDateTime(item.created_at)}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
