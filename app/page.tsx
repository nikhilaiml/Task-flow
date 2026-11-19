"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Star, Trash2 } from "lucide-react"
import { getTasks, addTask, updateTask, archiveTask, getWorkspaces } from "@/lib/db"

type Task = {
  id: string
  title: string
  workspace: string
  due: string
  completed: boolean
  starred: boolean
  recurring: string
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const prettyDate = () => {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newWorkspace, setNewWorkspace] = useState("work")
  const [newDue, setNewDue] = useState("")
  const [newRepeat, setNewRepeat] = useState("none")
  const [addError, setAddError] = useState<string | null>(null)

  const load = async () => {
    const data = await getTasks()
    setTasks(data as Task[])
    // FIX: Static list hata diya - Ab DB se workspaces aayenge, har user ke apne
    const ws = await getWorkspaces()
    setAllWorkspaces(ws)
    if (ws.length > 0 && !ws.find((w: any) => w.id === newWorkspace)) {
      setNewWorkspace(ws[0].id)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setAddError(null)
    if (!newTitle.trim()) {
      setAddError("Please enter a task title")
      return
    }
    try {
      const result = await addTask({
        title: newTitle.trim(),
        workspace: newWorkspace,
        due: newDue || "",
        completed: false,
        starred: false,
        recurring: newRepeat === "none" ? "" : newRepeat,
      })
      if (!result) {
        setAddError("Task add nahi hua. Dobara try karo.")
        return
      }
      setNewTitle("")
      setNewDue("")
      setNewRepeat("none")
      setOpen(false)
      await load()
    } catch (err: any) {
      setAddError(err.message || "Kuch galat hua.")
    }
  }

  const toggleComplete = async (task: Task) => {
    await updateTask(task.id, { completed: !task.completed })
    await load()
  }

  const toggleStar = async (task: Task) => {
    await updateTask(task.id, { starred: !task.starred })
    await load()
  }

  const deleteTask = async (task: Task) => {
    await archiveTask(task.id)
    await load()
  }

  const today = todayStr()
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed
  const overdue = tasks.filter((t) => !t.completed && t.due && t.due < today).length
  const todayTasks = tasks.filter((t) => t.due === today)
  const importantTasks = tasks.filter((t) => t.starred && !t.completed)
  const overdueTasks = tasks.filter((t) => !t.completed && t.due && t.due < today)
  const upcomingTasks = tasks.filter((t) => !t.completed && t.due && t.due > today)
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  const TaskRow = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-3 py-2 border-b last:border-0">
      <Checkbox checked={task.completed} onCheckedChange={() => toggleComplete(task)} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{task.workspace} • {task.due || "No due date"} {task.recurring ? `• ${task.recurring}` : ""}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => toggleStar(task)}>
        <Star className={`h-4 w-4 ${task.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteTask(task)}>
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground">{prettyDate()}</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-orange-600">{pending}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-red-600">{overdue}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2"><span>Today&apos;s Progress</span><span>{progress}%</span></div>
          <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Today&apos;s Tasks ({todayTasks.length})</CardTitle></CardHeader><CardContent>{todayTasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks for today</p> : todayTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Important Tasks ({importantTasks.length})</CardTitle></CardHeader><CardContent>{importantTasks.length === 0 ? <p className="text-sm text-muted-foreground">No important tasks</p> : importantTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Overdue Tasks ({overdueTasks.length})</CardTitle></CardHeader><CardContent>{overdueTasks.length === 0 ? <p className="text-sm text-muted-foreground">No overdue tasks</p> : overdueTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Upcoming Tasks ({upcomingTasks.length})</CardTitle></CardHeader><CardContent>{upcomingTasks.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming tasks</p> : upcomingTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-">
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          {addError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {addError}
            </div>
          )}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter task title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Workspace</Label>
              {/* FIX: shadcn Select hatake Native select - Ab koi red nahi aayega, kyunki Select file hi nahi chahiye */}
              {/* FIX: bg-white hatake bg-background - Ab dark mode me bhi white-on-white nahi hoga */}
              <select value={newWorkspace} onChange={(e) => setNewWorkspace(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {allWorkspaces.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="due">Due Date</Label>
                <Input id="due" type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Repeat</Label>
                {/* FIX: Ye bhi Native select - Ab koi red nahi */}
                <select value={newRepeat} onChange={(e) => setNewRepeat(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}