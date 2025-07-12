"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Shield,
  BookCopy,
  HelpCircle,
  Building,
  ClipboardList,
  GraduationCap,
  AlertTriangle,
  FileText,
  PieChart,
  BookOpen,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3, gradient: "from-blue-500 to-purple-600" },
  { name: "Utilisateurs", href: "/admin/users", icon: Users, gradient: "from-blue-400 to-cyan-500" },
  { name: "Étudiants", href: "/admin/students", icon: GraduationCap, gradient: "from-green-400 to-blue-500" },
  { name: "Classes", href: "/admin/classes", icon: BookOpen, gradient: "from-indigo-500 to-purple-600" },
  { name: "Départements", href: "/admin/departments", icon: Building, gradient: "from-teal-400 to-yellow-500" },
  { name: "Sessions", href: "/admin/sessions", icon: Calendar, gradient: "from-gray-600 to-cyan-400" },
  { name: "Présences", href: "/admin/attendance", icon: ClipboardList, gradient: "from-blue-800 to-purple-700" },
  { name: "Notes", href: "/admin/grades", icon: BookCopy, gradient: "from-gray-800 to-green-400" },
  { name: "Discipline", href: "/admin/discipline", icon: AlertTriangle, gradient: "from-black to-red-600" },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare, gradient: "from-purple-600 to-cyan-400" },
  { name: "Rapports", href: "/admin/reports", icon: PieChart, gradient: "from-gray-900 to-blue-500" },
  { name: "Paramètres", href: "/admin/settings", icon: Settings, gradient: "from-gray-500 to-gray-700" },
  { name: "Aide", href: "/admin/help", icon: HelpCircle, gradient: "from-blue-300 to-purple-400" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { logout, userId, token } = useAuth()
  const [user, setUser] = React.useState<{ firstname: string; lastname: string } | null>(null)

  React.useEffect(() => {
    if (userId && token) {
      fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            return Promise.reject(new Error("Response not OK"));
          }
          return res.json();
        })
        .then((data) => setUser(data))
        .catch((err) => console.error("Failed to fetch user:", err));
    }
  }, [userId, token])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="admin-theme min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Header */}
      <header className="bg-[var(--secondary)]/20 backdrop-blur-md border-b border-[var(--accent)]/20 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-[var(--accent)] drop-shadow-lg" />
                <div className="absolute inset-0 h-8 w-8 bg-[var(--accent)]/20 rounded-full blur-md"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-[var(--primary)]">
                  EduPortal
                </h1>
                <span className="text-xs text-[var(--accent)]/80">Admin Control</span>
              </div>
            </Link>
            <Badge 
              variant="secondary" 
              className="bg-[var(--secondary)] text-[var(--text)] border-0 shadow-lg"
            >
              Administrator
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
              <Bell className="h-5 w-5 text-[var(--accent)]" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                  <Avatar className="h-8 w-8 border-2 border-[var(--accent)]/50">
                    <AvatarImage src="/user.png" alt="Admin User" />
                    <AvatarFallback className="bg-[var(--accent)] text-[var(--text)]">
                      {user ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}` : "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[var(--background)]/95 backdrop-blur-md border-[var(--accent)]/30" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-[var(--accent)]">
                      {user ? `${user.firstname} ${user.lastname}` : "Administrateur"}
                    </p>
                    <p className="text-xs leading-none text-[var(--accent)]/70">
                      admin@university.edu
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--accent)]/30" />
                <DropdownMenuItem asChild className="hover:bg-blue-500/20">
                  <Link href="/admin/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-blue-500/20">
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--accent)]/30" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-500/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-[var(--secondary)]/20 backdrop-blur-md border-r border-[var(--accent)]/20 min-h-screen sticky top-[80px] overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start group transition-all duration-300 ${
                      isActive 
                        ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-lg shadow-[var(--accent)]/20" 
                        : "hover:bg-[var(--secondary)]/10 border border-transparent"
                    }`}
                  >
                    <div className={`relative mr-3 ${isActive ? `bg-[var(--primary)]` : ''} p-1 rounded-md`}>
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-[var(--background)]' : 'text-[var(--accent)]'} group-hover:scale-110 transition-transform`} />
                      {isActive && (
                        <div className="absolute inset-0 bg-[var(--accent)]/20 rounded-md blur-sm"></div>
                      )}
                    </div>
                    <span className={`${isActive ? 'text-[var(--primary)] font-medium' : 'text-[var(--accent)]'} group-hover:text-[var(--primary)] transition-colors`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}