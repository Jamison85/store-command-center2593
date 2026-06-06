import React from "react";

const h = React.createElement;

export default function Modal({ title, onClose, children }) {
  function handleBackdrop(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return h(
    "div",
    { className: "modal-backdrop", onMouseDown: handleBackdrop },
    h(
      "section",
      { className: "modal", role: "dialog", "aria-modal": true, "aria-label": title },
      h(
        "header",
        { className: "modal-header" },
        h("h2", null, title),
        h("button", { className: "icon-button", type: "button", onClick: onClose, "aria-label": "Close" }, "×")
      ),
      h("div", { className: "modal-body" }, children)
    )
  );
}
