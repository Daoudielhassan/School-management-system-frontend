"use client"

import React from "react"
import Link from "next/link"
import { Outfit } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/ui/sidebar" // Ajuste le chemin selon ton projet
import { GlobalSearchDialog } from "@/components/shared/GlobalSearchDialog"
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
  PieChart,
  BookOpen,
  ScrollText,
  Award,
  SlidersHorizontal,
  Database,
  Briefcase,
  Layers,
  BookMarked,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { AdminProvider, useAdmin } from "@/context/AdminContext"

// Distinctive display font, scoped to the admin section only (via
// `adminDisplayFont.className` below) — the rest of the app keeps Inter.
const adminDisplayFont = Outfit({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-admin-display" })

// 1. Transformation de la navigation simple en sections catégorisées
const sidebarSections = [
  {
    title: "GENERAL",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/admin", icon: BarChart3 },
    ]
  },
  {
    title: "ACADEMIC",
    items: [
      { id: "students", label: "Étudiants", href: "/admin/students", icon: GraduationCap },
      { id: "classes", label: "Classes", href: "/admin/classes", icon: BookOpen },
      { id: "departments", label: "Départements", href: "/admin/departments", icon: Building },
      { id: "academic", label: "Années", href: "/admin/academic", icon: BookCopy },
      { id: "sessions", label: "Sessions", href: "/admin/sessions", icon: Calendar },
      { id: "modules", label: "Modules", href: "/admin/modules", icon: Layers },
      { id: "subjects", label: "Matières", href: "/admin/subjects", icon: BookMarked },
      { id: "attendance", label: "Présences", href: "/admin/attendance", icon: ClipboardList },
      { id: "grades", label: "Notes", href: "/admin/grades", icon: Award },
      { id: "discipline", label: "Discipline", href: "/admin/discipline", icon: AlertTriangle },
    ]
  },
  {
    title: "COMMUNICATION",
    items: [
      { id: "messages", label: "Messages", href: "/admin/messages", icon: MessageSquare },
      { id: "notifications", label: "Notifications", href: "/admin/notifications", icon: Bell },
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { id: "users", label: "Utilisateurs", href: "/admin/users", icon: Users },
      { id: "managers", label: "Managers", href: "/admin/managers", icon: Briefcase },
      { id: "permissions", label: "Permissions", href: "/admin/permissions", icon: Shield },
      { id: "reports", label: "Rapports", href: "/admin/reports", icon: PieChart },
      { id: "audit-logs", label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { id: "config", label: "Configuration", href: "/admin/config", icon: SlidersHorizontal },
      { id: "backups", label: "Sauvegardes", href: "/admin/backups", icon: Database },
      { id: "settings", label: "Paramètres", href: "/admin/settings", icon: Settings },
      { id: "help", label: "Aide", href: "/admin/help", icon: HelpCircle },
    ]
  }
]

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { logout } = useAuth()
  const { adminData } = useAdmin()

  const handleLogout = () => {
    logout()
  }

  // Préparation des données utilisateur pour le Layout et la Sidebar
  const firstName = adminData?.firstname || "Admin"
  const lastName = adminData?.lastname || ""
  const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`

  const currentUser = {
    name: `${firstName} ${lastName}`.trim(),
    role: "Administrator",
  }

  return (
    // Application du fond premium en dégradé — police d'affichage propre à l'espace admin
    <div className={`${adminDisplayFont.variable} min-h-screen flex bg-gradient-to-br from-[#f8fafc] to-[#f2f5fa]`}>

      {/* Intégration de la nouvelle Sidebar */}
      <Sidebar
        sections={sidebarSections}
        user={currentUser}
        onLogout={handleLogout}
        defaultCollapsed
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Premium - Sans logo, avec recherche centrale */}
        <header className="z-40 px-[40px] pt-[32px] pb-4">
          <div className="flex items-center justify-between gap-8">

            {/* Gauche : Message de bienvenue */}
            <div className="flex flex-col flex-shrink-0">
              <h2
                className="text-[26px] font-semibold text-slate-800 tracking-tight leading-none"
                style={{ fontFamily: "var(--font-admin-display)" }}
              >
                Bonjour {firstName}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1.5">
                Bienvenue dans votre espace d'administration
              </p>
            </div>

            {/* Centre : Barre de recherche globale */}
            <div className="flex-1 max-w-2xl hidden md:flex items-center">
              <GlobalSearchDialog />
            </div>

            {/* Droite : Actions & Profil */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-white/60 border border-slate-200/60 shadow-sm hover:bg-white text-slate-500 hover:text-blue-600 transition-all duration-200">
                <MessageSquare className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl bg-white/60 border border-slate-200/60 shadow-sm hover:bg-white text-slate-500 hover:text-blue-600 transition-all duration-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-white/60 border border-slate-200/60 shadow-sm hover:bg-white text-slate-500 hover:text-blue-600 transition-all duration-200">
                <HelpCircle className="h-5 w-5" />
              </Button>

              <div className="w-px h-8 bg-slate-200/80 mx-1"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:scale-105 transition-transform duration-200">
                    <Avatar className="h-11 w-11 border border-white shadow-md">
                      <AvatarImage src="/user.png" alt="Admin User" />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl bg-white/95 backdrop-blur-xl border-slate-100 shadow-xl shadow-slate-900/10 p-2" align="end" sideOffset={10}>
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {adminData?.email || "admin@university.edu"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-slate-50 focus:bg-slate-50 cursor-pointer mb-1">
                    <Link href="/admin/profile" className="flex items-center px-3 py-2.5">
                      <Settings className="mr-3 h-4 w-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                    <Link href="/admin/settings" className="flex items-center px-3 py-2.5">
                      <Settings className="mr-3 h-4 w-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-600 focus:text-red-700 mt-1"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content - Pleine largeur avec le bon espacement */}
        <main className="flex-1 px-[40px] pt-4 pb-12 overflow-x-hidden overflow-y-auto w-full">
          {/* L'espace est maintenu généreux et non limité par max-w-7xl */}
          <div className="w-full h-full flex flex-col space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminProvider>
  )
}