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
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3, gradient: "from-blue-500 to-purple-600" },
  { name: "Utilisateurs", href: "/admin/users", icon: Users, gradient: "from-blue-400 to-cyan-500" },
  { name: "Étudiants", href: "/admin/students", icon: GraduationCap, gradient: "from-green-400 to-blue-500" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-cyan-400 drop-shadow-lg" />
                <div className="absolute inset-0 h-8 w-8 bg-cyan-400/20 rounded-full blur-md"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  EduPortal
                </h1>
                <span className="text-xs text-blue-300/80">Admin Control</span>
              </div>
            </Link>
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg"
            >
              Administrator
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
              <Bell className="h-5 w-5 text-cyan-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                  <Avatar className="h-8 w-8 border-2 border-cyan-400/50">
                    <AvatarImage src="/user.png" alt="Admin User" />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white">
                      {user ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}` : "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-md border-blue-500/30" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-cyan-300">
                      {user ? `${user.firstname} ${user.lastname}` : "Administrateur"}
                    </p>
                    <p className="text-xs leading-none text-blue-300/70">
                      admin@university.edu
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-500/30" />
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
                <DropdownMenuSeparator className="bg-blue-500/30" />
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
        <aside className="w-72 bg-black/20 backdrop-blur-md border-r border-blue-500/20 min-h-screen sticky top-[80px] overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start group transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/20" 
                        : "hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className={`relative mr-3 ${isActive ? `bg-gradient-to-r ${item.gradient}` : ''} p-1 rounded-md`}>
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-cyan-400'} group-hover:scale-110 transition-transform`} />
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-md blur-sm"></div>
                      )}
                    </div>
                    <span className={`${isActive ? 'text-cyan-300 font-medium' : 'text-blue-200'} group-hover:text-white transition-colors`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
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