// lib/db.ts - Supabase se saara data lena / bhejna yahi se hoga
// Pehle localStorage me tha, ab Supabase me hai
// Har page isi file ko bulayega, seedha supabase ko nahi

import { supabase } from "./supabase"

// ================= TASKS =================

// Saare active tasks lana
export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.log("getTasks error:", error.message)
    return []
  }
  return data || []
}

// Naya task add karna
export async function addTask(task: {
  title: string
  workspace: string
  due?: string
  completed?: boolean
  starred?: boolean
  recurring?: string
}) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      title: task.title,
      workspace: task.workspace,
      due: task.due || "",
      completed: task.completed || false,
      starred: task.starred || false,
      recurring: task.recurring || "",
    }])
    .select()
    .single()
  if (error) console.log("addTask error:", error.message)
  return data
}

// Task update karna - complete / star / edit
export async function updateTask(id: number, updates: any) {
  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
  if (error) console.log("updateTask error:", error.message)
}

// Task delete karna = Archived me bhejna
export async function archiveTask(task: any) {
  // 1. Pehle archived_tasks me daalo
  const { error: insertError } = await supabase
    .from("archived_tasks")
    .insert([{
      id: task.id,
      title: task.title,
      workspace: task.workspace,
      due: task.due || "",
      completed: task.completed || false,
      starred: task.starred || false,
      recurring: task.recurring || "",
    }])
  if (insertError) console.log("archiveTask insert error:", insertError.message)

  // 2. Fir tasks se hatao
  const { error: deleteError } = await supabase
    .from("tasks")
    .delete()
    .eq("id", task.id)
  if (deleteError) console.log("archiveTask delete error:", deleteError.message)
}

// ================= WORKSPACES =================

// Saare workspaces lana
export async function getWorkspaces() {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("title", { ascending: true })
  if (error) {
    console.log("getWorkspaces error:", error.message)
    return []
  }
  return data || []
}

// Naya workspace add karna - Create Workspace se
export async function addWorkspace(ws: {
  id: string
  title: string
  desc: string
  icon_name: string
  is_custom?: boolean
}) {
  const { error } = await supabase
    .from("workspaces")
    .insert([{
      id: ws.id,
      title: ws.title,
      desc: ws.desc,
      icon_name: ws.icon_name,
      is_custom: ws.is_custom ?? true,
    }])
  if (error) console.log("addWorkspace error:", error.message)
}

// Workspace delete karna = Archived me bhejna + uske tasks bhi
export async function archiveWorkspace(ws: {
  id: string
  title: string
  desc: string
  icon_name: string
  is_custom: boolean
}) {
  // 1. Is workspace ke saare tasks nikalo
  const { data: wsTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace", ws.title)

  // 2. Un tasks ko archived_tasks me daalo
  if (wsTasks && wsTasks.length > 0) {
    const toArchive = wsTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      workspace: t.workspace,
      due: t.due || "",
      completed: t.completed || false,
      starred: t.starred || false,
      recurring: t.recurring || "",
    }))
    await supabase.from("archived_tasks").upsert(toArchive)
    // 3. Tasks se hatao
    await supabase.from("tasks").delete().eq("workspace", ws.title)
  }

  // 4. Workspace ko archived_workspaces me daalo
  await supabase.from("archived_workspaces").insert([{
    id: ws.id,
    title: ws.title,
    desc: ws.desc,
    icon_name: ws.icon_name,
    is_custom: ws.is_custom,
  }])

  // 5. Workspaces se hatao
  await supabase.from("workspaces").delete().eq("id", ws.id)
}

// ================= ARCHIVED =================

// Archived tasks lana
export async function getArchivedTasks() {
  const { data, error } = await supabase
    .from("archived_tasks")
    .select("*")
    .order("deleted_at", { ascending: false })
  if (error) {
    console.log("getArchivedTasks error:", error.message)
    return []
  }
  return data || []
}

// Archived workspaces lana
export async function getArchivedWorkspaces() {
  const { data, error } = await supabase
    .from("archived_workspaces")
    .select("*")
    .order("deleted_at", { ascending: false })
  if (error) {
    console.log("getArchivedWorkspaces error:", error.message)
    return []
  }
  return data || []
}

// Archived task ko wapas Restore karna
export async function restoreTask(id: number) {
  // 1. Archived se nikalo
  const { data } = await supabase
    .from("archived_tasks")
    .select("*")
    .eq("id", id)
    .single()
  if (!data) return

  // 2. Wapas tasks me daalo - naya id banega, purana id kaam nahi karega
  await supabase.from("tasks").insert([{
    title: data.title,
    workspace: data.workspace,
    due: data.due || "",
    completed: data.completed || false,
    starred: data.starred || false,
    recurring: data.recurring || "",
  }])

  // 3. Archived se hatao
  await supabase.from("archived_tasks").delete().eq("id", id)
}

// Archived workspace ko wapas Restore karna
export async function restoreWorkspace(id: string) {
  const { data: ws } = await supabase
    .from("archived_workspaces")
    .select("*")
    .eq("id", id)
    .single()
  if (!ws) return

  // 1. Wapas workspaces me daalo
  await supabase.from("workspaces").insert([{
    id: ws.id,
    title: ws.title,
    desc: ws.desc,
    icon_name: ws.icon_name,
    is_custom: ws.is_custom,
  }])

  // 2. Uske tasks ko bhi wapas lao
  const { data: archivedTasks } = await supabase
    .from("archived_tasks")
    .select("*")
    .eq("workspace", ws.title)

  if (archivedTasks && archivedTasks.length > 0) {
    const toRestore = archivedTasks.map((t: any) => ({
      title: t.title,
      workspace: t.workspace,
      due: t.due || "",
      completed: t.completed || false,
      starred: t.starred || false,
      recurring: t.recurring || "",
    }))
    await supabase.from("tasks").insert(toRestore)
    const ids = archivedTasks.map((t: any) => t.id)
    await supabase.from("archived_tasks").delete().in("id", ids)
  }

  // 3. Archived se workspace hatao
  await supabase.from("archived_workspaces").delete().eq("id", id)
}

// Hamesha ke liye delete - Task
export async function permanentlyDeleteTask(id: number) {
  await supabase.from("archived_tasks").delete().eq("id", id)
}

// Hamesha ke liye delete - Workspace + uske tasks
export async function permanentlyDeleteWorkspace(id: string, title: string) {
  await supabase.from("archived_tasks").delete().eq("workspace", title)
  await supabase.from("archived_workspaces").delete().eq("id", id)
}



// ================= MAINVIEW TASKS - Alag Table =================

// MainView ke tasks lana - kis view ke chahiye wo batao
export async function getMainviewTasks(viewName: string) {
  const { data, error } = await supabase
    .from("mainview_tasks")
    .select("*")
    .eq("view", viewName)
    .order("created_at", { ascending: false })
  if (error) {
    console.log("getMainviewTasks error:", error.message)
    return []
  }
  return data || []
}

// Saare MainView tasks lana - bina filter ke
export async function getAllMainviewTasks() {
  const { data, error } = await supabase
    .from("mainview_tasks")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return []
  return data || []
}

// MainView se naya task add karna - mainview_tasks table me jayega
export async function addMainviewTask(task: {
  title: string
  view: string
  workspace?: string
  due?: string
  completed?: boolean
  starred?: boolean
  recurring?: string
}) {
  const { data, error } = await supabase
    .from("mainview_tasks")
    .insert([{
      title: task.title,
      view: task.view,
      workspace: task.workspace || "",
      due: task.due || "",
      completed: task.completed || false,
      starred: task.starred || false,
      recurring: task.recurring || "",
    }])
    .select()
    .single()
  if (error) console.log("addMainviewTask error:", error.message)
  return data
}

// MainView task update karna
export async function updateMainviewTask(id: number, updates: any) {
  const { error } = await supabase
    .from("mainview_tasks")
    .update(updates)
    .eq("id", id)
  if (error) console.log("updateMainviewTask error:", error.message)
}

// MainView task delete karna = Archived me bhejna
export async function archiveMainviewTask(task: any) {
  await supabase.from("archived_tasks").insert([{
    id: task.id,
    title: task.title,
    workspace: task.workspace || task.view,
    due: task.due || "",
    completed: task.completed || false,
    starred: task.starred || false,
    recurring: task.recurring || "",
  }])
  await supabase.from("mainview_tasks").delete().eq("id", task.id)
}