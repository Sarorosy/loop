import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function MilestoneInfo({ taskId }) {
  const [milestones, setMilestones] = useState([]);

  const fetchMilestones = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/helper/getTaskMilestones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });
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
    <div className="text-sm">
      <h3 className="font-semibold mb-2">Milestones</h3>
      {milestones.map((milestone) => (
        <div key={milestone.benchmark_id} className="mb-3">
          <div className={milestone.completed ? "text-green-600 font-medium" : ""}>
            {milestone.name}
            {milestone.completed_by ? (
              <span className="text-xs text-gray-500 ml-1">[{milestone.completed_by}]</span>
            ) : null}
          </div>
          <div className="text-gray-600">
            Deadline: {formatDate(milestone.deadline)}
          </div>
        </div>
      ))}
    </div>
  );
}
