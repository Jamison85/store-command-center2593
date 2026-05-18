import React, { useEffect, useMemo, useState } from "react";

const MANAGERS = [
  {
    id: "loretta",
    displayName: "Loretta",
    role: "GM",
    title: "General Manager",
    focus: "Store-wide priorities, staffing, standards, and follow-up.",
    initials: "LG",
  },
  {
    id: "jamison",
    displayName: "Jamison",
    role: "CSR",
    title: "Center Store / CSR",
    focus: "Center store, date watch, daily walk, handoff, and shift execution.",
    initials: "JR",
  },
  {
    id: "jamie",
    displayName: "Jamie",
    role: "Kitchen Manager",
    title: "Kitchen Manager",
    focus: "Kitchen standards, food safety, production, and kitchen team follow-up.",
    initials: "JM",
  },
  {
    id: "adria",
    displayName: "Adria",
    role: "Shift Supervisor",
    title: "Shift Supervisor",
    focus: "Shift coverage, task follow-through, cooler, and team communication.",
    initials: "AS",
  },
];

const PEOPLE = MANAGERS.map((manager) => manager.displayName);
const SHIFT_TYPES = ["Open", "Mid", "Close", "Truck Day", "Short Staffed", "Other"];
const STAFFING_MODES = [
  { id: "normal", label: "Normal", description: "Run the full routine." },
  { id: "short", label: "Short Staffed", description: "Protect the basics and the money." },
  { id: "very-short", label: "Very Short", description: "Survival mode. Guest-facing first." },
  { id: "training", label: "Training Day", description: "Build in follow-up checks." },
  { id: "truck", label: "Truck Day", description: "Freight, cooler, water, recovery." },
];

const WATCH_STATUSES = ["All", "Watching", "BOGO Soon", "Pull Today", "Pull Now", "Need to Order", "Handled"];
const TASK_FILTERS = ["Open", "Must Do", "In Progress", "Complete", "All"];
const TASK_STATUSES = [
  { id: "To Do", label: "To Do", helper: "Not started yet" },
  { id: "In Progress", label: "In Progress", helper: "Started / partly done" },
  { id: "Complete", label: "Complete", helper: "Finished" },
];

const WALK_ITEMS = [
  {
    id: "exterior-lot",
    area: "Exterior",
    title: "Lot / Trash / Signage",
    prompt: "Parking lot, landscaping, dumpster area, outside signage, and trash cans meet standards?",
    impact: "Guest first impression",
  },
  {
    id: "exterior-fuel",
    area: "Exterior",
    title: "Fuel Pumps",
    prompt: "Pumps clean, diesel handles clean, receipt paper stocked, washer buckets full, squeegees present?",
    impact: "Fuel guest experience",
  },
  {
    id: "interior-clean",
    area: "Interior",
    title: "Floors / Restrooms / Trash",
    prompt: "Center store and restrooms clean, swept, mopped, and trash under control?",
    impact: "Guest comfort",
  },
  {
    id: "interior-counter",
    area: "Interior",
    title: "Counter / Tobacco / FFE",
    prompt: "FFE, Red Bull cooler, tobacco back bar, and sales counter clean and stocked?",
    impact: "Speed and sales",
  },
  {
    id: "interior-center-store",
    area: "Interior",
    title: "Center Store",
    prompt: "Aisles, power wings, and displays replenished and front-faced?",
    impact: "Sales floor recovery",
  },
  {
    id: "cooler",
    area: "Cooler",
    title: "Cold Vault / Beer",
    prompt: "Cold vaults, beer doors, beer cave, and high-traffic drinks stocked and faced?",
    impact: "High-volume outs",
  },
  {
    id: "pdb-coffee",
    area: "P&DB",
    title: "Coffee / Fountain",
    prompt: "Coffee, fountain, cups, lids, straws, creamers, counters, and machines clean and stocked?",
    impact: "Morning rush",
  },
  {
    id: "pdb-bakery",
    area: "P&DB",
    title: "Donuts / Bakery / Open-Air",
    prompt: "Donut case, open-air cooler, and bakery rack clean, stocked, and set correctly?",
    impact: "Food presentation",
  },
  {
    id: "kitchen",
    area: "Kitchen",
    title: "Kitchen Standards",
    prompt: "Kitchen clean, organized, stocked, and following food safety guidelines?",
    impact: "Food safety",
  },
  {
    id: "team",
    area: "Team",
    title: "Team / Guest Interaction",
    prompt: "Team in uniform, name tags visible, greeting guests, and using Rewards / suggestive selling?",
    impact: "Service behavior",
  },
  {
    id: "other",
    area: "Other",
    title: "Anything Weird",
    prompt: "Anything else need addressed before it becomes a tiny retail documentary?",
    impact: "Manager judgment",
  },
];

const TRUCK_SECTIONS = [
  {
    id: "prep",
    title: "Before Truck Arrives",
    priority: "Set the battlefield",
    items: [
      "Clear receiving path and backroom space",
      "Have paperwork / invoice ready",
      "Assign cooler, freezer, totes, water, and center store",
      "Check urgent outs before pallets arrive",
    ],
  },
  {
    id: "receive",
    title: "Receiving",
    priority: "Catch problems early",
    items: [
      "Check obvious damages, shorts, or weirdness",
      "Separate cooler and freezer first",
      "Stage totes by area",
      "Keep paperwork somewhere that is not the void",
    ],
  },
  {
    id: "cold",
    title: "Cooler / Freezer",
    priority: "Temperature-sensitive first",
    items: [
      "Work temp-sensitive items first",
      "Fill milk, creamer, water, soda, and energy drinks",
      "Face cold vault and beer doors",
      "Note major outs or overstock",
    ],
  },
  {
    id: "center",
    title: "Center Store",
    priority: "Visible outs and high traffic",
    items: [
      "Work outs and high-traffic areas first",
      "Stock displays and power wings",
      "Front-face visible aisles",
      "Break down cardboard before it becomes architecture",
    ],
  },
  {
    id: "bulk",
    title: "Water / Bulk / Displays",
    priority: "Heavy stuff without chaos",
    items: [
      "Stage water safely",
      "Fill endcaps and displays",
      "Check backstock blocking paths",
      "Leave a note if water is unfinished",
    ],
  },
  {
    id: "recovery",
    title: "Recovery Before Leaving",
    priority: "Make the store look intentional",
    items: [
      "Sweep backroom path",
      "Recover visible aisles",
      "Confirm endcaps look presentable",
      "Pick one visible win before leaving",
    ],
  },
];

const DEFAULT_TASKS = [
  {
    id: createId(),
    title: "Complete Daily Store Walk",
    description: "Check standards before the day starts throwing chairs.",
    priority: "Must Do",
    timing: "Before 10 AM",
    assignee: "Me",
    status: "To Do",
    source: "Default",
  },
  {
    id: createId(),
    title: "Review Date Watch items",
    description: "Check the items you noticed, not the entire known universe.",
    priority: "Must Do",
    timing: "Before 10 AM",
    assignee: "Me",
    status: "To Do",
    source: "Default",
  },
  {
    id: createId(),
    title: "Pick one visible win",
    description: "Make one area noticeably better before leaving.",
    priority: "Should Do",
    timing: "Today",
    assignee: "Me",
    status: "To Do",
    source: "Default",
  },
];

const DEFAULT_DATE_WATCH = [
  {
    id: createId(),
    name: "French Vanilla Creamer",
    quantity: 4,
    area: "Dairy",
    issueType: "None",
    expirationDate: addDays(2),
    notes: "Watch for BOGO / pull timing.",
    resolved: false,
  },
  {
    id: createId(),
    name: "Half & Half Creamer",
    quantity: 4,
    area: "Dairy",
    issueType: "None",
    expirationDate: todayISO(),
    notes: "Check today.",
    resolved: false,
  },
  {
    id: createId(),
    name: "Ribbon Pepperoni",
    quantity: 3,
    area: "Kitchen",
    issueType: "Need to Order",
    expirationDate: "",
    notes: "Low count.",
    resolved: false,
  },
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
      // The app still works for the current session if storage gets dramatic.
    }
  }, [key, value]);

  return [value, setValue];
}

function makeWalkState() {
  return WALK_ITEMS.reduce((acc, item) => {
    acc[item.id] = {
      checked: false,
      status: "Good",
      note: "",
      addToHandoff: false,
    };
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
    acc[section.id] = {
      note: "",
      addToHandoff: false,
    };
    return acc;
  }, {});
}

function getTaskStatus(status) {
  if (status === "Done") return "Complete";
  if (status === "Not Started") return "To Do";
  return status || "To Do";
}

function isTaskComplete(task) {
  return getTaskStatus(task.status) === "Complete";
}

function isTaskOpen(task) {
  return !isTaskComplete(task);
}

function getTaskStatusTone(status) {
  const current = getTaskStatus(status);
  if (current === "Complete") return "success";
  if (current === "In Progress") return "warning";
  return "neutral";
}

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [person, setPerson] = useSavedState("caseys_person_v4", "Jamison");
  const [currentManagerId, setCurrentManagerId] = useSavedState("caseys_current_manager_v5", "");
  const [shiftType, setShiftType] = useSavedState("caseys_shift_type_v4", "Open");
  const [staffingMode, setStaffingMode] = useSavedState("caseys_staffing_mode_v4", "normal");
  const [topThree, setTopThree] = useSavedState("caseys_top_three_v4", [
    "Complete Daily Store Walk",
    "Review Date Watch",
    "Pick one visible win",
  ]);
  const [visibleWin, setVisibleWin] = useSavedState("caseys_visible_win_v4", "Face and fill one high-traffic area");
  const [dateWatch, setDateWatch] = useSavedState("caseys_date_watch_v4", DEFAULT_DATE_WATCH);
  const [tasks, setTasks] = useSavedState("caseys_tasks_v4", DEFAULT_TASKS);
  const [walkState, setWalkState] = useSavedState("caseys_walk_state_v4", makeWalkState());
  const [truckState, setTruckState] = useSavedState("caseys_truck_state_v4", makeTruckState());
  const [truckNotes, setTruckNotes] = useSavedState("caseys_truck_notes_v4", makeTruckNotes());
  const [teamNotes, setTeamNotes] = useSavedState("caseys_team_notes_v4", []);
  const [handoffHistory, setHandoffHistory] = useSavedState("caseys_handoff_history_v4", []);

  const currentManager = MANAGERS.find((manager) => manager.id === currentManagerId) || null;

  useEffect(() => {
    if (currentManager && person !== currentManager.displayName) {
      setPerson(currentManager.displayName);
    }
  }, [currentManagerId]);

  function signOut() {
    setCurrentManagerId("");
    setScreen("dashboard");
  }

  const dateWatchWithStatus = useMemo(
    () => dateWatch.map((item) => ({ ...item, dateStatus: getDateStatus(item) })),
    [dateWatch]
  );

  const stats = useMemo(() => {
    const walkDone = WALK_ITEMS.filter((item) => walkState[item.id]?.checked).length;
    const walkUrgent = WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Urgent").length;
    const walkAttention = WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Needs Attention").length;
    const tasksDone = tasks.filter(isTaskComplete).length;
    const tasksOpen = tasks.filter(isTaskOpen).length;
    const mustDoOpen = tasks.filter((task) => isTaskOpen(task) && task.priority === "Must Do").length;
    const dateRisks = dateWatchWithStatus.filter((item) => {
      return !item.resolved && ["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus);
    }).length;
    const pullNow = dateWatchWithStatus.filter((item) => item.dateStatus === "Pull Now").length;
    const pullToday = dateWatchWithStatus.filter((item) => item.dateStatus === "Pull Today").length;
    const truckTotal = TRUCK_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);
    const truckDone = Object.values(truckState).filter(Boolean).length;
    const areaHealth = buildAreaHealth(walkState);

    const pressure =
      walkUrgent * 18 +
      walkAttention * 8 +
      pullNow * 18 +
      pullToday * 10 +
      mustDoOpen * 8 +
      Math.max(0, tasksOpen - 4) * 5 +
      (staffingMode === "short" ? 8 : 0) +
      (staffingMode === "very-short" ? 18 : 0) +
      (staffingMode === "truck" || new Date().getDay() === 3 ? 10 : 0);

    return {
      walkDone,
      walkUrgent,
      walkAttention,
      tasksDone,
      tasksOpen,
      mustDoOpen,
      dateRisks,
      pullNow,
      pullToday,
      truckTotal,
      truckDone,
      areaHealth,
      pulse: Math.max(0, Math.min(100, 100 - pressure)),
    };
  }, [walkState, tasks, dateWatchWithStatus, truckState, staffingMode]);

  const actionQueue = useMemo(
    () =>
      buildActionQueue({
        stats,
        dateWatch: dateWatchWithStatus,
        tasks,
        walkState,
        staffingMode,
        shiftType,
      }),
    [stats, dateWatchWithStatus, tasks, walkState, staffingMode, shiftType]
  );

  if (!currentManager) {
    return <ManagerSignIn onSignIn={setCurrentManagerId} />;
  }

  const context = {
    screen,
    setScreen,
    person,
    setPerson,
    currentManager,
    signOut,
    shiftType,
    setShiftType,
    staffingMode,
    setStaffingMode,
    topThree,
    setTopThree,
    visibleWin,
    setVisibleWin,
    dateWatch: dateWatchWithStatus,
    rawDateWatch: dateWatch,
    setDateWatch,
    tasks,
    setTasks,
    walkState,
    setWalkState,
    truckState,
    setTruckState,
    truckNotes,
    setTruckNotes,
    teamNotes,
    setTeamNotes,
    handoffHistory,
    setHandoffHistory,
    stats,
    actionQueue,
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
        {screen === "strategy" && <ShiftStrategy {...context} />}
        {screen === "more" && <More {...context} />}
      </main>
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}

function Dashboard({
  setScreen,
  person,
  setPerson,
  currentManager,
  signOut,
  shiftType,
  setShiftType,
  staffingMode,
  setStaffingMode,
  topThree,
  setTopThree,
  visibleWin,
  setVisibleWin,
  stats,
  actionQueue,
}) {
  const walkPercent = Math.round((stats.walkDone / WALK_ITEMS.length) * 100);
  const truckPercent = Math.round((stats.truckDone / stats.truckTotal) * 100);
  const staffing = STAFFING_MODES.find((mode) => mode.id === staffingMode) || STAFFING_MODES[0];

  return (
    <section className="screen">
      <header className="hero-card command-hero">
        <div>
          <p className="eyebrow">Store Command Center</p>
          <h1>{getGreeting()}, {currentManager.displayName}</h1>
          <p className="muted">
            {currentManager.role} · {shiftType} · {staffing.label} · {formatDateTime()}
          </p>
        </div>
        <div className={`pulse-orb ${getPulseTone(stats.pulse)}`}>
          <strong>{stats.pulse}</strong>
          <span>Pulse</span>
        </div>
      </header>

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Command Mode</p>
            <h2>Set the shift pressure</h2>
          </div>
          <div className="header-actions">
            <button className="ghost-btn" onClick={() => setScreen("strategy")}>Strategy</button>
            <button className="danger-btn" onClick={signOut}>Sign Out</button>
          </div>
        </div>

        <div className="grid-3 top-space">
          <div className="manager-mini-card">
            <span>Signed in</span>
            <strong>{currentManager.displayName}</strong>
            <em>{currentManager.role}</em>
          </div>

          <select className="input" value={shiftType} onChange={(event) => setShiftType(event.target.value)}>
            {SHIFT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select className="input" value={staffingMode} onChange={(event) => setStaffingMode(event.target.value)}>
            {STAFFING_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>{mode.label}</option>
            ))}
          </select>
        </div>

        <p className="muted small top-space">{staffing.description}</p>
      </article>

      <div className="metric-grid">
        <MetricCard label="Walk" value={`${walkPercent}%`} detail={`${stats.walkDone}/${WALK_ITEMS.length}`} tone="success" />
        <MetricCard label="Date Risks" value={stats.dateRisks} detail={`${stats.pullNow} pull now`} tone="warning" />
        <MetricCard label="Must Do" value={stats.mustDoOpen} detail={`${stats.tasksOpen} open tasks`} tone="danger" />
        <MetricCard label="Truck" value={`${truckPercent}%`} detail={`${stats.truckDone}/${stats.truckTotal}`} tone="neutral" />
      </div>

      <article className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Action Queue</p>
            <h2>What needs attention next</h2>
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
              <span className="queue-arrow">›</span>
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
          {topThree.map((priority, index) => (
            <input
              key={index}
              className="input"
              value={priority}
              onChange={(event) => {
                const next = [...topThree];
                next[index] = event.target.value;
                setTopThree(next);
              }}
            />
          ))}
        </div>
      </article>

      <article className="card accent-card">
        <p className="eyebrow">Visible Win</p>
        <h2>One thing that makes the store look better</h2>
        <textarea
          className="textarea"
          value={visibleWin}
          onChange={(event) => setVisibleWin(event.target.value)}
        />
      </article>

      <article className="card">
        <p className="eyebrow">Quick Jump</p>
        <div className="quick-grid">
          <button onClick={() => setScreen("walk")}>Walk</button>
          <button onClick={() => setScreen("dates")}>Date Watch</button>
          <button onClick={() => setScreen("truck")}>Truck</button>
          <button onClick={() => setScreen("handoff")}>Handoff</button>
        </div>
      </article>
    </section>
  );
}

function DailyWalk({ walkState, setWalkState, stats }) {
  const [filter, setFilter] = useState("All");
  const areas = ["All", ...Array.from(new Set(WALK_ITEMS.map((item) => item.area)))];
  const items = filter === "All" ? WALK_ITEMS : WALK_ITEMS.filter((item) => item.area === filter);
  const progress = Math.round((stats.walkDone / WALK_ITEMS.length) * 100);

  function updateWalk(itemId, field, value) {
    setWalkState({
      ...walkState,
      [itemId]: {
        ...(walkState[itemId] || {}),
        [field]: value,
      },
    });
  }

  return (
    <section className="screen">
      <PageHeader
        label="Start of Shift"
        title="Daily Store Walk"
        subtitle={`${stats.walkDone} / ${WALK_ITEMS.length} complete · ${stats.walkAttention} attention · ${stats.walkUrgent} urgent`}
      />

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
          <button key={area} className={`filter-chip ${filter === area ? "active" : ""}`} onClick={() => setFilter(area)}>
            {area}
          </button>
        ))}
      </div>

      <div className="stack">
        {items.map((item, index) => {
          const state = walkState[item.id] || {};
          return (
            <article key={item.id} className={`card walk-card ${state.status === "Urgent" ? "urgent-card" : ""}`}>
              <div className="walk-top">
                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={!!state.checked}
                    onChange={(event) => updateWalk(item.id, "checked", event.target.checked)}
                  />
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
                  <select
                    className="input"
                    value={state.status || "Good"}
                    onChange={(event) => updateWalk(item.id, "status", event.target.value)}
                  >
                    <option>Good</option>
                    <option>Needs Attention</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <label className="handoff-toggle inline-toggle">
                  <input
                    type="checkbox"
                    checked={!!state.addToHandoff}
                    onChange={(event) => updateWalk(item.id, "addToHandoff", event.target.checked)}
                  />
                  Handoff
                </label>
              </div>

              <label className="field-label">Notes</label>
              <textarea
                className="textarea"
                placeholder="Add notes only if something matters..."
                value={state.note || ""}
                onChange={(event) => updateWalk(item.id, "note", event.target.value)}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DateWatch({ dateWatch, rawDateWatch, setDateWatch, setScreen }) {
  const blank = {
    name: "",
    quantity: "",
    area: "",
    issueType: "None",
    expirationDate: "",
    notes: "",
    resolved: false,
  };

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
      setDateWatch(
        rawDateWatch.map((item) =>
          item.id === editingId
            ? { ...item, ...form, quantity: Number(form.quantity || 0) }
            : item
        )
      );
    } else {
      setDateWatch([
        {
          id: createId(),
          ...form,
          quantity: Number(form.quantity || 0),
        },
        ...rawDateWatch,
      ]);
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
      <PageHeader
        label="Manager Watchlist"
        title="Date Watch"
        subtitle="Track items you notice by chance during the week. Not every item in the store, because you are not a barcode-powered octopus."
      />

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
        {WATCH_STATUSES.map((chip) => (
          <button key={chip} className={`filter-chip ${filter === chip ? "active" : ""}`} onClick={() => setFilter(chip)}>
            {chip}
          </button>
        ))}
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

function Tasks({ tasks, setTasks }) {
  const blank = {
    title: "",
    description: "",
    priority: "Must Do",
    timing: "Today",
    assignee: "Me",
    status: "To Do",
    source: "Manual",
  };

  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Open");

  const taskStats = {
    todo: tasks.filter((task) => getTaskStatus(task.status) === "To Do").length,
    progress: tasks.filter((task) => getTaskStatus(task.status) === "In Progress").length,
    complete: tasks.filter(isTaskComplete).length,
    open: tasks.filter(isTaskOpen).length,
    must: tasks.filter((task) => task.priority === "Must Do" && isTaskOpen(task)).length,
  };

  const filtered = tasks.filter((task) => {
    const status = getTaskStatus(task.status);
    if (filter === "All") return true;
    if (filter === "Complete") return status === "Complete";
    if (filter === "In Progress") return status === "In Progress";
    if (filter === "Must Do") return task.priority === "Must Do" && status !== "Complete";
    return status !== "Complete";
  });

  function openAdd() {
    setEditingId(null);
    setForm(blank);
    setFormOpen(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setForm({ ...task, status: getTaskStatus(task.status) });
    setFormOpen(true);
  }

  function saveTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const cleanedTask = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      status: getTaskStatus(form.status),
    };

    if (editingId) {
      setTasks(tasks.map((task) => (task.id === editingId ? { ...task, ...cleanedTask } : task)));
    } else {
      setTasks([{ id: createId(), ...cleanedTask }, ...tasks]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function updateTask(taskId, field, value) {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)));
  }

  function setTaskStatus(taskId, status) {
    updateTask(taskId, "status", status);
  }

  function deleteTask(taskId) {
    setTasks(tasks.filter((task) => task.id !== taskId));
  }

  return (
    <section className="screen task-screen">
      <PageHeader
        label="Task Board"
        title="Tasks"
        subtitle="Add work manually, track what is started, and finish the day with receipts. Because vibes are not documentation."
      />

      <article className="card task-command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Task Control</p>
            <h2>{taskStats.open} open · {taskStats.must} must-do</h2>
            <p className="muted small">Use To Do, In Progress, and Complete so handoff knows what actually happened.</p>
          </div>
          <button className="primary-btn" onClick={openAdd}>Add Task</button>
        </div>

        <div className="task-summary-grid">
          <div className="task-summary-tile todo">
            <strong>{taskStats.todo}</strong>
            <span>To Do</span>
          </div>
          <div className="task-summary-tile progress">
            <strong>{taskStats.progress}</strong>
            <span>In Progress</span>
          </div>
          <div className="task-summary-tile complete">
            <strong>{taskStats.complete}</strong>
            <span>Complete</span>
          </div>
        </div>
      </article>

      <div className="filter-row">
        {TASK_FILTERS.map((chip) => (
          <button key={chip} className={`filter-chip ${filter === chip ? "active" : ""}`} onClick={() => setFilter(chip)}>
            {chip}
          </button>
        ))}
      </div>

      {formOpen && (
        <form className="card form-card task-form-card" onSubmit={saveTask}>
          <p className="eyebrow">{editingId ? "Edit Task" : "New Manual Task"}</p>
          <input className="input" placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea className="textarea" placeholder="Notes, details, or what complete actually means..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />

          <div className="grid-2">
            <select className="input" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option>Must Do</option>
              <option>Should Do</option>
              <option>Can Wait</option>
            </select>
            <select className="input" value={form.timing} onChange={(event) => setForm({ ...form, timing: event.target.value })}>
              <option>Before 10 AM</option>
              <option>Today</option>
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
            <select className="input" value={getTaskStatus(form.status)} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {TASK_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="status-helper-row">
            {TASK_STATUSES.map((status) => (
              <button
                key={status.id}
                type="button"
                className={`status-pill ${getTaskStatus(form.status) === status.id ? "active" : ""} ${getTaskStatusTone(status.id)}`}
                onClick={() => setForm({ ...form, status: status.id })}
              >
                <strong>{status.label}</strong>
                <span>{status.helper}</span>
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
        {filtered.length === 0 && <EmptyState title="No tasks here" text="Either you are caught up or the universe is lying again." />}

        {filtered.map((task) => {
          const status = getTaskStatus(task.status);
          const complete = status === "Complete";
          return (
            <article key={task.id} className={`card task-card task-status-${status.toLowerCase().replaceAll(" ", "-")} ${task.priority === "Must Do" && !complete ? "must-card" : ""}`}>
              <div className="task-card-top">
                <div className={`task-status-dot ${getTaskStatusTone(status)}`} />
                <div className="task-main-text">
                  <div className="task-title-row">
                    <h2 className={complete ? "done-text" : ""}>{task.title}</h2>
                    <span className={`badge ${getTaskStatusTone(status)}`}>{status}</span>
                  </div>
                  <p className="muted">{task.description || "No details added."}</p>
                </div>
              </div>

              <div className="task-meta">
                <span>{task.priority}</span>
                <span>{task.timing}</span>
                <span>{task.assignee}</span>
                <span>{task.source || "Manual"}</span>
              </div>

              <div className="task-status-control" aria-label="Task status">
                {TASK_STATUSES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={status === option.id ? "active" : ""}
                    onClick={() => setTaskStatus(task.id, option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="action-row compact-actions">
                <button className="ghost-btn" onClick={() => openEdit(task)}>Edit</button>
                <button className="danger-btn" onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TruckDay({ truckState, setTruckState, truckNotes, setTruckNotes, stats, setScreen }) {
  const progress = Math.round((stats.truckDone / stats.truckTotal) * 100);

  function toggleTruckItem(key) {
    setTruckState({ ...truckState, [key]: !truckState[key] });
  }

  function updateTruckNote(sectionId, field, value) {
    setTruckNotes({
      ...truckNotes,
      [sectionId]: {
        ...(truckNotes[sectionId] || { note: "", addToHandoff: false }),
        [field]: value,
      },
    });
  }

  return (
    <section className="screen">
      <PageHeader label="Truck Day Commander" title="Truck Day" subtitle={`${stats.truckDone} / ${stats.truckTotal} checklist items complete`} />

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
          const noteState = truckNotes[section.id] || { note: "", addToHandoff: false };
          const completed = section.items.filter((_, index) => truckState[`${section.id}-${index}`]).length;

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
                      <input type="checkbox" checked={!!truckState[key]} onChange={() => toggleTruckItem(key)} />
                      <span className={truckState[key] ? "done-text" : ""}>{item}</span>
                    </label>
                  );
                })}
              </div>

              <label className="field-label">Section Notes</label>
              <textarea
                className="textarea"
                value={noteState.note}
                placeholder="Shorts, damages, unfinished water, cooler chaos..."
                onChange={(event) => updateTruckNote(section.id, "note", event.target.value)}
              />

              <label className="handoff-toggle">
                <input
                  type="checkbox"
                  checked={!!noteState.addToHandoff}
                  onChange={(event) => updateTruckNote(section.id, "addToHandoff", event.target.checked)}
                />
                Add section note to handoff
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TeamNotes({ teamNotes, setTeamNotes }) {
  const blank = {
    employee: "",
    type: "Follow-up",
    note: "",
    date: todayISO(),
    addToHandoff: true,
  };

  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
      setTeamNotes(teamNotes.map((note) => (note.id === editingId ? { ...note, ...form } : note)));
    } else {
      setTeamNotes([{ id: createId(), ...form }, ...teamNotes]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function toggleHandoff(noteId) {
    setTeamNotes(teamNotes.map((note) => (note.id === noteId ? { ...note, addToHandoff: !note.addToHandoff } : note)));
  }

  function deleteNote(noteId) {
    setTeamNotes(teamNotes.filter((note) => note.id !== noteId));
  }

  return (
    <section className="screen">
      <PageHeader label="People Stuff" title="Team Notes" subtitle="Coaching, wins, schedule notes, and follow-ups that should not live only in your tired brain." />

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
        {teamNotes.length === 0 && <EmptyState title="No team notes" text="The quiet before someone asks about a schedule from two weeks from now." />}

        {teamNotes.map((note) => (
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
              <button className="ghost-btn" onClick={() => toggleHandoff(note.id)}>
                {note.addToHandoff ? "Remove from Handoff" : "Add to Handoff"}
              </button>
              <button className="ghost-btn" onClick={() => openEdit(note)}>Edit</button>
              <button className="danger-btn" onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Handoff({
  person,
  setPerson,
  currentManager,
  shiftType,
  setShiftType,
  staffingMode,
  setStaffingMode,
  stats,
  tasks,
  dateWatch,
  walkState,
  truckNotes,
  teamNotes,
  handoffHistory,
  setHandoffHistory,
  visibleWin,
}) {
  const generatedAt = new Date();
  const staffing = STAFFING_MODES.find((mode) => mode.id === staffingMode) || STAFFING_MODES[0];

  const completed = tasks.filter(isTaskComplete);
  const open = tasks.filter(isTaskOpen);

  const dateRisks = dateWatch.filter((item) => {
    return !item.resolved && (["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus) || item.issueType !== "None");
  });

  const walkNotes = WALK_ITEMS.filter((item) => {
    const state = walkState[item.id];
    return state && (state.addToHandoff || state.note?.trim() || state.status === "Needs Attention" || state.status === "Urgent");
  }).map((item) => ({ ...item, ...(walkState[item.id] || {}) }));

  const teamForHandoff = teamNotes.filter((note) => note.addToHandoff);

  const truckForHandoff = TRUCK_SECTIONS.filter((section) => {
    const note = truckNotes[section.id];
    return note?.addToHandoff || note?.note;
  }).map((section) => {
    const note = truckNotes[section.id];
    return `${section.title}: ${note?.note || "Marked for follow-up"}`;
  });

  const handoffText = buildHandoffText({
    person: `${currentManager.displayName} (${currentManager.role})`,
    shiftType,
    staffing,
    generatedAt,
    completed,
    open,
    dateRisks,
    walkNotes,
    teamForHandoff,
    truckForHandoff,
    stats,
    visibleWin,
  });

  async function copyHandoff() {
    try {
      await navigator.clipboard.writeText(handoffText);
      alert("Handoff copied. Small miracle achieved.");
    } catch {
      alert("Copy failed. Select the preview text and copy it manually, because technology enjoys drama.");
    }
  }

  function saveHandoff() {
    const entry = {
      id: createId(),
      createdAt: generatedAt.toISOString(),
      person,
      shiftType,
      staffingMode: staffing.label,
      completedCount: completed.length,
      openCount: open.length,
      dateRiskCount: dateRisks.length,
      walkNoteCount: walkNotes.length,
      pulse: stats.pulse,
      text: handoffText,
    };

    setHandoffHistory([entry, ...handoffHistory].slice(0, 30));
    alert("Handoff saved to history.");
  }

  function deleteHistory(entryId) {
    setHandoffHistory(handoffHistory.filter((entry) => entry.id !== entryId));
  }

  return (
    <section className="screen">
      <PageHeader
        label="End of Shift"
        title="Handoff Builder"
        subtitle="Auto-built from completed tasks, open tasks, walk notes, Date Watch, truck notes, team notes, and shift pressure."
      />

      <article className="card command-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Handoff Setup</p>
            <h2>{currentManager.displayName} · {currentManager.role}</h2>
          </div>
          <button className="primary-btn" onClick={copyHandoff}>Copy</button>
        </div>

        <div className="grid-3 top-space">
          <div className="manager-mini-card compact">
            <span>Signed in</span>
            <strong>{currentManager.displayName}</strong>
            <em>{currentManager.role}</em>
          </div>
          <select className="input" value={shiftType} onChange={(event) => setShiftType(event.target.value)}>
            {SHIFT_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
          <select className="input" value={staffingMode} onChange={(event) => setStaffingMode(event.target.value)}>
            {STAFFING_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
          </select>
        </div>

        <div className="handoff-stats">
          <span>Pulse <b>{stats.pulse}</b></span>
          <span>Complete <b>{completed.length}</b></span>
          <span>Open <b>{open.length}</b></span>
          <span>Risks <b>{dateRisks.length}</b></span>
        </div>

        <button className="ghost-btn full top-space" onClick={saveHandoff}>Save to Handoff History</button>
      </article>

      <HandoffSection title="Completed" items={completed.map((task) => task.title)} />
      <HandoffSection title="Still Needs Done" items={open.map((task) => `${task.title} (${task.priority}, ${task.assignee})`)} />
      <HandoffSection
        title="Date Watch"
        items={dateRisks.map((item) => `${item.name}: ${item.dateStatus}${item.expirationDate ? `, date ${item.expirationDate}` : ""}${item.issueType !== "None" ? `, ${item.issueType}` : ""}${item.notes ? `, note: ${item.notes}` : ""}`)}
      />
      <HandoffSection title="Daily Store Walk Notes" items={walkNotes.map((item) => `${item.area} / ${item.title}: ${item.status} - ${item.note || item.prompt}`)} />
      <HandoffSection title="Team Notes" items={teamForHandoff.map((note) => `${note.employee || "General"}: ${note.type} - ${note.note}`)} />
      <HandoffSection title="Truck Day Notes" items={[`Truck progress: ${stats.truckDone} / ${stats.truckTotal} complete`, ...truckForHandoff]} />
      <HandoffSection title="Visible Win" items={[visibleWin]} />

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
              <span>Complete <b>{entry.completedCount}</b></span>
              <span>Open <b>{entry.openCount}</b></span>
              <span>Risks <b>{entry.dateRiskCount}</b></span>
              <span>Walk Notes <b>{entry.walkNoteCount}</b></span>
            </div>

            <details>
              <summary>Show saved text</summary>
              <pre className="handoff-preview">{entry.text}</pre>
            </details>

            <button className="danger-btn full" onClick={() => deleteHistory(entry.id)}>Delete Saved Handoff</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ShiftStrategy({ staffingMode, setStaffingMode, stats, actionQueue }) {
  const mode = STAFFING_MODES.find((item) => item.id === staffingMode) || STAFFING_MODES[0];
  const strategy = getStrategyForMode(staffingMode);

  return (
    <section className="screen">
      <PageHeader label="Manager Brain" title="Shift Strategy" subtitle="A simple playbook for deciding what matters when everything is yelling." />

      <article className="card command-card">
        <p className="eyebrow">Current Mode</p>
        <h2>{mode.label}</h2>
        <p className="muted">{mode.description}</p>
        <select className="input top-space" value={staffingMode} onChange={(event) => setStaffingMode(event.target.value)}>
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
        <ul className="simple-list">
          {strategy.map((item) => <li key={item}>{item}</li>)}
        </ul>
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

function More({ setScreen }) {
  const tools = [
    { title: "Truck Day", text: "Receiving, cooler, water, recovery, and truck notes.", screen: "truck" },
    { title: "Team Notes", text: "Coaching, follow-ups, wins, and schedule notes.", screen: "team" },
    { title: "Handoff Builder", text: "Auto-generate and save shift handoffs.", screen: "handoff" },
    { title: "Shift Strategy", text: "Mode-based guidance for normal days, truck days, and short staffing.", screen: "strategy" },
  ];

  return (
    <section className="screen">
      <PageHeader label="More Tools" title="Store Support" subtitle="Useful extras without turning the bottom nav into a button salad." />

      <div className="stack">
        {tools.map((tool) => (
          <article key={tool.title} className="card">
            <div className="card-row">
              <div>
                <h2>{tool.title}</h2>
                <p className="muted">{tool.text}</p>
              </div>
              <button className="ghost-btn" onClick={() => setScreen(tool.screen)}>Open</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
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

function buildActionQueue({ stats, dateWatch, tasks, walkState, staffingMode, shiftType }) {
  const queue = [];
  const hour = new Date().getHours();
  const isWednesday = new Date().getDay() === 3 || shiftType === "Truck Day" || staffingMode === "truck";

  dateWatch
    .filter((item) => item.dateStatus === "Pull Now")
    .forEach((item) => queue.push({
      id: `pull-now-${item.id}`,
      priority: "Critical",
      title: `Pull expired item: ${item.name}`,
      detail: item.notes || "Expired Date Watch item needs removed.",
      screen: "dates",
      tone: "danger",
    }));

  dateWatch
    .filter((item) => item.dateStatus === "Pull Today")
    .forEach((item) => queue.push({
      id: `pull-today-${item.id}`,
      priority: "Today",
      title: `Check pull item: ${item.name}`,
      detail: item.expirationDate ? `Date: ${item.expirationDate}` : "Needs checked today.",
      screen: "dates",
      tone: "warning",
    }));

  dateWatch
    .filter((item) => item.dateStatus === "BOGO Soon")
    .slice(0, 3)
    .forEach((item) => queue.push({
      id: `bogo-${item.id}`,
      priority: "Soon",
      title: `Plan BOGO / markdown: ${item.name}`,
      detail: item.notes || "Near-date item on watch.",
      screen: "dates",
      tone: "warning",
    }));

  WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Urgent").forEach((item) => queue.push({
    id: `urgent-walk-${item.id}`,
    priority: "Urgent",
    title: `Walk issue: ${item.title}`,
    detail: walkState[item.id]?.note || item.prompt,
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

  tasks
    .filter((task) => task.priority === "Must Do" && isTaskOpen(task))
    .slice(0, 4)
    .forEach((task) => queue.push({
      id: `task-${task.id}`,
      priority: "Must Do",
      title: task.title,
      detail: task.description || `${task.assignee} · ${task.timing}`,
      screen: "tasks",
      tone: "warning",
    }));

  if (isWednesday) {
    queue.push({
      id: "truck-day",
      priority: "Truck",
      title: "Truck Day mode active",
      detail: "Prioritize cooler, freezer, water, center store outs, and recovery.",
      screen: "truck",
      tone: "neutral",
    });
  }

  if (staffingMode === "very-short") {
    queue.push({
      id: "very-short",
      priority: "Survival",
      title: "Very short staffed",
      detail: "Protect guests, money, food safety, bathrooms, and urgent pulls. The rest can wait in line.",
      screen: "strategy",
      tone: "danger",
    });
  } else if (staffingMode === "short") {
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

  const priorityOrder = { Critical: 0, Urgent: 1, Today: 2, "Before 10": 3, "Must Do": 4, Truck: 5, Survival: 6, Staffing: 7, Soon: 8, Steady: 9 };
  return queue.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));
}

function buildHandoffText({ person, shiftType, staffing, generatedAt, completed, open, dateRisks, walkNotes, teamForHandoff, truckForHandoff, stats, visibleWin }) {
  const lines = [];

  lines.push("SHIFT HANDOFF");
  lines.push(`Created: ${formatDateTime(generatedAt)}`);
  lines.push(`By: ${person}`);
  lines.push(`Shift: ${shiftType}`);
  lines.push(`Staffing Mode: ${staffing.label}`);
  lines.push(`Shift Pulse: ${stats.pulse}/100`);
  lines.push("");

  lines.push("Completed:", ...listOrNone(completed.map((task) => `- ${task.title}`)), "");
  lines.push("Still Needs Done:", ...listOrNone(open.map((task) => `- ${task.title} (${task.priority}, ${task.assignee})`)), "");
  lines.push("Date Watch:", ...listOrNone(dateRisks.map((item) => `- ${item.name}: ${item.dateStatus}${item.expirationDate ? `, date ${item.expirationDate}` : ""}${item.issueType !== "None" ? `, ${item.issueType}` : ""}${item.notes ? `, note: ${item.notes}` : ""}`)), "");
  lines.push("Daily Store Walk Notes:", ...listOrNone(walkNotes.map((item) => `- ${item.area} / ${item.title}: ${item.status} - ${item.note || item.prompt}`)), "");
  lines.push("Team Notes:", ...listOrNone(teamForHandoff.map((note) => `- ${note.employee || "General"}: ${note.type} - ${note.note}`)), "");
  lines.push("Truck Day Notes:", `- Truck progress: ${stats.truckDone} / ${stats.truckTotal} complete`, ...listOrNone(truckForHandoff.map((note) => `- ${note}`)), "");
  lines.push("Visible Win:", ...listOrNone(visibleWin ? [`- ${visibleWin}`] : []));

  return lines.join("\n");
}

function getStrategyForMode(mode) {
  const strategies = {
    normal: [
      "Finish Daily Walk early.",
      "Handle Date Watch risks before they become shrink or food safety issues.",
      "Knock out Must Do tasks, then pick one visible win.",
      "Save a handoff before leaving so tomorrow does not start with detective work.",
    ],
    short: [
      "Protect guest-facing basics first: registers, bathrooms, coffee, fountain, and visible trash.",
      "Only chase the top 3 priorities. Everything else can stop pretending it is equally important.",
      "Use handoff notes aggressively so the next shift knows what got sacrificed.",
      "Do one visible recovery pass before leaving.",
    ],
    "very-short": [
      "Survival order: safety, guests, money, food safety, bathrooms, urgent pulls.",
      "Do not try to win the whole store. That is how humans become haunted.",
      "Mark unfinished work clearly in handoff.",
      "Skip noncritical perfection tasks unless the building is magically staffed by elves.",
    ],
    training: [
      "Give the trainee one clear area at a time.",
      "Check back in after 15-20 minutes instead of assuming silence means success.",
      "Document coaching notes while they are fresh.",
      "End with one specific win and one follow-up item.",
    ],
    truck: [
      "Cooler/freezer first. Temperature-sensitive freight does not care about vibes.",
      "Water, outs, displays, and high-traffic aisles next.",
      "Keep cardboard under control before the backroom becomes a wildlife habitat.",
      "Save truck notes in handoff: unfinished water, shorts, damages, cooler status.",
    ],
  };

  return strategies[mode] || strategies.normal;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
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


function ManagerSignIn({ onSignIn }) {
  const [selectedManagerId, setSelectedManagerId] = useState("jamison");
  const selectedManager = MANAGERS.find((manager) => manager.id === selectedManagerId) || MANAGERS[0];

  return (
    <div className="login-shell">
      <section className="login-card">
        <div className="login-hero">
          <p className="eyebrow">Store Command Center</p>
          <h1>Manager Sign In</h1>
          <p className="muted">
            Pick your manager profile so tasks, handoffs, and shift notes show the right person instead of the app pretending everyone is the same beige clipboard.
          </p>
        </div>

        <div className="manager-login-grid">
          {MANAGERS.map((manager) => (
            <button
              key={manager.id}
              className={`manager-login-card ${selectedManagerId === manager.id ? "active" : ""}`}
              onClick={() => setSelectedManagerId(manager.id)}
              type="button"
            >
              <span className="manager-avatar">{manager.initials}</span>
              <strong>{manager.displayName}</strong>
              <em>{manager.role}</em>
              <p>{manager.focus}</p>
            </button>
          ))}
        </div>

        <article className="selected-manager-card">
          <div>
            <p className="eyebrow">Signing in as</p>
            <h2>{selectedManager.displayName}</h2>
            <p className="muted">{selectedManager.title}</p>
          </div>
          <button className="primary-btn" onClick={() => onSignIn(selectedManager.id)} type="button">
            Enter App
          </button>
        </article>

        <p className="login-note">
          This is a local profile sign-in, not bank-vault security. It personalizes the app and handoffs on this device. Real passwords would need a backend later.
        </p>
      </section>
    </div>
  );
}

function BottomNav({ screen, setScreen }) {
  const nav = [
    ["dashboard", "Home"],
    ["walk", "Walk"],
    ["dates", "Dates"],
    ["tasks", "Tasks"],
    ["more", "More"],
  ];

  return (
    <nav className="bottom-nav">
      {nav.map(([id, label]) => (
        <button key={id} className={screen === id ? "active" : ""} onClick={() => setScreen(id)}>
          {label}
        </button>
      ))}
    </nav>
  );
}

function PageHeader({ label, title, subtitle }) {
  return (
    <header className="page-header">
      <p className="eyebrow">{label}</p>
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
        {listOrNone(items).map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function listOrNone(items) {
  return items && items.length ? items : ["- None"];
}
