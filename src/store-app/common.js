import React from "react";

const h = React.createElement;

export function Badge({ text, tone = "neutral" }) {
  return h("span", { className: `badge badge-${tone}` }, text);
}

export function Button({ text, className = "", onClick, type = "button" }) {
  return h("button", { className: `button ${className}`, onClick, type }, text);
}

export function EmptyState({ title, message }) {
  return h("div", { className: "empty-state" },
    h("strong", null, title),
    h("p", null, message)
  );
}

export function PageTitle({ kicker, title, description, action }) {
  return h("section", { className: "page-title" },
    h("div", null,
      h("p", { className: "eyebrow" }, kicker),
      h("h1", null, title),
      h("p", null, description)
    ),
    action || null
  );
}
