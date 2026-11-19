"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Star, ArrowLeft } from "lucide-react"
import { getViewById } from "@/lib/navigation"
import { getTasks, updateTask } from "@/lib/db" // FIX - Now from Supabase, not localStorage
import { getDueLabel } from "@/lib/due"

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

export default function CompletedPage() {
  const view = getViewById("completed")
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

  // Only Completed tasks - This was already correct, due does not matter here
  const completed = tasks.filter((t) => t.completed)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <Link href="/" className="text-sm text-zinc-500 flex items-center gap-1 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-3xl font-bold mt-1">{view?.title}</h1>
          <p className="text-zinc-500">{view?.desc} • completed task</p>
        </div>
      </div>

      {/* ONLY 1 CARD - Completed only */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Completed Tasks • {completed.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <p className="text-sm text-zinc-500">No task completed.</p>
          ) : (
            completed.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2.5 border-b last:border-0">
                <Checkbox checked={task.completed} onCheckedChange={() => toggle(task.id)} />
                <div className="flex-1">
                  <p className="text-sm font-medium line-through text-zinc-400">{task.title}</p>
                  {/* FIX - Show date + label - Today / Tomorrow / Upcoming */}
                  <p className="text-xs text-zinc-500">{task.workspace} • {getDueLabel(task.due)} • {task.due}</p>
                </div>
                {task.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                <Badge variant="secondary">Done</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}