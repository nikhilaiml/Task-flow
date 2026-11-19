"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Star, Trash2 } from "lucide-react"
import { getTasks, addTask, updateTask, archiveTask, getWorkspaces } from "@/lib/db"
import { workspaces } from "@/lib/navigation"

export default function DynamicWorkspacePage() {
  const params = useParams()
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [tasks, setTasks] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDue, setNewDue] = useState("")
  const [newRepeat, setNewRepeat] = useState("none")

  const load = async () => {
    const staticWs = workspaces.find((w) => w.id === id)
    if (staticWs) {
      setTitle(staticWs.title)
      const all = await getTasks()
      setTasks(all.filter((t: any) => t.workspace === staticWs.title))
    } else {
      const allWs = await getWorkspaces()
      const custom = allWs.find((w: any) => w.id === id)
      const wsTitle = custom?.title || id
      setTitle(wsTitle)
      const all = await getTasks()
      setTasks(all.filter((t: any) => t.workspace === wsTitle))
    }
  }

  useEffect(() => { load() }, [id])

  const handleAdd = async () => {
    if (!newTitle.trim() || !title) return
    await addTask({
      title: newTitle.trim(),
      workspace: title,
      due: newDue || "",
      completed: false,
      starred: false,
      recurring: newRepeat === "none" ? "" : newRepeat,
    })
    setNewTitle("")
    setNewDue("")
    setNewRepeat("none")
    setOpen(false)
    await load()
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER - Title left, Button right, alag alag, overlap nahi hoga */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title || "Loading..."}</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* DIALOG - Header se BAHAR rakha hai, isliye overlap nahi hoga */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-">
          <DialogHeader>
            <DialogTitle>Add Task - {title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter task title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due">Due Date</Label>
                <Input id="due" type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat">Repeat</Label>
                {/* bg-white HATA DIYA - bg-background use kiya, Dark mode me bhi dikhega */}
                <select
                  id="repeat"
                  value={newRepeat}
                  onChange={(e) => setNewRepeat(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} className="w-full sm:w-auto">Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TASKS CARD - Full width, chhota nahi hoga */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">Tasks</CardTitle>
          <Badge variant="secondary">{tasks.length}</Badge>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No tasks yet. Click Add Task to create one.</p>
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 py-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={async () => { await updateTask(task.id, { completed: !task.completed }); await load(); }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{task.due || "No due date"}</p>
                      {task.recurring && <Badge variant="outline" className="text- px-1.5 py-0">{task.recurring}</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={async () => { await updateTask(task.id, { starred: !task.starred }); await load(); }}>
                    <Star className={`h-4 w-4 ${task.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={async () => { await archiveTask(task); await load(); }}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}