import React, { useEffect, useMemo, useState } from "react";

const PEOPLE = ["Jamo", "Loretta", "Jamie", "Steve", "Kathy", "Shelby", "Other"];
const SHIFTS = ["Open", "Mid", "Close", "Truck Day", "Short Staffed", "Other"];

const WALK_ITEMS = [
  ["Exterior", "Parking lot, landscaping, dumpster area, outside signage, and trash cans look good?"],
  ["Exterior", "Fuel pumps clean, diesel handles clean, receipt paper stocked, washer buckets full?"],
  ["Interior", "Center store and restrooms clean, swept, mopped, and trash under control?"],
  ["Interior", "FFE, Red Bull cooler, tobacco back bar, and sales counter clean and stocked?"],
  ["Interior", "Center store, power wings, and displays replenished and front-faced?"],
  ["Interior", "Cold vaults, beer doors, and beer cave replenished and front-faced?"],
  ["P&DB", "Coffee, fountain, cups, lids, straws, creamers, and counters clean and stocked?"],
  ["P&DB", "Donut case, open-air cooler, and bakery rack clean, stocked, and set correctly?"],
  ["Kitchen", "Kitchen clean, organized, and following food safety guidelines?"],
  ["Team / Guest", "Team in uniform, greeting guests, and using Rewards / suggestive selling?"],
  ["Other", "Anything else need addressed before this place invents a new problem?"],
].map(([category, question], index) => ({
  id: `walk-${index + 1}`,
  category,
  question,
}));

const TRUCK_SECTIONS = [
  {
    id: "before",
    title: "Before Truck Arrives",
    items: [
      "Clear receiving path and backroom space",
      "Have paperwork / invoice ready",
      "Assign cooler, freezer, totes, water, and center store",
      "Check urgent outs before pallets arrive",
    ],
  },
  {
    id: "receiving",
    title: "Receiving",
    items: [
      "Check obvious damages, shorts, or weirdness",
      "Separate cooler and freezer first",
      "Stage totes by area",
      "Keep paperwork somewhere that is not the void",
    ],
  },
  {
    id: "cooler",
    title: "Cooler / Freezer",
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
    items: [
      "Work outs and high-traffic areas first",
      "Stock displays and power wings",
      "Front-face visible aisles",
      "Break down cardboard before it becomes architecture",
    ],
  },
  {
    id: "water",
    title: "Water / Bulk / Displays",
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
    items: [
      "Sweep backroom path",
      "Recover visible aisles",
      "Confirm endcaps look intentional",
      "Pick one visible win before leaving",
    ],
  },
];

function id() {
  return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dateDiff(expirationDate) {
  if (!expirationDate) return null;
  const today = new Date();
  const target = new Date(`${expirationDate}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function getDateStatus(item) {
  if (item.resolved) return "Handled";
  const days = dateDiff(item.expirationDate);
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
      // Keeps the app from crashing if local storage gets weird.
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

const starterDateWatch = [
  {
    id: id(),
    name: "French Vanilla Creamer",
    quantity: 4,
    department: "Dairy",
    issueType: "None",
    expirationDate: addDays(2),
    notes: "Watch for BOGO / pull timing.",
    resolved: false,
  },
  {
    id: id(),
    name: "Half & Half Creamer",
    quantity: 4,
    department: "Dairy",
    issueType: "None",
    expirationDate: todayISO(),
    notes: "Check today.",
    resolved: false,
  },
  {
    id: id(),
    name: "Ribbon Pepperoni",
    quantity: 3,
    department: "Kitchen",
    issueType: "Need to Order",
    expirationDate: "",
    notes: "Low count.",
    resolved: false,
  },
];

const starterTasks = [
  {
    id: id(),
    title: "Complete Daily Store Walk",
    description: "Check store standards before the day gets loud.",
    priority: "Must Do",
    timing: "Before 10 AM",
    assignee: "Me",
    status: "Not Started",
  },
  {
    id: id(),
    title: "Review Date Watch items",
    description: "Only the items you noticed, not the whole store.",
    priority: "Must Do",
    timing: "Before 10 AM",
    assignee: "Me",
    status: "Not Started",
  },
  {
    id: id(),
    title: "Pick one visible win",
    description: "Make one area noticeably better before leaving.",
    priority: "Should Do",
    timing: "Today",
    assignee: "Me",
    status: "Not Started",
  },
];

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [person, setPerson] = useSavedState("scc_person_v1", "Jamo");
  const [shiftType, setShiftType] = useSavedState("scc_shift_v1", "Open");
  const [topThree, setTopThree] = useSavedState("scc_top_three_v3", [
    "Complete Daily Store Walk",
    "Review Date Watch items",
    "Pick one visible win",
  ]);
  const [visibleWin, setVisibleWin] = useSavedState("scc_visible_win_v3", "Face and fill one high-traffic area");
  const [dateWatch, setDateWatch] = useSavedState("scc_date_watch_v3", starterDateWatch);
  const [tasks, setTasks] = useSavedState("scc_tasks_v3", starterTasks);
  const [walkState, setWalkState] = useSavedState("scc_walk_v3", makeWalkState());
  const [truckState, setTruckState] = useSavedState("scc_truck_v3", makeTruckState());
  const [truckNotes, setTruckNotes] = useSavedState("scc_truck_notes_v3", makeTruckNotes());
  const [teamNotes, setTeamNotes] = useSavedState("scc_team_v3", []);
  const [handoffHistory, setHandoffHistory] = useSavedState("scc_handoff_history_v3", []);

  const dateWatchWithStatus = useMemo(
    () => dateWatch.map((item) => ({ ...item, dateStatus: getDateStatus(item) })),
    [dateWatch]
  );

  const completedWalk = WALK_ITEMS.filter((item) => walkState[item.id]?.checked).length;
  const urgentWalk = WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Urgent").length;
  const needsWalk = WALK_ITEMS.filter((item) => walkState[item.id]?.status === "Needs Attention").length;
  const completedTasks = tasks.filter((task) => task.status === "Done").length;
  const openTasks = tasks.filter((task) => task.status !== "Done").length;
  const dateRiskCount = dateWatchWithStatus.filter((item) =>
    !item.resolved && ["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus)
  ).length;
  const truckTotal = TRUCK_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);
  const truckDone = Object.values(truckState).filter(Boolean).length;

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "dashboard" && (
          <Dashboard
            setScreen={setScreen}
            person={person}
            setPerson={setPerson}
            shiftType={shiftType}
            setShiftType={setShiftType}
            topThree={topThree}
            setTopThree={setTopThree}
            visibleWin={visibleWin}
            setVisibleWin={setVisibleWin}
            completedWalk={completedWalk}
            needsWalk={needsWalk}
            urgentWalk={urgentWalk}
            completedTasks={completedTasks}
            openTasks={openTasks}
            dateRiskCount={dateRiskCount}
            dateWatch={dateWatchWithStatus}
            tasks={tasks}
            truckDone={truckDone}
            truckTotal={truckTotal}
          />
        )}

        {screen === "walk" && <DailyWalk walkState={walkState} setWalkState={setWalkState} completedWalk={completedWalk} />}
        {screen === "dates" && <DateWatch dateWatch={dateWatchWithStatus} setDateWatch={setDateWatch} />}
        {screen === "tasks" && <Tasks tasks={tasks} setTasks={setTasks} />}
        {screen === "more" && <More setScreen={setScreen} />}
        {screen === "truck" && <TruckDay truckState={truckState} setTruckState={setTruckState} truckNotes={truckNotes} setTruckNotes={setTruckNotes} />}
        {screen === "team" && <TeamNotes teamNotes={teamNotes} setTeamNotes={setTeamNotes} />}
        {screen === "handoff" && (
          <Handoff
            person={person}
            setPerson={setPerson}
            shiftType={shiftType}
            setShiftType={setShiftType}
            tasks={tasks}
            dateWatch={dateWatchWithStatus}
            walkState={walkState}
            truckState={truckState}
            truckNotes={truckNotes}
            teamNotes={teamNotes}
            handoffHistory={handoffHistory}
            setHandoffHistory={setHandoffHistory}
            truckDone={truckDone}
            truckTotal={truckTotal}
            visibleWin={visibleWin}
          />
        )}
      </main>

      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}

function Dashboard({
  setScreen,
  person,
  setPerson,
  shiftType,
  setShiftType,
  topThree,
  setTopThree,
  visibleWin,
  setVisibleWin,
  completedWalk,
  needsWalk,
  urgentWalk,
  completedTasks,
  openTasks,
  dateRiskCount,
  dateWatch,
  tasks,
  truckDone,
  truckTotal,
}) {
  const walkPercent = Math.round((completedWalk / WALK_ITEMS.length) * 100);
  const truckPercent = Math.round((truckDone / truckTotal) * 100);
  const focusItems = getManagerFocus({ completedWalk, needsWalk, urgentWalk, dateWatch, tasks, openTasks });

  return (
    <section className="screen">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Today</p>
          <h1>Store Command Center</h1>
          <p className="muted">A calmer way to run the shift, because chaos already has a full-time schedule.</p>
        </div>
        <div className="sun-badge">☀</div>
      </header>

      <article className="card accent-card">
        <p className="eyebrow">Shift Setup</p>
        <div className="grid-3 top-space">
          <select className="input" value={person} onChange={(e) => setPerson(e.target.value)}>
            {PEOPLE.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select className="input" value={shiftType} onChange={(e) => setShiftType(e.target.value)}>
            {SHIFTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="ghost-btn" onClick={() => setScreen("handoff")}>Handoff</button>
        </div>
      </article>

      <div className="grid-3">
        <MetricCard label="Walk Done" value={`${walkPercent}%`} tone="success" />
        <MetricCard label="Date Risks" value={dateRiskCount} tone="warning" />
        <MetricCard label="Open Tasks" value={openTasks} tone="danger" />
      </div>

      <article className="card">
        <p className="eyebrow">Manager Focus</p>
        <h2>Do these first</h2>
        <ul className="simple-list">
          {focusItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </article>

      <article className="card">
        <div className="card-row">
          <div>
            <p className="eyebrow">Daily Store Walk</p>
            <h2>{completedWalk} / {WALK_ITEMS.length} complete</h2>
            <p className="muted">{needsWalk} need attention · {urgentWalk} urgent</p>
          </div>
          <button className="primary-btn" onClick={() => setScreen("walk")}>Continue</button>
        </div>
        <Progress value={walkPercent} />
      </article>

      <article className="card accent-card">
        <div className="card-row">
          <div>
            <p className="eyebrow">Truck Day</p>
            <h2>{new Date().getDay() === 3 ? "Truck Day is today" : "Truck Day Prep"}</h2>
            <p className="muted">{truckDone} / {truckTotal} truck checklist items complete.</p>
          </div>
          <button className="ghost-btn" onClick={() => setScreen("truck")}>Open</button>
        </div>
        <Progress value={truckPercent} />
      </article>

      <article className="card">
        <p className="eyebrow">Before 10 AM</p>
        <h2>Top 3 Priorities</h2>
        <div className="stack top-space">
          {topThree.map((item, index) => (
            <input
              key={index}
              className="input"
              value={item}
              onChange={(e) => {
                const next = [...topThree];
                next[index] = e.target.value;
                setTopThree(next);
              }}
            />
          ))}
        </div>
      </article>

      <article className="card accent-card">
        <p className="eyebrow">Visible Win</p>
        <h2>One thing that makes the store look better</h2>
        <textarea className="textarea" value={visibleWin} onChange={(e) => setVisibleWin(e.target.value)} />
      </article>

      <article className="card">
        <p className="eyebrow">Quick Actions</p>
        <div className="quick-grid">
          <button onClick={() => setScreen("walk")}>Walk</button>
          <button onClick={() => setScreen("dates")}>Date Watch</button>
          <button onClick={() => setScreen("tasks")}>Tasks</button>
          <button onClick={() => setScreen("handoff")}>Handoff</button>
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Shift Snapshot</p>
        <Snapshot label="Completed tasks" value={completedTasks} />
        <Snapshot label="Open tasks" value={openTasks} />
        <Snapshot label="Date risks" value={dateRiskCount} />
      </article>
    </section>
  );
}

function getManagerFocus({ completedWalk, needsWalk, urgentWalk, dateWatch, tasks, openTasks }) {
  const now = new Date();
  const items = [];
  const pullNow = dateWatch.filter((item) => item.dateStatus === "Pull Now").length;
  const pullToday = dateWatch.filter((item) => item.dateStatus === "Pull Today").length;
  const bogoSoon = dateWatch.filter((item) => item.dateStatus === "BOGO Soon").length;
  const mustDo = tasks.filter((task) => task.priority === "Must Do" && task.status !== "Done").length;

  if (now.getHours() < 10 && completedWalk < WALK_ITEMS.length) items.push("Finish the Daily Store Walk before the day gets noisy.");
  if (urgentWalk) items.push(`Handle ${urgentWalk} urgent walk issue${urgentWalk === 1 ? "" : "s"} first.`);
  if (needsWalk) items.push(`Follow up on ${needsWalk} walk item${needsWalk === 1 ? "" : "s"} needing attention.`);
  if (pullNow) items.push(`Pull ${pullNow} expired Date Watch item${pullNow === 1 ? "" : "s"} now.`);
  if (pullToday) items.push(`Check ${pullToday} item${pullToday === 1 ? "" : "s"} that need pulled today.`);
  if (bogoSoon) items.push(`Plan BOGO / markdown action for ${bogoSoon} near-date item${bogoSoon === 1 ? "" : "s"}.`);
  if (now.getDay() === 3) items.push("Truck Day: cooler, freezer, water, and visible recovery get priority.");
  if (mustDo) items.push(`Close out ${mustDo} must-do task${mustDo === 1 ? "" : "s"}.`);
  if (openTasks > 3) items.push("Too many loose ends. Pick the top 3 and stop letting the list become furniture.");
  if (!items.length) items.push("No major fires showing. Pick one visible win and make the store look intentional.");

  return items.slice(0, 5);
}

function DailyWalk({ walkState, setWalkState, completedWalk }) {
  const progress = Math.round((completedWalk / WALK_ITEMS.length) * 100);

  function updateWalk(id, field, value) {
    setWalkState({ ...walkState, [id]: { ...(walkState[id] || {}), [field]: value } });
  }

  return (
    <section className="screen">
      <PageHeader label="Start of Shift" title="Daily Store Walk" subtitle={`${completedWalk} / ${WALK_ITEMS.length} complete`} />
      <article className="card">
        <p className="eyebrow">Progress</p>
        <h2>{progress}% complete</h2>
        <Progress value={progress} />
      </article>

      <div className="stack">
        {WALK_ITEMS.map((item, index) => {
          const state = walkState[item.id] || {};
          return (
            <article key={item.id} className="card walk-card">
              <div className="walk-top">
                <label className="checkbox-line">
                  <input type="checkbox" checked={!!state.checked} onChange={(e) => updateWalk(item.id, "checked", e.target.checked)} />
                  <span className="walk-number">{index + 1}</span>
                </label>
                <span className="chip">{item.category}</span>
              </div>

              <p className="walk-question">{item.question}</p>

              <label className="field-label">Status</label>
              <select className="input" value={state.status || "Good"} onChange={(e) => updateWalk(item.id, "status", e.target.value)}>
                <option>Good</option>
                <option>Needs Attention</option>
                <option>Urgent</option>
              </select>

              <label className="field-label">Notes</label>
              <textarea className="textarea" value={state.note || ""} placeholder="Add notes if needed..." onChange={(e) => updateWalk(item.id, "note", e.target.value)} />

              <label className="handoff-toggle">
                <input type="checkbox" checked={!!state.addToHandoff} onChange={(e) => updateWalk(item.id, "addToHandoff", e.target.checked)} />
                Add to Shift Handoff
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DateWatch({ dateWatch, setDateWatch }) {
  const blank = { name: "", quantity: "", department: "", issueType: "None", expirationDate: "", notes: "" };
  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Watching", "BOGO Soon", "Pull Today", "Pull Now", "Need to Order", "Handled"];

  const filtered = dateWatch.filter((item) => {
    if (filter === "All") return !item.resolved;
    if (filter === "Handled") return item.resolved;
    if (filter === "Need to Order") return item.issueType === "Need to Order" && !item.resolved;
    return item.dateStatus === filter && !item.resolved;
  });

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
      department: item.department || "",
      issueType: item.issueType || "None",
      expirationDate: item.expirationDate || "",
      notes: item.notes || "",
    });
    setFormOpen(true);
  }

  function saveItem(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setDateWatch(dateWatch.map((item) => item.id === editingId ? { ...item, ...form, quantity: Number(form.quantity || 0) } : item));
    } else {
      setDateWatch([{ id: id(), ...form, quantity: Number(form.quantity || 0), resolved: false }, ...dateWatch]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function toggleHandled(itemId) {
    setDateWatch(dateWatch.map((item) => item.id === itemId ? { ...item, resolved: !item.resolved } : item));
  }

  function deleteItem(itemId) {
    setDateWatch(dateWatch.filter((item) => item.id !== itemId));
  }

  return (
    <section className="screen">
      <PageHeader label="Manager Watchlist" title="Date Watch" subtitle="Track items you notice. Not every item in the store, because you are a manager, not a haunted spreadsheet." />

      <div className="filter-row">
        {filters.map((chip) => (
          <button key={chip} className={`filter-chip ${filter === chip ? "active" : ""}`} onClick={() => setFilter(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <button className="primary-btn full" onClick={openAdd}>Add Date Watch Item</button>

      {formOpen && (
        <form className="card form-card" onSubmit={saveItem}>
          <p className="eyebrow">{editingId ? "Edit Item" : "New Watch Item"}</p>

          <input className="input" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input className="input" placeholder="Department / area" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />

          <select className="input" value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
            <option>None</option>
            <option>Need to Order</option>
            <option>Overstocked</option>
            <option>Missing</option>
            <option>Damaged</option>
            <option>Vendor Issue</option>
          </select>

          <label className="field-label">Expiration Date</label>
          <input className="input" type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />

          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <div className="action-row">
            <button className="primary-btn" type="submit">Save</button>
            <button className="ghost-btn" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stack">
        {filtered.length === 0 && <EmptyState title="Nothing here" text="A suspiciously peaceful moment. Enjoy it before retail notices." />}

        {filtered.map((item) => (
          <article key={item.id} className="card inventory-card">
            <div className="card-header">
              <div>
                <h2>{item.name}</h2>
                <p className="muted">{item.department || "General"} · Qty {item.quantity || 0}</p>
              </div>
              <StatusBadge status={item.dateStatus} />
            </div>

            {item.issueType !== "None" && <span className="badge danger">{item.issueType}</span>}
            {item.expirationDate && <p className="muted small">Date: {item.expirationDate}</p>}
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
  const blank = { title: "", description: "", priority: "Must Do", timing: "Today", assignee: "Me", status: "Not Started" };
  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Open");

  const filtered = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Done") return task.status === "Done";
    return task.status !== "Done";
  });

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

  function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      setTasks(tasks.map((task) => task.id === editingId ? { ...task, ...form } : task));
    } else {
      setTasks([{ id: id(), ...form }, ...tasks]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function updateTask(taskId, field, value) {
    setTasks(tasks.map((task) => task.id === taskId ? { ...task, [field]: value } : task));
  }

  function deleteTask(taskId) {
    setTasks(tasks.filter((task) => task.id !== taskId));
  }

  return (
    <section className="screen">
      <PageHeader label="Task Board" title="Tasks" subtitle="Keep the shift from becoming a scavenger hunt." />

      <div className="filter-row">
        {["Open", "Done", "All"].map((chip) => (
          <button key={chip} className={`filter-chip ${filter === chip ? "active" : ""}`} onClick={() => setFilter(chip)}>{chip}</button>
        ))}
      </div>

      <button className="primary-btn full" onClick={openAdd}>Add Task</button>

      {formOpen && (
        <form className="card form-card" onSubmit={saveTask}>
          <p className="eyebrow">{editingId ? "Edit Task" : "New Task"}</p>

          <input className="input" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option>Must Do</option>
            <option>Should Do</option>
            <option>Can Wait</option>
          </select>

          <select className="input" value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })}>
            <option>Before 10 AM</option>
            <option>Today</option>
            <option>Later</option>
          </select>

          <select className="input" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
            <option>Me</option>
            <option>Shift Lead</option>
            <option>Team Member</option>
            <option>Kitchen</option>
            <option>Center Store</option>
          </select>

          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <div className="action-row">
            <button className="primary-btn" type="submit">Save</button>
            <button className="ghost-btn" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stack">
        {filtered.length === 0 && <EmptyState title="No tasks here" text="Either you are caught up or the universe is lying." />}

        {filtered.map((task) => (
          <article key={task.id} className="card task-card">
            <div className="card-header">
              <div>
                <h2 className={task.status === "Done" ? "done-text" : ""}>{task.title}</h2>
                <p className="muted">{task.description}</p>
              </div>
              <span className={`badge ${task.priority === "Must Do" ? "danger" : task.priority === "Should Do" ? "warning" : "success"}`}>{task.priority}</span>
            </div>

            <div className="task-meta"><span>{task.timing}</span><span>{task.assignee}</span></div>

            <select className="input" value={task.status} onChange={(e) => updateTask(task.id, "status", e.target.value)}>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>

            <div className="action-row">
              <button className="ghost-btn" onClick={() => openEdit(task)}>Edit</button>
              <button className="danger-btn" onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TruckDay({ truckState, setTruckState, truckNotes, setTruckNotes }) {
  const total = TRUCK_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);
  const done = Object.values(truckState).filter(Boolean).length;
  const progress = Math.round((done / total) * 100);

  function toggle(key) {
    setTruckState({ ...truckState, [key]: !truckState[key] });
  }

  function updateNote(sectionId, field, value) {
    setTruckNotes({
      ...truckNotes,
      [sectionId]: { ...(truckNotes[sectionId] || { note: "", addToHandoff: false }), [field]: value },
    });
  }

  return (
    <section className="screen">
      <PageHeader label="Truck Day Commander" title="Truck Day" subtitle={`${done} / ${total} items complete`} />

      <article className="card accent-card">
        <p className="eyebrow">Progress</p>
        <h2>{progress}% complete</h2>
        <Progress value={progress} />
      </article>

      <div className="stack">
        {TRUCK_SECTIONS.map((section) => {
          const noteState = truckNotes[section.id] || { note: "", addToHandoff: false };

          return (
            <article key={section.id} className="card">
              <p className="eyebrow">Truck Section</p>
              <h2>{section.title}</h2>

              <div className="checklist">
                {section.items.map((item, index) => {
                  const key = `${section.id}-${index}`;
                  return (
                    <label key={key} className="check-row">
                      <input type="checkbox" checked={!!truckState[key]} onChange={() => toggle(key)} />
                      <span className={truckState[key] ? "done-text" : ""}>{item}</span>
                    </label>
                  );
                })}
              </div>

              <label className="field-label">Section Notes</label>
              <textarea className="textarea" value={noteState.note} placeholder="Shorts, damages, unfinished water, cooler chaos..." onChange={(e) => updateNote(section.id, "note", e.target.value)} />

              <label className="handoff-toggle">
                <input type="checkbox" checked={!!noteState.addToHandoff} onChange={(e) => updateNote(section.id, "addToHandoff", e.target.checked)} />
                Add this section note to handoff
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TeamNotes({ teamNotes, setTeamNotes }) {
  const blank = { employee: "", type: "Coaching", note: "", date: todayISO(), addToHandoff: true };
  const [form, setForm] = useState(blank);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function saveNote(e) {
    e.preventDefault();
    if (!form.note.trim()) return;

    if (editingId) {
      setTeamNotes(teamNotes.map((note) => note.id === editingId ? { ...note, ...form } : note));
    } else {
      setTeamNotes([{ id: id(), ...form }, ...teamNotes]);
    }

    setForm(blank);
    setEditingId(null);
    setFormOpen(false);
  }

  function openEdit(note) {
    setEditingId(note.id);
    setForm(note);
    setFormOpen(true);
  }

  function deleteNote(noteId) {
    setTeamNotes(teamNotes.filter((note) => note.id !== noteId));
  }

  function toggleHandoff(noteId) {
    setTeamNotes(teamNotes.map((note) => note.id === noteId ? { ...note, addToHandoff: !note.addToHandoff } : note));
  }

  return (
    <section className="screen">
      <PageHeader label="People Stuff" title="Team Notes" subtitle="Document useful things before memory clocks out early." />

      <button className="primary-btn full" onClick={() => setFormOpen(true)}>Add Team Note</button>

      {formOpen && (
        <form className="card form-card" onSubmit={saveNote}>
          <p className="eyebrow">{editingId ? "Edit Note" : "New Team Note"}</p>

          <input className="input" placeholder="Person or area" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} />

          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Coaching</option>
            <option>Follow-up</option>
            <option>Schedule</option>
            <option>Win</option>
            <option>Issue</option>
            <option>General</option>
          </select>

          <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <textarea className="textarea" placeholder="What happened?" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

          <label className="handoff-toggle">
            <input type="checkbox" checked={!!form.addToHandoff} onChange={(e) => setForm({ ...form, addToHandoff: e.target.checked })} />
            Add to Shift Handoff
          </label>

          <div className="action-row">
            <button className="primary-btn" type="submit">Save</button>
            <button className="ghost-btn" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="stack">
        {teamNotes.length === 0 && <EmptyState title="No team notes" text="The quiet before someone asks about the schedule." />}

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

function Handoff({
  person,
  setPerson,
  shiftType,
  setShiftType,
  tasks,
  dateWatch,
  walkState,
  truckNotes,
  teamNotes,
  handoffHistory,
  setHandoffHistory,
  truckDone,
  truckTotal,
  visibleWin,
}) {
  const generatedAt = new Date();
  const completed = tasks.filter((task) => task.status === "Done");
  const open = tasks.filter((task) => task.status !== "Done");

  const dateRisks = dateWatch.filter((item) =>
    !item.resolved && (["BOGO Soon", "Pull Today", "Pull Now"].includes(item.dateStatus) || item.issueType !== "None")
  );

  const walkNotes = WALK_ITEMS
    .filter((item) => {
      const state = walkState[item.id];
      return state && (state.addToHandoff || state.note?.trim() || state.status === "Needs Attention" || state.status === "Urgent");
    })
    .map((item) => ({ ...item, ...(walkState[item.id] || {}) }));

  const teamForHandoff = teamNotes.filter((note) => note.addToHandoff);

  const truckForHandoff = TRUCK_SECTIONS
    .filter((section) => truckNotes[section.id]?.addToHandoff || truckNotes[section.id]?.note)
    .map((section) => `${section.title}: ${truckNotes[section.id]?.note || "Marked for follow-up"}`);

  const handoffText = buildHandoffText({
    person,
    shiftType,
    generatedAt,
    completed,
    open,
    dateRisks,
    walkNotes,
    teamForHandoff,
    truckForHandoff,
    truckDone,
    truckTotal,
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
      id: id(),
      createdAt: generatedAt.toISOString(),
      person,
      shiftType,
      completedCount: completed.length,
      openCount: open.length,
      dateRiskCount: dateRisks.length,
      walkNoteCount: walkNotes.length,
      text: handoffText,
    };

    setHandoffHistory([entry, ...handoffHistory].slice(0, 25));
    alert("Handoff saved to history.");
  }

  function deleteHistory(entryId) {
    setHandoffHistory(handoffHistory.filter((entry) => entry.id !== entryId));
  }

  return (
    <section className="screen">
      <PageHeader label="End of Shift" title="Handoff Builder" subtitle="Auto-built from tasks, walk notes, Date Watch, truck notes, and team notes." />

      <article className="card accent-card">
        <p className="eyebrow">Created By</p>
        <div className="grid-3 top-space">
          <select className="input" value={person} onChange={(e) => setPerson(e.target.value)}>
            {PEOPLE.map((p) => <option key={p}>{p}</option>)}
          </select>

          <select className="input" value={shiftType} onChange={(e) => setShiftType(e.target.value)}>
            {SHIFTS.map((s) => <option key={s}>{s}</option>)}
          </select>

          <button className="ghost-btn" onClick={saveHandoff}>Save</button>
        </div>
      </article>

      <article className="card">
        <div className="card-row">
          <div>
            <p className="eyebrow">Ready to Copy</p>
            <h2>Handoff Summary</h2>
            <p className="muted">{formatDateTime(generatedAt)} · {person} · {shiftType}</p>
          </div>
          <button className="primary-btn" onClick={copyHandoff}>Copy</button>
        </div>
      </article>

      <HandoffSection title="Completed" items={completed.map((task) => task.title)} />
      <HandoffSection title="Still Needs Done" items={open.map((task) => `${task.title} (${task.priority}, ${task.assignee})`)} />
      <HandoffSection title="Date Watch" items={dateRisks.map((item) => `${item.name}: ${item.dateStatus}${item.expirationDate ? `, date ${item.expirationDate}` : ""}${item.issueType !== "None" ? `, ${item.issueType}` : ""}${item.notes ? `, note: ${item.notes}` : ""}`)} />
      <HandoffSection title="Daily Store Walk Notes" items={walkNotes.map((item) => `${item.category}: ${item.status} - ${item.note || item.question}`)} />
      <HandoffSection title="Team Notes" items={teamForHandoff.map((note) => `${note.employee || "General"}: ${note.type} - ${note.note}`)} />
      <HandoffSection title="Truck Day Notes" items={[`Truck progress: ${truckDone} / ${truckTotal} complete`, ...truckForHandoff]} />
      <HandoffSection title="Visible Win" items={[visibleWin]} />

      <article className="card">
        <p className="eyebrow">Plain Text Preview</p>
        <pre className="handoff-preview">{handoffText}</pre>
      </article>

      <article className="card">
        <p className="eyebrow">Saved Handoffs</p>
        <h2>Handoff History</h2>
        <p className="muted">Last 25 saved handoffs stay on this device.</p>
      </article>

      <div className="stack">
        {handoffHistory.length === 0 && <EmptyState title="No saved handoffs yet" text="Save one when the shift has collected enough evidence." />}

        {handoffHistory.map((entry) => (
          <article key={entry.id} className="card task-card">
            <div className="card-header">
              <div>
                <h2>{entry.person} · {entry.shiftType}</h2>
                <p className="muted">{formatDateTime(entry.createdAt)}</p>
              </div>
              <span className="badge success">Saved</span>
            </div>

            <div className="snapshot-list">
              <span>Done <strong>{entry.completedCount}</strong></span>
              <span>Open <strong>{entry.openCount}</strong></span>
              <span>Risks <strong>{entry.dateRiskCount}</strong></span>
            </div>

            <pre className="handoff-preview">{entry.text}</pre>
            <button className="danger-btn" onClick={() => deleteHistory(entry.id)}>Delete Saved Handoff</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function buildHandoffText({
  person,
  shiftType,
  generatedAt,
  completed,
  open,
  dateRisks,
  walkNotes,
  teamForHandoff,
  truckForHandoff,
  truckDone,
  truckTotal,
  visibleWin,
}) {
  const lines = [];

  lines.push("SHIFT HANDOFF");
  lines.push(`Created: ${formatDateTime(generatedAt)}`);
  lines.push(`By: ${person}`);
  lines.push(`Shift: ${shiftType}`);
  lines.push("");

  lines.push("Completed:", ...listOrNone(completed.map((task) => `- ${task.title}`)), "");
  lines.push("Still Needs Done:", ...listOrNone(open.map((task) => `- ${task.title} (${task.priority}, ${task.assignee})`)), "");
  lines.push("Date Watch:", ...listOrNone(dateRisks.map((item) => `- ${item.name}: ${item.dateStatus}${item.expirationDate ? `, date ${item.expirationDate}` : ""}${item.issueType !== "None" ? `, ${item.issueType}` : ""}${item.notes ? `, note: ${item.notes}` : ""}`)), "");
  lines.push("Daily Store Walk Notes:", ...listOrNone(walkNotes.map((item) => `- ${item.category}: ${item.status} - ${item.note || item.question}`)), "");
  lines.push("Team Notes:", ...listOrNone(teamForHandoff.map((note) => `- ${note.employee || "General"}: ${note.type} - ${note.note}`)), "");
  lines.push("Truck Day Notes:", `- Truck progress: ${truckDone} / ${truckTotal} complete`, ...listOrNone(truckForHandoff.map((note) => `- ${note}`)), "");
  lines.push("Visible Win:", ...listOrNone(visibleWin ? [`- ${visibleWin}`] : []));

  return lines.join("\n");
}

function More({ setScreen }) {
  const cards = [
    { title: "Truck Day", text: "Receiving, cooler, water, recovery, and truck notes.", screen: "truck" },
    { title: "Team Notes", text: "Coaching, follow-ups, wins, and schedule notes.", screen: "team" },
    { title: "Handoff Builder", text: "Auto-generate and save shift handoffs.", screen: "handoff" },
  ];

  return (
    <section className="screen">
      <PageHeader label="More Tools" title="Store Support" subtitle="Extra tools without turning the bottom nav into a button salad." />

      <div className="stack">
        {cards.map((card) => (
          <article key={card.title} className="card">
            <div className="card-row">
              <div>
                <h2>{card.title}</h2>
                <p className="muted">{card.text}</p>
              </div>
              <button className="ghost-btn" onClick={() => setScreen(card.screen)}>Open</button>
            </div>
          </article>
        ))}
      </div>
    </section>
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

function MetricCard({ label, value, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
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

function Snapshot({ label, value }) {
  return (
    <div className="snapshot-list">
      <span>{label}</span>
      <strong>{value}</strong>
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
