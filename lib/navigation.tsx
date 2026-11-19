import {
  Inbox, CalendarDays, CalendarClock, AlertCircle, CheckCircle2,
  Star, FolderKanban, Repeat, Archive,
  ListTodo, Briefcase, User, BookOpen, Code2, Rocket,
  Users, Home, HeartPulse, Wallet, Plane,
  Gamepad2, Music, Dumbbell, Folder,
  type LucideIcon
} from "lucide-react"

// --- MAIN VIEWS ---
export const mainViews = [
  { id: "inbox", title: "Inbox", desc: "Important + Today tasks", icon: Inbox, href: "/mainviews/inbox" },
  { id: "today", title: "Today", desc: "today tasks", icon: CalendarDays, href: "/workspace/today" },
  { id: "upcoming", title: "Upcoming", desc: "Upcoming tasks", icon: CalendarClock, href: "/mainviews/upcoming" },
  { id: "overdue", title: "Overdue", desc: "Late tasks", icon: AlertCircle, href: "/mainviews/overdue" },
  { id: "completed", title: "Completed", desc: "complete tasks", icon: CheckCircle2, href: "/mainviews/completed" },
  { id: "important", title: "Important", desc: "Starred tasks", icon: Star, href: "/mainviews/important" },
  { id: "recurring", title: "Recurring", desc: "Repeated tasks", icon: Repeat, href: "/mainviews/recurring" },
  { id: "archived", title: "Archived", desc: "Archived tasks", icon: Archive, href: "/mainviews/archived" },
]

export type Workspace = {
  id: string
  title: string
  desc: string
  icon: LucideIcon
}

// --- PURANE WORKSPACES - inko mat chhedo ---
export const workspaces: Workspace[] = [
  { id: "today", title: "Today", desc: "Today tasks", icon: ListTodo },
  { id: "work", title: "Work & Office", desc: "Office work", icon: Briefcase },
  { id: "personal", title: "Personal Tasks", desc: "Personal tasks", icon: User },
  { id: "study", title: "Study & Learning", desc: "Learning tasks", icon: BookOpen },
  { id: "home", title: "Home & Errands", desc: "Home tasks", icon: Home },
  { id: "health", title: "Health & Fitness", desc: "Health tasks", icon: HeartPulse },
  { id: "finance", title: "Finance & Bills", desc: "Finance tasks", icon: Wallet },
  { id: "travel", title: "Travel & Events", desc: "Travel tasks", icon: Plane },
]

export function getWorkspaceById(id: string) {
  return workspaces.find((w) => w.id === id)
}

export function getViewById(id: string) {
  return mainViews.find((v) => v.id === id)
}

// --- NAYA PART: CUSTOM WORKSPACE ---
export type CustomWorkspace = {
  id: string // url ke liye -> playing
  title: string // dikhane ke liye -> Playing
  desc: string
  iconName: string // gamepad, music, etc.
}

// Icon ka naam -> actual Lucide Icon
export const customIconMap: Record<string, LucideIcon> = {
  gamepad: Gamepad2,
  music: Music,
  book: BookOpen,
  gym: Dumbbell,
  work: Briefcase,
  home: Home,
  folder: Folder,
}

// localStorage se custom workspaces lao
export function getCustomWorkspaces(): CustomWorkspace[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("taskflow-workspaces") || "[]")
  } catch {
    return []
  }
}

// Naya workspace save karo + sidebar ko batao
export function saveCustomWorkspace(ws: CustomWorkspace) {
  const list = getCustomWorkspaces()
  // agar same id pehle se hai to replace karo, nahi to add karo
  const filtered = list.filter((w) => w.id !== ws.id)
  const updated = [...filtered, ws]
  localStorage.setItem("taskflow-workspaces", JSON.stringify(updated))
  // sidebar ko refresh karne ke liye event bhejo
  window.dispatchEvent(new Event("taskflow-workspaces-updated"))
}