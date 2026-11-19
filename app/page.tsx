"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Star, Trash2 } from "lucide-react"
import { getTasks, addTask, updateTask, archiveTask } from "@/lib/db"
import { workspaces } from "@/lib/navigation"

type Task = {
  id: number
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
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newWorkspace, setNewWorkspace] = useState("Work")
  const [newDue, setNewDue] = useState("")
  const [newRepeat, setNewRepeat] = useState("none")
  const [addError, setAddError] = useState<string | null>(null)

  const load = async () => {
    const data = await getTasks()
    setTasks(data as Task[])
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setAddError(null)
    if (!newTitle.trim()) return
    try {
      const result = await addTask({
        title: newTitle.trim(),
        workspace: newWorkspace,
        due: newDue || "",
        completed: false,
        starred: false,
        recurring: newRepeat === "none" ? "" : newRepeat,
      })
      if (result.error) {
        setAddError(result.error.message || "Task add nahi hua. Kripya dobara koshish karein.")
        return
      }
      setNewTitle("")
      setNewDue("")
      setNewRepeat("none")
      setOpen(false)
      await load()
    } catch (err: any) {
      setAddError(err.message || "Kuch galat hua. Kripya dobara koshish karein.")
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
    await archiveTask(task)
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
      <div className="flex-1">
        <p className={`text-sm font-medium ${task.completed ? "line-through text-zinc-400" : ""}`}>{task.title}</p>
        <p className="text-xs text-zinc-500">{task.workspace} • {task.due || "No due date"} {task.recurring ? `• ${task.recurring}` : ""}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStar(task)}>
        <Star className={`h-4 w-4 ${task.starred ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"}`} />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTask(task)}>
        <Trash2 className="h-4 w-4 text-zinc-400" />
      </Button>
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back 👋</h1>
          <p className="text-zinc-500">{prettyDate()}</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          {addError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {addError}
            </div>
          )}
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Title</Label><Input placeholder="Enter task title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Workspace</Label>
                <select value={newWorkspace} onChange={(e) => setNewWorkspace(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  {workspaces.map((w) => <option key={w.id} value={w.title}>{w.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Repeat</Label>
                  <select value={newRepeat} onChange={(e) => setNewRepeat(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                    <option value="none">No Repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAdd}>Add Task</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-zinc-500">Total</p><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-zinc-500">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-zinc-500">Pending</p><p className="text-2xl font-bold text-orange-600">{pending}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-zinc-500">Overdue</p><p className="text-2xl font-bold text-red-600">{overdue}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2"><span>Today&apos;s Progress</span><span>{progress}%</span></div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} /></div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Today&apos;s Tasks ({todayTasks.length})</CardTitle></CardHeader><CardContent>{todayTasks.length === 0 ? <p className="text-sm text-zinc-500">No tasks for today</p> : todayTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Important Tasks ({importantTasks.length})</CardTitle></CardHeader><CardContent>{importantTasks.length === 0 ? <p className="text-sm text-zinc-500">No important tasks</p> : importantTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Overdue Tasks ({overdueTasks.length})</CardTitle></CardHeader><CardContent>{overdueTasks.length === 0 ? <p className="text-sm text-zinc-500">No overdue tasks</p> : overdueTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Upcoming Tasks ({upcomingTasks.length})</CardTitle></CardHeader><CardContent>{upcomingTasks.length === 0 ? <p className="text-sm text-zinc-500">No upcoming tasks</p> : upcomingTasks.map((t) => <TaskRow key={t.id} task={t} />)}</CardContent></Card>
      </div>
    </div>
  )
}