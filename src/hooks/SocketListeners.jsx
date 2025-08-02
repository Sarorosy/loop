// utils/socketListeners.js

export const handleTaskCreated = (user, setTasks, page) => (task) => {
  console.log("📥 task_created:", task);

  const isSuperAdmin = user?.fld_admin_type === "SUPERADMIN";
  const isAssignedToUser = parseInt(task.fld_assign_to) === parseInt(user?.id);
  const isCreatedByUser = parseInt(task.fld_added_by) === parseInt(user?.id);
  const isFollower = task?.fld_follower
    ?.split(",")
    .map((id) => id.trim())
    .includes(String(user?.id));

  // Conditions based on page
  if (
    ((page === "dashboard" || page === "teamtasks") && isSuperAdmin) ||
    (page === "createdbyme" && isCreatedByUser) ||
    (page === "following" && isFollower) ||
    isAssignedToUser
  ) {
    setTasks((prev) => [task, ...prev]);
  }
};

export const handleTaskUpdated = (setTasks) => (updatedTask) => {
  setTasks((prev) =>
    prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
  );
};

export const handleTaskDeleted = (setTasks) => (deletedId) => {
  setTasks((prev) => prev.filter((task) => task.id !== deletedId));
};


export const handleReminderAdded = (user, setTasks) => ({ user_id, task_id }) => {
  // Only update if the reminder belongs to the current user
  if (parseInt(user.id) != parseInt(user_id)) return;

  setTasks((prev) =>
    prev.map((task) =>
      task.task_id == task_id ? { ...task, hasReminder: 1 } : task
    )
  );
};
