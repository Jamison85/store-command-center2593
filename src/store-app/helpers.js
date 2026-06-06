export function id(prefix = "item") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDate(value, options = {}) {
  if (!value) return "No date";
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(options.year ? { year: "numeric" } : {}),
  });
}

export function formatTime(value) {
  if (!value) return "Any time";
  const [hour, minute] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function dueTimestamp(task) {
  if (!task.dueDate) return Number.POSITIVE_INFINITY;
  const time = task.dueTime || "23:59";
  return new Date(`${task.dueDate}T${time}:00`).getTime();
}

export function taskScore(task, now = Date.now()) {
  if (task.status === "Completed" || task.status === "Skipped") return -10000;
  if (task.status === "Blocked") return -500;

  const priorityScore = { Critical: 120, High: 80, Normal: 40, Low: 10 }[task.priority] || 20;
  const due = dueTimestamp(task);
  const minutesUntilDue = Number.isFinite(due) ? (due - now) / 60000 : 100000;
  let urgency = 0;

  if (minutesUntilDue < 0) urgency = 180;
  else if (minutesUntilDue <= 60) urgency = 120;
  else if (minutesUntilDue <= 180) urgency = 80;
  else if (minutesUntilDue <= 720) urgency = 40;
  else if (minutesUntilDue <= 1440) urgency = 20;

  const activeBoost = task.status === "In Progress" ? 90 : 0;
  const quickWin = Number(task.estimate) <= 10 ? 18 : Number(task.estimate) <= 20 ? 8 : 0;
  const assignedBoost = task.assignee === "Jamison" || task.assignee === "Me" ? 10 : 0;
  const dependencyPenalty = task.waitingOn ? -30 : 0;
  return priorityScore + urgency + activeBoost + quickWin + assignedBoost + dependencyPenalty;
}

export function taskReason(task) {
  const due = dueTimestamp(task);
  const minutes = (due - Date.now()) / 60000;
  if (task.status === "In Progress") return "You already started it. Finishing beats creating another half-done mystery.";
  if (minutes < 0) return `It is overdue and marked ${task.priority.toLowerCase()} priority.`;
  if (minutes <= 60) return `It is due within the next hour and should take about ${task.estimate} minutes.`;
  if (minutes <= 180) return `It is due soon and is one of the highest-impact open tasks.`;
  if (task.priority === "Critical") return "It is critical and should be protected before lower-impact work.";
  if (Number(task.estimate) <= 10) return "It is a quick win that clears an important item from the board.";
  return `It is the strongest combination of priority, timing, and impact right now.`;
}

export function getDateUrgency(item) {
  if (item.status === "Handled") return { label: "Handled", rank: 99, tone: "success" };
  if (!item.expirationDate) return { label: "No date", rank: 80, tone: "neutral" };
  const today = new Date(`${todayISO()}T12:00:00`);
  const expiration = new Date(`${item.expirationDate}T12:00:00`);
  const days = Math.round((expiration - today) / 86400000);
  if (days < 0) return { label: "Expired", rank: 0, tone: "danger" };
  if (days === 0) return { label: "Due today", rank: 1, tone: "danger" };
  if (days <= 3) return { label: `${days} day${days === 1 ? "" : "s"}`, rank: 2, tone: "warning" };
  if (days <= 7) return { label: `${days} days`, rank: 3, tone: "warning" };
  if (days <= 14) return { label: `${days} days`, rank: 4, tone: "neutral" };
  return { label: "Safe", rank: 5, tone: "success" };
}
