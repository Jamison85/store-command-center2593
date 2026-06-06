import React, { useState } from "react";
import { departments, priorities, shifts, statuses, today, uid } from "./data.js";

const h = React.createElement;

function Select({ label, value, options, onChange }) {
  return h(
    "label",
    { className: "field" },
    h("span", null, label),
    h(
      "select",
      { value, onChange: (event) => onChange(event.target.value) },
      options.map((option) => h("option", { key: option, value: option }, option))
    )
  );
}

export function TaskForm({ task, profile, onSave }) {
  const [form, setForm] = useState(task || {
    id: uid("task"),
    title: "",
    description: "",
    department: "Center Store",
    assignee: profile.name,
    shift: profile.shift,
    dueDate: today(),
    dueTime: "12:00",
    estimate: 15,
    priority: "Normal",
    status: "Not Started",
    waitingOn: "",
  });

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    onSave({ ...form, title });
  }

  return h(
    "form",
    { className: "form-grid", onSubmit: submit },
    h("label", { className: "field full" },
      h("span", null, "Task title"),
      h("input", { value: form.title, onChange: (event) => setField("title", event.target.value), required: true })
    ),
    h("label", { className: "field full" },
      h("span", null, "Description"),
      h("textarea", { value: form.description, onChange: (event) => setField("description", event.target.value) })
    ),
    h(Select, { label: "Department", value: form.department, options: departments, onChange: (value) => setField("department", value) }),
    h("label", { className: "field" },
      h("span", null, "Assigned to"),
      h("input", { value: form.assignee, onChange: (event) => setField("assignee", event.target.value) })
    ),
    h(Select, { label: "Shift", value: form.shift, options: shifts, onChange: (value) => setField("shift", value) }),
    h(Select, { label: "Priority", value: form.priority, options: priorities, onChange: (value) => setField("priority", value) }),
    h("label", { className: "field" },
      h("span", null, "Due date"),
      h("input", { type: "date", value: form.dueDate, onChange: (event) => setField("dueDate", event.target.value) })
    ),
    h("label", { className: "field" },
      h("span", null, "Due time"),
      h("input", { type: "time", value: form.dueTime, onChange: (event) => setField("dueTime", event.target.value) })
    ),
    h("label", { className: "field" },
      h("span", null, "Estimated minutes"),
      h("input", { type: "number", min: 1, value: form.estimate, onChange: (event) => setField("estimate", Number(event.target.value)) })
    ),
    h(Select, { label: "Status", value: form.status, options: statuses, onChange: (value) => setField("status", value) }),
    h("label", { className: "field full" },
      h("span", null, "Waiting on"),
      h("input", { value: form.waitingOn, onChange: (event) => setField("waitingOn", event.target.value), placeholder: "Vendor, delivery, repair..." })
    ),
    h("button", { className: "button button-primary full", type: "submit" }, "Save task")
  );
}
