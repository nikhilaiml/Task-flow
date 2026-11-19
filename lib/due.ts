// lib/due.ts

export function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function getTomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function normalizeDue(due: string): string {
  if (!due) return ""
  if (due === "today") return getTodayStr()
  if (due === "tomorrow") return getTomorrowStr()
  if (due === "upcoming") return "9999-12-31"
  return due
}

export function isTodayTask(due: string) {
  return normalizeDue(due) === getTodayStr()
}

export function isUpcomingTask(due: string) {
  const date = normalizeDue(due)
  return date > getTodayStr()
}

export function isOverdueTask(due: string, completed: boolean) {
  if (completed) return false
  const date = normalizeDue(due)
  return date !== "" && date < getTodayStr()
}

export function getDueLabel(due: string) {
  const date = normalizeDue(due)
  if (date === getTodayStr()) return "Today"
  if (date === getTomorrowStr()) return "Tomorrow"
  if (date > getTodayStr()) return "Upcoming"
  if (date < getTodayStr()) return "Overdue"
  return ""
}