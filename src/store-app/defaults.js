import { addDays, id, todayISO } from "./helpers.js";

export function defaultTasks() {
  return [
    {
      id: id("task"), title: "Complete opening manager walk", description: "Check exterior, restrooms, counter, coffee, cooler, kitchen, and visible store standards.",
      department: "Whole Store", assignee: "Jamison", shift: "Open", dueDate: todayISO(), dueTime: "08:00", estimate: 20,
      priority: "Critical", status: "Not Started", notes: "", waitingOn: "", createdAt: new Date().toISOString(),
    },
    {
      id: id("task"), title: "Review Date Watch", description: "Pull expired product and flag anything due within three days.",
      department: "Center Store", assignee: "Jamison", shift: "Open", dueDate: todayISO(), dueTime: "09:00", estimate: 15,
      priority: "High", status: "Not Started", notes: "", waitingOn: "", createdAt: new Date().toISOString(),
    },
    {
      id: id("task"), title: "Cigarette audit", description: "Verify counts, outs, and backbar condition.",
      department: "Front", assignee: "Jamison", shift: "Open", dueDate: todayISO(), dueTime: "10:00", estimate: 15,
      priority: "High", status: "Not Started", notes: "", waitingOn: "", createdAt: new Date().toISOString(),
    },
    {
      id: id("task"), title: "Pick one visible win", description: "Make one high-traffic area noticeably better before leaving.",
      department: "Center Store", assignee: "Jamison", shift: "Open", dueDate: todayISO(), dueTime: "13:30", estimate: 25,
      priority: "Normal", status: "Not Started", notes: "", waitingOn: "", createdAt: new Date().toISOString(),
    },
    {
      id: id("task"), title: "Review unresolved handoff", description: "Acknowledge incoming notes and assign follow-up work.",
      department: "Manager", assignee: "Jamison", shift: "Open", dueDate: todayISO(), dueTime: "07:00", estimate: 8,
      priority: "High", status: "Not Started", notes: "", waitingOn: "", createdAt: new Date().toISOString(),
    },
  ];
}

export function defaultDates() {
  return [
    { id: id("date"), name: "Half & Half Creamer", brand: "", area: "Dairy", location: "Open-air cooler", quantity: 4, expirationDate: todayISO(), status: "Watching", notes: "Check today.", enteredAt: new Date().toISOString() },
    { id: id("date"), name: "French Vanilla Creamer", brand: "", area: "Dairy", location: "Open-air cooler", quantity: 4, expirationDate: addDays(2), status: "Watching", notes: "Watch pull timing.", enteredAt: new Date().toISOString() },
    { id: id("date"), name: "Ribbon Pepperoni", brand: "", area: "Kitchen", location: "Walk-in", quantity: 3, expirationDate: addDays(7), status: "Watching", notes: "Low count.", enteredAt: new Date().toISOString() },
  ];
}

export function defaultHandoffs() {
  return [
    {
      id: id("handoff"), author: "Previous Shift", shift: "Close", category: "Needs Attention", priority: "High",
      message: "Cooler recovery is partly finished. Energy drinks and water still need attention.", relatedTaskId: "", status: "Open",
      acknowledgedBy: "", acknowledgedAt: "", resolvedBy: "", resolvedAt: "", createdAt: new Date().toISOString(), comments: [],
    },
  ];
}

export function defaultTruckChecklist() {
  return [
    "Clear receiving path and backroom staging space",
    "Assign cooler, freezer, totes, water, and center store",
    "Receive delivery and document damage or shortages",
    "Move temperature-sensitive freight first",
    "Work visible outs and high-volume areas",
    "Break down cardboard and clean staging area",
    "Complete final backstock and recovery check",
  ].map((title) => ({ id: id("truck"), title, done: false }));
}

export function makeDefaultState() {
  return {
    profile: { name: "Jamison", role: "Center Store Manager", store: "Store 2593", shift: "Open" },
    tasks: defaultTasks(),
    dates: defaultDates(),
    handoffs: defaultHandoffs(),
    priorities: ["Complete opening manager walk", "Review Date Watch", "Cigarette audit"],
    reminders: [
      { id: id("reminder"), text: "Review change order and receiving paperwork", done: false },
      { id: id("reminder"), text: "Check lottery before leaving", done: false },
    ],
    issues: [],
    truckChecklist: defaultTruckChecklist(),
    activity: [],
    lastResetDate: todayISO(),
  };
}
