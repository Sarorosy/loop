// components/SocketHandler.jsx
import { useEffect } from "react";
import { getSocket } from "../utils/Socket";
import { useAuth } from "../utils/idb";
import {
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskDeleted,
  handleReminderAdded,
} from "./SocketListeners";

export default function SocketHandler({ setTasks, page }) {
  const { user } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    if (!user?.id) return;

    const onCreated = handleTaskCreated(user, setTasks, page);
    const onUpdated = handleTaskUpdated(setTasks);
    const onDeleted = handleTaskDeleted(setTasks);
    const onReminder = handleReminderAdded(user, setTasks);

    socket.on("task_created", onCreated);
    socket.on("task_updated", onUpdated);
    socket.on("task_deleted", onDeleted);
    socket.on("newReminder", onReminder);

    return () => {
      socket.off("task_created", onCreated);
      socket.off("task_updated", onUpdated);
      socket.off("task_deleted", onDeleted);
      socket.off("newReminder", onReminder);
    };
  }, [user?.id]);

  return null;
}
