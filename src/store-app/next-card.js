import React from "react";
import { niceTime, taskReason } from "./data.js";
import { Badge, Button } from "./common.js";

const h = React.createElement;

export function NextCard({ task, onStatus, onNext }) {
  if (!task) {
    return h(
      "section",
      { className: "next-card" },
      h(Badge, { text: "Clear", tone: "success" }),
      h("h2", null, "Nothing urgent is waiting."),
      h("p", null, "Apparently the store has briefly stopped inventing problems.")
    );
  }

  return h(
    "section",
    { className: "next-card" },
    h("div", { className: "row spread" },
      h("div", null,
        h("p", { className: "eyebrow" }, "What do I do next?"),
        h(Badge, { text: task.priority, tone: task.priority === "Critical" ? "danger" : "warning" })
      ),
      h("span", { className: "next-icon" }, "→")
    ),
    h("h2", null, task.title),
    h("p", { className: "reason" }, taskReason(task)),
    h("div", { className: "fact-row" },
      h("span", null, `${task.estimate} minutes`),
      h("span", null, `Due ${niceTime(task.dueTime)}`),
      h("span", null, task.department)
    ),
    h("div", { className: "action-row" },
      task.status !== "In Progress"
        ? h(Button, { text: "Start task", className: "button-primary", onClick: () => onStatus(task.id, "In Progress") })
        : null,
      h(Button, { text: "Complete", className: "button-success", onClick: () => onStatus(task.id, "Completed") }),
      h(Button, { text: "Blocked", className: "button-secondary", onClick: () => onStatus(task.id, "Blocked") }),
      h(Button, { text: "Skip", className: "button-secondary", onClick: () => onStatus(task.id, "Skipped") }),
      h("button", { className: "text-button", type: "button", onClick: onNext }, "Show another")
    )
  );
}
