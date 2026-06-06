import React, { useEffect, useMemo, useState } from "react";

const h = React.createElement;
const STORAGE_KEY = "store_command_center_v7";

const NAV_ITEMS = [
  ["home", "Home", "⌂"],
  ["next", "Next", "→"],
  ["tasks", "Tasks", "✓"],
  ["dates", "Dates", "◫"],
  ["handoff", "Handoff", "✎"],
  ["more", "More", "•••"],
];

const uid = (prefix = "item") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Any time";
  return new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function dueAt(task) {
  if (!task.dueDate) return Number.POSITIVE_INFINITY;
  return new Date(`${task.dueDate}T${task.dueTime || "23:59"}:00`).getTime();
}

function taskScore(task) {
  if (["Completed", "Skipped"].includes(task.status)) return -9999;
  if (task.status === "Blocked") return -100;

  const priorityScore = {
    Critical: 120,
    High: 80,
    Normal: 40,
    Low: 10,
  }[task.priority] || 20;

  const minutesUntilDue = (dueAt(task) - Date.now()) / 60000;
  const urgencyScore =
    minutesUntilDue < 0
      ? 180
      : minutesUntilDue <= 60
        ? 120
        : minutesUntilDue <= 180
          ? 80
          : minutesUntilDue <= 720
            ? 40
            : 0;

  const activeBoost = task.status === "In Progress" ? 90 : 0;
  const quickWinBoost = Number(task.estimate) <= 10 ? 18 : 0;
  return priorityScore + urgencyScore + activeBoost + quickWinBoost;
}

function taskReason(task) {
  const minutesUntilDue = (dueAt(task) - Date.now()) / 60000;
  if (task.status === "In Progress") {
    return "You already started it. Finishing beats creating another half-done mystery.";
  }
  if (minutesUntilDue < 0) {
    return `It is overdue and marked ${task.priority.toLowerCase()} priority.`;
  }
  if (minutesUntilDue <= 60) {
    return `It is due within an hour and should take about ${task.estimate} minutes.`;
  }
  if (task.priority === "Critical") {
    return "It is critical and should be protected before lower-impact work.";
  }
  if (Number(task.estimate) <= 10) {
    return "It is a quick win that clears an important item from the board.";
  }
  return "It is the strongest combination of urgency, priority, and impact right now.";
}

function dateInfo(item) {
  if (item.status === "Handled") {
    return { label: "Handled", tone: "success", rank: 99 };
  }
  if (!item.expirationDate) {
    return { label: "No date", tone: "neutral", rank: 50 };
  }

  const difference = Math.round(
    (new Date(`${item.expirationDate}T12:00:00`) -
      new Date(`${todayISO()}T12:00:00`)) /
      86400000,
  );

  if (difference < 0) return { label: "Expired", tone: "danger", rank: 0 };
  if (difference === 0) return { label: "Due today", tone: "danger", rank: 1 };
  if (difference <= 3) return { label: `${difference} days`, tone: "warning", rank: 2 };
  if (difference <= 7) return { label: `${difference} days`, tone: "warning", rank: 3 };
  return { label: "Safe", tone: "success", rank: 5 };
}

function createInitialState() {
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
        description:
          "Check exterior, restrooms, counter, coffee, cooler, kitchen, and visible standards.",
        department: "Whole Store",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "08:00",
        estimate: 20,
        priority: "Critical",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Review Date Watch",
        description: "Pull expired product and flag anything due within three days.",
        department: "Center Store",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "09:00",
        estimate: 15,
        priority: "High",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Cigarette audit",
        description: "Verify counts, outs, and backbar condition.",
        department: "Front",
        assignee: "Jamison",
        dueDate: todayISO(),
        dueTime: "10:00",
        estimate: 15,
        priority: "High",
        status: "Not Started",
      },
      {
        id: uid("task"),
        title: "Pick one visible win",
        description: "Make one high-traffic area noticeably better before leaving.",
        department: "Center Store",
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
        message:
          "Cooler recovery is partly finished. Energy drinks and water still need attention.",
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

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function Badge({ text, tone = "neutral" }) {
  return h("span", { className: `badge badge-${tone}` }, text);
}

function Button({ text, kind = "secondary", onClick }) {
  return h(
    "button",
    { className: `button button-${kind}`, onClick, type: "button" },
    text,
  );
}

function Empty({ title, message }) {
  return h(
    "div",
    { className: "empty" },
    h("strong", null, title),
    h("p", null, message),
  );
}

function PageTitle({ kicker, title, description, action }) {
  return h(
    "section",
    { className: "page-title" },
    h(
      "div",
      null,
      h("p", { className: "eyebrow" }, kicker),
      h("h1", null, title),
      h("p", null, description),
    ),
    action || null,
  );
}

function TaskCard({ task, setStatus }) {
  const overdue = dueAt(task) < Date.now() && task.status !== "Completed";
  const tone =
    task.status === "Completed"
      ? "success"
      : overdue || task.priority === "Critical"
        ? "danger"
        : task.priority === "High"
          ? "warning"
          : "neutral";

  return h(
    "article",
    { className: `task-card ${task.status.toLowerCase().replaceAll(" ", "-")}` },
    h(
      "div",
      null,
      h(
        "div",
        { className: "spread" },
        h(Badge, { text: overdue ? "Overdue" : task.priority, tone }),
        h("small", null, `${task.estimate} min`),
      ),
      h("h3", null, task.title),
      h("p", null, task.description),
      h(
        "div",
        { className: "chips" },
        h("span", null, task.department),
        h("span", null, task.assignee),
        h("span", null, `${formatDate(task.dueDate)} · ${formatTime(task.dueTime)}`),
      ),
    ),
    h(
      "div",
      { className: "actions" },
      task.status !== "In Progress" && task.status !== "Completed"
        ? h(Button, {
            text: "Start",
            kind: "primary",
            onClick: () => setStatus(task.id, "In Progress"),
          })
        : null,
      task.status !== "Completed"
        ? h(Button, {
            text: "Complete",
            kind: "success",
            onClick: () => setStatus(task.id, "Completed"),
          })
        : null,
      task.status !== "Completed"
        ? h(Button, {
            text: "Block",
            onClick: () => setStatus(task.id, "Blocked"),
          })
        : null,
    ),
  );
}

function NextCard({ task, setStatus, showNext }) {
  if (!task) {
    return h(
      "section",
      { className: "next-card" },
      h(Empty, {
        title: "Nothing urgent is waiting.",
        message: "Apparently the store has briefly stopped inventing problems.",
      }),
    );
  }

  return h(
    "section",
    { className: "next-card" },
    h(
      "div",
      { className: "spread" },
      h(
        "div",
        null,
        h("p", { className: "eyebrow" }, "What do I do next?"),
        h(Badge, {
          text: task.priority,
          tone: task.priority === "Critical" ? "danger" : "warning",
        }),
      ),
      h("span", { className: "next-icon" }, "→"),
    ),
    h("h2", null, task.title),
    h("p", { className: "reason" }, taskReason(task)),
    h(
      "div",
      { className: "facts" },
      h("span", null, `${task.estimate} minutes`),
      h("span", null, `Due ${formatTime(task.dueTime)}`),
      h("span", null, task.department),
    ),
    h(
      "div",
      { className: "actions" },
      task.status !== "In Progress"
        ? h(Button, {
            text: "Start task",
            kind: "primary",
            onClick: () => setStatus(task.id, "In Progress"),
          })
        : null,
      h(Button, {
        text: "Complete",
        kind: "success",
        onClick: () => setStatus(task.id, "Completed"),
      }),
      h(Button, {
        text: "Blocked",
        onClick: () => setStatus(task.id, "Blocked"),
      }),
      h("button", { className: "link-btn", onClick: showNext, type: "button" }, "Show another"),
    ),
  );
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [page, setPage] = useState("home");
  const [taskFilter, setTaskFilter] = useState("Open");
  const [dateFilter, setDateFilter] = useState("Active");
  const [handoffFilter, setHandoffFilter] = useState("Open");
  const [focusIndex, setFocusIndex] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const openTasks = useMemo(
    () => state.tasks.filter((task) => !["Completed", "Skipped"].includes(task.status)),
    [state.tasks],
  );

  const queue = useMemo(
    () => [...openTasks].sort((a, b) => taskScore(b) - taskScore(a)),
    [openTasks],
  );

  const nextTask = queue.length ? queue[focusIndex % queue.length] : null;
  const overdueTasks = openTasks.filter((task) => dueAt(task) < Date.now());
  const urgentDates = state.dates.filter((item) => dateInfo(item).rank <= 2);
  const openHandoffs = state.handoffs.filter((item) => item.status !== "Resolved");
  const completedCount = state.tasks.filter((task) => task.status === "Completed").length;
  const progress = state.tasks.length
    ? Math.round((completedCount / state.tasks.length) * 100)
    : 100;

  function changeState(updater) {
    setState((current) => updater(current));
  }

  function setTaskStatus(taskId, status) {
    changeState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    }));
    setFocusIndex(0);
    setToast(`Task marked ${status.toLowerCase()}.`);
  }

  function addTask() {
    const title = window.prompt("Task name");
    if (!title) return;
    const department = window.prompt("Department", "Center Store") || "Center Store";
    const dueTime = window.prompt("Due time (24-hour)", "12:00") || "12:00";
    const priority = window.prompt(
      "Priority: Critical, High, Normal, or Low",
      "Normal",
    ) || "Normal";

    changeState((current) => ({
      ...current,
      tasks: [
        {
          id: uid("task"),
          title,
          description: window.prompt("Description", "") || "",
          department,
          assignee: current.profile.name,
          dueDate: todayISO(),
          dueTime,
          estimate: Number(window.prompt("Estimated minutes", "15")) || 15,
          priority,
          status: "Not Started",
        },
        ...current.tasks,
      ],
    }));
    setToast("Task added.");
  }

  function addDateItem() {
    const name = window.prompt("Product name");
    if (!name) return;
    changeState((current) => ({
      ...current,
      dates: [
        {
          id: uid("date"),
          name,
          area: window.prompt("Area", "Center Store") || "Center Store",
          location: window.prompt("Location", "") || "",
          quantity: Number(window.prompt("Quantity", "1")) || 1,
          expirationDate:
            window.prompt("Expiration date (YYYY-MM-DD)", todayISO()) || todayISO(),
          status: "Watching",
          notes: window.prompt("Notes", "") || "",
        },
        ...current.dates,
      ],
    }));
    setToast("Date item added.");
  }

  function addHandoff() {
    const message = window.prompt("What does the next shift need to know?");
    if (!message) return;
    changeState((current) => ({
      ...current,
      handoffs: [
        {
          id: uid("handoff"),
          author: current.profile.name,
          shift: current.profile.shift,
          category: window.prompt("Category", "Needs Attention") || "Needs Attention",
          message,
          status: "Open",
          createdAt: new Date().toISOString(),
        },
        ...current.handoffs,
      ],
    }));
    setToast("Handoff added.");
  }

  const metrics = h(
    "section",
    { className: "metrics" },
    [
      [openTasks.length, "Open tasks", "tasks", "teal"],
      [overdueTasks.length, "Overdue", "tasks", "red"],
      [urgentDates.length, "Date alerts", "dates", "amber"],
      [openHandoffs.length, "Handoff items", "handoff", "navy"],
    ].map(([count, label, targetPage, color]) =>
      h(
        "button",
        {
          className: "metric",
          onClick: () => setPage(targetPage),
          key: label,
          type: "button",
        },
        h("i", { className: color }),
        h("strong", null, count),
        h("span", null, label),
      ),
    ),
  );

  const homePage = h(
    "div",
    { className: "stack" },
    h(
      "section",
      { className: "welcome" },
      h(
        "div",
        null,
        h("p", { className: "eyebrow" }, formatDate(todayISO())),
        h(
          "h1",
          null,
          `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${state.profile.name}.`,
        ),
        h("p", null, "Here is what needs attention without the usual scavenger hunt."),
      ),
      h(
        "div",
        { className: "ring", style: { "--p": `${progress * 3.6}deg` } },
        h("div", null, h("strong", null, `${progress}%`), h("span", null, "done")),
      ),
    ),
    h(NextCard, {
      task: nextTask,
      setStatus: setTaskStatus,
      showNext: () => setFocusIndex((value) => value + 1),
    }),
    metrics,
    h(
      "div",
      { className: "columns" },
      h(
        "section",
        { className: "card" },
        h("h2", null, "Today’s priorities"),
        queue.slice(0, 3).map((task, index) =>
          h(
            "button",
            {
              className: "priority",
              key: task.id,
              type: "button",
              onClick: () => setPage("tasks"),
            },
            h("b", null, index + 1),
            h(
              "span",
              null,
              h("strong", null, task.title),
              h("small", null, `${task.department} · ${formatTime(task.dueTime)}`),
            ),
            h("em", null, "›"),
          ),
        ),
      ),
      h(
        "section",
        { className: "card" },
        h("h2", null, "Handoff snapshot"),
        openHandoffs.length
          ? openHandoffs.slice(0, 3).map((item) =>
              h(
                "div",
                { className: "preview", key: item.id },
                h(Badge, {
                  text: item.category,
                  tone: item.category === "Urgent" ? "danger" : "warning",
                }),
                h("strong", null, item.message),
                h("small", null, `${item.author} · ${item.shift}`),
              ),
            )
          : h(Empty, {
              title: "Handoff is clear",
              message: "No unresolved notes are waiting.",
            }),
        h(Button, { text: "Add handoff note", onClick: addHandoff }),
      ),
    ),
    h(
      "section",
      { className: "card" },
      h("h2", null, "Reminders"),
      state.reminders.map((reminder) =>
        h(
          "label",
          { className: `check ${reminder.done ? "done" : ""}`, key: reminder.id },
          h("input", {
            type: "checkbox",
            checked: reminder.done,
            onChange: () =>
              changeState((current) => ({
                ...current,
                reminders: current.reminders.map((item) =>
                  item.id === reminder.id ? { ...item, done: !item.done } : item,
                ),
              })),
          }),
          h("span", null, reminder.text),
        ),
      ),
    ),
  );

  const nextPage = h(
    "div",
    { className: "stack" },
    h(PageTitle, {
      kicker: "Decision support",
      title: "What’s next",
      description:
        "A ranked queue based on urgency, priority, timing, and what you already started.",
    }),
    h(NextCard, {
      task: nextTask,
      setStatus: setTaskStatus,
      showNext: () => setFocusIndex((value) => value + 1),
    }),
    h(
      "section",
      { className: "card" },
      h("h2", null, "Next three"),
      queue.slice(0, 4).map((task, index) =>
        h(
          "button",
          {
            className: "rank",
            key: task.id,
            type: "button",
            onClick: () => setPage("tasks"),
          },
          h("b", null, index + 1),
          h(
            "span",
            null,
            h("strong", null, task.title),
            h("small", null, taskReason(task)),
          ),
          h("em", null, "›"),
        ),
      ),
    ),
  );

  const filteredTasks = state.tasks
    .filter((task) => {
      if (taskFilter === "All") return true;
      if (taskFilter === "Open") return !["Completed", "Skipped"].includes(task.status);
      return task.status === taskFilter;
    })
    .sort((a, b) => taskScore(b) - taskScore(a));

  const tasksPage = h(
    "div",
    { className: "stack" },
    h(PageTitle, {
      kicker: "Daily execution",
      title: "Tasks",
      description: "Assign, start, block, finish, and stop relying on memory during a rush.",
      action: h(Button, { text: "Add task", kind: "primary", onClick: addTask }),
    }),
    h(
      "div",
      { className: "filters" },
      ["Open", "In Progress", "Blocked", "Completed", "All"].map((filter) =>
        h(
          "button",
          {
            className: taskFilter === filter ? "active" : "",
            onClick: () => setTaskFilter(filter),
            key: filter,
            type: "button",
          },
          filter,
        ),
      ),
    ),
    h(
      "div",
      { className: "list" },
      filteredTasks.length
        ? filteredTasks.map((task) =>
            h(TaskCard, { key: task.id, task, setStatus: setTaskStatus }),
          )
        : h(Empty, { title: "No tasks here", message: "This filter is empty." }),
    ),
  );

  const filteredDates = state.dates
    .map((item) => ({ ...item, info: dateInfo(item) }))
    .sort((a, b) => a.info.rank - b.info.rank)
    .filter((item) => {
      if (dateFilter === "All") return true;
      if (dateFilter === "Handled") return item.status === "Handled";
      if (dateFilter === "Urgent") return item.info.rank <= 2;
      return item.status !== "Handled";
    });

  const datesPage = h(
    "div",
    { className: "stack" },
    h(PageTitle, {
      kicker: "Expiration control",
      title: "Date Watch",
      description: "See what must be pulled, checked, or left alone for now.",
      action: h(Button, { text: "Add item", kind: "primary", onClick: addDateItem }),
    }),
    h(
      "div",
      { className: "filters" },
      ["Active", "Urgent", "Handled", "All"].map((filter) =>
        h(
          "button",
          {
            className: dateFilter === filter ? "active" : "",
            onClick: () => setDateFilter(filter),
            key: filter,
            type: "button",
          },
          filter,
        ),
      ),
    ),
    h(
      "div",
      { className: "list" },
      filteredDates.length
        ? filteredDates.map((item) =>
            h(
              "article",
              { className: `date ${item.info.tone}`, key: item.id },
              h(
                "div",
                null,
                h(
                  "div",
                  { className: "spread" },
                  h(Badge, { text: item.info.label, tone: item.info.tone }),
                  h("small", null, `Qty ${item.quantity}`),
                ),
                h("h3", null, item.name),
                h("p", null, `${item.area} · ${item.location}`),
                h(
                  "small",
                  null,
                  `Expires ${formatDate(item.expirationDate)}${item.notes ? ` · ${item.notes}` : ""}`,
                ),
              ),
              item.status !== "Handled"
                ? h(Button, {
                    text: "Handled",
                    kind: "success",
                    onClick: () =>
                      changeState((current) => ({
                        ...current,
                        dates: current.dates.map((dateItem) =>
                          dateItem.id === item.id
                            ? { ...dateItem, status: "Handled" }
                            : dateItem,
                        ),
                      })),
                  })
                : null,
            ),
          )
        : h(Empty, { title: "No date items", message: "Nothing matches this filter." }),
    ),
  );

  const filteredHandoffs = state.handoffs.filter((item) => {
    if (handoffFilter === "All") return true;
    if (handoffFilter === "Resolved") return item.status === "Resolved";
    return item.status !== "Resolved";
  });

  const handoffPage = h(
    "div",
    { className: "stack" },
    h(PageTitle, {
      kicker: "Shift communication",
      title: "Handoff",
      description: "Keep unfinished work visible until somebody actually handles it.",
      action: h(Button, { text: "Add note", kind: "primary", onClick: addHandoff }),
    }),
    h(
      "div",
      { className: "filters" },
      ["Open", "Resolved", "All"].map((filter) =>
        h(
          "button",
          {
            className: handoffFilter === filter ? "active" : "",
            onClick: () => setHandoffFilter(filter),
            key: filter,
            type: "button",
          },
          filter,
        ),
      ),
    ),
    h(
      "div",
      { className: "list" },
      filteredHandoffs.length
        ? filteredHandoffs.map((item) =>
            h(
              "article",
              {
                className: `handoff ${item.category === "Urgent" ? "urgent" : ""}`,
                key: item.id,
              },
              h(
                "div",
                { className: "spread" },
                h(
                  "div",
                  null,
                  h(Badge, {
                    text: item.category,
                    tone: item.category === "Urgent" ? "danger" : "warning",
                  }),
                  h("h3", null, item.message),
                ),
                h(Badge, {
                  text: item.status,
                  tone: item.status === "Resolved" ? "success" : "neutral",
                }),
              ),
              h(
                "p",
                null,
                `${item.author} · ${item.shift} · ${new Date(item.createdAt).toLocaleString()}`,
              ),
              item.status !== "Resolved"
                ? h(
                    "div",
                    { className: "actions" },
                    item.status === "Open"
                      ? h(Button, {
                          text: "Acknowledge",
                          onClick: () =>
                            changeState((current) => ({
                              ...current,
                              handoffs: current.handoffs.map((handoff) =>
                                handoff.id === item.id
                                  ? { ...handoff, status: "Acknowledged" }
                                  : handoff,
                              ),
                            })),
                        })
                      : null,
                    h(Button, {
                      text: "Resolve",
                      kind: "success",
                      onClick: () =>
                        changeState((current) => ({
                          ...current,
                          handoffs: current.handoffs.map((handoff) =>
                            handoff.id === item.id
                              ? { ...handoff, status: "Resolved" }
                              : handoff,
                          ),
                        })),
                    }),
                  )
                : null,
            ),
          )
        : h(Empty, { title: "No handoff items", message: "Nothing is waiting in this view." }),
    ),
  );

  const truckDone = state.truck.filter((item) => item.done).length;
  const truckProgress = Math.round((truckDone / state.truck.length) * 100);

  const morePage = h(
    "div",
    { className: "stack" },
    h(PageTitle, {
      kicker: "Tools and controls",
      title: "More",
      description: "Truck Day, backups, and the buttons capable of causing consequences.",
    }),
    h(
      "section",
      { className: "card" },
      h(
        "div",
        { className: "spread" },
        h("h2", null, "Truck Day mode"),
        h("strong", { className: "percent" }, `${truckProgress}%`),
      ),
      h("div", { className: "bar" }, h("span", { style: { width: `${truckProgress}%` } })),
      state.truck.map((item) =>
        h(
          "label",
          { className: `check ${item.done ? "done" : ""}`, key: item.id },
          h("input", {
            type: "checkbox",
            checked: item.done,
            onChange: () =>
              changeState((current) => ({
                ...current,
                truck: current.truck.map((truckItem) =>
                  truckItem.id === item.id
                    ? { ...truckItem, done: !truckItem.done }
                    : truckItem,
                ),
              })),
          }),
          h("span", null, item.title),
        ),
      ),
    ),
    h(
      "section",
      { className: "card" },
      h("h2", null, "Data controls"),
      h(Button, {
        text: "Reset all app data",
        kind: "danger",
        onClick: () => {
          if (window.confirm("Reset the entire app?")) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }
        },
      }),
    ),
  );

  const pages = {
    home: homePage,
    next: nextPage,
    tasks: tasksPage,
    dates: datesPage,
    handoff: handoffPage,
    more: morePage,
  };

  return h(
    "div",
    { className: "app" },
    h(
      "header",
      { className: "header" },
      h(
        "div",
        null,
        h("b", { className: "logo" }, "S"),
        h(
          "span",
          null,
          h("strong", null, "Store Command Center"),
          h("small", null, `${state.profile.store} · ${state.profile.shift}`),
        ),
        h(
          "button",
          { className: "profile", type: "button" },
          h("b", null, state.profile.name[0]),
          h("span", null, state.profile.name),
        ),
      ),
    ),
    h("main", null, pages[page]),
    h(
      "button",
      {
        className: "fab",
        onClick: () => {
          const choice = window.prompt("Quick add: task, date, or handoff?", "task");
          if (!choice) return;
          if (choice.toLowerCase().startsWith("d")) addDateItem();
          else if (choice.toLowerCase().startsWith("h")) addHandoff();
          else addTask();
        },
        type: "button",
      },
      "+",
    ),
    h(
      "nav",
      null,
      NAV_ITEMS.map(([id, label, icon]) =>
        h(
          "button",
          {
            className: page === id ? "active" : "",
            onClick: () => setPage(id),
            key: id,
            type: "button",
          },
          h("span", null, icon),
          h("small", null, label),
        ),
      ),
    ),
    toast ? h("div", { className: "toast" }, toast) : null,
  );
}
