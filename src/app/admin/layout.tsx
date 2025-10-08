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
  { name: "Dashboard", href: "/admin", icon: BarChart3, color: "text-blue-600", bgColor: "bg-blue-50 hover:bg-blue-100" },
  { name: "Utilisateurs", href: "/admin/users", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50 hover:bg-emerald-100" },
  { name: "Étudiants", href: "/admin/students", icon: GraduationCap, color: "text-purple-600", bgColor: "bg-purple-50 hover:bg-purple-100" },
  { name: "Classes", href: "/admin/classes", icon: BookOpen, color: "text-indigo-600", bgColor: "bg-indigo-50 hover:bg-indigo-100" },
  { name: "Départements", href: "/admin/departments", icon: Building, color: "text-amber-600", bgColor: "bg-amber-50 hover:bg-amber-100" },
  { name: "Sessions", href: "/admin/sessions", icon: Calendar, color: "text-cyan-600", bgColor: "bg-cyan-50 hover:bg-cyan-100" },
  { name: "Présences", href: "/admin/attendance", icon: ClipboardList, color: "text-violet-600", bgColor: "bg-violet-50 hover:bg-violet-100" },
  { name: "Notes", href: "/admin/grades", icon: BookCopy, color: "text-green-600", bgColor: "bg-green-50 hover:bg-green-100" },
  { name: "Discipline", href: "/admin/discipline", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 hover:bg-red-100" },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare, color: "text-pink-600", bgColor: "bg-pink-50 hover:bg-pink-100" },
  { name: "Rapports", href: "/admin/reports", icon: PieChart, color: "text-orange-600", bgColor: "bg-orange-50 hover:bg-orange-100" },
  { name: "Paramètres", href: "/admin/settings", icon: Settings, color: "text-slate-600", bgColor: "bg-slate-50 hover:bg-slate-100" },
  { name: "Aide", href: "/admin/help", icon: HelpCircle, color: "text-blue-500", bgColor: "bg-blue-50 hover:bg-blue-100" },
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
    <div className="min-h-screen bg-slate-50">
      {/* Header with improved contrast and spacing */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-blue-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                    GESTION INTRANET
                  </h1>
                  <span className="text-sm font-medium text-blue-600 tracking-wide">Admin Control</span>
                </div>
              </Link>
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 border-blue-200 font-medium px-3 py-1 text-sm"
              >
                Administrator
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors duration-200">
                    <Avatar className="h-10 w-10 border-2 border-slate-200 shadow-sm">
                      <AvatarImage src="/user.png" alt="Admin User" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {user ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}` : "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white border-slate-200 shadow-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold leading-none text-slate-900">
                        {user ? `${user.firstname} ${user.lastname}` : "Administrateur"}
                      </p>
                      <p className="text-xs leading-none text-slate-500">
                        admin@university.edu
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem asChild className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                    <Link href="/admin/profile" className="flex items-center px-4 py-2">
                      <Settings className="mr-3 h-4 w-4 text-slate-600" />
                      <span className="text-slate-700">Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                    <Link href="/admin/settings" className="flex items-center px-4 py-2">
                      <Settings className="mr-3 h-4 w-4 text-slate-600" />
                      <span className="text-slate-700">Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar with improved spacing and contrast */}
        <aside className="w-72 bg-white border-r border-slate-200 min-h-screen sticky top-[80px] overflow-y-auto shadow-sm">
          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start h-12 px-4 transition-all duration-200 group ${
                      isActive 
                        ? `${item.bgColor} border-l-4 border-l-current ${item.color} font-semibold shadow-sm` 
                        : "hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className={`relative mr-4 p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? `${item.bgColor.split(' ')[0]} ${item.color}` 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}>
                      <item.icon className="h-5 w-5" />
                      {isActive && (
                        <div className="absolute inset-0 bg-current opacity-10 rounded-lg"></div>
                      )}
                    </div>
                    <span className="font-medium tracking-wide">
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content with improved spacing */}
        <main className="flex-1 p-8 overflow-x-hidden bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}