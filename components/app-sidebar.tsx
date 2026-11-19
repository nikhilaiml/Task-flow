"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Plus, Gamepad2, Music, BookOpen, Dumbbell, Briefcase, Home, Folder, Trash2, CheckSquare, LogOut } from "lucide-react"
// FIX: workspaces (static) hata diya - Ab default bhi DB se aayega, tabhi naya user ko fresh dikhega
import { mainViews, customIconMap } from "@/lib/navigation"
import { ensureDefaultWorkspaces, addWorkspace, archiveWorkspace, getArchivedWorkspaces } from "@/lib/db"
import { supabase } from "@/lib/supabase"

const iconOptions = [
  { name: "gamepad", Icon: Gamepad2, label: "Playing" },
  { name: "music", Icon: Music, label: "Music" },
  { name: "book", Icon: BookOpen, label: "Study" },
  { name: "gym", Icon: Dumbbell, label: "Gym" },
  { name: "work", Icon: Briefcase, label: "Work" },
  { name: "home", Icon: Home, label: "Home" },
  { name: "folder", Icon: Folder, label: "Other" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  // FIX: Ab 2 list DB se - Default (Work, Personal...) aur Custom (Playing...)
  const [defaultWorkspaces, setDefaultWorkspaces] = useState<any[]>([])
  const [customWorkspaces, setCustomWorkspaces] = useState<any[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("gamepad")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const load = async () => {
    // FIX: Naya user hai to pehle uske 5 fresh default workspaces banao
    const all = await ensureDefaultWorkspaces()
    setDefaultWorkspaces(all.filter((w: any) => !w.is_custom))
    setCustomWorkspaces(all.filter((w: any) => w.is_custom))
    const archived = await getArchivedWorkspaces()
    setDeletedIds(archived.map((w: any) => w.id))
  }

  useEffect(() => { load() }, [])

  // FIX: User badle to sidebar bhi badle - Purane user ka data chipka na rahe
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        load()
      } else {
        setDefaultWorkspaces([])
        setCustomWorkspaces([])
        setDeletedIds([])
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const id = newName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    if (!id) return
    await addWorkspace({
      id,
      title: newName.trim(),
      desc: newDesc.trim() || `${newName.trim()} workspace`,
      icon_name: selectedIcon,
      is_custom: true,
    })
    setOpen(false)
    setNewName("")
    setNewDesc("")
    setSelectedIcon("gamepad")
    await load()
    router.push(`/workspace/${id}`)
  }

  const handleDeleteWorkspace = async (id: string, title: string, isCustom: boolean, iconName: string, desc: string) => {
    if (!window.confirm(`Do you want to archive "${title}"? It will move to Archived and you can restore it later.`)) return
    await archiveWorkspace({ id, title, desc, icon_name: iconName, is_custom: isCustom })
    await load()
    if (pathname === `/workspace/${id}`) router.push("/")
  }

  const handleLogout = async () => {
    setDefaultWorkspaces([])
    setCustomWorkspaces([])
    setDeletedIds([])
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // FIX: Dono list me se archived wale hatao
  const visibleDefault = defaultWorkspaces.filter((w) => !deletedIds.includes(w.id))
  const visibleCustom = customWorkspaces.filter((w) => !deletedIds.includes(w.id))

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="h-9 w-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">TaskFlow</span>
              <span className="text-xs text-zinc-500 mt-1">Task Manager</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>MAIN VIEWS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainViews.map((view) => {
                  const Icon = view.icon
                  return (
                    <SidebarMenuItem key={view.id}>
                      <SidebarMenuButton isActive={pathname === view.href} onClick={() => router.push(view.href)}>
                        <Icon /> <span>{view.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>SELECT WORKSPACE</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Default Workspaces - Ab DB se, har user ke apne */}
                {visibleDefault.map((ws) => {
                  const Icon = customIconMap[ws.icon_name] || Folder
                  const href = `/workspace/${ws.id}`
                  return (
                    <SidebarMenuItem key={ws.id}>
                      <div
                        className="flex w-full items-center gap-1"
                        onMouseEnter={() => setHoveredId(ws.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <SidebarMenuButton isActive={pathname === href} onClick={() => router.push(href)} className="flex-1">
                          <Icon /> <span>{ws.title}</span>
                        </SidebarMenuButton>
                        {hoveredId === ws.id && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(ws.id, ws.title, false, ws.icon_name, ws.desc || "") }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </SidebarMenuItem>
                  )
                })}
                {/* Custom Workspaces - Ab DB se, har user ke apne */}
                {visibleCustom.map((ws) => {
                  const Icon = customIconMap[ws.icon_name] || Folder
                  const href = `/workspace/${ws.id}`
                  return (
                    <SidebarMenuItem key={ws.id}>
                      <div
                        className="flex w-full items-center gap-1"
                        onMouseEnter={() => setHoveredId(ws.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <SidebarMenuButton isActive={pathname === href} onClick={() => router.push(href)} className="flex-1">
                          <Icon /> <span>{ws.title}</span>
                        </SidebarMenuButton>
                        {hoveredId === ws.id && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(ws.id, ws.title, true, ws.icon_name, ws.desc) }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </SidebarMenuItem>
                  )
                })}

                <SidebarMenuItem>
                  <Button variant="ghost" className="w-full justify-start gap-2 mt-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Workspace
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t mt-auto shrink-0">
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Workspace</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <Input placeholder="e.g. Playing" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input placeholder="e.g. Games and fun tasks" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map(({ name, Icon, label }) => (
                  <Button key={name} type="button" variant={selectedIcon === name ? "default" : "outline"} size="sm" onClick={() => setSelectedIcon(name)}>
                    <Icon className="h-4 w-4" /> {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}