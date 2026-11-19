import { supabase } from "./supabase"

export async function ensureDefaultWorkspaces() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const existing = await getWorkspaces()
  if (existing.length > 0) return existing
  const defaults = [
    { id: "work", title: "Work & Office", desc: "Work related tasks", icon_name: "work", is_custom: false },
    { id: "personal", title: "Personal Tasks", desc: "Personal tasks", icon_name: "home", is_custom: false },
    { id: "study", title: "Study & Learning", desc: "Study tasks", icon_name: "book", is_custom: false },
    { id: "health", title: "Health & Fitness", desc: "Health tasks", icon_name: "gym", is_custom: false },
    { id: "finance", title: "Finance & Bills", desc: "Finance tasks", icon_name: "folder", is_custom: false },
  ]
  for (const ws of defaults) {
    await supabase.from("workspaces").insert([{ ...ws, user_id: user.id, archived: false }])
  }
  return await getWorkspaces()
}

export async function getWorkspaces() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from("workspaces").select("*").eq("user_id", user.id).eq("archived", false)
  if (error) { console.error("getWorkspaces FAILED:", error.message); return [] }
  return data || []
}

export async function getArchivedWorkspaces() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from("workspaces").select("*").eq("user_id", user.id).eq("archived", true)
  if (error) return []
  return data || []
}

export async function getTasks(workspace?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  let query = supabase.from("tasks").select("*").eq("user_id", user.id).eq("archived", false)
  if (workspace) query = query.eq("workspace", workspace)
  const { data, error } = await query
  if (error) { console.error("getTasks FAILED:", error.message); return [] }
  return data || []
}

export async function getArchivedTasks() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from("tasks").select("*").eq("user_id", user.id).eq("archived", true)
  if (error) return []
  return data || []
}

export async function getMainviewTasks(view: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from("mainview_tasks").select("*").eq("user_id", user.id).eq("view", view)
  if (error) return []
  return data || []
}

export async function addTask(task: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from("tasks").insert([{ ...task, user_id: user.id, archived: false }]).select().single()
  if (error) { console.error("addTask FAILED:", error.message); return null }
  return data
}

export async function addMainviewTask(task: any, view: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from("mainview_tasks").insert([{ ...task, view, user_id: user.id }]).select().single()
  if (error) return null
  return data
}

// FIX: Sirf 1 baar hai - Object aaya to id nikal lega, isliye "[object Object]" error nahi aayega
export async function updateTask(id: any, updates: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const taskId = typeof id === "object" ? id.id : id
  const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).eq("user_id", user.id).select().single()
  if (error) { console.error("updateTask FAILED:", error.message); return null }
  return data
}

// FIX: Sirf 1 baar hai - Object aaya to id nikal lega
export async function archiveTask(id: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const taskId = typeof id === "object" ? id.id : id
  const { data, error } = await supabase.from("tasks").update({ archived: true }).eq("id", taskId).eq("user_id", user.id).select().single()
  if (error) { console.error("archiveTask FAILED:", error.message); return null }
  return data
}

// FIX: Sirf 1 baar hai - Pehle 2 baar tha
export async function restoreTask(id: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const taskId = typeof id === "object" ? id.id : id
  const { data, error } = await supabase.from("tasks").update({ archived: false }).eq("id", taskId).eq("user_id", user.id).select().single()
  if (error) return null
  return data
}

// FIX: Sirf 1 baar hai - Pehle 2 baar tha
export async function permanentlyDeleteTask(id: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const taskId = typeof id === "object" ? id.id : id
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id)
  if (error) return false
  return true
}

export async function addWorkspace(ws: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const payload = typeof ws === "string" ? { title: ws, icon_name: "folder", is_custom: true } : { ...ws }
  const { data, error } = await supabase.from("workspaces").insert([{ ...payload, user_id: user.id, archived: false }]).select().single()
  if (error) { console.error("addWorkspace FAILED:", error.message); return null }
  return data
}

// FIX: Ab id string ho ya object, dono chalega
export async function archiveWorkspace(ws: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const wsId = typeof ws === "object" ? ws.id : ws
  const { error } = await supabase.from("workspaces").update({ archived: true }).eq("id", wsId).eq("user_id", user.id)
  if (error) return false
  return true
}

export async function restoreWorkspace(id: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const wsId = typeof id === "object" ? id.id : id
  const { error } = await supabase.from("workspaces").update({ archived: false }).eq("id", wsId).eq("user_id", user.id)
  if (error) return false
  return true
}

export async function permanentlyDeleteWorkspace(id: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const wsId = typeof id === "object" ? id.id : id
  const { error } = await supabase.from("workspaces").delete().eq("id", wsId).eq("user_id", user.id)
  if (error) return false
  return true
}

export async function deleteWorkspace(id: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const wsId = typeof id === "object" ? id.id : id
  const { error } = await supabase.from("workspaces").delete().eq("id", wsId).eq("user_id", user.id)
  if (error) return false
  return true
}