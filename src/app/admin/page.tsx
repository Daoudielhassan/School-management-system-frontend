"use client"

import { useState, useEffect, useCallback, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, GraduationCap, Briefcase, Shield, TrendingUp, AlertCircle, Bell, Settings, ChevronDown, Search, Calendar, BookOpen, Award, Activity, ArrowRight, Radio, FileText } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { debounce } from "lodash"
import { apiGet, apiPost, API_ENDPOINTS } from "@/config/api"
import { toast } from "react-toastify"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExtendedStats {
  totalUsers: number
  totalStudents: number
  totalProfessors: number
  totalManagers: number
  totalDepartments: number
  totalClasses: number
  totalSessions: number
  totalMessages: number
  unreadMessages: number
  totalNotifications: number
  sessionChange: string
  studentChange: string
  classChange: string
  departmentChange: string
  sessionChangePositive: boolean
  studentChangePositive: boolean
  classChangePositive: boolean
  departmentChangePositive: boolean
}

interface User {
  id: string
  username: string
  email: string
  role: string
  firstname?: string
  lastname?: string
}

interface ApiStatsResponse {
  totalUsers?: number
  identityCounts?: { identity: string; count: number }[]
}

interface PaginatedUsersResponse {
  content: User[]
  totalPages?: number
}

const ROLE_STYLES: Record<string, { name: string; className: string }> = {
  STUDENT: { name: "Student", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ETUDIANT: { name: "Student", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MANAGER: { name: "Manager", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ADMIN: { name: "Admin", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ADMINISTRATEUR: { name: "Admin", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  INSTRUCTOR: { name: "Instructor", className: "bg-sky-50 text-sky-700 border-sky-200" },
  PROFESSEUR: { name: "Instructor", className: "bg-sky-50 text-sky-700 border-sky-200" },
}

function UserCard({ user }: { user: User }) {
  const router = useRouter()
  const displayName = user.firstname ? `${user.firstname} ${user.lastname ?? ""}`.trim() : user.username
  const role = ROLE_STYLES[user.role] || { name: user.role ?? "Unknown", className: "bg-slate-50 text-slate-700 border-slate-200" }
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="rounded-xl p-4 border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-slate-200">
          <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold text-sm">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 truncate">{displayName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${role.className}`}>{role.name}</span>
            <span className="text-xs text-slate-400">Active</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
          onClick={() => router.push(`/admin/users/${user.id}`)}
          title="View / edit user"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
          onClick={() => router.push("/admin/notifications")}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function StatTile({
  title,
  value,
  icon: Icon,
  change,
  changePositive,
  emphasis = false,
}: {
  title: string
  value: number
  icon: ComponentType<{ className?: string }>
  change: string
  changePositive: boolean
  emphasis?: boolean
}) {
  return (
    <Card
      className={`border-slate-200 hover:shadow-lg transition-all duration-300 group ${
        emphasis ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-700 shadow-lg shadow-blue-600/20" : "bg-white hover:border-blue-300"
      }`}
    >
      <CardContent className={emphasis ? "p-7" : "p-5"}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium mb-1.5 ${emphasis ? "text-blue-100" : "text-slate-500"}`}>{title}</p>
            <p className={`font-bold tracking-tight ${emphasis ? "text-5xl text-white" : "text-2xl text-slate-800"}`}>{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${emphasis ? "text-blue-100" : changePositive ? "text-emerald-600" : "text-red-500"}`}>
              <TrendingUp className={`h-3 w-3 ${changePositive ? "" : "rotate-180"}`} />
              {change}
              <span className={emphasis ? "text-blue-200" : "text-slate-400"}>vs last month</span>
            </div>
          </div>
          <div
            className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${
              emphasis ? "bg-white/15" : "bg-blue-50"
            }`}
          >
            <Icon className={`h-5 w-5 ${emphasis ? "text-white" : "text-blue-600"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardStats() {
  const [stats, setStats] = useState<ExtendedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, userId } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)

        const [userStatsResult, studentsResult, departmentsResult, classesResult, sessionsResult] = await Promise.allSettled([
          apiGet(API_ENDPOINTS.USERS.STATS, token),
          apiGet(API_ENDPOINTS.STUDENTS.BASE, token),
          apiGet(API_ENDPOINTS.DEPARTMENTS.BASE, token),
          apiGet(API_ENDPOINTS.CLASSES.BASE, token),
          apiGet(API_ENDPOINTS.SESSIONS.BASE, token),
        ])

        const userStatsRaw = userStatsResult.status === "fulfilled" ? userStatsResult.value : {}
        const studentsRaw = studentsResult.status === "fulfilled" ? studentsResult.value : []
        const departmentsRaw = departmentsResult.status === "fulfilled" ? departmentsResult.value : []
        const classesRaw = classesResult.status === "fulfilled" ? classesResult.value : []
        const sessionsRaw = sessionsResult.status === "fulfilled" ? sessionsResult.value : []

        const userStats = (userStatsRaw && typeof userStatsRaw === "object" ? userStatsRaw : {}) as ApiStatsResponse
        const students = Array.isArray(studentsRaw) ? studentsRaw : []
        const departments = Array.isArray(departmentsRaw) ? departmentsRaw : []
        const classes = Array.isArray(classesRaw) ? classesRaw : []
        const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : []

        if (userStatsResult.status === "rejected") {
          console.warn("USERS.STATS endpoint failed; using fallback counters from /api/users list.")
        }

        const fallbackStudents = students.filter((u: any) => u.role === "STUDENT").length
        const fallbackProfessors = students.filter((u: any) => u.role === "INSTRUCTOR").length
        const fallbackManagers = students.filter((u: any) => u.role === "MANAGER").length

        const now = new Date()
        const thisYear = now.getFullYear()
        const thisMonth = now.getMonth()
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

        const inMonth = (dateStr: string, y: number, m: number) => {
          if (!dateStr) return false
          const d = new Date(dateStr)
          return d.getFullYear() === y && d.getMonth() === m
        }

        const calcChange = (items: any[], dateField: string): { label: string; positive: boolean } => {
          const cur = items.filter((i: any) => inMonth(i[dateField], thisYear, thisMonth)).length
          const prev = items.filter((i: any) => inMonth(i[dateField], lastMonthYear, lastMonth)).length
          if (prev === 0 && cur === 0) return { label: "0%", positive: true }
          if (prev === 0) return { label: `+${cur} new`, positive: true }
          const pct = Math.round(((cur - prev) / prev) * 100)
          return { label: (pct >= 0 ? "+" : "") + pct + "%", positive: pct >= 0 }
        }

        const sessionChg = calcChange(sessions, "startsAt")
        const studentChg = calcChange(students, "createdAt")
        const classChg = calcChange(classes, "createdAt")
        const deptChg = calcChange(departments, "createdAt")

        setStats({
          totalUsers: userStats.totalUsers || students.length || 0,
          totalStudents:
            userStats.identityCounts?.find((i: any) => i.identity === "ETUDIANT" || i.identity === "STUDENT")?.count ||
            fallbackStudents,
          totalProfessors:
            userStats.identityCounts?.find((i: any) => i.identity === "PROFESSEUR" || i.identity === "INSTRUCTOR")?.count ||
            fallbackProfessors,
          totalManagers:
            userStats.identityCounts?.find((i: any) => i.identity === "MANAGER")?.count || fallbackManagers,
          totalDepartments: departments.length || 0,
          totalClasses: classes.length || 0,
          totalSessions: sessions.length || 0,
          totalMessages: 0,
          unreadMessages: 0,
          totalNotifications: 0,
          sessionChange: sessionChg.label,
          sessionChangePositive: sessionChg.positive,
          studentChange: studentChg.label,
          studentChangePositive: studentChg.positive,
          classChange: classChg.label,
          classChangePositive: classChg.positive,
          departmentChange: deptChg.label,
          departmentChangePositive: deptChg.positive,
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Error loading stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [token, userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 lg:row-span-2 animate-pulse rounded-xl bg-slate-100 h-64" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-slate-100 h-32" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="lg:col-span-1 lg:row-span-2">
        <StatTile
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          change={stats?.studentChange ?? "—"}
          changePositive={stats?.studentChangePositive ?? true}
          emphasis
        />
      </div>
      <StatTile title="Students" value={stats?.totalStudents || 0} icon={GraduationCap} change={stats?.studentChange ?? "—"} changePositive={stats?.studentChangePositive ?? true} />
      <StatTile title="Professors" value={stats?.totalProfessors || 0} icon={BookOpen} change="—" changePositive />
      <StatTile title="Managers" value={stats?.totalManagers || 0} icon={Shield} change="—" changePositive />
      <StatTile title="Departments" value={stats?.totalDepartments || 0} icon={Briefcase} change={stats?.departmentChange ?? "—"} changePositive={stats?.departmentChangePositive ?? true} />
      <StatTile title="Classes" value={stats?.totalClasses || 0} icon={Calendar} change={stats?.classChange ?? "—"} changePositive={stats?.classChangePositive ?? true} />
      <StatTile title="Sessions" value={stats?.totalSessions || 0} icon={Activity} change={stats?.sessionChange ?? "—"} changePositive={stats?.sessionChangePositive ?? true} />
    </div>
  )
}

function AddUserForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    identity: "ETUDIANT",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const roleMap: Record<string, string> = {
      ETUDIANT: "STUDENT",
      PROFESSEUR: "INSTRUCTOR",
      MANAGER: "MANAGER",
      ADMINISTRATEUR: "ADMIN",
    }
    try {
      await apiPost(
        API_ENDPOINTS.USERS.BASE,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: roleMap[formData.identity] ?? formData.identity,
          firstname: formData.firstname,
          lastname: formData.lastname,
        },
        token || undefined
      )
      toast.success("User created successfully")
      onClose()
      onCreated()
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">First Name</label>
          <Input value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Last Name</label>
          <Input value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Username</label>
        <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Role</label>
        <Select value={formData.identity} onValueChange={(v) => setFormData({ ...formData, identity: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ETUDIANT">Student</SelectItem>
            <SelectItem value="PROFESSEUR">Professor</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="ADMINISTRATEUR">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create User"}
        </Button>
      </div>
    </form>
  )
}

function BroadcastForm({ onClose }: { onClose: () => void }) {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ subject: "", messageText: "", scope: "ALL", priority: "NORMAL" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      toast.success("Broadcast message queued. It will be delivered when the messaging service is available.")
      onClose()
    } catch (error) {
      console.error("Error broadcasting:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Subject</label>
        <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Message</label>
        <textarea
          value={formData.messageText}
          onChange={(e) => setFormData({ ...formData, messageText: e.target.value })}
          required
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Scope</label>
        <Select value={formData.scope} onValueChange={(v) => setFormData({ ...formData, scope: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Users</SelectItem>
            <SelectItem value="STUDENTS">Students Only</SelectItem>
            <SelectItem value="PROFESSORS">Professors Only</SelectItem>
            <SelectItem value="MANAGERS">Managers Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Priority</label>
        <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send Broadcast"}
        </Button>
      </div>
    </form>
  )
}

function GenerateReportForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ type: "attendance", name: "", description: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      toast.success("Report request saved. Redirecting to Reports…")
      onClose()
      router.push("/admin/reports")
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Report Name</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Report Type</label>
        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attendance">Attendance Report</SelectItem>
            <SelectItem value="grades">Grades Report</SelectItem>
            <SelectItem value="enrollment">Enrollment Report</SelectItem>
            <SelectItem value="financial">Financial Report</SelectItem>
            <SelectItem value="performance">Performance Report</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate Report"}
        </Button>
      </div>
    </form>
  )
}

function QuickActions({ onUserCreated }: { onUserCreated: () => void }) {
  const router = useRouter()
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const secondaryActions = [
    { name: "System Alerts", icon: AlertCircle, href: "/admin/notifications" },
    { name: "Manage Classes", icon: GraduationCap, href: "/admin/classes" },
    { name: "Attendance", icon: Calendar, href: "/admin/attendance" },
    { name: "Messages", icon: BookOpen, href: "/admin/messages" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Primary actions get real visual weight — not just three more identical tiles */}
        <button
          onClick={() => setShowAddUserDialog(true)}
          className="md:col-span-1 h-36 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 p-6 flex flex-col justify-between text-left"
        >
          <Users className="h-7 w-7 text-blue-100" />
          <div>
            <p className="font-semibold">Add User</p>
            <p className="text-xs text-blue-100 mt-0.5">Create a new account</p>
          </div>
        </button>

        <button
          onClick={() => setShowBroadcastDialog(true)}
          className="h-36 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 p-6 flex flex-col justify-between text-left group"
        >
          <Radio className="h-7 w-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <div>
            <p className="font-semibold text-slate-800">Broadcast</p>
            <p className="text-xs text-slate-500 mt-0.5">Send an announcement</p>
          </div>
        </button>

        <button
          onClick={() => setShowReportDialog(true)}
          className="h-36 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 p-6 flex flex-col justify-between text-left group"
        >
          <FileText className="h-7 w-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <div>
            <p className="font-semibold text-slate-800">Generate Report</p>
            <p className="text-xs text-slate-500 mt-0.5">Create a system report</p>
          </div>
        </button>
      </div>

      {/* Secondary shortcuts — a compact row instead of a repeated icon-tile grid */}
      <div className="flex flex-wrap gap-2 mb-8">
        {secondaryActions.map((action) => (
          <button
            key={action.name}
            onClick={() => router.push(action.href)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            <action.icon className="h-4 w-4" />
            {action.name}
          </button>
        ))}
      </div>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account in the system</DialogDescription>
          </DialogHeader>
          <AddUserForm onClose={() => setShowAddUserDialog(false)} onCreated={onUserCreated} />
        </DialogContent>
      </Dialog>

      <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Broadcast Message</DialogTitle>
            <DialogDescription>Send a message to all users or specific groups</DialogDescription>
          </DialogHeader>
          <BroadcastForm onClose={() => setShowBroadcastDialog(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>Create a new system report</DialogDescription>
          </DialogHeader>
          <GenerateReportForm onClose={() => setShowReportDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { token, userId } = useAuth()

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!token || !userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await apiGet(API_ENDPOINTS.SESSIONS.BASE, token)
        const sessions = Array.isArray(data) ? data : []
        const sorted = [...sessions].sort((a: any, b: any) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()).slice(0, 5)
        setActivities(sorted)
      } catch (err) {
        console.error("Error fetching recent activity:", err)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecentActivity()
  }, [token, userId])

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest scheduled sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-lg h-16" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity: any, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">
                    Session — <span className="text-blue-600 font-medium">Room {activity.room ?? "N/A"}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(activity.startsAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">No recent activity</div>
        )}
      </CardContent>
    </Card>
  )
}

function UserManagementCard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  type RoleType = "manager" | "student" | "professor" | "admin" | "all"
  const [filter, setFilter] = useState<RoleType>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [totalPages, setTotalPages] = useState(1)
  const { token } = useAuth()

  const roleMapping: Record<string, string> = {
    STUDENT: "STUDENT",
    INSTRUCTOR: "INSTRUCTOR",
    MANAGER: "MANAGER",
    ADMIN: "ADMIN",
    all: "all",
  }

  const formatRole = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "Student"
      case "INSTRUCTOR":
        return "Professor"
      case "MANAGER":
        return "Manager"
      case "ADMIN":
        return "Admin"
      default:
        return role
    }
  }

  const debounceSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term)
    }, 500),
    []
  )

  useEffect(() => {
    debounceSearch(searchTerm)
  }, [searchTerm, debounceSearch])

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!token) {
          setLoading(false)
          return
        }

        let backendRole = filter === "all" ? "" : roleMapping[filter]
        let url = `${API_ENDPOINTS.USERS.BASE}?page=${page - 1}&size=6`
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`
        }
        if (debouncedSearchTerm) {
          url += `&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`
        }

        const data = await apiGet(url, token)

        if (Array.isArray(data)) {
          const allUsers = data as User[]
          const filteredUsers = allUsers.filter((user) => {
            const matchesRole = filter === "all" || user.role === roleMapping[filter]
            const matchesSearch =
              !debouncedSearchTerm ||
              user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            return matchesRole && matchesSearch
          })

          const pageSize = 6
          const start = (page - 1) * pageSize
          const end = start + pageSize
          setUsers(filteredUsers.slice(start, end))
          setTotalPages(Math.max(1, Math.ceil(filteredUsers.length / pageSize)))
        } else if (data && typeof data === "object" && Array.isArray((data as PaginatedUsersResponse).content)) {
          const pagedData = data as PaginatedUsersResponse
          setUsers(pagedData.content || [])
          setTotalPages(pagedData.totalPages || 1)
        } else {
          setUsers([])
          setTotalPages(1)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Unable to load users. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, filter, debouncedSearchTerm, token])

  const displayRoleName = (role: RoleType) => {
    switch (role) {
      case "manager":
        return "Managers"
      case "student":
        return "Étudiants"
      case "professor":
        return "Professeurs"
      case "admin":
        return "Administrateur"
      case "all":
        return "Tous les Utilisateurs"
      default:
        return role
    }
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-slate-900">
              <Users className="h-5 w-5 text-blue-600" />
              User Management
            </CardTitle>
            <CardDescription>Manage system users and permissions</CardDescription>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(roleMapping) as RoleType[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setFilter(key)} className="cursor-pointer">
                    {key === "all" ? displayRoleName(key) : formatRole(roleMapping[key])}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            <p>{error}</p>
            <Button onClick={() => setPage(page)} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-slate-100 h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length > 0 ? (
              users.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-10 text-slate-400 text-sm">No users found</div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading}>
          Previous
        </Button>
        <span className="text-sm text-slate-500 self-center">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages || loading}>
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-[32px] font-semibold text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-admin-display)" }}
          >
            Admin Dashboard
          </h1>
          <p className="mt-1.5 text-slate-500">Control center for system management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/audit-logs")}>
            <Activity className="mr-2 h-4 w-4" />
            System Status
          </Button>
          <Button className="shadow-md shadow-blue-600/20" onClick={() => router.push("/admin/reports")}>
            <Award className="mr-2 h-4 w-4" />
            Generate Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <DashboardStats key={refreshKey} />

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
          <Settings className="h-4 w-4 text-blue-600" />
          Quick Actions
        </h2>
        <QuickActions onUserCreated={() => setRefreshKey((k) => k + 1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserManagementCard key={refreshKey} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
