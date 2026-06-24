import { PRIORITIES, TASK_ZONES, dateInfo, dueAt, formatDate, formatTime, getTaskZone, minutesUntilDue, taskReason } from "./storechoreData.js";

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Button({ children, variant = "secondary", icon, className = "", ...props }) {
  return (
    <button className={`button button-${variant} ${className}`.trim()} type="button" {...props}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

export function ProgressBar({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value || 0)));

  return (
    <div className="progress-block" aria-label={`${label}: ${safeValue}%`}>
      <div className="progress-row">
        <span>{label}</span>
        <strong>{safeValue}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "○", title, message, action }) {
  return (
    <section className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        {icon}
      </span>
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </section>
  );
}

export function LoadingShell() {
  return (
    <div className="app app-loading" aria-busy="true">
      <header className="app-header">
        <div className="header-inner">
          <div className="skeleton skeleton-logo" />
          <div className="header-copy">
            <span className="skeleton skeleton-line short" />
            <span className="skeleton skeleton-line tiny" />
          </div>
        </div>
      </header>

      <main className="stack">
        <section className="skeleton-panel large" />
        <section className="skeleton-panel" />
        <section className="skeleton-grid">
          <span className="skeleton-card" />
          <span className="skeleton-card" />
          <span className="skeleton-card" />
          <span className="skeleton-card" />
        </section>
      </main>
    </div>
  );
}

export function PageTitle({ kicker, title, description, action }) {
  return (
    <section className="page-title">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="title-action">{action}</div> : null}
    </section>
  );
}

function TimeGuard({ task, now }) {
  const minutes = minutesUntilDue(task, now);
  const overdue = minutes < 0;
  const soon = minutes >= 0 && minutes <= 60;
  const tone = overdue ? "danger" : soon ? "warning" : "neutral";
  const label = overdue ? `${Math.abs(minutes)} min overdue` : soon ? `${minutes} min left` : `Due ${formatTime(task.dueTime)}`;

  return (
    <div className={`time-guard time-${tone}`}>
      <span>Time guard</span>
      <strong>{label}</strong>
    </div>
  );
}

export function FocusPanel({ task, now, progress, setStatus, showNext, openComposer }) {
  if (!task) {
    return (
      <section className="focus-card focus-empty">
        <div className="focus-copy">
          <p className="eyebrow">Priority right now</p>
          <h1>No urgent task is waiting.</h1>
          <p>The board is clear in this view.</p>
        </div>
        <ProgressBar value={progress} label="Shift completion" />
        <div className="focus-actions">
          <Button variant="primary" icon="+" onClick={() => openComposer("task")}>
            Add task
          </Button>
        </div>
      </section>
    );
  }

  const overdue = dueAt(task) < now && task.status !== "Completed";
  const tone = overdue || task.priority === "Critical" ? "danger" : task.priority === "High" ? "warning" : "calm";
  const zone = getTaskZone(task);

  return (
    <section className={`focus-card focus-${tone}`}>
      <div className="focus-copy">
        <div className="focus-topline">
          <p className="eyebrow">Priority right now</p>
          <Badge tone={tone === "danger" ? "danger" : tone === "warning" ? "warning" : "neutral"}>
            {overdue ? "Overdue" : task.priority}
          </Badge>
        </div>

        <h1>{task.title}</h1>
        <p className="focus-reason">{taskReason(task, now)}</p>

        <div className="focus-meta" aria-label="Task details">
          <span>{zone.icon} {zone.label}</span>
          <span>{task.estimate} min</span>
          <span>{formatDate(task.dueDate)} · {formatTime(task.dueTime)}</span>
        </div>
      </div>

      <div className="focus-side">
        <TimeGuard task={task} now={now} />
        <ProgressBar value={progress} label="Shift completion" />
      </div>

      <div className="focus-actions">
        {task.status !== "In Progress" ? (
          <Button variant="primary" icon="▶" onClick={() => setStatus(task.id, "In Progress")}>
            Start
          </Button>
        ) : null}
        <Button variant="success" icon="✓" onClick={() => setStatus(task.id, "Completed")}>
          Complete
        </Button>
        <Button variant="secondary" icon="!" onClick={() => setStatus(task.id, "Blocked")}>
          Block
        </Button>
        <Button variant="ghost" icon="↷" onClick={showNext}>
          Show next
        </Button>
      </div>
    </section>
  );
}

export function MetricButton({ value, label, detail, tone, onClick }) {
  return (
    <button className={`metric-card metric-${tone}`} type="button" onClick={onClick}>
      <span className="metric-dot" aria-hidden="true" />
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </button>
  );
}

export function TaskCard({ task, now, setStatus }) {
  const zone = getTaskZone(task);
  const overdue = dueAt(task) < now && !["Completed", "Skipped"].includes(task.status);
  const tone =
    task.status === "Completed"
      ? "success"
      : task.status === "Blocked"
        ? "warning"
        : overdue || task.priority === "Critical"
          ? "danger"
          : task.priority === "High"
            ? "warning"
            : "neutral";

  return (
    <article className={`task-card task-${task.status.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="task-main">
        <div className="card-topline">
          <Badge tone={tone}>{task.status === "Completed" ? "Done" : overdue ? "Overdue" : task.priority}</Badge>
          <span className="task-time">{task.estimate} min</span>
        </div>

        <h3>{task.title}</h3>
        {task.description ? <p>{task.description}</p> : null}

        <div className="meta-chips">
          <span>{zone.icon} {zone.label}</span>
          <span>{task.department}</span>
          <span>{formatDate(task.dueDate)} · {formatTime(task.dueTime)}</span>
        </div>

        {task.status === "Blocked" ? <p className="status-note">Blocked work stays visible until it can be handled.</p> : null}
      </div>

      <div className="task-actions">
        {task.status !== "In Progress" && task.status !== "Completed" ? (
          <Button variant="primary" icon="▶" onClick={() => setStatus(task.id, "In Progress")}>
            Start
          </Button>
        ) : null}

        {task.status !== "Completed" ? (
          <Button variant="success" icon="✓" onClick={() => setStatus(task.id, "Completed")}>
            Done
          </Button>
        ) : null}

        {task.status !== "Completed" ? (
          <Button variant="secondary" icon="!" onClick={() => setStatus(task.id, "Blocked")}>
            Block
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function DateCard({ item, markHandled }) {
  const info = dateInfo(item);

  return (
    <article className={`date-card date-${info.tone}`}>
      <div>
        <div className="card-topline">
          <Badge tone={info.tone}>{info.label}</Badge>
          <span className="task-time">Qty {item.quantity}</span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.area} · {item.location || "No location set"}</p>
        <small>
          Expires {formatDate(item.expirationDate)}
          {item.notes ? ` · ${item.notes}` : ""}
        </small>
      </div>

      {item.status !== "Handled" ? (
        <Button variant="success" icon="✓" onClick={() => markHandled(item.id)}>
          Handled
        </Button>
      ) : null}
    </article>
  );
}

export function HandoffCard({ item, updateHandoff }) {
  const urgent = item.category === "Urgent";

  return (
    <article className={`handoff-card ${urgent ? "handoff-urgent" : ""}`}>
      <div className="card-topline">
        <Badge tone={urgent ? "danger" : "warning"}>{item.category}</Badge>
        <Badge tone={item.status === "Resolved" ? "success" : "neutral"}>{item.status}</Badge>
      </div>

      <h3>{item.message}</h3>
      <p>
        {item.author} · {item.shift} · {new Date(item.createdAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      {item.status !== "Resolved" ? (
        <div className="task-actions horizontal">
          {item.status === "Open" ? (
            <Button variant="secondary" icon="✓" onClick={() => updateHandoff(item.id, "Acknowledged")}>
              Acknowledge
            </Button>
          ) : null}
          <Button variant="success" icon="✓" onClick={() => updateHandoff(item.id, "Resolved")}>
            Resolve
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function ComposerModal({ type, draft, setDraft, setType, onClose, onSave }) {
  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Quick capture</p>
            <h2 id="composer-title">Add {type === "date" ? "date item" : type === "handoff" ? "handoff note" : "task"}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="composer-tabs" role="tablist" aria-label="Add item type">
          {[
            ["task", "Task"],
            ["date", "Date"],
            ["handoff", "Note"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={type === id ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={type === id}
              onClick={() => setType(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="modal-body form-grid" onSubmit={onSave}>
          {type === "task" ? (
            <>
              <label className="field full">
                <span>Task name</span>
                <input value={draft.title} onChange={(event) => change("title", event.target.value)} autoFocus />
              </label>

              <label className="field full">
                <span>Description</span>
                <textarea value={draft.description} onChange={(event) => change("description", event.target.value)} />
              </label>

              <label className="field">
                <span>Zone</span>
                <select value={draft.zone} onChange={(event) => change("zone", event.target.value)}>
                  {TASK_ZONES.filter((zone) => zone.id !== "All").map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Department</span>
                <input value={draft.department} onChange={(event) => change("department", event.target.value)} />
              </label>

              <label className="field">
                <span>Due time</span>
                <input type="time" value={draft.dueTime} onChange={(event) => change("dueTime", event.target.value)} />
              </label>

              <label className="field">
                <span>Minutes</span>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={draft.estimate}
                  onChange={(event) => change("estimate", event.target.value)}
                />
              </label>

              <label className="field full">
                <span>Priority</span>
                <select value={draft.priority} onChange={(event) => change("priority", event.target.value)}>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {type === "date" ? (
            <>
              <label className="field full">
                <span>Product name</span>
                <input value={draft.name} onChange={(event) => change("name", event.target.value)} autoFocus />
              </label>

              <label className="field">
                <span>Area</span>
                <input value={draft.area} onChange={(event) => change("area", event.target.value)} />
              </label>

              <label className="field">
                <span>Location</span>
                <input value={draft.location} onChange={(event) => change("location", event.target.value)} />
              </label>

              <label className="field">
                <span>Quantity</span>
                <input type="number" min="1" value={draft.quantity} onChange={(event) => change("quantity", event.target.value)} />
              </label>

              <label className="field">
                <span>Expiration date</span>
                <input type="date" value={draft.expirationDate} onChange={(event) => change("expirationDate", event.target.value)} />
              </label>

              <label className="field full">
                <span>Notes</span>
                <textarea value={draft.notes} onChange={(event) => change("notes", event.target.value)} />
              </label>
            </>
          ) : null}

          {type === "handoff" ? (
            <>
              <label className="field full">
                <span>Category</span>
                <select value={draft.category} onChange={(event) => change("category", event.target.value)}>
                  <option>Needs Attention</option>
                  <option>Urgent</option>
                  <option>Staffing</option>
                  <option>Maintenance</option>
                  <option>Customer Issue</option>
                  <option>Manager FYI</option>
                </select>
              </label>

              <label className="field full">
                <span>Note</span>
                <textarea value={draft.message} onChange={(event) => change("message", event.target.value)} autoFocus />
              </label>
            </>
          ) : null}

          <div className="modal-actions full">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" icon="+" className="grow" {...{ type: "submit" }}>
              Add to shift
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
