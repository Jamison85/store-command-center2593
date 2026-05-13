import React, { useEffect, useMemo, useState } from "react";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const target = new Date(`${dateString}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function getExpirationStatus(dateString) {
  const days = daysUntil(dateString);
  if (days === null) return "Fresh";
  if (days < 0) return "Expired";
  if (days === 0) return "Expires Today";
  if (days <= 3) return "Expiring Soon";
  return "Fresh";
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

const walkItems = [
  { id: "w1", category: "Exterior", question: "Parking lot & fuel pumps clean?" },
  { id: "w2", category: "Interior", question: "Restrooms meeting standards?" },
  { id: "w3", category: "Interior", question: "Tobacco & FFE replenished?" },
  { id: "w4", category: "Interior", question: "Vaults and beer caves faced?" },
  { id: "w5", category: "P&DB", question: "Kitchen 5S and food safety?" },
  { id: "w6", category: "Team", question: "Team in uniform & greeting?" }
];

const emptyWalkState = () => walkItems.reduce((acc, item) => {
  acc[item.id] = { checked: false, note: "" };
  return acc;
}, {});

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [inventory, setInventory] = useLocalStorage("scc_inv_v5", []);
  const [tasks, setTasks] = useLocalStorage("scc_tasks_v5", []);
  const [topThree, setTopThree] = useLocalStorage("scc_top3_v5", ["Check Walk", "Date Checks", "Cooler Fills"]);
  const [walkState, setWalkState] = useLocalStorage("scc_walk_v5", emptyWalkState());

  const inventoryWithStatus = useMemo(() => 
    inventory.map(i => ({ ...i, status: getExpirationStatus(i.expirationDate) })), 
  [inventory]);

  const completedWalk = walkItems.filter(i => walkState[i.id]?.checked).length;
  const expiringRisks = inventoryWithStatus.filter(i => !i.resolved && i.status !== "Fresh").length;
  const openTasks = tasks.filter(t => t.status !== "Done").length;

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "dashboard" && (
          <Dashboard 
            setScreen={setScreen} 
            topThree={topThree} setTopThree={setTopThree}
            completedWalk={completedWalk}
            expiringRisks={expiringRisks}
            openTasks={openTasks}
          />
        )}
        {screen === "walk" && <DailyWalk walkState={walkState} setWalkState={setWalkState} />}
        {screen === "inventory" && <InventoryView inventory={inventoryWithStatus} setInventory={setInventory} />}
        {screen === "tasks" && <TasksView tasks={tasks} setTasks={setTasks} />}
        {screen === "more" && <MoreView />}
      </main>
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}

function Dashboard({ setScreen, topThree, setTopThree, completedWalk, expiringRisks, openTasks }) {
  const walkPercent = Math.round((completedWalk / walkItems.length) * 100);
  return (
    <section className="screen">
      <header className="hero-card">
        <div><p className="eyebrow">Store 2593</p><h1>Command Center</h1></div>
        <div style={{fontSize: '1.5rem'}}>🏠</div>
      </header>
      <div className="grid-3">
        <MetricCard label="WALK DONE" value={`${walkPercent}%`} tone="success" />
        <MetricCard label="RISKS" value={expiringRisks} tone="warning" />
        <MetricCard label="TASKS" value={openTasks} tone="danger" />
      </div>
      <article className="card">
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div><p className="eyebrow">Morning Walk</p><h2>Daily Progress</h2></div>
          <button className="ghost-btn" onClick={() => setScreen("walk")}>View</button>
        </div>
        <Progress value={walkPercent} />
      </article>
      <article className="card">
        <p className="eyebrow">Top 3 Priorities</p>
        <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px'}}>
          {topThree.map((item, index) => (
            <input key={index} className="input" value={item} onChange={(e) => {
              const next = [...topThree]; next[index] = e.target.value; setTopThree(next);
            }} />
          ))}
        </div>
      </article>
    </section>
  );
}

function MetricCard({ label, value, tone }) {
  return <article className={`metric-card ${tone}`}><strong>{value}</strong><span>{label}</span></article>;
}

function Progress({ value }) {
  return <div className="progress-track"><div className="progress-fill" style={{ width: `${value}%` }} /></div>;
}

function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "dashboard", label: "Home", icon: "⌂" },
    { id: "walk", label: "Walk", icon: "✓" },
    { id: "inventory", label: "Inv", icon: "▣" },
    { id: "tasks", label: "Tasks", icon: "☑" },
    { id: "more", label: "More", icon: "•••" },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <button key={t.id} className={screen === t.id ? "active" : ""} onClick={() => setScreen(t.id)}>
          <span>{t.icon}</span>{t.label}
        </button>
      ))}
    </nav>
  );
}

function DailyWalk({ walkState, setWalkState }) {
  return (
    <section className="screen">
      <header className="hero-card"><div><p className="eyebrow">Routine</p><h1>Daily Walk</h1></div></header>
      {walkItems.map(item => (
        <div key={item.id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
          <div style={{flex: 1}}>
            <p className="eyebrow" style={{fontSize: '0.6rem', marginBottom: '4px'}}>{item.category}</p>
            <span style={{fontSize: '0.9rem', fontWeight: '500'}}>{item.question}</span>
          </div>
          <input type="checkbox" checked={walkState[item.id].checked} onChange={(e) => {
            const next = {...walkState};
            next[item.id].checked = e.target.checked;
            setWalkState(next);
          }} style={{width: '24px', height: '24px'}} />
        </div>
      ))}
    </section>
  );
}

function InventoryView({ inventory, setInventory }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const add = () => {
    if (!name || !date) return;
    setInventory([...inventory, { id: makeId(), name, expirationDate: date, resolved: false }]);
    setName(""); setDate("");
  };
  const remove = (id) => setInventory(inventory.filter(i => i.id !== id));
  return (
    <section className="screen">
      <header className="hero-card"><div><p className="eyebrow">Store</p><h1>Inventory</h1></div></header>
      <div className="card" style={{display:'flex', flexDirection:'column', gap:'8px'}}>
        <input className="input" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button className="primary-btn" onClick={add}>Track Item</button>
      </div>
      {inventory.map(item => (
        <div key={item.id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
          <div style={{flex: 1}}>
            <div style={{fontWeight: '700'}}>{item.name}</div>
            <div className="muted" style={{fontSize:'0.8rem'}}>Due: {item.expirationDate}</div>
          </div>
          <button onClick={() => remove(item.id)} className="ghost-btn">Remove</button>
        </div>
      ))}
    </section>
  );
}

function TasksView({ tasks, setTasks }) {
  const [text, setText] = useState("");
  const add = () => {
    if (!text) return;
    setTasks([...tasks, { id: makeId(), text, status: "Open" }]);
    setText("");
  };
  return (
    <section className="screen">
      <header className="hero-card"><div><p className="eyebrow">To-Do</p><h1>Tasks</h1></div></header>
      <div className="card" style={{display:'flex', gap: '8px'}}>
        <input className="input" placeholder="New task..." value={text} onChange={e => setText(e.target.value)} />
        <button className="primary-btn" style={{width: 'auto', padding: '0 20px'}} onClick={add}>+</button>
      </div>
      {tasks.map(task => (
        <div key={task.id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
           <span style={{flex: 1}}>{task.text}</span>
           <button className="ghost-btn" onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}>Done</button>
        </div>
      ))}
    </section>
  );
}

function MoreView() {
  return (
    <section className="screen">
      <header className="hero-card"><div><p className="eyebrow">Settings</p><h1>More</h1></div></header>
      <div className="card">
         <p style={{margin:0, color:'var(--muted)', fontSize:'0.85rem'}}>Store: 2593</p>
         <p style={{margin:0, color:'var(--muted)', fontSize:'0.85rem'}}>Role: Center Store Manager</p>
      </div>
      <button className="primary-btn" style={{background:'var(--muted)'}} onClick={() => { if(window.confirm("Clear all data?")) { localStorage.clear(); window.location.reload(); } }}>Reset App Data</button>
    </section>
  );
}
