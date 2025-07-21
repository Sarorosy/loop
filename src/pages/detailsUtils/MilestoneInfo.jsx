import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { FlagIcon } from "lucide-react";

export default function MilestoneInfo({ taskId }) {
  const [milestones, setMilestones] = useState([]);

  const fetchMilestones = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/helper/getTaskMilestones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId }),
        }
      );
      const data = await response.json();
      if (data.status) {
        setMilestones(data.data);
      } else {
        toast.error(data.message || "Failed to fetch milestones");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching milestones");
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [taskId]);

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy, h:mm a");
    } catch {
      return "-";
    }
  };

  return (
    <div className="">
      <div className="flex items-center gap-1 mb-3">
        <FlagIcon size={13} className="text-green-600" />
        <h3 className="text-[13px] font-semibold text-gray-900 flex items-center leading-none">
          Milestones
        </h3>
      </div>
      <div className=" max-h-[230px] overflow-y-auto pr-2 flex flex-col gap-2">
      {milestones.map((milestone) => (
        <div key={milestone.benchmark_id} className="bg-gray-50 shadow px-2 py-2 rounded flex gap-2 items-center">
          <div
            className={milestone.completed ? "text-green-600 text-[13px] font-medium" : "text-[13px] leading-none"}
          >
            {milestone.name}
            {milestone.completed_by ? (
              <span className="text-[12px] text-gray-500 ml-1 leading-none">
                [{milestone.completed_by}]
              </span>
            ) : null}
          </div>
          <span className="text-[13px] leading-none">|</span>
          <div className="text-gray-600 text-[12px] leading-none">
            Deadline: {milestone.deadline ? formatDate(milestone.deadline) : "No deadline set"}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
