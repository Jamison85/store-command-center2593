import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./storechore.css";

document.title = "Storechore";
document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#203343");

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
