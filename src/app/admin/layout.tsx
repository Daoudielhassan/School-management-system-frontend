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
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Sessions", href: "/admin/sessions", icon: Calendar },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Help", href: "/admin/help", icon: HelpCircle },
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EduPortal</h1>
            </Link>
            <Badge variant="secondary">Administrateur</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user.png" alt="Admin User" />
                    <AvatarFallback>
                      {user ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}` : "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.firstname} ${user.lastname}` : "Administrateur"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@university.edu
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
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
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
} 