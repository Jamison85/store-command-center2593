import React, { useEffect, useMemo, useState } from "react";

const MANAGERS = [
  {
    id: "loretta",
    initials: "LG",
    name: "Loretta",
    role: "General Manager",
    shortRole: "GM",
    focus: "Store-wide priorities, staffing, standards, and follow-up.",
    dashboardFocus: ["Staffing coverage", "Store standards", "Open follow-ups", "Handoff review"],
  },
  {
    id: "jamison",
    initials: "JR",
    name: "Jamison",
    role: "Center Store / CSR",
    shortRole: "CSR",
    focus: "Center store, Date Watch, daily walk, handoff, and shift execution.",
    dashboardFocus: ["Date Watch", "Daily walk", "Center store recovery", "Shift execution"],
  },
  {
    id: "jamie",
    initials: "JM",
    name: "Jamie",
    role: "Kitchen Manager",
    shortRole: "Kitchen",
    focus: "Kitchen standards, food safety, production, and kitchen team follow-up.",
    dashboardFocus: ["Kitchen standards", "Food safety", "Production readiness", "Kitchen follow-up"],
  },
  {
    id: "adria",
    initials: "AS",
    name: "Adria",
    role: "Shift Supervisor",
    shortRole: "Shift Supervisor",
    focus: "Shift coverage, task follow-through, cooler, and team communication.",
    dashboardFocus: ["Task follow-through", "Cooler progress", "Team communication", "Shift coverage"],
  },
];

const SHIFT_TYPES = ["Open", "Mid", "Close", "Truck Day", "Short Staffed", "Other"];

const STAFFING_MODES = [
  { id: "normal", label: "Normal", description: "Run the full routine." },
  { id: "short", label: "Short Staffed", description: "Protect the basics and the money." },
  { id: "very-short", label: "Very Short", description: "Survival mode. Guest-facing first." },
  { id: "training", label: "Training Day", description: "Build in follow-up checks." },
  { id: "truck", label: "Truck Day", description: "Freight, cooler, water, recovery." },
];

const TASK_STATUSES = ["To Do", "In Progress", "Complete"];
const TASK_FILTERS = ["Open", "Must Do", "To Do", "In Progress", "Complete", "All"];
const WATCH_STATUSES = ["All", "Watching", "BOGO Soon", "Pull Today", "Pull Now", "Need to Order", "Handled"];

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>
  ),
  walk: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19.5 4.8 21 6.3 16.8"/><path d="M14.5 4.5 19.5 9.5"/><path d="m7 17 8.7-8.7a2.1 2.1 0 0 1 3 3L10 20"/></svg>
  ),
  dates: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 10h16"/><path d="M8 14h3"/><path d="M13 14h3"/><path d="M8 17h3"/></svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 9 1.5 1.5L12 8"/><path d="M14 9h3"/><path d="m8 15 1.5 1.5L12 14"/><path d="M14 15h3"/></svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="5" rx="2"/><rect x="13" y="11" width="7" height="9" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/></svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 15.5a5 5 0 0 1 5 4.5"/></svg>
  ),
  handoff: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h9a3 3 0 0 1 3 3v9H7a3 3 0 0 1-3-3V6z"/><path d="M8 10h8"/><path d="M8 14h6"/><path d="M7 18v3"/></svg>
  ),
  strategy: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M5 7h7"/><path d="M12 17h7"/><path d="M5 7l2.5-2.5"/><path d="M5 7l2.5 2.5"/><path d="M19 17l-2.5-2.5"/><path d="M19 17l-2.5 2.5"/></svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4"/><path d="m8 13 2 2 4-5"/><path d="M8 18h8"/></svg>
  ),
  log: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"/></svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 3 20h18z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>
  ),
};

const WALK_ITEMS = [
  { id: "exterior-lot", area: "Exterior", title: "Lot / Trash / Signage", prompt: "Parking lot, landscaping, dumpster area, outside signage, and trash cans meet standards?", impact: "Guest first impression" },
  { id: "exterior-fuel", area: "Exterior", title: "Fuel Pumps", prompt: "Pumps clean, diesel handles clean, receipt paper stocked, washer buckets full, squeegees present?", impact: "Fuel guest experience" },
  { id: "interior-clean", area: "Interior", title: "Floors / Restrooms / Trash", prompt: "Center store and restrooms clean, swept, mopped, and trash under control?", impact: "Guest comfort" },
  { id: "interior-counter", area: "Interior", title: "Counter / Tobacco / FFE", prompt: "FFE, Red Bull cooler, tobacco back bar, and sales counter clean and stocked?", impact: "Speed and sales" },
  { id: "interior-center-store", area: "Interior", title: "Center Store", prompt: "Aisles, power wings, and displays replenished and front-faced?", impact: "Sales floor recovery" },
  { id: "cooler", area: "Cooler", title: "Cold Vault / Beer", prompt: "Cold vaults, beer doors, beer cave, and high-traffic drinks stocked and faced?", impact: "High-volume outs" },
  { id: "pdb-coffee", area: "P&DB", title: "Coffee / Fountain", prompt: "Coffee, fountain, cups, lids, straws, creamers, counters, and machines clean and stocked?", impact: "Morning rush" },
  { id: "pdb-bakery", area: "P&DB", title: "Donuts / Bakery / Open-Air", prompt: "Donut case, open-air cooler, and bakery rack clean, stocked, and set correctly?", impact: "Food presentation" },
  { id: "kitchen", area: "Kitchen", title: "Kitchen Standards", prompt: "Kitchen clean, organized, stocked, and following food safety guidelines?", impact: "Food safety" },
  { id: "team", area: "Team", title: "Team / Guest Interaction", prompt: "Team in uniform, name tags visible, greeting guests, and using Rewards / suggestive selling?", impact: "Service behavior" },
  { id: "other", area: "Other", title: "Anything Weird", prompt: "Anything else need addressed before it becomes a tiny retail documentary?", impact: "Manager judgment" },
];

const TRUCK_SECTIONS = [
  { id: "prep", title: "Before Truck Arrives", priority: "Set the battlefield", items: ["Clear receiving path and backroom space", "Have paperwork / invoice ready", "Assign cooler, freezer, totes, water, and center store", "Check urgent outs before pallets arrive"] },
  { id: "receive", title: "Receiving", priority: "Catch problems early", items: ["Check obvious damages, shorts, or weirdness", "Separate cooler and freezer first", "Stage totes by area", "Keep paperwork somewhere that is not the void"] },
  { id: "cold", title: "Cooler / Freezer", priority: "Temperature-sensitive first", items: ["Work temp-sensitive items first", "Fill milk, creamer, water, soda, and energy drinks", "Face cold vault and beer doors", "Note major outs or overstock"] },
  { id: "center", title: "Center Store", priority: "Visible outs and high traffic", items: ["Work outs and high-traffic areas first", "Stock displays and power wings", "Front-face visible aisles", "Break down cardboard before it becomes architecture"] },
  { id: "bulk", title: "Water / Bulk / Displays", priority: "Heavy stuff without chaos", items: ["Stage water safely", "Fill endcaps and displays", "Check backstock blocking paths", "Leave a note if water is unfinished"] },
  { id: "recovery", title: "Recovery Before Leaving", priority: "Make the store look intentional", items: ["Sweep backroom path", "Recover visible aisles", "Confirm endcaps look presentable", "Pick one visible win before leaving"] },
];

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const target = new Date(`${dateString}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function getDateStatus(item) {
  if (item.resolved) return "Handled";
  const days = daysUntil(item.expirationDate);
  if (days === null) return "Watching";
  if (days < 0) return "Pull Now";
  if (days === 0) return "Pull Today";
  if (days <= 2) return "BOGO Soon";
  return "Watching";
}

function formatDate(value) {
  const [year, month, day] = String(value || todayISO()).split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value = new Date()) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function useSavedState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The app still works for the current session if storage acts like retail equipment.
    }
  }, [key, value]);

  return [value, setValue];
}

function makeWalkState() {
  return WALK_ITEMS.reduce((acc, item) => {
    acc[item.id] = { checked: false, status: "Good", note: "", addToHandoff: false };
    return acc;
  }, {});
}

function makeTruckState() {
  const state = {};
  TRUCK_SECTIONS.forEach((section) => {
    section.items.forEach((_, index) => {
      state[`${section.id}-${index}`] = false;
    });
  });
  return state;
}

function makeTruckNotes() {
  return TRUCK_SECTIONS.reduce((acc, section) => {
    acc[section.id] = { note: "", addToHandoff: false };
    return acc;
  }, {});
}

function defaultTasksForDate(date = todayISO(), managerId = "jamison") {
  const day = new Date(`${date}T00:00:00`).getDay();
  const tasks = [
    {
      id: createId(),
      title: "Complete Daily Store Walk",
      description: "Check store standards before the day gets loud.",
      priority: "Must Do",
      timing: "Before 10 AM",
      assignee: "Me",
      status: "To Do",
      source: "Daily",
    },
    {
      id: createId(),
      title: "Review Date Watch",
      description: "Check near-date and issue items that are already on your radar.",
      priority: "Must Do",
      timing: "Before 10 AM",
      assignee: "Me",
      status: "To Do",
      source: "Daily",
    },
    {
      id: createId(),
      title: "Pick one visible win",
      description: "Make one area noticeably better before leaving.",
      priority: "Should Do",
      timing: "Today",
      assignee: "Me",
      status: "To Do",
      source: "Daily",
    },
  ];

  if (day === 2) {
    tasks.push({
      id: createId(),
      title: "Prep backroom for truck",
      description: "Clear path, stage space, and identify urgent outs before truck day.",
      priority: "Should Do",
      timing: "Today",
      assignee: "Me",
      status: "To Do",
      source: "Tuesday Template",
    });
  }

  if (day === 3) {
    tasks.push({
      id: createId(),
      title: "Truck Day priority pass",
      description: "Cooler/freezer, water, outs, totes, cardboard, then visible recovery.",
      priority: "Must Do",
      timing: "Today",
      assignee: "Me",
      status: "To Do",
      source: "Wednesday Template",
    });
  }

  if (day === 5) {
    tasks.push({
      id: createId(),
      title: "Weekend readiness check",
      description: "Stock high-volume areas, recover displays, and set up the weekend crew.",
      priority: "Should Do",
      timing: "Today",
      assignee: "Me",
      status: "To Do",
      source: "Friday Template",
    });
  }

  if (managerId === "jamie") {
    tasks.push({
      id: createId(),
      title: "Kitchen readiness check",
      description: "Production, food safety, kitchen cleanliness, and team follow-up.",
      priority: "Must Do",
      timing: "Today",
      assignee: "Kitchen",
      status: "To Do",
      source: "Role Template",
    });
  }

  if (managerId === "loretta") {
    tasks.push({
      id: createId(),
      title: "Store-wide follow-up review",
      description: "Staffing, standards, manager notes, and carryover items.",
      priority: "Must Do",
      timing: "Today",
      assignee: "Me",
      status: "To Do",
      source: "Role Template",
    });
  }

  if (managerId === "adria") {
    tasks.push({
      id: createId(),
      title: "Shift coverage check",
      description: "Confirm assignments, cooler progress, handoff issues, and team communication.",
      priority: "Must Do",
      timing: "Today",
      assignee: "Shift Lead",
      status: "To Do",
      source: "Role Template",
    });
  }

  return tasks;
}

function makeFreshDailySession(date = todayISO(), managerId = "jamison", carryoverTasks = []) {
  return {
    sessionId: createId(),
    date,
    createdAt: new Date().toISOString(),
    managerId,
    shiftType: "Open",
    staffingMode: new Date(`${date}T00:00:00`).getDay() === 3 ? "truck" : "normal",
    topThree: ["Complete Daily Store Walk", "Review Date Watch", "Pick one visible win"],
    visibleWin: "Face and fill one high-traffic area",
    tasks: [
      ...carryoverTasks.map((task) => ({
        ...task,
        id: createId(),
        status: task.carryoverStatus || "To Do",
        source: "Carryover",
        carriedFrom: task.carriedFrom || task.sessionDate || "Previous Day",
      })),
      ...defaultTasksForDate(date, managerId),
    ],
    walkState: makeWalkState(),
    truckState: makeTruckState(),
    truckNotes: makeTruckNotes(),
    teamNotes: [],
    endShiftNotes: "",
    reviewedAt: "",
  };
}

const DEFAULT_DATE_WATCH = [
  { id: createId(), name: "French Vanilla Creamer", quantity: 4, area: "Dairy", issueType: "None", expirationDate: addDays(2), notes: "Watch for BOGO / pull timing.", resolved: false },
  { id: createId(), name: "Half & Half Creamer", quantity: 4, area: "Dairy", issueType: "None", expirationDate: todayISO(), notes: "Check today.", resolved: false },
  { id: createId(), name: "Ribbon Pepperoni", quantity: 3, area: "Kitchen", issueType: "Need to Order", expirationDate: "", notes: "Low count.", resolved: false },
];

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [currentManagerId, setCurrentManagerId] = useSavedState("caseys_current_manager_finished_v1", "");
  const [dateWatch, setDateWatch] = useSavedState("caseys_date_watch_finished_v1", DEFAULT_DATE_WATCH);
  const [handoffHistory, setHandoffHistory] = useSavedState("caseys_handoff_history_finished_v1", []);
  const [dailyLog, setDailyLog] = useSavedState("caseys_daily_log_finished_v1", []);
  const [session, setSession] = useSavedState("caseys_daily_session_finished_v1", makeFreshDailySession(todayISO(), "jamison"));

  const manager = MANAGERS.find((item) => item.id === currentManagerId) || null;

  useEffect(() => {
    const today = todayISO();
    if (session.date !== today && currentManagerId) {
      setDailyLog((previous) => archiveSession(session, previous));
      const carryover = session.tasks
        .filter((task) => task.status !== "Complete" && task.priority !== "Can Wait")
        .map((task) => ({ ...task, sessionDate: session.date, carryoverStatus: "To Do" }));
      setSession(makeFreshDailySession(today, currentManagerId, carryover));
      setScreen("dashboard");
    }
  }, [session, currentManagerId, setDailyLog, setSession]);

  function selectManager(managerId) {
    setCurrentManagerId(managerId);
    setSession((current) => ({
      ...current,
      managerId,
      tasks: current.tasks?.length ? current.tasks : defaultTasksForDate(current.date, managerId),
    }));
  }

  function switchManager() {
    setCurrentManagerId("");
  }

  if (!manager) {
    return <ManagerSignIn selectedManagerId={currentManagerId} onSelect={selectManager} />;
  }

  const dateWatchWithStatus = dateWatch.map((item) => ({ ...item, dateStatus: getDateStatus(item) }));
  const stats = buildStats(session, dateWatchWithStatus);
  const actionQueue = buildActionQueue({
    session,
    manager,
    stats,
    dateWatch: dateWatchWithStatus,
  });
  const nextAction = actionQueue[0];

  const context = {
    manager,
    managers: MANAGERS,
    switchManager,
    screen,
    setScreen,
    session,
    setSession,
    dateWatch: dateWatchWithStatus,
    rawDateWatch: dateWatch,
    setDateWatch,
    handoffHistory,
    setHandoffHistory,
    dailyLog,
    setDailyLog,
    stats,
    actionQueue,
    nextAction,
    startFreshToday: () => startFreshToday({ session, setSession, setDailyLog, managerId: manager.id }),
    saveCurrentDay: () => saveCurrentDay({ session, setSession, setDailyLog, managerId: manager.id }),
  };

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "dashboard" && <Dashboard {...context} />}
        {screen === "walk" && <DailyWalk {...context} />}
        {screen === "dates" && <DateWatch {...context} />}
        {screen === "tasks" && <Tasks {...context} />}
        {screen === "truck" && <TruckDay {...context} />}
        {screen === "team" && <TeamNotes {...context} />}
        {screen === "handoff" && <Handoff {...context} />}
        {screen === "review" && <EndShiftReview {...context} />}
        {screen === "strategy" && <ShiftStrategy {...context} />}
        {screen === "daily-log" && <DailyLog {...context} />}
        {screen === "more" && <More {...context} />}
      </main>
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}

function ManagerSignIn({ selectedManagerId, onSelect }) {
  const [selected, setSelected] = useState(selectedManagerId || "jamison");
  const manager = MANAGERS.find((item) => item.id === selected) || MANAGERS[1];

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-hero">
          <div className="icon-mark">{ICONS.dashboard}</div>
          <p className="eyebrow">Command Central</p>
          <h1>Manager Sign In</h1>
          <p className="muted">Pick your profile so tasks, handoffs, and daily notes show the right person.</p>
        </div>

        <div className="manager-login-grid">
          {MANAGERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`manager-login-card ${selected === item.id ? "active" : ""}`}
              onClick={() => setSelected(item.id)}
            >
              <span className="manager-avatar">{item.initials}</span>
              <strong>{item.name}</strong>
              <em>{item.role}</em>
              <p>{item.focus}</p>
            </button>
          ))}
        </div>

        <div className="selected-manager-card">
          <div>
            <p className="eyebrow">Signing in as</p>
            <h2>{manager.name}</h2>
            <p className="muted">{manager.role}</p>
          </div>
          <button className="primary-btn" onClick={() => onSelect(manager.id)}>Enter App</button>
        </div>

        <p className="login-note">Local profile sign-in. This personalizes this device. Real password security would need a backend later.</p>
      </section>
    </main>
  );
}

function Dashboard({
  manager,
  switchManager,
  setScreen,
  session,
  setSession,
  stats,
  actionQueue,
  nextAction,
  startFreshToday,
  saveCurrentDay,
}) {
  const walkPercent = Math.round((stats.walkDone / WALK_ITEMS.length) * 100);
  const truckPercent = Math.round((stats.truckDone / stats.truckTotal) * 100);
  const staffing = STAFFING_MODES.find((mode) => mode.id === session.staffingMode) || STAFFING_MODES[0];

  function updateSession(field, value) {
    setSession({ ...session, [field]: value });
  }

  return (
    <section className="screen">
      <header className="hero-card command-hero">
        <div>
          <div className="title-row">
            <span className="icon-chip light">{ICONS.dashboard}</span>
            <p className="eyebrow">Command Central</p>
          </div>
          <h1>{manager.name}</h1>
          <p className="muted">{manager.role} · {formatDate(session.date)} · {session.shiftType}</p>
        </div>
        <div className={`pulse-orb ${getPulseTone(stats.pulse)}`}>
          <strong>{stats.pulse}</strong>
          <span>Pulse</span>
        </div>
      </header>

      <article className="card session-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Today’s Session</p>
            <h2>{formatDate(session.date)}</h2>
            <p className="muted">Fresh daily record. Date Watch and handoff history stay ongoing.</p>
          </div>
          <button className="ghost-btn" onClick={() => setScreen("daily-log")}>
            <span className="btn-icon">{ICONS.log}</span>
            Daily Log
          </button>
        </div>
        <div className="session-actions">
          <button className="ghost-btn" onClick={saveCurrentDay}>Save Today to Log</button>
          <button className="danger-btn" onClick={startFreshToday}>Start Fresh Today</button>
        </div>
      </article>

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Command Mode</p>
            <h2>{staffing.label}</h2>
            <p className="muted">{staffing.description}</p>
          </div>
          <button className="danger-btn" onClick={switchManager}>Switch Manager</button>
        </div>

        <div className="grid-3 top-space">
          <select className="input" value={session.shiftType} onChange={(event) => updateSession("shiftType", event.target.value)}>
            {SHIFT_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
          <select className="input" value={session.staffingMode} onChange={(event) => updateSession("staffingMode", event.target.value)}>
            {STAFFING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
          </select>
          <button className="ghost-btn" onClick={() => setScreen("strategy")}>Strategy</button>
        </div>
      </article>

      <div className="metric-grid">
        <MetricCard label="Walk" value={`${walkPercent}%`} detail={`${stats.walkDone}/${WALK_ITEMS.length}`} tone="success" />
        <MetricCard label="Date Risks" value={stats.dateRisks} detail={`${stats.pullNow} pull now`} tone="warning" />
        <MetricCard label="Must Do" value={stats.mustDoOpen} detail={`${stats.tasksOpen} open tasks`} tone="danger" />
        <MetricCard label="Truck" value={`${truckPercent}%`} detail={`${stats.truckDone}/${stats.truckTotal}`} tone="neutral" />
      </div>

      <article className="card next-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">What Should I Do Next?</p>
            <h2>{nextAction?.title || "Pick one visible win"}</h2>
            <p className="muted">{nextAction?.detail || "No major fires showing. Keep the store moving."}</p>
          </div>
          <button className="primary-btn" onClick={() => setScreen(nextAction?.screen || "tasks")}>
            <span className="btn-icon">{ICONS.next}</span>
            Open
          </button>
        </div>
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Role Focus</p>
            <h2>{manager.shortRole} dashboard</h2>
          </div>
          <span className="manager-mini">{manager.initials}</span>
        </div>
        <div className="focus-grid">
          {manager.dashboardFocus.map((item) => <span key={item}>{item}</span>)}
        </div>
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Action Queue</p>
            <h2>What needs attention</h2>
          </div>
          <span className="badge warning">{actionQueue.length} items</span>
        </div>
        <div className="action-queue">
          {actionQueue.slice(0, 6).map((action) => (
            <button key={action.id} className={`queue-item ${action.tone}`} onClick={() => setScreen(action.screen)}>
              <div>
                <span className="queue-priority">{action.priority}</span>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </div>
              <span className="queue-arrow">{ICONS.next}</span>
            </button>
          ))}
        </div>
      </article>

      <article className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Area Health</p>
            <h2>Store walk by zone</h2>
          </div>
          <button className="ghost-btn" onClick={() => setScreen("walk")}>Open Walk</button>
        </div>
        <div className="area-grid">
          {stats.areaHealth.map((area) => (
            <div key={area.area} className={`area-tile ${area.tone}`}>
              <strong>{area.area}</strong>
              <span>{area.done}/{area.total}</span>
              <p>{area.label}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Before 10 AM</p>
        <h2>Top 3 Priorities</h2>
        <div className="stack top-space">
          {session.topThree.map((priority, index) => (
            <input
              key={index}
              className="input"
              value={priority}
              onChange={(event) => {
                const next = [...session.topThree];
                next[index] = event.target.value;
                updateSession("topThree", next);
              }}
            />
          ))}
        </div>
      </article>

      <article className="card accent-card">
        <p className="eyebrow">Visible Win</p>
        <h2>One thing that makes the store look better</h2>
        <textarea className="textarea" value={session.visibleWin} onChange={(event) => updateSession("visibleWin", event.target.value)} />
      </article>

      <article className="card">
        <p className="eyebrow">Quick Jump</p>
        <div className="quick-grid">
          <button onClick={() => setScreen("walk")}><span>{ICONS.walk}</span>Walk</button>
          <button onClick={() => setScreen("dates")}><span>{ICONS.dates}</span>Date Watch</button>
          <button onClick={() => setScreen("truck")}><span>{ICONS.truck}</span>Truck</button>
          <button onClick={() => setScreen("review")}><span>{ICONS.review}</span>End Review</button>
        </div>
      </article>
    </section>
  );
}

function DailyWalk({ session, setSession, stats }) {
  const [filter, setFilter] = useState("All");
  const areas = ["All", ...Array.from(new Set(WALK_ITEMS.map((item) => item.area)))];
  const items = filter === "All" ? WALK_ITEMS : WALK_ITEMS.filter((item) => item.area === filter);
  const progress = Math.round((stats.walkDone / WALK_ITEMS.length) * 100);

  function updateWalk(itemId, field, value) {
    setSession({
      ...session,
      walkState: {
        ...session.walkState,
        [itemId]: {
          ...(session.walkState[itemId] || {}),
          [field]: value,
        },
      },
    });
  }

  return (
    <section className="screen">
      <PageHeader icon={ICONS.walk} label="Start of Shift" title="Daily Store Walk" subtitle={`${stats.walkDone} / ${WALK_ITEMS.length} complete · ${stats.walkAttention} attention · ${stats.walkUrgent} urgent`} />

      <article className="card accent-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Walk Progress</p>
            <h2>{progress}% complete</h2>
          </div>
          <span className="badge success">{stats.walkDone}/{WALK_ITEMS.length}</span>
        </div>
        <Progress value={progress} />
      </article>

      <div className="filter-row">
        {areas.map((area) => (
          <button key={area} className={`filter-chip ${filter === area ? "active" : ""}`} onClick={() => setFilter(area)}>{area}</button>
        ))}
      </div>

      <div className="stack">
        {items.map((item, index) => {
          const state = session.walkState[item.id] || {};
          return (
            <article key={item.id} className={`card walk-card ${state.status === "Urgent" ? "urgent-card" : ""}`}>
              <div className="walk-top">
                <label className="checkbox-line">
                  <input type="checkbox" checked={!!state.checked} onChange={(event) => updateWalk(item.id, "checked", event.target.checked)} />
                  <span className="walk-number">{index + 1}</span>
                </label>
                <span className="chip">{item.area}</span>
              </div>

              <h2>{item.title}</h2>
              <p className="walk-question">{item.prompt}</p>
              <p className="muted small">Why it matters: {item.impact}</p>

              <div className="grid-2 top-space">
                <div>
                  <label className="field-label">Status</label>
                  <select className="input" value={state.status || "Good"} onChange={(event) => updateWalk(item.id, "status", event.target.value)}>
                    <option>Good</option>
                    <option>Needs Attention</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <label className="handoff-toggle inline-toggle">
                  <input type="checkbox" checked={!!state.addToHandoff} onChange={(event) => updateWalk(item.id, "addToHandoff", event.target.checked)} />
                  Handoff
                </label>
              </div>

              <label className="field-label">Notes</label>
              <textarea className="textarea" placeholder="Add notes only if something matters..." value={state.note || ""} onChange={(event) => updateWalk(item.id, "note", event.target.value)} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DateWatch({ dateWatch, rawDateWatch, setDateWatch, setScreen }) {
  const blank = { name: "", quantity: "", area: "", issueType: "None", expirationDate: "", notes: "", resolved: false };
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [filter, setFilter] = useState("All");

  const filtered = dateWatch.filter((item) => {
    if (filter === "All") return !item.resolved;
    if (filter === "Handled") return item.resolved;
    if (filter === "Need to Order") return item.issueType === "Need to Order" && !item.resolved;
    return item.dateStatus === filter && !item.resolved;
  });

  const riskCount = dateWatch.filter((item) => ["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus)).length;

  function openAdd() {
    setEditingId(null);
    setForm(blank);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      quantity: item.quantity || "",
      area: item.area || "",
      issueType: item.issueType || "None",
      expirationDate: item.expirationDate || "",
      notes: item.notes || "",
      resolved: !!item.resolved,
    });
    setFormOpen(true);
  }

  function saveItem(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setDateWatch(rawDateWatch.map((item) => item.id === editingId ? { ...item, ...form, quantity: Number(form.quantity || 0) } : item));
    } else {
      setDateWatch([{ id: createId(), ...form, quantity: Number(form.quantity || 0) }, ...rawDateWatch]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function toggleHandled(itemId) {
    setDateWatch(rawDateWatch.map((item) => (item.id === itemId ? { ...item, resolved: !item.resolved } : item)));
  }

  function deleteItem(itemId) {
    setDateWatch(rawDateWatch.filter((item) => item.id !== itemId));
  }

  return (
    <section className="screen">
      <PageHeader icon={ICONS.dates} label="Manager Watchlist" title="Date Watch" subtitle="Track items you notice by chance during the week. This is not a full-store inventory system." />

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Shelf Risk</p>
            <h2>{riskCount} items need attention</h2>
          </div>
          <button className="ghost-btn" onClick={() => setScreen("handoff")}>Handoff</button>
        </div>
        <div className="status-guide">
          <span><b>Watching</b> on radar</span>
          <span><b>BOGO Soon</b> 1-2 days</span>
          <span><b>Pull Today</b> today</span>
          <span><b>Pull Now</b> expired</span>
        </div>
      </article>

      <div className="filter-row">
        {WATCH_STATUSES.map((chip) => <button key={chip} className={`filter-chip ${filter === chip ? "active" : ""}`} onClick={() => setFilter(chip)}>{chip}</button>)}
      </div>

      <button className="primary-btn full" onClick={openAdd}>Add Date Watch Item</button>

      {formOpen && (
        <form className="card form-card" onSubmit={saveItem}>
          <p className="eyebrow">{editingId ? "Edit Watch Item" : "New Watch Item"}</p>
          <input className="input" placeholder="Item name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <div className="grid-2">
            <input className="input" placeholder="Qty" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
            <input className="input" placeholder="Area / department" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} />
          </div>
          <select className="input" value={form.issueType} onChange={(event) => setForm({ ...form, issueType: event.target.value })}>
            <option>None</option>
            <option>Need to Order</option>
            <option>Overstocked</option>
            <option>Missing</option>
            <option>Damaged</option>
            <option>Vendor Issue</option>
          </select>
          <label className="field-label">Expiration Date</label>
          <input className="input" type="date" value={form.expirationDate} onChange={(event) => setForm({ ...form, expirationDate: event.target.value })} />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <div className="action-row">
            <button className="primary-btn" type="submit">Save</button>
            <button className="ghost-btn" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stack">
        {filtered.length === 0 && <EmptyState title="Nothing here" text="A suspiciously peaceful moment. Enjoy it before retail files an appeal." />}
        {filtered.map((item) => (
          <article key={item.id} className={`card inventory-card status-${item.dateStatus.toLowerCase().replaceAll(" ", "-")}`}>
            <div className="card-header">
              <div>
                <h2>{item.name}</h2>
                <p className="muted">{item.area || "General"} · Qty {item.quantity || 0}</p>
              </div>
              <StatusBadge status={item.dateStatus} />
            </div>
            <div className="mini-row">
              {item.issueType !== "None" && <span className="badge danger">{item.issueType}</span>}
              {item.expirationDate && <span className="badge neutral">Date {item.expirationDate}</span>}
            </div>
            {item.notes && <p className="note-text">{item.notes}</p>}
            <div className="action-row">
              <button className="ghost-btn" onClick={() => openEdit(item)}>Edit</button>
              <button className="ghost-btn" onClick={() => toggleHandled(item.id)}>{item.resolved ? "Unhandle" : "Handled"}</button>
              <button className="danger-btn" onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Tasks({ session, setSession, stats }) {
  const blank = { title: "", description: "", priority: "Must Do", timing: "Today", assignee: "Me", status: "To Do", source: "Manual" };
  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Open");

  const tasks = session.tasks || [];
  const filtered = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Complete") return task.status === "Complete";
    if (filter === "To Do") return task.status === "To Do";
    if (filter === "In Progress") return task.status === "In Progress";
    if (filter === "Must Do") return task.priority === "Must Do" && task.status !== "Complete";
    return task.status !== "Complete";
  });

  function setTasks(nextTasks) {
    setSession({ ...session, tasks: nextTasks });
  }

  function openAdd() {
    setEditingId(null);
    setForm(blank);
    setFormOpen(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setForm(task);
    setFormOpen(true);
  }

  function saveTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      setTasks(tasks.map((task) => (task.id === editingId ? { ...task, ...form } : task)));
    } else {
      setTasks([{ id: createId(), ...form }, ...tasks]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function updateTask(taskId, field, value) {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)));
  }

  function deleteTask(taskId) {
    setTasks(tasks.filter((task) => task.id !== taskId));
  }

  return (
    <section className="screen task-screen">
      <PageHeader icon={ICONS.tasks} label="Task Board" title="Tasks" subtitle="Manual tasks, daily templates, role tasks, and carryovers for this day only." />

      <article className="card task-command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Task Control</p>
            <h2>Today’s work</h2>
            <p className="muted">Add work manually and move it from To Do to In Progress to Complete.</p>
          </div>
          <button className="primary-btn" onClick={openAdd}>Add Task</button>
        </div>

        <div className="task-summary-grid">
          <div className="task-summary-tile todo"><strong>{stats.todoTasks}</strong><span>To Do</span></div>
          <div className="task-summary-tile progress"><strong>{stats.inProgressTasks}</strong><span>In Progress</span></div>
          <div className="task-summary-tile complete"><strong>{stats.tasksDone}</strong><span>Complete</span></div>
        </div>
      </article>

      <div className="filter-row">
        {TASK_FILTERS.map((chip) => <button key={chip} className={`filter-chip ${filter === chip ? "active" : ""}`} onClick={() => setFilter(chip)}>{chip}</button>)}
      </div>

      {formOpen && (
        <form className="card form-card task-form-card" onSubmit={saveTask}>
          <p className="eyebrow">{editingId ? "Edit Task" : "New Task"}</p>
          <input className="input" placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea className="textarea" placeholder="Details / notes" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />

          <div className="grid-2">
            <select className="input" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option>Must Do</option>
              <option>Should Do</option>
              <option>Can Wait</option>
            </select>
            <select className="input" value={form.timing} onChange={(event) => setForm({ ...form, timing: event.target.value })}>
              <option>Before 10 AM</option>
              <option>Today</option>
              <option>Before Leaving</option>
              <option>Later</option>
            </select>
          </div>

          <div className="grid-2">
            <select className="input" value={form.assignee} onChange={(event) => setForm({ ...form, assignee: event.target.value })}>
              <option>Me</option>
              <option>Shift Lead</option>
              <option>Team Member</option>
              <option>Kitchen</option>
              <option>Center Store</option>
            </select>
            <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>

          <div className="status-helper-row">
            {TASK_STATUSES.map((status) => (
              <button key={status} type="button" className={`status-pill ${statusToClass(status)} ${form.status === status ? "active" : ""}`} onClick={() => setForm({ ...form, status })}>
                <strong>{status}</strong>
                <span>{statusDescription(status)}</span>
              </button>
            ))}
          </div>

          <div className="action-row">
            <button className="primary-btn" type="submit">Save Task</button>
            <button className="ghost-btn" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stack">
        {filtered.length === 0 && <EmptyState title="No tasks here" text="Either you are caught up or the universe is lying." />}

        {filtered.map((task) => (
          <article key={task.id} className={`card task-card task-status-${statusToClass(task.status)} ${task.priority === "Must Do" && task.status !== "Complete" ? "must-card" : ""}`}>
            <div className="task-card-top">
              <span className={`task-status-dot ${statusToClass(task.status)}`} />
              <div className="task-main-text">
                <div className="task-title-row">
                  <div>
                    <h2 className={task.status === "Complete" ? "done-text" : ""}>{task.title}</h2>
                    <p className="muted">{task.description || "No details added."}</p>
                  </div>
                  <span className={`badge ${statusBadgeClass(task.status)}`}>{task.status}</span>
                </div>

                <div className="task-meta">
                  <span>{task.priority}</span>
                  <span>{task.timing}</span>
                  <span>{task.assignee}</span>
                  <span>{task.source || "Manual"}</span>
                </div>

                <div className="task-status-control">
                  {TASK_STATUSES.map((status) => (
                    <button key={status} className={task.status === status ? "active" : ""} onClick={() => updateTask(task.id, "status", status)}>{status}</button>
                  ))}
                </div>

                <div className="action-row compact-actions">
                  <button className="ghost-btn" onClick={() => openEdit(task)}>Edit</button>
                  <button className="danger-btn" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TruckDay({ session, setSession, stats, setScreen }) {
  const progress = Math.round((stats.truckDone / stats.truckTotal) * 100);

  function toggleTruckItem(key) {
    setSession({ ...session, truckState: { ...session.truckState, [key]: !session.truckState[key] } });
  }

  function updateTruckNote(sectionId, field, value) {
    setSession({
      ...session,
      truckNotes: {
        ...session.truckNotes,
        [sectionId]: { ...(session.truckNotes[sectionId] || { note: "", addToHandoff: false }), [field]: value },
      },
    });
  }

  return (
    <section className="screen">
      <PageHeader icon={ICONS.truck} label="Truck Day Commander" title="Truck Day" subtitle={`${stats.truckDone} / ${stats.truckTotal} checklist items complete`} />

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Truck Progress</p>
            <h2>{progress}% complete</h2>
          </div>
          <button className="ghost-btn" onClick={() => setScreen("handoff")}>Handoff</button>
        </div>
        <Progress value={progress} />
      </article>

      <div className="stack">
        {TRUCK_SECTIONS.map((section) => {
          const noteState = session.truckNotes[section.id] || { note: "", addToHandoff: false };
          const completed = section.items.filter((_, index) => session.truckState[`${section.id}-${index}`]).length;

          return (
            <article key={section.id} className="card truck-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">{section.priority}</p>
                  <h2>{section.title}</h2>
                </div>
                <span className="badge neutral">{completed}/{section.items.length}</span>
              </div>

              <div className="checklist">
                {section.items.map((item, index) => {
                  const key = `${section.id}-${index}`;
                  return (
                    <label key={key} className="check-row">
                      <input type="checkbox" checked={!!session.truckState[key]} onChange={() => toggleTruckItem(key)} />
                      <span className={session.truckState[key] ? "done-text" : ""}>{item}</span>
                    </label>
                  );
                })}
              </div>

              <label className="field-label">Section Notes</label>
              <textarea className="textarea" value={noteState.note} placeholder="Shorts, damages, unfinished water, cooler status..." onChange={(event) => updateTruckNote(section.id, "note", event.target.value)} />

              <label className="handoff-toggle">
                <input type="checkbox" checked={!!noteState.addToHandoff} onChange={(event) => updateTruckNote(section.id, "addToHandoff", event.target.checked)} />
                Add section note to handoff
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TeamNotes({ session, setSession }) {
  const blank = { employee: "", type: "Follow-up", note: "", date: todayISO(), addToHandoff: true };
  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function setTeamNotes(nextNotes) {
    setSession({ ...session, teamNotes: nextNotes });
  }

  function openAdd() {
    setEditingId(null);
    setForm(blank);
    setFormOpen(true);
  }

  function openEdit(note) {
    setEditingId(note.id);
    setForm(note);
    setFormOpen(true);
  }

  function saveNote(event) {
    event.preventDefault();
    if (!form.note.trim()) return;

    if (editingId) {
      setTeamNotes(session.teamNotes.map((note) => (note.id === editingId ? { ...note, ...form } : note)));
    } else {
      setTeamNotes([{ id: createId(), ...form }, ...session.teamNotes]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function toggleHandoff(noteId) {
    setTeamNotes(session.teamNotes.map((note) => (note.id === noteId ? { ...note, addToHandoff: !note.addToHandoff } : note)));
  }

  function deleteNote(noteId) {
    setTeamNotes(session.teamNotes.filter((note) => note.id !== noteId));
  }

  return (
    <section className="screen">
      <PageHeader icon={ICONS.team} label="People Stuff" title="Team Notes" subtitle="Coaching, wins, schedule notes, and follow-ups for today’s session." />

      <button className="primary-btn full" onClick={openAdd}>Add Team Note</button>

      {formOpen && (
        <form className="card form-card" onSubmit={saveNote}>
          <p className="eyebrow">{editingId ? "Edit Note" : "New Team Note"}</p>
          <input className="input" placeholder="Person or area" value={form.employee} onChange={(event) => setForm({ ...form, employee: event.target.value })} />
          <div className="grid-2">
            <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option>Follow-up</option>
              <option>Coaching</option>
              <option>Schedule</option>
              <option>Win</option>
              <option>Issue</option>
              <option>General</option>
            </select>
            <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </div>
          <textarea className="textarea" placeholder="What happened?" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          <label className="handoff-toggle">
            <input type="checkbox" checked={!!form.addToHandoff} onChange={(event) => setForm({ ...form, addToHandoff: event.target.checked })} />
            Add to Shift Handoff
          </label>
          <div className="action-row">
            <button className="primary-btn" type="submit">Save</button>
            <button className="ghost-btn" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stack">
        {session.teamNotes.length === 0 && <EmptyState title="No team notes" text="The quiet before someone asks about a schedule from two weeks from now." />}
        {session.teamNotes.map((note) => (
          <article key={note.id} className="card task-card">
            <div className="card-header">
              <div>
                <h2>{note.employee || "General"}</h2>
                <p className="muted">{note.type} · {note.date}</p>
              </div>
              {note.addToHandoff && <span className="badge warning">Handoff</span>}
            </div>
            <p className="note-text">{note.note}</p>
            <div className="action-row">
              <button className="ghost-btn" onClick={() => toggleHandoff(note.id)}>{note.addToHandoff ? "Remove from Handoff" : "Add to Handoff"}</button>
              <button className="ghost-btn" onClick={() => openEdit(note)}>Edit</button>
              <button className="danger-btn" onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Handoff({ manager, session, stats, dateWatch, handoffHistory, setHandoffHistory }) {
  const handoffData = makeHandoffData({ manager, session, stats, dateWatch });
  const handoffText = buildHandoffText(handoffData);

  async function copyHandoff() {
    try {
      await navigator.clipboard.writeText(handoffText);
      alert("Handoff copied.");
    } catch {
      alert("Copy failed. Select the preview text and copy it manually.");
    }
  }

  function saveHandoff() {
    const entry = {
      id: createId(),
      createdAt: new Date().toISOString(),
      person: manager.name,
      role: manager.role,
      shiftType: session.shiftType,
      staffingMode: handoffData.staffing.label,
      completedCount: handoffData.completed.length,
      openCount: handoffData.open.length,
      dateRiskCount: handoffData.dateRisks.length,
      walkNoteCount: handoffData.walkNotes.length,
      pulse: stats.pulse,
      text: handoffText,
    };
    setHandoffHistory([entry, ...handoffHistory].slice(0, 30));
    alert("Handoff saved to history.");
  }

  return (
    <section className="screen">
      <PageHeader icon={ICONS.handoff} label="End of Shift" title="Handoff Builder" subtitle="Auto-built from completed tasks, open tasks, walk notes, Date Watch, truck notes, team notes, and shift pressure." />

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Handoff Setup</p>
            <h2>{manager.name} · {session.shiftType}</h2>
            <p className="muted">{formatDate(session.date)} · {manager.role}</p>
          </div>
          <button className="primary-btn" onClick={copyHandoff}>Copy</button>
        </div>

        <div className="handoff-stats">
          <span>Pulse <b>{stats.pulse}</b></span>
          <span>Done <b>{handoffData.completed.length}</b></span>
          <span>Open <b>{handoffData.open.length}</b></span>
          <span>Risks <b>{handoffData.dateRisks.length}</b></span>
        </div>

        <button className="ghost-btn full top-space" onClick={saveHandoff}>Save to Handoff History</button>
      </article>

      <HandoffSection title="Completed" items={handoffData.completed.map((task) => task.title)} />
      <HandoffSection title="Still Needs Done" items={handoffData.open.map((task) => `${task.title} (${task.priority}, ${task.assignee})`)} />
      <HandoffSection title="Date Watch" items={handoffData.dateRisks.map((item) => `${item.name}: ${item.dateStatus}${item.expirationDate ? `, date ${item.expirationDate}` : ""}${item.issueType !== "None" ? `, ${item.issueType}` : ""}${item.notes ? `, note: ${item.notes}` : ""}`)} />
      <HandoffSection title="Daily Store Walk Notes" items={handoffData.walkNotes.map((item) => `${item.area} / ${item.title}: ${item.status} - ${item.note || item.prompt}`)} />
      <HandoffSection title="Team Notes" items={handoffData.teamForHandoff.map((note) => `${note.employee || "General"}: ${note.type} - ${note.note}`)} />
      <HandoffSection title="Truck Day Notes" items={[`Truck progress: ${stats.truckDone} / ${stats.truckTotal} complete`, ...handoffData.truckForHandoff]} />
      <HandoffSection title="Visible Win" items={[session.visibleWin]} />

      <article className="card">
        <p className="eyebrow">Plain Text Preview</p>
        <pre className="handoff-preview">{handoffText}</pre>
      </article>

      <article className="card">
        <p className="eyebrow">Saved Handoffs</p>
        <h2>Handoff History</h2>
        <p className="muted">Last 30 saved handoffs stay on this device.</p>
      </article>

      <div className="stack">
        {handoffHistory.length === 0 && <EmptyState title="No saved handoffs yet" text="Save one when the shift has collected enough evidence." />}
        {handoffHistory.map((entry) => (
          <article key={entry.id} className="card history-card">
            <div className="card-header">
              <div>
                <h2>{entry.person} · {entry.shiftType}</h2>
                <p className="muted">{formatDateTime(entry.createdAt)} · {entry.staffingMode}</p>
              </div>
              <span className="badge success">Pulse {entry.pulse}</span>
            </div>
            <div className="handoff-stats">
              <span>Done <b>{entry.completedCount}</b></span>
              <span>Open <b>{entry.openCount}</b></span>
              <span>Risks <b>{entry.dateRiskCount}</b></span>
              <span>Walk Notes <b>{entry.walkNoteCount}</b></span>
            </div>
            <details>
              <summary>Show saved text</summary>
              <pre className="handoff-preview">{entry.text}</pre>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}

function EndShiftReview({ manager, session, setSession, stats, dateWatch, setScreen, setDailyLog, setHandoffHistory, handoffHistory }) {
  const incompleteTasks = session.tasks.filter((task) => task.status !== "Complete");
  const criticalCarryover = incompleteTasks.filter((task) => task.priority !== "Can Wait");
  const handoffData = makeHandoffData({ manager, session, stats, dateWatch });
  const handoffText = buildHandoffText(handoffData);

  function updateTaskCarryover(taskId, mode) {
    setSession({
      ...session,
      tasks: session.tasks.map((task) => (task.id === taskId ? { ...task, carryoverDecision: mode } : task)),
    });
  }

  function saveDayAndHandoff() {
    const archived = {
      ...buildDailyArchive(session, stats, manager),
      savedAt: new Date().toISOString(),
      endShiftNotes: session.endShiftNotes,
    };
    setDailyLog((previous) => [archived, ...previous.filter((item) => item.sessionId !== session.sessionId)].slice(0, 60));

    const entry = {
      id: createId(),
      createdAt: new Date().toISOString(),
      person: manager.name,
      role: manager.role,
      shiftType: session.shiftType,
      staffingMode: handoffData.staffing.label,
      completedCount: handoffData.completed.length,
      openCount: handoffData.open.length,
      dateRiskCount: handoffData.dateRisks.length,
      walkNoteCount: handoffData.walkNotes.length,
      pulse: stats.pulse,
      text: handoffText,
    };
    setHandoffHistory([entry, ...handoffHistory].slice(0, 30));
    setSession({ ...session, reviewedAt: new Date().toISOString() });
    alert("Day saved and handoff added.");
    setScreen("handoff");
  }

  function startTomorrowWithCarryover() {
    const carryover = session.tasks
      .filter((task) => task.status !== "Complete")
      .filter((task) => (task.carryoverDecision || "Carry Over") === "Carry Over")
      .map((task) => ({ ...task, sessionDate: session.date, carryoverStatus: "To Do" }));

    setDailyLog((previous) => archiveSession(session, previous, stats, manager));
    setSession(makeFreshDailySession(todayISO(), manager.id, carryover));
    setScreen("dashboard");
  }

  return (
    <section className="screen">
      <PageHeader icon={ICONS.review} label="End Shift Review" title="Review, save, and carry over" subtitle="Close today properly instead of letting unfinished work wander into tomorrow without a name tag." />

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Shift Recap</p>
            <h2>{formatDate(session.date)}</h2>
            <p className="muted">{manager.name} · {session.shiftType} · Pulse {stats.pulse}</p>
          </div>
          <button className="primary-btn" onClick={saveDayAndHandoff}>Save Day & Handoff</button>
        </div>

        <div className="daily-summary-grid">
          <span><b>{stats.tasksDone}</b> Complete</span>
          <span><b>{stats.tasksOpen}</b> Open</span>
          <span><b>{stats.dateRisks}</b> Date Risks</span>
          <span><b>{stats.walkDone}/{WALK_ITEMS.length}</b> Walk</span>
        </div>

        <label className="field-label">End shift notes</label>
        <textarea
          className="textarea"
          placeholder="Anything the next manager should know?"
          value={session.endShiftNotes || ""}
          onChange={(event) => setSession({ ...session, endShiftNotes: event.target.value })}
        />
      </article>

      <article className="card">
        <p className="eyebrow">Carryover Tasks</p>
        <h2>{incompleteTasks.length} incomplete tasks</h2>
        <p className="muted">Choose what should follow into the next fresh daily session.</p>

        <div className="stack top-space">
          {incompleteTasks.length === 0 && <EmptyState title="No carryover needed" text="A rare and suspicious achievement." />}
          {incompleteTasks.map((task) => (
            <div key={task.id} className="carryover-row">
              <div>
                <strong>{task.title}</strong>
                <p>{task.priority} · {task.status} · {task.assignee}</p>
              </div>
              <select className="input" value={task.carryoverDecision || "Carry Over"} onChange={(event) => updateTaskCarryover(task.id, event.target.value)}>
                <option>Carry Over</option>
                <option>Handoff Only</option>
                <option>Drop</option>
              </select>
            </div>
          ))}
        </div>

        <button className="ghost-btn full top-space" onClick={startTomorrowWithCarryover}>
          Start Fresh Session with Carryover
        </button>
      </article>

      <article className="card">
        <p className="eyebrow">Suggested Handoff</p>
        <pre className="handoff-preview">{handoffText}</pre>
      </article>
    </section>
  );
}

function ShiftStrategy({ session, setSession, stats, actionQueue }) {
  const mode = STAFFING_MODES.find((item) => item.id === session.staffingMode) || STAFFING_MODES[0];
  const strategy = getStrategyForMode(session.staffingMode, session.shiftType);

  return (
    <section className="screen">
      <PageHeader icon={ICONS.strategy} label="Manager Brain" title="Shift Strategy" subtitle="A simple playbook for deciding what matters when everything is yelling." />

      <article className="card command-card">
        <p className="eyebrow">Current Mode</p>
        <h2>{mode.label}</h2>
        <p className="muted">{mode.description}</p>
        <select className="input top-space" value={session.staffingMode} onChange={(event) => setSession({ ...session, staffingMode: event.target.value })}>
          {STAFFING_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </article>

      <article className="card">
        <p className="eyebrow">Shift Pulse</p>
        <h2>{stats.pulse}/100</h2>
        <p className="muted">{getPulseMessage(stats.pulse)}</p>
        <Progress value={stats.pulse} />
      </article>

      <article className="card">
        <p className="eyebrow">Playbook</p>
        <ul className="simple-list">{strategy.map((item) => <li key={item}>{item}</li>)}</ul>
      </article>

      <article className="card">
        <p className="eyebrow">Top Action Queue</p>
        <div className="action-queue">
          {actionQueue.slice(0, 5).map((action) => (
            <div key={action.id} className={`queue-item static ${action.tone}`}>
              <div>
                <span className="queue-priority">{action.priority}</span>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function DailyLog({ dailyLog }) {
  return (
    <section className="screen">
      <PageHeader icon={ICONS.log} label="Daily Archive" title="Daily Log" subtitle="Saved daily sessions. Yesterday can live here instead of haunting today." />

      <div className="stack">
        {dailyLog.length === 0 && <EmptyState title="No saved daily logs yet" text="Save a day from End Shift Review or Today’s Session." />}
        {dailyLog.map((entry) => (
          <article key={entry.sessionId} className="card daily-log-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">{formatDate(entry.date)}</p>
                <h2>{entry.managerName} · {entry.shiftType}</h2>
                <p className="muted">Saved {formatDateTime(entry.savedAt)} · Pulse {entry.pulse}</p>
              </div>
              <span className="badge neutral">{entry.staffingMode}</span>
            </div>

            <div className="daily-summary-grid">
              <span><b>{entry.tasksDone}</b> Complete</span>
              <span><b>{entry.tasksOpen}</b> Open</span>
              <span><b>{entry.walkDone}/{WALK_ITEMS.length}</b> Walk</span>
              <span><b>{entry.truckDone}/{entry.truckTotal}</b> Truck</span>
            </div>

            <details>
              <summary>Show details</summary>
              <div className="daily-detail-block">
                <h3>Top 3</h3>
                <ul>{entry.topThree.map((item, index) => <li key={index}>{item}</li>)}</ul>
                <h3>Open Tasks</h3>
                <ul>{listOrNone(entry.openTasks).map((item, index) => <li key={index}>{item}</li>)}</ul>
                <h3>Team Notes</h3>
                <ul>{listOrNone(entry.teamNotes).map((item, index) => <li key={index}>{item}</li>)}</ul>
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}

function More({ setScreen }) {
  const tools = [
    { title: "Truck Day", text: "Receiving, cooler, water, recovery, and truck notes.", screen: "truck", icon: ICONS.truck },
    { title: "Team Notes", text: "Coaching, follow-ups, wins, and schedule notes.", screen: "team", icon: ICONS.team },
    { title: "Handoff Builder", text: "Auto-generate and save shift handoffs.", screen: "handoff", icon: ICONS.handoff },
    { title: "End Shift Review", text: "Save the day, build handoff, and choose carryovers.", screen: "review", icon: ICONS.review },
    { title: "Shift Strategy", text: "Mode-based guidance for normal days, truck days, and short staffing.", screen: "strategy", icon: ICONS.strategy },
    { title: "Daily Log", text: "Review saved daily sessions.", screen: "daily-log", icon: ICONS.log },
  ];

  return (
    <section className="screen">
      <PageHeader icon={ICONS.more} label="More Tools" title="Store Support" subtitle="Extra tools without turning the bottom nav into a button salad." />

      <div className="stack">
        {tools.map((tool) => (
          <article key={tool.title} className="card tool-card">
            <div className="card-row">
              <div className="tool-title">
                <span className="icon-chip">{tool.icon}</span>
                <div>
                  <h2>{tool.title}</h2>
                  <p className="muted">{tool.text}</p>
                </div>
              </div>
              <button className="ghost-btn" onClick={() => setScreen(tool.screen)}>Open</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BottomNav({ screen, setScreen }) {
  const nav = [
    ["dashboard", "Home", ICONS.home],
    ["walk", "Walk", ICONS.walk],
    ["dates", "Dates", ICONS.dates],
    ["tasks", "Tasks", ICONS.tasks],
    ["more", "More", ICONS.more],
  ];

  return (
    <nav className="bottom-nav">
      {nav.map(([id, label, icon]) => (
        <button key={id} className={screen === id ? "active" : ""} onClick={() => setScreen(id)}>
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

function buildStats(session, dateWatch) {
  const walkState = session.walkState || makeWalkState();
  const tasks = session.tasks || [];
  const walkDone = WALK_ITEMS.filter((item) => walkState[item.id]?.checked).length;
  const walkUrgent = WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Urgent").length;
  const walkAttention = WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Needs Attention").length;
  const tasksDone = tasks.filter((task) => task.status === "Complete").length;
  const tasksOpen = tasks.filter((task) => task.status !== "Complete").length;
  const todoTasks = tasks.filter((task) => task.status === "To Do").length;
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
  const mustDoOpen = tasks.filter((task) => task.status !== "Complete" && task.priority === "Must Do").length;
  const dateRisks = dateWatch.filter((item) => !item.resolved && ["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus)).length;
  const pullNow = dateWatch.filter((item) => item.dateStatus === "Pull Now").length;
  const pullToday = dateWatch.filter((item) => item.dateStatus === "Pull Today").length;
  const truckTotal = TRUCK_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);
  const truckDone = Object.values(session.truckState || {}).filter(Boolean).length;
  const areaHealth = buildAreaHealth(walkState);

  const pressure =
    walkUrgent * 18 +
    walkAttention * 8 +
    pullNow * 18 +
    pullToday * 10 +
    mustDoOpen * 8 +
    Math.max(0, tasksOpen - 4) * 5 +
    (session.staffingMode === "short" ? 8 : 0) +
    (session.staffingMode === "very-short" ? 18 : 0) +
    (session.staffingMode === "truck" || new Date().getDay() === 3 ? 10 : 0);

  return {
    walkDone,
    walkUrgent,
    walkAttention,
    tasksDone,
    tasksOpen,
    todoTasks,
    inProgressTasks,
    mustDoOpen,
    dateRisks,
    pullNow,
    pullToday,
    truckTotal,
    truckDone,
    areaHealth,
    pulse: Math.max(0, Math.min(100, 100 - pressure)),
  };
}

function buildAreaHealth(walkState) {
  const areas = Array.from(new Set(WALK_ITEMS.map((item) => item.area)));
  return areas.map((area) => {
    const items = WALK_ITEMS.filter((item) => item.area === area);
    const done = items.filter((item) => walkState[item.id]?.checked).length;
    const urgent = items.filter((item) => walkState[item.id]?.status === "Urgent").length;
    const attention = items.filter((item) => walkState[item.id]?.status === "Needs Attention").length;
    let tone = "good";
    let label = "Looks good";

    if (urgent) {
      tone = "bad";
      label = `${urgent} urgent`;
    } else if (attention) {
      tone = "warn";
      label = `${attention} attention`;
    } else if (done < items.length) {
      tone = "neutral";
      label = "Not finished";
    }

    return { area, done, total: items.length, urgent, attention, tone, label };
  });
}

function buildActionQueue({ session, manager, stats, dateWatch }) {
  const queue = [];
  const hour = new Date().getHours();
  const isTruckMode = new Date(`${session.date}T00:00:00`).getDay() === 3 || session.shiftType === "Truck Day" || session.staffingMode === "truck";

  dateWatch.filter((item) => item.dateStatus === "Pull Now").forEach((item) => queue.push({
    id: `pull-now-${item.id}`,
    priority: "Critical",
    title: `Pull expired item: ${item.name}`,
    detail: item.notes || "Expired Date Watch item needs removed.",
    screen: "dates",
    tone: "danger",
  }));

  dateWatch.filter((item) => item.dateStatus === "Pull Today").forEach((item) => queue.push({
    id: `pull-today-${item.id}`,
    priority: "Today",
    title: `Check pull item: ${item.name}`,
    detail: item.expirationDate ? `Date: ${item.expirationDate}` : "Needs checked today.",
    screen: "dates",
    tone: "warning",
  }));

  dateWatch.filter((item) => item.dateStatus === "BOGO Soon").slice(0, 3).forEach((item) => queue.push({
    id: `bogo-${item.id}`,
    priority: "Soon",
    title: `Plan BOGO / markdown: ${item.name}`,
    detail: item.notes || "Near-date item on watch.",
    screen: "dates",
    tone: "warning",
  }));

  WALK_ITEMS.filter((item) => session.walkState[item.id]?.status === "Urgent").forEach((item) => queue.push({
    id: `urgent-walk-${item.id}`,
    priority: "Urgent",
    title: `Walk issue: ${item.title}`,
    detail: session.walkState[item.id]?.note || item.prompt,
    screen: "walk",
    tone: "danger",
  }));

  if (hour < 10 && stats.walkDone < WALK_ITEMS.length) {
    queue.push({
      id: "finish-walk",
      priority: "Before 10",
      title: "Finish Daily Store Walk",
      detail: `${stats.walkDone}/${WALK_ITEMS.length} complete.`,
      screen: "walk",
      tone: "warning",
    });
  }

  session.tasks.filter((task) => task.priority === "Must Do" && task.status !== "Complete").slice(0, 4).forEach((task) => queue.push({
    id: `task-${task.id}`,
    priority: "Must Do",
    title: task.title,
    detail: task.description || `${task.assignee} · ${task.timing}`,
    screen: "tasks",
    tone: "warning",
  }));

  if (manager.id === "jamie") {
    queue.push({
      id: "role-kitchen",
      priority: "Role",
      title: "Kitchen manager focus",
      detail: "Food safety, production readiness, and kitchen team follow-up.",
      screen: "tasks",
      tone: "neutral",
    });
  }

  if (manager.id === "loretta") {
    queue.push({
      id: "role-gm",
      priority: "Role",
      title: "GM follow-up review",
      detail: "Staffing, standards, open issues, and manager handoffs.",
      screen: "review",
      tone: "neutral",
    });
  }

  if (manager.id === "adria") {
    queue.push({
      id: "role-shift",
      priority: "Role",
      title: "Shift supervisor focus",
      detail: "Assignments, cooler progress, task follow-through, and team communication.",
      screen: "tasks",
      tone: "neutral",
    });
  }

  if (isTruckMode) {
    queue.push({
      id: "truck-day",
      priority: "Truck",
      title: "Truck Day mode active",
      detail: "Prioritize cooler, freezer, water, center store outs, and recovery.",
      screen: "truck",
      tone: "neutral",
    });
  }

  if (session.staffingMode === "very-short") {
    queue.push({
      id: "very-short",
      priority: "Survival",
      title: "Very short staffed",
      detail: "Protect guests, money, food safety, bathrooms, and urgent pulls.",
      screen: "strategy",
      tone: "danger",
    });
  } else if (session.staffingMode === "short") {
    queue.push({
      id: "short",
      priority: "Staffing",
      title: "Short staffed plan",
      detail: "Do the basics first, then visible wins.",
      screen: "strategy",
      tone: "warning",
    });
  }

  if (!queue.length) {
    queue.push({
      id: "quiet",
      priority: "Steady",
      title: "No major fires showing",
      detail: "Pick one visible win and leave the store better than you found it.",
      screen: "dashboard",
      tone: "success",
    });
  }

  const priorityOrder = { Critical: 0, Urgent: 1, Today: 2, "Before 10": 3, "Must Do": 4, Truck: 5, Survival: 6, Staffing: 7, Role: 8, Soon: 9, Steady: 10 };
  return queue.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));
}

function makeHandoffData({ manager, session, stats, dateWatch }) {
  const staffing = STAFFING_MODES.find((mode) => mode.id === session.staffingMode) || STAFFING_MODES[0];
  const completed = session.tasks.filter((task) => task.status === "Complete");
  const open = session.tasks.filter((task) => task.status !== "Complete");
  const dateRisks = dateWatch.filter((item) => !item.resolved && (["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus) || item.issueType !== "None"));
  const walkNotes = WALK_ITEMS.filter((item) => {
    const state = session.walkState[item.id];
    return state && (state.addToHandoff || state.note?.trim() || state.status === "Needs Attention" || state.status === "Urgent");
  }).map((item) => ({ ...item, ...(session.walkState[item.id] || {}) }));
  const teamForHandoff = session.teamNotes.filter((note) => note.addToHandoff);
  const truckForHandoff = TRUCK_SECTIONS.filter((section) => {
    const note = session.truckNotes[section.id];
    return note?.addToHandoff || note?.note;
  }).map((section) => {
    const note = session.truckNotes[section.id];
    return `${section.title}: ${note?.note || "Marked for follow-up"}`;
  });

  return { manager, session, stats, staffing, completed, open, dateRisks, walkNotes, teamForHandoff, truckForHandoff };
}

function buildHandoffText({ manager, session, stats, staffing, completed, open, dateRisks, walkNotes, teamForHandoff, truckForHandoff }) {
  const lines = [];
  lines.push("SHIFT HANDOFF");
  lines.push(`Created: ${formatDateTime()}`);
  lines.push(`Date: ${formatDate(session.date)}`);
  lines.push(`By: ${manager.name}`);
  lines.push(`Role: ${manager.role}`);
  lines.push(`Shift: ${session.shiftType}`);
  lines.push(`Staffing Mode: ${staffing.label}`);
  lines.push(`Shift Pulse: ${stats.pulse}/100`);
  if (session.endShiftNotes) lines.push(`End Shift Notes: ${session.endShiftNotes}`);
  lines.push("");

  lines.push("Completed:", ...listOrNone(completed.map((task) => `- ${task.title}`)), "");
  lines.push("Still Needs Done:", ...listOrNone(open.map((task) => `- ${task.title} (${task.priority}, ${task.assignee}, ${task.status})`)), "");
  lines.push("Date Watch:", ...listOrNone(dateRisks.map((item) => `- ${item.name}: ${item.dateStatus}${item.expirationDate ? `, date ${item.expirationDate}` : ""}${item.issueType !== "None" ? `, ${item.issueType}` : ""}${item.notes ? `, note: ${item.notes}` : ""}`)), "");
  lines.push("Daily Store Walk Notes:", ...listOrNone(walkNotes.map((item) => `- ${item.area} / ${item.title}: ${item.status} - ${item.note || item.prompt}`)), "");
  lines.push("Team Notes:", ...listOrNone(teamForHandoff.map((note) => `- ${note.employee || "General"}: ${note.type} - ${note.note}`)), "");
  lines.push("Truck Day Notes:", `- Truck progress: ${stats.truckDone} / ${stats.truckTotal} complete`, ...listOrNone(truckForHandoff.map((note) => `- ${note}`)), "");
  lines.push("Visible Win:", ...listOrNone(session.visibleWin ? [`- ${session.visibleWin}`] : []));
  return lines.join("\n");
}

function buildDailyArchive(session, stats, manager) {
  return {
    sessionId: session.sessionId,
    date: session.date,
    savedAt: new Date().toISOString(),
    managerId: manager.id,
    managerName: manager.name,
    managerRole: manager.role,
    shiftType: session.shiftType,
    staffingMode: (STAFFING_MODES.find((mode) => mode.id === session.staffingMode) || STAFFING_MODES[0]).label,
    pulse: stats.pulse,
    tasksDone: stats.tasksDone,
    tasksOpen: stats.tasksOpen,
    walkDone: stats.walkDone,
    truckDone: stats.truckDone,
    truckTotal: stats.truckTotal,
    topThree: session.topThree,
    openTasks: session.tasks.filter((task) => task.status !== "Complete").map((task) => `${task.title} (${task.status})`),
    teamNotes: session.teamNotes.map((note) => `${note.employee || "General"}: ${note.note}`),
    endShiftNotes: session.endShiftNotes || "",
  };
}

function archiveSession(session, previous, statsOverride = null, managerOverride = null) {
  const manager = managerOverride || MANAGERS.find((item) => item.id === session.managerId) || MANAGERS[1];
  const stats = statsOverride || buildStats(session, []);
  const archived = buildDailyArchive(session, stats, manager);
  return [archived, ...previous.filter((item) => item.sessionId !== session.sessionId)].slice(0, 60);
}

function saveCurrentDay({ session, setSession, setDailyLog, managerId }) {
  const manager = MANAGERS.find((item) => item.id === managerId) || MANAGERS[1];
  const stats = buildStats(session, []);
  setDailyLog((previous) => archiveSession(session, previous, stats, manager));
  setSession({ ...session, reviewedAt: new Date().toISOString() });
  alert("Today saved to Daily Log.");
}

function startFreshToday({ session, setSession, setDailyLog, managerId }) {
  const manager = MANAGERS.find((item) => item.id === managerId) || MANAGERS[1];
  const stats = buildStats(session, []);
  setDailyLog((previous) => archiveSession(session, previous, stats, manager));
  const carryover = session.tasks
    .filter((task) => task.status !== "Complete")
    .filter((task) => task.priority !== "Can Wait")
    .map((task) => ({ ...task, sessionDate: session.date, carryoverStatus: "To Do" }));
  setSession(makeFreshDailySession(todayISO(), managerId, carryover));
}

function getStrategyForMode(mode, shiftType) {
  if (shiftType === "Close") {
    return ["Prioritize recovery, trash, bathrooms, cooler face, and clear handoff notes.", "Leave the morning team setup details instead of vague mystery crumbs.", "Do not chase low-impact tasks if guest-facing basics are rough."];
  }

  if (shiftType === "Open") {
    return ["Daily Walk, coffee/fountain, donuts/bakery, Date Watch, and must-do tasks come first.", "Protect the first two hours from wandering tasks.", "Finish the handoff review before the day starts inventing new hobbies."];
  }

  const strategies = {
    normal: ["Finish Daily Walk early.", "Handle Date Watch risks before they become shrink or food safety issues.", "Knock out Must Do tasks, then pick one visible win.", "Save a handoff before leaving."],
    short: ["Protect guest-facing basics first: registers, bathrooms, coffee, fountain, and visible trash.", "Only chase the top 3 priorities.", "Use handoff notes aggressively so the next shift knows what got sacrificed.", "Do one visible recovery pass before leaving."],
    "very-short": ["Survival order: safety, guests, money, food safety, bathrooms, urgent pulls.", "Do not try to win the whole store.", "Mark unfinished work clearly in handoff.", "Skip noncritical perfection tasks."],
    training: ["Give the trainee one clear area at a time.", "Check back in after 15-20 minutes.", "Document coaching notes while they are fresh.", "End with one specific win and one follow-up item."],
    truck: ["Cooler/freezer first.", "Water, outs, displays, and high-traffic aisles next.", "Keep cardboard under control.", "Save truck notes in handoff: unfinished water, shorts, damages, cooler status."],
  };
  return strategies[mode] || strategies.normal;
}

function getPulseTone(pulse) {
  if (pulse >= 75) return "good";
  if (pulse >= 45) return "warn";
  return "bad";
}

function getPulseMessage(pulse) {
  if (pulse >= 75) return "Stable shift. Keep momentum and finish the visible stuff.";
  if (pulse >= 45) return "Manageable, but prioritize. Do not let the list become a monster with shoes.";
  return "High pressure. Switch to survival priorities and document what cannot get done.";
}

function statusToClass(status) {
  if (status === "Complete") return "complete";
  if (status === "In Progress") return "progress";
  return "todo";
}

function statusBadgeClass(status) {
  if (status === "Complete") return "complete";
  if (status === "In Progress") return "progress";
  return "todo";
}

function statusDescription(status) {
  if (status === "Complete") return "Done and ready for handoff.";
  if (status === "In Progress") return "Started, not finished.";
  return "Not started yet.";
}

function PageHeader({ icon, label, title, subtitle }) {
  return (
    <header className="page-header">
      <div className="title-row">
        {icon && <span className="icon-chip">{icon}</span>}
        <p className="eyebrow">{label}</p>
      </div>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
    </header>
  );
}

function MetricCard({ label, value, detail, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </article>
  );
}

function Progress({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = status === "Watching" || status === "Handled" ? "success" : status === "BOGO Soon" ? "warning" : "danger";
  return <span className={`badge ${tone}`}>{status}</span>;
}

function EmptyState({ title, text }) {
  return (
    <article className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function HandoffSection({ title, items }) {
  return (
    <article className="card">
      <p className="eyebrow">{title}</p>
      <ul className="simple-list">
        {listOrNone(items).map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </article>
  );
}

function listOrNone(items) {
  return items && items.length ? items : ["- None"];
}
