"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarClock, Star, ArrowLeft } from "lucide-react"
import { getViewById } from "@/lib/navigation"
import { getTasks, updateTask } from "@/lib/db" // FIX - Supabase se
import { isUpcomingTask, getDueLabel } from "@/lib/due"

type Task = {
  id: number
  title: string
  workspace: string
  due: string
  completed: boolean
  starred: boolean
  important?: boolean
  recurring?: string
}

export default function UpcomingPage() {
  const view = getViewById("upcoming")
  const [tasks, setTasks] = useState<Task[]>([])

  // FIX - Pehle localStorage tha, Ab Supabase hai
  useEffect(() => {
    const load = async () => {
      const all = await getTasks() // mainview_tasks / tasks table se
      setTasks(all)
    }
    load()
  }, [])

  // FIX - Toggle bhi Supabase me save hoga
  const toggle = async (id: number) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    await updateTask(id, { completed: !task.completed })
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const upcoming = tasks.filter((t) => isUpcomingTask(t.due) && !t.completed)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <Link href="/" className="text-sm text-zinc-500 flex items-center gap-1 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-3xl font-bold mt-1">{view?.title}</h1>
          <p className="text-zinc-500">{view?.desc} upcoming tasks</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4" /> Upcoming Tasks • {upcoming.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-zinc-500">No upcoming tasks </p>
          ) : (
            upcoming.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                <Checkbox checked={task.completed} onCheckedChange={() => toggle(task.id)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-zinc-500">{task.workspace} • {getDueLabel(task.due)} • {task.due}</p>
                </div>
                {task.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                <Badge variant="secondary">{getDueLabel(task.due)}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}