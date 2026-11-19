"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Inbox, ArrowLeft, Star, CalendarDays, AlertCircle } from "lucide-react"
import { getViewById } from "@/lib/navigation"
import { getTasks, updateTask } from "@/lib/db" // FIX - Now from Supabase, not localStorage
import { isTodayTask, isOverdueTask, getDueLabel } from "@/lib/due"

type Task = {
  id: number
  title: string
  workspace: string
  // FIX - Before: due: "today" | "yesterday" | "tomorrow" | "upcoming"
  // Now: due: string - because due is now a date like "2026-11-20"
  due: string
  completed: boolean
  starred: boolean
  important?: boolean
  recurring?: "daily" | "weekly" | "none" | string
}

export default function InboxPage() {
  const view = getViewById("inbox")
  const [tasks, setTasks] = useState<Task[]>([])

  // FIX - Before: localStorage, Now: Supabase
  useEffect(() => {
    const load = async () => {
      const all = await getTasks() // From Supabase - mainview_tasks / tasks table
      const unique = all.filter((t: any, i: number, self: any[]) => i === self.findIndex((x: any) => x.id === t.id))
      setTasks(unique)
    }
    load()
  }, [])

  // FIX - Toggle also saves to Supabase
  const toggle = async (id: number) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    await updateTask(id, { completed: !task.completed })
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  // Inbox - 3 sections
  // FIX - Before: t.starred was used as important, but type had no important field, so error came
  // Now: check both starred and important
  const important = tasks.filter((t) => (t.starred || t.important) && !t.completed)

  // FIX - Before: t.due === "today" - date task never matched
  // Now: isTodayTask checks date == today
  const today = tasks.filter((t) => isTodayTask(t.due) && !t.completed)

  // FIX - Before: t.due === "today" || t.due === "yesterday"
  // Now: Today + Overdue both from date comparison
  const endingSoon = tasks.filter((t) => !t.completed && (isTodayTask(t.due) || isOverdueTask(t.due, false)))

  const Row = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <Checkbox checked={task.completed} onCheckedChange={() => toggle(task.id)} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${task.completed ? "line-through text-zinc-400" : ""}`}>{task.title}</p>
        {/* FIX - Show date + label */}
        <p className="text-xs text-zinc-500">{task.workspace} • {getDueLabel(task.due)} • {task.due}</p>
      </div>
      {task.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
      {isOverdueTask(task.due, task.completed) && <Badge variant="destructive">Overdue</Badge>}
      {isTodayTask(task.due) && !isOverdueTask(task.due, task.completed) && <Badge variant="secondary">Today</Badge>}
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Inbox className="h-6 w-6" />
        </div>
        <div>
          <Link href="/" className="text-sm text-zinc-500 flex items-center gap-1 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-3xl font-bold mt-1">{view?.title}</h1>
          <p className="text-zinc-500">{view?.desc} • Tasks</p>
        </div>
      </div>

      {/* 3 SECTIONS - Only these in Inbox */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 1. IMPORTANT */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Important</CardTitle></CardHeader>
          <CardContent>
            {important.length === 0 ? <p className="text-sm text-zinc-500">No important tasks</p> : important.map((t) => <Row key={t.id} task={t} />)}
          </CardContent>
        </Card>

        {/* 2. TODAY */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Today's Tasks</CardTitle></CardHeader>
          <CardContent>
            {today.length === 0 ? <p className="text-sm text-zinc-500">No tasks for today</p> : today.map((t) => <Row key={t.id} task={t} />)}
          </CardContent>
        </Card>
      </div>

      {/* 3. EXPIRING TODAY / OVERDUE */}
      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-red-600"><AlertCircle className="h-4 w-4" /> Tasks Expiring Today / Overdue</CardTitle></CardHeader>
        <CardContent>
          {endingSoon.length === 0 ? <p className="text-sm text-zinc-500">No tasks expiring today or overdue</p> : endingSoon.map((t) => <Row key={t.id} task={t} />)}
        </CardContent>
      </Card>
    </div>
  )
}