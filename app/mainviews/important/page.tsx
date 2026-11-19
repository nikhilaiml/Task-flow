"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, ArrowLeft } from "lucide-react"
import { getViewById } from "@/lib/navigation"
import { getTasks, updateTask } from "@/lib/db" // FIX - Now from Supabase, not localStorage
import { getDueLabel } from "@/lib/due" // FIX - For date label

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
}

export default function ImportantPage() {
  const view = getViewById("important")
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

  // Important tasks - Starred is Important
  // FIX - Check both starred and important, so old and new tasks both work
  const important = tasks.filter((t) => (t.starred || t.important) && !t.completed)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
          <Star className="h-6 w-6 text-yellow-600 fill-yellow-500" />
        </div>
        <div>
          <Link href="/" className="text-sm text-zinc-500 flex items-center gap-1 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-3xl font-bold mt-1">{view?.title}</h1>
          <p className="text-zinc-500">{view?.desc} only starred tasks</p>
        </div>
      </div>

      {/* ONLY 1 CARD - Important only */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-yellow-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> Important Tasks • {important.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {important.length === 0 ? (
            <p className="text-sm text-zinc-500">No important tasks. Star tasks to mark them as important.</p>
          ) : (
            important.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                <Checkbox checked={task.completed} onCheckedChange={() => toggle(task.id)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  {/* FIX - Show date + label */}
                  <p className="text-xs text-zinc-500">{task.workspace} • {getDueLabel(task.due)} • {task.due}</p>
                </div>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Badge variant="secondary">Important</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}