export const STORAGE_KEY = "storechore_premium_v1";
export const LEGACY_KEYS = ["store_command_center_v7"];

export const NAV_ITEMS = [
  { id: "home", label: "Today", icon: "⌂" },
  { id: "focus", label: "Focus", icon: "◇" },
  { id: "tasks", label: "Tasks", icon: "✓" },
  { id: "dates", label: "Dates", icon: "◷" },
  { id: "handoff", label: "Notes", icon: "✎" },
  { id: "more", label: "More", icon: "••" },
];

export const TASK_ZONES = [
  { id: "All", label: "All", icon: "○" },
  { id: "Bookwork", label: "Bookwork", icon: "▤" },
  { id: "Inventory", label: "Inventory", icon: "▦" },
  { id: "Cooler", label: "Cooler", icon: "❄" },
  { id: "Kitchen", label: "Kitchen", icon: "◒" },
  { id: "Truck", label: "Truck", icon: "▣" },
  { id: "Floor", label: "Floor", icon: "□" },
];

export const PRIORITIES = ["Critical", "High", "Normal", "Low"];
export const STATUSES = ["Not Started", "In Progress", "Blocked", "Completed", "Skipped"];

export const uid = (prefix = "item") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(value) {
  if (!value) return "Any time";
  return new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dueAt(task) {
  if (!task?.dueDate) return Number.POSITIVE_INFINITY;
  return new Date(`${task.dueDate}T${task.dueTime || "23:59"}:00`).getTime();
}

export function minutesUntilDue(task, now = Date.now()) {
  return Math.round((dueAt(task) - now) / 60000);
}

export function inferTaskZone(task) {
  const text = `${task?.title || ""} ${task?.description || ""} ${task?.department || ""}`.toLowerCase();

  if (text.includes("book") || text.includes("paperwork") || text.includes("change order") || text.includes("cash")) {
    return "Bookwork";
  }

  if (
    text.includes("inventory") ||
    text.includes("audit") ||
    text.includes("count") ||
    text.includes("cigarette") ||
    text.includes("lottery")
  ) {
    return "Inventory";
  }

  if (
    text.includes("cooler") ||
    text.includes("creamer") ||
    text.includes("dairy") ||
    text.includes("open-air") ||
    text.includes("expiration") ||
    text.includes("date watch")
  ) {
    return "Cooler";
  }

  if (
    text.includes("kitchen") ||
    text.includes("prep") ||
    text.includes("sandwich") ||
    text.includes("wrap") ||
    text.includes("salad") ||
    text.includes("dough")
  ) {
    return "Kitchen";
  }

  if (text.includes("truck") || text.includes("freight") || text.includes("receiving") || text.includes("tote")) {
    return "Truck";
  }

  return "Floor";
}

export function getTaskZone(task) {
  const zoneId = task?.zone || inferTaskZone(task);
  return TASK_ZONES.find((zone) => zone.id === zoneId) || TASK_ZONES[TASK_ZONES.length - 1];
}

export function taskScore(task, now = Date.now()) {
  if (["Completed", "Skipped"].includes(task.status)) return -9999;
  if (task.status === "Blocked") return -100;

  const priorityScore =
    {
      Critical: 130,
      High: 90,
      Normal: 45,
      Low: 15,
    }[task.priority] || 30;

  const minutes = minutesUntilDue(task, now);
  const urgencyScore =
    minutes < 0 ? 190 : minutes <= 30 ? 150 : minutes <= 60 ? 120 : minutes <= 180 ? 75 : minutes <= 480 ? 35 : 0;

  const activeBoost = task.status === "In Progress" ? 100 : 0;
  const quickWinBoost = Number(task.estimate) <= 10 ? 16 : 0;

  return priorityScore + urgencyScore + activeBoost + quickWinBoost;
}

export function taskReason(task, now = Date.now()) {
  const minutes = minutesUntilDue(task, now);

  if (task.status === "In Progress") return "You already started it, so finishing it comes first.";
  if (minutes < 0) return `It is overdue and marked ${String(task.priority).toLowerCase()} priority.`;
  if (minutes <= 30) return `It is due in about ${Math.max(minutes, 1)} minutes and should take ${task.estimate} minutes.`;
  if (minutes <= 60) return `It is due within an hour and should take about ${task.estimate} minutes.`;
  if (task.priority === "Critical") return "It is critical and should be protected before lower-impact work.";
  if (Number(task.estimate) <= 10) return "It is a quick win that clears an important item from the board.";

  return "It has the strongest mix of urgency, priority, and floor impact right now.";
}

export function dateInfo(item) {
  if (item.status === "Handled") return { label: "Handled", tone: "success", rank: 99 };
  if (!item.expirationDate) return { label: "No date", tone: "neutral", rank: 50 };

  const difference = Math.round(
    (new Date(`${item.expirationDate}T12:00:00`) - new Date(`${todayISO()}T12:00:00`)) / 86400000,
  );

  if (difference < 0) return { label: "Expired", tone: "danger", rank: 0 };
  if (difference === 0) return { label: "Pull today", tone: "danger", rank: 1 };
  if (difference <= 3) return { label: `${difference} days`, tone: "warning", rank: 2 };
  if (difference <= 7) return { label: `${difference} days`, tone: "watch", rank: 3 };
  return { label: "Safe", tone: "success", rank: 5 };
}

export function createInitialState() {
  return {
    profile: {
      name: "Jamison",
      role: "Center Store Manager",
      store: "Store 2593",
      shift: "Open",
    },
    tasks: [
      {
        id: uid("task"),
        title: "Complete opening manager walk",
        description: "Check exterior, restrooms, counter, coffee, cooler, kitchen, and visible standards.",
        department: "Whole Store",
        zone: "Floor",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "07:30",
        estimate: 20,
        priority: "Critical",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Finish manager bookwork",
        description: "Protect the paperwork window before register coverage and floor interruptions begin.",
        department: "Office",
        zone: "Bookwork",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "08:45",
        estimate: 35,
        priority: "Critical",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Review Date Watch",
        description: "Pull expired product and flag anything due within three days.",
        department: "Center Store",
        zone: "Cooler",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "09:15",
        estimate: 15,
        priority: "High",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Cigarette audit",
        description: "Verify counts, outs, and backbar condition.",
        department: "Front",
        zone: "Inventory",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "10:00",
        estimate: 15,
        priority: "High",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Open-air cooler recovery",
        description: "Face high-traffic cooler rows and fix visible outs first.",
        department: "Center Store",
        zone: "Cooler",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "11:30",
        estimate: 25,
        priority: "High",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Pick one visible win",
        description: "Make one high-traffic area noticeably better before leaving.",
        department: "Center Store",
        zone: "Floor",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "13:30",
        estimate: 25,
        priority: "Normal",
        status: "Not Started",
      },
    ],
    dates: [
      {
        id: uid("date"),
        name: "Half & Half Creamer",
        area: "Dairy",
        location: "Open-air cooler",
        quantity: 4,
        expirationDate: todayISO(),
        status: "Watching",
        notes: "Check today.",
      },
      {
        id: uid("date"),
        name: "French Vanilla Creamer",
        area: "Dairy",
        location: "Open-air cooler",
        quantity: 4,
        expirationDate: addDays(2),
        status: "Watching",
        notes: "Watch pull timing.",
      },
    ],
    handoffs: [
      {
        id: uid("handoff"),
        author: "Previous Shift",
        shift: "Close",
        category: "Needs Attention",
        message: "Cooler recovery is partly finished. Energy drinks and water still need attention.",
        status: "Open",
        createdAt: new Date().toISOString(),
      },
    ],
    reminders: [
      { id: uid("reminder"), text: "Review change order and receiving paperwork", done: false },
      { id: uid("reminder"), text: "Check lottery before leaving", done: false },
    ],
    truck: [
      "Clear receiving path",
      "Assign cooler, freezer, totes, water, and center store",
      "Receive and check damage",
      "Move cold freight first",
      "Work visible outs",
      "Break down cardboard",
      "Final backstock check",
    ].map((title) => ({ id: uid("truck"), title, done: false })),
  };
}

export function normalizeState(saved) {
  const base = createInitialState();
  const source = saved && typeof saved === "object" ? saved : {};

  return {
    profile: {
      ...base.profile,
      ...(source.profile || {}),
    },
    tasks: Array.isArray(source.tasks)
      ? source.tasks.map((task) => ({
          id: task.id || uid("task"),
          title: task.title || "Untitled task",
          description: task.description || "",
          department: task.department || "Store",
          zone: task.zone || inferTaskZone(task),
          assignee: task.assignee || source.profile?.name || base.profile.name,
          dueDate: task.dueDate || todayISO(),
          dueTime: task.dueTime || "12:00",
          estimate: Number(task.estimate) || 15,
          priority: PRIORITIES.includes(task.priority) ? task.priority : "Normal",
          status: STATUSES.includes(task.status) ? task.status : "Not Started",
          startedAt: task.startedAt || null,
          completedAt: task.completedAt || null,
          blockedAt: task.blockedAt || null,
        }))
      : base.tasks,
    dates: Array.isArray(source.dates)
      ? source.dates.map((item) => ({
          id: item.id || uid("date"),
          name: item.name || "Unnamed product",
          area: item.area || "Center Store",
          location: item.location || "",
          quantity: Number(item.quantity) || 1,
          expirationDate: item.expirationDate || todayISO(),
          status: item.status || "Watching",
          notes: item.notes || "",
        }))
      : base.dates,
    handoffs: Array.isArray(source.handoffs)
      ? source.handoffs.map((item) => ({
          id: item.id || uid("handoff"),
          author: item.author || source.profile?.name || base.profile.name,
          shift: item.shift || source.profile?.shift || base.profile.shift,
          category: item.category || "Needs Attention",
          message: item.message || "",
          status: item.status || "Open",
          createdAt: item.createdAt || new Date().toISOString(),
        }))
      : base.handoffs,
    reminders: Array.isArray(source.reminders)
      ? source.reminders.map((item) => ({
          id: item.id || uid("reminder"),
          text: item.text || "Reminder",
          done: Boolean(item.done),
        }))
      : base.reminders,
    truck: Array.isArray(source.truck)
      ? source.truck.map((item) =>
          typeof item === "string"
            ? { id: uid("truck"), title: item, done: false }
            : {
                id: item.id || uid("truck"),
                title: item.title || "Truck task",
                done: Boolean(item.done),
              },
        )
      : base.truck,
  };
}

export function loadState() {
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) return normalizeState(JSON.parse(current));

    for (const key of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (legacy) return normalizeState(JSON.parse(legacy));
    }

    return createInitialState();
  } catch {
    return createInitialState();
  }
}

export function createDraft(type) {
  if (type === "date") {
    return {
      name: "",
      area: "Center Store",
      location: "",
      quantity: 1,
      expirationDate: todayISO(),
      notes: "",
    };
  }

  if (type === "handoff") {
    return {
      category: "Needs Attention",
      message: "",
    };
  }

  return {
    title: "",
    description: "",
    zone: "Floor",
    department: "Center Store",
    dueTime: "12:00",
    estimate: 15,
    priority: "Normal",
  };
}
