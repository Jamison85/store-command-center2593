import { OLD_DATES_KEY, OLD_HANDOFF_KEY, OLD_SESSION_KEY, STORAGE_KEY } from "./constants.js";
import { makeDefaultState } from "./defaults.js";
import { id, todayISO } from "./helpers.js";

export function migrateOldState() {
  const fallback = makeDefaultState();
  try {
    const oldSession = JSON.parse(localStorage.getItem(OLD_SESSION_KEY) || "null");
    const oldDates = JSON.parse(localStorage.getItem(OLD_DATES_KEY) || "null");
    const oldHandoffs = JSON.parse(localStorage.getItem(OLD_HANDOFF_KEY) || "null");
    if (!oldSession && !oldDates && !oldHandoffs) return fallback;

    const migratedTasks = Array.isArray(oldSession?.tasks) ? oldSession.tasks.map((task) => ({
      id: task.id || id("task"),
      title: task.title || "Untitled task",
      description: task.description || "",
      department: task.department || "Whole Store",
      assignee: task.assignee || "Jamison",
      shift: oldSession.shiftType || "Open",
      dueDate: oldSession.date || todayISO(),
      dueTime: String(task.timing || "").includes("10") ? "10:00" : "13:00",
      estimate: 20,
      priority: task.priority === "Must Do" ? "High" : task.priority === "Can Wait" ? "Low" : "Normal",
      status: task.status === "Complete" ? "Completed" : task.status === "In Progress" ? "In Progress" : "Not Started",
      notes: task.notes || "",
      waitingOn: "",
      createdAt: new Date().toISOString(),
    })) : fallback.tasks;

    const migratedDates = Array.isArray(oldDates) ? oldDates.map((item) => ({
      id: item.id || id("date"), name: item.name || "Unnamed product", brand: item.brand || "", area: item.area || "Center Store",
      location: item.location || "", quantity: Number(item.quantity) || 1, expirationDate: item.expirationDate || "",
      status: item.resolved ? "Handled" : "Watching", notes: item.notes || "", enteredAt: new Date().toISOString(),
    })) : fallback.dates;

    const migratedHandoffs = Array.isArray(oldHandoffs) ? oldHandoffs.slice(0, 30).map((item) => ({
      id: item.id || id("handoff"), author: item.managerName || item.author || "Previous Shift", shift: item.shiftType || item.shift || "Other",
      category: item.category || "Follow Up", priority: item.priority || "Normal", message: item.summary || item.message || item.notes || "Imported handoff",
      relatedTaskId: "", status: item.resolvedAt ? "Resolved" : "Open", acknowledgedBy: item.acknowledgedBy || "",
      acknowledgedAt: item.acknowledgedAt || "", resolvedBy: item.resolvedBy || "", resolvedAt: item.resolvedAt || "",
      createdAt: item.createdAt || new Date().toISOString(), comments: [],
    })) : fallback.handoffs;

    return { ...fallback, tasks: migratedTasks, dates: migratedDates, handoffs: migratedHandoffs };
  } catch {
    return fallback;
  }
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...makeDefaultState(), ...JSON.parse(saved) } : migrateOldState();
  } catch {
    return makeDefaultState();
  }
}
