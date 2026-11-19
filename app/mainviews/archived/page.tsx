"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Archive, ArrowLeft, Star, Trash2, Undo2, Folder } from "lucide-react"
import { getViewById } from "@/lib/navigation"
import {
  getArchivedTasks, getArchivedWorkspaces,
  restoreTask, restoreWorkspace,
  permanentlyDeleteTask, permanentlyDeleteWorkspace,
} from "@/lib/db"

export default function ArchivedPage() {
  const view = getViewById("archived")
  const [archivedTasks, setArchivedTasks] = useState<any[]>([])
  const [archivedWorkspaces, setArchivedWorkspaces] = useState<any[]>([])

  const load = async () => {
    setArchivedTasks(await getArchivedTasks())
    setArchivedWorkspaces(await getArchivedWorkspaces())
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Archive className="h-6 w-6" />
        </div>
        <div>
          <Link href="/" className="text-sm text-zinc-500 flex items-center gap-1 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-3xl font-bold mt-1">{view?.title || "Archived"}</h1>
          <p className="text-zinc-500">{archivedTasks.length} tasks • {archivedWorkspaces.length} workspaces archived</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Folder className="h-4 w-4" /> Archived Workspaces</CardTitle></CardHeader>
        <CardContent>
          {archivedWorkspaces.length === 0 ? (
            <p className="text-sm text-zinc-500">No archived workspaces</p>
          ) : archivedWorkspaces.map((ws) => (
            <div key={ws.id} className="flex items-center gap-3 py-3 border-b last:border-0">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center"><Folder className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{ws.title}</p>
                <p className="text-xs text-zinc-500">{ws.desc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={async () => { await restoreWorkspace(ws.id); await load(); }}>
                <Undo2 className="h-4 w-4 mr-1" /> Restore
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                if (window.confirm(`"${ws.title}" are you sure you want to delete permanent?`)) {
                  await permanentlyDeleteWorkspace(ws.id); await load();
                }
              }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Archive className="h-4 w-4" /> Archived Tasks</CardTitle></CardHeader>
        <CardContent>
          {archivedTasks.length === 0 ? (
            <p className="text-sm text-zinc-500">No any Archived task</p>
          ) : archivedTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 py-3 border-b last:border-0">
              <Checkbox checked={true} disabled />
              <div className="flex-1">
                <p className="text-sm font-medium line-through text-zinc-400">{task.title}</p>
                <p className="text-xs text-zinc-500">{task.workspace} • {task.due}</p>
              </div>
              {task.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
              <Badge variant="secondary">Archived</Badge>
              <Button variant="outline" size="sm" onClick={async () => { await restoreTask(task.id); await load(); }}>
                <Undo2 className="h-4 w-4 mr-1" /> Restore
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                if (window.confirm(`"${task.title}" Are you sure you want to delete permanent?`)) {
                  await permanentlyDeleteTask(task.id); await load();
                }
              }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}