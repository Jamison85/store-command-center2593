import React from "react";

const h = React.createElement;

export function Badge({ text, tone = "neutral" }) {
  return h("span", { className: `badge badge-${tone}` }, text);
}
