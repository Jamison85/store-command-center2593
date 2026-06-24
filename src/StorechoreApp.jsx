import { useEffect, useMemo, useState } from "react";
import {
  LEGACY_KEYS,
  NAV_ITEMS,
  STORAGE_KEY,
  TASK_ZONES,
  createDraft,
  createInitialState,
  dateInfo,
  dueAt,
  formatDate,
  formatTime,
  getTaskZone,
  loadState,
  normalizeState,
  taskReason,
  taskScore,
  todayISO,
  uid,
} from "./storechoreData.js";
import {
  Button,
  ComposerModal,
  DateCard,
  EmptyState,
  FocusPanel,
  HandoffCard,
  LoadingShell,
  MetricButton,
  PageTitle,
  ProgressBar,
  TaskCard,
} from "./ui.jsx";

export default function StorechoreApp() {
  const [state, setState] = useState(loadState);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [page, setPage] = useState("home");
  const [taskStatusFilter, setTaskStatusFilter] = useState("Open");
  const [taskZoneFilter, setTaskZoneFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Active");
  const [handoffFilter, setHandoffFilter] = useState("Open");
  const [focusIndex, setFocusIndex] = useState(0);
  const [composerType, setComposerType] = useState(null);
  const [draft, setDraft] = useState(createDraft("task"));
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setToast("Storechore could not save to this browser.");
    }
  }, [state]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openTasks = useMemo(
    () => state.tasks.filter((task) => !["Completed", "Skipped"].includes(task.status)),
    [state.tasks],
  );

  const queue = useMemo(
    () => [...openTasks].sort((a, b) => taskScore(b, now) - taskScore(a, now)),
    [openTasks, now],
  );

  const focusTask = queue.length ? queue[focusIndex % queue.length] : null;
  const completedCount = state.tasks.filter((task) => task.status === "Completed").length;
  const progress = state.tasks.length ? Math.round((completedCount / state.tasks.length) * 100) : 0;
  const overdueTasks = openTasks.filter((task) => dueAt(task) < now);
  const urgentDates = state.dates.filter((item) => item.status !== "Handled" && dateInfo(item).rank <= 2);
  const openHandoffs = state.handoffs.filter((item) => item.status !== "Resolved");

  function changeState(updater) {
    setState((current) => normalizeState(updater(current)));
  }

  function setTaskStatus(taskId, status) {
    const timestamp = new Date().toISOString();

    changeState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              startedAt: status === "In Progress" ? task.startedAt || timestamp : task.startedAt,
              completedAt: status === "Completed" ? timestamp : task.completedAt,
              blockedAt: status === "Blocked" ? timestamp : task.blockedAt,
            }
          : task,
      ),
    }));

    setFocusIndex(0);
    setToast(`Task marked ${status.toLowerCase()}.`);
  }

  function openComposer(type = "task") {
    setDraft(createDraft(type));
    setComposerType(type);
  }

  function setComposerKind(type) {
    setDraft(createDraft(type));
    setComposerType(type);
  }

  function closeComposer() {
    setComposerType(null);
  }

  function saveComposer(event) {
    event.preventDefault();

    if (composerType === "task") {
      const title = draft.title.trim();
      if (!title) {
        setToast("Add a task name first.");
        return;
      }

      changeState((current) => ({
        ...current,
        tasks: [
          {
            id: uid("task"),
            title,
            description: draft.description.trim(),
            department: draft.department.trim() || draft.zone,
            zone: draft.zone,
            assignee: current.profile.name,
            dueDate: todayISO(),
            dueTime: draft.dueTime || "12:00",
            estimate: Number(draft.estimate) || 15,
            priority: draft.priority,
            status: "Not Started",
            startedAt: null,
            completedAt: null,
            blockedAt: null,
          },
          ...current.tasks,
        ],
      }));
      setToast("Task added.");
      closeComposer();
      return;
    }

    if (composerType === "date") {
      const name = draft.name.trim();
      if (!name) {
        setToast("Add a product name first.");
        return;
      }

      changeState((current) => ({
        ...current,
        dates: [
          {
            id: uid("date"),
            name,
            area: draft.area.trim() || "Center Store",
            location: draft.location.trim(),
            quantity: Number(draft.quantity) || 1,
            expirationDate: draft.expirationDate || todayISO(),
            status: "Watching",
            notes: draft.notes.trim(),
          },
          ...current.dates,
        ],
      }));
      setToast("Date item added.");
      closeComposer();
      return;
    }

    if (composerType === "handoff") {
      const message = draft.message.trim();
      if (!message) {
        setToast("Add a note first.");
        return;
      }

      changeState((current) => ({
        ...current,
        handoffs: [
          {
            id: uid("handoff"),
            author: current.profile.name,
            shift: current.profile.shift,
            category: draft.category,
            message,
            status: "Open",
            createdAt: new Date().toISOString(),
          },
          ...current.handoffs,
        ],
      }));
      setToast("Handoff note added.");
      closeComposer();
    }
  }

  function markDateHandled(itemId) {
    changeState((current) => ({
      ...current,
      dates: current.dates.map((item) => (item.id === itemId ? { ...item, status: "Handled" } : item)),
    }));
    setToast("Date item handled.");
  }

  function updateHandoff(itemId, status) {
    changeState((current) => ({
      ...current,
      handoffs: current.handoffs.map((item) => (item.id === itemId ? { ...item, status } : item)),
    }));
    setToast(`Note marked ${status.toLowerCase()}.`);
  }

  function toggleReminder(reminderId) {
    changeState((current) => ({
      ...current,
      reminders: current.reminders.map((item) =>
        item.id === reminderId ? { ...item, done: !item.done } : item,
      ),
    }));
  }

  function toggleTruckItem(itemId) {
    changeState((current) => ({
      ...current,
      truck: current.truck.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    }));
  }

  function resetData() {
    if (!window.confirm("Reset Storechore data for this browser?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
    setState(createInitialState());
    setFocusIndex(0);
    setToast("Storechore data reset.");
  }

  if (isLoading) {
    return <LoadingShell />;
  }

  const filteredTasks = state.tasks
    .filter((task) => {
      if (taskStatusFilter === "All") return true;
      if (taskStatusFilter === "Open") return !["Completed", "Skipped"].includes(task.status);
      return task.status === taskStatusFilter;
    })
    .filter((task) => taskZoneFilter === "All" || getTaskZone(task).id === taskZoneFilter)
    .sort((a, b) => taskScore(b, now) - taskScore(a, now));

  const filteredDates = state.dates
    .map((item) => ({ ...item, info: dateInfo(item) }))
    .sort((a, b) => a.info.rank - b.info.rank)
    .filter((item) => {
      if (dateFilter === "All") return true;
      if (dateFilter === "Handled") return item.status === "Handled";
      if (dateFilter === "Urgent") return item.info.rank <= 2;
      return item.status !== "Handled";
    });

  const filteredHandoffs = state.handoffs.filter((item) => {
    if (handoffFilter === "All") return true;
    if (handoffFilter === "Resolved") return item.status === "Resolved";
    return item.status !== "Resolved";
  });

  const zoneStats = TASK_ZONES.filter((zone) => zone.id !== "All").map((zone) => {
    const tasks = state.tasks.filter((task) => getTaskZone(task).id === zone.id);
    const done = tasks.filter((task) => task.status === "Completed").length;
    const open = tasks.filter((task) => !["Completed", "Skipped"].includes(task.status)).length;

    return {
      ...zone,
      total: tasks.length,
      done,
      open,
      progress: tasks.length ? Math.round((done / tasks.length) * 100) : 100,
    };
  });

  const truckDone = state.truck.filter((item) => item.done).length;
  const truckProgress = state.truck.length ? Math.round((truckDone / state.truck.length) * 100) : 100;

  const homePage = (
    <div className="stack">
      <FocusPanel
        task={focusTask}
        now={now}
        progress={progress}
        setStatus={setTaskStatus}
        showNext={() => setFocusIndex((value) => value + 1)}
        openComposer={openComposer}
      />

      <section className="shift-card">
        <div className="shift-copy">
          <p className="eyebrow">Protected shift view</p>
          <h2>{state.profile.shift} shift · {formatDate(todayISO())}</h2>
          <p>Storechore shows the work inside your current shift only, with handoff notes for anything that needs to carry forward.</p>
        </div>
        <ProgressBar value={progress} label="Daily task completion" />
      </section>

      <section className="metrics-grid" aria-label="Shift status metrics">
        <MetricButton
          value={openTasks.length}
          label="Open tasks"
          detail="Visible work remaining"
          tone="accent"
          onClick={() => {
            setTaskStatusFilter("Open");
            setTaskZoneFilter("All");
            setPage("tasks");
          }}
        />
        <MetricButton
          value={overdueTasks.length}
          label="Overdue"
          detail="Needs protection now"
          tone="danger"
          onClick={() => {
            setTaskStatusFilter("Open");
            setTaskZoneFilter("All");
            setPage("tasks");
          }}
        />
        <MetricButton
          value={urgentDates.length}
          label="Date alerts"
          detail="Pull or check today"
          tone="warning"
          onClick={() => setPage("dates")}
        />
        <MetricButton
          value={openHandoffs.length}
          label="Open notes"
          detail="Shift communication"
          tone="navy"
          onClick={() => setPage("handoff")}
        />
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Operational zones</p>
            <h2>Pick the lane, not the whole highway</h2>
          </div>
        </div>

        <div className="zone-grid">
          {zoneStats.map((zone) => (
            <button
              className="zone-card"
              key={zone.id}
              type="button"
              onClick={() => {
                setTaskZoneFilter(zone.id);
                setTaskStatusFilter("Open");
                setPage("tasks");
              }}
            >
              <span className="zone-icon" aria-hidden="true">
                {zone.icon}
              </span>
              <strong>{zone.label}</strong>
              <small>{zone.open} open · {zone.done} done</small>
              <div className="mini-track">
                <span style={{ width: `${zone.progress}%` }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Next three</p>
              <h2>Strict order</h2>
            </div>
            <Button variant="ghost" onClick={() => setPage("focus")}>
              Focus view
            </Button>
          </div>

          {queue.length ? (
            <div className="rank-list">
              {queue.slice(0, 3).map((task, index) => (
                <button
                  className="rank-row"
                  key={task.id}
                  type="button"
                  onClick={() => {
                    setTaskZoneFilter(getTaskZone(task).id);
                    setTaskStatusFilter("Open");
                    setPage("tasks");
                  }}
                >
                  <b>{index + 1}</b>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{getTaskZone(task).label} · {formatTime(task.dueTime)}</small>
                  </span>
                  <em aria-hidden="true">›</em>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon="✓" title="No open priorities" message="Nothing is demanding the front seat right now." />
          )}
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Reminders</p>
              <h2>Small tasks</h2>
            </div>
          </div>

          {state.reminders.length ? (
            state.reminders.map((reminder) => (
              <label className={`check-row ${reminder.done ? "done" : ""}`} key={reminder.id}>
                <input type="checkbox" checked={reminder.done} onChange={() => toggleReminder(reminder.id)} />
                <span>{reminder.text}</span>
              </label>
            ))
          ) : (
            <EmptyState icon="○" title="No reminders" message="Nothing is waiting here." />
          )}
        </article>
      </section>
    </div>
  );

  const focusPage = (
    <div className="stack">
      <PageTitle
        kicker="Decision support"
        title="Focus queue"
        description="One task at a time, ranked by urgency, priority, timing, and whether you already started it."
      />

      <FocusPanel
        task={focusTask}
        now={now}
        progress={progress}
        setStatus={setTaskStatus}
        showNext={() => setFocusIndex((value) => value + 1)}
        openComposer={openComposer}
      />

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Queue preview</p>
            <h2>After this</h2>
          </div>
        </div>

        {queue.length ? (
          <div className="task-stack compact">
            {queue.slice(0, 5).map((task, index) => (
              <div className="queue-preview" key={task.id}>
                <b>{index + 1}</b>
                <span>
                  <strong>{task.title}</strong>
                  <small>{taskReason(task, now)}</small>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="✓" title="Queue is clear" message="No urgent work is waiting in this shift." />
        )}
      </section>
    </div>
  );

  const tasksPage = (
    <div className="stack">
      <PageTitle
        kicker="Daily execution"
        title="Tasks"
        description="Start, block, and finish work from a clear operational queue."
        action={
          <Button variant="primary" icon="+" onClick={() => openComposer("task")}>
            Add task
          </Button>
        }
      />

      <section className="card filters-card">
        <div className="segmented" aria-label="Task status filter">
          {["Open", "In Progress", "Blocked", "Completed", "All"].map((filter) => (
            <button
              className={taskStatusFilter === filter ? "active" : ""}
              key={filter}
              type="button"
              onClick={() => setTaskStatusFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="zone-tabs" aria-label="Task zone filter">
          {TASK_ZONES.map((zone) => (
            <button
              className={taskZoneFilter === zone.id ? "active" : ""}
              key={zone.id}
              type="button"
              onClick={() => setTaskZoneFilter(zone.id)}
            >
              <span aria-hidden="true">{zone.icon}</span>
              {zone.label}
            </button>
          ))}
        </div>
      </section>

      <div className="task-stack">
        {filteredTasks.length ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} now={now} setStatus={setTaskStatus} />)
        ) : (
          <EmptyState
            icon="✓"
            title="Nothing in this lane"
            message="This filter is clear."
            action={
              <Button variant="primary" icon="+" onClick={() => openComposer("task")}>
                Add task
              </Button>
            }
          />
        )}
      </div>
    </div>
  );

  const datesPage = (
    <div className="stack">
      <PageTitle
        kicker="Expiration control"
        title="Date Watch"
        description="See what must be pulled, checked, or left alone for now."
        action={
          <Button variant="primary" icon="+" onClick={() => openComposer("date")}>
            Add item
          </Button>
        }
      />

      <section className="card filters-card">
        <div className="segmented" aria-label="Date filter">
          {["Active", "Urgent", "Handled", "All"].map((filter) => (
            <button
              className={dateFilter === filter ? "active" : ""}
              key={filter}
              type="button"
              onClick={() => setDateFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <div className="task-stack">
        {filteredDates.length ? (
          filteredDates.map((item) => <DateCard key={item.id} item={item} markHandled={markDateHandled} />)
        ) : (
          <EmptyState
            icon="◷"
            title="No date items here"
            message="Nothing matches this view."
            action={
              <Button variant="primary" icon="+" onClick={() => openComposer("date")}>
                Add date item
              </Button>
            }
          />
        )}
      </div>
    </div>
  );

  const handoffPage = (
    <div className="stack">
      <PageTitle
        kicker="Shift communication"
        title="Notes"
        description="Capture what happened, who knows, and what still needs attention."
        action={
          <Button variant="primary" icon="+" onClick={() => openComposer("handoff")}>
            Add note
          </Button>
        }
      />

      <section className="card filters-card">
        <div className="segmented" aria-label="Note filter">
          {["Open", "Resolved", "All"].map((filter) => (
            <button
              className={handoffFilter === filter ? "active" : ""}
              key={filter}
              type="button"
              onClick={() => setHandoffFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <div className="task-stack">
        {filteredHandoffs.length ? (
          filteredHandoffs.map((item) => <HandoffCard key={item.id} item={item} updateHandoff={updateHandoff} />)
        ) : (
          <EmptyState
            icon="✓"
            title="No notes in this view"
            message="Nothing is waiting here."
            action={
              <Button variant="primary" icon="+" onClick={() => openComposer("handoff")}>
                Add note
              </Button>
            }
          />
        )}
      </div>
    </div>
  );

  const morePage = (
    <div className="stack">
      <PageTitle
        kicker="Tools and controls"
        title="More"
        description="Truck mode, reminders, shift scope, and reset controls."
      />

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Truck Day mode</p>
            <h2>Freight control</h2>
          </div>
          <strong className="large-percent">{truckProgress}%</strong>
        </div>

        <ProgressBar value={truckProgress} label="Truck checklist" />

        <div className="check-list">
          {state.truck.map((item) => (
            <label className={`check-row ${item.done ? "done" : ""}`} key={item.id}>
              <input type="checkbox" checked={item.done} onChange={() => toggleTruckItem(item.id)} />
              <span>{item.title}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Scope control</p>
            <h2>One shift, one board</h2>
          </div>
        </div>
        <p className="body-copy">
          Storechore is intentionally scoped to the shift you are working. Notes can carry forward, but the active task board stays focused.
        </p>
      </section>

      <section className="card danger-zone">
        <div>
          <p className="eyebrow">Data controls</p>
          <h2>Reset local data</h2>
          <p className="body-copy">This clears Storechore data saved in this browser.</p>
        </div>
        <Button variant="danger" icon="×" onClick={resetData}>
          Reset app data
        </Button>
      </section>
    </div>
  );

  const pages = {
    home: homePage,
    focus: focusPage,
    tasks: tasksPage,
    dates: datesPage,
    handoff: handoffPage,
    more: morePage,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={() => setPage("home")} aria-label="Go to Today">
            <span className="brand-mark">S</span>
            <span>
              <strong>Storechore</strong>
              <small>{state.profile.store} · {state.profile.shift} shift</small>
            </span>
          </button>

          <button className="profile-button" type="button" aria-label="Current profile">
            <b>{state.profile.name.slice(0, 1)}</b>
            <span>{state.profile.name}</span>
          </button>
        </div>
      </header>

      <main>{pages[page]}</main>

      <button className="fab" type="button" onClick={() => openComposer("task")} aria-label="Quick add task">
        +
      </button>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <button
            className={page === item.id ? "active" : ""}
            key={item.id}
            type="button"
            onClick={() => setPage(item.id)}
            aria-current={page === item.id ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>

      {composerType ? (
        <ComposerModal
          type={composerType}
          draft={draft}
          setDraft={setDraft}
          setType={setComposerKind}
          onClose={closeComposer}
          onSave={saveComposer}
        />
      ) : null}

      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast ? <div className="toast">{toast}</div> : null}
      </div>
    </div>
  );
}
