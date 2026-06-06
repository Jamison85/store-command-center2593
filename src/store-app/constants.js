export const STORAGE_KEY = "store_command_center_v3";
export const OLD_SESSION_KEY = "caseys_daily_session_finished_v1";
export const OLD_DATES_KEY = "caseys_date_watch_finished_v1";
export const OLD_HANDOFF_KEY = "caseys_handoff_history_finished_v1";

export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "next", label: "What’s Next", icon: "next" },
  { id: "tasks", label: "Tasks", icon: "tasks" },
  { id: "dates", label: "Dates", icon: "dates" },
  { id: "handoff", label: "Handoff", icon: "handoff" },
  { id: "more", label: "More", icon: "more" },
];

export const PRIORITIES = ["Critical", "High", "Normal", "Low"];
export const TASK_STATUSES = ["Not Started", "In Progress", "Blocked", "Skipped", "Completed"];
export const DEPARTMENTS = ["Manager", "Center Store", "Front", "Cooler", "Kitchen", "Exterior", "Whole Store"];
export const SHIFTS = ["Open", "Mid", "Close", "Truck Day"];
export const HANDOFF_CATEGORIES = [
  "Needs Attention",
  "Follow Up",
  "Urgent",
  "Waiting on Vendor",
  "Waiting on Manager",
  "Out of Stock",
  "Maintenance Needed",
];

export const iconPaths = {
  home: ["M3 11.5 12 4l9 7.5", "M5.5 10.5V20h13v-9.5", "M9.5 20v-6h5v6"],
  next: ["M5 12h14", "m13 6 6 6-6 6"],
  tasks: ["M5 4h14v16H5z", "m8 9 1.5 1.5L12 8", "M14 9h3", "m8 15 1.5 1.5L12 14", "M14 15h3"],
  dates: ["M5 5h14v15H5z", "M8 3v4", "M16 3v4", "M5 10h14", "M8 14h3", "M13 14h3"],
  handoff: ["M5 5h14v12H9l-4 4z", "M8 9h8", "M8 13h5"],
  more: ["M6 12h.01", "M12 12h.01", "M18 12h.01"],
  alert: ["M12 4 3 20h18z", "M12 9v5", "M12 17h.01"],
  check: ["m5 12.5 4.2 4.2L19 7"],
  clock: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16", "M12 8v5l3 2"],
  plus: ["M12 5v14", "M5 12h14"],
  close: ["m6 6 12 12", "m18 6-12 12"],
  play: ["m8 5 11 7-11 7z"],
  pause: ["M9 6v12", "M15 6v12"],
  store: ["M4 10h16", "M5 10v10h14V10", "M7 4h10l3 6H4z", "M9 14h6v6"],
  truck: ["M3 7h11v10H3z", "M14 10h4l3 3v4h-7z", "M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4", "M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4"],
  note: ["M6 4h12v16H6z", "M9 8h6", "M9 12h6", "M9 16h4"],
  user: ["M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8", "M4.5 21a7.5 7.5 0 0 1 15 0"],
  chevron: ["m9 6 6 6-6 6"],
  filter: ["M4 6h16", "M7 12h10", "M10 18h4"],
  archive: ["M4 7h16v13H4z", "M3 4h18v3H3z", "M9 11h6"],
  refresh: ["M20 7v5h-5", "M4 17v-5h5", "M18.5 9a7 7 0 0 0-12-2", "M5.5 15a7 7 0 0 0 12 2"],
};
