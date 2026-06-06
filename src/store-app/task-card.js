import React from "react";
import { dueAt, niceDate, niceTime } from "./data.js";
import { Badge, Button } from "./common.js";

const h = React.createElement;

export function TaskCard({ task, onStatus, onEdit, compact = false }) {
  const overdue = dueAt(task) < Date.now() && task.status !== "Completed";
  const tone = task.status === "Completed"
    ? "success"
    : overdue || task.priority === "Critical"
      ? "danger"
      : task.priority === "High"
        ? "warning"
        : "neutral";

  return h(
    "article",
    { className: `task-card ${compact ? "task-card-compact" : ""} status-${task.status.toLowerCase().replaceAll(" ", "-")}` },
    h(
      "div",
      { className: "task-main" },
      h("div", { className: "row spread" },
        h(Badge, { text: overdue ? "Overdue" : task.priority, tone }),
        h("span", { className: "muted small" }, `${task.estimate} min`)
      ),
      h("h3", null, task.title),
      compact ? null : h("p", null, task.description),
      h("div", { className: "meta-row" },
        h("span", null, task.department),
        h("span", null, task.assignee),
        h("span", null, `${niceDate(task.dueDate)} · ${niceTime(task.dueTime)}`)
      ),
      task.waitingOn ? h("div", { className: "blocked-note" }, `Waiting on: ${task.waitingOn}`) : null
    ),
    h(
      "div",
      { className: "task-actions" },
      task.status !== "Completed" && task.status !== "In Progress"
        ? h(Button, { text: "Start", className: "button-primary button-small", onClick: () => onStatus(task.id, "In Progress") })
        : null,
      task.status !== "Completed"
        ? h(Button, { text: "Complete", className: "button-success button-small", onClick: () => onStatus(task.id, "Completed") })
        : null,
      h(Button, { text: "Edit", className: "button-secondary button-small", onClick: () => onEdit(task) })
    )
  );
}
